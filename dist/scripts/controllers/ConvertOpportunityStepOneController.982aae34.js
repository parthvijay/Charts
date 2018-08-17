
           
'use strict';
angular.module('ciscoExecDashApp').controller('ConvertOpportunityStepOneController', ['$scope', '$http', '$rootScope', 'ShareDataServ', '$filter', 'SfdcServ', 'OpportunitiesServ', '$sessionStorage', 'CiscoUtilities', function($scope, $http, $rootScope, ShareDataServ, $filter, sfdcserv, OpportunitiesServ, $sessionStorage, CiscoUtilities) {

        var accountDetails = ShareDataServ.getAccountDetails();
        var filtersDetails = ShareDataServ.getFiltersDetails();
        $scope.CiscoUtilities = CiscoUtilities;

        $scope.filters = JSON.parse($sessionStorage.get('filters'));
        $scope.accounts = JSON.parse($sessionStorage.get('accounts'));

        var oppCreationData = {};

        var currDetail = accountDetails.length - 1;
        oppCreationData.subTab = accountDetails[currDetail].subTab;
        oppCreationData.requestor = accountDetails[currDetail].userInfo;

        var salesFilter = [];
        var actManager = [];
        var architectureType = [];
        var coverageFilter = "";
        var networkFilter = "";
        $scope.enableOwner = false;
        
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


        var filtersToBeApplied = $scope.CiscoUtilities.cleansedFilters($scope.filters, $scope.accounts);
        
        // ************ Commenting because we don't need it and its making second call to get refId ****** Parth

        // OpportunitiesServ.getRefId(accountDetails[currDetail], filtersToBeApplied, actManager, architectureType, coverageFilter, networkFilter).then(function(d) {
        //     oppCreationData.sourceRefId = d.data.refId;
        //         var accountsData;
        //         accountsData = $sessionStorage.get('sfdcAccounts');
        //         accountsData = JSON.parse(accountsData);
        //         $scope.oppAccount = accountsData.data;
        //         if($scope.steps && $scope.steps.formFirstStep.accDetails){
        //             $scope.selectedAccountDetails = {};
        //             $scope.selectedAccountDetails = $scope.steps.formFirstStep.accDetails;
        //             $scope.oppOwnerList = [];
        //             $scope.steps.formFirstStep.selectedOwner = '';
        //             angular.forEach($scope.steps.formFirstStep.accDetails.opptyOwnerList, function(opty) {
        //                 $scope.oppOwnerList.push(opty);
        //             });
        //             $scope.selectedOwnerDetails = {};
        //             $scope.selectedOwnerDetails = $scope.steps.formFirstStep.selectedOwner;
        //             $scope.enableOwner = true;
        //         }
        // })   
           
        $scope.selectOwner = function(opty){

                   $scope.steps.formFirstStep.selectedOwner = opty;
                   oppCreationData.terrCurrencyCode = opty.terrCurrencyCode;
                   oppCreationData.sfdcId = opty.sfdcId;
                   oppCreationData.salesAgent = opty.cecId;
                   oppCreationData.forecastingPos = opty.forecastingPos;
                   oppCreationData.partnerRequired = "false";
                    if(opty.accountOwnerFlag === "Y" && opty.cecId === oppCreationData.requestor){
                        $scope.enableOwner = true;
                        $rootScope.steps.formFirstStep.enableOwner = $scope.enableOwner;
                    } else{
                    $scope.enableOwner = false;
                    $rootScope.steps.formFirstStep.enableOwner = $scope.enableOwner;
                }
                accountDetails[currDetail].oppCreationData = oppCreationData;
        }
        
                  
         $scope.selectAccount = function(account) {            
           $rootScope.steps.formFirstStep.accOwner = "";
            $scope.oppOwnerList = [];
            $scope.accountName = account.accountName;
            oppCreationData.accountId = account.accountId;
             $scope.steps.formFirstStep.accDetails = account;
            
            angular.forEach(account.opptyOwnerList, function(opty) {
                    if(opty.accountOwnerFlag === "Y"){
                        $rootScope.steps.formFirstStep.accOwner = opty.firstName + " " + opty.lastName;
                    }    $scope.oppOwnerList.push(opty);
                    
            })
 
            oppCreationData.foreCastDate = $rootScope.steps.formFirstStep.dt;
            oppCreationData.optyName = $rootScope.steps.formFirstStep.opp_name;
            oppCreationData.forecastStatus = $rootScope.steps.formFirstStep.selectedStatus;
            accountDetails[currDetail].oppCreationData = oppCreationData;

        }



        $http.get('config/opportunity_stage.json').then(function(d) {
            $scope.oppStage = d.data;
            if (!$rootScope.steps.formFirstStep.selectedStage) {
                $rootScope.steps.formFirstStep.selectedStage = $scope.oppStage[0].name;
            }

        });

        $http.get('config/opportunity_forecast.json').then(function(d) {
            $scope.oppForecast = d.data;
            if (!$rootScope.steps.formFirstStep.selectedStatus) {
                $rootScope.steps.formFirstStep.selectedStatus = $scope.oppForecast[0].name;
            }
        });

        if (!$rootScope.steps.formFirstStep) {
            $rootScope.steps.formFirstStep = {};
            $rootScope.steps.formFirstStep.opp_name = '';
            oppCreationData.optyName = $rootScope.steps.formFirstStep.opp_name;

        }

        $scope.accountDetails = ShareDataServ.getAccountDetails();
        $scope.filtersDetails = ShareDataServ.getFiltersDetails();


        var validateFirstStep = function(newVal) {
            return (newVal !== '' && newVal !== undefined);
        };

        var validateInfo = function(newVal) {
            if (newVal.length > 0) {
                for (var i = 0, l = newVal.length; i < l; i++) {
                    if (newVal[i] === undefined || newVal[i] === '') {
                        return false;
                    }
                }
                return true;
            }
            return false;
        };



        $scope.isInfoValid = function() {
            $scope.infoValidated = false;

            var status;
            if($scope.oppAccount !== undefined){                
                angular.forEach($scope.oppAccount, function(value) {
                    if (value.accountId == $rootScope.steps.formFirstStep.accDetails.accountId) {
                        status = true;
                    }
                })
            }
            if($rootScope.steps.formFirstStep.enableOwner === true){
                $scope.enableOwner = true;
            }
            else{
                $scope.enableOwner = false;
            }
            if(status == true){
               $rootScope.steps.formFirstStep.accName = true; 
            } else{
                $rootScope.steps.formFirstStep.accName = false;
            }
            
            if ($rootScope.steps.formFirstStep.opp_name !== undefined && $rootScope.steps.formFirstStep.accName == true && $rootScope.steps.formFirstStep.opp_name !== "" && $rootScope.steps.formFirstStep.dt !== undefined && $rootScope.steps.formFirstStep.accDetails !== '' && $rootScope.steps.formFirstStep.selectedOwner !== '' && $rootScope.steps.formFirstStep.selectedOwner != undefined && (($rootScope.steps.formFirstStep.selectedStage == '1 - Prospect') || ($rootScope.steps.formFirstStep.selectedStage == '2 - Qualification' && $rootScope.steps.formFirstStep.selectedStatus !== undefined))) {
                $scope.infoValidated = true;
                return true;
            }
            return false;
        }

        // Date picker in Step 1 starts here
        $scope.today = function() {
            $scope.dt = new Date();
        };
        $scope.today();

        $scope.clear = function() {
            $scope.dt = null;
        };

        $scope.inlineOptions = {
            customClass: getDayClass,
            minDate: new Date(),
            showWeeks: true
        };

        $scope.dateOptions = {
            dateDisabled: disabled,
            formatYear: 'yy',
            maxDate: new Date(2020, 5, 22),
            minDate: new Date(),
            startingDay: 1
        };
        // Disable weekend selection
        function disabled(data) {
            var date = data.date,
                mode = data.mode;
            return mode === 'day' && (date.getDay() === 0 || date.getDay() === 6);
        }
        $scope.inlineOptions.minDate = $scope.inlineOptions.minDate ? null : new Date();
        $scope.dateOptions.minDate = $scope.inlineOptions.minDate;

        $scope.toggleMin = function() {
            $scope.inlineOptions.minDate = $scope.inlineOptions.minDate ? null : new Date();
            $scope.dateOptions.minDate = $scope.inlineOptions.minDate;
        };

        $scope.toggleMin();

        $scope.open1 = function() {
            $scope.popup1.opened = true;
        };

        $scope.setDate = function(year, month, day) {
            $scope.dt = new Date(year, month, day);
        };

        $scope.formats = ['dd-MMMM-yyyy', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate'];
        $scope.format = $scope.formats[0];
        $scope.altInputFormats = ['M!/d!/yyyy'];

        $scope.popup1 = {
            opened: false
        };

        var tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        var afterTomorrow = new Date();
        afterTomorrow.setDate(tomorrow.getDate() + 1);
        $scope.events = [{
            date: tomorrow,
            status: 'full'
        }, {
            date: afterTomorrow,
            status: 'partially'
        }];

        function getDayClass(data) {
            var date = data.date,
                mode = data.mode;
            if (mode === 'day') {
                var dayToCheck = new Date(date).setHours(0, 0, 0, 0);

                for (var i = 0; i < $scope.events.length; i++) {
                    var currentDay = new Date($scope.events[i].date).setHours(0, 0, 0, 0);

                    if (dayToCheck === currentDay) {
                        return $scope.events[i].status;
                    }
                }
            }

            return '';
        }
        // date picker in Step 1 ends here


    }
]);