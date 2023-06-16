// @ts-check
import { initSchema } from '@aws-amplify/datastore';
import { schema } from './schema';

const Frequency = {
  "DAILY": "DAILY",
  "WEEKLY": "WEEKLY",
  "MONTHLY": "MONTHLY"
};

const DownloadStatus = {
  "STARTED": "STARTED",
  "PENDING": "PENDING",
  "SUCCESSFUL": "SUCCESSFUL",
  "FAILED": "FAILED"
};

const Formats = {
  "PMTILES": "PMTILES",
  "GPKG": "GPKG",
  "GEOJSON": "GEOJSON",
  "SHP": "SHP"
};

const { Downloads, DownloadSchedule } = initSchema(schema);

export {
  Downloads,
  DownloadSchedule,
  Frequency,
  DownloadStatus,
  Formats
};