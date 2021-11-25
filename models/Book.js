const mongoose = require("mongoose");
const { Schema } = mongoose;

const bookSchema = new Schema(
    {
        number: {type: Number, unique: true},
        name: {type: String, unique: true},
        chapters: {type: Number},
        verses: {type: Number},
        words: {type: Number},
        author: {type: String},
        genre: {type: String},
        testament: {type: String},
    },
    { timestamps: true }
);


module.exports = mongoose.model("Book", bookSchema);
