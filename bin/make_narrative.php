<?php
	require("../lib/rb.php");
	R::setup('mysql:host=localhost;dbname=yarnspinner','yarnspinner','password');
	$yarn = R::dispense('yarn');
	$yarn->title = 'First story';
	R::store($yarn);
	echo "W00t!\n";

