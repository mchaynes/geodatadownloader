const copyStaticFiles = require('esbuild-copy-static-files')
require('esbuild').build({
    entryPoints: ['src/index.tsx'],
    bundle: true,
    outdir: 'build/',
    sourcemap: true,
    minify: true,
    splitting: true,
    loader: {
        '.png': 'dataurl',
    },
    format: "esm",
    plugins: [copyStaticFiles({
        src: "public/",
        dest: "build/"
    })]
}).catch(() => process.exit(1))