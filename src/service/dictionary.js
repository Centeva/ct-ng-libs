angular.module('centeva-ng-libs.dictionary', []).factory('Dictionary', function () {
	/**
		 * Constructor
		 * data - Object or Array in
		 * key - required for array, used to access key for object e.g. array[i][key]
		 */
	var Dictionary = function (data, key) {
		var _array = [];
		/**
		* Internal array representation
		*/
		Object.defineProperties(this, {
			"_array": {
				get: function() {
					return _array;
				},
				set: function(array) {
					_array = array;
				}, 
				enumerable: false
			}
		});
		this.init(data, key);
	};
	/**
	 * Initializes the dictionary with object/array data.
	 * data - Object or Array in
	 * key - required for array, used to access key for object e.g. array[i][key]
	 */
	Dictionary.prototype.init = function (data, key) {
		if (angular.isArray(data)) {
			for (var i = 0; i < data.length; i++) {
				this[data[i][key]] = data[i];
			}
			this._array = data.slice(0);
		} else if (angular.isObject(data)) {
			for (var child in data) {
				if (child !== '$id' && data.hasOwnProperty(child)) {
					this._array.push(data[child]);
					this[child] = data[child];
				}
			}
		}
	};
	/**
	 * Adds a value to the object and array. This should be used in lieu of other means of
	 * adding values to the object.
	 */
	Dictionary.prototype.add = function (key, value) {
		this._array.push(value);
		this[key] = value;
	};
	/**
	 * returns true if the dictionary contains the key
	 */
	Dictionary.prototype.contains = function (key) {
		return typeof this[key] !== 'undefined';
	};
	/**
	 * Removes an element from both stores.
	 */
	Dictionary.prototype.remove = function (key) {
		var val = this[key];

		for (var i = 0; i < this._array.length; i++) {
			if (this._array[i] === val) {
				this._array.splice(i, 1);
				break;
			}
		}
		delete this[key];
	};

	return Dictionary;
});
