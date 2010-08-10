var apis = null;

$(document).ready(function(){
	apis = $('.alphaTab').alphaTab({
		errorCallback: function(err) {
			alert('Error: ' + err);
		},
		editor:true, 
		zoom: 1.0});

	$('#UpdateZoom').click(function(){
		var zoomlvl = parseFloat($('#Zoom :selected').val());
		for(var i = 0; i < apis.length; i++) 
		{
			apis[i].tablature.updateScale(zoomlvl);
		}
	});
});


