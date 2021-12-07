const User = require('../models/User');
const Record = require('../models/Record');
const { isValidObjectId } = require('mongoose');


exports.search = async(req, res) => {
    try{
        const user = await User.findById(req.session.userID);
        const searchQuery = req.query.search;
        const limit = parseInt(req.query.limit) || 10; // Make sure to parse the limit to number
        const page = parseInt(req.query.page) || 1;

        var records;
        var count;
        if(searchQuery){
         records =  await Record.find(
             { user_id: user._id, $text: { $search: searchQuery}},
             { score: { $meta: "textScore" } }
          ).skip((limit * page) - limit).limit(limit)
          .sort({date: 'desc'});

          count = await Record.countDocuments({ user_id: user._id, $text: { $search: searchQuery}});
        
        }
        else{
            records = await Record.find({user_id: user._id})
            .skip((limit * page) - limit).limit(limit)
            .sort({date: 'desc'});

            count = await Record.countDocuments({user_id: user._id});
        }
   
        res.render("history", {records: records, query: searchQuery, count: count, page: page, limit: limit});
    }
    catch(e){
       console.log(e);
       res.status(404).send({message: "could not list records"});
    }
};

//Create or update
exports.create = async(req, res) => {
    try{
        const user = await User.findById(req.session.userID);

        const startChapter = Number(req.body.startchapter);
        const endChapter = Number(req.body.endchapter);

        const recordId = req.body.recordId;

        chapterArr = [];
        for(let i=startChapter; i<endChapter + 1; i++)
        {
            chapterArr.push(i);
        }
        console.log(chapterArr);

        console.log(req.body.date);
        if(recordId){
            const updatedRecord = {
                date: req.body.date,
                book: req.body.book,
                notes: req.body.notes,
                chapters: chapterArr
            }
            //var record = await Record.findById(recordId);
            const record = await Record.updateOne({ _id: recordId }, updatedRecord);
        }
        else{
            await Record.create({
                date: req.body.date,
                book: req.body.book,
                notes: req.body.notes,
                user_id: user._id,
                chapters: chapterArr
            });
        }

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

exports.record = async(req, res) => {
    try{
        if(req.query.recordId){
            const user = await User.findById(req.session.userID);
            const recordId = req.query.recordId;
            const record = await Record.findById(recordId);
    
            if(record && record.user_id.toString() == user._id.toString()){
                res.render("record", {record: record});
            }
            else{
                console.log("Record was null or user did not match");
                res.redirect("/history");
            }
        }
        else{
            res.render("record", {record: {}});
        }
    }
    catch(e){
        console.log(e);
        res.status(404).send({message: "could not edit record"});
    }
};