let express = require("express"),
    http    = require("http"),
    path    = require("path"),
    exphbs     = require('express-handlebars');
let mongoose = require("mongoose");
let session = require("express-session");
let mongoStore = require("connect-mongo")(session);

const PORT = 8000;

const app = express();
const server = http.createServer(app);
const io    = require("socket.io")(server);
const formatMessage = require("./config/messages");


require('dotenv').config();

///////////////DATABASE DRIVER CODE



const URI = `mongodb+srv://dbAdmin:${process.env.DBPASSWORD}@basebookstack-zx7sx.mongodb.net/${process.env.DBDATABASE}?retryWrites=true&w=majority`;

mongoose.connect(URI, {useNewUrlParser: true, useUnifiedTopology: true});
let db = mongoose.connection;
db.on('error', console.error.bind(console, 'Error connecting to mongodb'));

//Use sessions for tracking logins
app.use(session({
    secret: 'Server initialized',
    resave: false,
    saveUninitialized: true,
    store: new mongoStore({
        mongooseConnection: db
    })
}));


////////////////////////







const botName = "Chatbot";

// Run when client connects
io.on('connection', socket => {

    socket.on('joinRoom', ({username, room}) => {

        socket.emit('message', formatMessage(botName, 'Welcome to ChatMe'));
        socket.broadcast.to(room).emit('message', formatMessage(botName, `A ${username} has joined the chat`));

        socket.join(room);

        //Runs when client disconnects
        socket.on('disconnect', () => {
            io.emit('message', formatMessage(botName, `${username} has left the chat`));
        });

        socket.on('chatMessage', (msg) => {
            console.log(msg);
            io.emit('message', formatMessage(username, msg));
        });
    });









});

















//// SERVE STATIC FILES
app.use(express.static(path.join(__dirname, '/public')));

let hbs = exphbs.create({
    extname: 'hbs',
    defaultLayout: 'layout',
    layoutsDir: path.join(__dirname + '/views/layouts'),
    helpers: require('./config/handlebar_helpers.js'),
    partialsDir: ['./views/partials/', './views/partials/navbars/']
});
//// SET VIEW ENGINE
app.engine('hbs', hbs.engine);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');



//// INCLUDE ROUTES
let routes = require('./routes/routes.js');
app.use('/', routes);








////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////
////HANDLE ERROR

// catch 404 and forward to error handler
app.use((request, response, next) => {
    let err = new Error('File Not Found');
    err.status = 404;
    next(err);
});


// error handler
// define as the last app.use callback
app.use((err, request, response, next) => {
    response.status(err.status || 500);
    response.render('error', {
        message: err.message,
        error: {},
        error_code: err.status,
        title: 'Error',
        navbar:'clear'
    });
});




////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////
//// CREATE SERVER
server.listen((process.env.PORT || PORT), () => {
    console.log("BookStack is running in port " + PORT);
});
