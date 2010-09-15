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
$title = "Note Effects";
$description = "This sample shows up the effects which can be applied to notes.";
?> 
<script language="JavaScript" type="text/javascript">
$(document).ready(function() {
	$('div.alphaTab').alphaTab({editor:true});
});
</script>

Note: <pre>Fret.String{Effects}</pre>
<div class="alphaTab">
.
:4
3.3{b(0 2 2 0)} 3.3{nh} 3.3{ah} 3.3{th} |
3.3{ph} 3.3{sh} 3.3{gr 2} 3.3{gr x} 3.3{gr 2 h} x.3{gr x h} |
3.3{tr 4} 3.3{tr 4 16} 3.3{tr 4 32} 3.3{tr 4 64} |
3.3{tp} 3.3{tp 16} 3.3{tp 32} 3.3{tp 64} |
3.3{v} 3.3{sl} 4.3{sf} 3.3{g} |
3.3{h} 3.3{ac} 3.3{hac} |
3.3{pm} 3.3{pm lr} 3.3{lr} 3.3{lr}
</div>

