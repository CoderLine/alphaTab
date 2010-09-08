<?php 
$title = "Player";
$description = "This sample shows how to display a GuitarPro file. <br />
				Note: The callback function needs to be a declared function that java can call it by name.";
?> 
<!-- Include the Player Plugin -->
<script language="JavaScript" type="text/javascript" src="../lib/alphaTab/jquery.alphaTab.player.js"></script>
<script language="JavaScript" type="text/javascript"> 
var api = null;
$(document).ready(function() { 
    api = $('div.alphaTab').alphaTab({
        file: 'files/Serenade.gp5',
    }).player({ // enable the player
        playerTickCallback: "onTickChanged" // !required!
    });
});

// !required!
function onTickChanged(tickPosition) { 
    api.updateCaret(tickPosition);
}
</script>
<div class="alphaTab"></div>