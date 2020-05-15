let express = require("express"),
    http    = require("http");


const PORT = 8000;

const app = express();
const server = http.createServer(app)
const io    = require("socket.io")(server);

//Serve static files from /public directory
app.use(express.static(__dirname + '/public'));

app.get('/', (request, response) => {
    response.send("Did i show up on screen?");
});

server.listen((process.env.PORT || PORT), () => {
    console.log("BookStack is running in port " + PORT);
});




