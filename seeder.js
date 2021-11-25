
const { MongoClient } = require("mongodb");
require("dotenv").config();
const fs = require("fs").promises;
const path = require("path"); 
const loading = require("loading-cli");
const { MONGODB_URI, MONGODB_PRODUCTION_URI } = process.env;


/**
 * constants
 */
const client = new MongoClient(
  process.env.NODE_ENV === "production" ? MONGODB_PRODUCTION_URI : MONGODB_URI
);

async function main() {
  try {
    await client.connect();
    const db = client.db();
    const results = await db.collection("books").find({}).count();

    /**
     * If existing records then delete the current collections
     */
    if (results) {
        db.collection("books").drop();
    }

    /**
     * This is just a fun little loader module that displays a spinner
     * to the command line
     */
    const load = loading("importing your bible 📖!!").start();

    /**
     * Import the JSON data into the database
     */

    const data = await fs.readFile(path.join(__dirname, "BooksOfTheBible.json"), "utf8");
    await db.collection("books").insertMany(JSON.parse(data));

    load.stop();
    console.info(
      `Books collection set up!`
    );


    process.exit();
  } catch (error) {
    console.error("error:", error);
    process.exit();
  }
}

main();
