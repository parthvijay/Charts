/*jshint sub:true*/
'use strict';
angular.module('ciscoExecDashApp').directive('directiveWriter', ['$compile', function ($compile) {
        return {
            restrict: 'E',
            scope: {
                data: '='
            },
            link: function (scope, element) {
                var template, content;
                scope.data.forEach(function (directive) {
                    template = "<div " + directive.directive + " ></div>";
                    var content = $compile(template)(directive);
                    element.append(content);
                });
            }
        };
    }
]);
