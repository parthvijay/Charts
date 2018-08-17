'use strict';
angular.module('ciscoExecDashApp').controller('CreateEstimateController', ['$uibModalInstance', '$scope', function ($uibModalInstance, $scope) {

        $scope.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        };
    }
]);