/*
    Dependencies:

    express:                Framework for nodejs
    http:                   Used to create a server
    path:                   Used to combine relative paths and show our app where its static files are, etc.
    express-handlebars:     Used to configure handlebars in an express session
    mongoose:               Used as a wrapper for mongodb, we use it to connect to the database
    express-session:        Allows sessions which are basically how users log in to their account
    connect-mongo:          Used for storing sessions in our database
    heroku-ssl-redirect:    Used so that we can easily use our https and reroute anyone who tries to access http version
    axios:                  Used to make requests to routes from inside socket.io, so that we can save our conversation in
                            our database
    body-parser:            Used to parse information from forms mainly
    socket.io:              Create a socket connection with server and client, how we send messages without reloading
    connect-flash:          This is in order to flash messages from the server such as 'Incorrect password'
                            and other things of that nature



    Other:

    PORT:           The default port number that the server will run on if there is no environmental
                    variable configured (which would happen when deployed on heroku)
    formatMessage:  A utility function that returns a formatted message easy for the client code to use.




*/



let express = require("express"),
    http    = require("http"),
    path    = require("path"),
    exphbs     = require('express-handlebars');
let mongoose = require("mongoose");
let session = require("express-session");
let mongoStore = require("connect-mongo")(session);
let sslRedirect = require("heroku-ssl-redirect");
let axios = require("axios");
let bodyParser = require("body-parser");
const PORT = 8000;
const app = express();
const server = http.createServer(app);
const io    = require("socket.io")(server);
const formatMessage = require("./util/messages");
const flash = require("connect-flash");





// Gives access to environmental variables
require('dotenv').config();


// Redirects all http traffic to https version
app.use(sslRedirect());

////////////////////////////////////////////////
//DATABASE DRIVER CODE

//URI: The uri given to us by MongoDb in order to remotely connect to our DB
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

app.use(flash())


////////////////////////////////////////////////////////////////


// SET USER VARIABLES TO USE IN TEMPLATES
// 1. Makes user's admin level
// 2. Sets the id of the current user
// 3. Sets the user object of the current user
// 4. Sets the flash messages that will be flashed
//    e.g. 'Successfully changed password'
app.use((request, response, next) => {
    response.locals.admin_level = request.session.admin_level;
    response.locals.currentUser = request.session.userId;
    response.locals.currentUserObject = request.session.userObject;
    response.locals.flash = {
        notice: request.flash('notice'),
        error: request.flash('error'),
        success: request.flash('success'),
    }
    next();
});




// PARSE INCOMING REQUESTS
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


















//// SERVE STATIC FILES
app.use(express.static(path.join(__dirname, '/public')));

let hbs = exphbs.create({
    extname: 'hbs',
    defaultLayout: 'layout',
    layoutsDir: path.join(__dirname + '/views/layouts'),
    helpers: require('./util/handlebar_helpers.js'),
    partialsDir: [
        './views/partials/',
        './views/partials/navbars/',
        './views/partials/footers/',
        './views/partials/profile/'
    ]
});


//// SET VIEW ENGINE
app.engine('hbs', hbs.engine);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');





//// INCLUDE ROUTES
let routes = require('./routes/routes.js');
let account_routes = require('./routes/account_routes');
let profile_routes = require('./routes/profile_routes');
let message_routes = require('./routes/message_routes');

app.use('/', routes);
app.use('/', account_routes);
app.use('/', profile_routes);
app.use('/', message_routes);






////////////////////////


// SOCKET HANDLING


// Run when client connects
io.on('connection', socket => {

    //console.log(socket.handshake.headers.cookie);

    socket.on('joinRoom', ({myUserID, theirUserID, room}) => {

        let username = myUserID,
            penpalusername = theirUserID;

        socket.join(room);

        socket.on('chatMessage', (msg) => {

            let messageObject = formatMessage(msg, username, penpalusername);

            axios.post(process.env.MYFULLMESSAGEPATH, {
                msgObj: messageObject,
                room: room
            })
                .then(response => {

                    //io.emit('serverObject', retVal)
                    io.emit('message', {
                        messageObject: messageObject,
                        currentUserid: response.data.currentUserid,
                        currentUserfirstname: response.data.currentUserfirstname,
                        penpalUserid: response.data.penpalUserId,
                        penpalUserfirstname: response.data.penpalUserfirstname
                    });
                })
                .catch(error => {

                    //io.emit('serverObject', error)


                console.log(error)
            });



        });
    });

});








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



