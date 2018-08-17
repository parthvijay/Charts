'use strict';
angular.module('ciscoExecDashApp').filter('searchTechnologies', function () {
    return function (items, field) {
        if (field === undefined || field === null || field === '') {
            return items;
        }

        var result = {};
        angular.forEach(items, function (value, key) {
            if (key.toLowerCase().includes(field.toLowerCase())) {
                result[key] = value;
            }
        });
        return result;
    };
});
