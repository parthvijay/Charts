'use strict';
angular.module('ciscoExecDashApp').controller('ConvertOpportunityStepTwoController', ['$scope', '$http','$rootScope', 'ShareDataServ','$filter','SfdcServ', 'OpportunitiesServ', '$uibModal', '$sessionStorage', 'CiscoUtilities', function ($scope, $http, $rootScope, ShareDataServ, $filter, SfdcServ, OpportunitiesServ, $uibModal, $sessionStorage, CiscoUtilities) {

        $scope.CiscoUtilities = CiscoUtilities; 
        var cuurencyCode = "";
        if (!$scope.newOpurtunity.ExpectedProductValue) {
            $scope.newOpurtunity.ExpectedProductValue = 0;
        }

        if (!$scope.newOpurtunity.ExpectedServiceValue) {
            $scope.newOpurtunity.ExpectedServiceValue = 0;
        }
        $scope.serviceList = [];
        $scope.techList = [];

        var getTechnologyforIbData = function() {
            var accountDetails = ShareDataServ.getAccountDetails();
            var filtersDetails = ShareDataServ.getFiltersDetails();
            $scope.filters = JSON.parse($sessionStorage.get('filters'));
            $scope.accounts = JSON.parse($sessionStorage.get('accounts'));
            var currDetail = accountDetails.length - 1;
            var salesFilter = [];
            var actManager = [];
            var architectureType = [];
            var coverageFilter = "";
            var networkFilter = "";
            var filtersToBeApplied = $scope.CiscoUtilities.cleansedFilters($scope.filters, $scope.accounts);

            angular.forEach(filtersDetails, function(value) {
                if (value.categoryId === "sales") {
                    if (value.level === 4) {
                        angular.forEach(value.title,function(title){
                            salesFilter.push(value.title);
                        })
                    }
                    if (value.level === 5) {
                        salesFilter = [];
                        angular.forEach(value.title,function(title){
                            salesFilter.push(title);
                        })
                    }
                }
                if (value.categoryId === 2) {
                    architectureType.push(value.title);
                }
                if (value.categoryId === "salesAM") {
                    if (value.level === 1) {
                       angular.forEach(value.title,function(title){
                            actManager.push(value.title);
                        })
                    }

                }
                if (value.categoryId === "coverage") {
                    coverageFilter = value.coverage;
                }
                if(value.categoryId === "network"){
                    networkFilter = value.network;
                }
            })
            architectureType = JSON.stringify(architectureType);


            OpportunitiesServ.getTechnologyForIb(accountDetails[currDetail], filtersToBeApplied, actManager, architectureType, coverageFilter, networkFilter).then(function(d) {
                $scope.technologiesdetails = d.technologyDetails;
                $uibModal.open({
                    templateUrl: 'views/modal/tech-list.html',
                    windowClass: 'modal-open',
                    controller: 'ShowTechnologiesController',
                    scope: $scope,
                    resolve: {
                        Technologies: function() {
                            return $scope.technologiesdetails;
                        }
                    },
                    size: 'sm'
                });


            })

        }
            var accountDetails = ShareDataServ.getAccountDetails();
            var filtersDetails = ShareDataServ.getFiltersDetails(); 
            var currDetail = accountDetails.length - 1;
            cuurencyCode = accountDetails[currDetail].oppCreationData.terrCurrencyCode;
            
                 SfdcServ.getProductsandServicesData(cuurencyCode).then(function(response) {
              
                var tech = response.data.technology;
                var serv = response.data.service;

                var technologies = {};
                tech.forEach(function(t) {
                    var options = [];
                    technologies[t.name] = {};
                    technologies[t.name].id = t.id;
                    technologies[t.name].value = 0;
                    t.productFamily.forEach(function(u) {
                        options.push({ "key": u });
                    });
                    technologies[t.name].options = options;
                });

            var services = {};

            var serviceCategory = {};
            var category = [];
            serv.serviceCategories.forEach(function(s) {
                category.push(s);
                $scope.serviceCategory = category;
            });

            serv.serviceList.forEach(function(t) {
                var options = [];
                services[t.name] = {};
                services[t.name].value = 0;
                services[t.name].id = t.id;
                t.serviceLevel.forEach(function(u) {
                    options.push(u);
                });
                services[t.name].serviceLevelArray = options;
                services[t.name].serviceCategoryArray = $scope.serviceCategory;
            });
            $scope.services = services;
            $scope.technologies = technologies;
            var prodFamily = [];
            angular.forEach($scope.technologies, function (value, key) {
                
                angular.forEach(value.options, function (v) {
                    prodFamily.push({'name': key, 'productFamily': v.key, 'businessProdFamily': key + ': ' + v.key});
                });
            });

            $scope.techList = prodFamily;

                for (var key in $scope.services) {
                     $scope.serviceList.push({'name': key});
                }

            })

        $scope.showAll = function() {
          
            var modalInstance = $uibModal.open({
                templateUrl: 'views/modal/all-tech-list.html',
                windowClass: 'modal-open',
                controller: 'ShowAllTechnologiesController',
                scope: $scope,
                resolve: {
                    Technologies: function() {
                        return $scope.technologies;
                    },
                    SelectedTechnologies: function() {
                        return $scope.newOpurtunity.selectedTechnologies;
                    }
                },
                size: 'sm'
            });

            modalInstance.result.then(function(result) {
                $scope.close = true;
                $scope.newOpurtunity.selectedTechnologies = result;
                var i = 0;
                angular.forEach($scope.newOpurtunity.selectedTechnologies, function (value, key) {
                    if (!(value.value >= 1 && value.value <= 99)) {
                        value.value = i == 0 ? 100 : 0;
                    }
                    i++;
                });
            }, function() {
                //error case
            });
        };

    
        $scope.showAllServices = function() {

            var modalInstance = $uibModal.open({
                templateUrl: 'views/modal/all-service-list.html',
                windowClass: 'modal-open',
                controller: 'ShowAllServicesController',
                scope: $scope,
                resolve: {
                    Services: function() {
                        return $scope.services;
                    },
                    SelectedServices: function() {
                        return $scope.newOpurtunity.selectedServices;
                    }
                },
                size: 'sm'
            });
            modalInstance.result.then(function(result) {
                $scope.close = true;    
                $scope.newOpurtunity.selectedServices = result;
                var i = 0;
                angular.forEach($scope.newOpurtunity.selectedServices, function (value, key) {
                    value.value = i == 0 ? 100 : 0;
                    i++;
                });
            }, function() {
                //error case
            });
        };

         $scope.showTech = function() {
            getTechnologyforIbData();
        };
        $scope.isTechValid = function () {
            if (!$scope.newOpurtunity.ExpectedProductValue || parseInt($scope.newOpurtunity.ExpectedProductValue) <= 0) {
                return true;
            }
            var total_1 = $filter('sumByKey')($scope.newOpurtunity.selectedTechnologies, 'value');
            if ((total_1 && total_1 === 100) || !Object.keys($scope.newOpurtunity.selectedTechnologies).length) {
                return true;
            }
            return false;
        };

        $scope.isTechRowsValid = function () {
            if (!$scope.newOpurtunity.ExpectedProductValue || parseInt($scope.newOpurtunity.ExpectedProductValue) <= 0) {
                return true;
            }
            if (Object.keys($scope.newOpurtunity.selectedTechnologies).length) {
                return true;
            }
            return false;
        };
        $scope.isServValid = function () {
            if (!$scope.newOpurtunity.ExpectedServiceValue || parseInt($scope.newOpurtunity.ExpectedServiceValue) <= 0) {
                return true;
            }
            var total_2 = $filter('sumByKey')($scope.newOpurtunity.selectedServices, 'value');
            if ((total_2 && total_2 === 100) || !Object.keys($scope.newOpurtunity.selectedServices).length) {
                return true;
            }
            return false;
        };
        $scope.isServRowsValid = function () {
            if (!$scope.newOpurtunity.ExpectedServiceValue || parseInt($scope.newOpurtunity.ExpectedServiceValue) <= 0) {
                return true;
            }
            if (Object.keys($scope.newOpurtunity.selectedServices).length) {
                return true;
            }
            return false;
        };

        $scope.isServDropdownValid = function () {
            var valid = true;
            angular.forEach($scope.newOpurtunity.selectedServices, function (a, b) {
                if (!a.serviceLevelSelected || !a.serviceCategorySelected) {
                    valid = false;
                    return;
                }
            });
            return valid;
        };

        $scope.isTechAllocationValid = function () {
            if ((!$scope.newOpurtunity.ExpectedProductValue || parseInt($scope.newOpurtunity.ExpectedProductValue) <= 0) && Object.keys($scope.newOpurtunity.selectedTechnologies).length) {
                return false;
            }
            return true;
        };

        $scope.isServAllocationValid = function () {
            if ((!$scope.newOpurtunity.ExpectedServiceValue || parseInt($scope.newOpurtunity.ExpectedServiceValue) <= 0) && Object.keys($scope.newOpurtunity.selectedServices).length) {
                return false;
            }
            return true;
        };

        $scope.isValuesValid = function () {
            if ((!$scope.newOpurtunity.ExpectedProductValue || parseInt($scope.newOpurtunity.ExpectedProductValue) >= 0) && (!$scope.newOpurtunity.ExpectedServiceValue || parseInt($scope.newOpurtunity.ExpectedServiceValue) >= 0) && (parseInt($scope.newOpurtunity.ExpectedProductValue) > 0 || parseInt($scope.newOpurtunity.ExpectedServiceValue) > 0)) {
                return true;
            }
            return false;
        };

        $scope.incrementVal = function (val) {
            var c = parseInt(val.value);
            var reg = new RegExp('^[0-9]*$');
            c += 1;
            if (!reg.test(val.value) || isNaN(c)) {
                c = 0;
            }
            val.value = angular.copy(c);
        };

        $scope.decrementVal = function (val) {
            var c = parseInt(val.value);
            var reg = new RegExp('^[0-9]*$');
            c -= 1;
            if (!reg.test(val.value) || isNaN(c) || c < 0) {
                c = 0;
            }
            val.value = angular.copy(c);
        };

        $scope.validateNumber = function (val) {
            var c = parseInt(val.value);
            var reg = new RegExp('^[0-9]*$');
            if (!reg.test(val.value) || isNaN(c) || c < 0) {
                val.value = 0;
            }
        };

//        var formatNumber = function (num) {
//            return num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,")
//        };

        $scope.validateExp = function (d) {
            var c = $scope.newOpurtunity[d];
            var plainNumber = c.toString().replace(/[^\d|\-+|\.+]/g, '');
            if (plainNumber.length > 15) {
                plainNumber = plainNumber.substring(0, 15);
            }
            $scope.newOpurtunity[d] = $filter('number')(plainNumber);
        };
        $scope.bIsOneTechSelected=$scope.checkAllBoxes=false;
        $scope.bIsOneServiceSelected=$scope.serviceSelected=false;

          $scope.checkAll = function(b,k){            
        angular.forEach(k,function (item) {
                    item.boxes = b;
                 })};
        
        $scope.checkParent = function (a,allFlag) {
            var s = false;
            
            var checked =0;
             angular.forEach(a,function (obj) {
                if(obj.boxes)
                    checked++;
            });
              if(Object.keys(a).length==checked){
                    s=true;
              }else{
                s=false;
              }

              if(allFlag=='technology'){
                $scope.checkAllBoxes=s;
              }else if(allFlag=='service'){
                 $scope.serviceSelected=s;
              }
        };

        $scope.isDeleteEnabled = function(a){
         var selected = false;
            angular.forEach(a,function(b){
                if(b.boxes){
                    selected = true;
                    return;
                }              
            });
             return selected;
      };

        $scope.deleteTechnology = function(){ 
            angular.forEach($scope.newOpurtunity.selectedTechnologies,function(row, key){
                if(row.boxes){
            delete $scope.newOpurtunity.selectedTechnologies[key];
            key = key.split(":")[0]; // Changes for showing the options of same key seperately - Sindhu
                    $scope.technologies[key].selected = false;
                    $scope.technologies[key].options = $scope.technologies[key].options.filter
                            (function (object)
                            {
                                object.selected = false;
                                return object;
                            });
                }
        });
            $scope.checkAllBoxes = false;
      };    
      $scope.deleteService = function(){ 
            angular.forEach($scope.newOpurtunity.selectedServices,function(row, key){
                if(row.boxes){
            delete $scope.newOpurtunity.selectedServices[key];
                }
        });
            $scope.serviceSelected = false;
      };
        $scope.getAllocationValue = function (c, d) {
            var plainNumber = c.toString().replace(/[^\d|\-+|\.+]/g, '');
            var n = parseInt(plainNumber) * (0.01 * d);
            return $filter('currency')(n);
        };
        $scope.onServiceSelect = function () {
            var selected = $scope.searchService;
            var c = $scope.services;
            for (var key in c) {
                if (key === selected.name && !$scope.newOpurtunity.selectedServices[key]) {
                    $scope.newOpurtunity.selectedServices[key] = angular.copy(c[key]);
                    $scope.newOpurtunity.selectedServices[key].selected = true;
                }
            }

            if (Object.keys($scope.newOpurtunity.selectedServices).length == 1) {
                angular.forEach($scope.newOpurtunity.selectedServices, function (value, key) {
                    value.value = 0;
                });
            }

            //$scope.searchService = '';
        };

        $scope.onTechSelect = function () {
            var selected = $scope.searchTech;
            var c = $scope.technologies;
            for (var key in c) {
                if (key === selected.name) {
                    if (!selected.productFamily) {
                        c[key].selected = true;
                        angular.forEach(c[key]["options"], function (option) {
                            option.selected = true;
                        });
                        $scope.newOpurtunity.selectedTechnologies[selected.businessProdFamily] = angular.copy(c[key]);
                    } else { // Changes for showing the options of same key seperately - Sindhu
                        if (!$scope.newOpurtunity.selectedTechnologies[selected.businessProdFamily]) {
                            $scope.newOpurtunity.selectedTechnologies[selected.businessProdFamily] = angular.copy(c[key]);
                            $scope.newOpurtunity.selectedTechnologies[selected.businessProdFamily].options = [];
                        }
                        // Changes for showing the options of same key seperately - Sindhu
                        var f = $filter('filter')($scope.newOpurtunity.selectedTechnologies[selected.businessProdFamily].options, {key: selected.productFamily});
                        if (!f.length) {
                            // Changes for showing the options of same key seperately - Sindhu
                            $scope.newOpurtunity.selectedTechnologies[selected.businessProdFamily].options.push({"key": selected.productFamily, "selected": true});
                            angular.forEach(c[key]["options"], function (option) {
                                if (option.key == selected.productFamily) {
                                    option.selected = true;
                                }
                            });
                        }
                        var selected_pf = $filter('filter')($scope.techList, {name: selected.name});
                        // Changes for showing the options of same key seperately - Sindhu
                        if ($scope.newOpurtunity.selectedTechnologies[selected.businessProdFamily].options.length === selected_pf.length - 1) {
                            c[key].selected = true;
                        }
                    }
                }
            }

            if (Object.keys($scope.newOpurtunity.selectedTechnologies).length == 1) {
                angular.forEach($scope.newOpurtunity.selectedTechnologies, function (value, key) {
                    value.value = 0;
                });
            }

            //$scope.searchTech = '';
        };
        $scope.showTechSearchFocusBar = function () {
            if ( $scope.newOpurtunity.ExpectedProductValue != 0 && !Object.keys($scope.newOpurtunity.selectedTechnologies).length) {
                return true;
            }
            return false;
        };

        $scope.showServiceSearchFocusBar = function () {
            if ( $scope.newOpurtunity.ExpectedServiceValue != 0 && !Object.keys($scope.newOpurtunity.selectedServices).length) {
                return true;
            }
            return false;
        };
    }
]);