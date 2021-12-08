const User = require('../models/User');
const Record = require('../models/Record');
const { isValidObjectId } = require('mongoose');

const monthsArray = [ 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December' ]


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


        monthCountStat = await getMonthChapterStat(user);
        testamentStat = await getTestamentChapterStat(user);
        last30days = await getLastXdays(user, 30);

        oldTestamentCount = (testamentStat.find(x => x._id === "OT") === undefined) ? 0 : testamentStat.find(x => x._id === "OT").chapters;
        newTestamentCount = (testamentStat.find(x => x._id === "NT") === undefined) ? 0 : testamentStat.find(x => x._id === "NT").chapters;
        biblePercentage = Math.round( ((+oldTestamentCount + +newTestamentCount) * 100 / 1189) * 100) / 100

        res.render('stats', {_pageName: "stats", 
            monthCount: monthCountStat, 
            oldTestamentCount: oldTestamentCount, 
            newTestamentCount: newTestamentCount, 
            biblePercentage: biblePercentage,
            lastThirtyDays: (last30days[0] === undefined) ? 0 : last30days[0].count || 0
        });

    } catch (e) {
        console.log("Error");
        console.log(e);
        return res.status(400).send({
            message: JSON.parse(e),
        });
    }
}

async function getTestamentChapterStat(user){
    var testamentCountArray = await Record.aggregate( [
        {
            $match : {
                user_id: user._id
            }
        },
        {
            $lookup : {
                from: 'books',
                localField: 'book',
                foreignField: 'name',
                as: 'book'
            }
        },
        {
            $project : {
                book: { $arrayElemAt: ["$book", 0] },
                chapters: "$chapters"
            }
        },
        {
            $group : {
                _id: { "book": "$book" },
                chapters: { $push: "$chapters" },
                booksInfo: {"$addToSet": "$book"}
            }
        },
        {
            $project : {
                chapters: {
                    $size: {
                        $reduce: {
                            input: "$chapters",
                            initialValue: [],
                            in: { $setUnion: [ "$$value", "$$this" ] }
                        }
                    }
                },
                book: {$arrayElemAt: ["$booksInfo", 0]}
            }
        },
        {
            $group : {
                _id: "$book.testament",
                chapters: {
                  $sum : "$chapters"
                }
            }
        }]);
    return testamentCountArray;
}

async function getLastXdays(user, days){
    
    var lastxdayscount = await Record.aggregate( [
    { 
        $match: { 
            user_id: user._id, 
            date: { $gte: new Date((new Date().getTime() - (days * 24 * 60 * 60 * 1000))) }
        }
    },
    {
        $group: {
            _id: null,
            chapters: {
                  $push: "$chapters"
            }
        }
    },
    {
        $project: {
            count : {
                $size : {
                      $reduce: {
                  input: "$chapters",
                  initialValue: [],
                  in: { $concatArrays: ["$$value", "$$this"] }
                  }
                }
              }
        }
    }]);
    
    return lastxdayscount;
}

async function getMonthChapterStat(user){
    let TODAY = new Date();
    var YEAR_BEFORE = new Date()
    YEAR_BEFORE.setFullYear(YEAR_BEFORE.getFullYear()-1);

    //https://coderedirect.com/questions/243271/group-records-by-month-and-count-them-mongoose-nodejs-mongodb
    var monthCountArray = await Record.aggregate( [
    { 
        $match: { 
            user_id: user._id, 
            date: { $gte: YEAR_BEFORE, $lte: TODAY }
        }
    },
    
    { 
        $group: {
            _id: { "year_month": { $substrCP: [ "$date", 0, 7 ] } }, 
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
                    { $arrayElemAt: [ monthsArray, { $subtract: [ { $toInt: { $substrCP: [ "$_id.year_month", 5, 2 ] } }, 1 ] } ] }
                    //,
                    //" (", 
                    //{ $substrCP: [ "$_id.year_month", 0, 4 ] },
                    //")"
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
    
    var result = []
    if(monthCountArray[0] != null && monthCountArray[0].data != null && Object.keys(monthCountArray[0].data).length > 0){
        //Loop Every month
        for (let i = 0; i < monthsArray.length; i++) {
            var monthToCheck = monthsArray[i];
            var found = false;
            //Check to see if month is in aggregation result
            Object.keys(monthCountArray[0].data).forEach(function(monthData){
                if(monthData.includes(monthToCheck)){
                    found = true;
                }
            })

            //If month in list
            if(found){
                result.push({month: monthToCheck, count: monthCountArray[0].data[monthToCheck]});
            }
            //If month is not in list
            else{
                result.push({month: monthToCheck, count: 0});
            }
        }
    }
    return result;
}