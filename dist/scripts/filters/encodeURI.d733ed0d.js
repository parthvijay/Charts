'use strict';
angular.module('ciscoExecDashApp').filter('encodeURI', function () {
    return window.encodeURI;
});