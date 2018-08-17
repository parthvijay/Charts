'use strict';
angular.module('ciscoExecDashApp').filter('keyValueInArray', [function () {
        return function (d, s) {
            var f = -1;
            angular.forEach(d, function (o, ind) {
                if (o.state === s) {
                    f = ind;
                }
            });
            return f;
        };
    }
]);