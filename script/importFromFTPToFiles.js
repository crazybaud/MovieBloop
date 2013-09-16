// define parameter mongo&working_dir
// get files from FTP
// parse fiels line by line with stream, add line by line at the same time
// do the same for each files
// (move files to Trash)
// DB import complete.

// --------------------
// CONFIG
// --------------------




// INIT
var Ftp = require("jsftp");
var shell = require('shelljs');
var fs = require('fs');

// Files to retrieve
var files;

var ftp = new Ftp({
    host: "ftp.fu-berlin.de",
    user: "anonymous",
    port: 21, // Defaults to 21
    pass: "anonymous"
    
});


// --------------------
// FTP download
// --------------------

// TODO check if enough free space is available
// console.log("=== Dear padawan, you need more space, movies are legion! (Around 3Go unzipped)");
shell.mkdir('-p', 'tmp');
shell.cd('tmp');

var downloadNumberOfFiles=0;
function downloadComplete(){
	downloadNumberOfFiles=downloadNumberOfFiles-1;
	console.log("downloadComplete: DL number: "+downloadNumberOfFiles);
	if(downloadNumberOfFiles==0) {
		console.log("### Unzipping database files done.");
	}
};
downloadComplete();
downloadComplete();

ftp.ls("/pub/misc/movies/database/", function(err, files) {
    // files : Contains an array of file objects type=0 => file, size)
    if (err) return console.error(err);
    getfiles(files,0);
});

function getfiles(gzFiles,i) {
	console.log("getfiles: length="+gzFiles.length+" i="+i);
	if(gzFiles[i].name.indexOf('.gz')!= -1) {
		ftp.get("/pub/misc/movies/database/"+gzFiles[i].name, function(err, data) {
		    if (err)
		        return console.error(err);
		    // Exit FTP
			/*
			ftp.raw.quit(function(err, res) {
		        if (err)
		            return console.error(err);
		        console.log("getfiles: "+gzFiles[i].name+" ftp connection closed.");
		    });
		    */
		    if(i<(gzFiles.length-1)) {
				getfiles(gzFiles,i+1);
		    } else {
			    ftp.raw.quit(function(err, res) {
			        if (err)
			            return console.error(err);
			        console.log("getfiles: ftp connection closed.");
			    });
		    }
		    
		    // Do something with the buffer
		    // KO shell.echo(data).to(item.name);
		    console.log("getfiles: "+gzFiles[i].name+" writting done.");
		    fs.writeFile(gzFiles[i].name, data, function (err) {
			    if (err) throw err;
					shell.exec("gunzip "+gzFiles[i].name);
					console.log("getfiles: "+gzFiles[i].name+" unzipped done.");
	
				});
		})
		
	} else if(i<(gzFiles.length-1)) {
		getfiles(gzFiles,i+1);
    } else {
	    ftp.raw.quit(function(err, res) {
	        if (err)
	            return console.error(err);
	        console.log("getfiles: ftp connection closed.");
	    });
    }
}

// wait last unzipped

setTimeout(function () {
  console.log('boo')
}, 5000);

// files.forEach(type:0)
// download files[i].name 



// console.log("### Import files in mongodb.");
