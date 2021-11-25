const Book = require('../models/Book');

exports.list = async(req, res) =>{
    try{
        const books = await Book.find({}, 'name chapters');
        res.render("record", {books: books});
    }catch(e){
        res.status(404).send({message: "could not list books"});
    }
};