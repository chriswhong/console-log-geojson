# console-log-geojson

Hijacks `console.log()` and checks for valid geoJSON.  If it exists, prints a simple summary and a link to inspect/edit the geojson in geojson.io.

<img width="1165" alt="labsapplicantmaps" src="https://user-images.githubusercontent.com/1833820/50461354-eaeb5800-094b-11e9-93a4-1bad90dc1294.png">

*MAJOR LIMITATION* console-log-geojson builds its geojson links by urlencoding the stringified geojson and passing it to geojson.io as a url parameter.  This will not work with large geojson.  I'd love your suggestions on how to get around this ([geojsonio-cli](https://github.com/mapbox/geojsonio-cli) uses github gists, but I don't think that will work without auth)


## Installation

Clone this repo.

Include  `dist/console-log-geojson.js` in your project.

```
NOT WORKING YET - npm install console-log-geojson
```



## Example

Build the code, and start the dev server

```
npm run build-dev
```
This should open `http://localhost:10001/examples/index.html` in your browser.  Open the javascript console and you'll see a few geoJSON objects logged, with accompanying summaries and geojson.io links.

## Attribution

Based on [console-hijack](https://github.com/alanguir/console-hijack), which was a great example of both hijacking `console` and using `rollup` to do simple packaging of javascript files.
