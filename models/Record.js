const mongoose = require("mongoose");
const { Schema } = mongoose;

const recordSchema = new Schema(
    {
        date: {type: Date, required: [true, 'Date of record is required']},
        book: {type: String, required: [true, 'Book of record is required']},
        user_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        chapters: [{type: Number}]
    },
    { timestamps: true }
);

module.exports = mongoose.model("Record", recordSchema);