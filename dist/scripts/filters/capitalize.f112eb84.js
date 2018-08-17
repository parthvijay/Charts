/**
 * Created by msirwani on 8/31/2016.
 */
'use strict';
angular.module('ciscoExecDashApp').filter('capitalize', function () {
    return function (input) {
        return (!!input) ? input.charAt(0).toUpperCase() + input.substr(1).toLowerCase() : '';
    }
});
