document.yarnid = 1;
document.chapterid = 1;
document.nodeid = 1;
$.Mustache.load('/jstemplates');
$(document).ready(function() {
	loadChapters()
	loadNodes()
});

function addChapter() {

	var inputBox = $("<input type='text' />");

	inputBox.keydown(function(event) {
		if(event.which==13)
		{
			var title = event.target.value;
			if(title == "") { title = "no title"; }
			createChapter(title);
			$(event.target).remove();
		}
	});

	inputBox.focusout(function(event) {
		var title = event.target.value;
		if(title == "") { title = "no title"; }
		createChapter(title);
		$(event.target).remove();
	});

	$(".chapters").append(inputBox);
}

function createChapter(title) {
	$.ajax({
		type: "POST",
		url: "/create/chapter",
		data: { "title": title,
			"yarnid":document.yarnid
		}
	}).done(function(json) {
		var data = JSON.parse(json);
		renderChapter(data);
	});
}

function renderChapter(data)
{
	var chapter = $($.Mustache.render('chapter', data));
	chapter.data('id', data.chapter_id);
	chapter.click(switchChapter);
	$(".chapters").append(chapter);
	return chapter;
}

function switchChapter(event) {
	alert($(event.target).data('id'));
}

function loadChapters(){
	$.ajax({
                type: "GET",
                url: "/data/chapters",
                data: { "yarnid": document.yarnid }
        }).done(function(json) {
                var data = JSON.parse(json);
		for(var i = 0; i < data.length; i++)
		{
			renderChapter(data[i]);
		}
        });
}

function addNode(){
	var inputBox = $("<input type='text' />");

	inputBox.keydown(function(event) {
		if(event.which==13)
		{
			var description = event.target.value;
			if(description == "") { description = "no description"; }
			createNode(description);
			$(event.target).remove();
		}
	});

	inputBox.focusout(function(event) {
		var description = event.target.value;
		if(description == "") { description = "no description"; }
		createNode(description);
		$(event.target).remove();
	});

	$(".node-selector").append(inputBox);

}

function createNode(description) {
	$.ajax({
		type: "POST",
		url: "/create/node",
		data: { "description": description,
			"chapterid":document.chapterid
		}
	}).done(function(json) {
		var data = JSON.parse(json);
		renderNode(data);
	});
}

function renderNode(data)
{
	var node = $($.Mustache.render('node', data));
	node.data('id', data.node_id);
	node.click(switchChapter);
	$(".node-selector").append(node);
	return node;
}

function loadNodes(){
	$.ajax({
                type: "GET",
                url: "/data/nodes",
                data: { "chapterid": document.chapterid }
        }).done(function(json) {
                var data = JSON.parse(json);
		for(var i = 0; i < data.length; i++)
		{
			renderNode(data[i]);
		}
        });
}

