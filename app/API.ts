/* tslint:disable */
/* eslint-disable */
//  This file was automatically generated and should not be edited.

export type CreateLayerInput = {
  id?: string | null,
  _version?: number | null,
};

export type ModelLayerConditionInput = {
  and?: Array< ModelLayerConditionInput | null > | null,
  or?: Array< ModelLayerConditionInput | null > | null,
  not?: ModelLayerConditionInput | null,
  _deleted?: ModelBooleanInput | null,
};

export type ModelBooleanInput = {
  ne?: boolean | null,
  eq?: boolean | null,
  attributeExists?: boolean | null,
  attributeType?: ModelAttributeTypes | null,
};

export enum ModelAttributeTypes {
  binary = "binary",
  binarySet = "binarySet",
  bool = "bool",
  list = "list",
  map = "map",
  number = "number",
  numberSet = "numberSet",
  string = "string",
  stringSet = "stringSet",
  _null = "_null",
}


export type Layer = {
  __typename: "Layer",
  id: string,
  createdAt: string,
  updatedAt: string,
  _version: number,
  _deleted?: boolean | null,
  _lastChangedAt: number,
};

export type UpdateLayerInput = {
  id: string,
  _version?: number | null,
};

export type DeleteLayerInput = {
  id: string,
  _version?: number | null,
};

export type CreateDownloadsInput = {
  id?: string | null,
  downloadscheduleID: string,
  status?: DownloadStatus | null,
  started_at?: string | null,
  finished_at?: string | null,
  messages?: Array< string | null > | null,
  _version?: number | null,
};

export enum DownloadStatus {
  STARTED = "STARTED",
  PENDING = "PENDING",
  SUCCESSFUL = "SUCCESSFUL",
  FAILED = "FAILED",
}


export type ModelDownloadsConditionInput = {
  downloadscheduleID?: ModelIDInput | null,
  status?: ModelDownloadStatusInput | null,
  started_at?: ModelStringInput | null,
  finished_at?: ModelStringInput | null,
  messages?: ModelStringInput | null,
  and?: Array< ModelDownloadsConditionInput | null > | null,
  or?: Array< ModelDownloadsConditionInput | null > | null,
  not?: ModelDownloadsConditionInput | null,
  _deleted?: ModelBooleanInput | null,
};

export type ModelIDInput = {
  ne?: string | null,
  eq?: string | null,
  le?: string | null,
  lt?: string | null,
  ge?: string | null,
  gt?: string | null,
  contains?: string | null,
  notContains?: string | null,
  between?: Array< string | null > | null,
  beginsWith?: string | null,
  attributeExists?: boolean | null,
  attributeType?: ModelAttributeTypes | null,
  size?: ModelSizeInput | null,
};

export type ModelSizeInput = {
  ne?: number | null,
  eq?: number | null,
  le?: number | null,
  lt?: number | null,
  ge?: number | null,
  gt?: number | null,
  between?: Array< number | null > | null,
};

export type ModelDownloadStatusInput = {
  eq?: DownloadStatus | null,
  ne?: DownloadStatus | null,
};

export type ModelStringInput = {
  ne?: string | null,
  eq?: string | null,
  le?: string | null,
  lt?: string | null,
  ge?: string | null,
  gt?: string | null,
  contains?: string | null,
  notContains?: string | null,
  between?: Array< string | null > | null,
  beginsWith?: string | null,
  attributeExists?: boolean | null,
  attributeType?: ModelAttributeTypes | null,
  size?: ModelSizeInput | null,
};

export type Downloads = {
  __typename: "Downloads",
  id: string,
  downloadscheduleID: string,
  status?: DownloadStatus | null,
  started_at?: string | null,
  finished_at?: string | null,
  messages?: Array< string | null > | null,
  createdAt: string,
  updatedAt: string,
  _version: number,
  _deleted?: boolean | null,
  _lastChangedAt: number,
  owner?: string | null,
};

export type UpdateDownloadsInput = {
  id: string,
  downloadscheduleID?: string | null,
  status?: DownloadStatus | null,
  started_at?: string | null,
  finished_at?: string | null,
  messages?: Array< string | null > | null,
  _version?: number | null,
};

export type DeleteDownloadsInput = {
  id: string,
  _version?: number | null,
};

export type CreateDownloadScheduleInput = {
  id?: string | null,
  layer_url: string,
  format: Formats,
  access_key_id: string,
  secret_key: string,
  destination?: string | null,
  frequency: Frequency,
  column_mapping?: string | null,
  job_name?: string | null,
  where?: string | null,
  boundary?: string | null,
  active?: boolean | null,
  days_of_the_week: Array< Days | null >,
  day_of_the_month?: number | null,
  time_of_day?: string | null,
  _version?: number | null,
};

export enum Formats {
  PMTILES = "PMTILES",
  GPKG = "GPKG",
  GEOJSON = "GEOJSON",
  SHP = "SHP",
}


export enum Frequency {
  DAILY = "DAILY",
  WEEKLY = "WEEKLY",
  MONTHLY = "MONTHLY",
  HOURLY = "HOURLY",
}


export enum Days {
  SUNDAY = "SUNDAY",
  MONDAY = "MONDAY",
  TUESDAY = "TUESDAY",
  WEDNESDAY = "WEDNESDAY",
  THURSDAY = "THURSDAY",
  FRIDAY = "FRIDAY",
  SATURDAY = "SATURDAY",
}


export type ModelDownloadScheduleConditionInput = {
  layer_url?: ModelStringInput | null,
  format?: ModelFormatsInput | null,
  access_key_id?: ModelStringInput | null,
  secret_key?: ModelStringInput | null,
  destination?: ModelStringInput | null,
  frequency?: ModelFrequencyInput | null,
  column_mapping?: ModelStringInput | null,
  job_name?: ModelStringInput | null,
  where?: ModelStringInput | null,
  boundary?: ModelStringInput | null,
  active?: ModelBooleanInput | null,
  days_of_the_week?: ModelDaysInput | null,
  day_of_the_month?: ModelIntInput | null,
  time_of_day?: ModelStringInput | null,
  and?: Array< ModelDownloadScheduleConditionInput | null > | null,
  or?: Array< ModelDownloadScheduleConditionInput | null > | null,
  not?: ModelDownloadScheduleConditionInput | null,
  _deleted?: ModelBooleanInput | null,
};

export type ModelFormatsInput = {
  eq?: Formats | null,
  ne?: Formats | null,
};

export type ModelFrequencyInput = {
  eq?: Frequency | null,
  ne?: Frequency | null,
};

export type ModelDaysInput = {
  eq?: Days | null,
  ne?: Days | null,
};

export type ModelIntInput = {
  ne?: number | null,
  eq?: number | null,
  le?: number | null,
  lt?: number | null,
  ge?: number | null,
  gt?: number | null,
  between?: Array< number | null > | null,
  attributeExists?: boolean | null,
  attributeType?: ModelAttributeTypes | null,
};

export type DownloadSchedule = {
  __typename: "DownloadSchedule",
  id: string,
  layer_url: string,
  format: Formats,
  access_key_id: string,
  secret_key: string,
  destination?: string | null,
  frequency: Frequency,
  Downloads?: ModelDownloadsConnection | null,
  column_mapping?: string | null,
  job_name?: string | null,
  where?: string | null,
  boundary?: string | null,
  active?: boolean | null,
  days_of_the_week: Array< Days | null >,
  day_of_the_month?: number | null,
  time_of_day?: string | null,
  createdAt: string,
  updatedAt: string,
  _version: number,
  _deleted?: boolean | null,
  _lastChangedAt: number,
  owner?: string | null,
};

export type ModelDownloadsConnection = {
  __typename: "ModelDownloadsConnection",
  items:  Array<Downloads | null >,
  nextToken?: string | null,
  startedAt?: number | null,
};

export type UpdateDownloadScheduleInput = {
  id: string,
  layer_url?: string | null,
  format?: Formats | null,
  access_key_id?: string | null,
  secret_key?: string | null,
  destination?: string | null,
  frequency?: Frequency | null,
  column_mapping?: string | null,
  job_name?: string | null,
  where?: string | null,
  boundary?: string | null,
  active?: boolean | null,
  days_of_the_week?: Array< Days | null > | null,
  day_of_the_month?: number | null,
  time_of_day?: string | null,
  _version?: number | null,
};

export type DeleteDownloadScheduleInput = {
  id: string,
  _version?: number | null,
};

export type ModelLayerFilterInput = {
  id?: ModelIDInput | null,
  and?: Array< ModelLayerFilterInput | null > | null,
  or?: Array< ModelLayerFilterInput | null > | null,
  not?: ModelLayerFilterInput | null,
  _deleted?: ModelBooleanInput | null,
};

export type ModelLayerConnection = {
  __typename: "ModelLayerConnection",
  items:  Array<Layer | null >,
  nextToken?: string | null,
  startedAt?: number | null,
};

export type ModelDownloadsFilterInput = {
  id?: ModelIDInput | null,
  downloadscheduleID?: ModelIDInput | null,
  status?: ModelDownloadStatusInput | null,
  started_at?: ModelStringInput | null,
  finished_at?: ModelStringInput | null,
  messages?: ModelStringInput | null,
  and?: Array< ModelDownloadsFilterInput | null > | null,
  or?: Array< ModelDownloadsFilterInput | null > | null,
  not?: ModelDownloadsFilterInput | null,
  _deleted?: ModelBooleanInput | null,
};

export enum ModelSortDirection {
  ASC = "ASC",
  DESC = "DESC",
}


export type ModelDownloadScheduleFilterInput = {
  id?: ModelIDInput | null,
  layer_url?: ModelStringInput | null,
  format?: ModelFormatsInput | null,
  access_key_id?: ModelStringInput | null,
  secret_key?: ModelStringInput | null,
  destination?: ModelStringInput | null,
  frequency?: ModelFrequencyInput | null,
  column_mapping?: ModelStringInput | null,
  job_name?: ModelStringInput | null,
  where?: ModelStringInput | null,
  boundary?: ModelStringInput | null,
  active?: ModelBooleanInput | null,
  days_of_the_week?: ModelDaysInput | null,
  day_of_the_month?: ModelIntInput | null,
  time_of_day?: ModelStringInput | null,
  and?: Array< ModelDownloadScheduleFilterInput | null > | null,
  or?: Array< ModelDownloadScheduleFilterInput | null > | null,
  not?: ModelDownloadScheduleFilterInput | null,
  _deleted?: ModelBooleanInput | null,
};

export type ModelDownloadScheduleConnection = {
  __typename: "ModelDownloadScheduleConnection",
  items:  Array<DownloadSchedule | null >,
  nextToken?: string | null,
  startedAt?: number | null,
};

export type ModelSubscriptionLayerFilterInput = {
  id?: ModelSubscriptionIDInput | null,
  and?: Array< ModelSubscriptionLayerFilterInput | null > | null,
  or?: Array< ModelSubscriptionLayerFilterInput | null > | null,
  _deleted?: ModelBooleanInput | null,
};

export type ModelSubscriptionIDInput = {
  ne?: string | null,
  eq?: string | null,
  le?: string | null,
  lt?: string | null,
  ge?: string | null,
  gt?: string | null,
  contains?: string | null,
  notContains?: string | null,
  between?: Array< string | null > | null,
  beginsWith?: string | null,
  in?: Array< string | null > | null,
  notIn?: Array< string | null > | null,
};

export type ModelSubscriptionDownloadsFilterInput = {
  id?: ModelSubscriptionIDInput | null,
  downloadscheduleID?: ModelSubscriptionIDInput | null,
  status?: ModelSubscriptionStringInput | null,
  started_at?: ModelSubscriptionStringInput | null,
  finished_at?: ModelSubscriptionStringInput | null,
  messages?: ModelSubscriptionStringInput | null,
  and?: Array< ModelSubscriptionDownloadsFilterInput | null > | null,
  or?: Array< ModelSubscriptionDownloadsFilterInput | null > | null,
  _deleted?: ModelBooleanInput | null,
};

export type ModelSubscriptionStringInput = {
  ne?: string | null,
  eq?: string | null,
  le?: string | null,
  lt?: string | null,
  ge?: string | null,
  gt?: string | null,
  contains?: string | null,
  notContains?: string | null,
  between?: Array< string | null > | null,
  beginsWith?: string | null,
  in?: Array< string | null > | null,
  notIn?: Array< string | null > | null,
};

export type ModelSubscriptionDownloadScheduleFilterInput = {
  id?: ModelSubscriptionIDInput | null,
  layer_url?: ModelSubscriptionStringInput | null,
  format?: ModelSubscriptionStringInput | null,
  access_key_id?: ModelSubscriptionStringInput | null,
  secret_key?: ModelSubscriptionStringInput | null,
  destination?: ModelSubscriptionStringInput | null,
  frequency?: ModelSubscriptionStringInput | null,
  column_mapping?: ModelSubscriptionStringInput | null,
  job_name?: ModelSubscriptionStringInput | null,
  where?: ModelSubscriptionStringInput | null,
  boundary?: ModelSubscriptionStringInput | null,
  active?: ModelSubscriptionBooleanInput | null,
  days_of_the_week?: ModelSubscriptionStringInput | null,
  day_of_the_month?: ModelSubscriptionIntInput | null,
  time_of_day?: ModelSubscriptionStringInput | null,
  and?: Array< ModelSubscriptionDownloadScheduleFilterInput | null > | null,
  or?: Array< ModelSubscriptionDownloadScheduleFilterInput | null > | null,
  _deleted?: ModelBooleanInput | null,
};

export type ModelSubscriptionBooleanInput = {
  ne?: boolean | null,
  eq?: boolean | null,
};

export type ModelSubscriptionIntInput = {
  ne?: number | null,
  eq?: number | null,
  le?: number | null,
  lt?: number | null,
  ge?: number | null,
  gt?: number | null,
  between?: Array< number | null > | null,
  in?: Array< number | null > | null,
  notIn?: Array< number | null > | null,
};

export type CreateLayerMutationVariables = {
  input: CreateLayerInput,
  condition?: ModelLayerConditionInput | null,
};

export type CreateLayerMutation = {
  createLayer?:  {
    __typename: "Layer",
    id: string,
    createdAt: string,
    updatedAt: string,
    _version: number,
    _deleted?: boolean | null,
    _lastChangedAt: number,
  } | null,
};

export type UpdateLayerMutationVariables = {
  input: UpdateLayerInput,
  condition?: ModelLayerConditionInput | null,
};

export type UpdateLayerMutation = {
  updateLayer?:  {
    __typename: "Layer",
    id: string,
    createdAt: string,
    updatedAt: string,
    _version: number,
    _deleted?: boolean | null,
    _lastChangedAt: number,
  } | null,
};

export type DeleteLayerMutationVariables = {
  input: DeleteLayerInput,
  condition?: ModelLayerConditionInput | null,
};

export type DeleteLayerMutation = {
  deleteLayer?:  {
    __typename: "Layer",
    id: string,
    createdAt: string,
    updatedAt: string,
    _version: number,
    _deleted?: boolean | null,
    _lastChangedAt: number,
  } | null,
};

export type CreateDownloadsMutationVariables = {
  input: CreateDownloadsInput,
  condition?: ModelDownloadsConditionInput | null,
};

export type CreateDownloadsMutation = {
  createDownloads?:  {
    __typename: "Downloads",
    id: string,
    downloadscheduleID: string,
    status?: DownloadStatus | null,
    started_at?: string | null,
    finished_at?: string | null,
    messages?: Array< string | null > | null,
    createdAt: string,
    updatedAt: string,
    _version: number,
    _deleted?: boolean | null,
    _lastChangedAt: number,
    owner?: string | null,
  } | null,
};

export type UpdateDownloadsMutationVariables = {
  input: UpdateDownloadsInput,
  condition?: ModelDownloadsConditionInput | null,
};

export type UpdateDownloadsMutation = {
  updateDownloads?:  {
    __typename: "Downloads",
    id: string,
    downloadscheduleID: string,
    status?: DownloadStatus | null,
    started_at?: string | null,
    finished_at?: string | null,
    messages?: Array< string | null > | null,
    createdAt: string,
    updatedAt: string,
    _version: number,
    _deleted?: boolean | null,
    _lastChangedAt: number,
    owner?: string | null,
  } | null,
};

export type DeleteDownloadsMutationVariables = {
  input: DeleteDownloadsInput,
  condition?: ModelDownloadsConditionInput | null,
};

export type DeleteDownloadsMutation = {
  deleteDownloads?:  {
    __typename: "Downloads",
    id: string,
    downloadscheduleID: string,
    status?: DownloadStatus | null,
    started_at?: string | null,
    finished_at?: string | null,
    messages?: Array< string | null > | null,
    createdAt: string,
    updatedAt: string,
    _version: number,
    _deleted?: boolean | null,
    _lastChangedAt: number,
    owner?: string | null,
  } | null,
};

export type CreateDownloadScheduleMutationVariables = {
  input: CreateDownloadScheduleInput,
  condition?: ModelDownloadScheduleConditionInput | null,
};

export type CreateDownloadScheduleMutation = {
  createDownloadSchedule?:  {
    __typename: "DownloadSchedule",
    id: string,
    layer_url: string,
    format: Formats,
    access_key_id: string,
    secret_key: string,
    destination?: string | null,
    frequency: Frequency,
    Downloads?:  {
      __typename: "ModelDownloadsConnection",
      items:  Array< {
        __typename: "Downloads",
        id: string,
        downloadscheduleID: string,
        status?: DownloadStatus | null,
        started_at?: string | null,
        finished_at?: string | null,
        messages?: Array< string | null > | null,
        createdAt: string,
        updatedAt: string,
        _version: number,
        _deleted?: boolean | null,
        _lastChangedAt: number,
        owner?: string | null,
      } | null >,
      nextToken?: string | null,
      startedAt?: number | null,
    } | null,
    column_mapping?: string | null,
    job_name?: string | null,
    where?: string | null,
    boundary?: string | null,
    active?: boolean | null,
    days_of_the_week: Array< Days | null >,
    day_of_the_month?: number | null,
    time_of_day?: string | null,
    createdAt: string,
    updatedAt: string,
    _version: number,
    _deleted?: boolean | null,
    _lastChangedAt: number,
    owner?: string | null,
  } | null,
};

export type UpdateDownloadScheduleMutationVariables = {
  input: UpdateDownloadScheduleInput,
  condition?: ModelDownloadScheduleConditionInput | null,
};

export type UpdateDownloadScheduleMutation = {
  updateDownloadSchedule?:  {
    __typename: "DownloadSchedule",
    id: string,
    layer_url: string,
    format: Formats,
    access_key_id: string,
    secret_key: string,
    destination?: string | null,
    frequency: Frequency,
    Downloads?:  {
      __typename: "ModelDownloadsConnection",
      items:  Array< {
        __typename: "Downloads",
        id: string,
        downloadscheduleID: string,
        status?: DownloadStatus | null,
        started_at?: string | null,
        finished_at?: string | null,
        messages?: Array< string | null > | null,
        createdAt: string,
        updatedAt: string,
        _version: number,
        _deleted?: boolean | null,
        _lastChangedAt: number,
        owner?: string | null,
      } | null >,
      nextToken?: string | null,
      startedAt?: number | null,
    } | null,
    column_mapping?: string | null,
    job_name?: string | null,
    where?: string | null,
    boundary?: string | null,
    active?: boolean | null,
    days_of_the_week: Array< Days | null >,
    day_of_the_month?: number | null,
    time_of_day?: string | null,
    createdAt: string,
    updatedAt: string,
    _version: number,
    _deleted?: boolean | null,
    _lastChangedAt: number,
    owner?: string | null,
  } | null,
};

export type DeleteDownloadScheduleMutationVariables = {
  input: DeleteDownloadScheduleInput,
  condition?: ModelDownloadScheduleConditionInput | null,
};

export type DeleteDownloadScheduleMutation = {
  deleteDownloadSchedule?:  {
    __typename: "DownloadSchedule",
    id: string,
    layer_url: string,
    format: Formats,
    access_key_id: string,
    secret_key: string,
    destination?: string | null,
    frequency: Frequency,
    Downloads?:  {
      __typename: "ModelDownloadsConnection",
      items:  Array< {
        __typename: "Downloads",
        id: string,
        downloadscheduleID: string,
        status?: DownloadStatus | null,
        started_at?: string | null,
        finished_at?: string | null,
        messages?: Array< string | null > | null,
        createdAt: string,
        updatedAt: string,
        _version: number,
        _deleted?: boolean | null,
        _lastChangedAt: number,
        owner?: string | null,
      } | null >,
      nextToken?: string | null,
      startedAt?: number | null,
    } | null,
    column_mapping?: string | null,
    job_name?: string | null,
    where?: string | null,
    boundary?: string | null,
    active?: boolean | null,
    days_of_the_week: Array< Days | null >,
    day_of_the_month?: number | null,
    time_of_day?: string | null,
    createdAt: string,
    updatedAt: string,
    _version: number,
    _deleted?: boolean | null,
    _lastChangedAt: number,
    owner?: string | null,
  } | null,
};

export type GetLayerQueryVariables = {
  id: string,
};

export type GetLayerQuery = {
  getLayer?:  {
    __typename: "Layer",
    id: string,
    createdAt: string,
    updatedAt: string,
    _version: number,
    _deleted?: boolean | null,
    _lastChangedAt: number,
  } | null,
};

export type ListLayersQueryVariables = {
  filter?: ModelLayerFilterInput | null,
  limit?: number | null,
  nextToken?: string | null,
};

export type ListLayersQuery = {
  listLayers?:  {
    __typename: "ModelLayerConnection",
    items:  Array< {
      __typename: "Layer",
      id: string,
      createdAt: string,
      updatedAt: string,
      _version: number,
      _deleted?: boolean | null,
      _lastChangedAt: number,
    } | null >,
    nextToken?: string | null,
    startedAt?: number | null,
  } | null,
};

export type SyncLayersQueryVariables = {
  filter?: ModelLayerFilterInput | null,
  limit?: number | null,
  nextToken?: string | null,
  lastSync?: number | null,
};

export type SyncLayersQuery = {
  syncLayers?:  {
    __typename: "ModelLayerConnection",
    items:  Array< {
      __typename: "Layer",
      id: string,
      createdAt: string,
      updatedAt: string,
      _version: number,
      _deleted?: boolean | null,
      _lastChangedAt: number,
    } | null >,
    nextToken?: string | null,
    startedAt?: number | null,
  } | null,
};

export type GetDownloadsQueryVariables = {
  id: string,
};

export type GetDownloadsQuery = {
  getDownloads?:  {
    __typename: "Downloads",
    id: string,
    downloadscheduleID: string,
    status?: DownloadStatus | null,
    started_at?: string | null,
    finished_at?: string | null,
    messages?: Array< string | null > | null,
    createdAt: string,
    updatedAt: string,
    _version: number,
    _deleted?: boolean | null,
    _lastChangedAt: number,
    owner?: string | null,
  } | null,
};

export type ListDownloadsQueryVariables = {
  filter?: ModelDownloadsFilterInput | null,
  limit?: number | null,
  nextToken?: string | null,
};

export type ListDownloadsQuery = {
  listDownloads?:  {
    __typename: "ModelDownloadsConnection",
    items:  Array< {
      __typename: "Downloads",
      id: string,
      downloadscheduleID: string,
      status?: DownloadStatus | null,
      started_at?: string | null,
      finished_at?: string | null,
      messages?: Array< string | null > | null,
      createdAt: string,
      updatedAt: string,
      _version: number,
      _deleted?: boolean | null,
      _lastChangedAt: number,
      owner?: string | null,
    } | null >,
    nextToken?: string | null,
    startedAt?: number | null,
  } | null,
};

export type SyncDownloadsQueryVariables = {
  filter?: ModelDownloadsFilterInput | null,
  limit?: number | null,
  nextToken?: string | null,
  lastSync?: number | null,
};

export type SyncDownloadsQuery = {
  syncDownloads?:  {
    __typename: "ModelDownloadsConnection",
    items:  Array< {
      __typename: "Downloads",
      id: string,
      downloadscheduleID: string,
      status?: DownloadStatus | null,
      started_at?: string | null,
      finished_at?: string | null,
      messages?: Array< string | null > | null,
      createdAt: string,
      updatedAt: string,
      _version: number,
      _deleted?: boolean | null,
      _lastChangedAt: number,
      owner?: string | null,
    } | null >,
    nextToken?: string | null,
    startedAt?: number | null,
  } | null,
};

export type DownloadsByDownloadscheduleIDQueryVariables = {
  downloadscheduleID: string,
  sortDirection?: ModelSortDirection | null,
  filter?: ModelDownloadsFilterInput | null,
  limit?: number | null,
  nextToken?: string | null,
};

export type DownloadsByDownloadscheduleIDQuery = {
  downloadsByDownloadscheduleID?:  {
    __typename: "ModelDownloadsConnection",
    items:  Array< {
      __typename: "Downloads",
      id: string,
      downloadscheduleID: string,
      status?: DownloadStatus | null,
      started_at?: string | null,
      finished_at?: string | null,
      messages?: Array< string | null > | null,
      createdAt: string,
      updatedAt: string,
      _version: number,
      _deleted?: boolean | null,
      _lastChangedAt: number,
      owner?: string | null,
    } | null >,
    nextToken?: string | null,
    startedAt?: number | null,
  } | null,
};

export type GetDownloadScheduleQueryVariables = {
  id: string,
};

export type GetDownloadScheduleQuery = {
  getDownloadSchedule?:  {
    __typename: "DownloadSchedule",
    id: string,
    layer_url: string,
    format: Formats,
    access_key_id: string,
    secret_key: string,
    destination?: string | null,
    frequency: Frequency,
    Downloads?:  {
      __typename: "ModelDownloadsConnection",
      items:  Array< {
        __typename: "Downloads",
        id: string,
        downloadscheduleID: string,
        status?: DownloadStatus | null,
        started_at?: string | null,
        finished_at?: string | null,
        messages?: Array< string | null > | null,
        createdAt: string,
        updatedAt: string,
        _version: number,
        _deleted?: boolean | null,
        _lastChangedAt: number,
        owner?: string | null,
      } | null >,
      nextToken?: string | null,
      startedAt?: number | null,
    } | null,
    column_mapping?: string | null,
    job_name?: string | null,
    where?: string | null,
    boundary?: string | null,
    active?: boolean | null,
    days_of_the_week: Array< Days | null >,
    day_of_the_month?: number | null,
    time_of_day?: string | null,
    createdAt: string,
    updatedAt: string,
    _version: number,
    _deleted?: boolean | null,
    _lastChangedAt: number,
    owner?: string | null,
  } | null,
};

export type ListDownloadSchedulesQueryVariables = {
  filter?: ModelDownloadScheduleFilterInput | null,
  limit?: number | null,
  nextToken?: string | null,
};

export type ListDownloadSchedulesQuery = {
  listDownloadSchedules?:  {
    __typename: "ModelDownloadScheduleConnection",
    items:  Array< {
      __typename: "DownloadSchedule",
      id: string,
      layer_url: string,
      format: Formats,
      access_key_id: string,
      secret_key: string,
      destination?: string | null,
      frequency: Frequency,
      Downloads?:  {
        __typename: "ModelDownloadsConnection",
        nextToken?: string | null,
        startedAt?: number | null,
      } | null,
      column_mapping?: string | null,
      job_name?: string | null,
      where?: string | null,
      boundary?: string | null,
      active?: boolean | null,
      days_of_the_week: Array< Days | null >,
      day_of_the_month?: number | null,
      time_of_day?: string | null,
      createdAt: string,
      updatedAt: string,
      _version: number,
      _deleted?: boolean | null,
      _lastChangedAt: number,
      owner?: string | null,
    } | null >,
    nextToken?: string | null,
    startedAt?: number | null,
  } | null,
};

export type SyncDownloadSchedulesQueryVariables = {
  filter?: ModelDownloadScheduleFilterInput | null,
  limit?: number | null,
  nextToken?: string | null,
  lastSync?: number | null,
};

export type SyncDownloadSchedulesQuery = {
  syncDownloadSchedules?:  {
    __typename: "ModelDownloadScheduleConnection",
    items:  Array< {
      __typename: "DownloadSchedule",
      id: string,
      layer_url: string,
      format: Formats,
      access_key_id: string,
      secret_key: string,
      destination?: string | null,
      frequency: Frequency,
      Downloads?:  {
        __typename: "ModelDownloadsConnection",
        nextToken?: string | null,
        startedAt?: number | null,
      } | null,
      column_mapping?: string | null,
      job_name?: string | null,
      where?: string | null,
      boundary?: string | null,
      active?: boolean | null,
      days_of_the_week: Array< Days | null >,
      day_of_the_month?: number | null,
      time_of_day?: string | null,
      createdAt: string,
      updatedAt: string,
      _version: number,
      _deleted?: boolean | null,
      _lastChangedAt: number,
      owner?: string | null,
    } | null >,
    nextToken?: string | null,
    startedAt?: number | null,
  } | null,
};

export type OnCreateLayerSubscriptionVariables = {
  filter?: ModelSubscriptionLayerFilterInput | null,
};

export type OnCreateLayerSubscription = {
  onCreateLayer?:  {
    __typename: "Layer",
    id: string,
    createdAt: string,
    updatedAt: string,
    _version: number,
    _deleted?: boolean | null,
    _lastChangedAt: number,
  } | null,
};

export type OnUpdateLayerSubscriptionVariables = {
  filter?: ModelSubscriptionLayerFilterInput | null,
};

export type OnUpdateLayerSubscription = {
  onUpdateLayer?:  {
    __typename: "Layer",
    id: string,
    createdAt: string,
    updatedAt: string,
    _version: number,
    _deleted?: boolean | null,
    _lastChangedAt: number,
  } | null,
};

export type OnDeleteLayerSubscriptionVariables = {
  filter?: ModelSubscriptionLayerFilterInput | null,
};

export type OnDeleteLayerSubscription = {
  onDeleteLayer?:  {
    __typename: "Layer",
    id: string,
    createdAt: string,
    updatedAt: string,
    _version: number,
    _deleted?: boolean | null,
    _lastChangedAt: number,
  } | null,
};

export type OnCreateDownloadsSubscriptionVariables = {
  filter?: ModelSubscriptionDownloadsFilterInput | null,
  owner?: string | null,
};

export type OnCreateDownloadsSubscription = {
  onCreateDownloads?:  {
    __typename: "Downloads",
    id: string,
    downloadscheduleID: string,
    status?: DownloadStatus | null,
    started_at?: string | null,
    finished_at?: string | null,
    messages?: Array< string | null > | null,
    createdAt: string,
    updatedAt: string,
    _version: number,
    _deleted?: boolean | null,
    _lastChangedAt: number,
    owner?: string | null,
  } | null,
};

export type OnUpdateDownloadsSubscriptionVariables = {
  filter?: ModelSubscriptionDownloadsFilterInput | null,
  owner?: string | null,
};

export type OnUpdateDownloadsSubscription = {
  onUpdateDownloads?:  {
    __typename: "Downloads",
    id: string,
    downloadscheduleID: string,
    status?: DownloadStatus | null,
    started_at?: string | null,
    finished_at?: string | null,
    messages?: Array< string | null > | null,
    createdAt: string,
    updatedAt: string,
    _version: number,
    _deleted?: boolean | null,
    _lastChangedAt: number,
    owner?: string | null,
  } | null,
};

export type OnDeleteDownloadsSubscriptionVariables = {
  filter?: ModelSubscriptionDownloadsFilterInput | null,
  owner?: string | null,
};

export type OnDeleteDownloadsSubscription = {
  onDeleteDownloads?:  {
    __typename: "Downloads",
    id: string,
    downloadscheduleID: string,
    status?: DownloadStatus | null,
    started_at?: string | null,
    finished_at?: string | null,
    messages?: Array< string | null > | null,
    createdAt: string,
    updatedAt: string,
    _version: number,
    _deleted?: boolean | null,
    _lastChangedAt: number,
    owner?: string | null,
  } | null,
};

export type OnCreateDownloadScheduleSubscriptionVariables = {
  filter?: ModelSubscriptionDownloadScheduleFilterInput | null,
  owner?: string | null,
};

export type OnCreateDownloadScheduleSubscription = {
  onCreateDownloadSchedule?:  {
    __typename: "DownloadSchedule",
    id: string,
    layer_url: string,
    format: Formats,
    access_key_id: string,
    secret_key: string,
    destination?: string | null,
    frequency: Frequency,
    Downloads?:  {
      __typename: "ModelDownloadsConnection",
      items:  Array< {
        __typename: "Downloads",
        id: string,
        downloadscheduleID: string,
        status?: DownloadStatus | null,
        started_at?: string | null,
        finished_at?: string | null,
        messages?: Array< string | null > | null,
        createdAt: string,
        updatedAt: string,
        _version: number,
        _deleted?: boolean | null,
        _lastChangedAt: number,
        owner?: string | null,
      } | null >,
      nextToken?: string | null,
      startedAt?: number | null,
    } | null,
    column_mapping?: string | null,
    job_name?: string | null,
    where?: string | null,
    boundary?: string | null,
    active?: boolean | null,
    days_of_the_week: Array< Days | null >,
    day_of_the_month?: number | null,
    time_of_day?: string | null,
    createdAt: string,
    updatedAt: string,
    _version: number,
    _deleted?: boolean | null,
    _lastChangedAt: number,
    owner?: string | null,
  } | null,
};

export type OnUpdateDownloadScheduleSubscriptionVariables = {
  filter?: ModelSubscriptionDownloadScheduleFilterInput | null,
  owner?: string | null,
};

export type OnUpdateDownloadScheduleSubscription = {
  onUpdateDownloadSchedule?:  {
    __typename: "DownloadSchedule",
    id: string,
    layer_url: string,
    format: Formats,
    access_key_id: string,
    secret_key: string,
    destination?: string | null,
    frequency: Frequency,
    Downloads?:  {
      __typename: "ModelDownloadsConnection",
      items:  Array< {
        __typename: "Downloads",
        id: string,
        downloadscheduleID: string,
        status?: DownloadStatus | null,
        started_at?: string | null,
        finished_at?: string | null,
        messages?: Array< string | null > | null,
        createdAt: string,
        updatedAt: string,
        _version: number,
        _deleted?: boolean | null,
        _lastChangedAt: number,
        owner?: string | null,
      } | null >,
      nextToken?: string | null,
      startedAt?: number | null,
    } | null,
    column_mapping?: string | null,
    job_name?: string | null,
    where?: string | null,
    boundary?: string | null,
    active?: boolean | null,
    days_of_the_week: Array< Days | null >,
    day_of_the_month?: number | null,
    time_of_day?: string | null,
    createdAt: string,
    updatedAt: string,
    _version: number,
    _deleted?: boolean | null,
    _lastChangedAt: number,
    owner?: string | null,
  } | null,
};

export type OnDeleteDownloadScheduleSubscriptionVariables = {
  filter?: ModelSubscriptionDownloadScheduleFilterInput | null,
  owner?: string | null,
};

export type OnDeleteDownloadScheduleSubscription = {
  onDeleteDownloadSchedule?:  {
    __typename: "DownloadSchedule",
    id: string,
    layer_url: string,
    format: Formats,
    access_key_id: string,
    secret_key: string,
    destination?: string | null,
    frequency: Frequency,
    Downloads?:  {
      __typename: "ModelDownloadsConnection",
      items:  Array< {
        __typename: "Downloads",
        id: string,
        downloadscheduleID: string,
        status?: DownloadStatus | null,
        started_at?: string | null,
        finished_at?: string | null,
        messages?: Array< string | null > | null,
        createdAt: string,
        updatedAt: string,
        _version: number,
        _deleted?: boolean | null,
        _lastChangedAt: number,
        owner?: string | null,
      } | null >,
      nextToken?: string | null,
      startedAt?: number | null,
    } | null,
    column_mapping?: string | null,
    job_name?: string | null,
    where?: string | null,
    boundary?: string | null,
    active?: boolean | null,
    days_of_the_week: Array< Days | null >,
    day_of_the_month?: number | null,
    time_of_day?: string | null,
    createdAt: string,
    updatedAt: string,
    _version: number,
    _deleted?: boolean | null,
    _lastChangedAt: number,
    owner?: string | null,
  } | null,
};
