import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import * as awsx from "@pulumi/awsx";
import { fdir } from 'fdir'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { randomUUID } from 'crypto';
import * as fs from "fs";

const stackConfig = new pulumi.Config("geodatadownloader");

const config = {
    region: new pulumi.Config("aws").require("region"),
    pathToWebsite: stackConfig.get("outDir") ?? "build",
    targetDomain: stackConfig.require("targetDomain"),
    includeWWW: stackConfig.getBoolean("includeWWW") ?? true,
    certificateArn: stackConfig.require("certificateArn"),
    bucket: stackConfig.require("bucket"),
}

// Generate random ID for every run
const prefix = randomUUID()

// Create an AWS resource (S3 Bucket)
const contentBucket = new aws.s3.Bucket("geodatadownloader", {
    bucket: config.bucket,
    website: {
        indexDocument: "index.html",
    }
});

const s3 = new S3Client({
    region: config.region,
});

const uploadFileToS3 = (s3: S3Client, bucket: string, prefix: string) => async (fileName: string) => {
    const command = new PutObjectCommand({
        Bucket: bucket,
        Key: `${prefix}/${fileName}`,
        Body: await fs.promises.readFile(`../build/${fileName}`),
    })
    await s3.send(command)
}


contentBucket.bucket.apply(async (bucketName) => {
    const files = await new fdir().crawl("../build/").withPromise() as string[]
    console.log(`Found ${files.length} files to upload`)
    const putObject = uploadFileToS3(s3, bucketName, prefix)

    const promises = []
    console.log(`Uploading files to ${bucketName}/${prefix}/...`)
    for (let f of files) {
        promises.push(putObject(f))
        if (f === "index.html") {
            promises.push(uploadFileToS3(s3, bucketName, "")(f))
        }
    }
    await Promise.all(promises)
    console.log(`Uploaded ${files.length} files to s3`)
})

const logsBucket = new aws.s3.Bucket("requestLogs", {
    bucket: `${config.bucket}-logs`,
    acl: "private",
});

// Generate Origin Access Identity to access the private s3 bucket.
const originAccessIdentity = new aws.cloudfront.OriginAccessIdentity("originAccessIdentity", {
    comment: "this is needed to setup s3 polices and make s3 not public.",
});

// if config.includeWWW include an alias for the www subdomain
const distributionAliases = config.includeWWW ? [config.targetDomain, `www.${config.targetDomain}`] : [config.targetDomain];

const tenMinutes = 60 * 10;


// distributionArgs configures the CloudFront distribution. Relevant documentation:
// https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/distribution-web-values-specify.html
// https://www.terraform.io/docs/providers/aws/r/cloudfront_distribution.html
const distributionArgs: aws.cloudfront.DistributionArgs = {
    enabled: true,
    // Alternate aliases the CloudFront distribution can be reached at, in addition to https://xxxx.cloudfront.net.
    // Required if you want to access the distribution via config.targetDomain as well.
    aliases: distributionAliases,

    // We only specify one origin for this distribution, the S3 content bucket.
    origins: [
        {
            originId: contentBucket.arn,
            domainName: contentBucket.bucketDomainName,
            s3OriginConfig: {
                originAccessIdentity: originAccessIdentity.cloudfrontAccessIdentityPath,
            },
        },
    ],

    defaultRootObject: `${prefix}/index.html`,

    // A CloudFront distribution can configure different cache behaviors based on the request path.
    // Here we just specify a single, default cache behavior which is just read-only requests to S3.
    defaultCacheBehavior: {
        targetOriginId: contentBucket.arn,

        viewerProtocolPolicy: "redirect-to-https",
        allowedMethods: ["GET", "HEAD", "OPTIONS"],
        cachedMethods: ["GET", "HEAD", "OPTIONS"],

        forwardedValues: {
            cookies: { forward: "none" },
            queryString: false,
        },

        minTtl: 0,
        defaultTtl: tenMinutes,
        maxTtl: tenMinutes,
    },

    // "All" is the most broad distribution, and also the most expensive.
    // "100" is the least broad, and also the least expensive.
    priceClass: "PriceClass_100",

    // You can customize error responses. When CloudFront receives an error from the origin (e.g. S3 or some other
    // web service) it can return a different error code, and return the response for a different resource.
    customErrorResponses: [
        { errorCode: 404, responseCode: 404, responsePagePath: "/404.html" },
    ],

    restrictions: {
        geoRestriction: {
            restrictionType: "none",
        },
    },

    viewerCertificate: {
        acmCertificateArn: config.certificateArn,  // Per AWS, ACM certificate must be in the us-east-1 region.
        sslSupportMethod: "sni-only",
    },

    loggingConfig: {
        bucket: logsBucket.bucketDomainName,
        includeCookies: false,
        prefix: `${config.targetDomain}/`,
    },
};

const cdn = new aws.cloudfront.Distribution("cdn", distributionArgs);

new aws.s3.BucketPolicy("bucketPolicy", {
    bucket: contentBucket.id, // refer to the bucket created earlier
    policy: pulumi.all([originAccessIdentity.iamArn, contentBucket.arn]).apply(([oaiArn, bucketArn]) => JSON.stringify({
        Version: "2012-10-17",
        Statement: [
            {
                Effect: "Allow",
                Principal: {
                    AWS: oaiArn,
                }, // Only allow Cloudfront read access.
                Action: ["s3:GetObject"],
                Resource: [`${bucketArn}/*`], // Give Cloudfront access to the entire bucket.
            },
        ],
    })),
});

// Export the name of the bucket
export const bucketName = contentBucket.id;
export const contentBucketUri = pulumi.interpolate`s3://${contentBucket.bucket}`;
export const contentBucketWebsiteEndpoint = contentBucket.websiteEndpoint;
export const cloudFrontDomain = cdn.domainName;
export const targetDomainEndpoint = `https://${config.targetDomain}/`;
