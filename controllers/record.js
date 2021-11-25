const Book = require('../models/Book');
const User = require('../models/User');
const Record = require('../models/Record');

exports.list = async(req, res) =>{
    try{
        const books = await Book.find({}, 'name chapters');
        res.render("record", {books: books});
    }catch(e){
        res.status(404).send({message: "could not list books"});
    }
};

exports.create = async(req, res) => {
    try{
        const user = await User.findById(req.session.userID);

        const startChapter = Number(req.body.startchapter);
        const endChapter = Number(req.body.endchapter);

        chapterArr = [];
        for(let i=startChapter; i<endChapter + 1; i++)
        {
            chapterArr.push(i);
        }
        console.log(chapterArr);

        await Record.create({
            date: req.body.date,
            book: req.body.book,
            user_id: user._id,
            chapters: chapterArr
        });

        res.render("stats");
    }
    catch(e){
        console.log(e);
        res.status(404).send({message: "could not add record"});
    }
};