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
$currentDir = dirname(__file__);
require_once($currentDir . '/pathconfig.php');
$title = "Layout";
$description = "This sample shows how setup layout specific settings";
?> 
<script language="JavaScript" type="text/javascript">
(function($) {
    $(document).ready(function() { 
        var f = '<?php echo $filePath; ?>/Skillet.gp5';
        
        $('div.alphaTabPage').alphaTab({file: f,  layout: "page"});
        $('div.alphaTabPage2').alphaTab({file: f, layout: {
            mode: "page",
            measuresPerLine: 5,
            hideSongInfo: true
        }});
        $('div.alphaTabPage3').alphaTab({file: f, layout: {
            mode: "page",
            startMeasure: 5,
            measureCount: 5
        }});
        $('div.alphaTabHorizontal').alphaTab({file: f, layout: "horizontal"});
    });
})(jQuery);
</script>
<h2>Page Layout</h2>
<div class="alphaTabPage"></div>
<h2>Page Layout (5 Measures per Line)</h2>
<div class="alphaTabPage2"></div>
<h2>Page Layout (From Measure 5 to 20)</h2>
<div class="alphaTabPage3"></div>
<h2>Horizontal</h2>
<div class="alphaTabHorizontal"></div>
