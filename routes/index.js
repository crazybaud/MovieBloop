
/*
 * GET home page.
 */




exports.index = function(req, res){
  // To have a front no deeply link with the back, it should jsut send REST or home made request
	var program = require('commander')
	.option('-d, --ServerNameDB [value]', 'Server name of Mongodb, on default port, default 127.0.0.1.')
	.option('-r, --ServerNameREST [value]', 'Server name of REST like API, default 127.0.0.1')
	.option('-p, --port <n>', 'Port used by node, default $PORT else 1891.' , parseInt)
	.parse(process.argv);
  	program.ServerNameREST = program.ServerNameREST || '127.0.0.1:1891';
  	console.log(program.ServerNameREST);
  	res.render('index.html',{restServerName: program.ServerNameREST.toString()});
  	// res.render('index', { title: 'Express',date:'2013',note:'6.9'});
};

exports.search = function(req, res){
  
  
  // === get paramter
  // console.log(JSON.stringify(req.body,null, 4));
  // console.log("received raw="+JSON.stringify(req.body,null, 4));
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  res.contentType('application/json');
  /* Simple test 
  var people = [{ name: 'Dave', location: 'Atlanta' },{ name: 'Santa Claus', location: 'North Pole' },{ name: 'Man in the Moon', location: 'The Moon' }];
  var peopleJSON = JSON.stringify(people);
  res.send(peopleJSON);
  */
  
  // === parse incoming json => object
  var reqObj=req.body;
  //console.log("received noteMin="+reqObj["noteMin"]);
  console.log("received reqObj="+JSON.stringify(reqObj));
  
  // === transform object to mongo query
  var mongojs = require('mongojs');
  var db = mongojs('127.0.0.1/moviebox', ['movies']);
  var dbReq={
  	voters:{$gt:5000},
  	note:{$gt:reqObj["noteMin"],$lt:reqObj["noteMax"]},
  	year:{$gt:parseInt(reqObj["dateMin"]),$lt:parseInt(reqObj["dateMax"])}
  }
  console.log("findRequest="+JSON.stringify(dbReq));
  db.movies.find(dbReq).toArray(function(err, docs) {
	  if(typeof docs !== 'undefined' || docs) {
	  	res.send(JSON.stringify(docs));
	  	console.log("sended back "+docs.length+"elems");
	  } else {
		res.send("[]");
		console.log("sended back 0 elems");  
	  }

  });
  // db.mycollection.find({}).pipe(JSONStream.stringify()).pipe(process.stdout);
  // .limit(1000);
  
  
  
  // launch query
  // wait query return
  // res.send("blabla");
  //console.log("answered final="+peopleJSON);
};