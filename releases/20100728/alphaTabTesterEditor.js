var apis = null;

$(document).ready(function(){
	net.alphatab.MyTrace.init();
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
			apis[i].tablature.UpdateScale(zoomlvl);
		}
	});
});


