'use strict';
angular.module('ciscoExecDashApp').controller('MainController', [
    '$scope',
    '$location',
    '$uibModal',
    '$window',
    '$rootScope',
    'isMobile',
    '$cookies',
    '$cookieStore',
    '$interval',
    '$sessionStorage',
    '$routeParams',
    'ShareDataServ',
    'OpportunitiesServ',
    'CollaborationRefreshServ',
    '$filter',
    'SfdcServ',
    '$q',
    'GlobalBookmarkServ',
    'BookMarkData',
    'CiscoUtilities',
    'UserServ',
    'ConfigServ',
    function($scope, $location, $uibModal, $window, $rootScope, isMobile, $cookies, $cookieStore, $interval, $sessionStorage, $routeParams, ShareDataServ, opportunitiesServ, CollaborationRefreshServ,$filter, SfdcServ, $q, GlobalBookmarkServ, BookMarkData, CiscoUtilities, UserServ, ConfigServ) {

        $scope.CiscoUtilities = CiscoUtilities;
        $scope.UserServ = UserServ;
        var w = angular.element($window);
        w.bind('resize', function() {
            $scope.postNewHeight();
        });
         
        //dynamic setting of link in UI link for q&c

        if(ConfigServ.env === 4){
            $scope.qandcLink = "https://rewardstg.cloudapps.cisco.com/qualifications/app/";
            $scope.exploreLink = "https://rewardstg.cloudapps.cisco.com/explore/app/";
        }
        else if(ConfigServ.env === 5){
            $scope.qandcLink = "https://rewarddash.cloudapps.cisco.com/qualifications/app/";
            $scope.exploreLink = "https://rewarddash.cloudapps.cisco.com/explore/app/"
        }

        $scope.mainWrapper = document.getElementById('wrapper');
        $scope.$watch('mainWrapper.offsetHeight', function(newVal, oldVal) {
            $scope.postNewHeight();
        }, true)

        $scope.$on('onBeforeUnload', function (e, confirmation) {
            $scope.resetFilters();
            //confirmation.message = "All data willl be lost.";
            e.preventDefault();
        });

        $scope.$on('onUnload', function (e) {
            console.log('leaving page'); // Use 'Preserve Log' option in Console
        });

        $scope.postNewHeight = function() {
            if ($scope.mainWrapper !== null) {

                if (parent.postMessage) {
                    var clientHeight = $scope.mainWrapper.offsetHeight;
                    if ($scope.mainWrapper.offsetHeight < 400) {
                        clientHeight = clientHeight + 20;
                    }
                    parent.postMessage(clientHeight, "*");
                }
            }
        }
         var path = $location.$$path;
        //if((path.indexOf("sales") !== -1)){
        $scope.navCollapsed = true;


        if(($routeParams.opportunity !== "tsRenew") || ($routeParams.opportunity !== "tsAttach")){
                BookMarkData.setCurrentBookmark(null);
                $rootScope.newBookmarkCount = 0;
                $scope.isGlobalOpen = true;

                $scope.selectBookmark = GlobalBookmarkServ.selectBookmark;

                //calling fav bookamarks
                $scope.GlobalBookmarkServ = GlobalBookmarkServ;
        }

        $rootScope.bHideFilterStrip = true;
        $rootScope.steps = {};

        $scope.getAccounts = function(){
            var accountDetails = ShareDataServ.getAccountDetails();
            var currDetail = accountDetails.length - 1;
              SfdcServ.getAccountsData(accountDetails[currDetail]).then(function(d) {
                if(d.errorCode && d.errorCode !== "ERR-599"){
                    $uibModal.open({
                        templateUrl: 'views/modal/technical-warning.html',
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
                }
                else if(d.errorCode === "ERR-599"){
                    var foreCastingError =  true;
                    $rootScope.$broadcast('foreCasting-error',foreCastingError);
                }
                else{
                    // Parth Code for generating RefId
                    var uiToRestFilters = [];
                    var advancedFilters = JSON.parse($sessionStorage.get('advancedFilters'));
                    var appliedFilters = JSON.parse($sessionStorage.get('appliedFilters'));
                    uiToRestFilters.push(advancedFilters, appliedFilters["0"]);
                    uiToRestFilters =  JSON.stringify(uiToRestFilters);
                    
                    var accountDetails = ShareDataServ.getAccountDetails();
                    var filtersDetails = ShareDataServ.getFiltersDetails();

                    $scope.filters = JSON.parse($sessionStorage.get('filters'));
                    $scope.accounts = JSON.parse($sessionStorage.get('accounts'));
                    var filtersToBeApplied = $scope.CiscoUtilities.cleansedFilters($scope.filters, $scope.accounts);

                    var salesFilter = [];
                    var actManager = [];
                    var architectureType = [];
                    var coverageFilter = "";
                    var networkFilter = "";

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
                    });
                    architectureType = JSON.stringify(architectureType);
                    actManager = JSON.stringify(actManager);
                    var currDetail = accountDetails.length - 1;
                    window.localStorage.setItem('totalVal', accountDetails[currDetail].totalValue);

                    opportunitiesServ.getRefId(accountDetails[currDetail], filtersToBeApplied, actManager, architectureType, coverageFilter, networkFilter, uiToRestFilters).then(function (d) {
                        window.open(window.location.origin + "/qualifications/app/#/create-pipeline/one/" + $routeParams.opportunity + "/" + accountDetails[currDetail].subopportunity + "/" + d.data.refId, '_self');
                        return;
                    });
                    
                    // Ketan's code to go to step one...

                    // $sessionStorage.put('sfdcAccounts', JSON.stringify(d));
                    // if ($routeParams.opportunity === 'renew') {
                    //     $location.path('view-oppor-step1/renew');
                    // } else if ($routeParams.opportunity === 'refresh') {
                    //     $location.path('view-oppor-step1/refresh');
                    // } else if ($routeParams.opportunity === 'attach') {
                    //     $location.path('view-oppor-step1/attach');
                    // } else if ($routeParams.opportunity === 'drs') {
                    //     $location.path('view-oppor-step1/drs');
                    // }
                }
            });
        }

        $scope.removeProxyUser = function() {
            $scope.resetFilters();
            UserServ.data = undefined;
            UserServ.proxyUser = false;
            window.localStorage.removeItem('proxy');
            window.localStorage.removeItem('proxy-admin');
            if ($scope.GlobalBookmarkServ.isBookmarkActive()) {
                $scope.GlobalBookmarkServ.clearBookmark();
            }
            if (window.location.hash === "#/sales/analysis/asset") {
                window.location.reload();
            }
        }

        $scope.resetFilters = function () {
            var i = sessionStorage.length;
            while(i--) {
                var key = sessionStorage.key(i);
                sessionStorage.removeItem(key);
            }
        }

        var createOpportunity = function(){
            var deferred = $q.defer();
            var contractNos = []
            var accountDetails = ShareDataServ.getAccountDetails();
            var filtersDetails = ShareDataServ.getFiltersDetails();

            $scope.filters = JSON.parse($sessionStorage.get('filters'));
            $scope.accounts = JSON.parse($sessionStorage.get('accounts'));

            var contractDetails = ShareDataServ.getContracts();
            angular.forEach(contractDetails.selectedContracts, function (value) {
                contractNos.push(value.contractNumber);
            });
            var contractNoList = JSON.stringify(contractNos);
            var currDetail = accountDetails.length - 1;
            var oppCreationData = accountDetails[currDetail].oppCreationData;


            var salesFilter = [];
            var actManager = [];
            var architectureType = [];
            var coverageFilter = "";
            var networkFilter = "";
            if ($routeParams.opportunity === 'renew') {
                oppCreationData.optyInstallBase = "Service Renew";
                oppCreationData.serviceSource = "Renewal"
            } else if ($routeParams.opportunity === 'refresh') {
                oppCreationData.optyInstallBase = "Cisco Refresh - Digital Ready";
                oppCreationData.serviceSource = "New";
            } else if ($routeParams.opportunity === 'attach') {
                oppCreationData.optyInstallBase = "Service Attach";
                oppCreationData.serviceSource = "New";
            } else if ($routeParams.opportunity === 'drs') {
                oppCreationData.optyInstallBase = "Cisco Refresh - Digital Ready";
                oppCreationData.serviceSource = "New";
            }

            angular.forEach(filtersDetails, function(value) {
            if (value.categoryId === "sales") {
                if (value.level === 4) {
                    angular.forEach(value.title,function(title){
                        salesFilter.push(value.title);
                    })
                }
                if (value.level === 5) {
                   angular.forEach(value.title,function(title){
                        salesFilter.push(value.title);
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
        salesFilter = JSON.stringify(salesFilter);
        actManager = JSON.stringify(actManager);
            var filtersToBeApplied = $scope.CiscoUtilities.cleansedFilters($scope.filters, $scope.accounts);
            opportunitiesServ.createOpportunity(oppCreationData, accountDetails[currDetail] , filtersToBeApplied, actManager, architectureType, coverageFilter,contractNoList).then(function(response){
                if(response.errorCode && response.errorCode !== "200"){
                   if ($routeParams.opportunity == 'renew') {
                    $location.path('error-create/renew');
                } else if ($routeParams.opportunity == 'refresh') {
                    $location.path('error-create/refresh');
                } else if ($routeParams.opportunity == 'attach') {
                    $location.path('error-create/attach');
                }else if ($routeParams.opportunity == 'drs') {
                    $location.path('error-create/drs');
                }

                }else{
                    accountDetails[currDetail].oppCreationData.sfdcRefId = response.sfdcRefId;
                    if ($routeParams.opportunity == 'renew') {
                        $location.path('create-pipeline/renew');
                    } else if ($routeParams.opportunity == 'refresh') {
                        $location.path('create-pipeline/refresh');
                    } else if ($routeParams.opportunity == 'attach') {
                        $location.path('create-pipeline/attach');
                    }else if ($routeParams.opportunity == 'drs') {
                        $location.path('create-pipeline/drs');
                    }
                }
            })
        }
        


        var getContractList = function() {
            var accountDetails = ShareDataServ.getAccountDetails();
            var filtersDetails = ShareDataServ.getFiltersDetails();
            var currDetail = accountDetails.length - 1;

            var salesFilter = "";
            var actManager = "";
            var architectureType = [];
            var coverageFilter = "";

            angular.forEach(filtersDetails, function(value) {
                if (value.categoryId === 1) {
                    if (value.level === 5) {
                        salesFilter = value.title;
                    }
                    if (value.level === 6) {
                        salesFilter = value.title;
                    }
                }
                if (value.categoryId === 2) {
                    architectureType.push(value.title);
                }
                if (value.categoryId === 3) {
                    actManager = value.title;
                }
                if (value.categoryId === 4) {
                    coverageFilter = value.title;
                }
            })
            architectureType = JSON.stringify(architectureType);


            opportunitiesServ.getTotalContracts(accountDetails[currDetail], salesFilter, actManager, architectureType, coverageFilter).then(function(d) {
                $scope.contracts = d.data;

                var modalInstance = $uibModal.open({
                    templateUrl: 'views/modal/total-contract.html',
                    controller: 'ContractController',
                    controllerAs: 'vm',
                    scope: $scope,
                    resolve: {
                        Contracts: function() {
                            return {
                                list: $scope.contracts,
                                selected: $scope.contractSelected
                            };
                        }
                    },
                    windowClass: 'modal-open',
                    size: 'lg'
                });

                modalInstance.result.then(function(result) {
                    $scope.contracts = result.updatedContracts;
                    $scope.contractSelected = result.noOfContractSelected;
                    $scope.selectedContracts = result.selectedContracts;
                    ShareDataServ.setContracts($scope.contracts, $scope.selectedContracts);
                }, function() {
                    //error case
                });
            })
        }


 	$scope.isValidByDate = function (bookmark) {
            var todaysDate = new Date();
            if (new Date(bookmark.startDate) <= todaysDate && (bookmark.endDate === null || new Date(bookmark.endDate) >= todaysDate))
                return false;
            return true;
        };

        if (!isMobile) {
            $scope.tooltipTrigger = 'mouseenter';
            document.documentElement.className += "no-touch";
        } else {
            $scope.tooltipTrigger = 'none';
            document.documentElement.className += "touch";
        }

        $scope.alerts = [];

        var hidePopover = function() {
            var popups = document.querySelectorAll('.popover');
            if (popups) {
                for (var i = 0; i < popups.length; i++) {
                    var popup = popups[i];
                    var popupElement = angular.element(popup);
                    if (popupElement.scope() !== undefined) {
                        popupElement.scope().$parent.isOpen = false;
                        popupElement.scope().$parent.$apply();
                    }
                }
            }
        };


        $scope.logout = function() {
            $scope.resetFilters();
            $cookies.remove("ObSSOCookie", { domain: '.cisco.com' });
            $cookies.put('anchorValue','') ;
            window.localStorage.removeItem('proxy');
            window.localStorage.removeItem('proxy-admin');
            //$location.url('/');
            $window.location.reload();

        }

        $scope.isPath = function(p) {
            return p === $location.path();
        };

        $scope.viewPath = function(p) {
            $location.path(p);
        };

        $scope.viewLink = function (p) {
            var win = window.open(p, '_blank');
            win.focus();
        };

        $scope.getFirstKey = function (a) {
            return Object.keys(a)[0];
        };

        $scope.publish = function() {
            $uibModal.open({
                templateUrl: 'html/modal/publish.html',
                windowClass: 'modal-open publish'
            });
        };

        $scope.goBackToRefresh = function() {
            var accountDetails = ShareDataServ.getAccountDetails();
            var currDetail = accountDetails.length - 1;
            if ($routeParams.opportunity == 'renew') {
                $location.path('sales/analysis/renew/' + accountDetails[currDetail].subopportunity);
            } else if ($routeParams.opportunity == 'refresh') {
                $location.path('sales/analysis/refresh/' + accountDetails[currDetail].subopportunity);
            } else if ($routeParams.opportunity == 'attach') {
                $location.path('sales/analysis/attach/' + accountDetails[currDetail].subopportunity);
            }else if ($routeParams.opportunity == 'drs') {
                $location.path('sales/campaign/drs/');
            }
        }

        $scope.isComingFromRenew = function() {
            return $routeParams.opportunity;
        }

        $scope.newOpurtunity = {};

        $scope.createPipeline = function(val) {
            var accountDetails = ShareDataServ.getAccountDetails();
            var currDetail = accountDetails.length - 1;

            // localStorage.getItem('fromtab') ? localStorage.getItem('fromtab') : localStorage.setItem('fromtab', val);
            // if(localStorage.getItem('fromtab') && (localStorage.getItem('fromtab') !== val)){
            //     $scope.steps = {};
            //     localStorage.setItem('fromtab', val);
            // }

            $rootScope.steps.formFirstStep = {};
            $scope.newOpurtunity.selectedServices = {};
            $scope.newOpurtunity.selectedTechnologies = {};

            $scope.newOpurtunity.ExpectedServiceValue = 0;
            $scope.newOpurtunity.ExpectedProductValue = 0;
            $scope.newOpurtunity.installBaseType = "";

            if ($scope.isComingFromRenew() === 'renew' || $scope.isComingFromRenew() === 'attach') {

                $scope.newOpurtunity.ExpectedServiceValue = accountDetails[currDetail].totalValue;
                $scope.newOpurtunity.ExpectedServiceValue  = Math.round($scope.newOpurtunity.ExpectedServiceValue / 1000);
                if($scope.isComingFromRenew() === 'renew'){
                   $scope.newOpurtunity.installBaseType = "Service Renew";
                }
                if($scope.isComingFromRenew() === 'attach'){
                     $scope.newOpurtunity.installBaseType = "Service Attach";
                }
            } else if ($scope.isComingFromRenew() === 'refresh') {
                 $scope.newOpurtunity.installBaseType = "Product Refresh";
               $scope.newOpurtunity.ExpectedProductValue = accountDetails[currDetail].totalValue;
                $scope.newOpurtunity.ExpectedProductValue  = Math.round($scope.newOpurtunity.ExpectedProductValue / 1000);
            }

            else if ($scope.isComingFromRenew() === 'drs') {
                 $scope.newOpurtunity.installBaseType = "Product Refresh";
               $scope.newOpurtunity.ExpectedProductValue = accountDetails[currDetail].totalValue;
                $scope.newOpurtunity.ExpectedProductValue  = Math.round($scope.newOpurtunity.ExpectedProductValue / 1000);
            }
            //     $scope.newOpurtunity.ExpectedProductValue = '40000000000';`
            // }

            // $scope.newOpurtunity.selectedTechnologies = {'COLLABORATION-Conferencing': {
            //         "value": 100, "selected": true, "options": [{"key": "Cisco Toll Audio Plus", selected: true}, {"key": "Jabber", selected: true}, {"key": "Named Host", selected: true}
            //             , {"key": "WebEx Cloud Connected Audio", selected: true}, {"key": "WebEx Meeting Center", selected: true}, {"key": "WebEx on Cisco Price List", selected: true}, {"key": "WebEx on WebEx Price List", selected: true}]
            //     }};
            // $scope.newOpurtunity.selectedServices = {'AS-S-Cisco Assessment Svcs': {"value": 100, "selected": true, "serviceLevel": "Collaboration", "serviceCategory": "AS-F-Advanced Services"}};
            // $scope.changeLocation('view-oppor-step1', val)
            $scope.getAccounts();
        }


        $scope.getFilteredTech = function() {
            return $filter('filter')($scope.newOpurtunity.selectedTechnologies, { searchTechnologies: $scope.searchString });
        };

        $scope.searchString = '';
        $scope.serviceSearchString = '';

        $scope.getObjLength = function(type) {
            if (type == 'technology') {
                var a = $filter('searchTechnologies')($scope.newOpurtunity.selectedTechnologies, $scope.searchString);
            } else {
                var a = $filter('searchTechnologies')($scope.newOpurtunity.selectedServices, $scope.serviceSearchString);
            }

            if (!a) {
                return 0;
            }
            return Object.keys(a).length;
        };

        $rootScope.disclaimer = false;
        
        $scope.changeLocation = function(link, a, s) {
            var accountDetails = ShareDataServ.getAccountDetails();
            var len = accountDetails.length-1;
            accountDetails[len].hasCancelled = true;
            if (link === "view-oppor-step1") {
                getAccounts().then(function () {});
            }
            else if (link === "/create-pipeline"){
                createOpportunity().then( function(response){})
            }
            else if ($routeParams.opportunity === 'renew') {
                $location.path(link + '/renew');
            } else if ($routeParams.opportunity === 'refresh') {
                $location.path(link + '/refresh');
            } else if ($routeParams.opportunity === 'attach') {
                $location.path(link + '/attach');
            }else if ($routeParams.opportunity === 'drs') {
                $location.path(link + '/drs');
            }
            else if (s === 'complete') {
                $rootScope.disclaimer = true;
            }
        }

      $scope.newOpurtunity = {};

        $scope.goBackToProgress = function() {
            if ($routeParams.opportunity == 'renew') {
                $location.path('sales/analysis/renew/total');
            } else {
                $location.path('sales/analysis/refresh/ship');
            }
        }


         $scope.newOpurtunity.selectedTechnologies = {};


          $scope.newOpurtunity.selectedServices = {};





        $scope.showTech = function() {
            getTechnologyforIbData();
        };
        $scope.scrolled = false;
        angular.element($window).bind("scroll", function() {
            hidePopover();
            var s = $window.pageYOffset;
            var scrolled = false;
            if (s > 0) {
                scrolled = true;
            } else {
                scrolled = false;
            }
            if (scrolled !== $scope.scrolled) {
                $scope.scrolled = angular.copy(scrolled);
                $scope.$apply();
            }
        });


        $rootScope.niceScrollOptions = {
            autohidemode: false,
            cursoropacitymax: 0.6,
            cursorwidth: '7px',
            cursorcolor: "#787878",
            horizrailenabled: false
        };

        // UserServ.getUserData().then(function (d) {
        //     $rootScope.userData = d;
        // });

        $rootScope.$on('user-info-updated', function(event, data) {
            $scope.userData = data;
        });

        $rootScope.$on('show-alert-msg', function(event, data) {
            if (data) {
                $scope.alerts = [data];
            } else {
                $scope.alerts = [];
            }
        });

        $scope.getPresentationProposalData = function (nodeName) {
            opportunitiesServ.getCollabProposalDefaultObj(nodeName, UserServ).then(function(response){
                $scope.openPresentationProposalModal(response, nodeName);
            });

         };

        $scope.openPresentationProposalModal = function (renderObj, nodeName) {
            var modalInstance = $uibModal.open({
                templateUrl: 'views/modal/presentation-proposal.html',
                controller: 'PresentationController',
                size: 'lg',
                resolve: {
                    presentationProposalData: renderObj,
                    nodeName: nodeName
                }
            });
        }
        $scope.openCompetitiveDashboard = function() {
            $uibModal.open({
                templateUrl: 'views/modal/competitive-dashboard.html',
                controller: 'CompetitiveDashboardController',
                size: 'xs'
            });
        };
        $scope.openSalesKit = function() {
            $uibModal.open({
                templateUrl: 'views/modal/sales-kit.html',
                controller: 'SalesKitController',
                size: 'lg'
            });
        };

        $scope.openDefinition = function () {
            $uibModal.open({
                templateUrl: 'views/modal/definition.html',
                controller: 'DefinitionController',
                size: 'lg'
            });
        };
        $scope.openBookmarksDefinition = function () {
            $uibModal.open({
                templateUrl: 'views/modal/bookmark-definition.html',
                controller: 'BookmarksDefinitionController',
                size: 'lg'
            });
        };
        $scope.openTotalAssetDefinition = function () {
            $uibModal.open({
                templateUrl: 'views/modal/total-asset-definition.html',
                controller: 'TotalAssetDefinitionController',
                size: 'lg'
            });
        };
        $scope.openCiscoOneDefinition = function () {
            $uibModal.open({
                templateUrl: 'views/modal/co-definition.html',
                controller: 'CiscoOneDefinitionController',
                size: 'lg'
            });
        };
        $scope.openDefinition = function() {
            $uibModal.open({
                templateUrl: 'views/modal/definition.html',
                controller: 'DefinitionController',
                size: 'lg'
            });
        };
        
        $scope.openSubscriptionDefinition = function () {
            $uibModal.open({
                templateUrl: 'views/modal/subscription-definition.html',
                controller: 'SubscriptionDefinitionController',
                size: 'lg'
            });
        };

        // KD ---- error code handling for API calls

        $scope.$on('session-timeout', function(event, data) {
            if (data === true) {
                $rootScope.accessIssue = 'timeout'
            }
        });

        $scope.$on('sfdc-error', function(event, data) {
            if (data === true) {
                $rootScope.accessIssue = 'sfdcError'
            }
        });

        $scope.$on('no-access', function(event, data) {
            if (data === true) {
                $rootScope.accessIssue = 'noaccess'
            }
        });

        $scope.$on('no-data', function(event, data) {
            if (data === true) {
                $rootScope.accessIssue = 'nodata'
            }
        });

        $scope.$on('system-down', function(event, data) {
            if (data === true) {
                $rootScope.accessIssue = 'systemdown'
            }
        });

         $scope.$on('error-reload', function(event, data) {
            if (data === true) {
              //$scope.logout();
            }
        });

        $scope.$on('sfdc-error-value', function(event, data) {
                     if (data === true) {
                          $uibModal.open({
                                    templateUrl: 'views/modal/technical-warning.html',
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
                        }
                });

	$scope.checkIE = function() {
            var userAgent = navigator.userAgent;
            var IE = userAgent.indexOf("MSIE ") > -1 || userAgent.indexOf("Trident/") > -1 || userAgent.indexOf("Edge") > -1;

            //IE = true;

            if(IE) {
                $uibModal.open({
                templateUrl: 'views/modal/ie.html',
                controller: 'ModalInstanceCtrl',
                windowClass: 'modal-open',
                size: 'xs'
                });
            }
        };

        $scope.checkIE();
        $scope.closeNavBar = function() {
            $scope.navCollapsed = true;
        }
    }
]);
