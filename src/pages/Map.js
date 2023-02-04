import React, { useEffect, useRef, useState } from 'react'
import GoogleMapReact from 'google-map-react'
import useSupercluster from 'use-supercluster';



const Marker = ({ children }) => children;

const Map = () => {
    const mapRef = useRef();
    const [zoom, setZoom] = useState(10);
    const [locations, setLocations] = useState([]);
    const [bounds, setBounds] = useState(null);

    useEffect(() => {
        fetch('example data-set.json')
            .then(res => res.json())
            .then(data => setLocations(data.features))
            .catch(error => console.log(error))

    }, [])



    // console.log(locations);

    const points = locations.map(location => ({
        type: "Feature",
        properties: {
            cluster: false,
            locationId: locations.id,

        },
        geometry: {
            type: 'Point', coordinates: [
                parseFloat(location.geometry.coordinates[0]), parseFloat(location.geometry.coordinates[1])
            ]
        }
    }));

    const { clusters } = useSupercluster({
        points,
        bounds,
        zoom,
        options: { radius: 75, maxZoom: 20 }
    })

    console.log(clusters);

    // console.log(locations);

    return (

        <div style={{ height: '600px', width: '800px' }
        }>
            <GoogleMapReact
                bootstrapURLKeys={{ key: process.env.REACT_APP_GOOGLE_API }}
                defaultCenter={{ lat: 51.4904, lng: -0.27603 }}
                defaultZoom={10}
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
                            <Marker key={locations.id} lat={latitude} lng={longitude}>
                                <button className='pointer'>

                                    <img src='/map-pin.png' alt='pointer img' text={pointCount} />
                                </button>

                            </Marker>
                        )
                    }


                    return (
                        < Marker key={locations.id} lat={latitude} lng={longitude}
                        >
                            <button className='pointer'>
                                <img src='/map-pin.png' alt='pointer img' />
                            </button>
                        </Marker>
                    )

                })}

                {/* {locations.length && locations?.map(location => (

                    // console.log(location.geometry.coordinates[0], location.geometry.coordinates[1])
                    < Marker key={locations.id} lat={location.geometry.coordinates[1]} lng={location.geometry.coordinates[0]}
                    >
                        <button className='pointer'>
                            <img src='/map-pin.png' alt='pointer img' />
                        </button>
                    </Marker>
                ))} */}

            </GoogleMapReact>
        </div >
        // <LoadScript
        //     googleMapsApiKey="AIzaSyBssF2HcQWKoxPkEy5KYEyH3jwX-k3ZYgA"
        // >
        //     <GoogleMap
        //         mapContainerStyle={containerStyle}
        //         center={center}
        //         zoom={10}

        //         onZoomChanged={({ zoom, bounds }) => {
        //             setZoom(zoom);
        //             setBounds([
        //                 bounds.nw.lng,
        //                 bounds.se.lat,
        //                 bounds.se.lng,
        //                 bounds.nw.lat
        //             ])
        //         }}

        //     >
        //         {locations.length && locations?.map(location => (

        //             // console.log(location.geometry.coordinates[0], location.geometry.coordinates[1])
        //             < Marker key={location.id} lat={parseFloat(location.geometry.coordinates[0])} lng={parseFloat(location.geometry.coordinates[1])}
        //             >
        //                 <button className='pointer'>
        //                     {console.log('point')}
        //                     point
        //                     {/* <img src='/public/pointer.webp' alt='pointer img' /> */}
        //                 </button>
        //             </Marker>
        //         ))}
        //     </GoogleMap>
        // </LoadScript >
    )
}

export default React.memo(Map)