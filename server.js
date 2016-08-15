//assignment1.js

// Serving Static Content
var express = require('express');
var morgan = require('morgan');

var dishes  = require('./dishRouter');
var promos  = require('./promoRouter');
var leaders = require('./leaderRouter');

var hostname = 'localhost';
var port = 3000;
var app = express();

app.use(morgan('dev'));

var dishRouter = express.Router();
var promoRouter = express.Router();
var leaderRouter = express.Router();


dishes(dishRouter,'dish', function(err,rectangle) {
	if (err) {
		console.log(err);
	}
	else {
		console.log("dishRouter has een setup");
    }
});

promos(promoRouter,'promotion', function(err,rectangle) {
	if (err) {
		console.log(err);
	}
	else {
		console.log("promoRouter has een setup");
    }
});

leaders(leaderRouter,'leader', function(err,rectangle) {
	if (err) {
		console.log(err);
	}
	else {
		console.log("leaderRouter has een setup");
    }
});


app.use('/dishes',dishRouter);
app.use('/promotions',promoRouter);
app.use('/leadership',leaderRouter);

app.use(express.static(__dirname+'/public'));

app.listen(port, hostname, function(){
  console.log('Server running at http://${hostname}:${port}/');
});
