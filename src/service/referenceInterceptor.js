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
			if (angular.isArray(obj)) {
				//If array check array elements.
				for (var i = 0; i < obj.length; i++) {
					obj[i] = _replace(obj[i], parent);
				}
			} else if (isObj) {
				//If object, add to ref to parent.
				obj.$parent = parent;
				if (angular.isDefined(obj.$id)) {
					data[obj.$id] = obj;
				}
				for (var x in obj) {
					if (obj.hasOwnProperty(x) && x !== '$parent') {
						obj[x] = _replace(obj[x], obj);
					}
				}
			}

			if (isObj &&
				angular.isDefined(obj.$ref) && //Has a reference
				!parentContains(obj, obj.$ref) && //Reference isn't a parent
				angular.isDefined(data[obj.$ref])) { //Ref exists
				return data[obj.$ref];
			}
			if (isObj) {
				delete obj.$parent;
			}
			return obj;
		}
		_replace(obj, null);
		return obj;
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
