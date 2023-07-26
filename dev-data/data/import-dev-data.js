const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Tour = require('./../../models/tourModel.js');
const User = require('./../../models/userModel.js');
const Review = require('./../../models/reviewModel.js');

dotenv.config({ path: './config.env' });
const DB = process.env.DATABASE.replace(
  '<password>',
  process.env.DATABASE_PASSWORD
);

// reading the json file
const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, 'utf-8'));
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, 'utf-8'));
const reviews = JSON.parse(
  fs.readFileSync(`${__dirname}/reviews.json`, 'utf-8')
);

//IMPORTING THE DATA INTO THE DATABASE
const importData = async () => {
  try {
    await Tour.create(tours);
    await User.create(users, { validateBeforeSave: false });
    await Review.create(reviews);
  } catch (err) {
    console.log(err);
  }
};

//DELETE ALL DATA FROM COLLECTION

const deleteData = async () => {
  try {
    await Tour.deleteMany();
    await User.deleteMany();
    await Review.deleteMany();

    console.log('Data Succesfuly deleted!');
    process.exit();
  } catch (err) {
    console.log(err);
  }
};
(async () => {
  try {
    await mongoose.connect(DB, {
      useNewUrlParser: true,
      useCreateIndex: true,
      useFindAndModify: false,
    });
    console.log('DB connection succesful!!!');
    if (process.argv[2] === '--import') {
      await importData();
    } else if (process.argv[2] === '--delete') {
      await deleteData();
    }

    //Disconnect the database
    await mongoose.disconnect();
  } catch (err) {
    console.log(err);
  }
})();

// console.log(process.argv);
