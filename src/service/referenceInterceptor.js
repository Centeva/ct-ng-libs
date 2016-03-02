angular.module('centeva-ng-libs.referenceInterceptor', []).factory('referenceInterceptor', function () {
    function parse(obj) {
        var data = [];
		/**
         * Depth first search of the object tree structure looking for $ref references and replacing
         * them with their corresponding objects.
         *
         * Parent is null/undefined the first time this is called.
         */
        function _replace(obj) {
            var isObj = angular.isObject(obj);
            if (angular.isArray(obj)) {// If it is an array check array elements.
                for (var i = 0; i < obj.length; i++) {
                    obj[i] = _replace(obj[i]);
                }
            } else if (isObj) {
                if (angular.isDefined(obj.$id)) {// If has $id
                    data[obj.$id] = obj;// Store in dictionary
                }
                for (var x in obj) {
                    if (obj.hasOwnProperty(x)) {
                        obj[x] = _replace(obj[x], obj);// Replace references on each of my children 
                    }
                }
            }

            if (isObj && angular.isDefined(obj.$ref) && angular.isDefined(data[obj.$ref])) {// If the object has a reference that exists in our dictionary
                return data[obj.$ref]; // Replace the reference with the correct object
            }
            return obj;
        }
        _replace(obj, null);
        return obj;
    }

    function clean(obj, parents, fromArray) {
        var isObj = angular.isObject(obj);
        
        var myParents = parents;
        if (isObj && angular.isDefined(obj.$id)) {
            if (parentContains(parents, obj.$id)) {
                if  (fromArray) {
                    return clean(angular.copy(obj), [parents[parents.length-1]], false);
                }
                return { $ref: obj.$id }
            }
            myParents = angular.copy(parents);
            myParents.push(obj.$id)
        }
        
        //No circular references yet, parse parents.
        if (angular.isArray(obj)) {// If it is an array clean
            for (var i = 0; i < obj.length; i++) {
                obj[i] = clean(obj[i], myParents, true);
            }
        } else if (isObj) {
            for (var x in obj) {
                if (obj.hasOwnProperty(x)) {
                    obj[x] = clean(obj[x], myParents, false);
                }
            }
        }
        
        return obj;
    }

    function parentContains(parents, $id) {
        for (var i = 0; i < parents.length; i++) {
            if (parents[i] === $id) {
                return true;
            }
        }
        return false;
    }

    return {
        'response': function (response) {
            console.time('referenceInterceptor');
            parse(response);
            clean(response, []);
            console.timeEnd('referenceInterceptor');
            return response;
        },
    };
}).config(function ($httpProvider) {
    $httpProvider.interceptors.push('referenceInterceptor');
});
