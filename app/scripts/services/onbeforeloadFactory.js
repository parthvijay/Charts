'use strict';
angular.module('ciscoExecDashApp').factory('beforeUnload', ['$rootScope', '$window', function($rootScope, $window){
        // Events are broadcast outside the Scope Lifecycle
    
        $window.onbeforeunload = function (e) {
            var confirmation = {};
            $rootScope.$broadcast('onBeforeUnload', confirmation);
            // if (event.defaultPrevented) {
            //     return confirmation.message;
            // }
        };
        
        $window.onunload = function () {
            $rootScope.$broadcast('onUnload');
        };
        
        return {};
}]);