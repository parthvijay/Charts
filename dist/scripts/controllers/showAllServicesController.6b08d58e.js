'use strict';
angular.module('ciscoExecDashApp').controller('ShowAllServicesController', ['$uibModalInstance', '$scope','Services','SelectedServices',function ($uibModalInstance, $scope, Services,SelectedServices) {

    $scope.services = angular.copy(Services);
    $scope.selectedServices = angular.copy(SelectedServices);
    angular.merge($scope.services,$scope.selectedServices);
    
    $scope.ok = function () {
        $uibModalInstance.dismiss('cancel');
    };
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
    $scope.close = function(){
        $uibModalInstance.close($scope.selectedServices);
    }

    $scope.pushOrPopElement = function(item,key){
        if(item.selected){
            $scope.pushItem(item,key);
        }else{
            $scope.remove(key);
        }
        $scope.select = allSelected($scope.services);
    }

    $scope.remove = function(key) {
        delete $scope.selectedServices[key];
    }

    $scope.pushItem = function(item,key) {
        $scope.selectedServices[key]=angular.copy(item);
    }


    $scope.selectAll = function(){
        $scope.select = !$scope.select;
        angular.forEach($scope.services, function(service) {
            service.selected = $scope.select;
        });
        if($scope.select){
            $scope.selectedServices=angular.copy($scope.services);
        }else{
            $scope.selectedServices ={};
        }

    }

    $scope.select = allSelected($scope.services);
    function allSelected(obj){
        for(var o in obj){
            if(!obj[o].selected){
                return false;
            }
        }
        return true;
    }
}
]);
