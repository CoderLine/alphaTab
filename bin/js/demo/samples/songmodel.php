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
$title = "Songmodel";
$description = "This sample shows how to load a file and access the songmodel.";
?>  
<script language="JavaScript" type="text/javascript">
(function($) {
    $(document).ready(function() { 
        try
        {
            // use SongLoader to load files
            var factory = new alphatab.tablature.model.DrawingSongModelFactory();
            alphatab.file.SongLoader.loadSong('<?php echo $filePath; ?>/FadeToBlack.gp4', factory, 
                function(song){ 
                    var info = $('#Info');
                    // access data
                    info.append('<p><b>Title:</b> '+song.title+'</p>');
                    info.append('<p><b>Subtitle:</b> '+song.subtitle+'</p>');
                    info.append('<p><b>Album:</b> '+song.album+'</p>');
                    info.append('<p><b>Tempo:</b> '+song.tempo+'</p>');
                    info.append('<p><b>Measures:</b> '+song.measureHeaders.length+'</p>');
                    info.append('<p><b>Tracks:</b> ('+song.tracks.length+')</p>');
                    var tracks = $('<ul></ul>');
                    for(var i = 0; i < song.tracks.length; i++) {
                        tracks.append('<li>'+song.tracks[i].name+'</li>');
                    }
                    info.append(tracks);
            });
        }
        catch(e)
        {
            if(e instanceof alphatab.file.FileFormatException)
                alert(e.message);
            else 
                alert(e);
        }
    });
})(jQuery);
</script>
<fieldset>
	<legend>FadeToBlack.gp4</legend>
	<div id="Info"></div>
</fieldset>