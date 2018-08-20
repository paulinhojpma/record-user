var express     = require('express');
var app         = express();
var bodyParser  = require('body-parser');
var morgan      = require('morgan');
var mongoose    = require('mongoose');
var AWS = require('aws-sdk');
var uuid = require('uuid');

var jwt    = require('jsonwebtoken'); 
var config = require('./config'); 
var User   = require('./user'); 

var bucketName = 'node-sdk-sample-' + uuid.v4();
var keyName = 'hello_world.txt';
var credentials = new AWS.SharedIniFileCredentials({profile: 'SQS profiles'});
AWS.config.credentials = credentials;
AWS.config.update({region: 'us-west-2'});

//var bucketPromise = new AWS.S3({apiVersion: '2006-03-01'}).createBucket({Bucket: bucketName}).promise();


var port = process.env.PORT || 8090; 
//mongoose.connect(config.database); 
//app.set('superSecret', config.secret); 

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(morgan('dev'));

app.listen(port);
console.log('Magic happens at http://localhost:' + port);