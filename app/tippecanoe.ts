// new Function bypasses Vite's import analysis, which rejects import() of
// files inside public/. The browser will fetch the file directly from the
// server (public/ files are always served as-is).
const dynamicImport = new Function("url", "return import(url)") as (
  url: string
) => Promise<any>;

// Cache the ES module itself (the factory), but NOT the instantiated module.
// tippecanoe's main.cpp uses the global `optind` variable via getopt() and never
// resets it, so each run must get a fresh WASM instance with a clean `optind = 1`.
// The WASM binary is compiled once by the browser and cached, so subsequent
// instantiations are fast (they skip recompilation).
let factoryPromise: Promise<(opts?: any) => Promise<any>> | null = null;

function getFactory(): Promise<(opts?: any) => Promise<any>> {
  if (factoryPromise) return factoryPromise;
  factoryPromise = dynamicImport("/tippecanoe/tippecanoe-st.js").then(
    (m: any) => m.default
  );
  return factoryPromise;
}

async function createFreshModule(): Promise<any> {
  const factory = await getFactory();
  return factory();
}

/**
 * Run tippecanoe with the given input files and CLI args.
 *
 * @param files - Map of virtual filename → GeoJSON string
 * @param args  - tippecanoe CLI args (must include -o output.pmtiles)
 * @returns PMTiles bytes
 */
export async function runTippecanoe(
  files: Map<string, string>,
  args: string[]
): Promise<Uint8Array> {
  const Module = await createFreshModule();
  const { FS } = Module;

  // Write input files into the virtual filesystem
  for (const [filename, data] of files) {
    FS.writeFile(filename, data);
  }

  // Find the output filename from args (-o <filename>)
  let outputFile: string | null = null;
  for (let i = 0; i < args.length - 1; i++) {
    if (args[i] === "-o" || args[i] === "--output") {
      outputFile = args[i + 1];
      break;
    }
  }

  const tippecanoe = new Module.Tippecanoe();
  const argsStr = args.join("\n");
  const exitCode = tippecanoe.runArgs(argsStr);

  if (exitCode !== 0) {
    for (const [filename] of files) {
      try { FS.unlink(filename); } catch (_) { /* ignore */ }
    }
    tippecanoe.freeOutput();
    throw new Error(`tippecanoe exited with code ${exitCode}`);
  }

  // Read the output file from the virtual FS — tippecanoe writes it there.
  // copyOutput() uses Module.HEAPU8 which is a local variable in the newer
  // Emscripten output format and is not exposed on the Module object, so it
  // fails. FS.readFile() is the reliable path, matching what index.js does.
  let pmtiles: Uint8Array;
  if (outputFile) {
    try {
      pmtiles = FS.readFile(outputFile) as Uint8Array;
      try { FS.unlink(outputFile); } catch (_) { /* ignore */ }
    } catch (_) {
      // Fallback: try the in-memory direct writer output
      pmtiles = tippecanoe.copyOutput() as Uint8Array;
    }
  } else {
    pmtiles = tippecanoe.copyOutput() as Uint8Array;
  }

  tippecanoe.freeOutput();

  // Clean up input files
  for (const [filename] of files) {
    try { FS.unlink(filename); } catch (_) { /* ignore */ }
  }

  return pmtiles;
}
