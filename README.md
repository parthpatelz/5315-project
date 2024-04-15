# 5315-project
web programing and framework 1

# Restaurant Data Application

This is a Node.js application for fetching and displaying restaurant data from a MongoDB database. It connects to a MongoDB database using Mongoose, retrieves restaurant data from a collection named "restaurants", and displays it in the console.

## Prerequisites

Before running the application, make sure you have the following installed:

- [Node.js](https://nodejs.org/)
- [MongoDB](https://www.mongodb.com/)
- [Express.js](https://expressjs.com/)
- [Handlebars.js](https://handlebarsjs.com/)

## Installation

1. Clone this repository:

    ```bash[
    git clone https://github.com/<<<usrname>>>/restaurant-data-app.git](https://github.com/parthpatelz/5315-project.git)
    ```

2. Navigate to the project directory:

    ```bash
    cd 5301-project
    ```

3. Install dependencies:

    ```bash
    npm install
    ```

## Usage

1. Create a `.env` file in the root directory of the project and define the MongoDB connection string:

    ```plaintext
    DB_CONNECTION_STRING=mongodb://your-username:your-password@cluster0.f5ygftp.mongodb.net/5301-project
    ```

   Replace `your-username` and `your-password` with your MongoDB Atlas username and password.

2. Run the application:

    ```bash
    node app.js
    ```

3. The application will connect to the MongoDB database, fetch restaurant data from the "restaurants" collection, and display it in the console.

## UI
    Users can search for restaurants by specifying the page number, number of results per page, and the borough.
    The application provides a form where users can input their search criteria.
    Users can view the search results in a tabular format, displaying the restaurant name, borough, and cuisine

    

## License

