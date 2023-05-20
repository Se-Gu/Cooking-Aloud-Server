const express = require("express");
const cors = require("cors");
const app = express();
require("dotenv").config();
const mysql = require("promise-mysql");

// createUnixSocketPool initializes a Unix socket connection pool for
// a Cloud SQL instance of MySQL.
const createUnixSocketPool = async () => {
  // Note: Saving credentials in environment variables is convenient, but not
  // secure - consider a more secure solution such as
  // Cloud Secret Manager (https://cloud.google.com/secret-manager) to help
  // keep secrets safe.
  return mysql.createPool({
    user: process.env.DB_USER, // e.g. 'my-db-user'
    password: process.env.DB_PASS, // e.g. 'my-db-password'
    database: process.env.DB_NAME, // e.g. 'my-database'
    socketPath: process.env.INSTANCE_UNIX_SOCKET, // e.g. '/cloudsql/project:region:instance'
  });
};

const connectToPool = async () => {
  try {
    const pool = await createUnixSocketPool();

    // Get a connection from the pool
    const connection = await pool.getConnection();

    // Execute a SQL query
    const query =
      "CREATE TABLE `USERS` (`id` INT(20) NOT NULL, `email` VARCHAR(50), `password` VARCHAR(20), `favorite_meals` VARCHAR(10000), PRIMARY KEY (`id`));";
    const results = await connection.query(query);
    console.log("Query results:", results);

    // Release the connection back to the pool
    connection.release();

    // Close the connection pool
    pool.end();
    console.log("pool closed");
  } catch (error) {
    console.error("Error:", error);
  }
};

connectToPool();

app.use(cors());

app.get("/api/users", (req, res) => {
  res.json({ users: ["userOne", "userTwo", "userThree"] });
});

app.get("/api/admins", (req, res) => {
  res.json({ admins: ["Serhat", "Özgür"] });
});

app.listen(8080, () => console.log("Server started on port 5000"));
