/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const onCreateDownloads = /* GraphQL */ `
  subscription OnCreateDownloads(
    $filter: ModelSubscriptionDownloadsFilterInput
    $owner: String
  ) {
    onCreateDownloads(filter: $filter, owner: $owner) {
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
export const onUpdateDownloads = /* GraphQL */ `
  subscription OnUpdateDownloads(
    $filter: ModelSubscriptionDownloadsFilterInput
    $owner: String
  ) {
    onUpdateDownloads(filter: $filter, owner: $owner) {
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
export const onDeleteDownloads = /* GraphQL */ `
  subscription OnDeleteDownloads(
    $filter: ModelSubscriptionDownloadsFilterInput
    $owner: String
  ) {
    onDeleteDownloads(filter: $filter, owner: $owner) {
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
export const onCreateDownloadSchedule = /* GraphQL */ `
  subscription OnCreateDownloadSchedule(
    $filter: ModelSubscriptionDownloadScheduleFilterInput
    $owner: String
  ) {
    onCreateDownloadSchedule(filter: $filter, owner: $owner) {
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
      start_at
      column_mapping
      job_name
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
export const onUpdateDownloadSchedule = /* GraphQL */ `
  subscription OnUpdateDownloadSchedule(
    $filter: ModelSubscriptionDownloadScheduleFilterInput
    $owner: String
  ) {
    onUpdateDownloadSchedule(filter: $filter, owner: $owner) {
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
      start_at
      column_mapping
      job_name
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
export const onDeleteDownloadSchedule = /* GraphQL */ `
  subscription OnDeleteDownloadSchedule(
    $filter: ModelSubscriptionDownloadScheduleFilterInput
    $owner: String
  ) {
    onDeleteDownloadSchedule(filter: $filter, owner: $owner) {
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
      start_at
      column_mapping
      job_name
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
