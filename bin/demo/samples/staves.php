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
$title = "Staves";
$description = "This sample shows how show only specific staves";
?> 
<script language="JavaScript" type="text/javascript"> 
$(document).ready(function() { 
    var f = 'files/Gp6Jingle.gp5';
    
	$('div.alphaTabFull').alphaTab({file: f,  staves: ["score", "tablature"]});
	$('div.alphaTabFull2').alphaTab({file: f, staves: ["tablature", "score"]});
	$('div.alphaTabScore').alphaTab({file: f, staves: ["score"]});
	$('div.alphaTabTablature').alphaTab({file: f, staves: ["tablature"]});
    $('div.alphaTabConfigured').alphaTab({file: f, 
        staves: {
            "score": {},
            "tablature": {rhythm: true}
        }
    });
});
</script>
<h2>Score and Tablature</h2>
<div class="alphaTabFull"></div>
<h2>Tablature and Score</h2>
<div class="alphaTabFull2"></div>
<h2>Score only</h2>
<div class="alphaTabScore"></div>
<h2>Tablature only</h2>
<div class="alphaTabTablature"></div>
<h2>With Settings</h2>
<div class="alphaTabConfigured"></div>