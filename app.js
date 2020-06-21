let express = require("express"),
    http    = require("http"),
    path    = require("path"),
    exphbs     = require('express-handlebars');
let mongoose = require("mongoose");
let session = require("express-session");
let mongoStore = require("connect-mongo")(session);
let sslRedirect = require("heroku-ssl-redirect");




let bodyParser = require("body-parser");




const PORT = 8000;

const app = express();
const server = http.createServer(app);
const io    = require("socket.io")(server);
const formatMessage = require("./config/messages");

// Gives access to environmental variables
require('dotenv').config();


// Redirects all http traffic to https version
app.use(sslRedirect());

///////////////DATABASE DRIVER CODE



const URI = `mongodb+srv://${process.env.DBUSERNAME}:${process.env.DBPASSWORD}@basebookstack-zx7sx.mongodb.net/${process.env.DBDATABASE}?retryWrites=true&w=majority`;
mongoose.connect(URI, {useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true});
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


// SET USER VARIABLES TO USE IN TEMPLATES
//Make user ID available in handlbars templates
app.use((request, response, next) => {
    response.locals.admin_level = request.session.admin_level;
    response.locals.currentUser = request.session.userId;
    next();
});



// PARSE INCOMING REQUESTS
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));






////////////////////////


// SOCKET HANDLING


const botName = "Chatbot";
let message_routes = require('./routes/message_routes.js');
// Run when client connects
io.on('connection', socket => {

    //console.log(socket.handshake.headers.cookie);

    socket.on('joinRoom', ({username, room}) => {


        socket.join(room);

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
    partialsDir: [
        './views/partials/',
        './views/partials/navbars/',
        './views/partials/footers/'
    ]
});


//// SET VIEW ENGINE
app.engine('hbs', hbs.engine);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');





//// INCLUDE ROUTES
let routes = require('./routes/routes.js');
let account_routes = require('./routes/account_routes');
app.use('/', routes);
app.use('/', account_routes);









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



