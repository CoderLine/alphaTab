var tablature = null;
var tablatureId = 'Tablature';
$(document).ready(function(){
	
	// create tablature
	try
	{
		tablature = new net.coderline.jsgs.tablature.Tablature(tablatureId);
	}
	catch(e)
	{
		alert(e);
	}
	
	// hook up ui elements
    $('#LoadSample').click(function(){
		var testFile = $('#TestFile :selected').val();
        loadSong(testFile);
    });
    
	$('#UpdateZoom').click(function(){
		var zoomlvl = parseFloat($('#Zoom :selected').val());
		tablature.UpdateScale(zoomlvl);
	});
	
	// Autoload file
	var params = getUrlVars();
	if(params["auto_load"])
	{	
		loadSong(params["auto_load"]);
	}
});

function loadSong(url)
{	
	setTimeout(function(){
		try
		{
			var factory = new net.coderline.jsgs.tablature.model.GsSongFactoryImpl();
			net.coderline.jsgs.file.SongLoader.LoadSong(url, factory, function(song) {
				songLoaded(song);
			});
		}
		catch(e)
		{
			if(e instanceof net.coderlin.jsgs.file.FileFormatException)
			{
				alert(e.Message);
			}
			else
			{
				alert(e);
			}
		}		
	}, 1);
}

function getUrlVars()
{
    var vars = [], hash;
    var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
    for(var i = 0; i < hashes.length; i++)
    {
        hash = hashes[i].split('=');
        vars.push(hash[0]);
        vars[hash[0]] = hash[1];
    }
    return vars;
}


function songLoaded(song){
    var output = "<b>Title:</b> " + song.Title + "<br />" +
    "<b>Subtitle:</b> " +
    song.Subtitle +
    "<br />" +
    "<b>Album:</b> " +
    song.Album +
    "<br />" +
    "<b>Words:</b> " +
    song.Words +
    "<br />" +
    "<b>Music:</b> " +
    song.Music +
    "<br />" +
    "<b>Copyright:</b> " +
    song.Copyright +
    "<br />" +
    "<b>Tab:</b> " +
    song.Tab +
    "<br />" +
    "<b>Instructions:</b> " +
    song.Instructions +
    "<br />" +
    "<b>Notice:</b> <br />" +
    song.Notice.replace("\n", "<br />") +
    "<br />" +
    "<br />" +
    "<b>Tempo:</b> " +
    song.Tempo +
    "<br />" +
    "<b>Measures:</b> " +
    song.MeasureHeaders.length +
    "<br />" +
    "<b>Tracks:</b> " +
    song.Tracks.length;
    
    $('#FileInfo').html(output);
	
	tablature.SetTrack(song.Tracks[0]);
}
