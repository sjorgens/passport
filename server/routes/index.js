/**
 * Created by Scott on 1/25/16.
 */

var express = require('express');
var path = require('path');
var router = express.Router();
var passport = require('passport');

router.get('/', function(request, response){
    response.sendFile(path.join(__dirname, '../public/views/index.html'));
});

router.get('/*', function(request, response, next){     //what is the purpose of this?
    if(request.isAuthenticated()){
        next();
    } else {
        response.redirect('/login');
    }
});

router.get('/fail', function(request, response){
    console.log('Request user on fail route', request.user);
    response.sendFile(path.join(__dirname, '../public/views/fail.html'));
});

router.get('/success', function(request, response){
    console.log('CL6 - Request user on success route', request.user);                //upon success, this is console.log #6
    response.sendFile(path.join(__dirname, '../public/views/success.html'));
});

router.get('/getUser', function(request, response){
    console.log('CL9 - Huzzah, a user!', request.user);                   //upon success, this is console.log #9
    console.log('CL10 - Authorized:', request.isAuthenticated());          //upon success, this is console.log #10
    response.send(request.user);
});

router.post('/', passport.authenticate('local', {
    successRedirect: '/success',
    failureRedirect: '/fail'
}));

module.exports = router;