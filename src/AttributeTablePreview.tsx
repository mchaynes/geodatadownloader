import React, { useEffect, useMemo, useState } from 'react'
import { QueryResults } from './arcgis'
import { DataGrid, GridToolbarColumnsButton, GridToolbarContainer } from '@mui/x-data-grid';
import Box from '@mui/material/Box';
import Field from '@arcgis/core/layers/support/Field';
import EsriError from "@arcgis/core/core/Error";
import { setLoadingWhile } from './loading';
import { StatusAlert, useStatusAlert } from './StatusAlert';


export type AttributeTableProps = {
    queryResults: QueryResults
    selectedFields: string[]
    setSelectedFields: (fields: string[]) => void
    fields: Field[]
    where: string
}

function CustomFooter({ total, fetched }: { total: number, fetched: number }) {
    return (
        <Box>
            <Box sx={{ padding: '10px', display: 'flex', justifyContent: "flex-end" }}>
                Displaying {fetched} / {total} features
            </Box>
        </Box>
    )
}

export function AttributeTablePreview({ queryResults, fields, where, selectedFields, setSelectedFields }: AttributeTableProps) {

    const [loading, setLoading] = useState(false)
    const [totalFeaturesCount, setTotalFeaturesCount] = useState(0)
    const [alertProps, setAlertProps] = useStatusAlert("", undefined)
    const [rows, setRows] = useState<Row[]>([])


    useEffect(() => {
        async function setTotal() {
            setTotalFeaturesCount(await queryResults.getTotalCount(where))
        }
        void setTotal()
    }, [queryResults, where])

    // DataGrid needs column definitions to be memoized or defined out of render loop
    // We need access to 'fields' prop to figure out columns, so therefore 'useMemo' 
    const columns = useMemo(() => {
        return fields.map((field) => {
            return {
                field: field.name,
                headerName: field.name,
                minWidth: Math.max(field.length, 110),
            }
        })
    }, [fields]) ?? []

    useEffect(() => {
        async function loadPreview() {
            setLoadingWhile(async () => {
                try {
                    setTotalFeaturesCount(await queryResults.getTotalCount(where))
                    const featureSet = await queryResults.getPage(0, selectedFields, where)
                    const rows = featureSet.features?.map((feature, i) => {
                        const item: Row = { id: i }
                        fields.forEach(f => {
                            item[f.name] = feature.getAttribute(f.name)
                        })
                        return item
                    }) ?? []
                    setRows(rows)
                    setAlertProps("", undefined)
                } catch (e) {
                    console.error(e)
                    const { details } = e as EsriError
                    const { messages } = details as { messages: string[] }
                    setAlertProps(`Failed: ${messages}`, "error")
                    setRows([])
                    setTotalFeaturesCount(0)
                }
            }, setLoading)
        }
        void loadPreview()
    }, [selectedFields, queryResults, fields, where, setAlertProps])


    function Toolbar() {
        return (
            <GridToolbarContainer>
                <GridToolbarColumnsButton id="choose-columns-button" />
            </GridToolbarContainer>
        )
    }

    return (
        <Box>
            <StatusAlert
                {...alertProps}
            />
            <div style={{ height: 400, width: '100%' }}>
                <DataGrid
                    loading={loading}
                    pageSize={100}
                    localeText={{
                        toolbarColumns: "Choose Fields For Export"
                    }}
                    components={{
                        Toolbar: Toolbar,
                        Footer: CustomFooter
                    }}
                    componentsProps={{
                        footer: {
                            total: totalFeaturesCount,
                            fetched: Math.min(rows.length, 100), // mui datagrid is limited to 100 w/out pagination
                        }
                    }}
                    pagination
                    columnVisibilityModel={
                        fields.map(f => f.name) // take name of each field
                            .reduce((acc, cur) => ({ [cur]: selectedFields.includes(cur), ...acc }), {}) // if field is selected, set to true
                    }
                    onColumnVisibilityModelChange={
                        (model) => setSelectedFields(
                            Object.keys(model) // {"field1": true, "field2": false, ...}
                                .filter(k => model[k]) // only grab fields that are true
                                .reduce((acc, cur) => [...acc, cur], []) // flatten in to array ["field1"]
                        )
                    }
                    columns={columns}
                    rows={rows}
                />
            </div>
        </Box>
    )
}

type Row = {
    [key: string]: any
}

