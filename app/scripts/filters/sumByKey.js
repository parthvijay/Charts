'use strict';
angular.module('ciscoExecDashApp').filter('sumByKey', function () {
    return function (data, key) {
        if (typeof (data) === 'undefined' || typeof (key) === 'undefined') {
            return 0;
        }        
        var sum = 0;
        for (var itr in data) {
            sum += parseInt(data[itr][key]);
        }
        return sum;
    };
});
