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
$title = "SVG";
$description = "This sample shows how to render alphaTab using SVG instead of HTML5 canvas";
?> 
<script language="JavaScript" type="text/javascript">
(function($) {
    $(document).ready(function() { 
        var api = $('div.alphaTab').alphaTab({
            context: alphatab.platform.PlatformFactory.SVG_CANVAS,
            loadCallback: function(song) {
                var tracks = $('#Tracks');
                tracks.find('option').remove();
                for(var i = 0; i < song.tracks.length; i++) 
                {
                    var elm = $('<option value="'+i+'">'+song.tracks[i].name+'</option>');
                    if(i == 0)
                    {
                        elm.attr("selected", "selected");
                    }	
                    tracks.append(elm);
                }
            }
        });
        
        // initialize button events
        $('#LoadSample').click(function(){
            var testFile = $('#TestFile :selected').val();
            api.loadFile(testFile);
        }); 
        $('#Zoom').change(function(){
            var zoomlvl = parseFloat($('#Zoom :selected').val());
            api.tablature.updateScale(zoomlvl);
        });  
        $('#UpdateTrack').click(function() { 
            var index = parseInt($('#Tracks :selected').val());
            api.tablature.setTrack(api.tablature.track.song.tracks[index]);
        });
    });
})(jQuery);
</script>

<!-- File List -->
<select id="TestFile">
	<option value="<?php echo $filePath; ?>/GuitarPro6Jingle.gpx">Guitar Pro 6 Jingle(Gpx)</option>
	<option value="<?php echo $filePath; ?>/FadeToBlack.gp4">Metallica - Fade To Black (Gp4)</option>
	<option value="<?php echo $filePath; ?>/Love.gp4">Love(Gp4)</option>
	<option value="<?php echo $filePath; ?>/Canon.gp5">JerryC - CanonRock (Gp5)</option>
	<option value="<?php echo $filePath; ?>/Serenade.gp5">Suidakra - Serenade to a Dream (Gp5)</option>
	<option value="<?php echo $filePath; ?>/Effects.gp5">Effects (Gp5)</option>
	<option value="<?php echo $filePath; ?>/Effects.gpx">Effects (Gpx)</option>
	<option value="<?php echo $filePath; ?>/Drums.gp5">Drums (Gp5)</option>
	<option value="<?php echo $filePath; ?>/Displaced.gp5">Displaced (Gp5)</option>
</select>
<input id="LoadSample" type="button" value="Load" />
| 

<!-- Tracks -->
<label for="Tracks">Tracks:</label>
<select id="Tracks">
</select>
<input id="UpdateTrack" type="button" value="Show" />
|

<!-- Zoom -->
<select id="Zoom">
	<option value="0.5">50%</option>
	<option value="0.75">75%</option>
	<option value="1.0">100%</option>
	<option value="1.1" selected="selected">110%</option>
	<option value="1.25">125%</option>
	<option value="1.5">150%</option>
	<option value="2.0">200%</option>
</select>

<br />


<div class="alphaTab"></div>