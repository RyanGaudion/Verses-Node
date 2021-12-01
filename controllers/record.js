const User = require('../models/User');
const Record = require('../models/Record');
const { isValidObjectId } = require('mongoose');


exports.search = async(req, res) => {
    try{
       const user = await User.findById(req.session.userID);
       const searchQuery = req.query.search;
       var records;
       if(searchQuery){
        records =  await Record.find(
            { user_id: user._id, $text: { $search: searchQuery}},
            { score: { $meta: "textScore" } }
         ).sort({date: 'desc'});
        
       }
       else{
        records = await Record.find({user_id: user._id}).sort({date: 'desc'});
       }
   
       res.render("history", {records: records, query: searchQuery});
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
            notes: req.body.notes,
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