// Nécessite cryptoJS : http://code.google.com/p/crypto-js/

var date = new Date();
var pad = function pad(num) { var s = num + ""; return (s.length < 2) ? "0" + s : s; }
var sed = '' + date.getFullYear().toString() + pad(date.getMonth()+1) + pad(date.getDate());

var buildUrl = function(route, tokens) {
	// partner=QUNXZWItQWxsb0Npbuk
	tokens.push({"name" : "partner", "value" : "V2luZG93czg"}, {"name" : "format", "value" : "json"});
	tokens.sort(function (a, b) { if (a.name < b.name) return -1; if (a.name > b.name) return 1; return 0; });
	for (var i = 0; i < tokens.length; i++) {
		tokens[i] = tokens[i].name + "=" + encodeURIComponent(tokens[i].value);
	}
	var sig = encodeURIComponent(CryptoJS.SHA1('e2b7fd293906435aa5dac4be670e7982' + tokens.join("&") + "&sed=" + sed).toString(CryptoJS.enc.Base64));
	return 'http://api.allocine.fr/rest/v3/' + route + '?' + tokens.join("&") + "&sed=" + sed + "&sig=" + sig;
}

//exemple recherche
buildUrl('search', [
	{"name" : "q", "value" : "avatar"},
	{"name" : "filter", "value" : "movie"},
	{"name" : "count", "value" : 50},
	{"name" : "page", "value" : 1}
]);

// exemple détails film
buildUrl('movie', [
	{"name" : "code", "value" : "61282"},
	{"name" : "profile", "value" : "small"},
	{"name" : "mediafmt", "value" : "mp4-lc"}
]);