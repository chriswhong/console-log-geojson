(function () {
	'use strict';

	function createCommonjsModule(fn, module) {
		return module = { exports: {} }, fn(module, module.exports), module.exports;
	}

	var geojsonValidation = createCommonjsModule(function (module, exports) {
	/**
	 * geoJSON validation according to the GeoJSON spefication Version 1
	 * @module geoJSONValidation
	 * @class Main
	 * @exports {GJV}
	 */

	var definitions = {};

	/**
	 * Test an object to see if it is a function
	 * @method isFunction
	 * @param object {Object}
	 * @return {Boolean}
	 */
	function isFunction (object) {
	  return typeof (object) === 'function'
	}

	/**
	 * A truthy test for objects
	 * @method isObject
	 * @param {Object}
	 * @return {Boolean}
	 */
	function isObject (object) {
	  return object === Object(object)
	}

	/**
	 * Formats error messages, calls the callback
	 * @method done
	 * @private
	 * @param cb {Function} callback
	 * @param [message] {Function} callback
	 * @return {Boolean} is the object valid or not?
	 */
	function _done (cb, message) {
	  var valid = false;

	  if (typeof message === 'string') {
	    message = [message];
	  } else if (Object.prototype.toString.call(message) === '[object Array]') {
	    if (message.length === 0) {
	      valid = true;
	    }
	  } else {
	    valid = true;
	  }

	  if (isFunction(cb)) {
	    if (valid) {
	      cb(valid, []);
	    } else {
	      cb(valid, message);
	    }
	  }

	  return valid
	}

	/**
	 * calls a custom definition if one is avalible for the given type
	 * @method _customDefinitions
	 * @private
	 * @param type {'String'} a GeoJSON object type
	 * @param object {Object} the Object being tested
	 * @return {Array} an array of errors
	 */
	function _customDefinitions (type, object) {
	  var errors;

	  if (isFunction(definitions[type])) {
	    try {
	      errors = definitions[type](object);
	    } catch (e) {
	      errors = ['Problem with custom definition for '+type+': '+e];
	    }
	    if (typeof result === 'string') {
	      errors = [errors];
	    }
	    if (Object.prototype.toString.call(errors) === '[object Array]') {
	      return errors
	    }
	  }
	  return []
	}

	/**
	 * Define a custom validation function for one of GeoJSON objects
	 * @method define
	 * @param type {GeoJSON Type} the type
	 * @param definition {Function} A validation function
	 * @return {Boolean} Return true if the function was loaded corectly else false
	 */
	exports.define = function (type, definition) {
	  if ((type in allTypes) && isFunction(definition)) {
	    // TODO: check to see if the type is valid
	    definitions[type] = definition;
	    return true
	  } else {
	    return false
	  }
	};

	/**
	 * Determines if an object is a position or not
	 * @method isPosition
	 * @param position {Array}
	 * @param [cb] {Function} the callback
	 * @return {Boolean}
	 */
	exports.isPosition = function (position, cb) {
	  var errors = [];

	  // It must be an array
	  if (Array.isArray(position)) {
	    // and the array must have more than one element
	    if (position.length <= 1) {
	      errors.push('Position must be at least two elements');
	    }

	    position.forEach(function(pos, index) {
	      if (typeof pos !== 'number') {
	        errors.push('Position must only contain numbers. Item '+pos+' at index '+index+' is invalid.');
	      }
	    });
	  } else {
	    errors.push('Position must be an array');
	  }

	  // run custom checks
	  errors = errors.concat(_customDefinitions('Position', position));

	  return _done(cb, errors)
	};

	/**
	 * Determines if an object is a GeoJSON Object or not
	 * @method isGeoJSONObject|valid
	 * @param geoJSONObject {Object}
	 * @param [cb] {Function} the callback
	 * @return {Boolean}
	 */
	exports.isGeoJSONObject = exports.valid = function (geoJSONObject, cb) {
	  if (!isObject(geoJSONObject)) {
	    return _done(cb, ['must be a JSON Object'])
	  } else {
	    var errors = [];
	    if ('type' in geoJSONObject) {
	      if (nonGeoTypes[geoJSONObject.type]) {
	        return nonGeoTypes[geoJSONObject.type](geoJSONObject, cb)
	      } else if (geoTypes[geoJSONObject.type]) {
	        return geoTypes[geoJSONObject.type](geoJSONObject, cb)
	      } else {
	        errors.push('type must be one of: "Point", "MultiPoint", "LineString", "MultiLineString", "Polygon", "MultiPolygon", "GeometryCollection", "Feature", or "FeatureCollection"');
	      }
	    } else {
	      errors.push('must have a member with the name "type"');
	    }

	    // run custom checks
	    errors = errors.concat(_customDefinitions('GeoJSONObject', geoJSONObject));
	    return _done(cb, errors)
	  }
	};

	/**
	 * Determines if an object is a Geometry Object or not
	 * @method isGeometryObject
	 * @param geometryObject {Object}
	 * @param [cb] {Function} the callback
	 * @return {Boolean}
	 */
	exports.isGeometryObject = function (geometryObject, cb) {
	  if (!isObject(geometryObject)) {
	    return _done(cb, ['must be a JSON Object'])
	  }

	  var errors = [];

	  if ('type' in geometryObject) {
	    if (geoTypes[geometryObject.type]) {
	      return geoTypes[geometryObject.type](geometryObject, cb)
	    } else {
	      errors.push('type must be one of: "Point", "MultiPoint", "LineString", "MultiLineString", "Polygon", "MultiPolygon" or "GeometryCollection"');
	    }
	  } else {
	    errors.push('must have a member with the name "type"');
	  }

	  // run custom checks
	  errors = errors.concat(_customDefinitions('GeometryObject', geometryObject));
	  return _done(cb, errors)
	};

	/**
	 * Determines if an object is a Point or not
	 * @method isPoint
	 * @param point {Object}
	 * @param [cb] {Function} the callback
	 * @return {Boolean}
	 */
	exports.isPoint = function (point, cb) {
	  if (!isObject(point)) {
	    return _done(cb, ['must be a JSON Object'])
	  }

	  var errors = [];

	  if ('bbox' in point) {
	    exports.isBbox(point.bbox, function (valid, err) {
	      if (!valid) {
	        errors = errors.concat(err);
	      }
	    });
	  }

	  if ('type' in point) {
	    if (point.type !== 'Point') {
	      errors.push('type must be "Point"');
	    }
	  } else {
	    errors.push('must have a member with the name "type"');
	  }

	  if ('coordinates' in point) {
	    exports.isPosition(point.coordinates, function (valid, err) {
	      if (!valid) {
	        errors.push('Coordinates must be a single position');
	      }
	    });
	  } else {
	    errors.push('must have a member with the name "coordinates"');
	  }

	  // run custom checks
	  errors = errors.concat(_customDefinitions('Point', point));

	  return _done(cb, errors)
	};

	/**
	 * Determines if an array can be interperted as coordinates for a MultiPoint
	 * @method isMultiPointCoor
	 * @param coordinates {Array}
	 * @param [cb] {Function} the callback
	 * @return {Boolean}
	 */
	exports.isMultiPointCoor = function (coordinates, cb) {
	  var errors = [];

	  if (Array.isArray(coordinates)) {
	    coordinates.forEach(function (val, index) {
	      exports.isPosition(val, function (valid, err) {
	        if (!valid) {
	          // modify the err msg from "isPosition" to note the element number
	          err[0] = 'at ' + index + ': '.concat(err[0]);
	          // build a list of invalide positions
	          errors = errors.concat(err);
	        }
	      });
	    });
	  } else {
	    errors.push('coordinates must be an array');
	  }

	  return _done(cb, errors)
	};
	/**
	 * Determines if an object is a MultiPoint or not
	 * @method isMultiPoint
	 * @param position {Object}
	 * @param cb {Function} the callback
	 * @return {Boolean}
	 */
	exports.isMultiPoint = function (multiPoint, cb) {
	  if (!isObject(multiPoint)) {
	    return _done(cb, ['must be a JSON Object'])
	  }

	  var errors = [];

	  if ('bbox' in multiPoint) {
	    exports.isBbox(multiPoint.bbox, function (valid, err) {
	      if (!valid) {
	        errors = errors.concat(err);
	      }
	    });
	  }

	  if ('type' in multiPoint) {
	    if (multiPoint.type !== 'MultiPoint') {
	      errors.push('type must be "MultiPoint"');
	    }
	  } else {
	    errors.push('must have a member with the name "type"');
	  }

	  if ('coordinates' in multiPoint) {
	    exports.isMultiPointCoor(multiPoint.coordinates, function (valid, err) {
	      if (!valid) {
	        errors = errors.concat(err);
	      }
	    });
	  } else {
	    errors.push('must have a member with the name "coordinates"');
	  }

	  // run custom checks
	  errors = errors.concat(_customDefinitions('MultiPoint', multiPoint));

	  return _done(cb, errors)
	};

	/**
	 * Determines if an array can be interperted as coordinates for a lineString
	 * @method isLineStringCoor
	 * @param coordinates {Array}
	 * @param [cb] {Function} the callback
	 * @return {Boolean}
	 */
	exports.isLineStringCoor = function (coordinates, cb) {
	  var errors = [];
	  if (Array.isArray(coordinates)) {
	    if (coordinates.length > 1) {
	      coordinates.forEach(function (val, index) {
	        exports.isPosition(val, function (valid, err) {
	          if (!valid) {
	            // modify the err msg from 'isPosition' to note the element number
	            err[0] = 'at ' + index + ': '.concat(err[0]);
	            // build a list of invalide positions
	            errors = errors.concat(err);
	          }
	        });
	      });
	    } else {
	      errors.push('coordinates must have at least two elements');
	    }
	  } else {
	    errors.push('coordinates must be an array');
	  }

	  return _done(cb, errors)
	};

	/**
	 * Determines if an object is a lineString or not
	 * @method isLineString
	 * @param lineString {Object}
	 * @param [cb] {Function} the callback
	 * @return {Boolean}
	 */
	exports.isLineString = function (lineString, cb) {
	  if (!isObject(lineString)) {
	    return _done(cb, ['must be a JSON Object'])
	  }

	  var errors = [];

	  if ('bbox' in lineString) {
	    exports.isBbox(lineString.bbox, function (valid, err) {
	      if (!valid) {
	        errors = errors.concat(err);
	      }
	    });
	  }

	  if ('type' in lineString) {
	    if (lineString.type !== 'LineString') {
	      errors.push('type must be "LineString"');
	    }
	  } else {
	    errors.push('must have a member with the name "type"');
	  }

	  if ('coordinates' in lineString) {
	    exports.isLineStringCoor(lineString.coordinates, function (valid, err) {
	      if (!valid) {
	        errors = errors.concat(err);
	      }
	    });
	  } else {
	    errors.push('must have a member with the name "coordinates"');
	  }

	  // run custom checks
	  errors = errors.concat(_customDefinitions('LineString', lineString));

	  return _done(cb, errors)
	};

	/**
	 * Determines if an array can be interperted as coordinates for a MultiLineString
	 * @method isMultiLineStringCoor
	 * @param coordinates {Array}
	 * @param [cb] {Function} the callback
	 * @return {Boolean}
	 */
	exports.isMultiLineStringCoor = function (coordinates, cb) {
	  var errors = [];
	  if (Array.isArray(coordinates)) {
	    coordinates.forEach(function (val, index) {
	      exports.isLineStringCoor(val, function (valid, err) {
	        if (!valid) {
	          // modify the err msg from 'isPosition' to note the element number
	          err[0] = 'at ' + index + ': '.concat(err[0]);
	          // build a list of invalide positions
	          errors = errors.concat(err);
	        }
	      });
	    });
	  } else {
	    errors.push('coordinates must be an array');
	  }
	  _done(cb, errors);
	};

	/**
	 * Determines if an object is a MultiLine String or not
	 * @method isMultiLineString
	 * @param multilineString {Object}
	 * @param [cb] {Function} the callback
	 * @return {Boolean}
	 */
	exports.isMultiLineString = function (multilineString, cb) {
	  if (!isObject(multilineString)) {
	    return _done(cb, ['must be a JSON Object'])
	  }

	  var errors = [];

	  if ('bbox' in multilineString) {
	    exports.isBbox(multilineString.bbox, function (valid, err) {
	      if (!valid) {
	        errors = errors.concat(err);
	      }
	    });
	  }

	  if ('type' in multilineString) {
	    if (multilineString.type !== 'MultiLineString') {
	      errors.push('type must be "MultiLineString"');
	    }
	  } else {
	    errors.push('must have a member with the name "type"');
	  }

	  if ('coordinates' in multilineString) {
	    exports.isMultiLineStringCoor(multilineString.coordinates, function (valid, err) {
	      if (!valid) {
	        errors = errors.concat(err);
	      }
	    });
	  } else {
	    errors.push('must have a member with the name "coordinates"');
	  }

	  // run custom checks
	  errors = errors.concat(_customDefinitions('MultiPoint', multilineString));

	  return _done(cb, errors)
	};

	/**
	 * Determines if an array is a linear Ring String or not
	 * @method isMultiLineString
	 * @private
	 * @param coordinates {Array}
	 * @param [cb] {Function} the callback
	 * @return {Boolean}
	 */
	function _linearRingCoor (coordinates, cb) {
	  var errors = [];
	  if (Array.isArray(coordinates)) {
	    // 4 or more positions

	    coordinates.forEach(function (val, index) {
	      exports.isPosition(val, function (valid, err) {
	        if (!valid) {
	          // modify the err msg from 'isPosition' to note the element number
	          err[0] = 'at ' + index + ': '.concat(err[0]);
	          // build a list of invalide positions
	          errors = errors.concat(err);
	        }
	      });
	    });

	    // check the first and last positions to see if they are equivalent
	    // TODO: maybe better checking?
	    if (coordinates[0].toString() !== coordinates[coordinates.length - 1].toString()) {
	      errors.push('The first and last positions must be equivalent');
	    }

	    if (coordinates.length < 4) {
	      errors.push('coordinates must have at least four positions');
	    }
	  } else {
	    errors.push('coordinates must be an array');
	  }

	  return _done(cb, errors)
	}

	/**
	 * Determines if an array is valid Polygon Coordinates or not
	 * @method _polygonCoor
	 * @private
	 * @param coordinates {Array}
	 * @param [cb] {Function} the callback
	 * @return {Boolean}
	 */
	exports.isPolygonCoor = function (coordinates, cb) {
	  var errors = [];
	  if (Array.isArray(coordinates)) {
	    coordinates.forEach(function (val, index) {
	      _linearRingCoor(val, function (valid, err) {
	        if (!valid) {
	          // modify the err msg from 'isPosition' to note the element number
	          err[0] = 'at ' + index + ': '.concat(err[0]);
	          // build a list of invalid positions
	          errors = errors.concat(err);
	        }
	      });
	    });
	  } else {
	    errors.push('coordinates must be an array');
	  }

	  return _done(cb, errors)
	};

	/**
	 * Determines if an object is a valid Polygon
	 * @method isPolygon
	 * @param polygon {Object}
	 * @param [cb] {Function} the callback
	 * @return {Boolean}
	 */
	exports.isPolygon = function (polygon, cb) {
	  if (!isObject(polygon)) {
	    return _done(cb, ['must be a JSON Object'])
	  }

	  var errors = [];

	  if ('bbox' in polygon) {
	    exports.isBbox(polygon.bbox, function (valid, err) {
	      if (!valid) {
	        errors = errors.concat(err);
	      }
	    });
	  }

	  if ('type' in polygon) {
	    if (polygon.type !== 'Polygon') {
	      errors.push('type must be "Polygon"');
	    }
	  } else {
	    errors.push('must have a member with the name "type"');
	  }

	  if ('coordinates' in polygon) {
	    exports.isPolygonCoor(polygon.coordinates, function (valid, err) {
	      if (!valid) {
	        errors = errors.concat(err);
	      }
	    });
	  } else {
	    errors.push('must have a member with the name "coordinates"');
	  }

	  // run custom checks
	  errors = errors.concat(_customDefinitions('Polygon', polygon));

	  return _done(cb, errors)
	};

	/**
	 * Determines if an array can be interperted as coordinates for a MultiPolygon
	 * @method isMultiPolygonCoor
	 * @param coordinates {Array}
	 * @param [cb] {Function} the callback
	 * @return {Boolean}
	 */
	exports.isMultiPolygonCoor = function (coordinates, cb) {
	  var errors = [];
	  if (Array.isArray(coordinates)) {
	    coordinates.forEach(function (val, index) {
	      exports.isPolygonCoor(val, function (valid, err) {
	        if (!valid) {
	          // modify the err msg from 'isPosition' to note the element number
	          err[0] = 'at ' + index + ': '.concat(err[0]);
	          // build a list of invalide positions
	          errors = errors.concat(err);
	        }
	      });
	    });
	  } else {
	    errors.push('coordinates must be an array');
	  }

	  _done(cb, errors);
	};

	/**
	 * Determines if an object is a valid MultiPolygon
	 * @method isMultiPolygon
	 * @param multiPolygon {Object}
	 * @param [cb] {Function} the callback
	 * @return {Boolean}
	 */
	exports.isMultiPolygon = function (multiPolygon, cb) {
	  if (!isObject(multiPolygon)) {
	    return _done(cb, ['must be a JSON Object'])
	  }

	  var errors = [];

	  if ('bbox' in multiPolygon) {
	    exports.isBbox(multiPolygon.bbox, function (valid, err) {
	      if (!valid) {
	        errors = errors.concat(err);
	      }
	    });
	  }

	  if ('type' in multiPolygon) {
	    if (multiPolygon.type !== 'MultiPolygon') {
	      errors.push('type must be "MultiPolygon"');
	    }
	  } else {
	    errors.push('must have a member with the name "type"');
	  }

	  if ('coordinates' in multiPolygon) {
	    exports.isMultiPolygonCoor(multiPolygon.coordinates, function (valid, err) {
	      if (!valid) {
	        errors = errors.concat(err);
	      }
	    });
	  } else {
	    errors.push('must have a member with the name "coordinates"');
	  }

	  // run custom checks
	  errors = errors.concat(_customDefinitions('MultiPolygon', multiPolygon));

	  return _done(cb, errors)
	};

	/**
	 * Determines if an object is a valid Geometry Collection
	 * @method isGeometryCollection
	 * @param geometryCollection {Object}
	 * @param [cb] {Function} the callback
	 * @return {Boolean}
	 */
	exports.isGeometryCollection = function (geometryCollection, cb) {
	  if (!isObject(geometryCollection)) {
	    return _done(cb, ['must be a JSON Object'])
	  }

	  var errors = [];

	  if ('bbox' in geometryCollection) {
	    exports.isBbox(geometryCollection.bbox, function (valid, err) {
	      if (!valid) {
	        errors = errors.concat(err);
	      }
	    });
	  }

	  if ('type' in geometryCollection) {
	    if (geometryCollection.type !== 'GeometryCollection') {
	      errors.push('type must be "GeometryCollection"');
	    }
	  } else {
	    errors.push('must have a member with the name "type"');
	  }

	  if ('geometries' in geometryCollection) {
	    if (Array.isArray(geometryCollection.geometries)) {
	      geometryCollection.geometries.forEach(function (val, index) {
	        exports.isGeometryObject(val, function (valid, err) {
	          if (!valid) {
	            // modify the err msg from 'isPosition' to note the element number
	            err[0] = 'at ' + index + ': '.concat(err[0]);
	            // build a list of invalide positions
	            errors = errors.concat(err);
	          }
	        });
	      });
	    } else {
	      errors.push('"geometries" must be an array');
	    }
	  } else {
	    errors.push('must have a member with the name "geometries"');
	  }

	  // run custom checks
	  errors = errors.concat(_customDefinitions('GeometryCollection', geometryCollection));

	  return _done(cb, errors)
	};

	/**
	 * Determines if an object is a valid Feature
	 * @method isFeature
	 * @param feature {Object}
	 * @param [cb] {Function} the callback
	 * @return {Boolean}
	 */
	exports.isFeature = function (feature, cb) {
	  if (!isObject(feature)) {
	    return _done(cb, ['must be a JSON Object'])
	  }

	  var errors = [];

	  if ('bbox' in feature) {
	    exports.isBbox(feature.bbox, function (valid, err) {
	      if (!valid) {
	        errors = errors.concat(err);
	      }
	    });
	  }

	  if ('type' in feature) {
	    if (feature.type !== 'Feature') {
	      errors.push('type must be "Feature"');
	    }
	  } else {
	    errors.push('must have a member with the name "type"');
	  }

	  if (!('properties' in feature)) {
	    errors.push('must have a member with the name "properties"');
	  }

	  if ('geometry' in feature) {
	    if (feature.geometry !== null) {
	      exports.isGeometryObject(feature.geometry, function (valid, err) {
	        if (!valid) {
	          errors = errors.concat(err);
	        }
	      });
	    }
	  } else {
	    errors.push('must have a member with the name "geometry"');
	  }

	  // run custom checks
	  errors = errors.concat(_customDefinitions('Feature', feature));

	  return _done(cb, errors)
	};

	/**
	 * Determines if an object is a valid Feature Collection
	 * @method isFeatureCollection
	 * @param featureCollection {Object}
	 * @param [cb] {Function} the callback
	 * @return {Boolean}
	 */
	exports.isFeatureCollection = function (featureCollection, cb) {
	  if (!isObject(featureCollection)) {
	    return _done(cb, ['must be a JSON Object'])
	  }

	  var errors = [];

	  if ('bbox' in featureCollection) {
	    exports.isBbox(featureCollection.bbox, function (valid, err) {
	      if (!valid) {
	        errors = errors.concat(err);
	      }
	    });
	  }

	  if ('type' in featureCollection) {
	    if (featureCollection.type !== 'FeatureCollection') {
	      errors.push('type must be "FeatureCollection"');
	    }
	  } else {
	    errors.push('must have a member with the name "type"');
	  }

	  if ('features' in featureCollection) {
	    if (Array.isArray(featureCollection.features)) {
	      featureCollection.features.forEach(function (val, index) {
	        exports.isFeature(val, function (valid, err) {
	          if (!valid) {
	            // modify the err msg from 'isPosition' to note the element number
	            err[0] = 'at ' + index + ': '.concat(err[0]);
	            // build a list of invalide positions
	            errors = errors.concat(err);
	          }
	        });
	      });
	    } else {
	      errors.push('"Features" must be an array');
	    }
	  } else {
	    errors.push('must have a member with the name "Features"');
	  }

	  // run custom checks
	  errors = errors.concat(_customDefinitions('FeatureCollection', featureCollection));

	  return _done(cb, errors)
	};

	/**
	 * Determines if an object is a valid Bounding Box
	 * @method isBbox
	 * @param bbox {Object}
	 * @param [cb] {Function} the callback
	 * @return {Boolean}
	 */
	exports.isBbox = function (bbox, cb) {
	  var errors = [];
	  if (Array.isArray(bbox)) {
	    if (bbox.length % 2 !== 0) {
	      errors.push('bbox, must be a 2*n array');
	    }
	  } else {
	    errors.push('bbox must be an array');
	  }

	  // run custom checks
	  errors = errors.concat(_customDefinitions('Bbox', bbox));

	  _done(cb, errors);
	};

	var nonGeoTypes = {
	  'Feature': exports.isFeature,
	  'FeatureCollection': exports.isFeatureCollection
	};

	var geoTypes = {
	  'Point': exports.isPoint,
	  'MultiPoint': exports.isMultiPoint,
	  'LineString': exports.isLineString,
	  'MultiLineString': exports.isMultiLineString,
	  'Polygon': exports.isPolygon,
	  'MultiPolygon': exports.isMultiPolygon,
	  'GeometryCollection': exports.isGeometryCollection
	};

	var allTypes = {
	  'Feature': exports.isFeature,
	  'FeatureCollection': exports.isFeatureCollection,
	  'Point': exports.isPoint,
	  'MultiPoint': exports.isMultiPoint,
	  'LineString': exports.isLineString,
	  'MultiLineString': exports.isMultiLineString,
	  'Polygon': exports.isPolygon,
	  'MultiPolygon': exports.isMultiPolygon,
	  'GeometryCollection': exports.isGeometryCollection,
	  'Bbox': exports.isBox,
	  'Position': exports.isPosition,
	  'GeoJSON': exports.isGeoJSONObject,
	  'GeometryObject': exports.isGeometryObject
	};

	exports.allTypes = allTypes;
	});
	var geojsonValidation_1 = geojsonValidation.define;
	var geojsonValidation_2 = geojsonValidation.isPosition;
	var geojsonValidation_3 = geojsonValidation.isGeoJSONObject;
	var geojsonValidation_4 = geojsonValidation.valid;
	var geojsonValidation_5 = geojsonValidation.isGeometryObject;
	var geojsonValidation_6 = geojsonValidation.isPoint;
	var geojsonValidation_7 = geojsonValidation.isMultiPointCoor;
	var geojsonValidation_8 = geojsonValidation.isMultiPoint;
	var geojsonValidation_9 = geojsonValidation.isLineStringCoor;
	var geojsonValidation_10 = geojsonValidation.isLineString;
	var geojsonValidation_11 = geojsonValidation.isMultiLineStringCoor;
	var geojsonValidation_12 = geojsonValidation.isMultiLineString;
	var geojsonValidation_13 = geojsonValidation.isPolygonCoor;
	var geojsonValidation_14 = geojsonValidation.isPolygon;
	var geojsonValidation_15 = geojsonValidation.isMultiPolygonCoor;
	var geojsonValidation_16 = geojsonValidation.isMultiPolygon;
	var geojsonValidation_17 = geojsonValidation.isGeometryCollection;
	var geojsonValidation_18 = geojsonValidation.isFeature;
	var geojsonValidation_19 = geojsonValidation.isFeatureCollection;
	var geojsonValidation_20 = geojsonValidation.isBbox;
	var geojsonValidation_21 = geojsonValidation.allTypes;

	/**
	 * Comma number formatter
	 * @param {Number} number Number to format
	 * @param {String} [separator=','] Value used to separate numbers
	 * @returns {String} Comma formatted number
	 */
	var lib = function commaNumber (number, separator) {
	  separator = typeof separator === 'undefined' ? ',' : ('' + separator);

	  // Convert to number if it's a non-numeric value
	  if (typeof number !== 'number') {
	    number = Number(number);
	  }

	  // NaN => 0
	  if (isNaN(number)) {
	    number = 0;
	  }

	  // Return Infinity immediately
	  if (!isFinite(number)) {
	    return '' + number
	  }

	  var stringNumber = ('' + Math.abs(number))
	    .split('')
	    .reverse();

	  var result = [];
	  for (var i = 0; i < stringNumber.length; i++) {
	    if (i && i % 3 === 0) {
	      result.push(separator);
	    }
	    result.push(stringNumber[i]);
	  }

	  // Handle negative numbers
	  if (number < 0) {
	    result.push('-');
	  }

	  return result
	    .reverse()
	    .join('')
	};

	var geojsonSummary = function(gj, options) {
	    var features = gj.features || gj;
	    options = options || {};

	    var types = options.types || {
	        Point: [' point', ' points'],
	        MultiPoint: [' multipoint', ' multipoints'],
	        Polygon: [' polygon', ' polygons'],
	        MultiPolygon: [' multipolygon', ' multipolygons'],
	        LineString: [' line', ' lines'],
	        MultiLineString: [' multiline', ' multilines'],
	        GeometryCollection: [' geometry collection', ' geometry collections']
	    };

	    var counts = {
	        Point: 0,
	        MultiPoint: 0,
	        Polygon: 0,
	        MultiPolygon: 0,
	        LineString: 0,
	        MultiLineString: 0,
	        GeometryCollection: 0
	    };

	    for (var i = 0; i < features.length; i++) {
	        if (features[i].geometry && features[i].geometry.type &&
	            typeof counts[features[i].geometry.type] == 'number') {
	            counts[features[i].geometry.type]++;
	        }
	    }

	    var parts = [];

	    for (var k in counts) {
	        if (counts[k]) {
	            parts.push(lib(counts[k]) + ((counts[k] > 1) ? types[k][1] : types[k][0]));
	        }
	    }

	    var sentence = '';
	    var oxford = parts.length > 2 ? ',' : '';

	    if (parts.length > 1) {
	        sentence = parts.slice(0, parts.length - 1).join(', ') +
	            oxford +
	            ' and ' +
	            parts[parts.length - 1];
	    } else if (parts.length === 1) {
	        sentence = parts[0];
	    } else {
	        sentence = '0 features';
	    }

	    return {
	        parts: parts,
	        sentence: sentence
	    };
	};

	var isBrowser = window && document;

	function buildGeojsonLogString(geojson) {
	  var url = "http://geojson.io/#data=data:application/json," + (encodeURIComponent(JSON.stringify(geojson)));
	  var ref = geojsonSummary(geojson.type === 'Feature' ? [geojson] : geojson);
	  var sentence = ref.sentence;

	  return ("^ GeoJSON: " + sentence + " - " + url);
	}

	if (isBrowser) {
	  var log = console.log;
	  console.log = function () {
	    var args = [], len = arguments.length;
	    while ( len-- ) args[ len ] = arguments[ len ];

	    args.forEach(function (arg) {
	      if(geojsonValidation.valid(arg)){
	        log(arg);
	        log(buildGeojsonLogString(arg));
	      } else {
	        log(arg);
	      }
	    });
	  };
	}

}());
