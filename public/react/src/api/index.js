import data from '../data/map.json'
//const data = require('../data/map.json');

// console.log(data)

export const getPlaceData = async () => {
    try {
        return data;
    }catch (error) {
        console.log(error)
    }
}