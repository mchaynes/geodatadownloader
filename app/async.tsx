import React from "react";
import Loadable from "react-loadable";

const Loading = (props) => {
  if (props.error) {
    return <div>Error!</div>;
  } else {
    return <div>Loading...</div>;
  }
};

const ExtentPicker = Loadable({
  loader: () => import("./ExtentPicker"),
  loading: Loading,
});

const Geometry = Loadable({
  loader: () => import("@arcgis/core/geometry/Geometry"),
  loading: Loading,
});

export { ExtentPicker, Geometry };
