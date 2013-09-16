// define parameter mongo&working_dir
// parse fiels line by line with stream, add line by line at the same time
// do the same for each files
// (move files to Trash)
// DB import complete.

// --------------------
// CONFIG
// --------------------




// INIT
// var $ = require('jquery');
var shell = require('shelljs');
var fs = require('fs');
var mongojs = require('mongojs');

// --------------------
// Connect to the db
var db = mongojs('127.0.0.1/moviebox', ['movies','people']);

// --------------------
// CONVERTER
function lineToJSONratings(data){
	// data format: ditrib voters note title year
	// data format example: 1.3..1.1.1       6   3.5  Yee san (1999)
	// TODO correct error on date for : 0000111100    4407   6.1  Year of the Dog (2007/I)
	console.log('lineToJSONratings : before : ' + data);
	var dataArray = data.split(/[ ]*([\d\.]{10})[ ]*([\d]{1,10})[ ]*(\d\.\d)[ ]*(.*?)[ ]*\((\d{4})\).*/);
	console.log('lineToJSONratings : array  : ' + dataArray);
	var dataJSON=new Object();
	if (dataArray.length==7) {
		/*var myTitle;
		if(dataArray[4].IndexOf('"') == 0)
			myTitle = dataArray[4].substring(1, dataArray[4].length - 1);
		else myTitle = dataArray[4];
		*/
		dataJSON = {
			distrib : dataArray[1],
			voters : parseInt(dataArray[2]),
			note : parseFloat(dataArray[3]),
			title : dataArray[4].replace(/^\"|\"$/g, ""),
			year : parseInt(dataArray[5])
		}
		console.log('lineToJSONratings : after  : ' + JSON.stringify(dataJSON));
		db.movies.insert(dataJSON, {safe: true}, function(err, result) {
			if(err) 
				console.log('oups');
			else
				console.log('lineToJSONratings : insert : _id='+result[0]._id+' title=\"'+dataArray[4]+'\" done.');
		});
	} else {
		console.log('lineToJSONratings : insert failed');
	}
    
};


// READ FILE AND CONVERT
var filename = process.argv[2];
require('readline').createInterface({
    input: fs.createReadStream(filename),
    terminal: false
}).on('line', function(line){
   // A partir de la convertir une ligne en json puis mongodb
   lineToJSONratings(line);
});

// user _.after to wait end of async insert call
db.close();

