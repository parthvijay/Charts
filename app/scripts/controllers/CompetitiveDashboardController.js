'use strict';
angular.module('ciscoExecDashApp').controller('CompetitiveDashboardController', ['$uibModalInstance', '$scope', function ($uibModalInstance, $scope) {

        $scope.ok = function () {
            $uibModalInstance.dismiss('cancel');
        };

        $scope.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        };
    }
]);