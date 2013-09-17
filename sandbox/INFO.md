How to find Encoding of IMDB text files
---------------
	chardet ratings.list

How to install IMDB.py
---------------
	perl DBI BDB:mysql 
	mysql.server start mypassword
	// cpan > install "DBD::mysql"
	curl -L http://cpanmin.us | perl - --sudo App::cpanminus
	sudo cpanm DBI
	sudo cpanm DBD::mysql
	CREATE USER 'imdb'@'localhost' IDENTIFIED BY 'imdb';

From http://media-enclave.googlecode.com/svn-history/r340/trunk/venclave/imdb.py

