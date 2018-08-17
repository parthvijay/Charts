angular.module('ciscoExecDashApp').directive('ciscoSpinner', ['$rootScope', '$timeout', function ($rootScope, $timeout) {
    return {
        restrict: "E",
        template: '<div class="loaderBg" ng-show="loader"></div><div ng-show="loader" class="sham-spinner-container"></div>',
        link: function (scope, element, attrs) {
            scope.loader = false;
            var pendingRequests = [];
            var timeoutPromise = null;

            $rootScope.$on('CISCO-REQ-START', function () {
                if (!scope.loader) {
                    scope.loader = true;
                }
                pendingRequests.push('req');
            });

            $rootScope.$on('CISCO-REQ-END', function () {
                pendingRequests.pop();
                if (timeoutPromise !== null) {
                    $timeout.cancel(timeoutPromise);
                }
                timeoutPromise = $timeout(function () {
                    if (pendingRequests.length === 0) {
                        scope.loader = false;

                    }
                }, 500);
            });
        }
    };
}]);