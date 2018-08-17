'use strict';
angular.module('ciscoExecDashApp').service('FiltersServ', [
    '$resource'
    , 'RestUri'
    , '$q'
    , 'ApiDispatcher'
    ,'$http'
    ,'$timeout'
    ,'$rootScope'
    ,'$filter'
    ,'CiscoUtilities'
    , function ($resource, restUri, $q, apiDispatcher, $http, $timeout, $rootScope, $filter, CiscoUtilities) {
        var filtersServObj = {};
        var partnerFilterPayload = {};
        var serviceFilterPayload = {};
        filtersServObj.showRefreshInsightFilter = true;
        filtersServObj.showTSAttachInsightFilter = true;
        filtersServObj.newFilters = [];
        filtersServObj.retainSelectedFilters = [];
        filtersServObj.showDataSetFilters = true;
        filtersServObj.selectedSalesValues = [];
        filtersServObj.showTerritoryCoverage =  true;
        filtersServObj.selectedSalesValueForDrill = '';
        //filtersServObj.disablePDS = false;
        var getApiPath = function (key) {
            if (!key) {
                key = 'filters';
            }
            var apiPath = restUri.getUri(key);
            if (!apiPath || window.ciscoConfig.local) {
                apiPath = 'data/filters/filters.json';
            }
            return apiPath;
        };

        filtersServObj.getAllFilters = function () {
            var deferred = $q.defer();
            apiDispatcher.get(getApiPath()).then(function (response) {
                response[1].type = "radio";
                response[1].categoryId = 4;
                response[1].selected = "";
                angular.forEach(response[1].filters,function(val){
                        delete val.checked;
                     })
               deferred.resolve(response);
            }, function (reason) {
                deferred.reject(reason);
            });
            return deferred.promise;
        };

        filtersServObj.getSalesFilterData = function (level, node) {
            var deferred = $q.defer();
            apiDispatcher.get(getApiPath('sales-filter') + '/' + level, {
              "parent": node,
              "globalView" : CiscoUtilities.getGlobalParam()
            }).then(function (response) {
                deferred.resolve(response);
            }, function (reason) {
                deferred.reject(reason);
            });
            return deferred.promise;
        };

        filtersServObj.getAccountManagerFilterData = function (level, node, actManager) {
            var deferred = $q.defer();
            var opt = {
                "parent": node,                
              "globalView" : CiscoUtilities.getGlobalParam()
            };
            if (actManager) {
                opt["accountManager"] = actManager;
            }
            apiDispatcher.get(getApiPath('sales-account-filter') + '/' + level, opt).then(function (response) {
                deferred.resolve(response);
            }, function (reason) {
                deferred.reject(reason);
            });

            return deferred.promise;
        };
    //changes for showing pop up when navigated to Subscription tab
        filtersServObj.disableSubscriptionAlertMsg = false;
        filtersServObj.subscriptionPopupFlag = false;


        //Rmeoving unwanted params
        filtersServObj.showAlertBarForSubscriptionTab = function (subopportunity,opportunitiesActive, oldOpportunitiesActive) {
            if (opportunitiesActive == 'subscription') {
                    filtersServObj.disableSubscriptionAlertMsg = true;
                    $timeout(function(){
                        filtersServObj.disableSubscriptionAlertMsg = false;   
                    },10000); // incresing the timeout to 10 sec to show the pop up in subscription
        } else if ((opportunitiesActive == 'renew' || opportunitiesActive == 'asset' || opportunitiesActive == 'attach' || opportunitiesActive == 'refresh') && oldOpportunitiesActive == 'subscription') {
                filtersServObj.disableSubscriptionAlertMsg = true;
                $timeout(function () {
                    filtersServObj.disableSubscriptionAlertMsg = false;
                }, 10000);
            } else {
                filtersServObj.disableSubscriptionAlertMsg = false;  
            }
        };

        filtersServObj.checkIfSalesLevelIsDrilled = function (salesFilters) {
            //selecting sales filter from applied filters
            var salesLevelApplied = angular.copy(salesFilters);
            if (salesLevelApplied.selected.length && filtersServObj.selectedSalesValues.length) {
                var existingSelectedSalesValues = [];
                for (var j = 0; j < salesLevelApplied.selected.length; j++) {
                    for (var k = 0; k < salesLevelApplied.selected[j].length; k++) {
                        if (salesLevelApplied.selected[j][k]) {
                            existingSelectedSalesValues.push(salesLevelApplied.selected[j][k]);
                        }
                    }
                }
                //get last saleslevel
                var lastSalesLevelIndex = existingSelectedSalesValues.length - 1;
                filtersServObj.selectedSalesValueForDrill = existingSelectedSalesValues[lastSalesLevelIndex];
                filtersServObj.selectedSalesValues = angular.copy(existingSelectedSalesValues);
            } else {
                delete filtersServObj.selectedSalesValueForDrill;
                filtersServObj.selectedSalesValues = [];
            }
        }

        filtersServObj.salesFilterDataSelected = function (id, level) {
            var deferred = $q.defer();
            apiDispatcher.get(getApiPath('sales-filter-selected'), {
                'id': id,
                'level': level,                
              "globalView" : CiscoUtilities.getGlobalParam()
            }).then(function (response) {
                deferred.resolve(response);
            }, function (reason) {
                deferred.reject(reason);
            });
            return deferred.promise;
        };

         filtersServObj.getDropdown = function (payload, salesLevel,slug, accountManager, siteNodeName, currentFilter, serviceFilter) {
            var deferred = $q.defer();
            //console.log(payload);
            if(slug == 'sales'){
            if(salesLevel === 1){
                payload = null;
            }
            if(salesLevel < 7){
                apiDispatcher.post(getApiPath('sales-advanced-filters')+ '/' + salesLevel, {
                "parentNode": payload,
              "globalView" : CiscoUtilities.getGlobalParam()
                }).then(function (response) {
                    deferred.resolve(response);
                }, function (reason) {
                    deferred.reject(reason);
                });
            }

            if(salesLevel === 7){
                apiDispatcher.post(getApiPath('sales-advanced-am-filters')+ '/', {
                "parentNode": payload,                
              "globalView" : CiscoUtilities.getGlobalParam()
                }).then(function (response) {
                    deferred.resolve(response);
                }, function (reason) {
                    deferred.reject(reason);
                });
            }

            // if(salesLevel === 8 && (accountManager.length>0)){//updated for defect DE139907
            //     apiDispatcher.post(getApiPath('sales-advanced-savm-filters')+ '/', {
            //     "parentNode": JSON.stringify(payload), "accountManagerName": JSON.stringify(accountManager)
            //     }).then(function (response) {
            //         deferred.resolve(response);
            //     }, function (reason) {
            //         deferred.reject(reason);
            //     });
            // }
        }if(slug == 'organization'){
            var appFlag ;
         if($rootScope.dashboard === "sales"){
                appFlag = "CE"
            }
        else if($rootScope.dashboard === "services"){
              appFlag = "SLD"
        }
            apiDispatcher.get( getApiPath('filters') + '/' + "organisation", {
                            "appName": appFlag,                        
              "globalView" : CiscoUtilities.getGlobalParam()}).then(function (response) {
                    deferred.resolve(response);
                }, function (reason) {
                    deferred.reject(reason);
                });
        }else if(slug == 'architecture'){
            apiDispatcher.post( getApiPath('filters') + '/' + "architecture",{                
              "globalView" : CiscoUtilities.getGlobalParam()
            }).then(function (response) {
                    deferred.resolve(response);
                }, function (reason) {
                    deferred.reject(reason);
                });
        }else if(slug == 'product'){
            if(salesLevel === 1){
                //if(filtersServObj.productData === undefined){
                    $q.all([
                        apiDispatcher.post(getApiPath('filters') + '/' + "architecture"),
                        apiDispatcher.get(getApiPath('filters') + '/' + "warranty"),
                        apiDispatcher.get(getApiPath('filters')+ '/' + "productType"),{
                            "appName": 'CE',"globalView" : CiscoUtilities.getGlobalParam()}
                    ]).then(function(responses) {
                        filtersServObj.productData = responses;
                        deferred.resolve(responses);
                    }, function(reason) {
                        deferred.reject(reason);
                    });
               // }

            }else if(salesLevel === 2){
                apiDispatcher.post(getApiPath('filters')+ '/' + "architecture",{
                "architectureGroups":payload,                
              "globalView" : CiscoUtilities.getGlobalParam()
            }).then(function (response) {
                deferred.resolve(response);
            }, function (reason) {
                deferred.reject(reason);
            });
            }else if(salesLevel === 3){
                apiDispatcher.post(getApiPath('filters')+ '/' + "productFamily", {
            "subArchitectureGroups": payload,
            "searchStrng": currentFilter.pfSearch,            
              "globalView" : CiscoUtilities.getGlobalParam()
            }).then(function (response) {
                deferred.resolve(response);
            }, function (reason) {
                deferred.reject(reason);
            });
            }else if(salesLevel === 4){
                apiDispatcher.post(getApiPath('filters')+ '/' + "productId", {
            "productFamily": payload,
            "searchStrng": currentFilter.pidSearch,
              "globalView" : CiscoUtilities.getGlobalParam()
            }).then(function (response) {
                deferred.resolve(response);
            }, function (reason) {
                deferred.reject(reason);
            });
            }else if(salesLevel === 5){

            }else if(salesLevel === 6){

            }
        } else if(slug === 'account'){
                    if(salesLevel === 1){
                        //if(filtersServObj.accountData == undefined){
                            $q.all([
                            apiDispatcher.get(getApiPath('filters') + '/' + "country"),
                            apiDispatcher.get(getApiPath('filters') + '/' + "segment"),
                            apiDispatcher.get( getApiPath('filters') + '/' + "organisation", {
                            "appName": 'CE',"globalView" : CiscoUtilities.getGlobalParam()}),
                        ]).then(function(responses) {
                            filtersServObj.accountData = responses;
                            deferred.resolve(responses);
                        }, function(reason) {
                            deferred.reject(reason);
                        });
                    //}
                    }
                    if(salesLevel === 0){
                        //$q.all([
                            /*apiDispatcher.post(getApiPath('account-install-filters') , {"savmGroupName" : JSON.stringify(payload), "nodeName" : JSON.stringify(siteNodeName)}),*/
                            //implementing populatesales api in post call
                            payload = payload.length > 1 ?  JSON.stringify(payload) : payload;
                            apiDispatcher.post(getApiPath('filters')+ '/' + "populateSales", {
                            "customer": payload ? payload : null,
                            "serviceSO": serviceFilter.selected[2]?JSON.stringify(serviceFilter.selected[2]):null,
                              "globalView" : CiscoUtilities.getGlobalParam()
                            })
                        .then(function(responses) {
                            filtersServObj.accountData = responses;
                            deferred.resolve(responses);
                        }, function(reason) {
                            deferred.reject(reason);
                        });
                    }
            }else if(slug === 'partnerSearch'){
                filtersServObj.getPartnerFilters().then(function (response) {
                    deferred.resolve(response);
                }, function (reason) {
                    deferred.reject(reason);
                });
            }else if(slug === 'savSearch'){
                var actManager = JSON.stringify(accountManager) ? JSON.stringify(accountManager) :null;
                filtersServObj.getSavFilters(actManager).then(function (response) {
                    deferred.resolve(response);
                }, function (reason) {
                    deferred.reject(reason);
                });
            }else if(slug === 'services'){
                if(salesLevel === 1){
                    filtersServObj.getContractTypeFilters().then(function (response) {
                        deferred.resolve(response);
                    }, function (reason) {
                        deferred.reject(reason);
                    });
                }else if(salesLevel === 2){
                    filtersServObj.getContractNumFilters().then(function (response) {
                        deferred.resolve(response);
                    }, function (reason) {
                        deferred.reject(reason);
                    });
                }else if(salesLevel === 3){
                    filtersServObj.getServiceSOFilters().then(function (response) {
                        deferred.resolve(response);
                    }, function (reason) {
                        deferred.reject(reason);
                    });
                }
            }

            return deferred.promise;

        };

        filtersServObj.getPartnerFilterPayload = function(){
            return {
                nodeName : partnerFilterPayload.nodeName? JSON.stringify(partnerFilterPayload.nodeName) : null,
                savmGroupName :partnerFilterPayload.savmGroupName? JSON.stringify(partnerFilterPayload.savmGroupName) : null,
                country : partnerFilterPayload.country? JSON.stringify(partnerFilterPayload.country) : null,
                installSite : partnerFilterPayload.installSite? JSON.stringify(partnerFilterPayload.installSite) : null,
                partnerSearchStrng : partnerFilterPayload.partnerSearchStrng? partnerFilterPayload.partnerSearchStrng : null,
                serviceSO : partnerFilterPayload.serviceSO? JSON.stringify(partnerFilterPayload.serviceSO) : null,
              "globalView" : CiscoUtilities.getGlobalParam()
            }
        };
        
        filtersServObj.getSavFilterPayload = function(actManager){
            return {//updated empty array check for DE145027
                parentNode :  partnerFilterPayload.nodeName? JSON.stringify(partnerFilterPayload.nodeName) : null, // Change for DE151401 and DE151346 - Sindhu
                accountManagerName : (actManager && actManager!='[]') ? actManager : null,
                country : (partnerFilterPayload.country && (partnerFilterPayload.country.length>0))? JSON.stringify(partnerFilterPayload.country) : null,
                segment : (partnerFilterPayload.segment && (partnerFilterPayload.segment.length>0))? JSON.stringify(partnerFilterPayload.segment) : null,
                searchStrng : partnerFilterPayload.savSearchStrng? partnerFilterPayload.savSearchStrng : null,
                serviceSO : partnerFilterPayload.serviceSO? JSON.stringify(partnerFilterPayload.serviceSO) : null,
                partnerName:partnerFilterPayload.partnerName? JSON.stringify(partnerFilterPayload.partnerName) : null,
              "globalView" : CiscoUtilities.getGlobalParam()
            }
        };

        filtersServObj.getContractTypeFilterPayload = function(){
            return {
                nodeName : serviceFilterPayload.nodeName? JSON.stringify(serviceFilterPayload.nodeName) : null,
                savmGroupName :serviceFilterPayload.savmGroupName? JSON.stringify(serviceFilterPayload.savmGroupName) : null,
                partnerName : serviceFilterPayload.partnerName? JSON.stringify(serviceFilterPayload.partnerName) : null,
                searchStrng : serviceFilterPayload.contractTypeSearch? serviceFilterPayload.contractTypeSearch : null,
              "globalView" : CiscoUtilities.getGlobalParam()
            }
        };
        filtersServObj.getContractNumFilterPayload = function(){
            return {
                nodeName : serviceFilterPayload.nodeName? JSON.stringify(serviceFilterPayload.nodeName) : null,
                savmGroupName :serviceFilterPayload.savmGroupName? JSON.stringify(serviceFilterPayload.savmGroupName) : null,
                partnerName : serviceFilterPayload.partnerName? JSON.stringify(serviceFilterPayload.partnerName) : null,
                contractType : serviceFilterPayload.contractType? serviceFilterPayload.contractType : null,
                searchStrng : serviceFilterPayload.contractNumberSearch? serviceFilterPayload.contractNumberSearch : null,
              "globalView" : CiscoUtilities.getGlobalParam()
            }
        };
        
        filtersServObj.getServiceSOFilterPayload = function(){
            return {
                nodeName : serviceFilterPayload.nodeName? JSON.stringify(serviceFilterPayload.nodeName) : null,
                savmGroupName :serviceFilterPayload.savmGroupName? JSON.stringify(serviceFilterPayload.savmGroupName) : null,
                guName : serviceFilterPayload.guName? JSON.stringify(serviceFilterPayload.guName) : null,
                partnerName : serviceFilterPayload.partnerName? JSON.stringify(serviceFilterPayload.partnerName) : null,
                //contractType : serviceFilterPayload.contractType? serviceFilterPayload.contractType : null,
                searchStrng : serviceFilterPayload.serviceSOSearch? serviceFilterPayload.serviceSOSearch : null,
                //contractNumber : serviceFilterPayload.contractNumber? serviceFilterPayload.contractNumber : null,
              "globalView" : CiscoUtilities.getGlobalParam()
            }
        };

        filtersServObj.setPartnerFilterPayload = function(obj){
            partnerFilterPayload = obj;
        }

        filtersServObj.setServiceFilterPayload = function(obj){
            serviceFilterPayload = obj;
        }

        filtersServObj.getPartnerFilters = function(filterObj){
            return apiDispatcher.post(getApiPath('filters') + '/' + "partner", filtersServObj.getPartnerFilterPayload());
            //return apiDispatcher.get(getApiPath('filters') + '/' + "partner")
        };
        filtersServObj.getSavFilters = function(actManager,filterObj){
            return apiDispatcher.post(getApiPath('filters') + '/' + "savm", filtersServObj.getSavFilterPayload(actManager));
        };
        
        filtersServObj.getContractTypeFilters = function(filterObj){
            return apiDispatcher.post(getApiPath('filters') + '/' + "contractType", filtersServObj.getContractTypeFilterPayload());
        };

        filtersServObj.getContractNumFilters = function(filterObj){
            return apiDispatcher.post(getApiPath('filters') + '/' + "contractNumber", filtersServObj.getContractNumFilterPayload());
        };

        filtersServObj.getServiceSOFilters = function(filterObj){
            return apiDispatcher.post(getApiPath('filters') + '/' + "ServiceSO", filtersServObj.getServiceSOFilterPayload());
        };
    
        filtersServObj.disableFiltersForTab = function (filter) {
            //disable territory coverage filter for TAV
            if(filter.toLowerCase() === 'territory coverage' && filtersServObj.disableTerritoryCoverage){
                return true;
            }else{
                return false;
            }
        }

        //To disaply the insight filter in view applied section depending on click of tab -shankar
        filtersServObj.showInsightFilters = function (tab) {
            filtersServObj.opportunitiesActive = tab;
            switch (tab){
                case 'refresh':
                    filtersServObj.showRefreshInsightFilter = true;
                    filtersServObj.showTSAttachInsightFilter = false;
                    filtersServObj.showDataSetFilters = false;
                    filtersServObj.disableTerritoryCoverage = false;
                    filtersServObj.disablePDS = false;
                    //filtersServObj.setInsightFiltersCount(5, "0% - 100%");
                    break;
                case'drs':
                    filtersServObj.showRefreshInsightFilter = true;
                    filtersServObj.showTSAttachInsightFilter = false;
                    filtersServObj.showDataSetFilters = false;
                    //filtersServObj.setInsightFiltersCount(5, "0% - 100%");
                    filtersServObj.disableTerritoryCoverage = false;
                    filtersServObj.disablePDS = false;
                    break;
                case'ciscoOne':
                    filtersServObj.showRefreshInsightFilter = true;
                    filtersServObj.showTSAttachInsightFilter = false;
                    filtersServObj.showDataSetFilters = false;
                    filtersServObj.disablePDS = false;
                    //filtersServObj.setInsightFiltersCount(5, "0% - 100%");
                    break;
                case 'attach':
                    filtersServObj.showRefreshInsightFilter = false;
                    filtersServObj.showTSAttachInsightFilter = true;
                    filtersServObj.showDataSetFilters = false;
                    filtersServObj.disableTerritoryCoverage = false;
                    filtersServObj.disablePDS = false;
                    //filtersServObj.setInsightFiltersCount(5, "0% - 100%");
                    break;
                case 'asset':
                    filtersServObj.showRefreshInsightFilter = false;
                    filtersServObj.showTSAttachInsightFilter = false;
                    filtersServObj.showDataSetFilters = true;
                    filtersServObj.disableTerritoryCoverage = true;
                   filtersServObj.disablePDS = false;
                    //filtersServObj.setInsightFiltersCount(5, "0% - 100%");
                    break;
                case 'securityRefresh':
                    filtersServObj.showRefreshInsightFilter = true;
                    filtersServObj.showTSAttachInsightFilter = false;
                    filtersServObj.showDataSetFilters = false;
                    filtersServObj.disableTerritoryCoverage = false;
                    filtersServObj.disablePDS = false;
                    break;
                case 'collaborationRefresh':
                    filtersServObj.showRefreshInsightFilter = true;
                    filtersServObj.showTSAttachInsightFilter = false;
                    filtersServObj.showDataSetFilters = false;
                    filtersServObj.disableTerritoryCoverage = false;
                    filtersServObj.disablePDS = false;
                    break;
                case 'as':
                    filtersServObj.showRefreshInsightFilter = false;
                    filtersServObj.showTSAttachInsightFilter = false;
                    filtersServObj.showDataSetFilters = false;
                    filtersServObj.disableTerritoryCoverage = false;
                   filtersServObj.disablePDS = true;
                   filtersServObj.showSuiteFilter = false;
                    //filtersServObj.setInsightFiltersCount(5, "0% - 100%");
                    break;
                default:
                    filtersServObj.showRefreshInsightFilter = false;
                    filtersServObj.showTSAttachInsightFilter = false;
                    filtersServObj.showDataSetFilters = false;
                    filtersServObj.disableTerritoryCoverage = false;
                    filtersServObj.disablePDS = false;
                    //filtersServObj.setInsightFiltersCount(5, "0% - 100%");
                    break;
            }
        };

        filtersServObj.newFunctionFilter = function (filterObj, selectedFilter, index) {
            var deferred = $q.defer();
            var payload = {};
            if(selectedFilter.slug === 'account' && index === 0){
                apiDispatcher.post(getApiPath('filters') + '/' + "guName", {
                parentNode :  null,
                accountManagerName : null,
                country : null,
                segment : null,
                searchStrng : selectedFilter.searchStr,
                serviceSO : filterObj[3].selected[2]? JSON.stringify(filterObj[3].selected[2]) : null,
              globalView: CiscoUtilities.getGlobalParam()
                }).then(function (response) {
                    deferred.resolve(response);
                }, function (reason) {
                    deferred.reject(reason);
                });
            }else if(selectedFilter.slug === 'account' && index === 2){
                //if we don't put Y here, it is not going to else block and we are not sending savmGroupName to REST while clicking on install site filter
                if(CiscoUtilities.getGlobalParam() == 'Y'){
                    var sitePayload = {
                        "guName" : JSON.stringify(filterObj[1].selected[0]),
                        "globalView" : CiscoUtilities.getGlobalParam()
                    }
                }else{
                    var sitePayload = {
                        "savmGroupName" : JSON.stringify(filterObj[1].selected[1]),
                        "globalView" : CiscoUtilities.getGlobalParam()
                    }
                }
                apiDispatcher.post(getApiPath('account-install-filters') , sitePayload)
                .then(function (response) {
                    deferred.resolve(response);
                }, function (reason) {
                    deferred.reject(reason);
                });
            }
            else{
                apiDispatcher.get(getApiPath(selectedFilter.levels_name[index]),{
                                "appName": 'CE',
              "globalView" : CiscoUtilities.getGlobalParam()}
                                ).then(function (response) {
                    deferred.resolve(response);
                }, function (reason) {
                    deferred.reject(reason);
                });
            }
            return deferred.promise;
        };

        return filtersServObj;
    }
]);