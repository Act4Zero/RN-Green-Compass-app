/**
 * HTML and JS template for the Leaflet map when running in a WebView on mobile platforms
 */
export const leafletHtml = `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
    <title>Green Compass Map</title>
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.3/dist/leaflet.css" />
    <script src="https://unpkg.com/leaflet@1.9.3/dist/leaflet.js"></script>
    <style>
      body { margin: 0; padding: 0; }
      html, body, #map { height: 100%; width: 100%; }
    </style>
  </head>
  <body>
    <div id="map"></div>
    <script>
      // Initialize the map
      const map = L.map('map').setView([42.698334, 23.319941], 12);
      
      // Add the OpenStreetMap tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19
      }).addTo(map);
      
      // Function to receive messages from React Native
      window.addEventListener('message', function(event) {
        const message = JSON.parse(event.data);
        
        switch(message.type) {
          case 'UPDATE_MARKERS':
            updateMarkers(message.locations);
            break;
          case 'SET_CENTER':
            map.setView([message.lat, message.lng], message.zoom || map.getZoom());
            break;
          case 'GET_CENTER':
            const center = map.getCenter();
            const zoom = map.getZoom();
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'MAP_CENTER',
              lat: center.lat,
              lng: center.lng,
              zoom: zoom
            }));
            break;
        }
      });
      
      // Keep track of markers
      let markers = [];
      
      // Function to update markers on the map
      function updateMarkers(locations) {
        // Clear existing markers
        markers.forEach(marker => map.removeLayer(marker));
        markers = [];
        
        // Add new markers
        locations.forEach(location => {
          const marker = L.marker([location.lat, location.lng])
            .bindPopup(location.name)
            .addTo(map)
            .on('click', function() {
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'MARKER_CLICK',
                id: location.id
              }));
            });
          
          markers.push(marker);
        });
      }
      
      // Report map movements
      map.on('moveend', function() {
        const center = map.getCenter();
        const zoom = map.getZoom();
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'MAP_MOVE',
          lat: center.lat,
          lng: center.lng,
          zoom: zoom
        }));
      });
      
      // Initialize
      window.ReactNativeWebView.postMessage(JSON.stringify({
        type: 'MAP_READY'
      }));
    </script>
  </body>
</html>
`;
