'use strict';
angular.module('ciscoExecDashApp').controller('SubscriptionDefinitionController', ['$uibModalInstance', '$scope', '$http', 
function ($uibModalInstance, $scope, $http) {
	$scope.cancel = function () {
		$uibModalInstance.dismiss('cancel');
	}
}
]);