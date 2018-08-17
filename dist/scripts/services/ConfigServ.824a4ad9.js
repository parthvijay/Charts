'use strict';
angular.module('ciscoExecDashApp').service('ConfigServ', ['$window', function ($window) {
        return $window.ciscoConfig;
    }
]);