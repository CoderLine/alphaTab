<?php 
$title = "Notes";
$description = "This sample shows how to write measures and notes.";
?> 
<script language="JavaScript" type="text/javascript">
$(document).ready(function() {
	$('div.alphaTab').alphaTab({editor:true});
});
</script>
<h2>Single Notes and Rests</h2>
Notes: <pre>fret.string.duration</pre><br />
Rests: <pre>r.duration</pre>
Duration: <pre>1, 2, 4, 8, 16, 32 or 64</pre>
<div class="alphaTab">
.
0.6.2 1.5.4 3.4.4 | 5.3.8 5.3.8 5.3.8 5.3.8 r.2
</div>

<h2>Duration Ranges</h2>
<div class="alphaTab">
.
:4 2.3 3.3 :8 3.3 4.3 3.3 4.3
</div>

<h2>Chords</h2>
<pre>( fret.string fret.string ...).duration</pre>
<div class="alphaTab">
. 
:4
(0.3{st} 0.4{st}) (3.3{st} 3.4{st}) (5.3 5.4) :8 r (0.3 0.4) |
r (3.3 3.4) r (6.3 6.4) :4 (5.3 5.4){d} r |
(0.3{st} 0.4{st}) (3.3{st} 3.4{st}) (5.3 5.4) :8 r (3.3 3.4) |
r (0.3 0.4) (-.3 -.4).2{d}
</div>

