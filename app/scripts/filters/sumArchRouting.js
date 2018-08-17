'use strict';
angular.module('ciscoExecDashApp').filter('sumArchRouting', function () {
    return function (data, key) {
        if (typeof (data) === 'undefined' || typeof (key) === 'undefined') {
            return 0;
        }
        var sum = 0;
        if (key !== 'pipeline') {
            for (var itr in data) {
                for (var itr1 in data[itr]["family"]) {
                    var tmp = data[itr]["family"][itr1];
                    sum += parseInt(tmp[key]);
                }
            }
        } else {
            for (var itr in data) {
                var tmp = data[itr];
                sum += parseInt(tmp[key]);
            }
        }
        return sum;
    };
});