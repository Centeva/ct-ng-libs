angular.module('centeva-ng-libs.referenceInterceptor', []).factory('referenceInterceptor', function () {
	function parse(obj) {
		var data = [];
        /**
         * Depth first search of the object tree structure looking for $ref references and replacing
         * them with their corresponding objects.
         *
         * Parent is null/undefined the first time this is called. 
         */
		function _replace(obj, parent) {
			var isObj = angular.isObject(obj);
			if (angular.isArray(obj)) {// If it is an array check array elements.
				for (var i = 0; i < obj.length; i++) {
					obj[i] = _replace(obj[i], parent);
				}
			} else if (isObj) {// If object, add to ref to parent.
				obj.$parent = parent;// add parent
				if (angular.isDefined(obj.$id)) {// If has $id
					data[obj.$id] = obj;// Store in dictionary
				}
				for (var x in obj) {
					if (obj.hasOwnProperty(x) && x !== '$parent') {
						obj[x] = _replace(obj[x], obj);// Replace references on each of my children 
					}
				}
			}
			
			if (isObj && angular.isDefined(obj.$ref) && angular.isDefined(data[obj.$ref])){// If the object has a reference that exists in our dictionary
				if (!parentContains(obj, obj.$ref)) { // If Reference isn't a parent
					return data[obj.$ref]; // Replace the reference with the correct object
				} else {// we may want to create an array of the ones that need copy, and do all copies later.
					var copiedData = angular.copy(data[obj.$ref]);// Replace the reference with a copy of the object
					removeParent(copiedData);// Children may also have parent here!
					return copiedData;// Replace the reference with a copy of the object
				}
			}
			if (isObj) {
				delete obj.$parent;
			}
			return obj;
		}
		_replace(obj, null);
		return obj;
	}

	// Recursive function to remove $parent from object and children.
	function removeParent(obj) {
		if (angular.isArray(obj)) {// If it is an array check array elements.
			for (var i = 0; i < obj.length; i++) {
				removeParent(obj[i]);
			}
		} else if (angular.isObject(obj)) {
			delete obj.$parent;
			for (var x in obj) {
				if (obj.hasOwnProperty(x)) {
					removeParent(obj[x]);
				}
			}
		}
	}

    /**
     * Recursive function to search up the parent tree to avoid circular references.
     */
	function parentContains(child, $ref) {
		if (!angular.isObject(child)) {
			return false;
		}
		if (child.$id === $ref) {
			return true;
		}
		return parentContains(child.$parent, $ref);
	}
	
	return {
		'response': function(response) {
		  return parse(response);
		},
	};
}).config(function($httpProvider){
	$httpProvider.interceptors.push('referenceInterceptor');	
});