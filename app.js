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
    User:                   User model which we use here to delete unverified accounts on an interval
    Conversation:           Conversation model which we use to lookup old messages and delete them


    Other:

    PORT:           The default port number that the server will run on if there is no environmental
                    variable configured (which would happen when deployed on heroku)
    formatMessage:  A utility function that returns a formatted message easy for the client code to use.




*/


/*
* Dependencies
* */
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

/*
* Models for our database objects
* */
const User = require("./models/user")
const Conversation = require('./models/conversation');

/*
* Gives application access to environmental variables
* */
require('dotenv').config();

/*
* Redirects all http traffic to https version of site
* */
app.use(sslRedirect());

/* ////////////////////////////////////////////////////////////////////////////////////////////////
* DATABASE DRIVER CODE
* */

/*
* Connect to database using environmental variables
* URI: The uri given to us by MongoDb in order to remotely connect to our DB
*/

const URI = `mongodb+srv://${process.env.DBUSERNAME}:${process.env.DBPASSWORD}@basebookstack-zx7sx.mongodb.net/${process.env.DBDATABASE}?retryWrites=true&w=majority`;
mongoose.connect(URI, {useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, useFindAndModify: false});

let db = mongoose.connection;
db.on('error', console.error.bind(console, 'Error connecting to mongodb'));


/*
* Use sessions for maintaining logins
* */
app.use(session({
    secret: 'Server initialized',
    resave: false,
    saveUninitialized: true,
    store: new mongoStore({
        mongooseConnection: db
    })
}));


/*
* Use flash in order to prompt messages to user from server.
* e.g. when an incorrect email/password is passed in and we flash a red banner message saying:
* "Incorrect email/password"
 */
app.use(flash())

/*
*
* SET USER VARIABLES TO USE IN TEMPLATES
* 1. Sets user's admin level
* 2. Sets the id of the current user
* 3. Sets the user object of the current user
* 4. Sets the types of flash messages that will be flashed
*   e.g. 'Successfully changed password' -> green
*        'Incorrect email' -> red
*
*
* */

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
/*
* Parse incoming requests.
* i.e. allow us to read form data by accessing
* request.body.<dataname> and request.query.<dataname> in routes
* */
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


//// SERVE STATIC FILES
/*
* Serves static files.
* This is the section that allows us to access everything in /public
* */
app.use(express.static(path.join(__dirname, '/public')));

/*
* Serve handlebars files
* handlebars is a html template engine we use to pass in variables to html/hbs files
* Note: we pass in the paths of every partial html/hbs file we have
* */
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
app.engine('hbs', hbs.engine);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

/*
* Include every routing file from /routes
* this is where the server calls are handled, the main bulk of the project
* */
let routes = require('./routes/routes.js');
let account_routes = require('./routes/account_routes');
let profile_routes = require('./routes/profile_routes');
let message_routes = require('./routes/message_routes');

app.use('/', routes);
app.use('/', account_routes);
app.use('/', profile_routes);
app.use('/', message_routes);

//////////////////////////////////
////////////////////////


// SOCKET HANDLING

/*
* This is probably the least readable part of this file. But as of now, I have not found a better way to write it
* I have tried separating things into functions but it breaks the functionality of the messaging
* */

// Run when client connects
io.on('connection', socket => {

    //This variable will be used to track if a user is already in a room
    // If this variable is not null, then we leave the room it is set to and set it to the new room
    let currentRoom = null;

    socket.on('joinRoom', ({myUserID, theirUserID, room}) => {

        /*
        * This section simply keeps track of rooms and leaves one room when another one is joined
        * */

        /*
        If we are in a room, we first leave it.
        There will only ever be one room because
        everytime we join a new one we leave the old one
        */
        if (currentRoom == null){
            socket.join(room)
            currentRoom = room

        }else{

            /*
            * This is a promise because we first want to leave the room, and then join the next one
            * */
            let switchRooms = new Promise((resolve, reject) => {
                socket.leave(currentRoom)
                // This command removes the listeners from everyone in that room that was looking for it
                // Without this, duplicate messages would be sent and sometimes to the wrong people if
                // We switched between rooms bc the event listener would still be there.
                socket.removeAllListeners('clientToServerMessage');
                resolve();
            })

            switchRooms.then(() => {
                socket.join(room);
                currentRoom = room;
            })
        }

        /*
        * This section handles the actual messaging input and output
        * */

        /*
        * When we receive a message from the client, we want to package it properly to
        * send to our route which will store the message in the database
        * */
        let username = myUserID,
            penpalusername = theirUserID;
        socket.on('clientToServerMessage', (msg) => {
            let msgObj = formatMessage(msg, username, penpalusername, room);

            //Made this environmental bc axios required it to be a full hard coded link
            axios.post(process.env.MYFULLMESSAGEPATH, {
                msgObj: msgObj
            })
                .then(response => {

                    /*
                    * after we receive a response from the route, meaning we stored the message in the database,
                    * we just return the same message with additional variables to populate the front end
                    * */
                    io.in(currentRoom).emit('serverToClientMessage', {
                        msgObj: msgObj,
                        currentUserid: response.data.currentUserid,
                        currentUserfirstname: response.data.currentUserfirstname,
                        penpalUserid: response.data.penpalUserId,
                        penpalUserfirstname: response.data.penpalUserfirstname
                    });
                })
                .catch(error => {
                    console.log(error)
                });
            /*

         */
        });
    });

});

/*
*
* deleteOldUnverifiedUsers:
* This function will delete user's who's emails have not been verified.
* If the account is older than a month and they still have not verified their accounts, delete it
*
* */

let deleteOldUnverifiedUsers = () => {



    User.find({emailverified: false}).then(users => {

        for(let i = 0 ; i < users.length ; i++){
            //600,000 is 10 minutes in milliseconds,
            let fourWeeksInMilliseconds = 2419200000
            let isOld = (Date.now() - users[i].datejoined) > fourWeeksInMilliseconds

            if (isOld){
                User.deleteOne({_id: users[i]._id}, (err) => {
                    if (err){
                        console.log(err)
                    }else{
                        console.log('Successfully deleted old users')
                    }
                })
            }
        }
    }).catch(err => {
        console.log(err)
    })
}

/*
* deleteOldMessages:
* This function will delete messages that are older than
*
* This function does have a weakness, where it doesn't necessarily delete the
* oldest as a guarantee because the for loop is still asynchronous
* This should not be an issue because we are only deleting messages older than a month
* and we run this function once a week
* */

let deleteOldMessages = () => {

    let timeValidFor = 2419200000 // 28 days, or four weeks

    Conversation.find({}).then(conversations => {

        if (conversations){ // if not equal to null

            for (let i = 0 ; i < conversations.length ; i++){

                for (let j = 0 ; j < conversations[i].messages.length ; j ++){
                    //We need to call getTime in order to conver the object/string into seconds since 1970 and then compare those
                    let expires = conversations[i].messages[j].dateSentFromServer.getTime() + timeValidFor;

                    if (expires < Date.now()){

                        async function atomicallyRemove(){
                            let deleteMe =  (conversationIndex, messageIndex) => {

                                return new Promise((resolve, reject) => {
                                    conversations[conversationIndex].messages.splice(messageIndex, 1)//We give the index and how many elements we want to remove
                                    conversations[conversationIndex].save((err) => {
                                        if(err){reject(false)}else{resolve(true)}
                                    })
                                })
                            }

                            let finished = deleteMe(i, j);

                        }

                        atomicallyRemove()
                    }
                }
            }
        }
    }).catch(err => {
        console.log(err);
    })
}

let intervalFunc = () => {
    deleteOldUnverifiedUsers()
    deleteOldMessages()
    console.log("interval function ran")
}

/*
*
* This setInterval function will clean our database every set amount of time
* This is mostly because we are using cheap online services with limited resources, we have to delete where we can
* In this implementation, we check every week for accounts that are older than 4 weeks(1 month).
* It will also remove messages that are older than 1 month because those will take the most amount of storage
*  1 week is 604800000 milliseconds
* */
setInterval(intervalFunc, 604800000);

/*
*
* When we call next from the route files, the next(error) function call passes through here,
* and sets the error message if a 404 is encountered i.e. if the route doesn't exist/invalid link
*
* After this, we arrive at the error handler described below
*
* */
app.use((request, response, next) => {
    let err = new Error('File Not Found');
    err.status = 404;
    next(err);
});

/*
* Error handler
*
* When we call next from the route files, this is where the next call arrives to
*
* Here we call the 'error.hbs' file and pass in the error message and status
* */
app.use((err, request, response, next) => {
    response.status(err.status || 500);
    response.render('error', {
        message: err.message,
        error: {},
        error_code: err.status,
        title: 'Error'
    });
});

/*
* Create Server
* */

server.listen((process.env.PORT || PORT), () => {
    console.log("BookStack is running in port " + PORT);
});






