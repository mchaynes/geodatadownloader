// @ts-check
import { initSchema } from '@aws-amplify/datastore';
import { schema } from './schema';

const Days = {
  "SUNDAY": "SUNDAY",
  "MONDAY": "MONDAY",
  "TUESDAY": "TUESDAY",
  "WEDNESDAY": "WEDNESDAY",
  "THURSDAY": "THURSDAY",
  "FRIDAY": "FRIDAY",
  "SATURDAY": "SATURDAY"
};

const Frequency = {
  "DAILY": "DAILY",
  "WEEKLY": "WEEKLY",
  "MONTHLY": "MONTHLY",
  "HOURLY": "HOURLY"
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

const { Layer, Downloads, DownloadSchedule } = initSchema(schema);

export {
  Layer,
  Downloads,
  DownloadSchedule,
  Days,
  Frequency,
  DownloadStatus,
  Formats
};