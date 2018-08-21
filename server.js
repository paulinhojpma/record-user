var express     = require('express');
var app         = express();
var bodyParser  = require('body-parser');
var morgan      = require('morgan');
var mongoose    = require('mongoose');
var AWS = require('aws-sdk');
var uuid = require('uuid');

var jwt    = require('jsonwebtoken'); 
//var config = require('./config'); 

var credentials = AWS.config.loadFromPath('./config.json');
var sqs = new AWS.SQS({apiVersion: '2012-11-05'});





app.get("/receber", function(req, res){
	var params = {
 AttributeNames: [
    "SentTimestamp"
 ],
 MaxNumberOfMessages: 10,
 MessageAttributeNames: [
    "All"
 ],
 QueueUrl: "https://sqs.us-east-2.amazonaws.com/700728690443/Lista.fifo",
 VisibilityTimeout: 20,
 WaitTimeSeconds: 0
};

sqs.receiveMessage(params, function(err, data) {
	var msg;
  if (err) {
    console.log("Receive Error", err);
  } else if (data.Messages) {
  	//console.log("Mensagens recebidas - "+ JSON.stringify(data.Messages[0]));
  	console.log("Mensagens recebidas id- "+ data.Messages[0].MessageId);
  	console.log("Mensagens recebidas body- "+ data.Messages[0].Body);
  	//console.log("Mensagens recebidas autor sem - "+ data.Messages[0].MessageAttributes["Author"]["StringValue"]);
  	 //console.log("Mensagens recebidas autor com - "+ JSON.stringify(data.Messages[0].MessageAttributes["Author"]["StringValue"]));
  	msg = data.Messages;
    var deleteParams = {
      QueueUrl: "https://sqs.us-east-2.amazonaws.com/700728690443/Lista.fifo",
      ReceiptHandle: data.Messages.ReceiptHandle
    };
    sqs.deleteMessage(deleteParams, function(err, data) {
      if (err) {
        console.log("Delete Error", err);
      } else {
        console.log("Message Deleted", data);
      }
      res.json({message: msg});
    });
  }
});

});

app.get("/criar", function(req, res){
	var obj ={};
	var id = 0;var params = {
	  Entries: [],
	  QueueUrl: 'https://sqs.us-east-2.amazonaws.com/700728690443/Lista.fifo' /* required */
	};
	var i;

	for(i =0; i < 10 ; i++){
		
		
		obj = {
	      Id: 'vicente_'+i, /* required */
	      MessageBody: 'Ronaldo_'+i, /* required */
	      DelaySeconds: 0,
	      MessageAttributes: {
	        "Ronaldo": {
	          DataType: 'String', /* required */	          
	          StringValue: 'spock_'+i
	        }
	        
	      },

	      MessageDeduplicationId:"vicentinho"+ ((1+i)*2),
	      MessageGroupId: "klebernilton_"+i
	    };

	    params.Entries.push(obj);
	     console.log("Loop - "+ obj["Id"]);


	}
	console.log(JSON.stringify(params));

	sqs.sendMessageBatch(params, function(err, data) {
	  if (err){ console.log(err, err.stack);

	  } // an error occurred
	  else {    console.log(data);
	  }; 
	    res.json({data: data}) ;      // successful response
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
};*/




/*sqs.sendMessage(params, function(err, data) {
  if (err) {
    console.log("Error", err);
  } else {
    console.log("Success", data.MessageId);
   
  }
   res.json({data: data.MessageId, body: data.MessageAttributes});
});*/

//res.json({data: "fude", body: "ow droga"});
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



var params = {
  QueueName: 'Lista.fifo'
};

sqs.getQueueUrl(params, function(err, data) {
  if (err) {
    console.log("Error", err);
  } else {
    console.log("Success", data.QueueUrl);
  }
});



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