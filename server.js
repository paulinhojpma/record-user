var express     = require('express');
var app         = express();
var bodyParser  = require('body-parser');
var morgan      = require('morgan');
var mongoose    = require('mongoose');
var AWS = require('aws-sdk');
var uuid = require('uuid');

var jwt    = require('jsonwebtoken'); 
var config = require('./config'); 

var credentials = AWS.config.loadFromPath('./config.json');
var sqs = new AWS.SQS({apiVersion: '2012-11-05'});



var params = {
 AttributeNames: [
    "SentTimestamp"
 ],
 MaxNumberOfMessages: 1,
 MessageAttributeNames: [
    "All"
 ],
 QueueUrl: "https://sqs.us-east-2.amazonaws.com/700728690443/Lista.fifo",
 VisibilityTimeout: 20,
 WaitTimeSeconds: 0
};

sqs.receiveMessage(params, function(err, data) {
  if (err) {
    console.log("Receive Error", err);
  } else if (data.Messages) {
  	console.log("Mensagens recebidas body- "+ data+ data);
  	console.log("Mensagens recebidas body- "+ data.body+ data.);
  	console.log("Mensagens recebidas id- "+ data.MessageId+ data.Body);
    var deleteParams = {
      QueueUrl: "https://sqs.us-east-2.amazonaws.com/700728690443/Lista.fifo",
      ReceiptHandle: data.Messages[0].ReceiptHandle
    };
    sqs.deleteMessage(deleteParams, function(err, data) {
      if (err) {
        console.log("Delete Error", err);
      } else {
        console.log("Message Deleted", data);
      }
    });
  }
});



/*var params = {
 
 MessageAttributes: {
  "Title": {
    DataType: "String",
    StringValue: "The Whistler"
   },
  "Author": {
    DataType: "String",
    StringValue: "John Grisham"
   },
  "WeeksOn": {
    DataType: "Number",
    StringValue: "6"
   }
 },
 MessageBody: "Information about current NY Times fiction bestseller for week of 12/11/2016.",
 MessageGroupId: "vicentinho090909",
 MessageDeduplicationId: "vicentinho090909111111",

 QueueUrl: "https://sqs.us-east-2.amazonaws.com/700728690443/Lista.fifo"
};

sqs.sendMessage(params, function(err, data) {
  if (err) {
    console.log("Error", err);
  } else {
    console.log("Success", data.MessageId);
  }
});*/

/*var params = {
  QueueUrl: 'https://sqs.us-east-2.amazonaws.com/700728690443/Lista.fifo'
 };

sqs.deleteQueue(params, function(err, data) {
  if (err) {
    console.log("Error", err);
  } else {
    console.log("Success", data);
  }
});*/



/*var params = {
  QueueName: 'Lista.fifo'
};

sqs.getQueueUrl(params, function(err, data) {
  if (err) {
    console.log("Error", err);
  } else {
    console.log("Success", data.QueueUrl);
  }
});*/



/*var params = {
  QueueName: 'lista',
  Attributes: {
    'DelaySeconds': '60',
    'MessageRetentionPeriod': '86400'
  }
};

sqs.createQueue(params, function(err, data) {
  if (err) {
    console.log("Error", err);
  } else {
    console.log("Success", data.QueueUrl);
  }
});*/

/*var params= {};
sqs.listQueues(params, function(err, data) {
  if (err) {
    console.log("Error", err);
  } else {
    console.log("Success", data.QueueUrls);
  }
});*/


var port = process.env.PORT || 8090; 
//mongoose.connect(config.database); 
//app.set('superSecret', config.secret); 

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(morgan('dev'));

app.listen(port);
console.log('Magic happens at http://localhost:' + port);