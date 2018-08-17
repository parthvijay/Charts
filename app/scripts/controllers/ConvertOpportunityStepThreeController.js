'use strict';
angular.module('ciscoExecDashApp').controller('ConvertOpportunityStepThreeController', ['$scope', '$http', '$rootScope', 'ShareDataServ','$filter', function($scope, $http, $rootScope, ShareDataServ, $filter) {


    var a = {};
    var products = [];
    var services = [];
    var accounts = ShareDataServ.getAccountDetails();
    var filtersDetails = ShareDataServ.getFiltersDetails();
    
    
    $scope.getAllocationValue = function (c, d) {
            var plainNumber = c.toString().replace(/[^\d|\-+|\.+]/g, '');
            var n = parseInt(plainNumber) * (0.01 * d);
            return $filter('currency')(n, '', '0');
        };

    var currDetail = accounts.length - 1;

    a = $scope.newOpurtunity.selectedServices;
    $scope.newOpurtunity.selectedTechnologies;


    Object.entries($scope.newOpurtunity.selectedServices).forEach( function([key, value]) {

        var myArray = key[0];
        value["serviceProgram"] = key;
        value["serviceMixPercent"] = parseInt(value["value"]);
        value["serviceLevel"] = value["serviceLevelSelected"];
        value["serviceCategory"] = value["serviceCategorySelected"];
        services.push(value);
    });

    Object.entries($scope.newOpurtunity.selectedTechnologies).forEach( function([key, value]) {

        var myArray = key[0];
        value["technology"] = value.options[0].key;
        value["productMixPercent"] = parseInt(value["value"]);

        products.push(value);
    });


      accounts[currDetail].oppCreationData.foreCastDate =   $rootScope.steps.formFirstStep.dt;
            var month;
            var year;
            var day;

            var d = new Date( accounts[currDetail].oppCreationData.foreCastDate);
            month = '' + (d.getMonth() + 1),
                day = '' + d.getDate(),
                year = d.getFullYear();

            if (month.length < 2) {
                month = '0' + month;
            }
            if (day.length < 2) {
                day = '0' + day;
            }
    accounts[currDetail].oppCreationData.forecastStatus = $rootScope.steps.formFirstStep.selectedStatus;
    accounts[currDetail].oppCreationData.description  = $rootScope.steps.formFirstStep.description;
    accounts[currDetail].oppCreationData.foreCastDate = year + "-" + month + "-" + day;        
    accounts[currDetail].oppCreationData.products = products;
    accounts[currDetail].oppCreationData.services = services;
    accounts[currDetail].oppCreationData.optyServiceAmount = $scope.newOpurtunity.ExpectedServiceValue;
    accounts[currDetail].oppCreationData.optyProductAmount = $scope.newOpurtunity.ExpectedProductValue;
    accounts[currDetail].oppCreationData.optyServiceAmount = parseInt(accounts[currDetail].oppCreationData.optyServiceAmount.replace(/,/g, ''));
    accounts[currDetail].oppCreationData.optyProductAmount = parseInt(accounts[currDetail].oppCreationData.optyProductAmount .replace(/,/g, ''));
    accounts[currDetail].oppCreationData.optyName = $rootScope.steps.formFirstStep.opp_name;
    accounts[currDetail].oppCreationData.optyStage = $rootScope.steps.formFirstStep.selectedStage;

}]);
