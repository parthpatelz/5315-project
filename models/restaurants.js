const mongoose = require('mongoose');
const { Schema } = mongoose;

const GradeSchema = new Schema({
  date: Date,
  grade: String,
  score: Number
});

const RestaurantSchema = new Schema({
  address: {
    building: String,
    coord: [Number],
    street: String,
    zipcode: String
},
  borough: String,
  cuisine: String,
  grades: [GradeSchema],
  name: String,
  restaurant_id: String
});

const Restaurant = mongoose.model('Restaurant', RestaurantSchema,'restaurants');

module.exports = Restaurant;
