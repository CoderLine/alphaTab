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
$content = ''; 
$isIndex = !isset($_GET['s']) || $_GET['s'] == 'index.php';
if($isIndex) 
{	
	$samples = array(
		"General Usage" => array('simple.php', 'file.php', 'extended.php', 'staves.php', 'songmodel.php'),
        "Plugins" => array('player.php', 'editor.php', 'editorplayer.php'),
		"Feature Demo" => array('effects.php', 'drums.php', 'voices.php'),
		"alphaTex" => array('metadata.php', 'notes.php', 'measuretags.php', 'beateffects.php', 'noteeffects.php', 'complex.php')
	);
		
	// build list of samples
	
	foreach($samples as $category=>$files)
	{
		$content .= '<h2>'.$category.'</h2><ul>';
		foreach($files as $sample)
		{
			ob_start();
			include ('samples/'.$sample);
			$dummy = ob_get_clean();				
			$content .= '<li><a href="' . str_replace('.php', '', $sample) . '.html">'.$title.'</a>'.$description.'</li>';
		}
		$content .= '</ul>';
	}

	$title = 'Overview';
	$description = 'This is a list of all alphaTab samples.';
} 
else
{
	ob_start();
	include ('samples/'.$_GET['s']);
	$content = ob_get_clean();
}
?> 
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN"
    "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
		<meta http-equiv="Pragma" content="no-cache">
        <title>alphaTab - Demo</title>
		<!-- Dependencies -->
        <!--[if lt IE 9]>
        <script language="JavaScript" type="text/javascript" src="../lib/excanvas/excanvas.js"></script>        
        <![endif]-->
        
		<script language="JavaScript" type="text/javascript" src="../lib/jquery/jquery.min.js"></script>
		
		<!-- alphaTab -->
		<script language="JavaScript" type="text/javascript" src="../lib/alphaTab/alphaTab.js"></script>
		<script language="JavaScript" type="text/javascript" src="../lib/alphaTab/jquery.alphaTab.js"></script>
        <style type="text/css">@import url('style.css');</style>
        <style type="text/css">@import url('alphaTab.css');</style>
    </head>
	<body>
		<div id="TopNavWrapper">
			<div id="TopNav">
				<a href="http://www.alphatab.net" id="AlphaTabLogo" title="Home"></a>
				<ul>
				</ul>
			</div>
		</div>
		<div id="Content">
		<h1>alphaTab - <?php echo $title; ?></h1>
		<?php
		if(!$isIndex):
		?>
		<a href="index.html">Back</a>
		<?php
		endif;
		?>		
		<p><?php echo $description; ?></p>
		<?php echo $content; ?>
		<?php 
		if(!$isIndex): 
		?>
		<h2>Source</h2>
		<code><?php echo htmlentities(trim($content)); ?></code>
		<?php
		endif;
		?>
    </body>
</html>				
				
