'use strict';
angular.module('ciscoExecDashApp').filter('objectTotal', [function () {
        return function (val, active) {
            if (typeof val === 'undefined')
                return;
            var t = 0;
            if (typeof val === 'object') {
                if (!active) {
                    for (var prop in val) {
                        t += val[prop];
                    }
                }
                else {
                    t = val[active];
                }
            }
            else {
                t = val;
            }
            return t;
        };
    }
]);