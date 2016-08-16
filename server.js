// server.js
//https://howtonode.org/deploy-blog-to-heroku
var http = require("http");
var fs = require("fs");
var path = require("path");
var mime = require("mime");
var express = require('express'),
    cors = require('cors'),
    app = express();
  var morgan = require('morgan');
 
var port = process.env.PORT || 3000;
var hostname = 'localhost';

app.use(cors());
app.use(morgan('dev'));

/*
http.createServer(function(request, response) {
  response.writeHead(200, {"Content-Type": "text/plain"});
  response.write("It's alive!");
  response.end();
}).listen(portnumber);
*/

app.use(express.static(__dirname+'/public'));

/*app.listen(port,hostname,function(){
	console.log("Server running at http://${hostname};${port}/");

//res.writeHead(200,{'Content-Type' : 'text/html'});
//res.end('<html><body><h1>Hello World</h1></body></html>');

});
 */
var server = app.listen(port);

//var server = http.createServer(app);

/*app.get('/products/:id', function(req, res, next){
  res.json({msg: 'This is CORS-enabled for all origins!'});
});
 
app.listen(80, function(){
  console.log('CORS-enabled web server listening on port 80');
});
*/

function send404(response) {
  response.writeHead(404, {"Content-type" : "text/plain"});
  response.write("Error 404: resource not found");
  response.end();
}

function sendPage(response, filePath, fileContents) {
  response.writeHead(200, {"Content-type" : mime.lookup(path.basename(filePath))});
  response.end(fileContents);
}

function serverWorking(response, absPath) {
  fs.exists(absPath, function(exists) {
    if (exists) {
      fs.readFile(absPath, function(err, data) {
        if (err) {
          send404(response)
        } else {
          sendPage(response, absPath, data);
        }
      });
    } else {
      send404(response);
    }
  });
}
/*
var server = http.createServer(function(request, response) {
  var filePath = false;

  if (request.url == '/') {
    filePath = "public/index.html";
  } else {
    filePath = "public" + request.url;
  }

  var absPath = "./" + filePath;
  serverWorking(response, absPath);
});
*/
//server.use(cors());
//var port_number = server.listen(process.env.PORT || 3000);
/*
http.createServer(function(request, response) {
  response.writeHead(200, {"Content-Type": "text/plain"});
  response.write("It's alive!");
  response.end();
}).listen(3000);
*/