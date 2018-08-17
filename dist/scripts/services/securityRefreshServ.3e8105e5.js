/*jshint sub:true*/
'use strict';
angular.module('ciscoExecDashApp').service('securityRefreshServ', [
    '$resource',
     'RestUri',
     '$q',
     'ApiDispatcher',
     'ConfigServ',
    function ($resource, restUri, $q, apiDispatcher, configServ) {
        var securityRefreshServObj = {};
        var collabProposalObj = {};

        var getApiPath = function (key) {
            if (!key) {
                key = 'performance';
            }
            var apiPath = restUri.getUri(key);
            return apiPath;
        };

        securityRefreshServObj.getData = function (filters, path) {
            var deferred = $q.defer();

            apiDispatcher.post(getApiPath(path), {
                "filters": {
                parentArchGroup : filters.subArch ? filters.subArch : null,
                nodeName: JSON.stringify(filters["nodeName"]),
                accountManagerName: filters.accounts ? JSON.stringify(filters.accounts) : null,
                segment: filters["segment"] ? filters["segment"] : null,
                installSite: filters["installSite"] ? filters["installSite"] : null,
                gvscsOrganisation: filters["gvscsOrganisation"] ? filters["gvscsOrganisation"]: null,
                contractType: filters.contractType?filters.contractType:null,
                contractNumber: filters.contractNumber?filters.contractNumber:null,
                serviceSO: filters.serviceSO?filters.serviceSO:null,
                guName: filters.guName?filters.guName:null,
                eos: !angular.equals({}, filters.eos) ? JSON.stringify(filters.eos): null,
                ldos: !angular.equals({}, filters.ldos) ? JSON.stringify(filters.ldos) : null,
                ship: !angular.equals({}, filters.ship) ? JSON.stringify(filters.ship) : null,
                cled: !angular.equals({},filters.cled) ? JSON.stringify(filters.cled) : null,
                partnerName: filters.partner ? filters.partner : null,
                country: filters["country"] ? filters["country"] : null,
                verticalMarket: filters["verticalMarket"] ? filters["verticalMarket"] : null,
                customer: filters["customer"] ? filters["customer"] : null,
                customerName: filters["customerName"] ? filters ["customerName"] :null,
                //bookmarkFlag : bookmarkFlag ? bookmarkFlag : null,
                refreshPropensity: filters["refreshPropensity"] ? filters["refreshPropensity"] : null,
                lowerAttachPropensity: filters["lowerAttachPropensity"] >= 0 ? filters["lowerAttachPropensity"] : null,
                higherAttachPropensity: filters["higherAttachPropensity"] >= 0 ? filters["higherAttachPropensity"] : null,
                coverage: filters["coverage"] ? filters["coverage"] : null,
                networkCollection : filters["networkCollection"] ? filters["networkCollection"] : null,
                sweeps : filters["sweep"] ? filters["sweep"] : null,
                globalShippedPeriod: filters["globalShippedPeriod"] ? filters["globalShippedPeriod"] : null,
                architectureGroups: filters["architectureGroups"] ? filters["architectureGroups"] : null,
                subArchitectureGroups: filters["subArchitectureGroups"] ? filters["subArchitectureGroups"] : null,
                productType: filters["productType"] ? filters["productType"] : null,
                warrantyCategory: filters["warrantyCategory"] ? filters["warrantyCategory"] : null,
                productFamily: filters["productFamily"] ? filters["productFamily"] : null,
                productName: filters["productName"] ? filters["productName"] : null,
                //activeKey: filters["activeKey"] ? filters["activeKey"] : null, // changes for DE135340
                quarterId: filters["quarterId"] ? filters["quarterId"] : null,
                quarters: filters.quarterIdValues ? filters.quarterIdValues:null,
                activeKey: filters["activeKey"] ? filters["activeKey"] : null,
                hasSuite: filters.hasSuite ? filters.hasSuite : false,
                productClassification: filters["productClassification"] ? filters["productClassification"] : null,
                suite:  filters["Suite"] ?  filters["Suite"] : null,
                }
            }).then(function (response) {
                deferred.resolve(response);
            }, function (reason) {
                deferred.reject(reason);
            });
            return deferred.promise;
        };
        

        securityRefreshServObj.getSmartIbReport = function(nodeName, index, activeTab, lineCount, listAmount, filterObj,savid) {
                   
            var deferred = $q.defer();
            nodeName = JSON.stringify(nodeName);
            var apiUrl = getApiPath('customer-report') + activeTab;
            if (index === 1) {
                apiDispatcher.post(apiUrl, {
                    filters: {
                        accountManagerName: filterObj.accountManagerName?JSON.stringify(filterObj.accountManagerName):null,
                        accountName: filterObj.accountName?JSON.stringify(filterObj.accountName):null,
                        activeTab: activeTab ,
                        architectureGroups: filterObj.architectureGroups?JSON.stringify(filterObj.architectureGroups):null,
                        bookmarkFlag: null,
                        country: filterObj.country?JSON.stringify(filterObj.country):null,
                        verticalMarket: filterObj.verticalMarket?JSON.stringify(filterObj.verticalMarket):null,
                        coverage: filterObj.coverage?JSON.stringify(filterObj.coverage):null,
                        customer: nodeName,
                        savId: JSON.stringify(savid) , // Change for DE163261
                        customerReportTotalType: filterObj["customerReportTotalType"]?JSON.stringify(filterObj["customerReportTotalType"]):null,
                        contractType: filterObj.contractType?filterObj.contractType:null,
                        guName: filterObj.guName?filterObj.guName:null,
                        contractNumber: filterObj.contractNumber?filterObj.contractNumber:null,
                        serviceSO: filterObj.serviceSO?filterObj.serviceSO:null,
                        eos: filterObj.eos?JSON.stringify(filterObj.eos):null,
                        globalShippedPeriod: filterObj.globalShippedPeriod?JSON.stringify(filterObj.globalShippedPeriod):null,
                        gvscsOrganisation: filterObj.gvscsOrganisation?JSON.stringify(filterObj.gvscsOrganisation):null,
                        higherAttachPropensity: filterObj.higherAttachPropensity?filterObj.higherAttachPropensity:null,
                        installSite: filterObj.installSite?JSON.stringify(filterObj.installSite):null,
                        ldos: filterObj.ldos?JSON.stringify(filterObj.ldos):null,
                        lowerAttachPropensity: filterObj.lowerAttachPropensity?filterObj.lowerAttachPropensity:null,
                        networkCollection: filterObj.networkCollection?JSON.stringify(filterObj.networkCollection):null,
                        sweeps : filters["sweep"] ? JSON.stringify(filters["sweep"]) : null,
                        nodeName: nodeName,
                        parentArchGroup: null,
                        partnerName: filterObj.partnerName?JSON.stringify(filterObj.partnerName):null,
                        productFamily: filterObj.productFamily?JSON.stringify(filterObj.productFamily):null,
                        productName: filterObj.productName?JSON.stringify(filterObj.productName):null,
                        productType: filterObj.productType?JSON.stringify(filterObj.productType):null,
                        refreshPropensity: filterObj.refreshPropensity?filterObj.refreshPropensity:null,
                        sales: filterObj.sales?JSON.stringify(filterObj.sales):null,
                        segment: filterObj.segment?JSON.stringify(filterObj.segment):null,
                        selectedSuite:filterObj.selectedSuite?JSON.stringify(filterObj.selectedSuite):null,
                        selectedOppBySuite:filterObj.selectedOppBySuite?JSON.stringify(filterObj.selectedOppBySuite):null,
                        swssRenewType: filterObj.swssRenewType ? JSON.stringify(filterObj.swssRenewType):null,
                        ship: filterObj.ship?JSON.stringify(filterObj.ship):null,
                        subArchitectureGroups: filterObj.subArchitectureGroups?JSON.stringify(filterObj.subArchitectureGroups):null,
                        warrantyCategory: filterObj.warrantyCategory?JSON.stringify(filterObj.warrantyCategory):null,
                          productClassification: filterObj.productClassification ? filterObj.productClassification : null,
                          suite:  filterObj["Suite"] ?  filters["Suite"] : null
                    },
                    lineCount :lineCount,
                    listAmount: listAmount
                }).then(function(response) {
                    deferred.resolve(response);
                }, function(reason) {
                    deferred.reject(reason);
                });

            } 
            else {
                apiDispatcher.post(getApiPath('smart-ib-report')  + activeTab , {
                    customer: nodeName,
                    savId: JSON.stringify(savid), // Change for DE163261
                    sales: filterObj.sales?JSON.stringify(filterObj.sales):null,
                    accountManager: filterObj.accountManagerName ? filterObj.accountManagerName : null,
                    lineCount :lineCount,
                    listAmount: listAmount
                 }).then(function(response) {
                    deferred.resolve(response);
                }, function(reason) {
                    deferred.reject(reason);
                });
            }
            return deferred.promise;
        };

        securityRefreshServObj.getCustomers = function(filters, path){
            var deferred = $q.defer();
            apiDispatcher.post(getApiPath('security-refresh-Customer'), {
                "filters": {
                    parentArchGroup : filters.subArch ? filters.subArch : null,
                    nodeName: JSON.stringify(filters["nodeName"]),
                    accountManagerName: filters.accounts ? JSON.stringify(filters.accounts) : null,
                    segment: filters["segment"] ? filters["segment"] : null,
                    installSite: filters["installSite"] ? filters["installSite"] : null,
                    gvscsOrganisation: filters["gvscsOrganisation"] ? filters["gvscsOrganisation"]: null,
                    contractType: filters.contractType?filters.contractType:null,
                    contractNumber: filters.contractNumber?filters.contractNumber:null,
                    serviceSO: filters.serviceSO?filters.serviceSO:null,
                    guName: filters.guName?filters.guName:null,
                    eos: !angular.equals({}, filters.eos) ? JSON.stringify(filters.eos): null,
                    ldos: !angular.equals({}, filters.ldos) ? JSON.stringify(filters.ldos) : null,
                    ship: !angular.equals({}, filters.ship) ? JSON.stringify(filters.ship) : null,
                    cled: !angular.equals({},filters.cled) ? JSON.stringify(filters.cled) : null,
                    partnerName: filters.partner ? filters.partner : null,
                    country: filters["country"] ? filters["country"] : null,
                    verticalMarket: filters["verticalMarket"] ? filters["verticalMarket"] : null,
                    customer: filters["customer"] ? filters["customer"] : null,
                    customerName: filters["customerName"] ? filters ["customerName"] :null,
                    //bookmarkFlag : bookmarkFlag ? bookmarkFlag : null,
                    refreshPropensity: filters["refreshPropensity"] ? filters["refreshPropensity"] : null,
                    lowerAttachPropensity: filters["lowerAttachPropensity"] >= 0 ? filters["lowerAttachPropensity"] : null,
                    higherAttachPropensity: filters["higherAttachPropensity"] >= 0 ? filters["higherAttachPropensity"] : null,
                    coverage: filters["coverage"] ? filters["coverage"] : null,
                    networkCollection : filters["networkCollection"] ? filters["networkCollection"] : null,
                    sweeps : filters["sweep"] ? JSON.stringify(filters["sweep"]) : null,
                    globalShippedPeriod: filters["globalShippedPeriod"] ? filters["globalShippedPeriod"] : null,
                    architectureGroups: filters["architectureGroups"] ? filters["architectureGroups"] : null,
                    subArchitectureGroups: filters["subArchitectureGroups"] ? filters["subArchitectureGroups"] : null,
                    productType: filters["productType"] ? filters["productType"] : null,
                    warrantyCategory: filters["warrantyCategory"] ? filters["warrantyCategory"] : null,
                    productFamily: filters["productFamily"] ? filters["productFamily"] : null,
                    productName: filters["productName"] ? filters["productName"] : null,
                    //activeKey: filters["activeKey"] ? filters["activeKey"] : null, // changes for DE135340
                    quarterId: filters["quarterId"] ? filters["quarterId"] : null,
                    quarters: filters.quarterIdValues ? filters.quarterIdValues:null,
                    activeKey: filters["activeKey"] ? filters["activeKey"] : null,
                    hasSuite: filters.hasSuite ? filters.hasSuite : false,
                    productClassification: filters["productClassification"] ? filters["productClassification"] : null,
                    suite:  filters["Suite"] ?  filters["Suite"] : null
                }
            }).then(function (response) {
                deferred.resolve(response);
            }, function (reason) {
                deferred.reject(reason);
            });
            return deferred.promise;
        };

        return securityRefreshServObj;
    }
]);
