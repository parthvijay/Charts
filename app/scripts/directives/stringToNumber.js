'use strict';
angular.module('ciscoExecDashApp').directive('stringToNumber', ['$timeout', function ($timeout) {
        return {
            require: 'ngModel',
    link: function(scope, element, attrs, ngModel) {
      ngModel.$parsers.push(function(value) {
        return '' + value;
      });
      ngModel.$formatters.push(function(value) {
        return parseFloat(value, 10);
      });
    }
        };
    }
]);