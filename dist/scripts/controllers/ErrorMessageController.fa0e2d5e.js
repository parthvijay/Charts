'use strict';
angular.module('ciscoExecDashApp').controller('ErrorMessageController', ['$uibModalInstance', '$scope', 'fromShare', function ($uibModalInstance, $scope, fromShare) {

        $scope.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        };

        $scope.from = fromShare;

        if($scope.from){
            $scope.message = 'An error occurred while sharing the bookmark. Please try again.';
        }else{
            $scope.message = 'An error occurred while saving the bookmark. Please try again.';
        }

    }
]);