const mongoose = require("mongoose");
const { Schema } = mongoose;
const bcrypt = require('bcrypt');

const userSchema = new Schema(
    {
        fullname: {type: String, required: [true, 'Full name is required']},
        email: { type: String, required: [true, 'Email is required'], unique: [true, 'Email must be unique'] },
        password: { type: String, required: [true, 'password is required'] }
    },
    { timestamps: true }
);

userSchema.pre('save', async function (next) {
    try {
        const hash = await bcrypt.hash(this.password, 10);
        this.password = hash;
        next();
    } catch (e) {
        throw Error('Could not hash password');
    }
})

module.exports = mongoose.model("User", userSchema);
