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
$title = "Editor";
$description = "This sample shows an alphaTab instance with editor enabled.";
?> 
<!-- Include the Editor Plugin -->
<script language="JavaScript" type="text/javascript" src="../lib/alphaTab/jquery.alphaTab.editor.js"></script>
<script language="JavaScript" type="text/javascript">
$(document).ready(function() {
	$('div.alphaTab').alphaTab().editor();
});
</script>
<div class="alphaTab">
\title "Metal Riff"
\tempo 148
. 
\ro (0.5 5.4).8 0.5{pm}.16 0.5{pm}.16 0.5{pm}.16 0.5{pm}.16 0.5{pm}.16 0.5{pm}.16 (5.3 5.4).8 (7.3 7.4).16 (7.3 7.4).16 (-.3 -.4).8 (0.3 0.4).8|
(5.3 5.4).8 0.5{pm}.16 0.5{pm}.16 0.5{pm}.16 0.5{pm}.16 0.5{pm}.16 0.5{pm}.16 7.4{h}.16 5.4.16 7.5.16 5.4.16 -.4.16 6.5{h}.16 7.5.8 |
(0.5 5.4).8 0.5{pm}.16 0.5{pm}.16 0.5{pm}.16 0.5{pm}.16 0.5{pm}.16 0.5{pm}.16 (5.3 5.4).8 (7.3 7.4).16 (7.3 7.4).16 (-.3 -.4).8 (0.3 0.4).8|
\rc 2 (5.3 5.4).8 0.5{pm}.16 0.5{pm}.16 0.5{pm}.16 0.5{pm}.16 0.5{pm}.16 0.5{pm}.16 6.5{h}.16 7.5.16 r.8 7.3{b(0 4)}.16 -.3.8
</div>