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
   
        res.render("history", {_pageName: "history", records: records, query: searchQuery, count: count, page: page, limit: limit});
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
                res.render("record", {_pageName: "record", record: record});
            }
            else{
                console.log("Record was null or user did not match");
                res.redirect("/history");
            }
        }
        else{
            res.render("record", {_pageName: "record", record: {}});
        }
    }
    catch(e){
        console.log(e);
        res.status(404).send({message: "could not edit record"});
    }
};

exports.stats = async (req, res) => {
    try {
        const user = await User.findById(req.session.userID);

        let TODAY = new Date();
        var YEAR_BEFORE = new Date()
        YEAR_BEFORE.setFullYear(YEAR_BEFORE.getFullYear()-1);

        console.log(TODAY);
        console.log(YEAR_BEFORE);
        console.log(user._id);

        const monthsArray = [ 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December' ]

        //https://coderedirect.com/questions/243271/group-records-by-month-and-count-them-mongoose-nodejs-mongodb
        var monthCountArray = await Record.aggregate( [
        { 
            $match: { 
                user_id: user._id, 
                createdAt: { $gte: YEAR_BEFORE, $lte: TODAY }
            }
        },
        
        { 
            $group: {
                _id: { "year_month": { $substrCP: [ "$createdAt", 0, 7 ] } }, 
                count: { $sum: { $size: "$chapters"} }
            } 
        },
        {
            $sort: { "_id.year_month": 1 }
        },
        { 
            $project: { 
                _id: 0, 
                count: 1, 
                month_year: { 
                    $concat: [ 
                        { $arrayElemAt: [ monthsArray, { $subtract: [ { $toInt: { $substrCP: [ "$_id.year_month", 5, 2 ] } }, 1 ] } ] },
                        " (", 
                        { $substrCP: [ "$_id.year_month", 0, 4 ] },
                        ")"
                    ] 
                }
            } 
        },
        { 
            $group: { 
                _id: null, 
                data: { $push: { k: "$month_year", v: "$count" } }
            } 
        },
        {
            $project: { 
                data: { $arrayToObject: "$data" }, 
                _id: 0 
            } 
        }]);
        
        console.log("array");
        console.log(monthCountArray);

        res.render('stats', {_pageName: "stats", monthCount: monthCountArray});

    } catch (e) {
        console.log("Error");
        console.log(e);
        return res.status(400).send({
            message: JSON.parse(e),
        });
    }
}
