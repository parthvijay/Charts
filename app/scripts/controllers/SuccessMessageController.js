'use strict';
angular.module('ciscoExecDashApp').controller('SuccessMessageController', ['$uibModalInstance', '$scope', 'bookmark', function ($uibModalInstance, $scope, bookmark) {

        $scope.cancel = function () {
        	
            $uibModalInstance.dismiss('cancel');
        };
        $scope.bookmark = bookmark;
    }
]);