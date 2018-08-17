/*jshint sub:true*/
'use strict';
angular.module('ciscoExecDashApp').service('OpportunitiesServ', [
    '$resource',
    'RestUri',
    '$q',
    'ApiDispatcher',
    'ConfigServ',
    '$translate',
    'GlobalBookmarkServ',
    'CiscoUtilities',
    function ($resource, restUri, $q, apiDispatcher, configServ, $translate, GlobalBookmarkServ, CiscoUtilities) {

        var opportunitiesServObj = {};
        var actionMetricData = {};
        var opportunityApiResponseCache = {};
        var customerIdList = [];
        var customerIdNet = [];
        var isBookmarkActive = GlobalBookmarkServ.isBookmarkActive;
        var isFromCE = false;
        var collabProposalObj = {};
        var assetFiscalData;
        var subTabApiMap = {
            "refresh": {
                "ship": "refresh_shipment",
                "eos": "refresh_eos",
                "ldos": "refresh_ldos",
            },
            "subscription": {
                "security": "subscr_security",
                "collaboration": "subscr_collaboration",
                "other": "subscr_other"
            },
            "renew": {
                "total": "totalRenew",
                "ts": "tsRenew",
                "swss": "swssRenew",
                "as": "asRenew"
            },
            "attach": {
                "total": "totalAttach",
                "ts": "tsAttach",
                "swss": "swssAttach"
            }
        };
        opportunitiesServObj.showWaterfall = false;

        var getApiPath = function (key) {
            if (!key) {
                key = 'opportunities';
            }
            var apiPath = restUri.getUri(key);
            return apiPath;
        };

        opportunitiesServObj.getCollabProposalDefaultObj = function (nameOfCustomer, userData) {
            var deferred = $q.defer();
            var collabProposalObj = {
                "proposedFor": "",
                "presentedTo": "",
                "greetingName": "",
                "contactTitle": "",
                "presentedBy": "",
                "presentersTitle": "",
                "presentersCompany": "",
                "presentersEmail": "",
                "presentersPhone": "",
                "proposalDate": "",
                "proposalLanguage": "",
                "requestProposalCheckbox": "",
                "presentationLanguage": "",
                "requestPresentationCheckbox": ""
            };
            apiDispatcher.get(getApiPath('collab-bookmark-autofill'), {}).then(function (response) {
                collabProposalObj.presentedBy = response.presentedBy;
                collabProposalObj.presentersEmail = response.presentersEmail;
                if (response.presentersPhone) {
                    collabProposalObj.presentersPhone = (response.presentersPhone).replace(/[^0-9]/ig, '');
                }
                collabProposalObj.presentersTitle = response.presentersTitle;
                collabProposalObj.presentersCompany = response.presentersCompany;
                deferred.resolve(collabProposalObj);
            }, function (reason) {
                deferred.reject(reason);
            });
            return deferred.promise;
        };

        var serviceCall = this;

        var fillEnvelope = function (slug, response, sales, pieActiveValue, doNoFiscalDataSwitch) {
            //Condition to reset 3rd chart to saleslevel when switching between Ananlysis and Campaign
            if (['asset', 'refresh_ldos', 'refresh_eos', 'refresh_shipment', 'subscr_security', 'subscr_other', 'subscr_collaboration', 'totalRenew', 'tsRenew', 'swssRenew', 'asRenew', 'totalAttach', 'tsAttach', 'swssAttach'].includes(slug) && !doNoFiscalDataSwitch && angular.isArray(response["spc"]["sales"])) {
                assetFiscalData = response;
            }
            if (slug === 'all') {
                if (angular.isDefined(opportunityApiResponseCache['drs'])) {
                    opportunityApiResponseCache['drs'][2].activeCategory = 0;
                }
                if (angular.isDefined(opportunityApiResponseCache['ciscoOne'])) {
                    opportunityApiResponseCache['ciscoOne'][2].activeCategory = 0;
                }
            }

            if (slug === "tsAttach" && !pieActiveValue) {
                if (angular.isDefined(opportunityApiResponseCache['tsAttach'])) {
                    opportunityApiResponseCache['tsAttach'][0].activeCategory = 1;
                }
            }
            if (slug === 'drs' || slug === 'ciscoOne') {
                if (angular.isDefined(opportunityApiResponseCache['all'])) {
                    opportunityApiResponseCache['all'][2].activeCategory = 0;
                }
            }
            var dataset = opportunityApiResponseCache[slug] || null;

            if (!dataset) {
                dataset = angular.copy(configServ.opportunitiesData[slug]);
            }
            for (var i = 0; i < dataset.length; i++) {
                var key = dataset[i]["data-key"];



                if (key === 'sfdcBookings' && slug === 'drs') {
                    dataset[i]['descriptions'] = [];
                    dataset[i].descriptions.push($translate.instant("opportunities." + slug + "." + dataset[i].type + ".shipment"));
                    dataset[i].descriptions.push($translate.instant("opportunities." + slug + "." + dataset[i].type + ".sfdcbookins"));
                } else {

                    dataset[i]['descriptions'] = [];
                    if (dataset[i].title.length === 0) {
                        dataset[i].title = $translate.instant("opportunities." + slug + "." + dataset[i].type + ".title");
                    }

                    // if (dataset[i].title.length === 0) {
                    //     dataset[i].title = $translate.instant("opportunities." + slug + "." + dataset[i].type + ".title");
                    // }

                    if (dataset[i].description && dataset[i].description.length === 0) {
                        dataset[i].description = $translate.instant("opportunities." + slug + "." + dataset[i].type + ".tooltip");
                    }

                    if (slug === "ciscoOne") {
                        dataset[i].description = $translate.instant("opportunities." + slug + "." + dataset[i].type + ".drilldowntooltip");
                    }
                    
                    // info icon for 2nd charts only for tav and subscr
                    if(['asset', 'subscr_security', 'subscr_collaboration', 'subscr_other'].includes(slug) && dataset[i].type === 'bar_stacked') {
                        dataset[i]['descriptions'] = [];
                        dataset[i].tooltip = $translate.instant("opportunities." + slug + "." + dataset[i].type + ".tooltip");
                        dataset[i].description = $translate.instant("opportunities." + slug + "." + dataset[i].type + ".description");
                    }
                    // info icon for 3rd charts other than above tav and subscr
                    if(!['asset', 'subscr_security', 'subscr_collaboration', 'subscr_other'].includes(slug) &&  ['bar_stacked_double_horizontal', 'bar_stacked_horizontal'].includes(dataset[i].type)) {
                        dataset[i]['descriptions'] = [];
                        dataset[i].descriptions.push($translate.instant("opportunities." + slug + "." + dataset[i].type + ".sales"));
                        dataset[i].descriptions.push($translate.instant("opportunities." + slug + "." + dataset[i].type + ".partner"));
                        dataset[i].descriptions.push($translate.instant("opportunities." + slug + "." + dataset[i].type + ".customer"));
                        dataset[i].descriptions.push($translate.instant("opportunities." + slug + "." + dataset[i].type + ".account"));
                    }
                }

                if (dataset[i].type === "bar_stacked") {
                    dataset[i].currentQuarter = configServ.currentQuarter;
                    dataset[i].currentMonth = configServ.currentMonth;
                    dataset[i].currentYear = configServ.currentYear;
                }

                if (key === "period" && (angular.isObject(response["spc"]) && angular.isArray(response["spc"]["sales"]))) {
                    if ((slug === "swssAttach" || slug === "swssRenew") && (dataset[i].type === "pie" && angular.isDefined(response["spc"]["aging"]))) {
                        dataset[i].data = [];
                        dataset[i].data["0"] = angular.copy(response["spc"]["sales"]);
                        dataset[i].data["1"] = angular.copy(response["spc"]["aging"]);
                    } else if ((slug === "swssAttach") && (dataset[i].type === "bar_stacked" && angular.isDefined(response["spc"]["aging"])) && dataset[i].activeCategory === 1) {
                        dataset[i].data = angular.copy(response["spc"]["aging"]);
                    } else if (["refresh_shipment", "refresh_eos", "refresh_ldos", "tsRenew", "subscr_security", "subscr_collaboration", "subscr_other"].includes(slug) && angular.isDefined(response["spc"]["data_list"])) {
                        dataset[i].data_net = angular.copy(response["spc"]["sales"]);
                        dataset[i].data = angular.copy(response["spc"]["data_list"]);

                     } else if(slug === "totalRenew"){
                        dataset[i].data_net = angular.copy(response["spc"]["sales"]);
                     } 
                     else if (slug === "asRenew") {
                        dataset[i].data_net = angular.copy(response["spc"]["sales"]);
                    }
                    else {
                        if (angular.isDefined(response["spc"]["data_list"])) {
                            if (dataset[i].type === "bar_stacked" || slug === 'asset') {
                                dataset[i].data_net = angular.copy(response["spc"]["sales"]);
                                dataset[i].data = angular.copy(response["spc"]["data_list"]);
                            } else {
                                dataset[i].data_net["0"] = angular.copy(response["spc"]["sales"]);
                                dataset[i].data["0"] = angular.copy(response["spc"]["data_list"]);
                            }
                        } else {
                            if (slug === "totalRenew") {
                                dataset[i].data_net = angular.copy(response["spc"]["sales"]);
                            } else if (slug === "asRenew") {
                                dataset[i].data_net = angular.copy(response["spc"]["sales"]);
                            }
                            else if (slug === "tsAttach" && dataset[i].type === "pie") {
                                if (dataset[0].activeCategory === 1) {
                                    dataset[i].data["1"] = angular.copy(response["spc"]["sales"]);
                                }
                                else if (dataset[0].activeCategory === 2) {
                                    dataset[i].data["2"] = angular.copy(response["spc"]["sales"]);
                                }
                                else {
                                    dataset[i].data["0"] = angular.copy(response["spc"]["sales"]);
                                }

                            }
                            else {
                                dataset[i].data = angular.copy(response["spc"]["sales"]);
                            }

                        }

                    }
                } else if (key === "spc" && angular.isObject(response[key])) {
                    var spcData = response[key];
                    var spcKeyMap = [];
                    for (var spcKey in spcData) {
                        if (spcKey !== "aging") {
                            spcKeyMap.push(spcKey);
                        }
                        if (spcData[spcKey] && angular.isArray(spcData[spcKey])) {
                            if (angular.isDefined(configServ.opportunitiesKeyNameMap[spcKey])) {
                                if (((spcKey === "sales") || (spcKey === "partner") || (spcKey === "customer") || (spcKey === "manager")) && (angular.isDefined(response["spc"]["data_list"]))) {
                                    dataset[i]["data_net"][configServ.opportunitiesKeyNameMap[spcKey]] = angular.copy(spcData[spcKey]);

                                } else if (slug === "totalRenew" && !(angular.isDefined(response["spc"]["data_list"]))) {
                                    dataset[i]["data_net"][configServ.opportunitiesKeyNameMap[spcKey]] = angular.copy(spcData[spcKey]);
                                } else if  (slug === "asRenew" && !(angular.isDefined(response["spc"]["data_list"]))){
                                    dataset[i]["data_net"][configServ.opportunitiesKeyNameMap[spcKey]] = angular.copy(spcData[spcKey]);
                                }
                                else {
                                    dataset[i]["data"][configServ.opportunitiesKeyNameMap[spcKey]] = angular.copy(spcData[spcKey]);
                                }

                            } else if ((spcKey === "data_list") && (slug !== 'totalRenew')&& slug !== 'asRenew')  {
                                if (angular.isDefined(response["spc"]["partner"])) {
                                    dataset[i]["data"][configServ.opportunitiesKeyNameMap["partner"]] = angular.copy(spcData[spcKey]);
                                } else if (angular.isDefined(response["spc"]["customer"])) {
                                    dataset[i]["data"][configServ.opportunitiesKeyNameMap["customer"]] = angular.copy(spcData[spcKey]);
                                } else if (angular.isDefined(response["spc"]["sales"])) {
                                    dataset[i]["data"][configServ.opportunitiesKeyNameMap["sales"]] = angular.copy(spcData[spcKey]);
                                } else if (angular.isDefined(response["spc"]["manager"])) {
                                    dataset[i]["data"][configServ.opportunitiesKeyNameMap["manager"]] = angular.copy(spcData[spcKey]);
                                }

                            } else {
                                dataset[i].aging = [];
                                dataset[i]["aging"]["0"] = angular.copy(response["spc"][spcKeyMap[0]]);
                                dataset[i]["aging"]["1"] = angular.copy(response["spc"]["aging"]);
                            }
                        }
                        /* Added conditional check to remove filtered data from 3rd tile's table data to ensure data is cleared when no data is returned by API */ //commenting out below condition. It is breaking attach tabs- srinath
                        // if (spcData[spcKey].length === 0 && i === 2) {
                        //     dataset[i].filtered = [];
                        // }
                    }
                } else if (response[key]) {
                    if (key === "overview" && angular.isDefined(response["overview"]["data_list"])) {
                        dataset[i].data_net = angular.copy(response["overview"]["sales"]);
                        dataset[i].data = angular.copy(response["overview"]["data_list"]);


                    } else {
                        if (slug === "drs") {
                            dataset[i]["shipment_data"].data_net = response[key][0];
                            dataset[i]["shipment_data"].data = response[key][1];
                            dataset[i]["sfdc_data"] = response[key][2];
                        }
                        if (slug === "ciscoOne") {
                            if (i === 0 && dataset[0].activeCategory === 1) {
                                dataset[i]["data"][1] = response[key][0];
                            } else {
                                dataset[i]["data"] = response[key];
                            }
                        }
                    }
                }
            }
            opportunityApiResponseCache[slug] = dataset;
            if (typeof response.hasSub !== undefined && slug !== "ciscoOne") {
                dataset.hasSub = response.hasSub;
            }
            //for getting line count and list amount for reports
            if ((angular.isDefined(response["spc"]["customer"])) || (angular.isDefined(response["spc"]["manager"]))) {
                dataset[2].lineCount = getLineCountValues(dataset);
                dataset[2].listAmount = getListAmountValues(dataset);
            }

            return dataset;


        };



        var getLineCountValues = function (value) {
            var lineCountArray = [];
            if (angular.isDefined(value[2].data) && value[2].data[2].length > 0) {
                if (angular.isDefined(value[2].data[2]["0"])) {
                    angular.forEach(value[2].data[2]["0"].areas, function (lineCount) {
                        lineCountArray.push({
                            "title": lineCount.state,
                            "value": lineCount.lineCount
                        });
                    });
                }
            }
            else {
                if (angular.isDefined(value[2].data_net[2]["0"])) {
                    angular.forEach(value[2].data_net[2]["0"].areas, function (lineCount) {
                        lineCountArray.push({
                            "title": lineCount.state,
                            "value": lineCount.lineCount
                        });
                    });
                }
            }

            return lineCountArray;
        };

        var getListAmountValues = function (value) {
            var lineAmountArray = [];
            if (angular.isDefined(value[2].data) && value[2].data[2].length > 0) {
                if (angular.isDefined(value[2].data[2]["0"]) && value[2].data[2].length > 0) {
                    angular.forEach(value[2].data[2]["0"].areas, function (lineCount) {
                        lineAmountArray.push({
                            "title": lineCount.state,
                            "value": lineCount.listAmount
                        });
                    });
                }
            }
            else {
                if (angular.isDefined(value[2].data_net[2]["0"])) {
                    angular.forEach(value[2].data_net[2]["0"].areas, function (lineCount) {
                        lineAmountArray.push({
                            "title": lineCount.state,
                            "value": lineCount.listAmount
                        });
                    });
                }
            }
            return lineAmountArray;
        };

        var swtichFiscalTab = function (fiscalValue) {
            var prepData;
            if (assetFiscalData) {
                prepData = {};
                prepData['spc'] = {};
                switch (fiscalValue) {
                    case 'FQ':
                        prepData.spc.sales = assetFiscalData.spc.sales;
                        prepData.spc.aging = assetFiscalData.spc.aging;
                        prepData.spc.data_list = assetFiscalData.spc.data_list;
                        
                        break;
                    case 'FM':
                        prepData.spc.sales = assetFiscalData.spc.salesMonth;
                        prepData.spc.aging = assetFiscalData.spc.agingMonth;
                        prepData.spc.data_list = assetFiscalData.spc.data_listMonth;
                        

                        break;
                    case 'FY':
                        prepData.spc.sales = assetFiscalData.spc.salesYear;
                        prepData.spc.aging = assetFiscalData.spc.agingYear;
                        prepData.spc.data_list = assetFiscalData.spc.data_listYear;
                       
                        break;
                }
            }
            return prepData;
        };

        opportunitiesServObj.getOverviewData = function (filters, dashboard) {
            var overviewTabsData = configServ["overview-tabs"];
            var overviewsalesServicesTabsData = [];
            angular.forEach(overviewTabsData, function (tabsData) {
                if (tabsData.dashboard === "sales" && dashboard === "sales") {
                    overviewsalesServicesTabsData.push(tabsData);
                }
                if (tabsData.dashboard === "services" && dashboard === "services") {
                    overviewsalesServicesTabsData.push(tabsData);
                }
            });
            if (overviewsalesServicesTabsData && angular.isArray(overviewsalesServicesTabsData)) {
                var oTabsOrder = configServ['overview-tabs-order'];
                overviewsalesServicesTabsData.sort(function (a, b) {
                    return oTabsOrder[a.slug] - oTabsOrder[b.slug];
                });
            }
            return overviewsalesServicesTabsData;
        };

        opportunitiesServObj.getData = function (slug, filters, subTab, campaignId, subArch, source, pieActiveValue, switchFiscal) {
            if (campaignId) {
                return opportunitiesServObj.getCampaignData(campaignId, filters, subArch, slug, subTab);
            }
            else {
                return opportunitiesServObj.getOpportunitiesData(slug, filters, subTab, subArch, source, pieActiveValue, switchFiscal);
            }
        };

        opportunitiesServObj.getCampaignData = function (campaignId, filters, subArch, slug, subTab) {

            var deferred = $q.defer();
            var ciscoOneURL = '';
            var apiPath;

            if (campaignId === 'drs') {
                if (filters) {
                    filters.name = campaignId;
                } else {
                    filters = {
                        name: campaignId
                    };
                }

                // } else if (subArch) {
                //     ciscoOneURL = 'ciscoOne' + '?parentArchGroup' + '=' + subArch;

                // } else if (subArch) {
                //     ciscoOneURL = 'ciscoOne' + '?parentArchGroup' + '=' + subArch;

            } else {
                ciscoOneURL = 'ciscoOne';
            }
            if (campaignId === 'ciscoOne') {
                apiPath = getApiPath('campaign') + ciscoOneURL;
            }
            else {
                apiPath = getApiPath('campaign') + ciscoOneURL + filters.name;
            }
            filters.subArch = subArch;
            apiDispatcher.post(apiPath, {
                "filters": opportunitiesServObj.getDataObj(filters, slug, subTab)
            }
            ).then(function (response) {
                deferred.resolve(fillEnvelope(campaignId, response, "sales"));
            }, function (reason) {
                deferred.reject(reason);
            });

            return deferred.promise;
        };

        opportunitiesServObj.getOpportunitiesData = function (slug, filters, subTab, subArch, source, pieActiveValue, switchFiscal) {
            var deferred = $q.defer();
            var slugUrl = '';
            var bookmarkFlag = false;
            isFromCE = true;
            if (subTab && subTab.length > 0) {
                var subSlug = subTabApiMap[slug][subTab];
                if (subSlug) {
                    slug = subSlug;
                }
            }
            if (slug === 'asset') {
                slugUrl = 'View';
            }
            if ((slug.indexOf('refresh') > -1) && isBookmarkActive()) {
                bookmarkFlag = true;
            }
            if (pieActiveValue) {
                var apipath = getApiPath('opportunities') + slug + slugUrl + '/' + pieActiveValue;
            }
            else {
                var apipath = getApiPath('opportunities') + slug + slugUrl;
            }
            filters.subArch = subArch;
            filters.source = source;
            filters.bookmarkFlag = bookmarkFlag;
            if (['asset', 'refresh_ldos','refresh_eos' ,'refresh_shipment','subscr_security','subscr_other','subscr_collaboration','totalRenew','tsRenew','swssRenew','asRenew','totalAttach','tsAttach','swssAttach' ].includes(slug) && switchFiscal) {
                var newData = fillEnvelope(slug, swtichFiscalTab(filters.selectedFiscal), "sales", pieActiveValue, true);
                if (!newData || newData !== -1) {
                    deferred.resolve(newData);
                } else {
                    deferred.reject('NODATA');
                }
                switchFiscal = false;
            } else {
                apiDispatcher.post(apipath,
                    {
                        "filters": opportunitiesServObj.getDataObj(filters, slug, subTab)
                    }
                ).then(function (response) {
                    deferred.resolve(fillEnvelope(slug, response, "sales", pieActiveValue));
                    isFromCE = false;
                }, function (reason) {
                    deferred.reject(reason);
                    isFromCE = false;
                });
            }
            return deferred.promise;
        };

        opportunitiesServObj.getProductFamilyData = function (slug, filters, subTab, subArch) {
            var deferred = $q.defer();
            var slugUrl = '';
            isFromCE = true;
            if (subTab && subTab.length > 0) {
                var subSlug = subTabApiMap[slug][subTab];
                // if (subArch) {
                //     slugUrl = '?' + 'parentArchGroup' + '=' + subArch;
                // } else { slugUrl = '' }
                if (subSlug) {
                    slug = subSlug;
                }
            }
            var bookmarkFlag = false;
            if ((slug.indexOf('refresh') > -1) && isBookmarkActive()) {
                bookmarkFlag = true;
            }
            filters.subArch = subArch;
            filters.bookmarkFlag = bookmarkFlag;
            apiDispatcher.post(getApiPath('opportunities') + 'pf/' + slug + slugUrl,
                {
                    "filters": opportunitiesServObj.getDataObj(filters, slug, subTab)
                }
            ).then(function (response) {
                deferred.resolve(response);
            }, function (reason) {
                deferred.reject(reason);
            });
            return deferred.promise;
        };

        opportunitiesServObj.getProductFamilyDataDRS = function (campaignId, filters) {
            var deferred = $q.defer();
            if (filters) {
                filters.name = campaignId;
            } else {
                filters = {
                    name: campaignId
                };
            }
            if (angular.isDefined(filters["sales"])) {
                filters["nodeName"] = JSON.parse(filters["sales"]);
            }
            apiDispatcher.post(getApiPath('campaign') + 'pf/drs', {
                "filters": opportunitiesServObj.getDataObj(filters)
            }).then(function (response) {
                deferred.resolve(response);
            }, function (reason) {
                deferred.reject(reason);
            });
            return deferred.promise;
        };


        opportunitiesServObj.getSPCData = function (slug, spcKey, filters, subTab, subArch, pieActiveValue) {
            var deferred = $q.defer();
            var slugUrl = '';
            var bookmarkFlag;
            var campaignId = slug;
            isFromCE = true;
            var apiUrl;
            if (subTab && subTab.length > 0) {
                var subSlug = subTabApiMap[slug][subTab];
                if (subSlug) {
                    slug = subSlug;
                }
            }
            if (campaignId === 'drs' || campaignId === 'ciscoOne') {
                apiUrl = getApiPath('campaign');
            } else {
                apiUrl = getApiPath('opportunities');
            }
            if (campaignId === 'drs') {
                slug = "";
            }
            if (angular.isDefined(filters["accounts"])) {
                if (filters["accounts"]["0"] === filters["customer"]) {
                    delete filters["customer"];
                }
            }
            if(spcKey !== undefined) {
                var apiPath = apiUrl + slug + '/spc/' + spcKey + slugUrl + '/';
                if (spcKey === "manager") {
                    apiPath = apiUrl + slug + '/' + spcKey + slugUrl + '/';
                }
                if (slug === 'asset') {
                    apiPath = apiUrl + slug + 'View' + '/spc/' + spcKey + slugUrl + '/';
                    if (spcKey === "manager") {
                        apiPath = apiUrl + slug + 'View' + '/' + spcKey + slugUrl + '/';
                    }
                }
            }
            if (campaignId === 'drs') {
                filters.name = campaignId;
                slug = campaignId;
            }

            if (pieActiveValue) {
                var apiPath = apiPath + '/' + pieActiveValue;
            }

            filters.subArch = subArch;
            filters.bookmarkFlag = bookmarkFlag;
            if (campaignId === 'drs') {
                apiDispatcher.post(apiPath + filters.name, {
                    "filters": opportunitiesServObj.getDataObj(filters, slug, subTab)
                }
                ).then(function (response) {
                    deferred.resolve(fillEnvelope(slug, response, "sales", pieActiveValue, true));
                    isFromCE = false;
                }, function (reason) {
                    deferred.reject(reason);
                    isFromCE = false;
                });
            } else {
                bookmarkFlag = false;
                if ((slug.indexOf('refresh') > -1) && isBookmarkActive()) {
                    bookmarkFlag = true;
                }
                apiDispatcher.post(apiPath, {
                    "filters": opportunitiesServObj.getDataObj(filters, slug, subTab)
                }).then(function (response) {
                    deferred.resolve(fillEnvelope(slug, response, "sales", pieActiveValue));
                    isFromCE = false;
                }, function (reason) {
                    deferred.reject(reason);
                    isFromCE = false;
                });
            }
            return deferred.promise;
        };

        opportunitiesServObj.getActionMetricsData = function (nodeName, salesFilter, actManager, actName, architectureType, coverageFilter) {
            var deferred = $q.defer();
            apiDispatcher.get(getApiPath('action-metrics-report'), {
                customer: nodeName,
                sales: salesFilter,
                accountManager: actManager ? actManager : null,
                accountName: actName ? actName : null,
                architecture: architectureType ? architectureType : null,
                coverage: coverageFilter ? coverageFilter : null
            }).then(function (response) {
                actionMetricData = response;
                deferred.resolve(response);
            }, function (reason) {
                deferred.reject(reason);
            });

            return deferred.promise;
        };
        //KD :- Need a work around, we need to change
        opportunitiesServObj.getActionData = function () {
            return actionMetricData;
        };

        opportunitiesServObj.getExpandedCustomerViewData = function (slug, activeTab, filters, activeSubTab, selectedTab) {
            var deferred = $q.defer();
            var coverage;
            var network;
            if (filters !== undefined) {
                if (filters.coverageFilter !== undefined) {
                    coverage = filters.coverageFilter;
                }
                if (filters.networkFilter !== undefined) {
                    network = filters.networkFilter;
                }
            } else {
                filters.globalShippedPeriod = null;
                filters.productFamily = null;
                filters.productName = null;
            }
            var bookmarkFlag = false;
            if ((slug.indexOf('refresh') > -1) && isBookmarkActive()) {
                bookmarkFlag = true;
            }
            filters.bookmarkFlag = bookmarkFlag;
            var apiUrl;
            if (slug === 'drs') {
                apiUrl = getApiPath('expanded-customer-view-campaign') + activeTab;
            } else {
                apiUrl = getApiPath('expanded-customer-view') + activeTab;
            }
            apiDispatcher.post(apiUrl, {
                "filters": opportunitiesServObj.getDataObj(filters, slug),
                activeCategory: selectedTab
            }).then(function (response) {
                deferred.resolve(response);
            }, function (reason) {
                deferred.reject(reason);
            });

            return deferred.promise;
        };

        //adding chages to customer report filter so that we can send all the advanced filters value.-G
        opportunitiesServObj.getSmartIbReport = function (nodeName, index, activeTab, archType, selectedArch, selectedSubArch, quarters, quarterId, filterObj, collabData, lineCount, listAmount, pieChartActiveValue) {
            //stringifying the refresh propensity in case of array
            if (filterObj.refreshPropensity && angular.isArray(filterObj.refreshPropensity)) {
                filterObj.refreshPropensity = JSON.stringify(filterObj.refreshPropensity);
            }
            var deferred = $q.defer();
            var apiActiveTab = angular.copy(activeTab);
            // if(activeTab === 'asset'){
            //     apiActiveTab += 'View';
            // } else {
            //     //do nothing
            // }
            nodeName = JSON.stringify(nodeName);
            if (pieChartActiveValue === "warranty") {
                filterObj.warrantyCategory = filterObj.architectureGroups;
                filterObj.architectureGroups = null;
            }
            else if (pieChartActiveValue === "aging") {
                filterObj.attachAgingSelection = filterObj.architectureGroups;
                filterObj.architectureGroups = null;
            }
            var apiUrl = getApiPath('customer-report') + apiActiveTab;
            isFromCE = true;
            if (index === 1) {
                apiDispatcher.post(apiUrl, {
                    filters: opportunitiesServObj.getReportData(nodeName, index, activeTab, archType, selectedArch, selectedSubArch, quarters, quarterId, filterObj),
                    lineCount: lineCount,
                    listAmount: listAmount
                }).then(function (response) {
                    deferred.resolve(response);
                }, function (reason) {
                    deferred.reject(reason);
                });

            } else if (index === 2) {
                apiDispatcher.post((getApiPath('collab-report') + apiActiveTab), {
                    filters: opportunitiesServObj.getReportData(nodeName, index, activeTab, archType, selectedArch, selectedSubArch, quarters, quarterId, filterObj),
                    collabData: collabData
                }).then(function (response) {
                    deferred.resolve(response);
                }, function (reason) {
                    deferred.reject(reason);
                });

            } else if (index === 3) {
                apiDispatcher.post(getApiPath('smart-ib-report') + apiActiveTab, {
                    customer: nodeName,
                    sales: filterObj.sales ? JSON.stringify(filterObj.sales) : null,
                    accountManager: filterObj.accountManagerName ? filterObj.accountManagerName : null,
                    lineCount: lineCount,
                    listAmount: listAmount,
                    globalView: CiscoUtilities.getGlobalParam(),
                    guName: filterObj.guName ? JSON.stringify(filterObj.guName) : null,
                    accountName: filterObj.accountName ? JSON.stringify(filterObj.accountName) : null
                }).then(function (response) {
                    deferred.resolve(response);
                }, function (reason) {
                    deferred.reject(reason);
                });
            } else if (index === 4) {
                apiDispatcher.post(getApiPath('am-customer-report') + apiActiveTab, {
                    filters: {
                        amName: nodeName,
                        lineCount: lineCount,
                        listAmount: listAmount,
                        accountName: filterObj.accountName ? JSON.stringify(filterObj.accountName) : null,
                        activeTab: activeTab,
                        agingSelection: filterObj.agingSelection ? filterObj.agingSelection : null,
                        attachAgingSelection: filterObj.attachAgingSelection ? filterObj.attachAgingSelection : null,
                        architectureGroups: filterObj.architectureGroups ? JSON.stringify(filterObj.architectureGroups) : null,
                        bookmarkFlag: null,
                        country: filterObj.country ? JSON.stringify(filterObj.country) : null,
                        verticalMarket: filterObj.verticalMarket ? JSON.stringify(filterObj.verticalMarket) : null,
                        coverage: filterObj.coverage ? JSON.stringify(filterObj.coverage) : null,
                        customerReportTotalType: (filterObj["customerReportTotalType"] && activeTab !== "asset") ? JSON.stringify(filterObj["customerReportTotalType"]) : null,
                        contractType: filterObj.contractType ? JSON.stringify(filterObj.contractType) : null,
                        contractNumber: filterObj.contractNumber ? JSON.stringify(filterObj.contractNumber) : null,
                        serviceSO: filterObj.serviceSO ? JSON.stringify(filterObj.serviceSO) : null,
                        guName: filterObj.guName ? JSON.stringify(filterObj.guName) : null,
                        eos: filterObj.eos ? JSON.stringify(filterObj.eos) : null,
                        cled: filterObj.cled ? JSON.stringify(filterObj.cled) : null,
                        globalShippedPeriod: filterObj.globalShippedPeriod ? JSON.stringify(filterObj.globalShippedPeriod) : null,
                        gvscsOrganisation: filterObj.gvscsOrganisation ? JSON.stringify(filterObj.gvscsOrganisation) : null,
                        higherAttachPropensity: filterObj.higherAttachPropensity ? filterObj.higherAttachPropensity : null,
                        installSite: filterObj.installSite ? JSON.stringify(filterObj.installSite) : null,
                        ldos: filterObj.ldos ? JSON.stringify(filterObj.ldos) : null,
                        lowerAttachPropensity: filterObj.lowerAttachPropensity ? filterObj.lowerAttachPropensity : null,
                        networkCollection: filterObj.networkCollection ? JSON.stringify(filterObj.networkCollection) : null,
                        sweeps: filterObj.sweep ? JSON.stringify(filterObj.sweep) : null,
                        //nodeName: nodeName,
                        parentArchGroup: null,
                        partnerName: filterObj.partnerName ? JSON.stringify(filterObj.partnerName) : null,
                        productFamily: filterObj.productFamily ? JSON.stringify(filterObj.productFamily) : null,
                        productName: filterObj.productName ? JSON.stringify(filterObj.productName) : null,
                        productType: filterObj.productType ? JSON.stringify(filterObj.productType) : null,
                        quarters: quarters ? quarters : null,
                        quarterId: quarterId ? quarterId : null,
                        refreshPropensity: filterObj.refreshPropensity ? filterObj.refreshPropensity : null,
                        sales: filterObj.sales ? JSON.stringify(filterObj.sales) : null,
                        segment: filterObj.segment ? JSON.stringify(filterObj.segment) : null,
                        selectedSuite: filterObj.selectedSuite ? JSON.stringify(filterObj.selectedSuite) : null,
                        selectedOppBySuite: filterObj.selectedOppBySuite ? JSON.stringify(filterObj.selectedOppBySuite) : null,
                        swssRenewType: filterObj.swssRenewType ? JSON.stringify(filterObj.swssRenewType) : null,
                        ship: filterObj.ship ? JSON.stringify(filterObj.ship) : null,
                        subArchitectureGroups: filterObj.subArchitectureGroups ? JSON.stringify(filterObj.subArchitectureGroups) : null,
                        warrantyCategory: filterObj.warrantyCategory ? JSON.stringify(filterObj.warrantyCategory) : null,
                        bookmarkName: isFromCE ? GlobalBookmarkServ.getBookmarkName() : null,
                        dataset: filterObj.dataset ? JSON.stringify(filterObj.dataset) : null,
                        assetType: (filterObj["customerReportTotalType"] && activeTab === "asset") ? JSON.stringify(filterObj["customerReportTotalType"]) : null,
                        suite: filterObj["Suite"] ? JSON.stringify(filterObj["Suite"]) : null,
                        productClassification: (filterObj["productClassification"] && activeTab === "asset") ? JSON.stringify(filterObj["productClassification"]) : null,
                        globalView: CiscoUtilities.getGlobalParam(),
                        appliedSales: filterObj["appliedSales"] ? filterObj["appliedSales"] : null
                    },
                    lineCount: lineCount,
                    listAmount: listAmount
                }).then(function (response) {
                    deferred.resolve(response);
                }, function (reason) {
                    deferred.reject(reason);
                });


            } else {
                apiDispatcher.post(getApiPath('sales-customer-report') + activeTab, {
                    filters: {
                        sales: nodeName,
                        lineCount: lineCount,
                        listAmount: listAmount,
                        accountManagerName: filterObj.accountManagerName ? JSON.stringify(filterObj.accountManagerName) : null,
                        accountName: filterObj.accountName ? JSON.stringify(filterObj.accountName) : null,
                        activeTab: activeTab,
                        agingSelection: filterObj.agingSelection ? filterObj.agingSelection : null,
                        attachAgingSelection: filterObj.attachAgingSelection ? filterObj.attachAgingSelection : null,
                        architectureGroups: filterObj.architectureGroups ? JSON.stringify(filterObj.architectureGroups) : null,
                        bookmarkFlag: null,
                        country: filterObj.country ? JSON.stringify(filterObj.country) : null,
                        verticalMarket: filterObj.verticalMarket ? JSON.stringify(filterObj.verticalMarket) : null,
                        coverage: filterObj.coverage ? JSON.stringify(filterObj.coverage) : null,
                        customerReportTotalType: filterObj["customerReportTotalType"] ? JSON.stringify(filterObj["customerReportTotalType"]) : null,
                        contractType: filterObj.contractType ? JSON.stringify(filterObj.contractType) : null,
                        contractNumber: filterObj.contractNumber ? JSON.stringify(filterObj.contractNumber) : null,
                        serviceSO: filterObj.serviceSO ? JSON.stringify(filterObj.serviceSO) : null,
                        guName: filterObj.guName ? JSON.stringify(filterObj.guName) : null,
                        eos: filterObj.eos ? JSON.stringify(filterObj.eos) : null,
                        cled: filterObj.cled ? JSON.stringify(filterObj.cled) : null,
                        globalShippedPeriod: filterObj.globalShippedPeriod ? JSON.stringify(filterObj.globalShippedPeriod) : null,
                        gvscsOrganisation: filterObj.gvscsOrganisation ? JSON.stringify(filterObj.gvscsOrganisation) : null,
                        higherAttachPropensity: filterObj.higherAttachPropensity ? filterObj.higherAttachPropensity : null,
                        installSite: filterObj.installSite ? JSON.stringify(filterObj.installSite) : null,
                        ldos: filterObj.ldos ? JSON.stringify(filterObj.ldos) : null,
                        lowerAttachPropensity: filterObj.lowerAttachPropensity ? filterObj.lowerAttachPropensity : null,
                        networkCollection: filterObj.networkCollection ? JSON.stringify(filterObj.networkCollection) : null,
                        sweeps: filterObj.sweep ? JSON.stringify(filterObj.sweep) : null,
                        //nodeName: nodeName,
                        parentArchGroup: null,
                        partnerName: filterObj.partnerName ? JSON.stringify(filterObj.partnerName) : null,
                        productFamily: filterObj.productFamily ? JSON.stringify(filterObj.productFamily) : null,
                        productName: filterObj.productName ? JSON.stringify(filterObj.productName) : null,
                        productType: filterObj.productType ? JSON.stringify(filterObj.productType) : null,
                        quarters: quarters ? quarters : null,
                        quarterId: quarterId ? quarterId : null,
                        refreshPropensity: filterObj.refreshPropensity ? filterObj.refreshPropensity : null,
                        segment: filterObj.segment ? JSON.stringify(filterObj.segment) : null,
                        selectedSuite: filterObj.selectedSuite ? JSON.stringify(filterObj.selectedSuite) : null,
                        selectedOppBySuite: filterObj.selectedOppBySuite ? JSON.stringify(filterObj.selectedOppBySuite) : null,
                        swssRenewType: filterObj.swssRenewType ? JSON.stringify(filterObj.swssRenewType) : null,
                        ship: filterObj.ship ? JSON.stringify(filterObj.ship) : null,
                        subArchitectureGroups: filterObj.subArchitectureGroups ? JSON.stringify(filterObj.subArchitectureGroups) : null,
                        warrantyCategory: filterObj.warrantyCategory ? JSON.stringify(filterObj.warrantyCategory) : null,
                        bookmarkName: isFromCE ? GlobalBookmarkServ.getBookmarkName() : null,
                        dataset: filterObj.dataset ? JSON.stringify(filterObj.dataset) : null,
                        assetType: (filterObj["customerReportTotalType"] && activeTab === "asset") ? JSON.stringify(filterObj["customerReportTotalType"]) : null,
                        suite: filterObj["Suite"] ? JSON.stringify(filterObj["Suite"]) : null,
                        productClassification: (filterObj["productClassification"] && activeTab === "asset") ? JSON.stringify(filterObj["productClassification"]) : null,
                        globalView: CiscoUtilities.getGlobalParam(),
                        appliedSales: filterObj["appliedSales"] ? filterObj["appliedSales"]: null
                    },
                    lineCount: lineCount,
                    listAmount: listAmount
                }).then(function (response) {
                    deferred.resolve(response);
                }, function (reason) {
                    deferred.reject(reason);
                });
            }
            return deferred.promise;
        };

        opportunitiesServObj.getReportData = function (nodeName, index, activeTab, archType, selectedArch, selectedSubArch, quarters, quarterId, filterObj) {
            return {
                accountManagerName: filterObj.accountManagerName ? JSON.stringify(filterObj.accountManagerName) : null,
                accountName: filterObj.accountName ? JSON.stringify(filterObj.accountName) : null,
                activeTab: activeTab,
                agingSelection: filterObj.agingSelection ? filterObj.agingSelection : null,
                attachAgingSelection: filterObj.attachAgingSelection ? filterObj.attachAgingSelection : null,
                architectureGroups: filterObj.architectureGroups ? JSON.stringify(filterObj.architectureGroups) : null,
                bookmarkFlag: null,
                country: filterObj.country ? JSON.stringify(filterObj.country) : null,
                verticalMarket: filterObj.verticalMarket ? JSON.stringify(filterObj.verticalMarket) : null,
                coverage: filterObj.coverage ? JSON.stringify(filterObj.coverage) : null,
                customer: nodeName,
                customerReportTotalType: filterObj["customerReportTotalType"] ? JSON.stringify(filterObj["customerReportTotalType"]) : null,
                contractType: filterObj.contractType ? JSON.stringify(filterObj.contractType) : null,
                contractNumber: filterObj.contractNumber ? JSON.stringify(filterObj.contractNumber) : null,
                serviceSO: filterObj.serviceSO ? JSON.stringify(filterObj.serviceSO) : null,
                guName: filterObj.guName ? JSON.stringify(filterObj.guName) : null,
                eos: filterObj.eos ? JSON.stringify(filterObj.eos) : null,
                cled: filterObj.cled ? JSON.stringify(filterObj.cled) : null,
                globalShippedPeriod: filterObj.globalShippedPeriod ? JSON.stringify(filterObj.globalShippedPeriod) : null,
                gvscsOrganisation: filterObj.gvscsOrganisation ? JSON.stringify(filterObj.gvscsOrganisation) : null,
                higherAttachPropensity: filterObj.higherAttachPropensity ? filterObj.higherAttachPropensity : null,
                installSite: filterObj.installSite ? JSON.stringify(filterObj.installSite) : null,
                ldos: filterObj.ldos ? JSON.stringify(filterObj.ldos) : null,
                lowerAttachPropensity: filterObj.lowerAttachPropensity ? filterObj.lowerAttachPropensity : null,
                networkCollection: filterObj.networkCollection ? JSON.stringify(filterObj.networkCollection) : null,
                parentArchGroup: null,
                partnerName: filterObj.partnerName ? JSON.stringify(filterObj.partnerName) : null,
                productFamily: filterObj.productFamily ? JSON.stringify(filterObj.productFamily) : null,
                productName: filterObj.productName ? JSON.stringify(filterObj.productName) : null,
                productType: filterObj.productType ? JSON.stringify(filterObj.productType) : null,
                quarters: quarters ? quarters : null,
                quarterId: quarterId ? quarterId : null,
                refreshPropensity: filterObj.refreshPropensity ? filterObj.refreshPropensity : null,
                sales: filterObj.sales ? JSON.stringify(filterObj.sales) : null,
                segment: filterObj.segment ? JSON.stringify(filterObj.segment) : null,
                selectedSuite: filterObj.selectedSuite ? JSON.stringify(filterObj.selectedSuite) : null,
                selectedOppBySuite: filterObj.selectedOppBySuite ? JSON.stringify(filterObj.selectedOppBySuite) : null,
                sweeps: filterObj.sweep ? JSON.stringify(filterObj.sweep) : null,
                swssRenewType: filterObj.swssRenewType ? JSON.stringify(filterObj.swssRenewType) : null,
                ship: filterObj.ship ? JSON.stringify(filterObj.ship) : null,
                subArchitectureGroups: filterObj.subArchitectureGroups ? JSON.stringify(filterObj.subArchitectureGroups) : null,
                warrantyCategory: filterObj.warrantyCategory ? JSON.stringify(filterObj.warrantyCategory) : null,
                bookmarkName: isFromCE ? GlobalBookmarkServ.getBookmarkName() : null,
                dataset: filterObj.dataset ? JSON.stringify(filterObj.dataset) : null,
                assetType: (filterObj["customerReportTotalType"] && activeTab === "asset") ? JSON.stringify(filterObj["customerReportTotalType"]) : null,
                suite: filterObj["Suite"] ? JSON.stringify(filterObj["Suite"]) : null,
                productClassification: (filterObj["productClassification"] && activeTab === "asset") ? JSON.stringify(filterObj["productClassification"]) : null,
                globalView: CiscoUtilities.getGlobalParam(),
                appliedSales: filterObj["appliedSales"] ? filterObj["appliedSales"]: null,
                autoRenewal: CiscoUtilities.getAutoRenewal()
            };
        };

        opportunitiesServObj.getCustomerDetails = function (custDetails, filters, actManager, actName, architectureType, coverageFilter, contractList, networkFilter) {
            var deferred = $q.defer();
            var url;
            var apiPath;
            isFromCE = true;
            filters["customer"] = custDetails.state ? custDetails.state : custDetails.name;
            if (custDetails.subopportunity === "campaign") {
                apiPath = 'customer-detail-campaign';
            }
            else {
                apiPath = 'customer-detail';
            }
            if (custDetails.url === "apply") {
                url = getApiPath(apiPath) + "apply/" + custDetails.subTab;
            } else {
                url = getApiPath(apiPath) + custDetails.subTab;
            }


            if (custDetails.coverage !== undefined) {
                coverageFilter = custDetails.coverage;
            }

            if (custDetails.network !== undefined) {
                networkFilter = networkFilter;
            }

            var bookmarkFlag = false;
            if (custDetails.opportunity === 'refresh' && isBookmarkActive()) {
                bookmarkFlag = true;
            }

            apiDispatcher.post(url, {
                filters: opportunitiesServObj.getDataObj(filters, custDetails.opportunity, custDetails.subTab),
                globalShippedPeriod: custDetails.globalShippedPeriod ? custDetails.globalShippedPeriod : null,
                savmGroupId: custDetails.stateId ? custDetails.stateId : custDetails.savId,
                guid: custDetails.guID,
                customer: custDetails.state ? custDetails.state : custDetails.name,
                savContractNumber: contractList ? contractList : null,
                globalView: CiscoUtilities.getGlobalParam()
            }).then(function (response) {
                deferred.resolve(response);
            }, function (reason) {
                deferred.reject(reason);
            });

            return deferred.promise;
        };

        opportunitiesServObj.getTotalContracts = function (details, filters, actManager, actName, architectureType, coverageFilter, networkFilter) {
            var deferred = $q.defer();
            var url = getApiPath('total-contracts') + details.subTab;

            isFromCE = true;
            apiDispatcher.post(url, {
                savmGroupId: details.stateId ? details.stateId : details.savId,
                guid: details.guID,
                sales: JSON.stringify(filters["nodeName"]),
                accountManager: actManager ? actManager : null,
                accountName: actName ? actName : null,
                architecture: architectureType ? architectureType : null,
                customer: filters["customer"] ? filters["customer"] : null,
                customerName: filters["customerName"] ? filters["customerName"] : null,
                coverage: coverageFilter ? coverageFilter : null,
                network: networkFilter ? networkFilter : null,
                accountManagerName: filters.accounts ? JSON.stringify(filters.accounts) : null,
                segment: filters["segment"] ? filters["segment"] : null,
                installSite: filters["site"] ? filters["site"] : null,
                gvscsOrganisation: filters["gvscsOrganisation"] ? filters["gvscsOrganisation"] : null,
                contractType: filters.contractType ? filters.contractType : null,
                contractNumber: filters.contractNumber ? filters.contractNumber : null,
                serviceSO: filters.serviceSO ? filters.serviceSO : null,
                guName: filters.guName ? filters.guName : null,
                eos: !angular.equals({}, filters.eos) ? JSON.stringify(filters.eos) : null,
                ldos: !angular.equals({}, filters.ldos) ? JSON.stringify(filters.ldos) : null,
                ship: !angular.equals({}, filters.ship) ? JSON.stringify(filters.ship) : null,
                cled: !angular.equals({}, filters.cled) ? JSON.stringify(filters.cled) : null,
                partnerName: filters.partner ? filters.partner : null,
                country: filters["country"] ? filters["country"] : null,
                verticalMarket: filters.verticalMarket ? JSON.stringify(filters.verticalMarket) : null,
                refreshPropensity: filters["refreshPropensity"] ? filters["refreshPropensity"] : null,
                lowerAttachPropensity: filters["lowerAttachPropensity"] >= 0 ? filters["lowerAttachPropensity"] : null,
                higherAttachPropensity: filters["higherAttachPropensity"] >= 0 ? filters["higherAttachPropensity"] : null,
                networkCollection: filters["networkCollection"] ? filters["networkCollection"] : null,
                sweeps: filters["sweep"] ? filters["sweep"] : null,
                globalShippedPeriod: filters["globalShippedPeriod"] ? filters["globalShippedPeriod"] : null,
                architectureGroups: filters["architecture"] ? filters["architecture"] : null,
                subArchitectureGroups: filters["subArchitechture"] ? filters["subArchitechture"] : null,
                productType: filters["productType"] ? filters["productType"] : null,
                warrantyCategory: filters["warrantyCategory"] ? filters["warrantyCategory"] : null,
                productFamily: filters["productFamily"] ? filters["productFamily"] : null,
                productName: filters["productName"] ? filters["productName"] : null,
                activeKey: filters['activeKey'] ? JSON.stringify(filters['activeKey']) : null,
                quarterId: filters["quarterId"] ? filters["quarterId"]: null,
                bookmarkName: isFromCE ? GlobalBookmarkServ.getBookmarkName() : null,
                productClassification: filters["productClassification"] ? filters["productClassification"] : null,
                suite: filters["Suite"] ? filters["Suite"] : null,
                globalView: CiscoUtilities.getGlobalParam()
            }).then(function (response) {
                deferred.resolve(response);
            }, function (reason) {
                deferred.reject(reason);
            });

            return deferred.promise;
        };

        opportunitiesServObj.getBookmark = function (param) {
            var deferred = $q.defer();
            var url;
            if (param === 'favorite') {
                url = getApiPath('bookmark') + param + '&limit=5';
            }
            apiDispatcher.get(url).then(function (response) {
                deferred.resolve(response);
            }, function (reason) {
                deferred.reject(reason);
            });

            return deferred.promise;
        };


        opportunitiesServObj.getTechnologyForIb = function (details, filters, actManager, architectureType, coverageFilter, networkFilter) {
            var deferred = $q.defer();
            isFromCE = true;
            var url = getApiPath('technology-ib') + details.subTab;
            apiDispatcher.post(url, {
                savmGroupId: details.stateId ? details.stateId : details.savId,
                guid: details.guID,
                sales: JSON.stringify(filters["nodeName"]),
                accountManager: actManager ? actManager : null,
                architecture: architectureType ? architectureType : null,
                customer: details.name ? details.name : details.state,
                coverage: coverageFilter ? coverageFilter : null,
                network: networkFilter ? networkFilter : null,
                accountManagerName: filters.accounts ? JSON.stringify(filters.accounts) : null,
                segment: filters["segment"] ? filters["segment"] : null,
                installSite: filters["site"] ? filters["site"] : null,
                gvscsOrganisation: filters["gvscsOrganisation"] ? filters["gvscsOrganisation"] : null,
                contractType: filters.contractType ? filters.contractType : null,
                contractNumber: filters.contractNumber ? filters.contractNumber : null,
                serviceSO: filters.serviceSO ? filters.serviceSO : null,
                guName: filters.guName ? filters.guName : null,
                eos: !angular.equals({}, filters.eos) ? JSON.stringify(filters.eos) : null,
                ldos: !angular.equals({}, filters.ldos) ? JSON.stringify(filters.ldos) : null,
                ship: !angular.equals({}, filters.ship) ? JSON.stringify(filters.ship) : null,
                cled: !angular.equals({}, filters.cled) ? JSON.stringify(filters.cled) : null,
                partnerName: filters.partner ? filters.partner : null,
                country: filters["country"] ? filters["country"] : null,
                verticalMarket: filters["verticalMarket"] ? filters["verticalMarket"] : null,
                refreshPropensity: filters["refreshPropensity"] ? filters["refreshPropensity"] : null,
                lowerAttachPropensity: filters["lowerAttachPropensity"] >= 0 ? filters["lowerAttachPropensity"] : null,
                higherAttachPropensity: filters["higherAttachPropensity"] >= 0 ? filters["higherAttachPropensity"] : null,
                networkCollection: filters["networkCollection"] ? filters["networkCollection"] : null,
                sweeps: filters["sweep"] ? filters["sweep"] : null,
                globalShippedPeriod: filters["globalShippedPeriod"] ? filters["globalShippedPeriod"] : null,
                architectureGroups: filters["architecture"] ? filters["architecture"] : null,
                subArchitectureGroups: filters["subArchitechture"] ? filters["subArchitechture"] : null,
                productType: filters["productType"] ? filters["productType"] : null,
                warrantyCategory: filters["warrantyCategory"] ? filters["warrantyCategory"] : null,
                productFamily: filters["productFamily"] ? filters["productFamily"] : null,
                productName: filters["productName"] ? filters["productName"] : null,
                activeKey: filters['activeKey'] ? filters['activeKey'] : null,
                quarterId: filters["quarterId"] ? filters["quarterId"] : null,
                bookmarkName: isFromCE ? GlobalBookmarkServ.getBookmarkName() : null,
                productClassification: filters["productClassification"] ? filters["productClassification"] : null,
                suite: filters["Suite"] ? filters["Suite"] : null,
                globalView: CiscoUtilities.getGlobalParam()
            }).then(function (response) {
                deferred.resolve(response);
            }, function (reason) {
                deferred.reject(reason);
            });

            return deferred.promise;
        };


        opportunitiesServObj.getRefId = function (details, filters, actManager, architectureType, coverageFilter, networkFilter, uiToRestFilters) {
            var deferred = $q.defer();
            var url = getApiPath('ref-creation') + details.subTab;
            isFromCE = true;
            var allFilters = { 
                'filter': {
                    'uiFilters' : uiToRestFilters,
                    'hanaFilters' : {
                        savmGroupId: details.stateId ? details.stateId : details.savId,
                        guid: details.guID,
                        sales: JSON.stringify(filters["nodeName"]),
                        accountManager: actManager ? actManager : null,
                        architecture: architectureType ? architectureType : null,
                        customer: details.name ? details.name : details.state,
                        coverage: coverageFilter ? coverageFilter : null,
                        network: networkFilter ? networkFilter : null,
                        accountManagerName: filters.accounts ? JSON.stringify(filters.accounts) : null,
                        segment: filters["segment"] ? filters["segment"] : null,
                        installSite: filters["site"] ? filters["site"] : null,
                        gvscsOrganisation: filters["gvscsOrganisation"] ? filters["gvscsOrganisation"] : null,
                        contractType: filters.contractType?filters.contractType:null,
                        contractNumber: filters.contractNumber?filters.contractNumber:null,
                        serviceSO: filters.serviceSO ? filters.serviceSO : null,
                        guName: filters.guName?filters.guName:null,
                        eos: !angular.equals({}, filters.eos) ? JSON.stringify(filters.eos): null,
                        ldos: !angular.equals({}, filters.ldos) ? JSON.stringify(filters.ldos) : null,
                        ship: !angular.equals({}, filters.ship) ? JSON.stringify(filters.ship) : null,
                        cled: !angular.equals({},filters.cled) ? JSON.stringify(filters.cled) : null,
                        partnerName: filters.partner ? filters.partner : null,
                        country: filters["country"] ? filters["country"] : null,
                        verticalMarket: filters["verticalMarket"] ? filters["verticalMarket"] : null,
                        refreshPropensity: filters["refreshPropensity"] ? filters["refreshPropensity"] : null,
                        lowerAttachPropensity: filters["lowerAttachPropensity"] >= 0 ? filters["lowerAttachPropensity"] : null,
                        higherAttachPropensity: filters["higherAttachPropensity"] >= 0 ? filters["higherAttachPropensity"] : null,
                        networkCollection : filters["networkCollection"] ? filters["networkCollection"] : null,
                        sweeps : filters["sweeps"] ? filters["sweeps"] : null,
                        globalShippedPeriod: filters["globalShippedPeriod"] ? filters["globalShippedPeriod"] : null,
                        architectureGroups: filters["architecture"] ? filters["architecture"] : null,
                        subArchitectureGroups: filters["subArchitechture"] ? filters["subArchitechture"] : null,
                        productType: filters["productType"] ? filters["productType"] : null,
                        warrantyCategory: filters["warrantyCategory"] ? filters["warrantyCategory"] : null,
                        productFamily: filters["productFamily"] ? filters["productFamily"] : null,
                        productName: filters["productName"] ? filters["productName"] : null,
                        activeKey : filters['activeKey'] ? filters['activeKey'] : null,
                        quarterId: filters["quarterId"] ? filters["quarterId"] : null,
                        bookmarkName: isFromCE ? GlobalBookmarkServ.getBookmarkName() : null,
                        suite: filters["Suite"] ?  filters["Suite"] : null,
                        productClassification: filters["productClassification"] ? filters["productClassification"] : null,
                        globalView : CiscoUtilities.getGlobalParam()
                    }
                }
            }
            apiDispatcher.post(url, allFilters).then(function(response) {
                deferred.resolve(response);
            }, function (reason) {
                deferred.reject(reason);
            });

            return deferred.promise;
        };


        opportunitiesServObj.createOpportunity = function (details, accounts, filters, actManager, architectureType, coverageFilter, networkFilter, contractList) {
            var deferred = $q.defer();
            if (details.optyStage === '1 - Prospect') {
                details.forecastStatus = 'Not Forecastable';
            }
            if (details.optyServiceAmount === 0) {
                details.services = [];
            }
            if (details.optyProductAmount === 0) {
                details.products = [];
            }
            isFromCE = true;
            var url = getApiPath('create-opp') + details.subTab;
            apiDispatcher.post(url, {
                forecastCloseDate: details.foreCastDate,
                description: details.description,
                partnerRequired: "false",
                sourceRefId: details.sourceRefId,
                forecastStatus: details.forecastStatus,
                ownerId: details.sfdcId,
                optyProductAmount: details.optyProductAmount,
                optyName: details.optyName,
                products: details.products,
                salesAgent: details.salesAgent,
                optyInstallBase: details.optyInstallBase,
                serviceSource: details.serviceSource,
                sourceSystemId: "CE",
                services: details.services,
                optyStatus: "Active",
                requestor: details.requestor,
                accountId: details.accountId,
                optyServiceAmount: details.optyServiceAmount,
                forecastPosition: details.forecastingPos,
                optyStage: details.optyStage,
                hanaDetails: {
                    savmGroupId: accounts.stateId ? accounts.stateId : accounts.savId,
                    guid: accounts.guID,
                    sales: JSON.stringify(filters["nodeName"]),
                    accountManager: actManager ? actManager : null,
                    architecture: architectureType ? architectureType : null,
                    customer: accounts.name ? accounts.name : accounts.state,
                    coverage: coverageFilter ? coverageFilter : null,
                    contractNo: contractList ? contractList : null,
                    accountManagerName: filters.accounts ? JSON.stringify(filters.accounts) : null,
                    segment: filters["segment"] ? filters["segment"] : null,
                    installSite: filters["site"] ? JSON.stringify(filters["site"]) : null,
                    gvscsOrganisation: filters["gvscsOrganisation"] ? filters["gvscsOrganisation"] : null,
                    contractType: filters.contractType ? filters.contractType : null,
                    contractNumber: filters.contractNumber ? filters.contractNumber : null,
                    serviceSO: filters.serviceSO ? filters.serviceSO : null,
                    guName: filters.guName ? filters.guName : null,
                    eos: !angular.equals({}, filters.eos) ? JSON.stringify(filters.eos) : null,
                    ldos: !angular.equals({}, filters.ldos) ? JSON.stringify(filters.ldos) : null,
                    ship: !angular.equals({}, filters.ship) ? JSON.stringify(filters.ship) : null,
                    cled: !angular.equals({}, filters.cled) ? JSON.stringify(filters.cled) : null,
                    partnerName: filters.partner ? filters.partner : null,
                    country: filters["country"] ? filters["country"] : null,
                    verticalMarket: filters["verticalMarket"] ? filters["verticalMarket"] : null,
                    refreshPropensity: filters["refreshPropensity"] ? JSON.stringify(filters["refreshPropensity"]) : null,
                    lowerAttachPropensity: filters["lowerAttachPropensity"] >= 0 ? filters["lowerAttachPropensity"] : null,
                    higherAttachPropensity: filters["higherAttachPropensity"] >= 0 ? filters["higherAttachPropensity"] : null,
                    networkCollection: filters["networkCollection"] ? filters["networkCollection"] : null,
                    globalShippedPeriod: filters["globalShippedPeriod"] ? filters["globalShippedPeriod"] : null,
                    architectureGroups: filters["architecture"] ? JSON.stringify(filters["architecture"]) : null,
                    subArchitectureGroups: filters["subArchitechture"] ? JSON.stringify(filters["subArchitechture"]) : null,
                    productType: filters["productType"] ? JSON.stringify(filters["productType"]) : null,
                    warrantyCategory: filters["warrantyCategory"] ? JSON.stringify(filters["warrantyCategory"]) : null,
                    productFamily: filters["productFamily"] ? JSON.stringify(filters["productFamily"]) : null,
                    productName: filters["productName"] ? JSON.stringify(filters["productName"]) : null,
                    activeKey: filters['activeKey'] ? filters['activeKey'] : null,
                    quarterId: filters["quarterId"] ? filters["quarterId"] : null,
                    bookmarkName: isFromCE ? GlobalBookmarkServ.getBookmarkName() : null,
                    productClassification: filters["productClassification"] ? filters["productClassification"] : null,
                    suite: filters["Suite"] ? filters["Suite"] : null,
                    globalView: CiscoUtilities.getGlobalParam()
                }
            }).then(function (response) {
                deferred.resolve(response);
            }, function (reason) {
                deferred.reject(reason);
            });

            return deferred.promise;
        };

        //The function can be called withing other functions using this check line number 723 and 727 -G
        //Made some name changes according to names in advancedFilterObj in controller - NM
        opportunitiesServObj.getDataObj = function (filters, activeTab, activeSubTab) {
            if(filters.partner && angular.isArray(filters.partner)){
                filters.partner = JSON.stringify(filters.partner);
            }
            return {
                suite: filters["Suite"] ? filters["Suite"] : null,
                parentArchGroup: filters.subArch ? filters.subArch : null,
                nodeName: JSON.stringify(filters["nodeName"]),
                accountManagerName: filters.accounts ? JSON.stringify(filters.accounts) : null,
                segment: filters["segment"] ? filters["segment"] : null,
                installSite: filters["installSite"] ? filters["installSite"] : null,
                gvscsOrganisation: filters["gvscsOrganisation"] ? filters["gvscsOrganisation"] : null,
                //accountName: filters.accountName ? filters.accountName : null,
                contractType: filters.contractType ? filters.contractType : null,
                contractNumber: filters.contractNumber ? filters.contractNumber : null,
                serviceSO: filters.serviceSO ? filters.serviceSO : null,
                guName: filters.guName ? filters.guName : null,
                eos: (activeSubTab !== "as" && !angular.equals({}, filters.eos)) ? JSON.stringify(filters.eos) : null,
                ldos: (activeSubTab !== "as" && !angular.equals({}, filters.ldos)) ? JSON.stringify(filters.ldos) : null,
                ship: (activeSubTab !== "as" && !angular.equals({}, filters.ship)) ? JSON.stringify(filters.ship) : null,
                cled: (activeSubTab !== "as" && !angular.equals({}, filters.cled)) ? JSON.stringify(filters.cled) : null,
                partnerName: filters.partner ? filters.partner : null,
                country: filters["country"] ? filters["country"] : null,
                verticalMarket: filters["verticalMarket"] ? filters["verticalMarket"] : null,
                customer: filters["customer"] ? filters["customer"] : null,
                customerName: filters["customerName"] ? filters["customerName"] : null,
                //bookmarkFlag : bookmarkFlag ? bookmarkFlag : null,
                refreshPropensity: filters["refreshPropensity"] ? filters["refreshPropensity"] : null,
                lowerAttachPropensity: filters["lowerAttachPropensity"] >= 0 ? filters["lowerAttachPropensity"] : null,
                higherAttachPropensity: filters["higherAttachPropensity"] >= 0 ? filters["higherAttachPropensity"] : null,
                coverage: (activeSubTab !== "as" && filters["coverage"]) ? filters["coverage"] : null,
                networkCollection: (activeSubTab !== "as" && filters["networkCollection"]) ? filters["networkCollection"] : null,
                sweeps: filters["sweep"] ? filters["sweep"] : null,
                globalShippedPeriod: filters["globalShippedPeriod"] ? filters["globalShippedPeriod"] : null,
                architectureGroups: (activeSubTab !== "as" && filters["architectureGroups"]) ? filters["architectureGroups"] : null,
                subArchitectureGroups: (activeSubTab !== "as" && filters["subArchitectureGroups"]) ? filters["subArchitectureGroups"] : null,
                productType: (activeSubTab !== "as" && filters["productType"]) ? filters["productType"] : null,
                warrantyCategory: (activeSubTab !== "as" && filters["warrantyCategory"]) ? filters["warrantyCategory"] : null,
                productFamily: filters["productFamily"] ? filters["productFamily"] : null,
                productName: filters["productName"] ? filters["productName"] : null,
                //activeKey: filters["activeKey"] ? filters["activeKey"] : null, // changes for DE135340
                quarterId: filters["quarterId"] ? filters["quarterId"] : null,
                quarters: filters.quarterIdValues ? filters.quarterIdValues : null,
                activeKey: (activeTab !== 'asset' && filters["activeKey"]) ? filters["activeKey"] : null,
                bookmarkFlag: filters.bookmarkFlag ? filters.bookmarkFlag : null,
                bookmarkName: isFromCE ? GlobalBookmarkServ.getBookmarkName() : null,
                hasSuite: filters.hasSuite ? filters.hasSuite : false,
                dataset: filters.dataset ? JSON.stringify(filters.dataset) : null,
                assetType: (activeTab === 'asset' && filters["activeKey"]) ? filters["activeKey"] : null,
                // dataForDuration: filters.dataForDuration ? filters.dataForDuration : null
                globalView: CiscoUtilities.getGlobalParam(),
                productClassification: filters["productClassification"] ? filters["productClassification"] : null,
                appliedSales: filters["appliedSales"] ? filters["appliedSales"] : null,
                minLevel: (['asset', 'subscr_security', 'subscr_collaboration', 'subscr_other'].includes(activeTab) && filters["minLevel"]) ? filters["minLevel"] : 0,
                amYorn: (['asset', 'subscr_security', 'subscr_collaboration', 'subscr_other'].includes(activeTab) && CiscoUtilities.getAmYorn()) ? CiscoUtilities.getAmYorn() : null,
                autoRenewal: CiscoUtilities.getAutoRenewal()
            }
        }





        opportunitiesServObj.getCiscoOneMCR = function (campaignId, filters, subArch, addUpgradeValue) {
            var deferred = $q.defer();
            var ciscoOneURL = '';
            var apiPath;

            if (campaignId === 'drs') {
                if (filters) {
                    filters.name = campaignId;
                } else {
                    filters = {
                        name: campaignId
                    };
                }
            } else {
                ciscoOneURL = 'ciscoOne';
            }
            apiPath = getApiPath('ciscoOne-mcr');
            filters.subArch = subArch;
            apiDispatcher.post(apiPath, {
                "filters": opportunitiesServObj.getDataObj(filters),
                c1opportunityType: addUpgradeValue ? addUpgradeValue : null
            }).then(function (response) {
                deferred.resolve(response);
            }, function (reason) {
                deferred.reject(reason);
            });
            return deferred.promise;

        }

        opportunitiesServObj.getLogoutSuccess = function () {

            var deferred = $q.defer();
            var url = getApiPath('logout-url');

            apiDispatcher.get(url).then(function (response) {

                deferred.resolve(response);
            }, function (reason) {
                deferred.reject(reason);
            });
            return deferred.promise;

        }

        return opportunitiesServObj;
    }
]);
