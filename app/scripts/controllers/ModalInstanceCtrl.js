'use strict';
angular.module('ciscoExecDashApp').controller('ModalInstanceCtrl', ['$uibModalInstance', '$scope', function ($uibModalInstance, $scope) {

        $scope.ok = function () {
            $uibModalInstance.dismiss('cancel');
        };

        $scope.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        };
    }
]);