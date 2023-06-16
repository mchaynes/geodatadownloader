/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const getDownloads = /* GraphQL */ `
  query GetDownloads($id: ID!) {
    getDownloads(id: $id) {
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
export const listDownloads = /* GraphQL */ `
  query ListDownloads(
    $filter: ModelDownloadsFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listDownloads(filter: $filter, limit: $limit, nextToken: $nextToken) {
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
  }
`;
export const syncDownloads = /* GraphQL */ `
  query SyncDownloads(
    $filter: ModelDownloadsFilterInput
    $limit: Int
    $nextToken: String
    $lastSync: AWSTimestamp
  ) {
    syncDownloads(
      filter: $filter
      limit: $limit
      nextToken: $nextToken
      lastSync: $lastSync
    ) {
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
  }
`;
export const downloadsByDownloadscheduleID = /* GraphQL */ `
  query DownloadsByDownloadscheduleID(
    $downloadscheduleID: ID!
    $sortDirection: ModelSortDirection
    $filter: ModelDownloadsFilterInput
    $limit: Int
    $nextToken: String
  ) {
    downloadsByDownloadscheduleID(
      downloadscheduleID: $downloadscheduleID
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
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
  }
`;
export const getDownloadSchedule = /* GraphQL */ `
  query GetDownloadSchedule($id: ID!) {
    getDownloadSchedule(id: $id) {
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
export const listDownloadSchedules = /* GraphQL */ `
  query ListDownloadSchedules(
    $filter: ModelDownloadScheduleFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listDownloadSchedules(
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        id
        layer_url
        format
        access_key_id
        secret_key
        destination
        frequency
        Downloads {
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
      nextToken
      startedAt
      __typename
    }
  }
`;
export const syncDownloadSchedules = /* GraphQL */ `
  query SyncDownloadSchedules(
    $filter: ModelDownloadScheduleFilterInput
    $limit: Int
    $nextToken: String
    $lastSync: AWSTimestamp
  ) {
    syncDownloadSchedules(
      filter: $filter
      limit: $limit
      nextToken: $nextToken
      lastSync: $lastSync
    ) {
      items {
        id
        layer_url
        format
        access_key_id
        secret_key
        destination
        frequency
        Downloads {
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
      nextToken
      startedAt
      __typename
    }
  }
`;
