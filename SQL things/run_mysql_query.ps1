# Change to the MySQL bin directory
Set-Location "C:\Program Files\MySQL\MySQL Server 8.0\bin"

# Define the MySQL commands
$mysqlCommand = @"
-- Check if the database exists, and create it if it doesn't
CREATE DATABASE IF NOT EXISTS MathGame_user_auth;

-- Use the database
USE MathGame_user_auth;

-- Check if the users table exists, and create it if it doesn't
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) UNIQUE,
    password VARCHAR(255)
);

-- Describe the users table
DESCRIBE users;

-- Select all data from the users table
SELECT * FROM users;
"@

# Execute MySQL with the commands
.\mysql -u root -e "$mysqlCommand"