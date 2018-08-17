
/*jshint sub:true*/
'use strict';
angular.module('ciscoExecDashApp').factory('RequestInterceptor', [   
        '$rootScope',
        '$injector',
        '$q',
        '$location',
        '$window',function(scope, $injector, $q, $location, $window) {  
   

            var sessionTimeout =  false;
            var userNoAccess = false;
            var noData = false;
            var systemDown = false;
            var sfdcError = false;
            return  {
                request: function (config) {
                    var deferred = $q.defer();
                    var hasProxy = window.localStorage.getItem('proxy');
                    if (hasProxy !== null) {
                        config.headers['fromPartyID'] = hasProxy;
                    }
                    deferred.resolve(config);
                    return deferred.promise;
                },

                response: function (response) {

                    if(response.data.errorCode === "ERR-598" ||   response.data.errorCode === "ERR-597" || response.data.errorCode === "ERR-596" || response.data.errorCode === "ERR-595" || response.data.errorCode === "ERR-400"){
                         sfdcError = true;
                        scope.$broadcast('sfdc-error',sfdcError);
                    }
                    if (response.status === 302) {
                        $window.location.reload();
                    }
                    scope.$emit('show-alert-msg');
                    return response;
                },

                responseError: function (response) {

                    // KD ---- error code handling for API calls
                    if ((response.status === 504) || (response.status === 500)  ){                           
                        systemDown = true;
                        scope.$broadcast('system-down',systemDown);             
                    }
                    else if(response.status === 401){
                        userNoAccess = true;
                        scope.$broadcast('no-access',userNoAccess);
                    }
                    else if(response.status === 404){
                        noData = true;
                        scope.$broadcast('no-data',noData);
                    }
                    else{
                        sessionTimeout = true;
                        scope.$broadcast('session-timeout',sessionTimeout); 
                    }
                    return $q.reject(response);

                }
            }

}]);