<?php
	require("../lib/rb.php");
	R::setup('mysql:host=mysql3.ecs.soton.ac.uk;dbname=yarnspinner','yarnspinner','veca69minu');
	$yarn = R::dispense('yarn');
	$yarn->title = 'First story';
	$yarn->description = 'A story about figs.';
	R::store($yarn);
	echo "W00t!\n";

