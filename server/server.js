const express = require('express');
const { MongoClient } = require('mongodb');
const bodyParser = require('body-parser');
var responseTime = require('response-time')

const morgan = require('morgan');
const winston = require('./winston');

const configs = require('./config');

var server = express();
server.use(morgan('combined', { stream: winston.stream }));
server.use(responseTime())
server.use(express.json());
server.use(bodyParser.urlencoded({ extended:true }))

const mongoURI = `mongodb://${configs.mongodb.hostname}:${configs.mongodb.port}`
const mongoDB = configs.mongodb.db
const port = process.env.PORT || configs.noteAPI.port;

MongoClient.connect(mongoURI, { useNewUrlParser:true, useUnifiedTopology:true }, (err, client) => {
    if (err) {
        winston.error(`unable to connect to MongoDB @ ${mongoURI}`);
        throw err;
    }

    const database = client.db(mongoDB);
    server.locals.db = database;

    require('./route')(server);

    server.listen(port, () => {
        winston.info(`noteAPI up & running at port: ${port}`);
    });
});