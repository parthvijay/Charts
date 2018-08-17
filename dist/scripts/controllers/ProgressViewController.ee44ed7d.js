'use strict';
angular.module('ciscoExecDashApp').controller('ProgressViewController', [
    '$scope',
    '$rootScope',
    '$routeParams',
    '$location',
    '$http',
    'ShareDataServ',
    'OpportunitiesServ',
    'UserServ',
    '$uibModal',
    '$filter',
    '$sessionStorage',
    '$timeout',
    'GlobalBookmarkServ',
    'CiscoUtilities', function ($scope, $rootScope, $routeParams, $location, $http, ShareDataServ, opportunitiesServ, UserServ, $uibModal, $filter, $sessionStorage, $timeout, GlobalBookmarkServ, CiscoUtilities) {

        $scope.user = {};
        $scope.CiscoUtilities = CiscoUtilities;
        $scope.foreCastingError = false;
        $scope.isBookmarkActive = GlobalBookmarkServ.isBookmarkActive;
        $scope.user = UserServ;
        if (UserServ.data.user.userId !== UserServ.admin.userId) {
            if (UserServ.admin.userId === 'dsadovni' || UserServ.admin.userId === 'pavijayv' || UserServ.admin.userId === 'vijatrip') {
                $scope.proxyUser = false;
            } else {
                $scope.proxyUser = true;
            }
        } else {
            $scope.proxyUser = false;
        }
        $scope.accountDetails = ShareDataServ.getAccountDetails();

        $scope.sidebarActiveToggle = function (b) {
            $scope.sidebarAnimated = false;
            $scope.sidebarActive = b;
            if (window.innerWidth >= 1200 || true) {
                $timeout(function () {
                    $scope.sidebarAnimated = true;
                }, 510);
            }
            $rootScope.$emit('selected-count');
        };

        var filtersDetails = ShareDataServ.getFiltersDetails();

        if ($scope.accountDetails.length === 0 || filtersDetails === undefined) {
            filtersDetails = JSON.parse($sessionStorage.get('appliedFilters'));
            $scope.accountDetails = JSON.parse($sessionStorage.get('accountDetails'));
        }

        $rootScope.$emit('filters-on-detail', filtersDetails);
        $scope.currCust = $scope.accountDetails.length - 1;

        $scope.showTotalAndSelected = $routeParams.opportunity;

        if ($scope.showTotalAndSelected === "refresh" || $scope.showTotalAndSelected === "renew") {
            // $scope.listOrNet = $sessionStorage.get('isListOrNetView');
            // if($scope.listOrNet == "net"){
            $scope.listNet = "Net Price";
        } else {
            $scope.listNet = "List Price";
            // } 
        }


        $scope.goBackToRefresh = function () {
            if ($scope.showTotalAndSelected == 'renew') {
                $location.path('sales/analysis/renew/' + $scope.accountDetails[$scope.currCust].subopportunity);
            } else if ($scope.showTotalAndSelected == 'refresh') {
                $location.path('sales/analysis/refresh/' + $scope.accountDetails[$scope.currCust].subopportunity);
            } else if ($scope.showTotalAndSelected == 'attach') {
                $location.path('sales/analysis/attach/' + $scope.accountDetails[$scope.currCust].subopportunity);
            } else if ($scope.showTotalAndSelected == 'drs') {
                $location.path('sales/campaign/drs/');
            }

        }

        $scope.selectedGUmodel = {};

        $scope.sumObjects = function (chg) {
            $scope.metaData = {
                "lineItems": 0,
                "totalOpportunity": 0,
                "inPipeline": 0,
                "availableForPipeline": 0,
                "totalContracts": 0,
                "contractsSelected": 0
            };

            var allGUList = [];

            if ($scope.resetFlag) {
                allGUList = angular.copy($scope.areas1);
            } else {
                allGUList = angular.copy($scope.areas);
            }


            allGUList.forEach(function (d) {
                if ($scope.selectedGUmodel.gu_name === undefined && angular.isDefined($scope.accountDetails[$scope.currCust].guName)) {
                    $scope.selectedGUmodel.gu_name = $scope.accountDetails[$scope.currCust].guName;
                }
                if ($scope.selectedGUmodel.gu_name === "ALL") {
                    if (chg === undefined) {
                        if ($scope.accountDetails[$scope.currCust].guName !== undefined && $scope.accountDetails[$scope.currCust].guName !== "ALL") {
                            $scope.selectedGUmodel.gu_name = $scope.accountDetails[$scope.currCust].guName;
                        }
                    } else {
                        if ($scope.accountDetails[$scope.currCust].hasCancelled) {
                            if ($scope.accountDetails[$scope.currCust].guName === $scope.selectedGUmodel.gu_name) {
                                $scope.accountDetails[$scope.currCust].hasCancelled = false;
                            } else {
                                $scope.areas.forEach(function (g) {
                                    if (g.gu_name === $scope.accountDetails[$scope.currCust].guName) {
                                        $scope.selectedGUmodel = g;
                                    }
                                })
                                $scope.accountDetails[$scope.currCust].hasCancelled = false;
                                return;
                            }

                        }
                    }
                }

                if (d.gu_name === $scope.selectedGUmodel.gu_name) {
                    $scope.metaData.lineItems += d.details.lineItems;
                    $scope.metaData.totalOpportunity += d.details.totalOpportunity;
                    $scope.metaData.inPipeline += d.details.inPipeline;
                    $scope.metaData.availableForPipeline += d.details.availableForPipeline;
                    $scope.metaData.totalContracts += d.details.totalContracts;
                    if (!$scope.resetFlag) {
                        $scope.contractSelected = d.details.totalContracts;
                        $scope.isChecked = false;
                    }
                    $scope.resetFlag = false;
                    $scope.accountDetails[$scope.currCust].guName = d.gu_name;
                }
            });

            $scope.pieData = { "Not In Pipeline": $scope.metaData.availableForPipeline, "In Pipeline": $scope.metaData.inPipeline };
            $scope.accountDetails[$scope.currCust].guID = $scope.selectedGUmodel.gu_id;
            if ($scope.selectedGUmodel.gu_id === undefined) {
                $scope.selectedGUmodel.gu_id = "99999";
                $scope.accountDetails[$scope.currCust].guID = $scope.selectedGUmodel.gu_id;
            }
            $scope.accountDetails[$scope.currCust].totalValue = $scope.metaData.totalOpportunity;
        };


        var salesFilter = [];
        var actManager = [];
        var actName = '';
        var architectureType = [];
        var coverageFilter = "";
        var networkFilter = ""; //To get networkFilter in response of pipeline details.
        var contractList = "";

        angular.forEach(filtersDetails, function (value) {
            if (value.categoryId === "sales") {
                if (value.level === 4) {
                    angular.forEach(value.title, function (title) {
                        salesFilter.push(value.title);
                    })
                }
                if (value.level === 5) {
                    salesFilter = [];
                    angular.forEach(value.title, function (title) {
                        salesFilter.push(title);
                    })
                }
            }
            if (value.categoryId === 2) {
                architectureType.push(value.title);
            }
            if (value.categoryId === "salesAM") {
                if (value.level === 1) {
                    angular.forEach(value.title, function (title) {
                        actManager.push(value.title);
                    })
                }
            }
            if (value.categoryId === "coverage") {
                coverageFilter = value.coverage;
            }
            if (value.categoryId === "network") {
                networkFilter = value.network;
            }
        })
        architectureType = JSON.stringify(architectureType);
        salesFilter = JSON.stringify(salesFilter);
        actManager = JSON.stringify(actManager);

        $scope.contracts = [];
        $scope.contractSelected = 0;
        $scope.selectedContracts = [];

        $rootScope.$on('foreCasting-error', function (data, event) {
            $scope.foreCastingError = true;
        });

        var filtersToBeApplied = $scope.CiscoUtilities.cleansedFilters(filtersDetails["0"]);
        angular.extend(filtersToBeApplied, filtersDetails["1"]);

        $scope.tolContract = function () {
            opportunitiesServ.getTotalContracts($scope.accountDetails[$scope.currCust], filtersToBeApplied, actManager, actName, architectureType, coverageFilter, networkFilter).then(function (d) {
                if ($scope.isChecked === false) {
                    $scope.contracts = d.data;

                    $scope.contracts.forEach(function (c) {
                        c.select = true;
                    });
                }

                $scope.selectedContracts = angular.copy($scope.contracts);
                $scope.contractSelected1 = $scope.contracts.length;
                ShareDataServ.setContracts($scope.contracts, $scope.selectedContracts);

                var modalInstance = $uibModal.open({
                    templateUrl: 'views/modal/total-contract.html',
                    controller: 'ContractController',
                    controllerAs: 'vm',
                    scope: $scope,
                    resolve: {
                        Contracts: function () {
                            return {
                                list: $scope.contracts,
                                selected: $scope.contractSelected,
                                contractName: $scope.contractName
                            };
                        }
                    },
                    windowClass: 'modal-open',
                    size: 'lg'
                });

                modalInstance.result.then(function (result) {
                    $scope.contracts = result.updatedContracts;
                    $scope.contractSelected = result.noOfContractSelected;
                    $scope.selectedContracts = result.selectedContracts;
                    ShareDataServ.setContracts($scope.contracts, $scope.selectedContracts);
                }, function () {
                    //error case
                });
            });
        };

        if ($scope.accountDetails[$scope.currCust].hasCancelled) {
            $scope.accountDetails[$scope.currCust].guID = '99999';
        }

        opportunitiesServ.getCustomerDetails($scope.accountDetails[$scope.currCust], filtersToBeApplied, actManager, actName, architectureType, coverageFilter, contractList, networkFilter).then(function (d) {
            var response = d.data;
            $scope.contractName = d.data[0].name;
            $scope.resetFlag = false;
            $scope.isChecked = false;
            $scope.data = response[0];
            $scope.areas = response[0].areas;
            $scope.sumObjects();

        });

        $rootScope.$on('selected-contracts', function (event, data) {
            filtersDetails.contractNumber = JSON.stringify(data);
            contractList = filtersDetails.contractNumber;
            var len = $scope.accountDetails.length - 1;
            ShareDataServ.setContracts('', data);
            $scope.accountDetails[len].url = "apply";
            opportunitiesServ.getCustomerDetails($scope.accountDetails[len], filtersToBeApplied, actManager, actName, architectureType, coverageFilter, contractList, networkFilter).then(function (d) {
                var response = d.data;
                $scope.resetFlag = true;
                $scope.isChecked = true;
                $scope.data = response[0];
                $scope.areas1 = response[0].areas;
                $scope.sumObjects();
            });
        })
    }

]);