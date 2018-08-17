'use strict';
angular.module('ciscoExecDashApp').filter('lighten', [function () {
        return function (color) {
            return tinycolor(color).lighten(22).toString();
        };
    }
]);