var express = require('express');
var passport = require('passport');
var session = require('express-session');
var pg = require('pg');
var bodyParser = require('body-parser');

var index = require('./routes/index');

var localStrategy = require('passport-local').Strategy;            //many different strategies available

var app = express();

var connectionString = 'postgres://localhost:5432/passport_today';        //by default postgres should alwasy be on port 5432

app.use(express.static('server/public'));

app.use(bodyParser.json());                          //needed at the very minimum in order to post the HTML  (any time working with forms)
app.use(bodyParser.urlencoded({extended:true}));       //this is needed to unzip the json string and translate it to the DOM

//[][][][][][][][][][][][][][][][][][][][][][][][][][]
//               PASSPORT THINGS
//[][][][][][][][][][][][][][][][][][][][][][][][][][]

app.use(session({
    secret: 'secret',       //important   requires for incryption
    //key: 'user',             //not important
    resave: true,                //not important    resave the session if nothing's changed
    saveUninitialized: false,       //not important
    cookie: {maxAge: 60000, secure: false}     //important
}));

app.use(passport.initialize());       //required to configure passport
app.use(passport.session());           //required to configure passport


app.use('/', index);                 //make this the last app.use in the file to source our indexes last; ensures everything is wired up first

//deflate
passport.serializeUser(function(user, done){
    console.log('CL3 - serializeUser user value: ', user);       //upon success, this is console.log #3
    done(null, user.id);
});

//the pg function was copied from <passport.use(), function() below> and the password check was replaced with 'done(null, use)'; also replaced password in query with id
//inflate
passport.deserializeUser(function(id, done){
    console.log('CL4 - passport.deserializeUser() id value: ', id);        //upon success, this is console.log #4 & #7
    pg.connect(connectionString, function(err, client){                 //if you bring in done in the callback function here, the below code will never work because it confuses this done with another done used in the above callback function
        var user = {};

        var query = client.query('SELECT * FROM users WHERE id = $1', [id]);

        query.on('row', function(row){
            user = row;
            console.log('CL5 - passport.deserializeUser() User object', user);       //upon success, this is console.log #5 & #8
            done(null, user);
        });
    });
});

//this is our first config that is passport specific (not Express)
//declaring passport as local
//pass req in our callback to be true
//what the username field is going to be (can be changed if you wanted)
passport.use('local', new localStrategy({
    passReqToCallback: true,
    usernameField: 'username'
}, function(req, username, password, done){

    //this section can be changed out depending on which database we're using
    pg.connect(connectionString, function(err, client){                 //if you bring in done in the callback function here, the below code will never work because it confuses this done with another done used in the above callback function
        var user = {};

        var query = client.query('SELECT * FROM users WHERE username = $1', [username]);

        query.on('row', function(row){
            user = row;
            console.log('CL1 - Passport.use() User object', user);     //upon success, this is console.log #1
        });

        //refactored; takes if statement from above query.on() to check for both valid username and password
        query.on('end', function(){
            if(user && user.password === password){              //third equal matches type
                //success
                console.log('CL2 - Passport.use() Success');        //upon success, this is console.log #2
                done(null, user);
            } else {
                //failure
                done(null, false);    //be as vague as possible on error message on which one (password/username) was wrong
                //done(null, false, {message: 'Wrong somethin\' yo'});    //be as vague as possible on error message on which one (password/username) was wrong
            }
            client.end();
        });
    });
    //does the password match?

}));

var server = app.listen(3000, function(){
    var port = server.address().port;
    console.log('Address', server.address());
    console.log('Listening on port: ', port);
});