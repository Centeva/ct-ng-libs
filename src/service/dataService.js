angular.module('centeva-ng-libs.dataService', []).factory('dataService', function($http, $q, ns) {
    
    var ds = {};
    
	function getData(path, cache) {
		return $http.get(path, {cache: cache }).then(function (response) {
			return response.data;
		});
	}

	function postData(path, data) {
		return $http.post(path, data).then(function(response) {
			return response.data;
		});
	}

	function deleteData(path, data) {
		return $http.delete(path, data).then(function (response) {
			return response.data;
		});
	}

	ds.createGetFunction = function(path, cache) {
		return function(id) {
			return getData(path + (angular.isDefined(id) ? id : ""), cache);
		};
	}

	ds.createPostFunction = function(path) {
		return function(data) {
			return postData(path, data);
		};
	}

	ds.createDeleteFunction = function(path) {
		return function(id) {
			return deleteData(path + (id ? id : ""));
		};
	}
    
    //Should this be a function of the notification service?
    ds.all = function(promises) {
		return $q.all(promises).catch(function(error) {
			ns.showError(error.data);
		});
	}

    return ds;
});