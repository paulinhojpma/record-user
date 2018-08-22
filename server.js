var express     = require('express');
var app         = express();
var bodyParser  = require('body-parser');
var morgan      = require('morgan');
var mongoose    = require('mongoose');
var AWS = require('aws-sdk');
var uuid = require('uuid');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
var jwt    = require('jsonwebtoken'); 
//var config = require('./config'); 

var credentials = AWS.config.loadFromPath('./config.json');
var sqs = new AWS.SQS({apiVersion: '2012-11-05'});




app.get("/createQeue/:id", function(req, res){
	console.log("Entrou no createQeue - "+ req.params.id);
	var params = {
	  "QueueName": req.params.id+".fifo",
	 Attributes: {
    	'FifoQueue': "true"
		}   
	  
	};
	sqs.createQueue(params, function(err, data) {
	  if (err) {console.log(err, err.stack);
	  	res.json({succes: false, urlQeue: ""});
	  } // an error occurred
	  else{
	  	console.log(data.QueueUrl); 
	  	res.json({success: true, urlQeue: data.QueueUrl});

	  }      
	           // successful response
	});


});






app.get("/receber", function(req, res){
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
	var msg;
  if (err) {
    console.log("Receive Error", err);
  } else if (data.Messages) {
  	//console.log("Mensagens recebidas - "+ JSON.stringify(data.Messages[0]));
  	//console.log("Mensagens recebidas id- "+ data.Messages[0].MessageId);
  	console.log("Mensagens recebidas body- "+ data.Messages[0].Body);
  	//console.log("Mensagens recebidas autor sem - "+ data.Messages[0].MessageAttributes["Author"]["StringValue"]);
  	 //console.log("Mensagens recebidas autor com - "+ JSON.stringify(data.Messages[0].MessageAttributes["Author"]["StringValue"]));
  	

  	msg = data.Messages;
  	/*for(var i = 0; i < data.Messages.length; i++){
  		console.log("ID - "+ data.Messages[i].Body);
  	}

  	var i;
  	var paramsDel = {
		  	Entries: [],
		  QueueUrl: 'https://sqs.us-east-2.amazonaws.com/700728690443/Lista.fifo' 
		};
	var obj ={};	
  	for(i=0; i < msg.length; i++){
  		obj = {
	      Id: msg[i].MessageId, 
	      ReceiptHandle: msg[i].ReceiptHandle 
	    }
	    paramsDel.Entries.push(obj);
  	}

		  console.log(JSON.stringify(paramsDel));
		sqs.deleteMessageBatch(paramsDel, function(err, data) {
		  if (err) console.log(err, err.stack); // an error occurred
		  else     console.log(data);   
		  res.json({message: data});        // successful response
		});*/

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
      res.json({message: msg});
    });
  }
});

});



function sendMessages(num){
	var obj ={};
	
	var lim = num +10;
	var params = {
	  Entries: [],
	  QueueUrl: 'https://sqs.us-east-2.amazonaws.com/700728690443/Lista.fifo' /* required */
	};
	
	var i;
	for(num; num < lim ; num++){
		console.log("DENTRO DO SENDMESSAGES --- "+ num);
		
		obj = {
	      Id: 'vicente_'+num, /* required */
	      MessageBody: ''+num, /* required */
	      DelaySeconds: 0,
	      MessageAttributes: {
	        "Ronaldo": {
	          DataType: 'String', /* required */	          
	          StringValue: 'spock_'+num
	        }
	        
	      },

	      MessageDeduplicationId:"vicentinho"+num, //((1+i)*2),
	      MessageGroupId: "klebernilton_"+num
	    };

	    params.Entries.push(obj);
	    


	}
	//console.log(JSON.stringify(params));

	sqs.sendMessageBatch(params, function(err, data) {
	  if (err){ console.log(err, err.stack);

	  } // an error occurred
	  else {
	  	console.log(data);
	  
	  }; 
	    //res.json({data: data});  
	       // successful response
	});
	return num; 
	
}


app.get("/enviarMenssagem/:id/:latitude/:longitude", function(req, res){
	
	var url = "";
	var num = 0;
	getQeueURL(req.params.id, function(val){
		url = val;
		console.log("URL retornado do getQeueURL - "+ url);
		getNumeroMensagens(url, function(val){

		num = parseInt(val);
		console.log("Num retornado do getNumeroMensagens - "+ num);

		if(num < 10){
			enviarMensagem(res, url, req.params.latitude, req.params.longitude, req.params.id, function(msg){

				res.json(msg);
			});
		}else{

			deletarMensagensSobressalentes(num, url, function(data){
					if(data.success){
						enviarMensagem(res, url, req.params.latitude, req.params.longitude, req.params.id, function(msg){

							res.json(msg);
						});
					}else{
						res.json({success: false});
					}
				
			});
		}
	});

	});
 

});

app.get("/receberMensagens/:id", function(req, res){
		getQeueURL(req.params.id, function(url){

			receberMenssagens(url, function(messages){

				res.json({messages});
			});

		});

})

app.get("/removerFila/:id", function(req, res){
	getQeueURL(req.params.id, function(url){

		removerFila(url, function(data){
			res.json(data);
		})
	});


});

function removerFila(url, fn){
	var params = {
	  QueueUrl: url /* required */
	};
	sqs.deleteQueue(params, function(err, data) {
	  if(err){
	  	console.log(err, err.stack);
	  	fn({success: false, data: data});
	  }else{
	  console.log(data); 
	 	 fn({success: true, data: data});
	  }          // successful response
	});
}

function receberMenssagens(url, fn){
	var params = {
  QueueUrl: url,
  AttributeNames: ["All"],
  MaxNumberOfMessages: 10,
  MessageAttributeNames: ["All"],
  
  VisibilityTimeout:30,
  WaitTimeSeconds: 0
};
sqs.receiveMessage(params, function(err, data) {
  if(err){console.log(err, err.stack);} // an error occurred
  else{
  console.log(data);
  	fn(data.Messages);
  	}           // successful response
});

}

function getNumeroMensagens(qeueURL,fn){
	var params = {
	  QueueUrl: qeueURL, 
	  AttributeNames: ["All"]
	};
	sqs.getQueueAttributes(params, function(err, data) {
	  if (err) console.log(err, err.stack); // an error occurred
	  else{
	  		
	  	//console.log(JSON.stringify(data));
	  	console.log(data.Attributes["ApproximateNumberOfMessages"]);
	  	fn(data.Attributes["ApproximateNumberOfMessages"]);
	  }           // successful response
	});

}


function getQeueURL(qeueName, fn){
	var params = {
	  QueueName: qeueName+".fifo", /* required */
	 
	};
	sqs.getQueueUrl(params, function(err, data) {
	  if(err){ console.log(err, err.stack);} // an error occurred
	  else {
	  	console.log(data.QueueUrl);
	  	 fn(data.QueueUrl);
	  }
	           
	});
}

function enviarMensagem(res, url, latitude, longitude, id, fn){
	var params = {
 
	 MessageAttributes: {
	  "Latitude": {
	    DataType: "String",
	    StringValue: latitude
	   },
	  "Longitude": {
	    DataType: "String",
	    StringValue: longitude
	   }
	 },
	 MessageBody: "Inserção de latitude e longitude",
	 MessageGroupId: id,
	 MessageDeduplicationId: id+latitude+longitude,

	 QueueUrl: url
	};
	

	sqs.sendMessage(params, function(err, data) {
	  if (err) {
	    console.log("Error", err);
	  } else {
	    console.log("Success", data.MessageId);
	   
	  }
	   fn({success: true, data: data.MessageId});
	});

}
function deletarMensagensSobressalentes(num, url, fn){
	num = num - 9

	var params = {
  QueueUrl: url,
  AttributeNames: ["SentTimestamp"],
  MaxNumberOfMessages: num,
  MessageAttributeNames: ["All"],
  
  VisibilityTimeout: 30,
  WaitTimeSeconds: 0
};
sqs.receiveMessage(params, function(err, data) {
  if(err) console.log(err, err.stack); // an error occurred
  else{
  	//fn(data);
  	var i;
  	var msg = data.Messages;
  	var paramsDel = {
		  	Entries: [],
		  QueueUrl: url 
		};
	var obj ={};	
  	for(i=0; i < msg.length; i++){
  		obj = {
	      Id: msg[i].MessageId, 
	      ReceiptHandle: msg[i].ReceiptHandle 
	    }
	    paramsDel.Entries.push(obj);
  	}

		 //console.log(JSON.stringify(paramsDel));
		sqs.deleteMessageBatch(paramsDel, function(err, data) {
		  if(err) console.log(err, err.stack); // an error occurred
		  else{console.log(data); 
		  fn({success: true, message: msg});
		}
		     
		});

  }          
});

}



var port = process.env.PORT || 8090; 
//mongoose.connect(config.database); 
//app.set('superSecret', config.secret); 

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(morgan('dev'));

app.listen(port);
console.log('Magic happens at http://localhost:' + port);