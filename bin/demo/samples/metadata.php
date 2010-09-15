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