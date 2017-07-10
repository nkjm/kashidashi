let restify = require("restify");

let server = restify.createServer();
server.listen(process.env.PORT || 3000, function() {
    console.log("Node is running...");
});

server.get("/", (req, res, next) => {
    res.send({body: "Hello World"});
});
