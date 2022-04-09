
mapboxgl.accessToken = mapToken; //i think mapbogl comes from the mapbox-cdn-links we have in the boilerplate ejs
const map = new mapboxgl.Map({
    container:"map",
    // style:"mapbox://styles/mapbox/streets-v11", //stylesheet location
    style:"mapbox://styles/mapbox/satellite-v9",
    // center:[-74.5,40], //starting position of the map [longitude,latitude] //this is not the marker(location pin)
    center:campground.geometry.coordinates,
    zoom: 10 //starting zoom
});


//this adds zoom in zoom out etc control-buttons on the map
map.addControl(new mapboxgl.NavigationControl(),"top-right");


new mapboxgl.Marker() //this is the marker(location-pin)
    // .setLngLat([-74.5,40])
    .setLngLat(campground.geometry.coordinates)
    .setPopup( //this pops up when we click on the marker
        new mapboxgl.Popup({offset:35})
        .setHTML(
            `<h6>${campground.title}</h6>
            <p>${campground.location}</p>`
        )
    )
    .addTo(map)

