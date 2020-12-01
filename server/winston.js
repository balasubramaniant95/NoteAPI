const winston = require('winston');

const options = {
    file: {
        filename: `./logs/server.log`,
        handleExceptions: true,
        prettyPrint:true
    }
};

var logger = winston.createLogger ({
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    transports: [
        new winston.transports.File(options.file),
        new winston.transports.Console()
    ],
    exitOnError: false
});

logger.stream = {
    write: function (message, encoding) {
        logger.info(message);
    }
};

module.exports = logger;