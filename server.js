var express     = require('express');
var app         = express();
var bodyParser  = require('body-parser');
var morgan      = require('morgan');
var mongoose    = require('mongoose');

var jwt    = require('jsonwebtoken'); 
var config = require('./config'); 
var User   = require('./user'); 

var port = process.env.PORT || 8080; 
mongoose.connect(config.database); 
app.set('superSecret', config.secret); 

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(morgan('dev'));

app.listen(port);
console.log('Magic happens at http://localhost:' + port);