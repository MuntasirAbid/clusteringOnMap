import React, { useEffect, useRef, useState } from 'react'
import GoogleMapReact from 'google-map-react'
import useSupercluster from 'use-supercluster';

const Marker = ({ children }) => children;

const Map = () => {
    const mapRef = useRef();
    const [showTooltip, setShowTooltip] = useState(undefined);
    const [zoom, setZoom] = useState(7);
    const [locations, setLocations] = useState([]);
    const [bounds, setBounds] = useState(null);

    useEffect(() => {
        fetch('example data-set.json')
            .then(res => res.json())
            .then(data => setLocations(data.features))
            .catch(error => console.log(error))

    }, [])

    const points = locations.map(location => ({
        type: "Feature",

        properties: {
            cluster: false,
            locationId: location.properties.id,

        },
        geometry: {
            type: 'Point', coordinates: [
                parseFloat(location.geometry.coordinates[0]), parseFloat(location.geometry.coordinates[1])
            ]
        }
    }));


    const { clusters, supercluster } = useSupercluster({
        points,
        bounds,
        zoom,
        options: { radius: 75, maxZoom: 20 }
    })

    return (

        <div style={{ height: '600px', width: '800px' }
        }>
            <GoogleMapReact
                bootstrapURLKeys={{ key: 'AIzaSyBssF2HcQWKoxPkEy5KYEyH3jwX-k3ZYgA' }}
                defaultCenter={{ lat: 51.4904, lng: -0.27603 }}
                defaultZoom={7}
                yesIWantToUseGoogleMapApiInternals
                onGoogleApiLoaded={({ map }) => {
                    mapRef.current = map;
                }}
                onChange={({ zoom, bounds }) => {
                    setZoom(zoom)
                    setBounds([
                        bounds.nw.lng,
                        bounds.se.lat,
                        bounds.se.lng,
                        bounds.nw.lat
                    ])
                }}

            >
                {clusters.map(cluster => {
                    const [longitude, latitude] = cluster.geometry.coordinates;
                    const {
                        cluster: isCluster,
                        point_count: pointCount
                    } = cluster.properties;

                    if (isCluster) {
                        return (
                            <Marker key={cluster.properties.locationId || cluster.id} lat={latitude} lng={longitude}>
                                <div className='cluster-point' style={{
                                    width: `${10 + (pointCount / points.length) * 20}px`,
                                    height: `${10 + (pointCount / points.length) * 20}px`
                                }}
                                    onClick={() => {
                                        const zoomingView = Math.min(
                                            supercluster.getClusterExpansionZoom(cluster.id),
                                            20
                                        );
                                        mapRef.current.setZoom(zoomingView);
                                        mapRef.current.panTo({ lat: latitude, lng: longitude })
                                    }}
                                >
                                    {pointCount}
                                </div>

                            </Marker>
                        )
                    }

                    return (
                        <Marker key={cluster.properties.locationId || cluster.id} lat={latitude} lng={longitude}
                        >
                            <button className='pointer' onClick={() => {

                                setShowTooltip(cluster.properties.locationId);
                            }}>
                                <img src='/map-pin.png' alt='pointer img' />
                            </button>
                            {showTooltip === cluster.properties.locationId && <div className='tooltip_bg'>Id:{cluster.properties.locationId}</div>}

                        </Marker>
                    )

                })}
            </GoogleMapReact>
        </div >

    )
}

export default React.memo(Map)
