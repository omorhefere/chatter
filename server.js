var express = require('express');
var app = express();
var server = require('http').Server(app);

var port = process.env.PORT || 8080;
var mongoose = require('mongoose');
var passport = require('passport');
var flash = require('connect-flash');

var morgan = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');

// Add connect-mongo to project - npm install connect-mongo
var MongoStore = require('connect-mongo')(session);

var configDB = require('./config/database.js');
var http = require('http').Server(app);
var io = require('socket.io')(http);
var chatdb = require('./app/models/chat.js');

// configuration ===============================================================
// NOTE: This might need to be put into a callback/promise inside an initialize function
var db = mongoose.connect(configDB.url); // connect to our database

require('./config/passport')(passport); // pass passport for configuration

// set up our express application
app.use(morgan('dev')); // log every request to the console
app.use(cookieParser()); // read cookies (needed for auth)
app.use(bodyParser()); // get information from html forms

app.set('view engine', 'ejs'); // set up ejs for templating
var mongoStore = new MongoStore({
    mongooseConnection: db.connection,
});
app.use(session({
    secret: 'secret',
    clear_interval: 900,
    cookie: {
        maxAge: 2 * 60 * 60 * 10000
    },
    store: mongoStore,
}));


// required for passport
app.use(session({
    secret: 'secret'
})); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session
app.use(express.static(__dirname + '/views'));
app.use(express.static(__dirname + '/public'));


// Intercept Socket.io's handshake request
io.use(function(socket, next) {

    // Use the 'cookie-parser' module to parse the request cookies
    cookieParser('secret')(socket.request, {}, function(err) {

        // Get the session id from the request cookies
        var sessionId = socket.request.signedCookies ? socket.request.signedCookies['connect.sid'] : undefined;

        if (!sessionId) return next(new Error('sessionId was not found in socket.request'), false);

        // Use the mongoStorage instance to get the Express session information
        mongoStore.get(sessionId, function(err, session) {

            if (err) return next(err, false);
            if (!session) return next(new Error('session was not found for ' + sessionId), false);

            // Set the Socket.io session information
            socket.request.session = session;

            // Use Passport to populate the user details
            passport.initialize()(socket.request, {}, function() {
                passport.session()(socket.request, {}, function() {
                    // This will prohibit non-authenticated users from connecting to your
                    // SocketIO server.
                    if (socket.request.user) {
                        next(null, true);
                    } else {
                        next(new Error('User is not authenticated'), false);
                    }
                });
            });
        });
    });
});

// socket.io
io.on('connection', function(socket) {

    socket.on('chat message', function(msg) {
        console.log(socket.request.user.facebook.name || socket.request.user.local.email);
        var name = socket.request.user.facebook.name || socket.request.user.local.email;
        var data = {
            userid: name,
            msg: msg,
        };
        console.log(data);
        chatdb.saveMsg({
            name: name,
            msg: msg
        }, function(err) {
            if (err) throw err;
            io.emit('chat message', data);
        });
    });
    socket.on('disconnect', function() {
        console.log('user disconnected');
    });
});

// routes ======================================================================
require('./app/routes.js')(app, passport); // load our routes and pass in our app and fully configured passport

// launch ======================================================================
http.listen(port);
console.log('The magic happens on port ' + port);
