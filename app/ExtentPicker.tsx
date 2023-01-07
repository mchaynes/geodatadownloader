import { useCallback } from 'react';
import Box from '@mui/material/Box'
import { useEffect, useRef, useState } from 'react'
import { setLoadingWhile } from './loading'
import { GeometryUpdateListener, parseGeometryFromString } from './arcgis'
import copy from 'clipboard-copy'


import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Edit from '@mui/icons-material/Edit';
import EditOff from '@mui/icons-material/EditOff'
import Geometry from '@arcgis/core/geometry/Geometry'
import { equals, union as geometryUnion } from '@arcgis/core/geometry/geometryEngine'
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer'
import Sketch from '@arcgis/core/widgets/Sketch'
import MapView from '@arcgis/core/views/MapView'
import EsriMap from '@arcgis/core/Map'
import FeatureLayer from '@arcgis/core/layers/FeatureLayer'
import FeatureEffect from '@arcgis/core/layers/support/FeatureEffect'
import FeatureFilter from '@arcgis/core/layers/support/FeatureFilter'
import Graphic from '@arcgis/core/Graphic'
import SimpleFillSymbol from "@arcgis/core/symbols/SimpleFillSymbol";
import { AlertType, StatusAlert } from './StatusAlert'
import CopyAll from '@mui/icons-material/CopyAll'
import InputAdornment from '@mui/material/InputAdornment'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'

const GEOMETRY_LINK = "https://developers.arcgis.com/documentation/common-data-types/geometry-objects.htm"
const esriDocLinkProps = (t: "POLYGON" | "ENVELOPE") => ({
    rel: "noreferrer",
    target: "_blank",
    href: `${GEOMETRY_LINK}#${t}`,
})

export type ExtentPickerProps = {
    defaultBoundaryExtent: string
    layer: FeatureLayer
    where: string
    onFilterGeometryChange: GeometryUpdateListener
}

export function ExtentPicker({ layer, where, onFilterGeometryChange, defaultBoundaryExtent }: ExtentPickerProps) {

    // Form State variables
    const [loading, setLoading] = useState(false)
    const [boundaryErrMsg, setBoundaryErrMsg] = useState("")
    const [boundaryAlertType, setBoundaryAlertType] = useState<AlertType>(undefined)
    const [textBoxDisabled, setTextBoxDisabled] = useState(false)
    const [textBoxValue, setTextBoxValue] = useState("")


    // ArcGIS Map State  variables
    const elRef = useRef(null)
    const [filterGeometry, setFilterGeometry] = useState<Geometry | undefined>(undefined)
    const [map] = useState(() => new EsriMap({
        basemap: "topo-vector"
    }))
    const [mapView] = useState(() => new MapView({
        map: map,
        center: [0, 0],
        zoom: 1,
    }))
    const [sketchLayer] = useState(() => new GraphicsLayer())
    const [sketch] = useState(() => new Sketch({
        layer: sketchLayer,
        view: mapView,
        creationMode: "update",
        availableCreateTools: ["polygon", "rectangle", "circle"],
        layout: "vertical",
    }))
    const [featureEffect, setFeatureEffect] = useState<FeatureEffect>(new FeatureEffect())

    // Updates filterGeometry and textBoxValue when sketchLayer is updated
    const onSketchUpdate = useCallback(() => {
        const sketchGeometries = sketchLayer.graphics
            ?.filter((g) => g?.geometry?.spatialReference !== undefined)
            .map((g) => g.geometry)
        // If there's any sketchGeometries defined, union those geometries into a single
        // filter geometry so the query can be updated
        if (sketchGeometries && sketchGeometries.length > 0) {
            const unionedGeometry = geometryUnion(sketchGeometries.toArray())
            setFilterGeometry(unionedGeometry)
            setTextBoxValue(JSON.stringify(unionedGeometry.toJSON()))
            setBoundaryErrMsg("")
            setTextBoxDisabled(true)
        } else {
            setFilterGeometry(undefined)
        }
    }, [sketchLayer])

    // Attaches map to ref
    useEffect(() => {
        async function attachView() {
            await setLoadingWhile(async () => {
                mapView.container = elRef.current as any
                await mapView.when()
                const extent = await layer?.queryExtent()
                await mapView.goTo(extent)
            }, setLoading)
        }
        void attachView()
    }, [layer, mapView, map])

    // Add sketch widget to map
    useEffect(() => {
        mapView.ui.add(sketch, "top-right")
        return () => mapView.ui.remove(sketch)
    }, [mapView, sketch])

    // Register update listen for new sketch geometries to set filterGeometry
    useEffect(() => {
        sketch.on("update", onSketchUpdate)
    }, [sketch, onSketchUpdate])

    // Add the FeatureLayer that the sketch widget uses to the map
    useEffect(() => {
        map.add(sketchLayer)
    }, [map, sketchLayer])

    useEffect(() => {
        map.add(layer)
        return () => { map.remove(layer) }
    }, [map, layer])


    // Grayscale out non-included layers.
    useEffect(() => {
        setFeatureEffect(new FeatureEffect({
            filter: new FeatureFilter({
                geometry: filterGeometry,
                spatialRelationship: "intersects",
                where: where
            }),
            excludedEffect: "grayscale(100%) opacity(30%)"
        }))
    }, [filterGeometry, where])

    // Apply featureEffect to layer on update
    useEffect(() => {
        layer.featureEffect = featureEffect
    }, [featureEffect, layer])

    // Notify listener when filterGeometry changes
    useEffect(() => {
        onFilterGeometryChange(filterGeometry)
    }, [onFilterGeometryChange, filterGeometry])


    // Test if new text in TextField contains filter geometry
    // If so, update filterGeometry and remove any previous geometries on the layer
    const onTextBoxChange = useCallback((val: string) => {
        setTextBoxValue(val)
        setLoadingWhile(async () => {
            try {
                const geo = parseGeometryFromString(val)
                // If the change hasn't actually changed the geometry, bail out of expensive op early
                if (filterGeometry && equals(geo, filterGeometry)) {
                    return
                }
                sketchLayer.removeAll()
                sketchLayer.add(new Graphic({
                    symbol: new SimpleFillSymbol({
                        style: "solid",
                        color: [150, 150, 150, 0.2],
                        outline: {
                            color: "black",
                            width: 2,
                        }
                    }),
                    geometry: geo,
                }))
                setFilterGeometry(geo)
                await mapView.goTo(geo)
                // we made it here, so reset the alertType so it doesn't show
                setBoundaryAlertType(undefined)
            } catch (e) {
                // We can't parse text for some reason, so assume no filterGeometry 
                setFilterGeometry(undefined)
                sketchLayer.removeAll()
                // If there's text in the TextField and we're here, that's an error so let the user know
                if (val) {
                    const err = e as Error
                    setBoundaryErrMsg(err.message)
                    setBoundaryAlertType("error")
                }
            }
        }, setLoading)

    }, [filterGeometry, sketchLayer, mapView, setLoading])

    useEffect(() => {
        if (defaultBoundaryExtent) {
            onTextBoxChange(defaultBoundaryExtent)
        }
    }, [defaultBoundaryExtent, onTextBoxChange])

    // ExtentAdornment contains an EditToggle and a Copy to Clipboard button 
    function BoundaryAdornment({ content }: { content: string }) {
        const [copied, setCopied] = useState(false)
        const handleCopyClick = async () => {
            await copy(content)
            setCopied(true)
        }
        const handleEditClick = () => {
            setTextBoxDisabled((d) => !d)
        }
        return (
            <InputAdornment position="end">
                <Stack direction="row">
                    <Tooltip
                        placement="top-start"
                        title={copied ? "Copied" : "Click to Copy"}
                        TransitionProps={{
                            onExited: () => setCopied(false),
                        }}
                    >
                        <IconButton
                            aria-label="copy extent to clipboard"
                            onClick={handleCopyClick}
                        >
                            <CopyAll />
                        </IconButton>
                    </Tooltip>
                    <Tooltip
                        placement="top-start"
                        title={textBoxDisabled ? "Enable editing" : "Disable editing"}
                    >
                        <IconButton
                            id="extent-edit-toggle"
                            aria-label="toggle extent textbox editing"
                            onClick={handleEditClick}
                        >
                            {textBoxDisabled ? <Edit /> : <EditOff />}
                        </IconButton>
                    </Tooltip>
                </Stack>
            </InputAdornment>
        )
    }

    return (
        <Box sx={{ ml: 1, mt: 1 }}>
            <div ref={elRef} style={{ height: 500, width: '100%' }} />
            <Box sx={{ mt: 2, mb: 2, ml: 1, mr: 1 }}>
                <TextField
                    id="boundary-text-field"
                    variant="outlined"
                    label="Boundary"
                    fullWidth
                    disabled={textBoxDisabled}
                    value={textBoxValue}
                    onChange={(e) => onTextBoxChange(e.currentTarget.value)}
                    InputProps={{
                        endAdornment: <BoundaryAdornment content={textBoxValue} />
                    }}
                />
            </Box>

            <StatusAlert
                msg={
                    <div>
                            Error parsing your boundary, you probably mistyped.
                            Supported Formats:{' '}
                        <a {...esriDocLinkProps("POLYGON")}>Polygon</a>, {' '}
                        <a {...esriDocLinkProps("ENVELOPE")}>Envelope</a>
                        <p />
                        <code>{'    '}{boundaryErrMsg}</code>
                    </div>
                }
                alertType={boundaryAlertType}
                loading={loading}
            />
        </Box>
    )
}

