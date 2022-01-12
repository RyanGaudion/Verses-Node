const Record = require('../../models/Record');

exports.bookmark = async(req, res) =>{
    var recordId = req.query.recordId;
    try{
        if(recordId){
            Record.findOne({ _id: recordId }, function(err, updateRecord) {
                updateRecord.bookmarked = updateRecord.bookmarked != null ? !updateRecord.bookmarked : true;
                updateRecord.save(function(err, newRecord) {
                    res.json(newRecord);
                });
            });
            //res.json({});
        }
        else{
            res.status(204).send();
        }
    }
    catch(e){
        res.status(404).send();
    }

};