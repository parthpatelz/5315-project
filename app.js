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
const User = require("./models/user.js");
require('dotenv').config();


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
      req.userId = decoded.userId; // Add user ID to the request object
      next();
    });
  } else {
    res.sendStatus(401);
    return;
  }
}
app.post("/register", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ msg: "Username and password are required" });
  }

  try {
    // Check if the user already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ msg: "Username already exists" });
    }

    // Create a new user
    const user = new User({ username, password });
    await user.save();

    res.status(201).json({ msg: "User registered successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Server error" });
  }
});
app.get('/', (req, res) => {
  res.render('main', { user: req.user }); // Pass user data if needed
});
app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ msg: "Username and password are required" });
  }

  try {
    // Find the user by username
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ msg: "Invalid username or password" });
    }

    // Compare the provided password with the hashed password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ msg: "Invalid username or password" });
    }

    // Generate a JWT token
    const accessToken = jwt.sign({ userId: user._id }, process.env.SECRETKEY);
    res.json({ accessToken });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Server error" });
  }
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

// Edit route
app.get('/api/restaurants/:id/edit', verifyToken, async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    res.render('editRestaurant', { restaurant });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal server error');
  }
});

// Delete route
app.get('/api/restaurants/:id/delete', verifyToken, async (req, res) => {
  try {
    await Restaurant.findByIdAndDelete(req.params.id);
    res.redirect('/api/restro');
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal server error');
  }
});

// app.all('api/restro/new', async(req, res)=>{
//   if(req.method ==='GET'){
// res.render('newrestaurant');
//   }else if(req.method === 'Post'){
//     error.err("not your thing");
//   }
// });
// Add these routes to your Express app

// Render login page
app.get('/login', (req, res) => {
  res.render('login');
});

// Render registration page
app.get('/register', (req, res) => {
  res.render('register');
});

// Logout route
app.get('/logout', (req, res) => {
  res.clearCookie('token'); // Clear the token cookie
  res.redirect('/login');
});

app.get('/newrestaurant', (req, res) => {
  res.render('newrestaurant'); // Ensure 'newrestaurant.hbs' exists in the views folder
});

// Example route for rendering the edit restaurant form
app.get('/editRestaurant', (req, res) => {
  res.render('editRestaurant'); // Ensure 'editRestaurant.hbs' exists in the views folder
});

app.get('/newrestaurant', (req, res) => {
  res.render('restaurants/newrestaurant'); // Path to the template
});

app.get('/editRestaurant', (req, res) => {
  res.render('restaurants/editRestaurant'); // Path to the template
});
// app.get('/all-restaurants', async (req, res) => {
//   try {
//     const restaurants = await Restaurant.find();
//     res.render('restaurants/allRestaurants', { restaurants });
//   } catch (error) {
//     console.error(error);
//     res.status(500).send('Internal server error');
//   }
// });
// Route to get all restaurants
app.get('/allRestaurants', async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const perPage = parseInt(req.query.perPage) || 10;

  try {
    const restaurants = await Restaurant.find()
      .skip((page - 1) * perPage)
      .limit(perPage);

    res.render('restaurants/allRestaurants', { restaurants, page, perPage });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal server error');
  }
});

app.all('/api/restro/new', verifyToken, async (req, res) => {
  if (req.method === 'GET') {
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