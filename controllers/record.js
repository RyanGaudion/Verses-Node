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

exports.delete = async(req, res) => {
    try{
        const user = await User.findById(req.session.userID);
        

        const recordId = req.body.recordId;
        console.log("Record Id: " + recordId);
        console.log("User Id: " + req.session.userID);

        const record = await Record.findById(recordId);
        console.log(record.user_id);
        console.log(user._id);

        if(record && record.user_id.toString() == user._id.toString()){
            await Record.findByIdAndDelete(recordId);
        }
        else{
            console.log("Record was null or user did not match");
        }

        res.redirect("/history");
    }
    catch(e){
        console.log(e);
        res.status(404).send({message: "could not delete record"});
    }
};