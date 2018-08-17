'use strict';
angular.module('ciscoExecDashApp').service('ServiceFiltersServ', [
    '$resource',
    'RestUri',
    '$q',
    'ApiDispatcher',
    '$http',
     function ($resource, restUri, $q, apiDispatcher, $http) {
        var serviceserviceFiltersServObj = {};

        var getApiPath = function (key) {
            if (!key) {
                key = 'filters';
            }
            var apiPath = restUri.getUri(key);
            if (!apiPath || window.ciscoConfig.local) {
                apiPath = 'data/filters/filters.json';
            }
            return apiPath;
        };

        serviceFiltersServObj.getAllFilters = function () {
            var deferred = $q.defer();
            apiDispatcher.get(getApiPath()).then(function (response) {
                response[1].type = "radio";
                response[1].categoryId = 4;
                response[1].selected = "";
                angular.forEach(response[1].filters,function(val){
                        delete val.checked;
                     });
               deferred.resolve(response);
            }, function (reason) {
                deferred.reject(reason);
            });
            return deferred.promise;
        };

        serviceFiltersServObj.getSalesFilterData = function (level, node) {
            var deferred = $q.defer();
            apiDispatcher.get(getApiPath('sales-filter') + '/' + level, {
              "parent": node
            }).then(function (response) {
                deferred.resolve(response);
            }, function (reason) {
                deferred.reject(reason);
            });
            return deferred.promise;
        };

        serviceFiltersServObj.getAccountManagerFilterData = function (level, node, actManager) {
            var deferred = $q.defer();
            var opt = {
                "parent": node
            };
            if (actManager) {
                opt["accountManager"] = actManager;
            }
            apiDispatcher.get(getApiPath('sales-account-filter') + '/' + level, opt).then(function (response) {
                deferred.resolve(response);
            }, function (reason) {
                deferred.reject(reason);
            });
                
            return deferred.promise;
        };

        serviceFiltersServObj.salesFilterDataSelected = function (id, level) {
            var deferred = $q.defer();
            apiDispatcher.get(getApiPath('sales-filter-selected'), {
                'id': id,
                'level': level
            }).then(function (response) {
                deferred.resolve(response);
            }, function (reason) {
                deferred.reject(reason);
            });
            return deferred.promise;
        };

         serviceFiltersServObj.getDropdown = function (payload, salesLevel,slug, accountManager) {
            var deferred = $q.defer();
            //console.log(payload);
            if(slug === 'sales'){
            if(salesLevel === 1){
                payload = null;
            }
            if(salesLevel < 7){
                apiDispatcher.post(getApiPath('sales-advanced-filters')+ '/' + salesLevel, {
                "parentNode": payload
                }).then(function (response) {
                    deferred.resolve(response);
                }, function (reason) {
                    deferred.reject(reason);
                });
            }
        }else if(slug === 'account'){
                    if(salesLevel === 1){
                        $q.all([
                            apiDispatcher.get( getApiPath('filters') + '/' + "organisation", {
                            "appName": 'CE'})
                        ]).then(function(responses) {
                            deferred.resolve(responses);
                        }, function(reason) {
                            deferred.reject(reason);
                        });
                    }
            }        
            return deferred.promise;

        };
        return serviceFiltersServObj;
    }
]);