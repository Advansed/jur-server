var 	http 		= require("http");
var 	url 		= require("url");
var 	express 	= require('express');
const 	multer 		= require('multer')
var 	cors 		= require('cors')
var 	fs 			= require('fs');
var requestHandlers     = require("./requestHandlers");

var app 		= express();
const upload 	= multer()


function start(route, handle) {

  	function onRequest(request, response) {
		var pathname = url.parse(request.url).pathname;
		//console.log("Request for " + pathname + " received.");

		//ret = route(handle, pathname, request, response);
		requestHandlers.StartProcess( pathname, request, response );
	
  	}

	console.log("Request received.");

	app.use(cors())

	app.use(express.json({limit: '50mb'}));
	app.use(express.urlencoded({limit: '50mb', extended: false}));

	app.get('/*', onRequest);
	app.post('/*', onRequest);
	   
	var port1 = process.env.PORT || 3030;
	http.createServer(app).listen( port1 );

	console.log("listen on: 3030")

}

exports.start = start;
