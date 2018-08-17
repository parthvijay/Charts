/*jshint sub:true*/
'use strict';
angular.module('ciscoExecDashApp').directive('actionTable', ['$timeout', function ($timeout) {
        return {
            restrict: 'A',
            scope: {
                rows: '='
            },
            link: function (scope, element, attr) {
                var ind = element.closest('tr').attr('index');
                var value = scope.rows.rows[ind] ? (scope.rows.rows[ind].value + '%') : '';
                element.after('<td class="text-right"><span class="dotdot">' + value + '</span></td>');
            }
        };
    }
]);