import { useEffect, useState } from 'react'
import Divider from '@mui/material/Divider'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import { Arcgis, QueryResults } from './arcgis'
import { Downloader } from './Downloader'
import { AttributeTablePreview } from './AttributeTablePreview'
import { PickLayer } from './PickLayer'
import { FileHandler } from './FileHandler'
import { ExtentPicker } from './ExtentPicker'
import Geometry from '@arcgis/core/geometry/Geometry'


const paperSx = { my: { xs: 3, md: 6 }, p: { xs: 2, md: 3 } }

export type WorkflowProps = {
    arc: Arcgis
    fileHandler: FileHandler
}

export function Workflow({ arc, fileHandler }: WorkflowProps) {
    const [layerLoaded, setLayerLoaded] = useState(false)
    return (
        <Paper variant="outlined" sx={paperSx}>
            <SectionHeader header="Layer Info" />
            <PickLayer
                onSuccess={() => setLayerLoaded(true)}
                loadLayer={arc.loadLayer}
            />
            {layerLoaded && (
                <WorkflowItems
                    arc={arc}
                    fileHandler={fileHandler}
                />
            )}
        </Paper>
    )
}

function WorkflowItems({ arc, fileHandler }: WorkflowProps) {
    const [selectedFields, setSelectedFields] = useState<string[]>(arc.getFields()?.map(f => f.name) ?? [])
    const [filterExtent, setFilterExtent] = useState<Geometry | undefined>(undefined)
    const [queryResults, setQueryResults] = useState<QueryResults>(() => {
        return new QueryResults(arc.getLayer(), filterExtent)
    })

    useEffect(() => {
        arc.onNewFilterGeometry((g) => {
            setFilterExtent(g)
        })
    }, [arc])


    useEffect(() => {
        setQueryResults(new QueryResults(arc.getLayer(), filterExtent, 500))
    }, [filterExtent, arc])
    return (
        <div>
            <SectionDivider />
            <SectionHeader header="Draw Extent (if you want)" />
            <ExtentPicker
                attachMap={arc.attachView}
            />
            <SectionDivider />
            <SectionHeader header="Attribute Table Preview" />
            <AttributeTablePreview
                onFieldSelectionChange={setSelectedFields}
                queryResults={queryResults}
                fields={arc.getFields() ?? []}
            />
            <SectionDivider />
            <SectionHeader header="Download Options" />
            <Downloader
                fileHandler={fileHandler}
                outFields={selectedFields}
                queryResults={queryResults}
            />
        </div>
    )
}

type SectionHeaderProps = {
    header: string
}

function SectionHeader({ header }: SectionHeaderProps) {
    return (
        <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>{header}</Typography>
    )
}

function SectionDivider() {
    return (
        <Divider sx={{ mt: 3, mb: 3 }}></Divider>
    )
}