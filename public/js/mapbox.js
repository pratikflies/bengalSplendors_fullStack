/* eslint-disable */

// console.log(locations);
export const displayMap = (locations) => {
  mapboxgl.accessToken =
    'pk.eyJ1IjoicHJhdGlrZmxpZXMiLCJhIjoiY2xrOGJoY3VpMGh6ZjNqbzFzeW04ZnU0cSJ9.ydlhULi9bN7M047Lv0S0IA';
  const map = new mapboxgl.Map({
    container: 'map', // container ID
    style: 'mapbox://styles/mapbox/light-v10', // style URL
    scrollZoom: false,
    //   center: [25.774772, -80.185942],
    //   zoom: 3,
  });
  const bounds = new mapboxgl.LngLatBounds();

  locations.forEach((loc) => {
    //create marker
    const el = document.createElement('div');
    el.className = 'marker';

    //Add marker
    new mapboxgl.Marker({
      element: el,
      anchor: 'bottom',
    })
      .setLngLat(loc.coordinates)
      .addTo(map);

    //Add popup
    new mapboxgl.Popup({
      offset: 30,
    })
      .setLngLat(loc.coordinates)
      .setHTML(`<p> Day ${loc.day}: ${loc.description}</p>`)
      .addTo(map);
    //Extend map bounds to include current location
    bounds.extend(loc.coordinates);
  });
  map.fitBounds(bounds, {
    padding: {
      top: 200,
      bottom: 150,
      left: 100,
      right: 100,
    },
  });
};
