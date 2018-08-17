'use strict';
angular.module('ciscoExecDashApp').controller('ClearBookmarkController', ['$uibModalInstance', '$scope','GlobalBookmarkServ', function ($uibModalInstance, $scope,GlobalBookmarkServ) {

        $scope.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        };

		$scope.clearBookmarkPopUp = function(){
		 	GlobalBookmarkServ.clearBookmark('otherTab');
			$uibModalInstance.close();
        };

    }
]);