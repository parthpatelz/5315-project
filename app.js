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
})






app.listen(port, () => {
    console.log(`${appConfig.name} listening on port: ${port}`);
});
