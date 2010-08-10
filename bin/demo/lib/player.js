var api = null;

$(document).ready(function(){
	api = $('#TablatureContainer').alphaTab({
		loadCallback : songLoaded,
		errorCallback: function(err) {
			alert('Error: ' + err);
		},
		player:true,
		playerPath: '../lib/alphaTab/alphaTab.jar',
		playerTickCallback: "onTickChanged",
		autoscroll: false
	})[0];
	
	// hook up ui elements
    $('#LoadSample').click(function(){
		var testFile = $('#TestFile :selected').val();
		api.loadFile(testFile);
    });
    
	$('#UpdateZoom').click(function(){
		var zoomlvl = parseFloat($('#Zoom :selected').val());
		api.tablature.updateScale(zoomlvl);
	});
});

function onTickChanged(tickPos)
{
	api.updateCaret(tickPos);
}

function songLoaded(song){
    var output = "<b>Title:</b> " + song.title + "<br />" +
    "<b>Subtitle:</b> " +
    song.subtitle +
    "<br />" +
    "<b>Album:</b> " +
    song.album +
    "<br />" +
    "<b>Words:</b> " +
    song.words +
    "<br />" +
    "<b>Music:</b> " +
    song.music +
    "<br />" +
    "<b>Copyright:</b> " +
    song.copyright +
    "<br />" +
    "<b>Tab:</b> " +
    song.tab +
    "<br />" +
    "<b>Instructions:</b> " +
    song.instructions +
    "<br />" +
    "<b>Notice:</b> <br />" +
    song.notice.replace("\n", "<br />") +
    "<br />" +
    "<br />" +
    "<b>Tempo:</b> " +
    song.tempo +
    "<br />" +
    "<b>Measures:</b> " +
    song.measureHeaders.length +
    "<br />" +
    "<b>Tracks:</b> " +
    song.tracks.length;
    
    $('#FileInfo').html(output);
		
	var tracks = $('#Tracks');
	for(var i = 0; i < song.tracks.length; i++) 
	{
		var elm = $('<option value="'+i+'">'+song.racks[i].Name+'</option>');
		if(i == 0)
		{
			elm.attr("selected", "selected");
		}	
		tracks.append(elm);
	}
	$('#UpdateTrack').click(function() {
		var index = parseInt($('#Tracks :selected').val());
		api.tablature.setTrack(song.tracks[index]);
	});
}
