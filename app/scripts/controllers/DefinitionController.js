'use strict';
angular.module('ciscoExecDashApp').controller('DefinitionController', ['$uibModalInstance', '$scope', function ($uibModalInstance, $scope) {

        $scope.activeTab = 0;

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