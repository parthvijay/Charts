/*jshint sub:true*/
'use strict';
angular.module('ciscoExecDashApp').service('SfdcServ', [
    '$resource', 'RestUri', '$q', 'SFDCApiDispatcher', 'ConfigServ', '$translate', 'UserServ', '$http',
        function($resource, restUri, $q, sfdcApiDispatcher, configServ, $translate, UserServ, $http) {


        var sfdcServObj = {};
        var cecId = "";

        var getApiPath = function(key) {
            var apiPath = restUri.getUri(key);
            return apiPath;
        };

        // var access_token = "";
        var getTokenAuthenticationKey = function() {
            var deferred = $q.defer();
            $http.defaults.withCredentials = false;
            sfdcApiDispatcher.token_auth_post().then(function(response) {
                $http.defaults.headers.common["Accept"] = "application/json";
                $http.defaults.headers.common["Content-Type"] = "application/json;charset=UTF-8";
                $http.defaults.headers.common["Access-Control-Allow-Origin"] = "*";
                //setting to false enableing mulesoft connections :- ketan
                //setting token for authentication
                $http.defaults.headers.common.Authorization = 'Bearer ' + response;
                deferred.resolve(response);
            }, function(reason) {
                deferred.reject(reason);
            });

            return deferred.promise;
        };

        sfdcServObj.getAccountsData = function(accountDetails) {
            var deferred = $q.defer();
            var savId;
            // getTokenAuthenticationKey().then(function() { .. Parth
                if (accountDetails.length !== 0) {
                    if (angular.isDefined(accountDetails.stateId)) {
                        savId = accountDetails.stateId;
                    }
                    if (angular.isDefined(accountDetails.savId)) {
                         savId = accountDetails.savId;
                    }
                }

                cecId = accountDetails.userInfo;
                // cecId = "paachary";
                // var savId = "283338959";
                var opptyOwnerFlag = "Y";
                var sourceSystemId = "CE";

                var apiPath = getApiPath('sfdc-accounts-api');
                window.localStorage.setItem('savId', savId);
                window.localStorage.setItem('guId', accountDetails.guID);

                sfdcApiDispatcher.post(apiPath, {
                    savId: savId ? savId : null,
                    opptyOwnerFlag: opptyOwnerFlag ? opptyOwnerFlag : null,
                    sourceSystemId: sourceSystemId ? sourceSystemId : null,
                    userName: cecId ? cecId : null,
                    guId: accountDetails.guID ? accountDetails.guID : null
                }).then(function(response) {
                    delete $http.defaults.headers.common.Authorization;
                    delete $http.defaults.headers.common["Access-Control-Allow-Origin"];
                    $http.defaults.withCredentials = true; //   change to false when pointing to local and change to stage while pointing stage
                    deferred.resolve(response);
                }, function(reason) {
                    deferred.reject(reason);
                });
            //});


            return deferred.promise;
        };

        sfdcServObj.getProductsandServicesData = function(cuurencyCode) {
            var deferred = $q.defer();
            getTokenAuthenticationKey().then(function() {
                var sourceSystemId = "CE";
                var currencyCode = cuurencyCode;
                var apiPath = getApiPath('sfdc-products-api');

                sfdcApiDispatcher.get(apiPath, {
                    sourceSystemId: sourceSystemId ? sourceSystemId : null,
                    userName: cecId ? cecId : null,
                    currencyCode: currencyCode ? currencyCode : null
                }).then(function(response) {
                    delete $http.defaults.headers.common.Authorization;
                    delete $http.defaults.headers.common["Access-Control-Allow-Origin"];
                    $http.defaults.withCredentials = true;
                    deferred.resolve(response);

                }, function(reason) {
                    deferred.reject(reason);
                });
            });

            return deferred.promise;
        };
        return sfdcServObj;
    }
]);
