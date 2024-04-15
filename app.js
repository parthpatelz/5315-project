require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const appConfig = require("./package.json");
const Restaurant = require("./models/restaurants");
const { engine } = require('express-handlebars');
const handlebars = require('handlebars');
const { allowInsecurePrototypeAccess } = require('@handlebars/allow-prototype-access');
const path = require('node:path');
const bcrypt = require("bcryptjs")
require('dotenv').config();
const { request } = require('graphql-request');

const connectionString = process.env.DB_CONNECTION_STRING;



const app = express();

const bodyParser = require("body-parser"); 
const port = process.env.PORT || 8000;
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const database = require("./config/database.js");
mongoose.connect(database.url);


const jwt = require('jsonwebtoken');

function verifyToken(req, res, next) {
  const bearerHeader = req.headers["authorization"];
  if (typeof bearerHeader !== "undefined") {
    const bearer = bearerHeader.split(" ");
    const bearerToken = bearer[1];
    req.token = bearerToken;
    jwt.verify(req.token, process.env.SECRETKEY, (err, decoded) => {
      if (err) {
        res.sendStatus(401);
        return;
      }
      console.log(decoded);
      next();
    });
  } else {
    res.sendStatus(401);
    return;
  }
}

app.post("/login", (req, res) => {
const username = req.body.username;
const password = req.body.password;
if (!username) {
  res.status(400).json({ msg: 'missing username in body' });
  return;
}

if(username!=="parth" || password!=="123"){
  return res.status(401).json({ message: 'Invalid password or username' });

}
const user = { name: username };


const accessToken = jwt.sign(user, process.env.SECRETKEY);
res.json({ accessToken: accessToken });
});


app.get("/api/restaurants", verifyToken, async(req, res) => {
  try {
    // Fetch restaurants from the database
    const restaurants = await Restaurant.find();

    // Return the restaurants as JSON response
    res.json(restaurants);
  } catch (error) {
    // If an error occurs, return a 500 status code and an error message
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

  app.get('/api/restaurants/:id', verifyToken, async (req, res) => {
    try {
      const id = req.params.id;
      const restro = await Restaurant.findById(id);
      if (!restro) {
        return res.status(404).json({ msg: 'Restaurant not found' });
      }
      res.json(restro);
    } catch (error) {
      console.error(error);
      res.status(500).json({ msg: 'Internal server error' });
    }
  });

// Route to create a new restaurant record
app.post("/api/restaurants",verifyToken, async (req, res) => {
    try {
      // Extract relevant data from the request body
      const { building, coord, street, zipcode } = req.body.address;
      const { borough, cuisine, grades, name, restaurant_id } = req.body;

      // Create a new restaurant instance using the extracted data
      const newRestaurant = new Restaurant({
        address: { building, coord, street, zipcode }, // Construct the address object
        borough,
        cuisine,
        grades,
        name,
        restaurant_id
      });
  
      // Save the new restaurant record to the database
      await newRestaurant.save();
  
      res.status(201).json({ msg: 'Restaurant created successfully', restaurant: newRestaurant });
    } catch (error) {
      console.error(error);
      res.status(500).json({ msg: 'Internal server error' });
    }
  });

  app.put("/api/restaurants/:restaurant_id",verifyToken, async (req, res) => {
    try {
      const id = req.params.restaurant_id;
      const data = {
        address: req.body.address,
        borough: req.body.borough,
        cuisine: req.body.cuisine,
        grades: req.body.grades,
        name: req.body.name,
        restaurant_id: req.body.restaurant_id
      };
  
      // Update the restaurant
      const updatedRestaurant = await Restaurant.findByIdAndUpdate(id, data, { new: true });
      if (!updatedRestaurant) {
        return res.status(404).json({ msg: 'Restaurant not found' });
      }
      res.json({ msg: "Success! Restaurant updated", restaurant: updatedRestaurant });
    } catch (error) {
      console.error(error);
      res.status(500).json({ msg: 'Internal server error' });
    }
  });

  app.delete("/api/restaurants/:restaurant_id",verifyToken, async (req, res) => {
    try {
      const id = req.params.restaurant_id;
      
      // Delete the restaurant
      const deletedRestaurant = await Restaurant.findByIdAndDelete(id);
      if (!deletedRestaurant) {
        return res.status(404).json({ msg: 'Restaurant not found' });
      }
      res.json({ msg: "Success! Restaurant deleted" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ msg: 'Internal server error' });
    }
  });


app.listen(port, () => {
    console.log(`${appConfig.name} listening on port: ${port}`);
});



app.engine('.hbs', engine({
    extname: '.hbs',
    helpers: {},
    handlebars: allowInsecurePrototypeAccess(handlebars)
  }));
  app.set('view engine', '.hbs');


// add static support
  app.use(express.static(path.join(__dirname, 'public')));


  app.all('/api/restro', async (req, res) => {
    if (req.method === 'GET') {
        // Render the form
        res.render('restaurantform');
    } else if (req.method === 'POST') {
        // Process form data
        const { page, perPage, borough } = req.body;

        try {
            // Query the database based on the input parameters
            const restaurants = await Restaurant.find({ borough })
                .skip((page - 1) * perPage)
                .limit(perPage);

            // Render the results
            res.render('restaurantResults', { restaurants });
        } catch (error) {
            console.error('Error querying database:', error);
            res.status(500).send('Internal server error');
        }
    }
});



// app.all('api/restro/new', async(req, res)=>{
//   if(req.method ==='GET'){
// res.render('newrestaurant');
//   }else if(req.method === 'Post'){
//     error.err("not your thing");
//   }
// });

app.all('/api/restro/new', async (req, res) => {
  if (req.method === 'GET') {
    // Render the form
    res.render('newrestaurant');
  } else if (req.method === 'POST') {
    // Process form data
    const { name, borough, cuisine, address, grades } = req.body;

    try {
      // Create a new restaurant object
      const restaurant = new Restaurant({ 
        name, 
        borough, 
        cuisine, 
        address: {
          building: address.building,
          coord: [parseFloat(address.coord[0]), parseFloat(address.coord[1])],
          street: address.street,
          zipcode: address.zipcode
        },
        grades: [{
          date: new Date(grades[0].date),
          grade: grades[0].grade,
          score: parseInt(grades[0].score)
        }]
      });

      // Save the restaurant to the database
      await restaurant.save();

      // Render the results
      res.render('restaurantResults', { restaurants: [restaurant] });
    } catch (error) {
      console.error('Error saving restaurant to database:', error);
      res.status(500).send('Internal server error');
    }
  }
});
