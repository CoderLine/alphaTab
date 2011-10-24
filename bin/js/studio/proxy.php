<?php 
$allowedExtensions = array('gpt', 'gp3', 'gp4', 'gp5', 'gpx');

$urlToLoad = $_REQUEST['file'];
$urlLength = strlen($urlToLoad);

// check if the url is valid to load
$isValid = false;
for($i = 0; $i < count($allowedExtensions); $i++) {
	$extension = $allowedExtensions[$i];
	if(substr($urlToLoad, $urlLength - strlen($extension)) == $extension) {
		$isValid = true;
		break;
	}
}

if(!$isValid) {
	header('HTTP/1.1 403 Forbidden');
	echo "You're not allowed to access the resource \"$urlToLoad\" from this server!";
	exit();
}

echo $urlToLoad;
exit();

// setting headers
header('Content-Type: application/octet-stream');
header('Content-Transfer-Encoding: Binary');


// load the remote url using curl 
$ch = curl_init();

curl_setopt($ch, CURLOPT_URL, $urlToLoad);
curl_setopt($ch, CURLOPT_HEADER, 0); 
curl_setopt($ch, CURLOPT_USERAGENT, 'AlphaTab Remote File Requesting Service v0.1');
curl_exec($ch);
curl_close($ch); 
?>