<?php 
$title = "Measure Tags";
$description = "This sample shows how to adjust measure specific values like timesignature or repeatings.";
?> 
<script language="JavaScript" type="text/javascript">
$(document).ready(function() {
	$('div.alphaTab').alphaTab({editor:true});
});
</script>

Tags (within measures): <pre>\tag value value</pre>
<div class="alphaTab">
.
| \ts 3 4 | \ks Eb | \ro | \rc 3 | \clef bass | \tempo 30
</div>

