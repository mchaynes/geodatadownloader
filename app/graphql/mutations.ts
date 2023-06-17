/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const createLayer = /* GraphQL */ `
  mutation CreateLayer(
    $input: CreateLayerInput!
    $condition: ModelLayerConditionInput
  ) {
    createLayer(input: $input, condition: $condition) {
      id
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
      __typename
    }
  }
`;
export const updateLayer = /* GraphQL */ `
  mutation UpdateLayer(
    $input: UpdateLayerInput!
    $condition: ModelLayerConditionInput
  ) {
    updateLayer(input: $input, condition: $condition) {
      id
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
      __typename
    }
  }
`;
export const deleteLayer = /* GraphQL */ `
  mutation DeleteLayer(
    $input: DeleteLayerInput!
    $condition: ModelLayerConditionInput
  ) {
    deleteLayer(input: $input, condition: $condition) {
      id
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
      __typename
    }
  }
`;
export const createDownloads = /* GraphQL */ `
  mutation CreateDownloads(
    $input: CreateDownloadsInput!
    $condition: ModelDownloadsConditionInput
  ) {
    createDownloads(input: $input, condition: $condition) {
      id
      downloadscheduleID
      status
      started_at
      finished_at
      messages
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
      owner
      __typename
    }
  }
`;
export const updateDownloads = /* GraphQL */ `
  mutation UpdateDownloads(
    $input: UpdateDownloadsInput!
    $condition: ModelDownloadsConditionInput
  ) {
    updateDownloads(input: $input, condition: $condition) {
      id
      downloadscheduleID
      status
      started_at
      finished_at
      messages
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
      owner
      __typename
    }
  }
`;
export const deleteDownloads = /* GraphQL */ `
  mutation DeleteDownloads(
    $input: DeleteDownloadsInput!
    $condition: ModelDownloadsConditionInput
  ) {
    deleteDownloads(input: $input, condition: $condition) {
      id
      downloadscheduleID
      status
      started_at
      finished_at
      messages
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
      owner
      __typename
    }
  }
`;
export const createDownloadSchedule = /* GraphQL */ `
  mutation CreateDownloadSchedule(
    $input: CreateDownloadScheduleInput!
    $condition: ModelDownloadScheduleConditionInput
  ) {
    createDownloadSchedule(input: $input, condition: $condition) {
      id
      layer_url
      format
      access_key_id
      secret_key
      destination
      frequency
      Downloads {
        items {
          id
          downloadscheduleID
          status
          started_at
          finished_at
          messages
          createdAt
          updatedAt
          _version
          _deleted
          _lastChangedAt
          owner
          __typename
        }
        nextToken
        startedAt
        __typename
      }
      column_mapping
      job_name
      where
      boundary
      active
      days_of_the_week
      day_of_the_month
      time_of_day
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
      owner
      __typename
    }
  }
`;
export const updateDownloadSchedule = /* GraphQL */ `
  mutation UpdateDownloadSchedule(
    $input: UpdateDownloadScheduleInput!
    $condition: ModelDownloadScheduleConditionInput
  ) {
    updateDownloadSchedule(input: $input, condition: $condition) {
      id
      layer_url
      format
      access_key_id
      secret_key
      destination
      frequency
      Downloads {
        items {
          id
          downloadscheduleID
          status
          started_at
          finished_at
          messages
          createdAt
          updatedAt
          _version
          _deleted
          _lastChangedAt
          owner
          __typename
        }
        nextToken
        startedAt
        __typename
      }
      column_mapping
      job_name
      where
      boundary
      active
      days_of_the_week
      day_of_the_month
      time_of_day
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
      owner
      __typename
    }
  }
`;
export const deleteDownloadSchedule = /* GraphQL */ `
  mutation DeleteDownloadSchedule(
    $input: DeleteDownloadScheduleInput!
    $condition: ModelDownloadScheduleConditionInput
  ) {
    deleteDownloadSchedule(input: $input, condition: $condition) {
      id
      layer_url
      format
      access_key_id
      secret_key
      destination
      frequency
      Downloads {
        items {
          id
          downloadscheduleID
          status
          started_at
          finished_at
          messages
          createdAt
          updatedAt
          _version
          _deleted
          _lastChangedAt
          owner
          __typename
        }
        nextToken
        startedAt
        __typename
      }
      column_mapping
      job_name
      where
      boundary
      active
      days_of_the_week
      day_of_the_month
      time_of_day
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
      owner
      __typename
    }
  }
`;
