document.yarnid = 1;
document.chapterid = 1;
document.nodeid = 1;
$.Mustache.load('/jstemplates');
document.refreshEverything = [loadChapters, loadNodes,loadLocationList,loadCurrentNode];
document.functionList = document.refreshEverything.slice(0); 

$(document).ready(function() {
	execNext();
});

function execNext()
{
	if(document.functionList.length == 0) { return; }
	var func = document.functionList.shift()
	func();
}

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
	inputBox.focus();
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
	chapter.data('id', data.id);
	chapter.click(switchChapter);
	$(".chapters").append(chapter);
	return chapter;
}

function switchChapter(event) {
	document.chapterid = $(event.target).data('id');
	document.functionList = document.refreshEverything.slice(0); 
	execNext();
	
}

function switchNode(event) {
	document.nodeid = $(event.target).data('id');
	document.functionList = document.refreshEverything.slice(0); 
	execNext();
}

function loadChapters(){
	$("#transition-options option").remove()
	$(".chapters div").remove();
	$.ajax({
                type: "GET",
                url: "/data/chapters",
                data: { "yarnid": document.yarnid }
        }).done(function(json) {
                var data = JSON.parse(json);
		for(var i = 0; i < data.length; i++)
		{
			renderChapter(data[i]);
			$("#transition-options").mustache('transition-option', data[i]);
			if(data[i].id == document.chapterid)
			{
				$(".chapters").mustache('node-selector');
			}
		}
		execNext()
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
	inputBox.focus();

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

function renderNode(data) {
	var node = $($.Mustache.render('node', data));
	node.data('id', data.id);
	node.click(switchNode);
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
		execNext();
        });
}

function saveNode() {
	var data = {};
	data.nodeid = document.nodeid;
	data.text = $("textarea.rich-text").val();
	data.transition = $("select#transition-options").val();
	data.location = $("select#location-options").val();
	$.ajax({
                type: "POST",
                url: "/save/node",
                "data": data
        }).done(function(json) {
		alert("cool");
        });


}

function loadCurrentNode() {
	$.ajax({
                type: "GET",
                url: "/data/node/"+document.nodeid
        }).done(function(json) {
		var data = JSON.parse(json);
		$("textarea.rich-text").val(data.text);	
		$("select#transition-options").val(data.transition_id);
		$("select#location-options").val(data.location);
		execNext();
        });
}

function loadLocationList() {
	$.ajax({
                type: "GET",
                url: "/data/tags"
        }).done(function(json) {
		var data = JSON.parse(json);
		
		for(var i = 0; i < data.length; i++)
		{
			$("select#location-options").mustache('location-option', {name:data[i]});	
		}
		execNext();
        });
}

