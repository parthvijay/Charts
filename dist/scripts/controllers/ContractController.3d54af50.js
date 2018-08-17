'use strict';
angular.module('ciscoExecDashApp').controller('ContractController', [
    '$scope',
    '$rootScope',
    'Contracts', 
    '$uibModalInstance', 
    'ShareDataServ', 
    'OpportunitiesServ',
    '$filter', function ($scope, $rootScope, Contracts, $uibModalInstance, ShareDataServ, opportunitiesServ, $filter) {        

        var vm = this;

        vm.contractSelected = angular.copy(Contracts.selected);
        vm.contracts = angular.copy(Contracts.list);
        vm.contractName = angular.copy(Contracts.contractName);
        vm.name = angular.copy(Contracts.name);

        if(Contracts.showApply === "contractdetails") {
            vm.showApply = true;
        }else{
            vm.showApply = false;
        }
        vm.isAllSelected = vm.contracts.every(function (itm) {
            return itm.select;
        });

        $scope.applyValid = function () {
            if (vm.contractSelected > 0) {
                return true;
            }
            return false;
        };

        vm.toggleAll = function () {
            angular.forEach(vm.contracts, function (contract) {
                contract.select = vm.isAllSelected;
            });
            vm.contractSelected = vm.isAllSelected ? vm.contracts.length : 0;
        };

        vm.optionToggled = function (value) {
            vm.isAllSelected = vm.contracts.every(function (itm) {
                return itm.select;
            });
            value ? ++vm.contractSelected : --vm.contractSelected;
        };

        vm.dismiss = function () {
            $uibModalInstance.dismiss();
        };

        vm.close = function () {
            var selectedContracts = $filter('filter')(vm.contracts, {select: true});
            $uibModalInstance.close({updatedContracts: angular.copy(vm.contracts), noOfContractSelected: angular.copy(vm.contractSelected), selectedContracts: angular.copy(selectedContracts)});

            var contractNos = [];
            angular.forEach(selectedContracts, function (value) {
                contractNos.push(value.contractNumber);
            });
            
            $rootScope.$broadcast('selected-contracts', contractNos);
        };

        
    }
]);

