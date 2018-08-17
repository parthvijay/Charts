'use strict';
angular.module('ciscoExecDashApp').controller('TotalAssetDefinitionController', ['$uibModalInstance', '$scope', '$http', function ($uibModalInstance, $scope, $http) {
	$http.get('config/totalAssetDefinition.json')
		.then(function (d) {
			$scope.assetDefinitionData = d.data;
		})

	$scope.cancel = function () {
		$uibModalInstance.dismiss('cancel');
	}
}
]);