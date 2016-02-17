angular.module('centeva-ng-libs.codeTableService', []).provider('codeTableService', function codeTableServiceProvider() {
    var url = null;

    this.setUrl = function (newUrl) {
        url = newUrl;
    };

    this.$get = ["$http", "Dictionary", function codeTableServiceFactory($http, Dictionary) {
        var CodeTables = function () {
            var codeTables = this;
            var privateDictionaries = {};
            _.each(codeTables, function (values, code) {
                if (code === "$id") {
                    return;
                }
                Object.defineProperty(codeTables, code + "Dictionary", {
                    get: function () {
                        if (angular.isUndefined(privateDictionaries.code)) {
                            privateDictionaries.code = new Dictionary(values, "Code");
                        }
                        return privateDictionaries.code;
                    }
                });
            });
            return codeTables;
        };

        return {
            getCodeTables: function (entityNames) {
                return $http({ url: url, params: { entityNames: entityNames }, method: "GET", cache: true }).then(function (response) {
                    var codes = CodeTables.call(response.data);
                    return codes;
                });
            },
            lookupName: function (dictionary, code) {
                if (angular.isDefined(dictionary[code])) {
                    return dictionary[code].Name;
                }
                return code;
            }
        };
    }];
});