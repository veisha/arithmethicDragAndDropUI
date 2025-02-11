A simple arithmethic game 


please install the following dependencies first 

npm init -y  # Initializes a package.json file (if you haven't already)
npm install express     
npm install dotenv
npm install mysql2
npm install bcrypt
npm install jsonwebtoken
npm install cors

-make sure that everything are properly installed 


make sure to query the database and create the tables before running the server

CREATE DATABASE MathGame_user_auth;

USE MathGame_user_auth;

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) UNIQUE,
    password VARCHAR(255)
);

DESCRIBE users; //for verification if the table is created properly
