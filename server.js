// server.js

// set up ======================================================================
// get all the tools we need
var express  = require('express');
var app      = express();
var server = require('http').Server(app);

var port     = process.env.PORT || 8080;
var mongoose = require('mongoose');
var passport = require('passport');
var flash    = require('connect-flash');

var morgan       = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser   = require('body-parser');
var session      = require('express-session');

var configDB = require('./config/database.js');
var http = require('http').Server(app);
var io = require('socket.io')(http);
var chatdb = require('./app/models/chat.js');

// configuration ===============================================================
mongoose.connect(configDB.url); // connect to our database

require('./config/passport')(passport); // pass passport for configuration

// set up our express application
app.use(morgan('dev')); // log every request to the console
app.use(cookieParser()); // read cookies (needed for auth)
app.use(bodyParser()); // get information from html forms

app.set('view engine', 'ejs'); // set up ejs for templating


// required for passport
app.use(session({ secret: 'ilovescotchscotchyscotchscotch' })); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session
app.use(express.static(__dirname + '/views'));
// socket.io
io.on('connection', function (socket) {
    console.log('a user connected');

    socket.on('chat message', function(msg){
        var name = "efe";
        chatdb.saveMsg({name: name, msg: msg}, function(err){
            if(err) throw err;
            io.emit('message', msg);
        });
    });

    socket.on('disconnect', function () {
        console.log('user disconnected');
    });
});

// routes ======================================================================
require('./app/routes.js')(app, passport); // load our routes and pass in our app and fully configured passport

// launch ======================================================================
http.listen(port);
console.log('The magic happens on port ' + port);
