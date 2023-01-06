import React from "react";
import { useEffect, useState } from "react";
import Divider from "@mui/material/Divider";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import { QueryResults } from "./arcgis";
import { DownloaderForm } from "./Downloader";
import { AttributeTablePreview } from "./AttributeTablePreview";
import { PickLayer } from "./PickLayer";
import { FileHandler } from "./FileHandler";
import { ExtentPicker } from "./ExtentPicker";
import Geometry from "@arcgis/core/geometry/Geometry";
import { Where } from "./Where";
import FeatureLayer from "@arcgis/core/layers/FeatureLayer";
import Box from "@mui/material/Box";
import { getQueryParameter } from "./url";

const paperSx = { my: { xs: 3, md: 6 }, p: { xs: 2, md: 3 } };

export type WorkflowProps = {
  fileHandler: FileHandler;
};

export function Workflow({ fileHandler }: WorkflowProps) {
  const layerUrl = getQueryParameter("layer_url") || "";
  const [layer, setLayer] = useState<FeatureLayer>();
  return (
    <Box>
      <Paper variant="outlined" sx={paperSx}>
        <SectionHeader header="Layer Info" />
        <PickLayer defaultLayerUrl={layerUrl} onLayerLoad={setLayer} />
        {layer && <WorkflowItems layer={layer} fileHandler={fileHandler} />}
      </Paper>
    </Box>
  );
}

export type WorkflowItemsProps = WorkflowProps & {
  layer: FeatureLayer;
};

function WorkflowItems({ layer, fileHandler }: WorkflowItemsProps) {
  const [selectedFields, setSelectedFields] = useState<string[]>(
    layer.fields.map((f) => f.name)
  );
  const [filterExtent, setFilterExtent] = useState<Geometry | undefined>(
    undefined
  );
  const [where, setWhere] = useState(() => getQueryParameter("where") || "1=1");
  const [queryResults, setQueryResults] = useState<QueryResults>(() => {
    return new QueryResults(layer, filterExtent);
  });
  const boundaryExtent = getQueryParameter("boundary") ?? "";

  useEffect(() => {
    setQueryResults(new QueryResults(layer, filterExtent, 500));
  }, [filterExtent, layer]);

  return (
    <div>
      <SectionDivider />
      <SectionHeader header="Draw Boundary (if you want)" />
      <ExtentPicker
        defaultBoundaryExtent={boundaryExtent}
        layer={layer}
        onFilterGeometryChange={(g) => setFilterExtent(g)}
        where={where}
      />

      <SectionDivider />
      <SectionHeader header="Attribute Table Preview" />
      <Where defaultWhere={where} onChange={setWhere} />
      <AttributeTablePreview
        selectedFields={selectedFields}
        setSelectedFields={setSelectedFields}
        queryResults={queryResults}
        fields={layer.fields}
        where={where}
      />
      <SectionDivider />
      <SectionHeader header="Download Options" />
      <DownloaderForm
        fileHandler={fileHandler}
        outFields={selectedFields}
        queryResults={queryResults}
        where={where}
      />
    </div>
  );
}

type SectionHeaderProps = {
  header: string;
};

function SectionHeader({ header }: SectionHeaderProps) {
  return (
    <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>
      {header}
    </Typography>
  );
}

function SectionDivider() {
  return <Divider sx={{ mt: 3, mb: 3 }}></Divider>;
}
