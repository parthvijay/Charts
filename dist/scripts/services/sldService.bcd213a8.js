/*jshint sub:true*/
'use strict';
angular.module('ciscoExecDashApp').service('SldServ', [
    '$resource',
     'RestUri',
     '$q',
     'ApiDispatcher',
     'ConfigServ',
    function ($resource, restUri, $q, apiDispatcher, configServ) {
        var sldServObj = {};
        var sldApiResponseCache = {};


        var getApiPath = function (key) {
            if (!key) {
                key = 'performance';
            }
            var apiPath = restUri.getUri(key);
            return apiPath;
        };

        var sldFillEnvelope = function (slug, response, dashboard, subTab) {
            if (subTab === "opportunities") {
                subTab = "opportunity";
            } else if (subTab === "bookings") {
                subTab = "booking";
            }
            slug = slug + "_" + subTab;
            var dataset = sldApiResponseCache[slug] || null;
            if (!dataset && dashboard === "services") {
                dataset = angular.copy(configServ.servicesData[slug]);
            }
            for (var i = 0; i < dataset.length; i++) {
                var key = dataset[i]["data-key"];
                var categoryId = dataset[i]["id"];


                if (angular.isDefined(response[slug]) && categoryId !== 2) {
                    if (key === "period" && categoryId === 0) {
                        if (subTab === "overview") {
                            if (angular.isDefined(response[slug]["overview"])) {
                                dataset[i].sldData = angular.copy(response[slug]["overview"]["0"]);
                                dataset[i].previous_data = angular.copy(response[slug]["overview"]["1"]);
                            }
                            if(angular.isDefined(response[slug].targetAmount)){
                                if (response[slug].targetAmount && response[slug].targetAmount > 0.0) {
                                    dataset[i].target = angular.copy(response[slug].targetAmount);
                                }
                            }
                        } else if (subTab === "opportunity") {
                            if (angular.isDefined(response[slug]["salesOpty"])) {
                                dataset[i].sldData = angular.copy(response[slug]["salesOpty"]);
                            }

                        } else if (subTab === "booking") {
                            if (angular.isDefined(response[slug]["multiYearBookings"])) {
                                dataset[i].sldData = angular.copy(response[slug]["multiYearBookings"]);
                            }
                        }

                    } else if (key === "period" && categoryId === 1) {
                        if (subTab === "overview") {
                            if (angular.isDefined(response[slug]["custBookings"])) {

                                dataset[i].sldData = angular.copy(response[slug]["custBookings"]);
                            } else if (angular.isDefined(response[slug]["salesBookings"])) {

                                dataset[i].sldData = angular.copy(response[slug]["salesBookings"]);
                            }
                        } else if (subTab === "opportunity") {
                            if (angular.isDefined(response[slug]["salesOpty"])) {
                                dataset[i].sldData = angular.copy(response[slug]["salesOpty"]);
                            }
                        } else if (subTab === "booking") {
                            if (angular.isDefined(response[slug]["rtm"])) {
                                dataset[i].sldData = angular.copy(response[slug]["rtm"]);
                            }
                            if (angular.isDefined(response["years"])) {
                                 dataset[i].years = angular.copy(response["years"].slice().reverse());
                            }
                        }

                    }
                } else if (key === "spc" && categoryId === 2) {
                    if (angular.isDefined(response["tsRenew_opportunity"])) {
                        if (angular.isDefined(response["tsRenew_opportunity"]["custOpty"])) {
                            dataset[i].sldData = angular.copy(response["tsRenew_opportunity"]["custOpty"]);
                        } else if (angular.isDefined(response["tsRenew_opportunity"]["sales"])) {

                            dataset[i].sldData = angular.copy(response["tsRenew_opportunity"]["sales"]);
                        }
                    } else if (angular.isDefined(response["tsAttach_opportunity"])) {
                        if (angular.isDefined(response["tsAttach_opportunity"]["custOpty"])) {
                            dataset[i].sldData = angular.copy(response["tsAttach_opportunity"]["custOpty"]);
                        } else if (angular.isDefined(response["tsAttach_opportunity"]["sales"])) {

                            dataset[i].sldData = angular.copy(response["tsAttach_opportunity"]["sales"]);
                        }
                    } else if (angular.isDefined(response[slug]) && subTab === "booking") {
                        if (angular.isDefined(response[slug]["quarterBooking"])) {
                            dataset[i].sldData = angular.copy(response[slug]["quarterBooking"]);
                        }
                    }

                } else if (angular.isDefined(response["tsAttach_opportunity"])) {
                    if (key === "spc" && categoryId === 2) {
                        if (angular.isDefined(response["tsAttach_opportunity"]["custOpty"])) {
                            dataset[i].sldData = angular.copy(response["tsAttach_opportunity"]["custOpty"]);
                        } else if (angular.isDefined(response["tsAttach_opportunity"]["sales"])) {

                            dataset[i].sldData = angular.copy(response["tsAttach_opportunity"]["sales"]);
                        }
                    }
                }


                // adding this for line-chart-r-r.
                if (response[slug] && slug === "tsRenew_realization") {
                    if (response.tsRenew_realization.custOpty) {
                        dataset[i].sldData = response.tsRenew_realization.custOpty;
                    } else if (response.tsRenew_realization.salesOpty) {
                        dataset[i].sldData = response.tsRenew_realization.salesOpty;
                    }
                } else if (response[slug] && slug === "tsAttach_realization") {
                    if (angular.isDefined(response.tsAttach_realization)) {
                        dataset[i].data = response.tsAttach_realization["data"];
                        dataset[i].data_net = response.tsAttach_realization["data_net"];
                    }
                }



            }

            sldApiResponseCache[slug] = dataset;
            return dataset;

        };


        sldServObj.getPeriod = function () {

            var deferred = $q.defer();

            var apiPath = getApiPath('period');
            apiDispatcher.get(apiPath).then(function (response) {
                deferred.resolve(response);
            }, function (reason) {
                deferred.reject(reason);
            });

            return deferred.promise;

        };

        sldServObj.getsldData = function (slug, filterObj, subTab, periodId, distributorFlag) {
            var deferred = $q.defer();
            if (subTab === "overview") {
                //do nothing
            } else {
                periodId = null;
            }
            distributorFlag = distributorFlag ? distributorFlag : null;

            var apiPath = getApiPath('sld') + slug + "/" + subTab;

            apiDispatcher.post(apiPath, {

                architectureGroups: filterObj["architectureGroups"] ? JSON.stringify(filterObj["architectureGroups"]) : null,
                gvscsOrganisation: filterObj["gvscsOrganisation"] ? JSON.stringify(filterObj["gvscsOrganisation"]) : null,

                nodeName: filterObj["sales"] ? filterObj["sales"] : null,

                savmGroupName: filterObj["savmGroupName"] ? filters["savmGroupName"] : null,
                activeKey: null,
                period: periodId
            }).then(function (response) {
                deferred.resolve(sldFillEnvelope(slug, response, "services", subTab));
            }, function (reason) {
                deferred.reject(reason);
            });
            return deferred.promise;
        };

        sldServObj.getSPCData = function (slug, filterObj, subTab, distributorFlag, SPCtab, opportunityTabParam, period, chartFilterObj, isSalesDrop, salesOrCust, chartId) {
            var deferred = $q.defer();
            var week;
            var child;
            var node;
            if (subTab === "overview") {

                 if(chartFilterObj.quarterId.length > 2){
                      week = chartFilterObj.quarterId;
                   }
            } else {
                period = chartFilterObj.quarterId;
            }
            //Changes for DE129773 - Sindhu

                 if(chartFilterObj.sales.length > 0) {      
                    if(slug === "tsRenew" && (subTab === "overview")&& SPCtab === "sales"){
                        node = chartFilterObj["sales"];
                    }
                    else{
                      filterObj["sales"] = chartFilterObj["sales"];
                    }
                   }
            if (angular.equals(filterObj.quarterId) || angular.equals({}, filterObj)) {
                filterObj.quarterId = period;
            }

            var subTabValue = opportunityTabParam ? opportunityTabParam : subTab;
            distributorFlag = distributorFlag ? "Y" : "N";
            //Changes for DE129773 - Sindhu
            // if(slug === "tsAttach" && subTab === "overview"){
            // if(angular.isDefined(chartFilterObj["savmGroupName"]) || angular.isDefined(chartFilterObj["sales"])){
            //    if(chartFilterObj["savmGroupName"].length > 2){
            //      week = null;
            //   }
            //  }
            //  }

            // Changes for DE131843, DE132132 and DE132376
            var apiPath;
           if((slug === 'tsRenew' || slug === "tsAttach") && subTab === "opportunities"  && chartId !== 2){
                apiPath = getApiPath('sld') + slug + "/" + subTabValue + "/" + SPCtab;
            } else if((slug === 'tsRenew' || slug === "tsAttach") && subTab === "opportunities" && chartId === 2){
                apiPath = getApiPath('sld') + slug + "/" + subTabValue + "/" + 'overview';
            }
            else {
                 apiPath = getApiPath('sld') + slug + "/" + subTabValue + "/" + SPCtab;
            }
            
            apiDispatcher.post(apiPath, {
                nodeName: filterObj["sales"] ? filterObj["sales"] : null,
                node: node ? node : null,
                architectureGroups: filterObj["architectureGroups"] ? JSON.stringify(filterObj["architectureGroups"]) : null,
                gvscsOrganisation: filterObj["gvscsOrganisation"] ? JSON.stringify(filterObj["gvscsOrganisation"]) : null,
                period: period,
                week: week ? week : null,
                savmGroupName: chartFilterObj["savmGroupName"] ? chartFilterObj["savmGroupName"] : null,
                activeKey: chartFilterObj.activeKey,
                distributorFlag: distributorFlag,
                subTab: subTab
            }).then(function (response) {
                deferred.resolve(sldFillEnvelope(slug, response, "services", subTab));
            }, function (reason) {
                deferred.reject(reason);
            });
            

            return deferred.promise;
        };
        return sldServObj;
    }
]);
