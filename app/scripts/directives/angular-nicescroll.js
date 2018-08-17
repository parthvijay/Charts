(function () {
    'use strict';
    angular
            .module('angular-nicescroll', [])
            .directive('ngNicescroll', ngNicescroll);

    ngNicescroll.$inject = ['$rootScope', '$parse', 'isMobile'];

    /* @ngInject */
    function ngNicescroll($rootScope, $parse, isMobile) {
        // Usage:
        //
        // Creates:
        //
        var directive = {
            link: link
        };
        return directive;

        function link(scope, element, attrs, controller) {

            if (isMobile) {
                return;
            }

            var niceOption = scope.$eval(attrs.niceOption);

            niceOption = {
                autohidemode: false,
                cursoropacitymax: 0.6,
                cursorwidth: '7px',
                cursorcolor: "#787878",
                horizrailenabled: false
            };

            var niceScroll = $(element).niceScroll(niceOption);
            var nice = $(element).getNiceScroll();

            if (attrs.niceScrollObject){
                $parse(attrs.niceScrollObject).assign(scope, nice);
            }

            // on scroll end
            niceScroll.onscrollend = function (data) {
                if (this.newscrolly >= this.page.maxh) {
                    if (attrs.niceScrollEnd){
                        scope.$evalAsync(attrs.niceScrollEnd);
                    }

                }
                if (data.end.y <= 0) {
                    // at top
                    if (attrs.niceScrollTopEnd){
                        scope.$evalAsync(attrs.niceScrollTopEnd);
                    }
                }
            };

            scope.$on('$destroy', function () {
                if (angular.isDefined(niceScroll.version)) {
                    niceScroll.remove();
                }
            });

        }
    }

})();
