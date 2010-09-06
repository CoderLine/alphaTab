<?php  
$title = "Songmodel";
$description = "This sample shows how to load a file and access the songmodel.";
?>  
<script language="JavaScript" type="text/javascript">  
$(document).ready(function() { 
	try
	{
		// use SongLoader to load files
		var factory = new net.alphatab.tablature.model.SongFactoryImpl();
		net.alphatab.file.SongLoader.loadSong('files/FadeToBlack.gp4', factory, 
			function(song){ 
				var info = $('#Info');
				// access data
				info.append('<p><b>Title:</b> '+song.title+'</p>');
				info.append('<p><b>Subtitle:</b> '+song.subtitle+'</p>');
				info.append('<p><b>Album:</b> '+song.album+'</p>');
				info.append('<p><b>Tempo:</b> '+song.tempo+'</p>');
				info.append('<p><b>Measures:</b> '+song.measureHeaders.length+'</p>');
				info.append('<p><b>Tracks:</b> ('+song.tracks.length+')</p>');
				var tracks = $('<ul></ul>');
				for(var i = 0; i < song.tracks.length; i++) {
					tracks.append('<li>'+song.tracks[i].name+'</li>');
				}
				info.append(tracks);
		});
	}
	catch(e)
	{
		if(e instanceof net.alphatab.file.FileFormatException)
			alert(e.message);
		else 
			alert(e);
	}
});
</script>
<fieldset>
	<legend>FadeToBlack.gp4</legend>
	<div id="Info"></div>
</fieldset>