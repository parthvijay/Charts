'use strict';
angular.module('ciscoExecDashApp').controller('CollabReportSuccessController', ['$uibModalInstance', '$scope', function ($uibModalInstance, $scope) {

        $scope.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        };

        $scope.ok = function () {
            $uibModalInstance.dismiss('cancel');
        };
    }
]);
