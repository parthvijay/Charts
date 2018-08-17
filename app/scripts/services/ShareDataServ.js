'use strict';
angular.module('ciscoExecDashApp').service('ShareDataServ', ['$window','$sessionStorage', function ($window, $sessionStorage) {

        var accountDetails = [];
        var appliedFilters;
        var contracts = [];
        var selectedContracts = [];

        // added change for pipeline issue, JSON.Stringify is considering
        // newObj as circular so it was not converting it to String
        // removing some functions to fix the problem. -G
        var addDetails = function (newObj, aFilters) {
            accountDetails.push(newObj);
            for(var i = 0; i < accountDetails.length ; i++){
                delete accountDetails[i]["currentTarget"];
                delete accountDetails[i]["delegateTarget"];
                delete accountDetails[i]["handleObj"];
                if(accountDetails[i]["originalEvent"]){
                    delete accountDetails[i]["originalEvent"]["path"];
                    delete accountDetails[i]["originalEvent"]["view"];
                }
                delete accountDetails[i]["view"];
            }
            $sessionStorage.put('accountDetails', JSON.stringify(accountDetails));
            $sessionStorage.put('appliedFilters', JSON.stringify(aFilters));
            appliedFilters = aFilters;
        };

        // added code here to fix any issue with any class calling this function -G
        var getAccountDetails = function () {
            if(accountDetails && accountDetails.length > 0){
                return accountDetails;
            } else {
                return JSON.parse($sessionStorage.get('accountDetails'));
            }
        };

        var getFiltersDetails = function () {
            if(appliedFilters && appliedFilters.length > 0){
                return appliedFilters;
            } else {
                return JSON.parse($sessionStorage.get('appliedFilters'));
            }
        };

        var setContracts = function (c, sC) {
            contracts = c;
            selectedContracts = sC;
        };

        var getContracts = function () {
            return {contracts: contracts, selectedContracts: selectedContracts};
        };

        return {
            addDetails: addDetails,
            getAccountDetails: getAccountDetails,
            getFiltersDetails: getFiltersDetails,
            setContracts: setContracts,
            getContracts: getContracts
        };
    }
]);