const http = require("http");
const app = require("../app");

const port = parseInt(process.env.PORT, 10) || 8082;
app.set("port", port);

const server = http.createServer(app);
server.setTimeout(500000);
server.listen(port, () =>{
    console.log(`Node running  @ ${port}`)
});
