import { ModelInit, MutableModel, __modelMeta__, ManagedIdentifier } from "@aws-amplify/datastore";
// @ts-ignore
import { LazyLoading, LazyLoadingDisabled, AsyncCollection } from "@aws-amplify/datastore";

export enum Days {
  SUNDAY = "SUNDAY",
  MONDAY = "MONDAY",
  TUESDAY = "TUESDAY",
  WEDNESDAY = "WEDNESDAY",
  THURSDAY = "THURSDAY",
  FRIDAY = "FRIDAY",
  SATURDAY = "SATURDAY"
}

export enum Frequency {
  DAILY = "DAILY",
  WEEKLY = "WEEKLY",
  MONTHLY = "MONTHLY",
  HOURLY = "HOURLY"
}

export enum DownloadStatus {
  STARTED = "STARTED",
  PENDING = "PENDING",
  SUCCESSFUL = "SUCCESSFUL",
  FAILED = "FAILED"
}

export enum Formats {
  PMTILES = "PMTILES",
  GPKG = "GPKG",
  GEOJSON = "GEOJSON",
  SHP = "SHP"
}



type EagerLayer = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<Layer, 'id'>;
    readOnlyFields: 'createdAt' | 'updatedAt';
  };
  readonly id: string;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

type LazyLayer = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<Layer, 'id'>;
    readOnlyFields: 'createdAt' | 'updatedAt';
  };
  readonly id: string;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

export declare type Layer = LazyLoading extends LazyLoadingDisabled ? EagerLayer : LazyLayer

export declare const Layer: (new (init: ModelInit<Layer>) => Layer) & {
  copyOf(source: Layer, mutator: (draft: MutableModel<Layer>) => MutableModel<Layer> | void): Layer;
}

type EagerDownloads = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<Downloads, 'id'>;
    readOnlyFields: 'createdAt' | 'updatedAt';
  };
  readonly id: string;
  readonly downloadscheduleID: string;
  readonly status?: DownloadStatus | keyof typeof DownloadStatus | null;
  readonly started_at?: string | null;
  readonly finished_at?: string | null;
  readonly messages?: (string | null)[] | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

type LazyDownloads = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<Downloads, 'id'>;
    readOnlyFields: 'createdAt' | 'updatedAt';
  };
  readonly id: string;
  readonly downloadscheduleID: string;
  readonly status?: DownloadStatus | keyof typeof DownloadStatus | null;
  readonly started_at?: string | null;
  readonly finished_at?: string | null;
  readonly messages?: (string | null)[] | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

export declare type Downloads = LazyLoading extends LazyLoadingDisabled ? EagerDownloads : LazyDownloads

export declare const Downloads: (new (init: ModelInit<Downloads>) => Downloads) & {
  copyOf(source: Downloads, mutator: (draft: MutableModel<Downloads>) => MutableModel<Downloads> | void): Downloads;
}

type EagerDownloadSchedule = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<DownloadSchedule, 'id'>;
    readOnlyFields: 'createdAt' | 'updatedAt';
  };
  readonly id: string;
  readonly layer_url: string;
  readonly format: Formats | keyof typeof Formats;
  readonly access_key_id: string;
  readonly secret_key: string;
  readonly destination?: string | null;
  readonly frequency: Frequency | keyof typeof Frequency;
  readonly Downloads?: (Downloads | null)[] | null;
  readonly column_mapping?: string | null;
  readonly job_name?: string | null;
  readonly where?: string | null;
  readonly boundary?: string | null;
  readonly active?: boolean | null;
  readonly days_of_the_week: (Days | null)[] | keyof typeof Days;
  readonly day_of_the_month?: number | null;
  readonly time_of_day?: string | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

type LazyDownloadSchedule = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<DownloadSchedule, 'id'>;
    readOnlyFields: 'createdAt' | 'updatedAt';
  };
  readonly id: string;
  readonly layer_url: string;
  readonly format: Formats | keyof typeof Formats;
  readonly access_key_id: string;
  readonly secret_key: string;
  readonly destination?: string | null;
  readonly frequency: Frequency | keyof typeof Frequency;
  readonly Downloads: AsyncCollection<Downloads>;
  readonly column_mapping?: string | null;
  readonly job_name?: string | null;
  readonly where?: string | null;
  readonly boundary?: string | null;
  readonly active?: boolean | null;
  readonly days_of_the_week: (Days | null)[] | keyof typeof Days;
  readonly day_of_the_month?: number | null;
  readonly time_of_day?: string | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

export declare type DownloadSchedule = LazyLoading extends LazyLoadingDisabled ? EagerDownloadSchedule : LazyDownloadSchedule

export declare const DownloadSchedule: (new (init: ModelInit<DownloadSchedule>) => DownloadSchedule) & {
  copyOf(source: DownloadSchedule, mutator: (draft: MutableModel<DownloadSchedule>) => MutableModel<DownloadSchedule> | void): DownloadSchedule;
}