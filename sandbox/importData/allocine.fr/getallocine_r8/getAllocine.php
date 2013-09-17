#!/usr/bin/php 
<?php
// INIT :
$patterns = array('720p', '1080p', 'tvhd', 'vostfr', 'vost', 'divx', 'xvid', 'x264', 'h264');
$forcedId = NULL;
$proxyUse = false;
$nbFilms=$nbFilmsMT=0;
$urlApiAllocineMovieInfo='http://api.allocine.fr/rest/v3/movie?partner=YW5kcm9pZC12M3M&code=unCode';
$urlApiAllocineSearchMovies='http://api.allocine.fr/rest/v3/search?partner=YW5kcm9pZC12M3M&q=unTitre';

//fonction pour parser les paramètres :
function parseParameters($noopt = array()) {
  $result = array();
  $params = $GLOBALS['argv'];
  // could use getopt() here (since PHP 5.3.0), but it doesn't work relyingly
  reset($params);
  while (list($tmp, $p) = each($params)) {
    if ($p{0} == '-') {
      $pname = substr($p, 1);
      $value = true;
      if ($pname{0} == '-') {
        // long-opt (--<param>)
        $pname = substr($pname, 1);
        if (strpos($p, '=') !== false) {
          // value specified inline (--<param>=<value>)
          list($pname, $value) = explode('=', substr($p, 2), 2);
        }
      }
      // check if next parameter is a descriptor or a value
      $nextparm = current($params);
      if (!in_array($pname, $noopt) && $value === true && $nextparm !== false && $nextparm{0} != '-') list($tmp, $value) = each($params);
        $result[$pname] = $value;
      } else {
        // param doesn't belong to any option
        $result[] = $p;
      }
    }
  return $result;
}
include 'xml_regex.php';

$options=parseParameters();
//Traitement des options
foreach ( $options as $opt => $value ) {
//  echo "Debug opt / value : $opt / $value \n";
  //on force $opt à etre lu comme une chaine
  $opt .= '';   
  switch ($opt) {
    case "help";
    case "h";
      echo "Syntaxe : $argv[0] -t \"Titre de film\" [-i <id_de_film>] \n
            Détail : 
            -t, --titre <titre de film> 
            -i, --id <id de film> : L'id de film allocine (recup via l'url allocine)
            -p, --proxy <ip:port>\n";
      exit();
      break;
    case "titre";
    case "t";
      $titre = $fileName = $value;
      break;
    case "id";
    case "i";
      $forcedId = $value;
      break;
    case "p";
    case "proxy";
      $proxyUse = true;
      $proxyAdd = $value;
      break;
 }
}

//Mise en place du proxy si besoin
if ( $proxyUse ) {
  $proxy = array(
    'http' => array (
      'proxy'=>'tcp://'.$proxyAdd,
      'request_fulluri' => true
    ),
    'https' => array (
      'proxy'=>'tcp://'.$proxyAdd,
      'request_fulluri' => true
    )
  );
  $context = stream_context_create($proxy);
}

//Test des valeurs obligatoires
if ( $titre === NULL) {
  echo "L'option -t est obligatoire \n";
  exit();
}

//Definition par defaut du nom de fichier à la valeur du premier argument
//Encodage du titre en format URL pour l'utiliser dans la requete API
$titre = urlencode($titre);

//Recuperation du XML de resultat de recherche allocine
$url=str_replace('unTitre',$titre,$urlApiAllocineSearchMovies);

$xmlReqId = ($proxyUse) ? file_get_contents($url, false, $context) : file_get_contents($url);


//Comptage des resultats pour les type "films" :  <results type="movie">VALUE</results>
$listeMovie = $listeMT = NULL;
$listeMovie = element_set('movie', $xmlReqId);
$listeMT = element_set('movietheater', $xmlReqId);
$nbMovie = $nbMovieMT = 0;
$nbMovie = ($listeMovie) ? sizeof($listeMovie) : 0;
$nbMovieMT = ($listeMT) ? sizeof($listeMT) : 0;
$nbFilms = $nbMovie + $nbMovieMT;
echo "Found $nbFilms \n";


if ($forcedId == NULL) {
  //Si on a plus d'un film on propose le choix sous forme de liste
  if ( $nbFilms != 1 ) {
    $indice = 1;
    //Permettre le choix entre les films (afficher annee/Titre)
    for ($i = 0 ; $i < $nbMovie ; $i ++) {
      $currentXml = $listeMovie[$i];
      $titre = value_in('originalTitle', $currentXml);
      $year = value_in('productionYear', $currentXml);
      echo "Film  $indice : $titre / $year \n";
      $indice ++;
    }
    for ($i = 0 ; $i < $nbMovieMT ; $i ++) {
      $currentXml = $listeMT[$i];
      $titre = value_in('originalTitle', $currentXml);
      $year = value_in('productionYear', $currentXml);
      echo "Film  $indice : $titre / $year \n";
      $indice ++;
    }

    
    fwrite(STDOUT, "Movie choice from the above list : <1,2,3 ...> : ");
    $choice = trim(fgets(STDIN));
    $choice = $choice - 1 ;
        if ($choice <= $nbMovie){
          $idFilmArray = element_attributes('movie', $listeMovie[$choice]);
        }
        else {
      $choice = $choice - $nbMovie;
          $idFilmArray = element_attributes('movie', $listeMT[$choice]);
        }
        //echo "Values : NBMOV / NBMT / CHOICE : $nbMovie / $nbMovieMT / $choice \n";
        
        //TODO Tests d'erreur sur le choix (!= entier toussa)
  
    //$idFilmArray = element_attributes('movie', $listeCode[$choice]);
    $idFilm = $idFilmArray['code'];
    echo "ID Allocine : $idFilm \n";
  }
  //Si on a qu'un seul film on suppose que c'est le bon et on garde l'ID du resultat
  else { 
    $idFilmArray = element_attributes('movie', $xmlReqId);
    $idFilm = $idFilmArray['code'];
    echo "ID Allocine : $idFilm \n";
  }
//Generation de l'url de requete de la fiche film sur l'API
$url=str_replace('unCode',$idFilm,$urlApiAllocineMovieInfo);
}
else{
//Si l'ID est forcé en deuxième paramètre 
  $url=str_replace('unCode',$forcedId,$urlApiAllocineMovieInfo);
  $idFilm=$forcedId;
}

//recupération du XML de la fiche film
$xmlFiche = ($proxyUse) ? file_get_contents($url, false, $context) : file_get_contents($url);

//Récupération des valeurs principales pour génération du NFO
$titreFR = value_in('title', $xmlFiche);
$titreOrig = value_in('originalTitle', $xmlFiche);
$annee = value_in('productionYear', $xmlFiche);
$rating = value_in('userRating', $xmlFiche);
$pitch = value_in('synopsisShort', $xmlFiche);
$genreArray = element_set('genre', $xmlFiche);
$resume = value_in('synopsis', $xmlFiche);
$realisateur = value_in('directors', $xmlFiche);
$acteurs = value_in('actors', $xmlFiche);
$posterArray = element_attributes('poster', $xmlFiche);
$posterLink = $posterArray['href'];
//Download Poster with french title
$localImage = "./$fileName.jpg";
$imageStream = ($proxyUse) ? @file_get_contents($posterLink, false, $context) : @file_get_contents($posterLink);
$image = fopen($localImage, 'w');
fwrite($image, $imageStream);
fclose($image);

//Generate YAMJ NFO
$nfoFile = "./$fileName.nfo";
$nfo = fopen($nfoFile, 'w');
// Si on specifie encodage
//fwrite($nfo, "\<\?xml version=\"1.0\" encoding=\"iso-8859-1\" \?\> \n");
fwrite($nfo, "<movie>\n");
fwrite($nfo, "<title>$titreFR</title>\n");
fwrite($nfo, "<originalTitle>$titreOrig</originalTitle>\n");
$rating = $rating * 2;
fwrite($nfo, "<rating>$rating</rating>\n");
fwrite($nfo, "<outline>$pitch</outline>\n");
fwrite($nfo, "<plot>$resume</plot>\n");
fwrite($nfo, "<id moviedb=\"allocine\">$idFilm</id>\n");
foreach($genreArray as $genreXml){
  $genre = value_in('genre', $genreXml);
  fwrite($nfo, "<genre>$genre</genre>\n");
}
fwrite($nfo, "</movie>");
fclose($nfo);


//output STDOUT to check

echo "Film : \t\t$titreFR \n";
echo "Annee de production : $annee \n";
echo "Note Moyenne : \t$rating \n";
echo "Resume : \t$resume \n";
echo "Lien Image : \t$posterLink \n";


?>
