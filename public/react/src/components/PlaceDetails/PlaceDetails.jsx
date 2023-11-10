import React from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Chip,
} from '@material-ui/core';
import LocationOnIcon from '@material-ui/icons/LocationOn';
import PhoneIcon from '@material-ui/icons/Phone';
import WebIcon from '@material-ui/icons/Language';
import Rating from '@material-ui/lab/Rating';

import useStyles from './style';

const PlaceDetail = ({ place, selected, refProp }) => {
  const classes = useStyles();

  console.log(selected);

  if (selected) {
    refProp.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    console.log(refProp);
  }

  return (
    <Card elevation={6} ref={refProp}>
      <CardMedia
        style={{ height: 350 }}
        image={place.image}
        title={place.name}
      />
      <CardContent>
        <Typography gutterBottom variant='h5'>
          {place.name}
        </Typography>
        <Box display='flex' justifyContent='space-between'>
          <LocationOnIcon />
          {/* <Typography variant="subtitle1">Địa chỉ</Typography> */}
          <Typography gutterBottom variant='subtitle1'>
            {place.address}
          </Typography>
        </Box>
        <Box display='flex' justifyContent='space-between'>
          <WebIcon />
          <Typography gutterBottom variant='subtitle1'>
            <a href={place.web}>{place.web}</a>
          </Typography>
        </Box>
        <Box display='flex' justifyContent='space-between'>
          <PhoneIcon />
          {/* <Typography variant="subtitle1">Địa chỉ</Typography> */}
          <Typography gutterBottom variant='subtitle1'>
            {place.phone}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default PlaceDetail;
