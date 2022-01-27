import React, { useEffect, useMemo, useState } from 'react'
import { QueryResults } from './arcgis'
import { DataGrid, GridColumnVisibilityChangeParams, GridToolbarColumnsButton, GridToolbarContainer } from '@mui/x-data-grid';
import Box from '@mui/material/Box';
import Field from '@arcgis/core/layers/support/Field';
import { setLoadingWhile } from './loading';
import { StatusAlert, useStatusAlert } from './StatusAlert';


export type AttributeTableProps = {
    queryResults: QueryResults
    fields: Field[]
    onFieldSelectionChange: (_: string[]) => void
    where: string
}

type ExportedField = {
    name: string
    selected: boolean
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

export function AttributeTablePreview({ queryResults, fields, where, onFieldSelectionChange }: AttributeTableProps) {

    const [loading, setLoading] = useState(false)
    const [totalFeaturesCount, setTotalFeaturesCount] = useState(0)
    const [alertProps, setAlertProps] = useStatusAlert("", undefined)
    const [rows, setRows] = useState<Row[]>([])
    const [fieldsToExport, setFieldsToExport] = useState<ExportedField[]>(() => {
        // all fields are selected by default 
        return fields.map(f => ({ name: f.name, selected: true }))
    })

    useEffect(() => {
        setFieldsToExport(fields.map(f => ({ name: f.name, selected: true })))
    }, [fields])

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
                    const featureSet = await queryResults.getPage(0, exportedFieldsToOutFields(fieldsToExport), where)
                    const rows = featureSet?.features?.map((feature, i) => {
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
                    const err = e as Error
                    setAlertProps(`Failed: ${err.message}`, "error")
                    setRows([])
                    setTotalFeaturesCount(0)
                }
            }, setLoading)
        }
        void loadPreview()
    }, [queryResults, fieldsToExport, fields, where, setAlertProps])

    useEffect(() => {
        onFieldSelectionChange(exportedFieldsToOutFields(fieldsToExport))
    }, [fieldsToExport, onFieldSelectionChange])

    function exportedFieldsToOutFields(exportedFields: ExportedField[]) {
        return exportedFields.filter(f => f.selected).map(f => f.name)
    }

    function onColumnVisibilityChange({ field, isVisible }: GridColumnVisibilityChangeParams) {
        setFieldsToExport((prevState) => {
            return prevState.map(f => ({
                name: f.name,
                // if the column name matches, set selected status to isVisible. Otherwise keep the same
                selected: f.name === field ? isVisible : f.selected
            }))
        })
    }

    function Toolbar() {
        return (
            <GridToolbarContainer>
                <GridToolbarColumnsButton />
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
                    onColumnVisibilityChange={onColumnVisibilityChange}
                    columns={columns}
                    rows={loading ? [] : rows}
                />
            </div>
        </Box>
    )
}

type Row = {
    [key: string]: any
}

