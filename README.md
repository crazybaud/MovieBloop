Description
----------
MovieBloop is an advanced searching tool for movie database, you can import IMDB database. For example, which movies are starring Marion Cotillard and Jean Dujardin, after 1995, in DVD edition ? Main goal is to mix search parameters as much as we can.  

Version
-------
 - 0.1 - Initial commit. **Only search by date interval and score interval functionalities are implemented.** Need to import other files now.

Aim
----------
To learn Node.js + jQuery + MongoDB + GitHub. Next step are :
- To import and manage actors
- To add flat design
- To use Neo4j database paradigm
- Clean code

Feel free to continue this project on your own, and to commit change if you want.

Installation
----------

	# Install git
	# Install nodejs
	# Install mongodb, and configure it on 127.0.0.1 with no password, default mongodb port.
	git clone git://github.com/crazybaud/MovieBloop.git 
	cd MovieBloop
	npm install
	# Download text files from http://www.imdb.com/interfaces (only ratings file in 0.1)
	# Unzip files
	# Convert IMDB files to UTF8
	iconv -f WINDOWS-1252 -t utf-8 -o ratings.list.utf8  ratings.list
	# Import files to mongodb with
	node importFromFilesToDB.js /path/to/ratings.list.utf8
	node app.js
	firefox http://127.0.0.1:1891/

License
-------
This source code is provided under MIT License. You need to read IMDB legal notice before using their data as a source. Using this library for anything other than limited personal use may not be permitted by IMDB.
