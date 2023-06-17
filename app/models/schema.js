export const schema = {
    "models": {
        "Layer": {
            "name": "Layer",
            "fields": {
                "id": {
                    "name": "id",
                    "isArray": false,
                    "type": "ID",
                    "isRequired": true,
                    "attributes": []
                },
                "createdAt": {
                    "name": "createdAt",
                    "isArray": false,
                    "type": "AWSDateTime",
                    "isRequired": false,
                    "attributes": [],
                    "isReadOnly": true
                },
                "updatedAt": {
                    "name": "updatedAt",
                    "isArray": false,
                    "type": "AWSDateTime",
                    "isRequired": false,
                    "attributes": [],
                    "isReadOnly": true
                }
            },
            "syncable": true,
            "pluralName": "Layers",
            "attributes": [
                {
                    "type": "model",
                    "properties": {}
                },
                {
                    "type": "auth",
                    "properties": {
                        "rules": [
                            {
                                "allow": "private",
                                "operations": [
                                    "create",
                                    "update",
                                    "delete",
                                    "read"
                                ]
                            }
                        ]
                    }
                }
            ]
        },
        "Downloads": {
            "name": "Downloads",
            "fields": {
                "id": {
                    "name": "id",
                    "isArray": false,
                    "type": "ID",
                    "isRequired": true,
                    "attributes": []
                },
                "downloadscheduleID": {
                    "name": "downloadscheduleID",
                    "isArray": false,
                    "type": "ID",
                    "isRequired": true,
                    "attributes": []
                },
                "status": {
                    "name": "status",
                    "isArray": false,
                    "type": {
                        "enum": "DownloadStatus"
                    },
                    "isRequired": false,
                    "attributes": []
                },
                "started_at": {
                    "name": "started_at",
                    "isArray": false,
                    "type": "AWSDateTime",
                    "isRequired": false,
                    "attributes": []
                },
                "finished_at": {
                    "name": "finished_at",
                    "isArray": false,
                    "type": "AWSDateTime",
                    "isRequired": false,
                    "attributes": []
                },
                "messages": {
                    "name": "messages",
                    "isArray": true,
                    "type": "String",
                    "isRequired": false,
                    "attributes": [],
                    "isArrayNullable": true
                },
                "createdAt": {
                    "name": "createdAt",
                    "isArray": false,
                    "type": "AWSDateTime",
                    "isRequired": false,
                    "attributes": [],
                    "isReadOnly": true
                },
                "updatedAt": {
                    "name": "updatedAt",
                    "isArray": false,
                    "type": "AWSDateTime",
                    "isRequired": false,
                    "attributes": [],
                    "isReadOnly": true
                }
            },
            "syncable": true,
            "pluralName": "Downloads",
            "attributes": [
                {
                    "type": "model",
                    "properties": {}
                },
                {
                    "type": "key",
                    "properties": {
                        "name": "byDownloadSchedule",
                        "fields": [
                            "downloadscheduleID"
                        ]
                    }
                },
                {
                    "type": "auth",
                    "properties": {
                        "rules": [
                            {
                                "provider": "userPools",
                                "ownerField": "owner",
                                "allow": "owner",
                                "identityClaim": "cognito:username",
                                "operations": [
                                    "create",
                                    "update",
                                    "delete",
                                    "read"
                                ]
                            }
                        ]
                    }
                }
            ]
        },
        "DownloadSchedule": {
            "name": "DownloadSchedule",
            "fields": {
                "id": {
                    "name": "id",
                    "isArray": false,
                    "type": "ID",
                    "isRequired": true,
                    "attributes": []
                },
                "layer_url": {
                    "name": "layer_url",
                    "isArray": false,
                    "type": "String",
                    "isRequired": true,
                    "attributes": []
                },
                "format": {
                    "name": "format",
                    "isArray": false,
                    "type": {
                        "enum": "Formats"
                    },
                    "isRequired": true,
                    "attributes": []
                },
                "access_key_id": {
                    "name": "access_key_id",
                    "isArray": false,
                    "type": "String",
                    "isRequired": true,
                    "attributes": []
                },
                "secret_key": {
                    "name": "secret_key",
                    "isArray": false,
                    "type": "String",
                    "isRequired": true,
                    "attributes": []
                },
                "destination": {
                    "name": "destination",
                    "isArray": false,
                    "type": "String",
                    "isRequired": false,
                    "attributes": []
                },
                "frequency": {
                    "name": "frequency",
                    "isArray": false,
                    "type": {
                        "enum": "Frequency"
                    },
                    "isRequired": true,
                    "attributes": []
                },
                "Downloads": {
                    "name": "Downloads",
                    "isArray": true,
                    "type": {
                        "model": "Downloads"
                    },
                    "isRequired": false,
                    "attributes": [],
                    "isArrayNullable": true,
                    "association": {
                        "connectionType": "HAS_MANY",
                        "associatedWith": [
                            "downloadscheduleID"
                        ]
                    }
                },
                "column_mapping": {
                    "name": "column_mapping",
                    "isArray": false,
                    "type": "AWSJSON",
                    "isRequired": false,
                    "attributes": []
                },
                "job_name": {
                    "name": "job_name",
                    "isArray": false,
                    "type": "String",
                    "isRequired": false,
                    "attributes": []
                },
                "where": {
                    "name": "where",
                    "isArray": false,
                    "type": "String",
                    "isRequired": false,
                    "attributes": []
                },
                "boundary": {
                    "name": "boundary",
                    "isArray": false,
                    "type": "String",
                    "isRequired": false,
                    "attributes": []
                },
                "active": {
                    "name": "active",
                    "isArray": false,
                    "type": "Boolean",
                    "isRequired": false,
                    "attributes": []
                },
                "days_of_the_week": {
                    "name": "days_of_the_week",
                    "isArray": true,
                    "type": {
                        "enum": "Days"
                    },
                    "isRequired": false,
                    "attributes": [],
                    "isArrayNullable": false
                },
                "day_of_the_month": {
                    "name": "day_of_the_month",
                    "isArray": false,
                    "type": "Int",
                    "isRequired": false,
                    "attributes": []
                },
                "time_of_day": {
                    "name": "time_of_day",
                    "isArray": false,
                    "type": "AWSTime",
                    "isRequired": false,
                    "attributes": []
                },
                "createdAt": {
                    "name": "createdAt",
                    "isArray": false,
                    "type": "AWSDateTime",
                    "isRequired": false,
                    "attributes": [],
                    "isReadOnly": true
                },
                "updatedAt": {
                    "name": "updatedAt",
                    "isArray": false,
                    "type": "AWSDateTime",
                    "isRequired": false,
                    "attributes": [],
                    "isReadOnly": true
                }
            },
            "syncable": true,
            "pluralName": "DownloadSchedules",
            "attributes": [
                {
                    "type": "model",
                    "properties": {}
                },
                {
                    "type": "auth",
                    "properties": {
                        "rules": [
                            {
                                "provider": "userPools",
                                "ownerField": "owner",
                                "allow": "owner",
                                "identityClaim": "cognito:username",
                                "operations": [
                                    "create",
                                    "update",
                                    "delete",
                                    "read"
                                ]
                            }
                        ]
                    }
                }
            ]
        }
    },
    "enums": {
        "Days": {
            "name": "Days",
            "values": [
                "SUNDAY",
                "MONDAY",
                "TUESDAY",
                "WEDNESDAY",
                "THURSDAY",
                "FRIDAY",
                "SATURDAY"
            ]
        },
        "Frequency": {
            "name": "Frequency",
            "values": [
                "DAILY",
                "WEEKLY",
                "MONTHLY",
                "HOURLY"
            ]
        },
        "DownloadStatus": {
            "name": "DownloadStatus",
            "values": [
                "STARTED",
                "PENDING",
                "SUCCESSFUL",
                "FAILED"
            ]
        },
        "Formats": {
            "name": "Formats",
            "values": [
                "PMTILES",
                "GPKG",
                "GEOJSON",
                "SHP"
            ]
        }
    },
    "nonModels": {},
    "codegenVersion": "3.4.4",
    "version": "e37bbcab5858bdaae17852ba62d592ad"
};