const mongoose = require('mongoose');
const connectionString = process.env.DB_CONNECTION_STRING;

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


// Function to initialize the database connection
// function initializeDB() {
//   return new Promise((resolve, reject) => {
//     mongoose.connect(connectionString, { useNewUrlParser: true, useUnifiedTopology: true })
//       .then(() => {
//         console.log('Connected to MongoDB Atlas');
//         resolve();
//       })
//       .catch(err => {
//         console.error('Error connecting to MongoDB Atlas:', err);
//         reject(err);
//       });
//   });
// }

// Start the server function
function startServer() {
  // Your server start logic goes here
  console.log('Server started');
}

// Initialize the database before starting the server
initializeDB()
  .then(() => {
    // Once the database is initialized, you can use the Restaurant model
    // Start the server or do any other operations that require database connection
    console.log('Restaurant model:', Restaurant);
    startServer();
  })
  .catch(err => {
    // Handle initialization error
    console.error('Database initialization failed:', err);
    // Optionally, exit the process or take other actions based on the error
  });
