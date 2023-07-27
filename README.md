# geodatadownloader.com (GDD)

This repo contains _all_ of the code for <https://geodatadownloader.com>

[![Netlify Status](https://api.netlify.com/api/v1/badges/55727701-8ed9-4074-8a16-829dcb4601db/deploy-status)](https://app.netlify.com/sites/geodatadownloader/deploys)
[![geodatadownloader](https://img.shields.io/endpoint?url=https://dashboard.cypress.io/badge/detailed/8tricd/master&style=flat&logo=cypress)](https://dashboard.cypress.io/projects/8tricd/runs)

## What is geodatadownloader?

GDD is client-side browser application that will download all the data contained
in an ArcGIS feature layer onto your computer.
It is not limited by max query size, and can download any size dataset
(yes that includes those huge parcel layers from your local county).
You can choose a custom extent for your download, and pick the output columns you want to use.

GDD runs entirely in your browser and stores nothing besides what your
browser caches locally. There is no backend to the application,
besides the CDN used to serve up the html/javascript.
In order to draw an extent the map uses ESRI's javascript library
(and therefore ESRI's servers to serve up the data for the map).
Conversion to from arcgis json to geojson is done browser side as well.

## What formats does this support?

- GeoJSON
- CSV
- SHP (ESRI Shapefile)
- GPKG
- KML
- GPX
- PGDUMP
- SVG
- DXF
- SQLite
- XSLX

## How does geodatadownloader download all of the data for a layer?

It executes a query on the arcgis feature service that says `where: 1=1`.
Or, in other words, return everything. When it executes this query, it specifies the parameter `returnOnlyObjectIds`.
This returns all objectIds in a list.
Then, GDD paginates those objectIds into chunks of 500.
It then constructs a `where: OBJECTID IN (...objectIds...)` which returns those 500 features.
It then proceeds to do this until every chunk has been requested and written into the downloaded dataset.

You may be asking yourself "Why even ask for the objectIds and instead just grab all the features in that original `where: 1=1`?".
If GDD could, it would. ArcGIS REST services are typically are limited by a specific number of features they can return (usually around 1000, but it depends).
Some endpoints are "paginated", meaning that you can fetch features one page at a time. Not all services support this, though.
So instead, we use the objectIds method because it works a lot more consistently.
