// server.js
//https://howtonode.org/deploy-blog-to-heroku

var express = require('express'),
    cors = require('cors'),
    app = express();
var morgan = require('morgan');
 
var port = process.env.PORT || 3000;
var hostname = 'localhost';

app.use(morgan('dev'));
//app.use(cors());


/*
app.all('*', function(req, res, next) {
//app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});
*/


app.use(express.static(__dirname+'/public'));


var server = app.listen(port);
