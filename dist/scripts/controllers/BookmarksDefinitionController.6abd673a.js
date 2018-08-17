'use strict';
angular.module('ciscoExecDashApp').controller('BookmarksDefinitionController', ['$uibModalInstance', 'GlobalBookmarkServ', '$scope', function ($uibModalInstance, GlobalBookmarkServ, $scope) {

        if (GlobalBookmarkServ.bookmark === undefined) {
            $scope.activeTabHeader = GlobalBookmarkServ.activeBookmark;
        } else {
            $scope.activeTabHeader = GlobalBookmarkServ.bookmark.name;
        }

        $scope.count = 0;
        $scope.getCount = function(product) {
            var colspan = Math.ceil(Object.keys(product.values).length/10);
            product.start = angular.copy($scope.count);
             $scope.count= $scope.count + colspan;
             product.end = angular.copy($scope.count) - 1;

            return colspan;
        };

        $scope.getNumber = function() {
            if(!$scope.count) {
                return false;
            }
            return new Array($scope.count);   
        };

        if ($scope.activeTabHeader === 'Upgrade Infrastructure') {
            $scope.activeTab = 0;
        } else {
            $scope.activeTab = 1;
        }

        $scope.ok = function () {
            $uibModalInstance.dismiss('cancel');
        };

        $scope.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        };

        $scope.selectTab = function (t) {
            $scope.activeTab = t;
        };

    }
]);