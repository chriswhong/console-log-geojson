import buble from 'rollup-plugin-buble';
import uglify from 'rollup-plugin-uglify';
import serve from 'rollup-plugin-serve';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';


let config = {
  entry: 'src/console-log-geojson.js',
  format: 'iife',
  dest: 'dist/console-log-geojson.js', // equivalent to --output
  plugins: [
    buble(),
    serve({
      open: true,
      contentBase: '',
      openPage: '/examples/index.html',
    }),
    resolve(),
    commonjs(),
  ],
  moduleName: 'consoleLogGeojson',
};

if (process.env.PROD) {
  config.dest = 'dist/console-log-geojson.min.js';
  config.plugins.push( uglify() );
}

export default config;
