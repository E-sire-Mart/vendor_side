import React, { useState, useEffect } from 'react';
import { compose, withProps } from 'recompose';
import {
    withScriptjs,
    withGoogleMap,
    GoogleMap,
    Marker,
    InfoWindow,
} from 'react-google-maps';
import MDButton from 'components/MDButton';

const MapWithSearchBox = compose(
    withProps({
        googleMapURL: `https://maps.googleapis.com/maps/api/js?key=AIzaSyAyhe59yQB-GIm67ugZA4lXbnWiOFQ8H-I&libraries=places`,
        loadingElement: <div style={{ height: '100%' }} />,
        containerElement: <div style={{ height: '400px' }} />,
        mapElement: <div style={{ height: '100%' }} />,
    }),
    withScriptjs,
    withGoogleMap
)((props) => {
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [map, setMap] = useState(null);

    const getCurrentLocation = async () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const currentLocation = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                    };

                    setSelectedLocation(currentLocation);

                    // Ensure onSelectLocation prop is defined before calling
                    if (props.onSelectLocation) {
                        props.onSelectLocation(currentLocation);
                    }
                    // Center the map on the current location
                    if (map) {
                        map.panTo(currentLocation);
                    }
                },
                (error) => {
                    console.error('Error getting current location:', error);
                }
            );
        } else {
            console.error('Geolocation is not supported by this browser.');
        }
    };

    const handleMapClick = async (event) => {
        const clickedLocation = {
            lat: event.latLng.lat(),
            lng: event.latLng.lng(),
        };

        await setSelectedLocation(clickedLocation);

        // Ensure onSelectLocation prop is defined before calling
        if (props.onSelectLocation) {
            props.onSelectLocation(clickedLocation);
        }
    };

    useEffect(() => {
        if (props.google && !map) {
            const mapInstance = new props.google.maps.Map(document.getElementById('map'), {
                zoom: 8,
                center: { lat: 37.7749, lng: -122.4194 },
            });

            mapInstance.addListener('click', handleMapClick);

            // Pass the map instance to the state
            setMap(mapInstance);
        }
    }, [props.google, map, props.onSelectLocation]);

    return (
        <div>

            <MDButton variant="gradient" color="info" type="submit" onClick={getCurrentLocation} mb={2} p={2}>
                Get Current Location
            </MDButton>
            <GoogleMap
                defaultZoom={8}
                defaultCenter={{ lat: 37.7749, lng: -122.4194 }}
            >
                {selectedLocation && (
                    <Marker position={{ lat: selectedLocation.lat, lng: selectedLocation.lng }}>
                        <InfoWindow>
                            <div>
                                <strong>Current Location</strong>
                                <p>
                                    Latitude: {selectedLocation.lat}, Longitude: {selectedLocation.lng}
                                </p>
                            </div>
                        </InfoWindow>
                    </Marker>
                )}
            </GoogleMap>
        </div>
    );
});

export default MapWithSearchBox;
