import React, {useState, useEffect} from "react";
import GoogleMapReact from "google-map-react";
import { Paper, Typography, useMediaQuery } from '@material-ui/core';
import LocationOnOutlinedIcon from "@material-ui/icons/Place";
//import { red } from '@mui/material/colors';
import Rating from "@material-ui/lab";

import useStyle from './style';

import Loc from '../../data/map.json';
import { Marker } from "@react-google-maps/api";

const Map = ({ setCoordinates, setBounds, coordinates, currLoc, setChildClicked }) => {
    const classes = useStyle();
    const isMobile = useMediaQuery('(min-width: 600px');  

    
    const [userLocation, setUserLocation] = useState(null);
    
    useEffect(() => {
        navigator.geolocation.getCurrentPosition((position) => {
            setUserLocation({
                lat: position.coords.latitude,
                lng: position.coords.longitude,
            });
        });
    }, []);

    return (
        <div className={classes.mapContainer}>
            <GoogleMapReact
                bootstrapURLKeys={{ key: process.env.REACT_APP_GOOGLE_MAPS_API_KEY }}
                defaultCenter={coordinates}
                center={coordinates}
                defaultZoom={14}
                margin={[50, 50, 50, 50]}
                options={''}
                // onChange={(e) => {
                //     //console.log(e);
                //     setCoordinates({ lat: e.center.lat, lng: e.center.lng });
                //     setBounds({ ne: e.marginBounds.ne, sw: e.marginBounds.sw})
                // }}
                onChildClick={(child) => setChildClicked(child)}
            >
                {userLocation && 
                    <div 
                        className={classes.markerContainer}
                        lat={userLocation.lat}
                        lng={userLocation.lng}
                    >
                        <LocationOnOutlinedIcon style={{ fontSize: 40, color: 'red' }} elevation={4}/>
                    </div>
                }              
                {Loc.loc.map((place, i) => (
                    <div
                        className={classes.markerContainer}
                        lat={place.coordinates[0]}
                        lng={place.coordinates[1]}
                        key={i}
                    >
                        {/* <LocationOnOutlinedIcon color="primary" fontSize="large"/> */}
                        <Paper elevation={3} className={classes.paper}>
                            <Typography className={classes.typography} variant="subtitle2" gutterBottom>
                                {place.name}
                            </Typography>
                            <img
                                className={classes.pointer}
                                src={place.image}
                                alt={place.name}
                            />
                        </Paper>
                    </div>
                ))}
            </GoogleMapReact>
        </div>
    );
}

export default Map;