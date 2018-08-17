'use strict';
angular.module('ciscoExecDashApp').filter('dotdot', function () {
    return function (val, max, wordwise) {
        if (!val)
            return '';
        var max = max || 10;
        max = parseInt(max, 10);
        val = val.replace(/(<([^>]+)>)/ig, '');
        if (val.length <= max)
            return val;
        val = val.substr(0, max - 3);
        if (wordwise || false) {
            var lastspace = val.lastIndexOf(' ');
            if (lastspace !== -1)
                val = val.substr(0, lastspace);
        }
        return val + '...';
    };
});