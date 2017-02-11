var express = require('express');
var stylus = require('stylus');
var logger = require('morgan');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');

var env = process.env.NODE_ENV = process.env.NODE_ENV || 'development';

var app = express();

function compile(str, path) {
    return stylus(str).set('filename', path);
}

app.set('views', __dirname + '/server/views');
app.set('view engine', 'pug');
app.use(logger('dev'));
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());
app.use(stylus.middleware(
    {
        src: __dirname + '/public',
        compile: compile
    }
));
/*
app.use('/less-css', function() {
    console.log("/less-css");
    expressLess(__dirname + '/public/bower_components');
});
*/

console.log("[DEBUG] current directory=" + __dirname);

app.use(express.static(__dirname + '/public'));
//add this so the browser can GET the bower files
app.use('/bower_components', express.static('/bower_components'));


if(env === 'development') {
    mongoose.connect("mongodb://localhost:30001/taehovision");
} else {
    mongoose.connect("mongodb://taeho:bizflow@ds147799.mlab.com:47799/taehovision");
}
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error...'));
db.once('open', function callback() {
    console.log('multivision db opened');
});
var messageSchema = mongoose.Schema({message: String});
var Message = mongoose.model('Message', messageSchema);
var mongoMessage;
Message.findOne().exec(function(err, messageDoc) {
    mongoMessage = messageDoc.message;
});

app.get('/partials/:partialPath', function(req, res) {
    res.render('partials/' + req.params.partialPath);
});

app.get('/', function(req, res) {
    res.render('includes/index', {
        mongoMessage: mongoMessage
    });
});

var port = process.env.PORT || 8000;
app.listen(port);
console.log('Listening on port ' + port + '...');
