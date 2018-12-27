import GJV from 'geojson-validation';
import summary from 'geojson-summary';
let isBrowser = window && document;

function buildGeojsonLogString(geojson) {
  const url = `http://geojson.io/#data=data:application/json,${encodeURIComponent(JSON.stringify(geojson))}`;
  const { sentence } = summary(geojson.type === 'Feature' ? [geojson] : geojson);

  return `^ GeoJSON: ${sentence} - ${url}`;
}

if (isBrowser) {
  let log = console.log;
  console.log = (...args) => {
    args.forEach((arg) => {
      if(GJV.valid(arg)){
        log(arg);
        log(buildGeojsonLogString(arg));
      } else {
        log(arg);
      }
    })
  }
}
