'use strict';
angular.module('ciscoExecDashApp').controller('DeleteBookmarkController', ['$uibModalInstance', '$scope', function ($uibModalInstance, $scope) {

        $scope.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        };

        $scope.deleteBookmark = function () {
            $uibModalInstance.close();
        };
    }
]);