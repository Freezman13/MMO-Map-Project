$(function()
{
    L.Control.LiveMouseCoordinatesControl = L.Control.extend(
	{
        options: 
		{
            position: 'bottomright',
            labelTemplate: "Coordinates: {0}",
            labelFormatter: undefined
        },

        onAdd: function(map)
		{
            this._map = map;

            var className = 'leaflet-control-mapcodes',
                container = this._container = L.DomUtil.create('div', className),
                options = this.options;

            // label container for the coordinate box
            this._labelcontainer = L.DomUtil.create("div", "uiElement label", container);
            this._label = L.DomUtil.create("span", "labelFirst", this._labelcontainer);

            // connect to mouseevents
            map.on("mousemove", this._update, this);
            map.whenReady(this._update, this);

            // return the container
            return container;
        },

        onRemove: function(map)
		{
            map.off("mousemove", this._update, this);
        },

        _update: function(evt)
		{
            var pos = evt.latlng;
            var opts = this.options;

            if (pos) 
			{
                pos = pos.wrap();
                var mapcode = this.x_y_map_code(pos);
                this._label.innerHTML = this._createMapcodeLabel(mapcode);
            }
        },
		
		// x y coordinates
		x_y_map_code: function(point)
		{
            var x = point.lng;
			var y = point.lat;
            return x.toFixed(1) + ', ' + y.toFixed(1);
        },

        _createMapcodeLabel: function(mapcode)
		{
            var opts = this.options, l;
            if (opts.labelFormatter) 
			{
                l = opts.labelFormatter(mapcode);
            } 
			else 
			{
                l = L.Util.template(opts.labelTemplate, {0: mapcode});
            }
            return l;
        }
    });

    L.control.liveCoordinates = function(opts) 
	{
        return new L.Control.LiveMouseCoordinatesControl(opts);
    };
	
	// unused but the application expects tiles
	var officialMapLayer = L.tileLayer("tiles/{z}/{x}/{y}.png", 
	{
    maxZoom: 6,
    minZoom: 1,
    bounds: L.latLngBounds([0,0],[-256,256]),
    noWrap: true,
    });0
	
	// map layer
    var the_map = L.imageOverlay('AAmap.png', [[0,0], [-259,256.5]]); 

    var map = L.map("map", 
	{
        crs: L.CRS.Simple,
        layers: [officialMapLayer, the_map],
        maxZoom: 6,
        minZoom: 1
    }).setView([-128, 128], 2);

	//filters
	var Clover = new L.LayerGroup();
	var Iris = new L.LayerGroup();

	//defining the base layer for the filter box - the world map.
	var baseLayers = 
	{
	"ArcheAge Map": the_map
	};
	
	// defining overlays - used as resource filters
	var overlays = 
	{
	"Clovers" : Clover,
	"Iris" : Iris
	};
	
	// Adds base layer and overlays to the map
    L.control.layers(baseLayers, overlays).addTo(map);
    L.control.liveCoordinates({ position: 'bottomright' }).addTo(map);

	// Defining the icon class
	var Icon_Class = L.Icon.extend(
	{             
    options: 
		{
			iconSize:     [30, 30],
			iconAnchor:   [15, 15],
			popupAnchor:  [-3, -76]
		}
	});

	// Defining specific icons
	var clover_icon = new Icon_Class({iconUrl: 'images/Clover.png'}),
		iris_icon = new Icon_Class({iconUrl: 'images/Iris.png'});
	
	// Stores the data from the published JSON
	var googleSheetJsonUrl_1 = 'https://spreadsheets.google.com/feeds/list/1PIISVofJmBh0dNr4OkCzfepFKLSL2i5CUrGEdMhUnuA/'+2+'/public/values?alt=json'
	var googleSheetJsonUrl_2 = 'https://spreadsheets.google.com/feeds/list/1PIISVofJmBh0dNr4OkCzfepFKLSL2i5CUrGEdMhUnuA/3/public/values?alt=json'

	// Markers from sheet 1 placed on the map
    $.ajax({url: googleSheetJsonUrl_1}).done(function(data)
	{
        console.log('google json', data);
        data.feed.entry.forEach(function(entry)
		{
			var marker_1 = L.marker([entry['gsx$y-axis']['$t'], entry['gsx$x-axis']['$t']], {icon: clover_icon});
			// on click popup sample code
         /* var markerPopupHtml = "<strong>Type: </strong>" + entry['gsx$group']['$t'];
            markerPopupHtml += "<br><strong>Name: </strong>" + entry['gsx$name']['$t'];
            if (entry['gsx$description']['$t'].length){
                markerPopupHtml += "<br><strong>Description: </strong>" + entry['gsx$description']['$t'];
            }
            marker.bindPopup(markerPopupHtml); */
            marker_1.addTo(Clover)
        })
    });

	//sheet 2
	$.ajax({url: googleSheetJsonUrl_2}).done(function(data)
	{
		console.log('google json', data);
		data.feed.entry.forEach(function(entry)
		{
            var marker_2 = L.marker([entry['gsx$y-axis']['$t'], entry['gsx$x-axis']['$t']], {icon: iris_icon});
            marker_2.addTo(Iris)
        })
    });
});