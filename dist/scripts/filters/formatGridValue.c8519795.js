'use strict';
angular.module('ciscoExecDashApp').filter('formatGridValue', ['$window', function ($window) {
        return function (val, full, percent, addDecimals) {
            var d3 = $window.d3;
            if (typeof val === 'undefined') {
                return "";
            }else if(val === 0){
                return "";
            }else if(addDecimals){
                var t = d3.format(",.2f")(val);
            }
            else {
                var formatter = new Intl.NumberFormat('en-US', {
                    minimumFractionDigits:0,
                  });
                  var t = formatter.format(val);
                if(percent){
                    //DE132107
                    return Math.abs(t).toFixed(2)+"%";
                }
            }
            return t;
        };
    }
]);