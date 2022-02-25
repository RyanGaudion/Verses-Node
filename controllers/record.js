const User = require('../models/User');
const Book = require('../models/Book');
const Record = require('../models/Record');
const { isValidObjectId } = require('mongoose');

const monthsArray = [ 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December' ]


exports.search = async(req, res) => {
    try{
        const user = await User.findById(req.session.userID);
        const searchQuery = req.query.search;
        const limit = parseInt(req.query.limit) || 10; // Make sure to parse the limit to number
        const page = parseInt(req.query.page) || 1;
        const filter = req.query.filter || "all";

        var records;
        var count;
        if(filter == "bookmarked"){
            records =  await Record.find(
                { user_id: user._id, bookmarked: true },
                ).skip((limit * page) - limit).limit(limit)
                .sort({date: 'desc', createdAt: 'desc'})
            count = await Record.countDocuments({ user_id: user._id, bookmarked: true });
        }
        else if(filter == "notes"){
            records =  await Record.find(
                { user_id: user._id, notes: {"$exists" : true, "$ne" : ""} },
                ).skip((limit * page) - limit).limit(limit)
                .sort({date: 'desc', createdAt: 'desc'})

            count = await Record.countDocuments({ user_id: user._id, notes: {"$exists" : true, "$ne" : ""}  });
        }
        else{
            if(searchQuery){
                records =  await Record.find(
                { user_id: user._id, $text: { $search: searchQuery}},
                { score: { $meta: "textScore" } }
                ).skip((limit * page) - limit).limit(limit)
                .sort({date: 'desc', createdAt: 'desc'})
    
                count = await Record.countDocuments({ user_id: user._id, $text: { $search: searchQuery}});
            }
            else{
                records = await Record.find({user_id: user._id})
                .skip((limit * page) - limit).limit(limit)
                .sort({date: 'desc', createdAt: 'desc'})
    
                count = await Record.countDocuments({user_id: user._id});
            }
        }
   
        res.render("history", {_pageName: "history", records: records, query: searchQuery, count: count, page: page, limit: limit, filter: filter});
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

        const bookmarkToggle = req.body.bookmarkToggle;
        console.log(bookmarkToggle);
        chapterArr = [];
        for(let i=startChapter; i<endChapter + 1; i++)
        {
            chapterArr.push(i);
        }
        console.log(chapterArr);

        console.log(req.body.date);
        if(recordId){
            var record = {}
            Record.findOne({ _id: recordId }, function(err, updateRecord) {
                updateRecord.date = req.body.date;
                updateRecord.book = req.body.book;
                updateRecord.notes = req.body.notes;
                updateRecord.chapters = chapterArr;
                if(bookmarkToggle == 'true'){
                    updateRecord.bookmarked = updateRecord.bookmarked != null ? !updateRecord.bookmarked : true;
                }
                updateRecord.save(function(err, newRecord) {
                    record = newRecord;
                });
            });
        }
        else{
            await Record.create({
                date: req.body.date,
                book: req.body.book,
                notes: req.body.notes,
                user_id: user._id,
                chapters: chapterArr,
                bookmarked: bookmarkToggle
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
        const user = await User.findById(req.session.userID);
        const book = await getCurrentBook(user);

        if(req.query.recordId){
            const recordId = req.query.recordId;
            const record = await Record.findById(recordId);
            
    
            if(record && record.user_id.toString() == user._id.toString()){
                res.render("record", {_pageName: "record", record: record, currentBook: book});
            }
            else{
                console.log("Record was null or user did not match");
                res.redirect("/history");
            }
        }
        else{
            res.render("record", {_pageName: "record", record: {}, currentBook: book});
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


        /*
        monthCountStat = await getMonthChapterStat(user);
        testamentStat = await getTestamentChapterStat(user);
        last30days = await getLastXDaysCount(user, 30);
        last7days = await getLastXDaysCount(user, 7);
        currentBookName = await getCurrentBook(user);
        */

        //80ms performance benefit
        let [monthCountStat, testamentStat, mostReadBook, last30days, last7days, currentBook] = await Promise.all(
            [getMonthChapterStat(user), getTestamentChapterStat(user), getMostReadBook(user), getLastXDaysCount(user, 30), getLastXDaysCount(user, 7), getCurrentBook(user)]);

        
        
        oldTestamentCount = (testamentStat.find(x => x._id === "OT") === undefined) ? 0 : testamentStat.find(x => x._id === "OT").chapters;
        newTestamentCount = (testamentStat.find(x => x._id === "NT") === undefined) ? 0 : testamentStat.find(x => x._id === "NT").chapters;
        testamentChaptersStat = [oldTestamentCount, newTestamentCount]


        //console.log(testamentStat);
        res.render('stats', {_pageName: "stats", 
            monthCount: monthCountStat, 
            progressCount: testamentChaptersStat,
            lastSevenDays: last7days,
            currentBook: currentBook,
            mostReadBook: mostReadBook,
            lastThirtyDays: last30days
        });

    } catch (e) {
        console.log("Error");
        console.log(e);
        return res.status(400).send({
            message: JSON.parse(e),
        });
    }
}

async function getCurrentBook(user){
    //Can improve later by getting last 5 books
    lastRecord = (await getLastXFullRecords(user, 1))[0];
    //If last record was end of book then choose next book - else show current book
    if(lastRecord && lastRecord.chapters[lastRecord.chapters.length - 1] == lastRecord.book.chapters){
        try{
            var nextBook = (await Book.find({number: lastRecord.book.number + 1}))[0];
            if(nextBook && nextBook.name){
                return {name: nextBook.name, chapter: 1};
            }
        }
        catch(e){
            console.log(e);
        }
    }
    return {name: lastRecord?.book?.name, chapter: lastRecord?.chapters[lastRecord?.chapters?.length - 1] + 1}  || "N/A";
}

async function getMostReadBook(user){
    var bookStats = await getBookChapterStat(user);
    //stat = chapters (int) & book (object)
    var maxStat = bookStats[0];
    bookStats.forEach(function(stat){
        var percentage = stat.chapters / stat.book.chapters;
        if(percentage >=  maxStat.chapters / maxStat.book.chapters){
            maxStat = stat;
        }
    });
    return maxStat?.book?.name || "N/A";
}

async function getLastXFullRecords(user, number){
    var value = await Record.aggregate([
        {
            $match : {
                user_id: user._id
            }
        },
        {
            $sort : {
                date: -1,
                createdAt: -1
            }
        },
        {
            $limit : number
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
            $addFields : {
                book: { $arrayElemAt: ["$book", 0] }
            }
        }
    ]);
    return value;
}


//Unique - if set to yes will count multiple of same chapter only once
async function getBookChapterStat(user, unique = false){
    var bookCountArray = await Record.aggregate( [
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
                    $size : {
                        $reduce: {
                            input: "$chapters",
                            initialValue: [],
                            in: unique ? { $setUnion: [ "$$value", "$$this" ] } : { $concatArrays: [ "$$value", "$$this" ] }
                        }
                    }
                  },
                  book: {$arrayElemAt: ["$booksInfo", 0]}
            }
        }
    ]);
    return bookCountArray;
}

//Counts multiple of same chapter as 1
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

async function getLastXDaysCount(user, days){
    var value = await getLastXdays(user, days);
    return (value[0] === undefined) ? 0 : value[0].count || 0;
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