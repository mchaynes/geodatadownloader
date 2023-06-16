import { ModelInit, MutableModel, __modelMeta__, ManagedIdentifier } from "@aws-amplify/datastore";
// @ts-ignore
import { LazyLoading, LazyLoadingDisabled, AsyncCollection } from "@aws-amplify/datastore";

export enum Frequency {
  DAILY = "DAILY",
  WEEKLY = "WEEKLY",
  MONTHLY = "MONTHLY"
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
  readonly layer_url?: string | null;
  readonly format?: Formats | keyof typeof Formats | null;
  readonly access_key_id?: string | null;
  readonly secret_key?: string | null;
  readonly destination?: string | null;
  readonly frequency?: Frequency | keyof typeof Frequency | null;
  readonly Downloads?: (Downloads | null)[] | null;
  readonly start_at?: string | null;
  readonly column_mapping?: string | null;
  readonly job_name?: string | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

type LazyDownloadSchedule = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<DownloadSchedule, 'id'>;
    readOnlyFields: 'createdAt' | 'updatedAt';
  };
  readonly id: string;
  readonly layer_url?: string | null;
  readonly format?: Formats | keyof typeof Formats | null;
  readonly access_key_id?: string | null;
  readonly secret_key?: string | null;
  readonly destination?: string | null;
  readonly frequency?: Frequency | keyof typeof Frequency | null;
  readonly Downloads: AsyncCollection<Downloads>;
  readonly start_at?: string | null;
  readonly column_mapping?: string | null;
  readonly job_name?: string | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

export declare type DownloadSchedule = LazyLoading extends LazyLoadingDisabled ? EagerDownloadSchedule : LazyDownloadSchedule

export declare const DownloadSchedule: (new (init: ModelInit<DownloadSchedule>) => DownloadSchedule) & {
  copyOf(source: DownloadSchedule, mutator: (draft: MutableModel<DownloadSchedule>) => MutableModel<DownloadSchedule> | void): DownloadSchedule;
}