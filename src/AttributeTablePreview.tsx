import { useEffect, useMemo, useState } from 'react'
import { QueryResults } from './arcgis'
import { DataGrid, GridColumnVisibilityChangeParams, GridToolbarColumnsButton, GridToolbarContainer } from '@mui/x-data-grid';
import Box from '@mui/material/Box';
import Field from '@arcgis/core/layers/support/Field';
import { setLoadingWhile } from './loading';


export type AttributeTableProps = {
    queryResults?: QueryResults
    fields: Field[]
    onFieldSelectionChange: (_: string[]) => void
}

type ExportedField = {
    name: string
    selected: boolean
}

function CustomFooter({ total }: { total: number }) {
    return (
        <Box>
            <Box sx={{ padding: '10px', display: 'flex', justifyContent: "flex-end" }}>
                Total Features {total}
            </Box>
        </Box>
    )
}

export function AttributeTablePreview({ queryResults: paginator, fields, onFieldSelectionChange }: AttributeTableProps) {

    const [loading, setLoading] = useState(false)
    const [totalFeaturesCount, setTotalFeaturesCount] = useState(0)
    const [rows, setRows] = useState<Row[]>([])
    const [fieldsToExport, setFieldsToExport] = useState<ExportedField[]>(() => {
        // all fields are selected by default 
        return fields.map(f => ({ name: f.name, selected: true }))
    })

    // DataGrid needs column definitions to be memoized or defined out of render loop
    // We need access to 'fields' prop to figure out columns, so therefore 'useMemo' 
    const columns = useMemo(() => {
        return fields.map((field) => {
            return {
                field: field.name,
                headerName: field.name,
                minWidth: field.length,
            }
        })
    }, [fields]) ?? []

    useEffect(() => {
        async function loadPreview() {
            if (paginator) {
                setLoadingWhile(async () => {
                    const featureSet = await paginator.getPage(0, exportedFieldsToOutFields(fieldsToExport))
                    const rows = featureSet?.features?.map((feature, i) => {
                        const item: Row = { id: i }
                        fields.forEach(f => {
                            item[f.name] = feature.getAttribute(f.name)
                        })
                        return item
                    }) ?? []
                    setRows(rows)
                    setTotalFeaturesCount(await paginator.getTotalCount())
                }, setLoading)
            }
        }
        void loadPreview()
    }, [paginator, fieldsToExport, fields])

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
            <div style={{ height: 400, width: '100%' }}>
                <DataGrid
                    loading={loading}
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
                        }
                    }}
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

