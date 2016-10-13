'use strict'
// set up ========================
var express  = require('express');
var app      = express();    // create our app w/ express

app.use(express.static(__dirname + '/public'));  // set the static files location /public/img will be /img for users

// application -------------------------------------------------------------
app.get('*', function(req, res) {
    res.sendfile('./public/index.html'); // load the single view file (angular will handle the page changes on the front-end)
});
	
// listen (start app with node server.js) ======================================
app.listen(9082, '0.0.0.0');
console.log("App listening on port 9082");
