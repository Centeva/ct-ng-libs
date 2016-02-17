///<reference path="../../../.grunt/grunt-contrib-jasmine/jasmine.js"/>
describe('codeTableService', function () {
    var factory, httpBackend, codeTableService;
    angular.module('codeTableServiceTest', ['centeva-ng-libs.codeTableService'])
        .config(function (codeTableServiceProvider) {
            codeTableServiceProvider.setUrl('./api/action/CodeTable/ReadCodeTables');
        });

    beforeEach(function () {
        module('centeva-ng-libs.codeTableService', 'codeTableServiceTest');

        inject(function (_codeTableService_, $httpBackend) {
            codeTableService = _codeTableService_;
            httpBackend = $httpBackend;
            
        });
    });

    it('codeTableService should have a getCodeTables function, and loopupName function, and toArray function', function () {
        expect(angular.isFunction(codeTableService.getCodeTables)).toBe(true);
        expect(angular.isFunction(codeTableService.lookupName)).toBe(true);
    });

    it('codeTableService should make a call to get data', function () {
        var returnData = 'codeTable';
        httpBackend.expectGET("./api/action/CodeTable/ReadCodeTables?entityNames=test").respond(returnData);
        var returnedPromise = codeTableService.getCodeTables("test");
        var result;
        returnedPromise.then(function (response) {
            result = response;
        });
        // flush the backend to "execute" the request to do the expectedGET assertion.
        httpBackend.flush();
        //expected applicants to be returned
        expect(result).toEqual("codeTable");
    });

    it('lookupName should give me the code Im looking for from a list', function () {
        var returnData = {
            "test": { code: "test" },
            "test1": { code: "test1" },
            "test2": { code: "test2" }
        };
        var returnedValue = codeTableService.lookupName(returnData, "test3");
        expect("test3").toEqual(returnedValue);
    });

});
