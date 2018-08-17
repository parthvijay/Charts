'use strict';
angular.module('ciscoExecDashApp').service('ApiDispatcher', [
    '$q', '$http', '$rootScope',
    function($q, $http, $rootScope) {
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


        var  _doTestApiCall =  function(){
            var deferred = $q.defer();
            var config = {
                'Content-Type': "text/plain"
            };
            var data = "ketan";
                       $http.post("https://crleadership-dev.cloudapps.cisco.com/CEREWARD_API/testpost/123", data, config)
   .then(
       function(response){
         // success callback
       }, 
       function(response){
         // failure callback
       }
       
    );

return deferred.promise;

        };
        var _doApiCall = function(apiPath, type, data) {
            var deferred = $q.defer();

            var httpConfigObj = {
                'url': apiPath,
                'method': type,
                'timeout': 100000
            };
            
            if (type === 'GET' ) {
                httpConfigObj.params = data;
            } else {
                httpConfigObj.data = data && angular.toJson(data);
            }
            if (type === 'POST') {
                httpConfigObj.headers = {
                    'Content-Type': "application/json"
                };
            }
            if (type === 'DELETE' ) {
                httpConfigObj.params = data;
            } else {
                httpConfigObj.data = data && angular.toJson(data);
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
            delete: function(apiPath, params) {
                return _doApiCall(apiPath, 'DELETE', params);
            },
            post: function(apiPath, params) {
                return _doApiCall(apiPath,'POST',params);
            },
            test_post: function(){
                return _doTestApiCall();
            },
        };
    }
]);
