'use strict';
angular.module('ciscoExecDashApp').service('SFDCApiDispatcher', [
    '$q', '$http', '$rootScope','ConfigServ','$sessionStorage',
    function($q, $http, $rootScope,configServ,$sessionStorage) {
    var access_token = "";
     var _showAlert = function(reason) {
            var statusText = "Some error occurred during the process";
            if (!reason) {
                reason = {
                    status: 400
                };
            }
            if (reason) {
                switch (reason.status) {
                    case 404:
                        statusText = "Data not found for the applied filters.";
                        break;
                    case 500:
                        statusText = "Some error occurred, Please refresh the page and try again.";
                        break;
                    case 401:
                        statusText = "You don't have access for this application.";
                        break;
                    case 400:
                        statusText = "There is some error in HANA.";
                        break;
                    case -1:
                        statusText = "Some error occurred, Please refresh the page and try again.";
                        break;
                }
            }
            $rootScope.$emit('show-alert-msg', {
                type: 'danger',
                msg: statusText
            });
        };
      //function to generate authorization key to call mulesfot api
       var   _doAuthCall = function(){
            var deferred = $q.defer();
                $http({method: 'POST',
                        url: configServ.sdfc_env_details[configServ.sfdcEnvKey].token_url,
                        data: $.param({
                            client_id: configServ.sdfc_env_details[configServ.sfdcEnvKey].client_id,
                            client_secret: configServ.sdfc_env_details[configServ.sfdcEnvKey].client_secret,
                            grant_type: "client_credentials",
                            scope: "Read Write"
                        }),
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded'
                        }
                    }).then(function(response) {
                        access_token = response.data.access_token;
                        $sessionStorage.remove('sessionToken', access_token);
                        $sessionStorage.put('sessionToken', access_token);
                        deferred.resolve(response.data.access_token);
                    }, function(reason) {
                        deferred.reject(reason); 
                });
                     
            return deferred.promise;  
       };
        var _doApiCall = function(apiPath, type, data) {
            var deferred = $q.defer();
            var httpConfigObj = {
                'url': apiPath,
                'method': type
            };    

            if (type === 'GET' ) {
                httpConfigObj.params = data;

            } else {
                httpConfigObj.data = data && angular.toJson(data);
            }
            if (type === 'POST') {
                httpConfigObj.headers = {
                    'Content-Type': "application/json"
                }
            }
            $rootScope.$broadcast('CISCO-REQ-START');
            $http(httpConfigObj).then(function(response) {
                $rootScope.$broadcast('CISCO-REQ-END');
                if (response && response.data) {
                    $rootScope.$emit('show-alert-msg');
                    deferred.resolve(response.data);
                } else {    
                    _showAlert(null);
                }
            }, function(error) {
                _showAlert(error);
                $rootScope.$broadcast('CISCO-REQ-END');
                deferred.reject(error.data);
            });

            return deferred.promise;
        };

        return {
            get: function(apiPath, params) {
                return _doApiCall(apiPath, 'GET', params);
            },
            put: function() {},
            post: function(apiPath, params) {
                return _doApiCall(apiPath,'POST',params);
            },
            token_auth_post: function(){
                return _doAuthCall();   
            }
        };
    }
]);
