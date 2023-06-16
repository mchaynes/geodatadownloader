export type AmplifyDependentResourcesAttributes = {
  "analytics": {
    "geodatadownloader": {
      "Id": "string",
      "Region": "string",
      "appName": "string"
    }
  },
  "api": {
    "geodatadownloader": {
      "GraphQLAPIEndpointOutput": "string",
      "GraphQLAPIIdOutput": "string"
    }
  },
  "auth": {
    "geodatadownloader": {
      "AppClientID": "string",
      "AppClientIDWeb": "string",
      "IdentityPoolId": "string",
      "IdentityPoolName": "string",
      "UserPoolArn": "string",
      "UserPoolId": "string",
      "UserPoolName": "string"
    }
  },
  "geo": {
    "layers": {
      "Arn": "string",
      "Name": "string",
      "Region": "string",
      "Style": "string"
    }
  }
}