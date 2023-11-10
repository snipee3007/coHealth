import React, { useState, useEffect, createRef } from 'react';
import {
  CircularProgress,
  Grid,
  Typography,
  InputLabel,
  MenuItem,
  FormControl,
  Select,
} from '@material-ui/core';

import PlaceDetails from '../PlaceDetails/PlaceDetails';

import useStyles from './style';

import Loc from '../../data/map.json';

const List = ({ childClicked, isLoading }) => {
  const classes = useStyles();
  const [type, setType] = useState('BVTP');
  const [rating, setRating] = useState('');
  const [elRefs, setElRefs] = useState([]);

  useEffect(() => {
    const refs = Array(Loc.loc.length)
      .fill()
      .map((_, i) => elRefs[i] || createRef());

    setElRefs(refs);
  }, []);

  return (
    <div className={classes.container}>
      <Typography variant='h4'>Bệnh viện ở gần bạn</Typography>
      {isLoading ? (
        <div className={classes.loading}>
          <CircularProgress size='5rem' />
        </div>
      ) : (
        <>
          <FormControl className={classes.formControl}>
            <InputLabel>Loại</InputLabel>
            <Select value={type} onChange={(e) => setType(e.target.value)}>
              <MenuItem value='BVTP'>Bệnh viện thuộc sở Y Tế</MenuItem>
              <MenuItem value='BVQH'>Bệnh viện Quận, Huyện</MenuItem>
              <MenuItem value='TTYT'>Trung tâm y tế dự phòng</MenuItem>
            </Select>
          </FormControl>
          {/* Uncomment and implement the rating filter */}
          {/* <FormControl className={classes.formControl}>
                        <InputLabel>Đánh giá</InputLabel>
                        <Select value={rating} onChange={(e) => setRating(e.target.value)}>
                            <MenuItem value={0}>Tất cả</MenuItem>
                            <MenuItem value={3}>Trên 3.0</MenuItem>
                            <MenuItem value={4}>Trên 4.0</MenuItem>
                            <MenuItem value={4.5}>Trên 4.5</MenuItem>
                        </Select>
                    </FormControl> */}
          <Grid container spacing={3} className={classes.list}>
            {Loc.loc.map((place, i) => (
              <Grid item key={i} xs={12}>
                <PlaceDetails
                  place={place}
                  selected={childClicked === i.toString()}
                  refProp={elRefs[i]}
                />
              </Grid>
            ))}
          </Grid>
        </>
      )}
    </div>
  );
};

export default List;
