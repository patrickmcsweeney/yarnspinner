<?php

$f3=require('lib/base.php');
require('lib/rb.php');
R::setup('mysql:host=localhost;dbname=yarnspinner','yarnspinner','password');

$f3->config('config.ini');

function home($f3) 
{
	$yarn = R::findOne('yarn',' id=1');
	echo Template::instance()->render('template.htm');
}

function create_chapter($f3)
{
	$yarn = R::load('yarn',$_REQUEST["yarnid"]);
	if(!$yarn->id)
	{
		$f3->errror(404);
	}
	$chapter = R::dispense("chapter");
	$chapter->title = $_REQUEST["title"];
	$yarn->ownChapter[] = $chapter;
	R::store($yarn);
	echo json_encode( array("chapter_id"=>$chapter->id, "title"=>$chapter->title));
}

function js_templates($f3)
{
	echo View::instance()->render('jstemplates.htm');
}


function chapters($f3)
{
	$yarn = R::load('yarn',$_REQUEST["yarnid"]);
	if(!$yarn->id)
	{
		$f3->error(404);
	}
	$chapters = $yarn->ownChapter;
	#echo count($chapters);
	echo json_encode(R::exportAll($chapters));
}

/* JSON Getters */

function get_chapter($f3)
{
	$id = $f3->get('PARAMS.id');
	$chapter = R::load('chapter', $id);
	if(!$chapter->id)
	{
		$f3->error(404);
	}
	echo json_encode($chapter->export());
}

function get_yarn($f3)
{
	$id = $f3->get('PARAMS.id');
	$yarn = R::load('yarn', $id);
	if(!$yarn->id)
	{
		$f3->error(404);
	}
	echo json_encode($yarn->export());
}



$f3->run();
