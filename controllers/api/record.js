const Record = require('../../models/Record');

exports.getById = async(req, res) =>{
    try{
        const record = await Record.findById(req.query.recordId);
        res.json(record);
    }catch(e){
        res.status(404).send({message: "could not find record"});
    }
};