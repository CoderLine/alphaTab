var api = null;

$(document).ready(function(){
	net.alphatab.MyTrace.init();
	api = $('#TablatureContainer').alphaTab({
		loadCallback : songLoaded,
		errorCallback: function(err) {
			alert('Error: ' + err);
		}})[0];
	
	// hook up ui elements
    $('#LoadSample').click(function(){
		var testFile = $('#TestFile :selected').val();
		api.loadFile(testFile);
    });
    
	$('#UpdateZoom').click(function(){
		var zoomlvl = parseFloat($('#Zoom :selected').val());
		api.tablature.UpdateScale(zoomlvl);
	});
});

function onTickChanged(tickPos)
{
	api.updateCaret(tickPos);
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
	
	var tracks = $('#Tracks');
	for(var i = 0; i < song.Tracks.length; i++) 
	{
		var elm = $('<option value="'+i+'">'+song.Tracks[i].Name+'</option>');
		if(i == 0)
		{
			elm.attr("selected", "selected");
		}	
		tracks.append(elm);
	}
	$('#UpdateTrack').click(function() {
		var index = parseInt($('#Tracks :selected').val());
		api.tablature.SetTrack(song.Tracks[index]);
	});
}
