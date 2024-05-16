import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Box from "@mui/material/Box";
import { useCallback, useEffect, useState } from "react";
import * as React from "react";
import type { } from "@mui/x-data-grid/themeAugmentation";
import { StatusAlert, useStatusAlert } from "./StatusAlert";
import FeatureLayer from "@arcgis/core/layers/FeatureLayer";
import { setLoadingWhile } from "./loading";
import { Autocomplete, IconButton } from "@mui/material";
import DeleteIcon from '@mui/icons-material/Delete';

export type Status = "not_started" | "loading" | "error" | "loaded";

export type PickLayerProps = {
  defaultLayerUrl: string;
  onLayerLoad: (_: FeatureLayer) => void;
};


type RecentUrls = {
  urls: RecentUrl[]
}

type RecentUrl = {
  url: string
}

function addRecentUrl(urls: RecentUrls, newUrl: RecentUrl): RecentUrls {
  urls.urls = urls.urls.filter((url) => url.url !== newUrl.url)
  return { urls: [newUrl, ...urls.urls] }
}

export function PickLayer({ defaultLayerUrl, onLayerLoad }: PickLayerProps) {
  const [loading, setLoading] = useState(false);
  const [alertProps, setAlertProps] = useStatusAlert("", undefined);
  const [url, setUrl] = useState(defaultLayerUrl);

  const [recentUrls, setRecentUrls] = useState(() => {
    return JSON.parse(localStorage.getItem("recent_urls") ?? `{"urls": []}`) as RecentUrls
  })

  const recentUrlsMemod = React.useMemo(() => recentUrls?.urls?.map(u => u.url) ?? [], [recentUrls])


  useEffect(() => {
    localStorage.setItem("recent_urls", JSON.stringify(recentUrls))
  }, [recentUrls])

  const loadLayer = useCallback(
    async (layerUrl: string) => {
      await setLoadingWhile(async () => {
        try {
          const url = new URL(layerUrl)
          const strippedUrl = url.protocol + "//" + url.hostname + url.pathname
          console.log(strippedUrl)
          const layer = new FeatureLayer({
            url: strippedUrl,
          });
          await layer.load();
          setAlertProps("", undefined);
          onLayerLoad(layer);
          setRecentUrls(urls => addRecentUrl(urls, { url: layerUrl }))
        } catch (e) {
          const err = e as Error;
          setAlertProps(`${err.message}`, "error");
        }
      }, setLoading);
    },
    [onLayerLoad, setAlertProps, setLoading]
  );

  useEffect(() => {
    if (defaultLayerUrl) {
      void loadLayer(defaultLayerUrl);
    }
  }, [defaultLayerUrl, loadLayer]);

  function onLoadClick() {
    void loadLayer(url);
  }

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      onLoadClick();
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "1rem 1rem",
        marginTop: "1rem",
      }}
    >
      <form className="flex items-center">
        <label htmlFor="simple-search" className="sr-only">Search</label>
        <div className="relative w-full">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <svg aria-hidden="true" className="w-5 h-5 text-gray-500 dark:text-gray-400" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd"></path></svg>
          </div>
          <input type="text" id="add-layer" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2.5  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Add layer to map" required />
        </div>
        <button type="submit" className="p-2.5 ml-2 text-sm font-medium text-white bg-blue-700 rounded-lg border border-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
          <svg className="w-[14px] h-[14px] text-white" fill="none" viewBox="0 0 18 18">
            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 1v16M1 9h16" />
          </svg>
          <span className="sr-only">Add Layer To Map</span>
        </button>
      </form>
      <Box>
        <StatusAlert loading={loading} {...alertProps} />
      </Box>
    </div>
  );
}

type SavedLayerListItemParams<T> = {
  props: T
  url: string
  onDelete: () => void
  onClick: () => void
}

function SavedLayerListItem<T>({ url, onDelete, onClick, props }: SavedLayerListItemParams<T>) {
  const [clicked, setClicked] = useState(false)
  return (
    <Box component="li" {...props}>
      <div onClick={onClick} style={{ display: "flex", flexGrow: 1 }}>
        {url}
      </div>
      <IconButton onClick={onDelete}>
        <DeleteIcon htmlColor={clicked ? "red" : undefined} />
      </IconButton>
    </Box>
  )
}
