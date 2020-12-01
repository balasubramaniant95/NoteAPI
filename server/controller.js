const winston = require('./winston');

const mongo = require('mongodb');
const redis = require('redis');

const mongoConfigs = require('./config').mongodb;
const redisConfigs = require('./config').redis;

const redisClient = redis.createClient({
    host: redisConfigs.hostname,
    port: redisConfigs.port
});


module.exports.cacheRedis = function (req, res, next) {
    if (req.params.id) {
        redisClient.get(req.params.id, (err, data) => {
            if (data!=null) {
                res.header('X-Cached-Data' , 1 );
                res.status(200).json({
                    description:'OK | successfully fetched record',
                    value: JSON.parse(data)
                });
            }
            return next();
        });
    } else {
        redisClient.get('all', (err, data) => {
            if (data!=null) {
                res.header('X-Cached-Data' , 1 );
                res.status(200).json({
                    description:'OK | successfully fetched list of records',
                    value: JSON.parse(data)
                });
            }
            return next();
        });
    }
};

module.exports.fetchRecordList = function (req, res) {
    req.app.locals.db.collection(mongoConfigs.collection).find({}, { projection: { _id:1, noteTitle:1 } }).toArray((err, result) => {
        if (err) {
            winston.warn(`error fetching list of records: ${err}`);
            return res.status(500).json({
                description:'Internal Server Error | error fetching list of records'
            });
        } else {
            redisClient.setex('all', 300, JSON.stringify(result));
            return res.status(200).json({
                description:'OK | successfully fetched list of records',
                value: result
            });
        }
    });
};

module.exports.fetchRecordDetails = function (req, res) {
    try {
        var id = req.params.id;
        var idObj = new mongo.ObjectID(id);
    } catch (err) {
        return res.status(400).json({
            description:'Bad Request | invalid request id'
        });
    }
    req.app.locals.db.collection(mongoConfigs.collection).find({ '_id': idObj }).toArray((err, result) => {
        if (err) {
            winston.warn(`error fetching record: ${id} - ${err}`);
            return res.status(500).json({
                description:'Internal Server Error | error fetching record'
            });
        } else {
            if (result.length === 0) {
                return res.status(404).json({
                    description:'Not Found | record not found'
                });
            }
            redisClient.setex(id.toString(), 300, JSON.stringify(result));
            return res.status(200).json({
                description:'OK | successfully fetched record',
                value: result
            });
        }
    });

};

module.exports.createRecord = function (req, res) {
    if (req.body.note_title == undefined || req.body.note_body == undefined) {
        return res.status(400).json({
            description:'Bad Request | request body must contain note_title & note_body'
        });
    }
    var theNote = {
        noteTitle: req.body.note_title,
        noteBody: req.body.note_body,
        createdDate: Date.now()
    };
    req.app.locals.db.collection(mongoConfigs.collection).insertOne(theNote, (err, result) => {
        if (err) {
            winston.error(`error inserting new record: ${JSON.stringify(theNote)} - ${err}`);
            return res.status(500).json({
                description:'Internal Server Error | error inserting the new record'
            });
        } else {
            redisClient.setex(result.insertedId.toString(), 300, JSON.stringify(result.ops));
            redisClient.del('all');
            return res.status(200).json({
                description:'OK | successfully inserted the new record',
                value: result.ops
            });
        }
    })
};

module.exports.deleteRecord = function (req, res) {
    try {
        var id = req.params.id;
        var idObj = new mongo.ObjectID(id);
    } catch (err) {
        return res.status(400).json({
            description:'Bad Request | Invalid request id'
        });
    }
    req.app.locals.db.collection(mongoConfigs.collection).deleteOne({ '_id': idObj }, (err, result) => {
        if (err) {
            winston.warn(`error deleting record: ${id} - ${err}`);
            return res.status(500).json({
                description:'Internal Server Error | error deleting record'
            });
        } else {
            if (result.deletedCount === 0) {
                return res.status(404).json({
                    description:'Not Found | record not found'
                });
            }
            redisClient.del(id.toString(), 'all');
            return res.status(200).json({
                description:'OK | successfully deleted record'
            });
        }
    });
};

module.exports.updateRecord = function (req, res) {
    try {
        var id = req.params.id;
        var idObj = new mongo.ObjectID(id);
    } catch (err) {
        return res.status(400).json({
            description:'Bad Request | invalid request id'
        });
    }
    if (req.body.note_title == undefined || req.body.note_body == undefined) {
        return res.status(400).json({
            description:'Bad Request | request body must contain note_title & note_body'
        });
    }
    const theNote = {
        $set: {
            noteTitle: req.body.note_title,
            noteBody: req.body.note_body,
            updatedDate: Date.now()
        }
    };
    req.app.locals.db.collection(mongoConfigs.collection).updateOne({ '_id': idObj }, theNote, (err, result) => {
        if (err) {
            winston.warn(`error updating record: ${JSON.stringify(theNote)} - ${err}`);
            return res.status(500).json({
                description:'Internal Server Error | error updating record'
            });
        } else {
            if (result.matchedCount === 0) {
                return res.status(404).json({
                    description:'Not Found | record not found',
                });
            }
            redisClient.del(id.toString(), 'all');
            return res.status(200).json({
                description:'OK | successfully updated record'
            });
        }
    });
};