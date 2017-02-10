var express = require('express'),
    stylus = require('stylus'),
    logger = require('morgan'),
    bodyParser = require('body-parser'),
    mongoose = require('mongoose');
var consts = require("./server.constants");

var envMode = process.env.NODE_ENV = process.env.NODE_ENV || consts.ENVIRONMENT_MODE_DEVELOPMENT ;
var port = process.env.PORT || 8000;
//mongo ds147799.mlab.com:47799/taehovision -u <dbuser> -p <dbpassword>
var dbUrl = envMode != consts.ENVIRONMENT_MODE_PRODUCTION ?
            "mongodb://localhost:30001/taehovision"
            :"mongodb://taeho:bizflow@ds147799.mlab.com:47799/taehovision";

var app = express();

// Jade Setting
console.log("__dirname=" + __dirname);
app.engine('jade', require('jade').__express);
app.set('views', __dirname + '/server/views');
app.set('view engine', 'jade');

// Logger
app.use(logger('dev'));


// Variables
var mongoMessage;

// bodyParser
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());

// Stylus
function compile(str, path) {
    return stylus(str).set('filename', path);
}
app.use(stylus.middleware(
    {
        src: __dirname + '/public',
        compile: compile
    }
));

// Static middle ware
//      public set up a static routing to the public directory below by using Express' static middleware.
app.use(express.static(__dirname + '/public'));

// MongoDB with Mongoose
console.log(envMode + " dbUrl=" + dbUrl);
mongoose.connect(dbUrl);
var db = mongoose.connection;
db.on('error', ( function(err){
    console.error(err.message);
})).on('open', function() {
    console.log('multivision db opened.');
});
// create a schema - one field named message
var messageSchema = mongoose.Schema({message:String});
// create a model variable,
var Message = mongoose.model('message', messageSchema);
Message.findOne().exec(function(err, messageDoc) {
    mongoMessage = messageDoc.message;
});

app.get('/html/:pathPath', function(req, res) {
    console.log("get html");
    res.render('hello');
});

app.get('/partials/:partialPath', function(req, res) {
    console.log("get partials");
    res.render('partials/' + req.params.partialPath);
});

app.get('*', function(req, res) {
    console.log("get *");
    res.render('index', {mongoMessage:mongoMessage});
});

app.listen(port);
console.log('Listening on port ' + port + '...');
