'use strict';
angular.module('ciscoExecDashApp').filter('formatValue', ['$window', function ($window) {
        return function (val, full, percent, normal) {
            var d3 = $window.d3;
            if (typeof val === 'undefined') {
                return;
            }
            if (typeof normal !== 'undefined' && normal) {
                var f = d3.formatPrefix(",.2", 1e9);
                var t = f(val);
            }
            if(typeof percent !== 'undefined' && percent && !full){
                var t = Math.abs(val) + '%';
            }
            else {
                if (typeof full === 'undefined' || !full) {
                    var t = d3.format(",.3s")(val);
                }
                else {
                    var t = d3.format(",.6s")(val);
                }
            }
            t = (t.replace("G", "B"));
            if (typeof full !== 'undefined' && full && typeof percent !== 'undefined' && percent) {
                var t = Math.abs(t).toFixed(2) + '%';
            }
            return t;
        };
    }
]);