const User = require('../models/User');
const Record = require('../models/Record');
const { isValidObjectId } = require('mongoose');


exports.search = async(req, res) => {
    try{
       const user = await User.findById(req.session.userID);
       const search = req.query.search;
       var records;
       if(search){
        records = await Record.find({user_id: user._id, book: {$regex : "(?i)^" + search}})
       }
       else{
        records = await Record.find({user_id: user._id})
       }
   
       res.render("history", {records: records, query: search});
    }
    catch(e){
       console.log(e);
       res.status(404).send({message: "could not list records"});
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

        res.redirect("/history");
    }
    catch(e){
        console.log(e);
        res.status(404).send({message: "could not add record"});
    }
};