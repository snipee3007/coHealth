const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });

const mongoose = require('mongoose');
const app = require('./app.js');
const User = require('./backend/models/users_schema.js');

const port = process.env.PORT || 8000;

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);
// console.log(DB); //MUST CHANGE THE CONFIG, ADD cohealth before ?
mongoose.connect(DB).then(() => console.log('Connect to database successful'));

app.get("/",function(req, res){
  res.sendFile(__dirname + "/signUp.html");
})

app.post("/", function (req, res) {
  let newUser = new User({
    email: req.body.email,
    password: req.body.pass, 
    age: req.body.age,
    gender: req.body.gender,
    history: [
      {
        height: req.body.height,
        weight: req.body.weight,
      },
    ],
  });
  newUser.save();
  res.redirect('/');
});

const server = app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});
