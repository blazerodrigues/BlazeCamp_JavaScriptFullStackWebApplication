
mapboxgl.accessToken = mapToken; //mapToken is defined in the ejs file
const map = new mapboxgl.Map({
	container: 'cluster-map', //this is the html id that we have given to the cluster map -  in .ejs file
	style: 'mapbox://styles/mapbox/dark-v10',
	center: [-103.59179687498357, 40.66995747013945],
	zoom: 3
});

//this adds zoom in zoom out etc control-buttons on the map
map.addControl(new mapboxgl.NavigationControl(),"top-right");

map.on('load', function () {
	console.log("MAP on loading...");

	map.addSource('campgrounds', { //campgrounds is the label of the source
		type: 'geojson',
		data: campgrounds,
		cluster: true,
		clusterMaxZoom: 14, 
		clusterRadius: 50 
	});

	map.addLayer({
		id: 'clusters',
		type: 'circle',
		source: 'campgrounds',
		filter: ['has', 'point_count'],
		paint: {
			// Use step expressions ( from mapbox)
			// with three steps to implement three types of circles:
			//   * Blue, 20px circles when point count is less than 100
			//   * Yellow, 30px circles when point count is between 100 and 750
			//   * Pink, 40px circles when point count is greater than or equal to 750
			'circle-color': [
				'step',
				['get', 'point_count'],
				'red',
				10,
				'orange',
				30,
				'yellow'
			],
			'circle-radius': [
				'step',
				['get', 'point_count'],
				15,
				10,
				20,
				30,
				25
			]
		}
	});

	map.addLayer({
		id: 'cluster-count',
		type: 'symbol',
		source: 'campgrounds',
		filter: ['has', 'point_count'],
		layout: {
			'text-field': '{point_count_abbreviated}',
			'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
			'text-size': 12
		}
	});

	map.addLayer({
		id: 'unclustered-point',
		type: 'circle',
		source: 'campgrounds',
		filter: ['!', ['has', 'point_count']],
		paint: {
			'circle-color': '#11b4da',
			'circle-radius': 4,
			'circle-stroke-width': 1,
			'circle-stroke-color': '#fff'
		}
	});


	// inspect a cluster on click
	map.on('click', 'clusters', function (e) {
		console.log("Map on clicking a cluster...")
		const features = map.queryRenderedFeatures(e.point, {
			layers: ['clusters']
		});
		const clusterId = features[0].properties.cluster_id;
		map.getSource('campgrounds').getClusterExpansionZoom(
			clusterId,
			function (err, zoom) {
				if (err) return;

				map.easeTo({
					center: features[0].geometry.coordinates,
					zoom: zoom
				});
			}
		);
	});

	// When a click event occurs on a feature in
	// the unclustered-point layer, open a popup at
	// the location of the feature, with
	// description HTML from its properties.
	map.on('click', 'unclustered-point', function (e) {
		console.log("map on clicking unclustered INDIVIDUAL point...");
		const popUpMarkup = e.features[0].properties.popUpMarkup; //features[0] would refer to the campground
		const coordinates = e.features[0].geometry.coordinates.slice();

		// Ensure that if the map is zoomed out such that
		// multiple copies of the feature are visible, the
		// popup appears over the copy being pointed to.
		while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
			coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
		}

		new mapboxgl.Popup()
			.setLngLat(coordinates)
			.setHTML(
				popUpMarkup
			)
			.addTo(map);
	});

	map.on('mouseenter', 'clusters', function () {
		console.log("map mouseenter (hover over cluster)...");
		map.getCanvas().style.cursor = 'pointer';
	});
	map.on('mouseleave', 'clusters', function () {
		console.log("map mouseleave (stop hovering over cluster)...");
		map.getCanvas().style.cursor = '';
	});
});