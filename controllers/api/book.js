const Book = require('../../models/Book');

exports.list = async(req, res) =>{
    try{
        const books = await Book.find({}, 'name chapters number').sort({number: 'asc'});
        res.json(books);
    }catch(e){
        res.status(404).send({message: "could not list books"});
    }
};