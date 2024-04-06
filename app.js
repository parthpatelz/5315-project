require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const appConfig = require("./package.json");
const Restaurant = require("./models/restaurants");

const app = express();

const bodyParser = require("body-parser"); // pull information from HTML POST (express4)

const port = process.env.PORT || 8000;
app.use(bodyParser.urlencoded({ extended: true })); // parse application/x-www-form-urlencoded
app.use(bodyParser.json()); // parse application/json
// app.use(bodyParser.json({ type: "application/vnd.api+json" })); // parse application/vnd.api+json as json

const database = require("./config/database.js");
mongoose.connect(database.url);




app.get("/api/restaurants",async(req,res)=>{
    try{
         const restaurants =await  Restaurant.find();
         res.json(restaurants)
    }catch(reason){
        res.status(500).json({msg:"server error"});
    }
});


app.get('/api/restaurants/:id', async (req, res) => {
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
app.post("/api/restaurants", async (req, res) => {
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
  



app.listen(port, () => {
    console.log(`${appConfig.name} listening on port: ${port}`);
});
