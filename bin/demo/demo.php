<?php 
$content = ''; 
$isIndex = !isset($_GET['s']);
if($isIndex) 
{	
	$samples = array(
		"General Usage" => array('simple.php', 'file.php', 'extended.php', 'songmodel.php', 'player.php', 'editor.php', 'editorplayer.php'),
		"Feature Demo" => array('effects.php', 'voices.php'),
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
			$content .= '<li><a href="demo.php?s=' . $sample . '">'.$title.'</a>'.$description.'</li>';
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
		<!--[if IE]><script language="JavaScript" type="text/javascript" src="../lib/swfobject/swfobject.js"></script><![endif]-->
		<!--[if IE]><script language="JavaScript" type="text/javascript" src="../lib/excanvas/excanvas.js"></script><![endif]-->
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
		if($_GET['s']):
		?>
		<a href="demo.php">Back</a>
		<?php
		endif;
		?>		
		<p><?php echo $description; ?></p>
		<?php echo $content; ?>
		<?php
		if($_GET['s']):
		?>
		<h2>Source</h2>
		<code><?php echo htmlentities(trim($content)); ?></code>
		<?php
		endif;
		?>
    </body>
</html>				
				
