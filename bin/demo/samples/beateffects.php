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
$title = "Beat Effects";
$description = "This sample shows up the effects which can be applied to beats.";
?> 
<script language="JavaScript" type="text/javascript">
$(document).ready(function() {
	$('div.alphaTab').alphaTab({editor:true});
});
</script>

Beat: <pre>NoteList.Duration{Effects}</pre>
<div class="alphaTab">
.
:4
3.3.8{f} 3.3{v} 3.3.8{t} 3.3{s} |
3.3.8{p} 3.3{su 8} 3.3{sd} 3.3{tb(0 -2 0)}
</div>

