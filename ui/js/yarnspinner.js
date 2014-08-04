document.yarnid = 1;
document.chapterid = 1;
document.nodeid = 1;
$.Mustache.load('/jstemplates');
//document.refreshEverything = [loadChapters, loadNodes,loadLocationList,loadCurrentNode];
document.refreshEverything = [ loadChapters, loadNodes,loadCurrentNode];
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
		//var data = JSON.parse(json);
		//renderChapter(data);
		renderChapter(json);
	});
}

function renderChapter(data)
{
	var chapter = $($.Mustache.render('chapter', data));
	chapter.find(".title").data('id', data.id);
	chapter.find(".title").click(switchChapter);
	chapter.find(".delete").data('id', data.id);
	chapter.find(".delete").click(deleteChapter);
	$(".chapters").append(chapter);
	return chapter;
}

function switchChapter(event) {
	document.chapterid = $(event.target).data('id');
	document.functionList = document.refreshEverything.slice(0); 
	execNext();
	
}

function deleteChapter(event) {
	event.preventDefault();
	document.chapterid = $(event.target).data('id');
	$.ajax({
		type:"GET",
		url:"/delete/chapter",
		async:false,
		data: {
			chapterid : $(event.target).data('id')
		}
	});
	document.functionList = document.refreshEverything.slice(0); 
	$(event.target).parent().remove();
	execNext();
	
}

function switchNode(event) {
	event.preventDefault();
	console.log($(event.target).data('id'));
	document.nodeid = $(event.target).data('id');
	document.functionList = document.refreshEverything.slice(2); 
	execNext();
}

function deleteNode(event) {
	event.preventDefault();
	$.ajax({
		type:"GET",
		url:"/delete/node",
		data: {
			nodeid : $(event.target).data('id')
		}
	});
	$(event.target).parent().remove();
}

function loadChapters(){
	$("#transition-options option").remove()
	$(".chapters div").remove();
	$.ajax({
                type: "GET",
                url: "/data/chapters",
                data: { "yarnid": document.yarnid }
        }).done(function(json) {
                //var data = JSON.parse(json);
                var data = json;
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
		//var data = JSON.parse(json);
		var data = json;
		renderNode(data);
		document.nodeid = data.id;
		loadCurrentNode();
	});
}

function renderNode(data) {
	var node = $($.Mustache.render('node', data));
	node.find(".title").data('id', data.id);
	node.find(".title").click(switchNode);
	node.find(".delete").data('id', data.id);
	node.find(".delete").click(deleteNode);
	$(".node-selector").append(node);
	return node;
}

function loadNodes(){
	$.ajax({
                type: "GET",
                url: "/data/nodes",
                data: { "chapterid": document.chapterid }
        }).done(function(json) {
                //var data = JSON.parse(json);
                var data = json;

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
	data.text = getNodeText() 
	data.transition = getNodeTransition();
	var loc = getCurrentLocations(); 
	data.locationtype = loc.type;
	data.location = loc.string; 
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
		setNodeText("");	
		setNodeTransition("");
		$("select#location-options").val("");
		addNode();
		return;
	}
	$.ajax({
                type: "GET",
                url: "/data/node/"+document.nodeid
        }).done(function(json) {
		//var data = JSON.parse(json);
		var data = json;
		setNodeTitle(data.description);
		setNodeText(data.text);
		setNodeTransition(data.transition_id);
		locationType = data.locationtype ? data.locationtype : "general";
		setCurrentLocations( locationType, data.location);
		execNext();
        });
}

function getNodeText()
{
	return $("textarea.rich-text").val();
}
function setNodeText(text)
{
	$("textarea.rich-text").val(text);	
}

function setNodeTitle(title)
{
	$(".node-title").html(title);
}

function getNodeTransition()
{
	return $("select#transition-options").val();
}

function setNodeTransition(nextChapter)
{
	$("#transition-options").val(nextChapter);
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

function setupMap() {

	var self = document;  // the HTMLDocument

        $.get('/data/tags', function(data) {
            self.keywords = data;
    
            self.map = initMap(self);
    
            updateMap(self);
    
            self.map.on('moveend', function(e) {
                updateMap(self);
            });
	    execNext();
        }, "json");


}

function getCurrentLocations()
{
	var location = {}
	if($("#lat").length > 0)
	{
		location.type = "specific";
		location.string = $("#lat").val() + "," + $("#lon").val();	
		return location;
	}else{
		var locations = Object.keys(document.layers);
		
		var output = [];
		for(var i=0; i < locations.length; i++) {
			var layer = document.layers[locations[i]];
			if(document.map.hasLayer(layer)){
				output.push(locations[i]);
			}
		}	
		var ret = {};
		ret.type = "general";
		ret.string = output.join();
		return ret;
	}

}

function setCurrentLocations(type, locations)
{
	locationTab(null,type);
	if(type == "specific")
	{
		var loc = locations.split(",");
		$("#lat").val(loc[0]);
		$("#lon").val(loc[1]);
		map.setCenter({lat:parseFloat(loc[0]), lng:parseFloat(loc[1])});
		return;
	}
	clearLocations();
	var locs = locations.split(',');
	for(var i = 0; i < locs.length; i++)
	{
		document.map.addLayer(document.layers[locs[i]]);
	}
}

function clearLocations()
{
	var locations = Object.keys(document.layers);
	for(var i=0; i < locations.length; i++)
	{
		document.map.removeLayer(document.layers[locations[i]]);
	}

}

function locationTab(e,tab)
{	
	if(e != null)
	{
		e.preventDefault();
	}
	$(".node-location .nav-tabs li").removeClass('active');
	$(".node-location .nav-tabs li."+tab).addClass('active');
	
	if($('.location-tab.'+tab).length > 0)
	{
		return;	
	}

	var locationTab = $('.location-tab');
	locationTab.html("");
	locationTab.mustache(tab+'-location');
	locationTab.removeClass();
	locationTab.addClass('location-tab');
	locationTab.addClass(tab);
}


var map;
var berkeley = new google.maps.LatLng(50.935651, -1.3959649999999328);
var sv = new google.maps.StreetViewService();

var panorama;

function initializeStreetView() {

  panorama = new google.maps.StreetViewPanorama(document.getElementById('pano'));

  // Set up the map
  var mapOptions = {
    center: berkeley,
    zoom: 16,
    streetViewControl: false
  };
  map = new google.maps.Map(document.getElementById('map-canvas'),
      mapOptions);

  // getPanoramaByLocation will return the nearest pano when the
  // given radius is 50 meters or less.
  google.maps.event.addListener(map, 'click', function(event) {
      sv.getPanoramaByLocation(event.latLng, 50, processSVData);
	//console.log(event.latLng);
	setLatLon(event.latLng.lat(), event.latLng.lng());
  });
  google.maps.event.addListener(panorama, 'position_changed', function() {
	var pos = panorama.getPosition();
  });

}

function setLatLon(lat, lon)
{
	$("#lat").val(lat);
	$("#lon").val(lon);
}

function processSVData(data, status) {
  if (status == google.maps.StreetViewStatus.OK) {
    panorama.setPano(data.location.pano);
    panorama.setPov({
      heading: 270,
      pitch: 0
    });
    panorama.setVisible(true);

  } else {
    alert('Street View data not found for this location.');
  }
}

