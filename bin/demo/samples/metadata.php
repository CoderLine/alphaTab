<?php 
$title = "Adding Metadata";
$description = "This sample shows how metadata like songtitle or tempo can be specified.";
?> 
Tag: <pre>\tagname value value ...</pre><br />

<script language="JavaScript" type="text/javascript">
$(document).ready(function() {
	$('div.alphaTab').alphaTab({editor:true});
});
</script>
<div class="alphaTab">
\title "Song Title"
\subtitle Subtitle
\artist Artist
\album 'My Album' 
\words Daniel
\music alphaTab
\copyright Daniel
\tempo 200
\capo 2
\tuning e5 b4 g4 d4 a3 e3 
.
</div>