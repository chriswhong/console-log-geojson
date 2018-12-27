# console-log-geojson

Hijacks `console.log()` and checks for valid geoJSON.  If it exists, prints a simple summary and a link to inspect/edit the geojson in geojson.io.

## Installation

> NOTE: This module is still under development! Use in production at your own risk!

```
npm install console-log-geojson
```

Include  `dist/console-log-geojson.js` in your project.



## Example

Build the code, and start the dev server

```
npm run build-dev
```
This should open `http://localhost:10001/examples/index.html` in your browser.  Open the javascript console and you'll see a few geoJSON objects logged, with accompanying summaries and geojson.io links.

## Attribution

Based on [console-hijack](https://github.com/alanguir/console-hijack), which was a great example of both hijacking `console` and using `rollup` to do simple packaging of javascript files.
