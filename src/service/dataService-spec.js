///<reference path="../../../.grunt/grunt-contrib-jasmine/jasmine.js"/>
describe('dataService', function () {

    var $httpMock, nsMock, $q, $rootScope;

    beforeEach(function () {
        module('centeva-ng-libs.dataService', function ($provide) {
            $httpMock = jasmine.createSpyObj('$http', ['get', 'post', 'delete']);
            nsMock = jasmine.createSpyObj('ns', ['showError']);



            $provide.provider('$http', function () {
                this.$get = function () { return $httpMock; };
            });
            $provide.provider('ns', function () {
                this.$get = function () { return nsMock; };
            });
        });
    });

    beforeEach(inject(function (_$q_, _$rootScope_) {
        $q = _$q_;
        $rootScope = _$rootScope_;
        
        $httpMock.get.and.returnValue($q.when(''));
        $httpMock.post.and.returnValue($q.when(''));
        $httpMock.delete.and.returnValue($q.when(''));
    }))

    it('Create get function', inject(function (dataService) {
        var doCache = true;
        var url = '/test/url';
        
        //Generate function
        var fn = dataService.createGetFunction(url, doCache);
        expect(angular.isFunction(fn)).toBe(true);
        
        //Call function, generated function should pass proper parameters
        fn();
        expect($httpMock.get).toHaveBeenCalledWith(url, {cache: doCache });
        
        //Call function with ID
        fn(1);
        expect($httpMock.get).toHaveBeenCalledWith(url+'1', {cache: doCache});
    }));
    
    it('Create post function', inject(function (dataService) {
        var url = '/test/url';
        var data = {'test': 'test'};
        
        //Generate function
        var fn = dataService.createPostFunction(url);
        expect(angular.isFunction(fn)).toBe(true);
        
        //Call function, generated function should pass proper parameters
        fn(data);
        expect($httpMock.post).toHaveBeenCalledWith(url, data);
    }));
    
    it('Create delete function', inject(function (dataService) {
        var url = '/test/url';
        
        //Generate function
        var fn = dataService.createDeleteFunction(url);
        expect(angular.isFunction(fn)).toBe(true);
        
        //Call function, generated function should pass proper parameters
        fn();
        expect($httpMock.delete).toHaveBeenCalledWith(url, undefined);
        
        fn(1);
        expect($httpMock.delete).toHaveBeenCalledWith(url+'1', undefined);
    }));
    
    it('Should catch error and call ns', inject(function(dataService){
        var deferred = $q.defer();
        dataService.all([deferred.promise]);
        deferred.reject({data:'Error Message'});
        $rootScope.$apply();
        expect(nsMock.showError).toHaveBeenCalledWith('Error Message');
    }));
});
