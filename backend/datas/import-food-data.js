const dotenv = require('dotenv');
dotenv.config({ path: './../../config.env' });

const mongoose = require('mongoose');
const fs = require('fs');
const Food = require('./../models/food_schema.js');


const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);

mongoose.connect(DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => console.log('Connected to the database successfully'));

const foodData = JSON.parse(
    fs.readFileSync(`${__dirname}/food-data.json`, 'utf-8')
);

const importFoodData = async function () {
    try {
        for (let i = 0; i < foodData.length; ++i) {
            await Food.create(foodData[i]);
        }
        console.log('Data successfully imported!');
    } catch (err) {
        console.log(err);
    }
    process.exit();
};

const deleteFoodData = async function () {
    try {
        await Food.deleteMany();
        console.log('Data successfully deleted!');
    } catch (err) {
        console.log(err);
    }
    process.exit();
};

if (process.argv[2] === '--import') {
    importFoodData();
} else if (process.argv[2] === '--delete') {
    deleteFoodData();
}