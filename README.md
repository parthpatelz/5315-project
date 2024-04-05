# 5315-project
web programing and framework 1

# Restaurant Data Application

This is a Node.js application for fetching and displaying restaurant data from a MongoDB database. It connects to a MongoDB database using Mongoose, retrieves restaurant data from a collection named "restaurants", and displays it in the console.

## Prerequisites

Before running the application, make sure you have the following installed:

- [Node.js](https://nodejs.org/)
- [MongoDB](https://www.mongodb.com/)

## Installation

1. Clone this repository:

    ```bash
    git clone https://github.com/your-username/restaurant-data-app.git
    ```

2. Navigate to the project directory:

    ```bash
    cd restaurant-data-app
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

## Contributing

Contributions are welcome! If you'd like to contribute to this project, please fork the repository and submit a pull request.

## License

