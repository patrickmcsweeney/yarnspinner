<?php

$f3=require('lib/base.php');
require('lib/rb.php');
R::setup('mysql:host=mysql3.ecs.soton.ac.uk;dbname=yarnspinner','yarnspinner','veca69minu');

$f3->config('config.ini');

function home($f3) 
{
	$yarn = R::findOne('yarn',' id=1');
	echo Template::instance()->render('template.htm');
}

function js_templates($f3)
{
	echo View::instance()->render('jstemplates.htm');
}

function tags()
{
	echo file_get_contents('http://tools.southampton.ac.uk/places/keywords/keywords.json');
}
function areas($f3)
{
#	echo 'http://tools.southampton.ac.uk/places/areas/'.$f3->get("PARAMS.file");
	$url = 'http://tools.southampton.ac.uk/places/areas/'.$f3->get("PARAMS.file");
	if(array_key_exists("bounding",$_REQUEST))
	{
		$url .= "?bounding=".$_REQUEST["bounding"];
	}

	echo file_get_contents($url);
}

/* Yarns */

function new_yarn($title, $description)
{
	# Create an initial chapter
	$chapter = R::dispense("chapter");
	$chapter->title = "New Chapter";
	R::store($chapter);

	# Create the yarn
	$yarn = R::dispense("yarn");
	$yarn->title = $title;
	$yarn->description = $description;
	$yarn->ownChapter[] = $chapter;
	$yarn->startChapter = $chapter;
	R::store($yarn);
}

function set_start_chapter($f3)
{
	$yid = $f3->get('PARAMS.id');
	$yarn = R::load('yarn', $yid);
	$cid = $_REQUEST["chapterid"];
	$chapter = R::load('chapter', $cid);
	if(!$yarn->id) {
		$f3->error(404);
	}
	if(!$chapter->id) {
		$f3->error(404);
	}
	
	$chapters = $yarn->ownChapter;
	

	foreach($chapters as $c) {
		if($c->id == $chapter->id) {
			$yarn->startChapter = $chapter;
			R::store($yarn);
			header('Content-type: application/json');
			echo json_encode($yarn->export());
			return;
		}
	}

	$f3->error(404);
}

function create_yarn($f3)
{
	$yarn = new_yarn($_REQUEST["title"], $_REQUEST["description"]);
	header('Content-type: application/json');
	echo json_encode($yarn->export());
}

function yarns($f3)
{
	$yarns = R::findAll('yarn');
	header('Content-type: application/json');
	echo json_encode(R::exportAll($yarns));
}

function get_yarn($f3)
{
	$id = $f3->get('PARAMS.id');
	$yarn = R::load('yarn', $id);
	if(!$yarn->id)
	{
		$f3->error(404);
	}
	header('Content-type: application/json');
	echo json_encode($yarn->export());
}

/* Chapters */

function create_chapter($f3)
{
	$yarn = R::load('yarn',$_REQUEST["yarnid"]);
	if(!$yarn->id)
	{
		$f3->error(404);
	}
	$chapter = R::dispense("chapter");
	$chapter->title = $_REQUEST["title"];
	$yarn->ownChapter[] = $chapter;
	R::store($yarn);
	header('Content-type: application/json');
	echo json_encode( array("id"=>$chapter->id, "title"=>$chapter->title));
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
	header('Content-type: application/json');
	echo json_encode(R::exportAll($chapters));
}

function get_chapter($f3)
{
	$id = $f3->get('PARAMS.id');
	$chapter = R::load('chapter', $id);
	if(!$chapter->id)
	{
		$f3->error(404);
	}
	header('Content-type: application/json');
	$export = R::exportAll($chapter);
	echo json_encode($export[0]);
}

/* Nodes */

function create_node($f3) {
	$chapter = R::load("chapter", $_REQUEST["chapterid"]);
	$node = R::dispense("node");
	$node->description = $_REQUEST["description"];
	$node->text = "";

	$chapter->ownNode[] = $node;
	R::store($chapter);
	
	header('Content-type: application/json');
	echo json_encode($node->export());

}

function nodes($f3)
{
	$chapter = R::load('chapter',$_REQUEST["chapterid"]);
	if(!$chapter->id)
	{
		$f3->error(404);
	}
	$nodes = $chapter->ownNode;

	header('Content-type: application/json');
	echo json_encode(R::exportAll($nodes));
}

function get_node($f3)
{
	$node = R::load("node", $f3->get("PARAMS.id"));
	header('Content-type: application/json');
	echo json_encode($node->export());
}

function update_node($f3)
{
	$node = R::load("node", $_REQUEST["nodeid"]);
	if( !$node->id )
	{
		$f3->error(404);
	}
	$transition = R::load("chapter", $_REQUEST["transition"]);
	if(!$transition->id)
	{
		$f3->error(404);
	}

	$yarn = $node->chapter->yarn;
	$chapters = $yarn->ownChapter;
	
	$valid_chapter = false;
	foreach($chapters as $c) {
		if($c->id == $transition->id) {
			$valid_chapter = true;
		}
	}
	
	if(!$valid_chapter) {
		$f3->error(404);
	}
	$node->transition = $transition;
	$node->text = $_REQUEST["text"];
	$node->location = $_REQUEST["location"];
	R::store($node);	
	header('Content-type: application/json');
	echo json_encode($node->export());
}

function set_next_chapter($f3)
{
	$nid = $f3->get('PARAMS.id');
	$node = R::load('node', $nid);
	
	if(!$node->id) {
		$f3->error(404);
	}

	$yarn = $node->chapter->yarn;

	$cid = $_REQUEST["chapterid"];
	$chapter = R::load('chapter', $cid);
	if(!$chapter->id) {
	 	$f3->error(404);
	}
	
	$chapters = $yarn->ownChapter;
	

	foreach($chapters as $c) {
		if($c->id == $chapter->id) {
			$node->nextChapter = $chapter;
			R::store($node);
			header('Content-type: application/json');
			echo json_encode($node->export());
			return;
		}
	}

	$f3->error(404);
}

$f3->run();
