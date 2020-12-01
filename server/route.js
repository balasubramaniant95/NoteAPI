const controller = require("./controller");

module.exports = function (server) {
    server.get('/note', controller.cacheRedis, controller.fetchRecordList);         // fetchRecordList
    server.get('/note/:id', controller.cacheRedis, controller.fetchRecordDetails);  // fetchRecordDetails
    server.post("/note", controller.createRecord);                                  // createRecord
    server.put('/note/:id', controller.updateRecord);                               // updateRecord
    server.delete('/note/:id', controller.deleteRecord);                            // deleteRecord
}