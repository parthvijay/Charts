'use strict';
angular.module('ciscoExecDashApp').filter('darken', [function () {
        return function (color) {
            return tinycolor(color).darken(8).toString();
        };
    }
]);