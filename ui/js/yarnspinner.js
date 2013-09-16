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
	document.functionList = document.refreshEverything.slice(2); 
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
		document.nodeid = null;
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
		document.nodeid = data.id;
		loadCurrentNode();
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
		if(null == document.nodeid && data.length > 0)
		{
			document.nodeid = data[0].id;
		}
		execNext();
        });
}

function saveNode() {
	var data = {};
	data.nodeid = document.nodeid;
	data.text = $("textarea.rich-text").val();
	data.transition = $("select#transition-options").val();
	data.location = getCurrentLocations(); 
	$.ajax({
                type: "POST",
                url: "/save/node",
                "data": data
        }).done(function(json) {
		alert("cool");
        });


}

function loadCurrentNode() {
	if(null == document.nodeid){ 
		$("textarea.rich-text").val("");	
		$("select#transition-options").val("");
		$("select#location-options").val("");
		addNode();
		return;
	}
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




function initMap(self) {

	var mapnikTileUrl = 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

	self.osmTileLayer = L.tileLayer(mapnikTileUrl, {
		maxZoom: 18,
		attribution: ""
	});

	var baseMaps = {
		"Standard": self.osmTileLayer
	};

	// Create the map
	var map = L.map( 'map', {
		zoom: 12,
		layers: [self.osmTileLayer]
	}).setView([50.9354, -1.3964], 17);

	L.control.scale().addTo(map);

	var emptyFeatureCollection = { type: "FeatureCollection", features: [] };

	self.layers = {}

	$.each(self.keywords, function(index, keyword) {
	self.layers[keyword] = L.geoJson(emptyFeatureCollection, {
	    style: {color: "#0000ff"},
	    onEachFeature: function(feature, layer) {
	    }
	});
	});
	L.control.layers(baseMaps, self.layers).addTo(map);


	return map;
}


function updateMap(self) {

    var bb = self.map.getBounds().toBBoxString();

    $.each(self.keywords, function(index, keyword) {
        $.post('/places/areas/' + keyword + '.json', {"bounding":bb}, function(data) {
                self.layers[keyword].clearLayers();
                self.layers[keyword].addData(data);
        }, "json");
    });
}

$(document).ready(function() {

	var self = this;  // the HTMLDocument

        $.get('/data/tags', function(data) {
            self.keywords = data;
    
            self.map = initMap(self);
    
            updateMap(self);
    
            self.map.on('moveend', function(e) {
                updateMap(self);
            });
        }, "json");


});

function getCurrentLocations()
{
	var locations = Object.keys(document.layers)
	
	var output = [];
	for(var i=0; i < locations.length; i++) {
		var layer = document.layers[locations[i]];
		if(document.map.hasLayer(layer)){
			output.push(locations[i]);
		}
	}	

	return output.join();

}

function setCurrentLocation()
{
	
}
