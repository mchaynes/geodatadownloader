import { createClient } from "@supabase/supabase-js";
import { LayerJson } from "./arcgis";
import { Database } from "./database.types";

// Create a single supabase client for interacting with your database
const supabase = createClient<Database>(
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
  import.meta.env.VITE_SUPABASE_URL,
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export async function searchLayers() {
  const result = await supabase.from("layers").select("name, description");
  if (result.error) {
    throw new Error(result.error.toString());
  }
  return result.data;
}

export type InsertLayer = Database["public"]["Tables"]["layers"]["Insert"];

function layerJsonToInsert(url: string, layer: LayerJson): InsertLayer {
  return {
    url: url,
    name: layer.name ?? "layer",
    description: layer.description ?? "description",
  };
}

export async function insertLayer(url: string, layer: LayerJson) {
  const insert = layerJsonToInsert(url, layer);
  const result = await supabase.from("layers").upsert(insert);
  if (result.error) {
    throw new Error(result.error.toString());
  }
}
