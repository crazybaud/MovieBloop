
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , http = require('http')
  , path = require('path');

var app = express();
var program = require('commander');

// --------
// CMD para

program
  .version('0.0.2')
  .option('-d, --ServerNameDB [value]', 'Server name of Mongodb, on default port, default 127.0.0.1.')
  .option('-r, --ServerNameREST [value]', 'Server name of REST like API, default 127.0.0.1')
  .option('-p, --port <n>', 'Port used by node, default $PORT else 1891.' , parseInt)
  .parse(process.argv);

program.ServerNameDB = program.ServerNameDB|| '127.0.0.1';
program.port = program.port|| 1891;
program.ServerNameREST = program.ServerNameREST = program.ServerNameREST || '127.0.0.1:1891';

// --------------------
// Connect to the db
var mongojs = require('mongojs');
var db = mongojs(program.ServerNameDB+'/moviebox', ['movies']);


// all environments
app.set('port', program.port || process.env.PORT || 1891);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.engine('html', require('ejs').renderFile);
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);
app.get('/search', routes.search);
app.get('/users', user.list);
app.post('/search', routes.search);
app.options('/search', routes.search);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
