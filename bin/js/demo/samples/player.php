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
$title = "Player";
$description = "This sample shows how to display a GuitarPro file. <br />
				Note: The callback function needs to be a declared function that java can call it by name.";
?> 

<!-- Include the Player Plugin -->
<script language="JavaScript" type="text/javascript" src="<?php echo $alphaTabPath; ?>/jquery.alphaTab.player.js"></script>
<script language="JavaScript" type="text/javascript">
var api = null;

(function($) {
    $(document).ready(function() { 
        api = $('div.alphaTab').alphaTab({
            //context: alphatab.platform.PlatformFactory.SVG_CANVAS,
            file: '<?php echo $filePath; ?>/Serenade.gp5',
        }).player({ // enable the player
            //caretOffset: {x: 7, y: -7}, // small offset because of the css3 features
            playerTickCallback: "onTickChanged" // !required!
        });
    });
})(jQuery);

// !required!
function onTickChanged(tickPosition) { 
    api.updateCaret(tickPosition);
}
</script>
<div class="alphaTab"></div>