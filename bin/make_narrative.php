<?php
	require("../lib/rb.php");
	R::setup('mysql:host=localhost;dbname=yarnspinner','yarnspinner','password');
	$yarn = R::dispense('yarn');
	$yarn->title = 'First story';
	$yarn->description = 'A story about figs.'
	R::store($yarn);
	echo "W00t!\n";

