<?php 
/*
 * This file is part of alphaTab.
 *
 *  alphaTab is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  alphaTab is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with alphaTab.  If not, see <http://www.gnu.org/licenses/>.
 */
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

