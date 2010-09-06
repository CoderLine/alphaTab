<?php 
$title = "Player";
$description = "This sample shows how to display a GuitarPro file. <br />
				Note: The callback function needs to be a declared function that java can call it by name.";
?> 
<script language="JavaScript" type="text/javascript"> 
var api = null;
$(document).ready(function() { 
	api = $('div.alphaTab').alphaTab({
		file: 'files/Serenade.gp5',
		player: true,
		playerTickCallback: "onTickChanged" // !required!
	});
});

// !required!
function onTickChanged(tickPosition) { 
	api.updateCaret(tickPosition);
}
</script>
<div class="alphaTab"></div>