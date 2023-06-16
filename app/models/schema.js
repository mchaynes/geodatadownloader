export const schema = {
    "models": {
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
                    "isRequired": false,
                    "attributes": []
                },
                "format": {
                    "name": "format",
                    "isArray": false,
                    "type": {
                        "enum": "Formats"
                    },
                    "isRequired": false,
                    "attributes": []
                },
                "access_key_id": {
                    "name": "access_key_id",
                    "isArray": false,
                    "type": "String",
                    "isRequired": false,
                    "attributes": []
                },
                "secret_key": {
                    "name": "secret_key",
                    "isArray": false,
                    "type": "String",
                    "isRequired": false,
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
                    "isRequired": false,
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
                "start_at": {
                    "name": "start_at",
                    "isArray": false,
                    "type": "String",
                    "isRequired": false,
                    "attributes": []
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
        "Frequency": {
            "name": "Frequency",
            "values": [
                "DAILY",
                "WEEKLY",
                "MONTHLY"
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
    "version": "1ea3b7841d3886494140c2dd8a6f2110"
};