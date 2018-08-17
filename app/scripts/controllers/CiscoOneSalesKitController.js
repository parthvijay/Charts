'use strict';
angular.module('ciscoExecDashApp').controller('CiscoOneSalesKitController', ['$uibModalInstance', '$scope', function ($uibModalInstance, $scope) {

        $scope.ok = function () {
            $uibModalInstance.dismiss('cancel');
        };

        $scope.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        };
    }
]);