'use strict';
angular.module('ciscoExecDashApp').controller('ShowAllTechnologiesController', ['$uibModalInstance', '$scope','Technologies','$filter','SelectedTechnologies' ,function ($uibModalInstance, $scope, Technologies,$filter,SelectedTechnologies) {

    $scope.technologies = angular.copy(Technologies);
    $scope.selectedTechnologies = angular.copy(SelectedTechnologies);
    angular.merge($scope.technologies,$scope.selectedTechnologies);
    $scope.ok = function () {
        $uibModalInstance.dismiss('cancel');
    };
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
    $scope.close = function(){
        $uibModalInstance.close($scope.selectedTechnologies);
    }
    $scope.checkAnyOptionSelected = function(options) {
        if(options!=null && options.length >= 1) {
            var trues = $filter("filter")(options, {selected: true});
            return trues.length;
        }else{
            return false;
        }
    }

    
    $scope.pushOrPopElement = function(item,key,deepCopy){
        if(item.selected){
            $scope.pushItem(item,key,deepCopy);
        }else{
            $scope.remove(item,key,deepCopy);
        }
        $scope.select = allSelected($scope.technologies);
    }

    $scope.remove = function(item,key,deepCopy) {
        if(deepCopy){
            $scope.technologies[key].selected = false;
            angular.forEach($scope.technologies[key]["options"], function(option) {
                option.selected = false;
            });
            delete $scope.selectedTechnologies[key];
        }else{
            var index = $scope.selectedTechnologies[key]["options"].findIndex(function(x){return x.key==item.key});
            if(index >-1){
                $scope.selectedTechnologies[key]["options"].splice(index, 1);
                if($scope.selectedTechnologies[key]["options"].length === 0){
                    delete $scope.selectedTechnologies[key];
                }
            }
        }
        if($scope.selectedTechnologies[key] == null){
            $scope.technologies[key].selected = false;
        }
    }

    $scope.pushItem = function(item,key,deepCopy) {
        if($scope.selectedTechnologies[key] == null){
            $scope.technologies[key].selected = true;
            $scope.selectedTechnologies[key] ={"selected":true,"options":[]};
        }
        if(deepCopy){
            $scope.technologies[key].selected = true;
            angular.forEach($scope.technologies[key]["options"], function(option) {
                option.selected = true;
            });
            $scope.selectedTechnologies[key]=angular.copy(item);
        }else{
            $scope.selectedTechnologies[key]["options"].push(angular.copy(item));
        }

    }

    $scope.expandAll = function(){
        $scope.expand = !$scope.expand;
        angular.forEach($scope.technologies, function(technology) {
            technology.showTechnologyOptions = $scope.expand;
        });
    }
    $scope.selectAll = function(){
        $scope.select = !$scope.select;
        angular.forEach($scope.technologies, function(technology) {
            technology.selected = $scope.select;
            angular.forEach(technology.options,function(option){
                option.selected = $scope.select;
            })
        });
        if($scope.select){
            $scope.selectedTechnologies=angular.copy($scope.technologies);
        }else{
            $scope.selectedTechnologies ={};
        }

    }

    $scope.select = allSelected($scope.technologies);
    function allSelected(obj){
        for(var o in obj){
            if(!obj[o].selected){
                return false;
            }
        }
        return true;
    }

    $scope.expand = allExpand($scope.technologies);
    $scope.setExpandBool = function(val){
        val.showTechnologyOptions=!val.showTechnologyOptions
        $scope.expand = allExpand($scope.technologies);
    }
    function allExpand(obj){
        for(var o in obj){
            if(!obj[o].selected){
                return false;
            }
        }
        return true;
    }



}
]);