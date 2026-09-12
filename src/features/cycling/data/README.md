# Sofia cycling data

`sofia-cycling.json` is an OpenStreetMap extract for the urban area of Sofia (23.18–23.50° E, 42.58–42.80° N).

© OpenStreetMap contributors. Data is available under the **Open Database License (ODbL) 1.0**: https://www.openstreetmap.org/copyright and https://opendatacommons.org/licenses/odbl/1-0/.

The file records both the retrieval time and the provider's database timestamp. A retrieval date is not an on-site inspection of every feature. The snapshot currently contains 1,137 mapped line sections (554 paths, 404 lanes, 179 shared sections), 366 bicycle-parking nodes and 296 drinking-water nodes. These are mapped segments and points, not a count of distinct complete cycle routes or a completeness guarantee.

Sources and interpretation:
- https://wiki.openstreetmap.org/wiki/Key:cycleway
- https://wiki.openstreetmap.org/wiki/Bicycle
- https://wiki.openstreetmap.org/wiki/Overpass_API

Update from the public query API: `node scripts/update-sofia-cycling.mjs`.
Update from a previously downloaded Overpass JSON response: `node scripts/update-sofia-cycling.mjs /path/to/response.json`.
Run the extraction checks: `node --test scripts/__tests__/sofia-cycling.test.mjs`.

The update refuses malformed, partial and empty responses before replacing the previous snapshot. The application reads the bundled snapshot and does not call the public Overpass service for each map visit. Base-map tiles still require internet access or a separately installed offline map.

Shared pedestrian paths, shared traffic lanes and differing left/right infrastructure are distinguished from cycle paths and cycle lanes. Ordinary footpaths where cycling is merely permitted are not added as dedicated infrastructure. Private/inaccessible features and water explicitly tagged as non-drinkable are excluded. Temporary works, closures and current availability are not represented.
