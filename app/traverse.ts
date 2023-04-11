const extractData = (data: Container): Container => {
  return { ...data };
};

export type Container = {
  folders?: Container[];
  id?: number;
  url: string;
  name: string;
  description?: string;
  geometryType?: string;
  extent?: {
    xmin: number;
    ymin: number;
    xmax: number;
    ymax: number;
    spatialReference: {
      wkid: number;
      latestWkid: number;
    };
  };

  type?: string;
  services?: Container[];
  layers?: Container[];
};
const recurseTree = async (
  url: string,
  container: Container,
  allLayers: Container[]
) => {
  const fJson = `${url}?f=json`;
  const response = await fetch(fJson);
  const json = (await response.json()) as {
    folders?: string[];
    [key: string]: unknown;
  };
  const data = {
    ...json,
    folders: json.folders?.map(
      (f) =>
        ({
          name: f,
          url: `${url}${f}`,
          services: [],
          layers: [],
        } as Container)
    ),
  } as Container;

  if (data.folders) {
    container.folders = [...data.folders];
    for (const folder of container.folders) {
      await recurseTree(folder.url, folder, allLayers);
    }
  }
  const services = data.services;
  if (services && services.length > 0) {
    if (!container.services) container.services = [];
    for (const service of services) {
      const urlServiceName = service.name.includes("/")
        ? service.name.split("/")[1]
        : service.name;
      if (!service.type) {
        throw new Error("service is missing type");
      }
      const newContainer = {
        url: pathJoin([url, urlServiceName, service.type]),
        name: service.name,
        services: [],
        layers: [],
      };
      container.services.push(newContainer);
      await recurseTree(newContainer.url, newContainer, allLayers);
    }
  }
  const layers = data.layers;
  if (layers) {
    for (const layer of layers) {
      if (layer.id === undefined) {
        throw new Error("layer id not defined");
      }
      await recurseTree(pathJoin([url, `${layer.id}`]), container, allLayers);
    }
  }
  const id = data.id;
  if (id) {
    const extracted = extractData(data);
    extracted.url = url;
    container.layers = container.layers ?? [];
    container.layers.push(extracted);
    allLayers.push(extracted);
  }
};
const traverseServer = async (baseUrl: string) => {
  console.log(`Beginning traversal of ${baseUrl}`);
  const serverTree: Container = {
    url: baseUrl,
    name: "root",
  };
  serverTree.url = baseUrl;
  const layers = [];
  await recurseTree(baseUrl, serverTree, layers);

  return layers;
};

// https://stackoverflow.com/a/55142565/18094166
function pathJoin(parts: string[]) {
  const separator = "/";
  parts = parts.map((part, index) => {
    if (index) {
      part = part.replace(new RegExp("^" + separator), "");
    }
    if (index !== parts.length - 1) {
      part = part.replace(new RegExp(separator + "$"), "");
    }
    return part;
  });
  return parts.join(separator);
}

export default traverseServer;
