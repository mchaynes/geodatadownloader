const esbuild = require('esbuild')
const copyStaticFilesPlugin = require('esbuild-copy-static-files')

const { createServer } = require('http')


const watchMode = process.env.ESBUILD_WATCH === "true"
// Use PORT, otherwise 3000
const port = process.env.PORT ? parseInt(process.env.PORT) : 3000

// Define for server that's serving up update notifications
// Use UPDATE_PORT, otherwise just add 15 to the PORT env var
const updatePort = process.env.UPDATE_PORT ? parseInt(process.env.UPDATE_PORT) : port + 15


const clients = []


esbuild
    .build({
        entryPoints: ['src/index.tsx'],
        bundle: true,
        outdir: 'build/',
        sourcemap: true,
        minify: true,
        splitting: true,
        banner: watchMode ? {
            js: ` (() => new EventSource("http://localhost:${updatePort}").onmessage = () => location.reload())();`,
        } : undefined,
        watch: watchMode ? {
            onRebuild() {
                // trigger reload
                clients.forEach((res) => res.write("data: update\n\n"));
                // reset clients because they're no longer listening
                clients.length = 0;
                console.log(`rebuilt at: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`)
            }
        } : undefined,
        loader: {
            '.png': 'dataurl',
        },
        format: "esm",
        plugins: [
            copyStaticFilesPlugin({
                src: "public/",
                dest: "build/"
            })
        ]
    })
    .catch((err) => { console.error(err); process.exit(1) })


if (watchMode) {
    console.log("Watch mode")
    esbuild.serve({ servedir: './build', host: "localhost", port: port }, {}).then(() => {
        createServer((req, res) => {
            return clients.push(
                res.writeHead(200, {
                    'Content-Type': 'text/event-stream',
                    'Cache-Control': 'no-cache',
                    "Access-Control-Allow-Origin": "*",
                    Connection: 'keep-alive',
                })
            )
        }).listen(updatePort)
    })
}