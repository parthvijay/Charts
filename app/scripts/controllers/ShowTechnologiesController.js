'use strict';
angular.module('ciscoExecDashApp').controller('ShowTechnologiesController', ['$uibModalInstance', '$routeParams', '$scope', '$http','Technologies', function ($uibModalInstance, $routeParams, $scope, $http, Technologies) {

        $scope.ok = function () {
            $uibModalInstance.dismiss('cancel');
        };

        $scope.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        };

        $scope.close = function () {
            $uibModalInstance.close();
        };

        $scope.productServicesList = "";
        $scope.productServicesNet = "";


        if ($routeParams.opportunity === 'renew') {
            $scope.productServicesList = "Service List";
            $scope.productServicesNet = "Service Net";
        } else if ($routeParams.opportunity === 'refresh') {
            $scope.productServicesList = "Product List";
            $scope.productServicesNet = "Product Net";
        } else if ($routeParams.opportunity === 'attach') {
            $scope.productServicesList = "Service List";
            $scope.productServicesNet = "Service Net";
        }
       
        $scope.selectedTechnologies = Technologies;
    }
]);