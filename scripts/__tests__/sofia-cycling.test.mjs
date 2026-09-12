import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cyclingKind, buildCyclingSnapshot } from '../lib/sofia-cycling.mjs';
const way = tags => ({type:'way',id:12,tags,geometry:[{lon:23.3,lat:42.7},{lon:23.31,lat:42.71}]});
test('separates tracks, on-road lanes and shared paths',()=>{
  assert.equal(cyclingKind({highway:'cycleway'}),'track');
  assert.equal(cyclingKind({highway:'residential','cycleway:right':'lane'}),'lane');
  assert.equal(cyclingKind({highway:'cycleway',foot:'designated',segregated:'no'}),'shared');
  assert.equal(cyclingKind({highway:'path',bicycle:'designated'}),'shared');
  assert.equal(cyclingKind({highway:'residential','cycleway:left':'track','cycleway:right':'lane'}),'mixed');
});
test('does not invent cycling infrastructure from ordinary paths or planned roads',()=>{
  for(const tags of [{highway:'path',bicycle:'yes'},{highway:'residential',cycleway:'no'},{highway:'residential',cycleway:'separate'},{highway:'construction',cycleway:'lane'},{highway:'cycleway',bicycle:'no'},{highway:'cycleway',access:'private'}])assert.equal(cyclingKind(tags),null);
  assert.equal(cyclingKind({highway:'cycleway',access:'no',bicycle:'designated'}),'track');
});
test('keeps valid geometry, deduplicates ways and excludes inaccessible or non-drinking water',()=>{
  const valid=way({highway:'cycleway'});
  const raw={elements:[valid,valid,{...valid,id:13,geometry:[{lon:NaN,lat:42.7},{lon:23.31,lat:42.7}]},{type:'node',id:2,lon:23.3,lat:42.7,tags:{amenity:'bicycle_parking'}},{type:'node',id:3,lon:23.3,lat:42.7,tags:{amenity:'drinking_water',drinking_water:'no'}},{type:'node',id:4,lon:23.3,lat:42.7,tags:{amenity:'bicycle_parking',access:'private'}}]};
  const result=buildCyclingSnapshot(raw,'2026-09-12T00:00:00Z');
  assert.deepEqual(result.features.map(f=>f.properties.kind),['track','parking']);
  assert.deepEqual(result.features[0].geometry.coordinates[0],[23.3,42.7]);
  assert.equal(result.metadata.license,'ODbL-1.0');
});
test('refuses incomplete or empty responses so the last good data is retained',()=>{
  for(const raw of [{},{elements:[]},{elements:[way({highway:'cycleway'})],remark:'timeout'}])assert.throws(()=>buildCyclingSnapshot(raw));
});
