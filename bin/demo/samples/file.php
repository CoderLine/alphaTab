<?php 
$title = "File Source";
$description = "This sample shows how to display a GuitarPro file";
?> 
<script language="JavaScript" type="text/javascript"> 
$(document).ready(function() { 
	$('div.alphaTab').alphaTab({file: 'files/Serenade.gp5'});
});
</script>
<div class="alphaTab"></div>