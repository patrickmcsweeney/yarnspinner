<html>
<head>
<title>Test the map</title>

<script src="OpenLayers.js"></script>
<script type="text/javascript">

	function update_rectangle()
	{
		//need to switch projections -- setting the start coordinates is different than
		//updating the box coordinates.  Don't know why.

		var top_value = document.getElementById('input-top').value;
		var bottom_value = document.getElementById('input-bottom').value;
		var left_value = document.getElementById('input-left').value;
		var right_value = document.getElementById('input-right').value;

		//don't draw a box if we don't have four values (when only one click has happened)
		if (! (top_value && bottom_value && left_value && right_value) )
		{
			return;
		} 

		var top_left = new OpenLayers.Geometry.Point(left_value, top_value).transform(fromProjection, toProjection);
		var top_right = new OpenLayers.Geometry.Point(right_value, top_value).transform(fromProjection, toProjection);
		var bottom_right = new OpenLayers.Geometry.Point(right_value, bottom_value).transform(fromProjection, toProjection);
		var bottom_left = new OpenLayers.Geometry.Point(left_value, bottom_value).transform(fromProjection, toProjection);

		var coords = new Array(top_left, top_right, bottom_right, bottom_left, top_left);

		//there will be no box on the first update
		if (box)
		{
			box_layer.removeFeatures([box]);
		}

		var linear_ring = new OpenLayers.Geometry.LinearRing(coords);

		//last parameter is the style.  Couldn't make it work, so left it as default
		box = new OpenLayers.Feature.Vector(
			new OpenLayers.Geometry.Polygon([linear_ring])
		,null, null );

		box_layer.addFeatures([box]);
		box_layer.redraw();
	}

	//update a value into an input field.
	function insert_lon_or_lat(value, low_field_id, high_field_id)
	{
		var low_field = document.getElementById(low_field_id);
		var high_field = document.getElementById(high_field_id);
		var low_value = low_field.value;
		var high_value = high_field.value;

		if (!low_value)
		{
			low_field.value = value;
		}
		else if (!high_value)
		{
			if (value > low_value)
			{
				high_field.value = value;
			}
			else
			{
				high_field.value = low_field.value;
				low_field.value = value;
			}
		}
		else
		{
			low_delta = Math.abs(low_value - value);
			high_delta = Math.abs(high_value - value);

			if (low_delta < high_delta)
			{
				low_field.value = value;
			}
			else
			{
				high_field.value = value;
			}
		}
		return;
	}

    OpenLayers.Control.Click = OpenLayers.Class(OpenLayers.Control, {                
	defaultHandlerOptions: {
	    'single': true,
	    'double': false,
	    'pixelTolerance': 0,
	    'stopSingle': true,
	    'stopDouble': false
	},

	initialize: function(options) {
	    this.handlerOptions = OpenLayers.Util.extend(
		{}, this.defaultHandlerOptions
	    );
	    OpenLayers.Control.prototype.initialize.apply(
		this, arguments
	    ); 
	    this.handler = new OpenLayers.Handler.Click(
		this, {
		    'click': this.onClick,
		}, this.handlerOptions
	    );
	}, 

	onClick: function(evt) {
		//store the coordinates as the ones we like to use.
		//these will be transformed back before being plotted
		var lonlat = map.getLonLatFromPixel(evt.xy).transform(toProjection, fromProjection);
		var lon = lonlat.lon;
		var lat = lonlat.lat;

		insert_lon_or_lat(lon, 'input-left', 'input-right');
		insert_lon_or_lat(lat, 'input-top', 'input-bottom');

		update_rectangle();
	},

    });

    var map, box_layer, box; 
	var fromProjection = new OpenLayers.Projection("EPSG:4326"); // Transform from WGS 1984
	var toProjection = new OpenLayers.Projection("EPSG:900913"); // to Spherical Mercator Projection

    function init(){

	map = new OpenLayers.Map('map');
	var layer = new OpenLayers.Layer.OSM();

	box_layer = new OpenLayers.Layer.Vector("Box layer");

	map.addLayers([layer, box_layer]);

	var control = new OpenLayers.Control.Click({
		handlerOptions: {
		    "single": true,
		    "stopSingle": true
		}
	    });

    map.addControl(control);
    control.activate();

    box_layer.display();
	var zoom = 10;
	var position = new OpenLayers.LonLat(-1.397026, 50.934578).transform(fromProjection, toProjection);
	map.setCenter(position, zoom);
    }
</script>

</head>
<body onload="init()">

<div id="map" style="height:600px; width: 800px;"></div>
<form name="input" action="testmap.php" method = "post">
left: <input type="text" id='input-left' name="left"/><br./>
right: <input type="text" id='input-right' name="right"/><br./>
top: <input type="text" id='input-top' name="top"/><br./>
bottom: <input type="text" id='input-bottom' name="bottom"/><br./>
</form>


</body>
