/*jshint sub:true*/
'use strict';
angular.module('ciscoExecDashApp').service('PerformanceServ', [
    '$resource',
     'RestUri',
     '$q',
     'ApiDispatcher',
     'ConfigServ',
     '$translate',
     'GlobalBookmarkServ',
    function ($resource, restUri, $q, apiDispatcher, configServ, $translate, GlobalBookmarkServ) {
        var performanceServObj = {};
        var performanceApiResponseCache = {};
        var salesNodeName = "";
        var isBookmarkActive = GlobalBookmarkServ.isBookmarkActive;
        var resetDataset = false;
        if(isBookmarkActive === undefined){
            isBookmarkActive = false;
        }
        var subTabApiMap = {
            "refresh": {
                "ship": "refresh_shipment",
                "eos": "refresh_eos",
                "ldos": "refresh_ldos",
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

        var getApiPath = function (key, slug) {
            if (!key) {
                key = 'performance';
            }
            var apiPath = restUri.getUri(key);
            return apiPath;
        };

        performanceServObj.getDataset = function (value) {
            resetDataset = value;
        };

        performanceServObj.getQuarter = function(value){
            return getQuarter(value);
        };

        var getQuarter = function(renewalRate) {
            var uniqueQuarter = [];
            for (var i=0; i < renewalRate.length; i++) {
                uniqueQuarter.push(renewalRate[i].state);
                if (renewalRate[i].state === configServ.currentQuarter) {
                    break;
                }
            }
            return uniqueQuarter;
        };

        var fillEnvelope = function (slug, response, drill) {
            var dataset;
            if (resetDataset) {
                // if(Object.getOwnPropertyNames(performanceApiResponseCache).length > 0){
                //   if(angular.isDefined(performanceApiResponseCache[slug][0])){
                //     if(performanceApiResponseCache[slug][0].expanded === 1){
                //         configServ.performanceData[slug][0].expanded = 1;                       
                //     }
                // }   
                // }
                dataset = angular.copy(configServ.performanceData[slug]);
                resetDataset = false;
            } else {
                dataset = performanceApiResponseCache[slug] || null;
                if(dataset !== null){
                    if(dataset[0].activeCategory === undefined){
                        dataset[0].activeCategory = 0;
                    }
                    //not to reset the type when drilled down to Renewal rate progression chart on clicking some bar in 1st chart and when trying to change the category in 3rd chart
                    if(dataset[0].types && dataset[0].title !== 'Renewal Rate Progression - Quarterly Comparison'){
                    dataset[0].type = dataset[0].types[dataset[0].activeCategory];
                  } 
                }
        // change for DE183037
                if((slug === 'tsRenew' || slug === 'totalRenew' || slug === 'swssRenew') && (angular.isDefined(dataset) && dataset !== null)){
                    if(dataset[0].activeCategory === 0 && dataset[0].type === 'bar'){
                        if(dataset[0]['data-key'] !== 'inQuarterRenewalRate'){
                            dataset[0]['data-key'] = 'inQuarterRenewalRate';
                        }
                    }
                }
            }

            if (drill==='toggle') {
                dataset[0]['data-key'] = configServ.performanceData["tsRenewDrill"][0]['data-key'];
                //dataset[0].rr_categories = getQuarter(response.totalRenewalRateProgression);
                dataset[0].keys = configServ.performanceData["tsRenewDrill"][0]['keys'];
            }

            if (drill === 'drillRenewToProgression') {
                dataset[0].title = configServ.performanceData["tsRenewDrill"][0].title;
                dataset[0].type = configServ.performanceData["tsRenewDrill"][0].type;
                dataset[0].keys = configServ.performanceData["tsRenewDrill"][0].keys;
                dataset[0]['data-key'] = configServ.performanceData["tsRenewDrill"][0]['data-key'];
                dataset[0].categories = [];
                dataset[0].rr_categories = getQuarter(response.totalRenewalRateProgression);
            }
            if(dataset && dataset[2].activeCategory!==1){
               /* if(dataset[0]["data-key"]==="bookingsBySalesLevel"){
                    dataset[0].rr_categories = getQuarter(response.totalRenewalRateProgression);
                }*/
                if(dataset[0].activeCategory===1 && dataset[0].categories[dataset[0].activeCategory].indexOf("Rate Progression - Quarterly Comparison")!==-1){
                    dataset[0].rr_categories = getQuarter(response.totalRenewalRateProgression);
                }
                
            }
            

            if (!dataset) {
                dataset = angular.copy(configServ.performanceData[slug]);
            }

                if (!dataset) {
                    dataset = angular.copy(configServ.performanceData[slug]);
                }
                for (var i = 0; i < dataset.length; i++) {

                    var key = dataset[i]["data-key"];
                    if (response.spc !== undefined && i===2) {
                        key = "spc";
                    }

                    if (dataset[i].title.length === 0) {
                        dataset[i].title = $translate.instant("performance." + slug + "." + dataset[i]["e-key"] + ".title");
                    }

                      if (dataset[i].description && dataset[i].description.length === 0) {
                        dataset[i].description = $translate.instant("performance." + slug + "." + dataset[i]["e-key"] + ".description");
                    }

                   else { (dataset[i].description && dataset[i].description.length === 0)
                           dataset[i].description = $translate.instant("performance." + slug + "." + dataset[i]["e-key"] + ".tooltip");
                     }
                     if ((key === 'annualMultiYearAndBreakdown' && slug === 'asRenew') || (key === 'realizationAndConversionRates' && slug === 'asRenew')) {
                         dataset[i]['descriptions'] = [];
                         dataset[i].descriptions.push($translate.instant("performance." + slug + "." + dataset[i]["e-key"] + ".Renewals"));
                         dataset[i].descriptions.push($translate.instant("performance." + slug + "." + dataset[i]["e-key"] + ".Breakdown"));
                 }


                    if (dataset[i].type === "line") {
                        dataset[i].currentQuarter = configServ.currentQuarter;
                    }

                    if (dataset[i].type === "bar_stacked") {
                        dataset[i].currentQuarter = configServ.currentQuarter;
                        dataset[i].currentMonth = configServ.currentMonth;
                    }

                    if (dataset[i]["data-custom-func"] === "renew") {
                        if (key === "spc") {
                            dataset[i].data[dataset[i].activeCategory] = angular.copy(response[key].customer);
                        } else if (key === "renewalBookingsByQuarter" && response[key] !== undefined){
                            dataset[i].data[0] = angular.copy(response[key]);
                        }
                        else if(key === "realizationAndConversionRates" && response[key] !== undefined)
                        {
                           dataset[i].data = angular.copy(response[key]); //Adding this condition to fill data in third chart.- NM
                        }
                    } else if (dataset[i]["data-custom-func"] === "attach-perf-benchmark") {
                        if (response[key] !== undefined) {
                            if(dataset[i].type === "line_chart_rr"){
                                dataset[i].data_set = response[key];
                                dataset[i].rr_categories = getQuarter(response[key]);
                                dataset[i].rr_keys = ["Services Sold", "Total Services"];
                             if(Object.getOwnPropertyNames(performanceApiResponseCache).length > 0){
                                if(angular.isDefined(performanceApiResponseCache[slug]) && angular.isDefined(performanceApiResponseCache[slug][i])){
                                    if(performanceApiResponseCache[slug][i].expanded === 1){
                                       dataset[i].expanded = 1;
                                    }
                                }
                             }
                                
                                
                            }
                            if (!response.isCustomer) {
                                if(response.isSquare !== undefined && response.isSquare) {
                                    dataset[i].data[1] = angular.copy(response[key]);
                                } else {
                                    dataset[i].data[0] = angular.copy(response[key]);
                                }
                            } else {
                                if(response.isSquare !== undefined && response.isSquare) {
                                    dataset[i].data[2] = angular.copy(response[key]);
                                } else {
                                    dataset[i].data[1] = angular.copy(response[key]);
                                }
                            }
                        }

                    } else if (angular.isArray(response[key])) {
                        if(dataset[i].type === "line_chart_rr"){
                            dataset[i].data_set = response[key];
                            if(slug === 'totalRenew' || slug === 'tsRenew' || slug === 'swssRenew'){
                                dataset[i].rr_keys = ["Services Renewed","Total Renewal opportunity"];
                            }
                             if(Object.getOwnPropertyNames(performanceApiResponseCache).length > 0){
                                if(angular.isDefined(performanceApiResponseCache[slug]) && angular.isDefined(performanceApiResponseCache[slug][i])){
                                    if(performanceApiResponseCache[slug][i].expanded === 1){
                                       dataset[i].expanded = 1;
                                    }
                                }
                             }                        } else if(dataset[i].type === "line" && key === "attachPerfByArch"){
                            dataset[i].data = response[key][0];
                        } else if(dataset[i].type === "line" && key === "swssRenewPerfByArch"){
                            dataset[i].data = response[key]; // Response is copied wrongly
                        }else if(dataset[i].type === "bar_stacked" && key === "atachPerfByType"){
                            dataset[i].data = response[key][0];
                        } else if (dataset[i].type === "line" && key === "inQuarterRenewalRate") {
                            dataset[i].data[dataset[i].activeCategory] = response[key];
                        } else {
                            dataset[i].data = response[key];
                            if(Object.getOwnPropertyNames(performanceApiResponseCache).length > 0){
                               if(angular.isDefined(performanceApiResponseCache[slug]) && angular.isDefined(performanceApiResponseCache[slug][i])){
                                    if(performanceApiResponseCache[slug][i].expanded === 1){
                                       dataset[i].expanded = 1;
                                    }
                                }
                             } 
                        }
                    } else {
                        if (slug==="tsAttach") {
                            if (response[key]!==undefined){
                                if(dataset[i].type === "line_chart_rr"){
                                    dataset[i].data_set = response[key];
                                    dataset[i].rr_categories = getQuarter(response[key]);
                                    dataset[i].rr_keys = ["Services Sold", "Total Services"];
                                     if(Object.getOwnPropertyNames(performanceApiResponseCache).length > 0){
                                       if(angular.isDefined(performanceApiResponseCache[slug]) && angular.isDefined(performanceApiResponseCache[slug][i])){
                                            if(performanceApiResponseCache[slug][i].expanded === 1){
                                               dataset[i].expanded = 1;
                                            }
                                        }
                                     }
                                }else{
                                    dataset[i].data = response[key].data;
                                }
                                if (dataset[i].type === 'line') {
                                    dataset[i].data = response[key].data;
                                    dataset[i].data_net = response[key].data_net;
                                }
                                if(dataset[i].type === 'bar_target'){
                                    dataset[i].data_net = response[key].data_net;
                                    dataset[i].data = response[key].data;

                                }
                                if (response[key]!==undefined && dataset[i].type!=='line'){
                                dataset[i].data_net = response[key].data_net;
                                }
                                if(dataset[i].type === 'bar' && key === "corporateAttachRate"){
                                    dataset[i].data = response[key].data[0];
                                    dataset[i].data_net = response[key].data_net[0];
                                }
                                /*if (dataset[0].type === 'line') {
                                    dataset[i].data[2] = response[key].data[0];
                                } else {
                                    dataset[i].data = response[key].data[0];
                                }
                                if (response[key]!==undefined && dataset[i].type!=='line'){
                                    dataset[i].data_net = response[key].data_net[0];
                                }*/
                            }
                        }
                         if ((slug==="swssAttach") || (slug==="totalAttach")) {
                             if (response[key]!==undefined){
                                if(dataset[i].type === "line_chart_rr"){
                                    dataset[i].data_set = response[key];
                                    dataset[i].rr_categories = getQuarter(response[key]);
                                    dataset[i].rr_keys = ["Services Sold", "Total Services"];
                                    if(Object.getOwnPropertyNames(performanceApiResponseCache).length > 0){
                                            if(angular.isDefined(performanceApiResponseCache[slug]) && angular.isDefined(performanceApiResponseCache[slug][i])){
                                                if(performanceApiResponseCache[slug][i].expanded === 1){
                                                   dataset[i].expanded = 1;
                                                }
                                            }
                                         }
                                }else{
                                    dataset[i].data = response[key].data[0];
                                }
                                if (dataset[i].type === 'line') {
                                    dataset[i].data = response[key].data;
                                    dataset[i].data_net = response[key].data_net;
                                }
                                if(dataset[i].type === 'bar_target'){
                                    dataset[i].data_net = response[key].data_net;
                                    dataset[i].data = response[key].data;

                                }
                                if (response[key]!==undefined && dataset[i].type!=='line'){
                                dataset[i].data_net = response[key].data_net;
                                }
                                 if(dataset[i].type === 'bar' && key === "corporateAttachRate"){
                                    dataset[i].data = response[key].data[0];
                                    dataset[i].data_net = response[key].data_net[0];
                                }
                                /*if (dataset[0].type === 'line') {
                                    dataset[i].data[2] = response[key].data[0];
                                } else {
                                    dataset[i].data = response[key].data[0];
                                }
                                if (response[key]!==undefined && dataset[i].type!=='line'){
                                    dataset[i].data_net = response[key].data_net[0];
                                }*/
                            }
                        }
                    }
                }
            //}
            performanceApiResponseCache[slug] = dataset;
            return dataset;
        };

        performanceServObj.getPerformanceData = function (slug, filters, subTab, subArch, isCust,drillRenewToProgression) {
            salesNodeName = angular.isArray(filters["nodeName"]) && filters["nodeName"].length === 0 ? "All Nodes" : filters["nodeName"];
            var deferred = $q.defer();
            if (subTab && subTab.length > 0) {
                var subSlug = subTabApiMap[slug][subTab];
                if (subSlug) {
                    slug = subSlug;
                }
            }
            var bookmarkFlag = false;
            if ((slug.indexOf('refresh') > -1) && isBookmarkActive()) {
                bookmarkFlag = true;
            }
            var url;
            if (!isCust) {
                if(slug === 'tsAttach' || slug==='swssAttach'){
                   url = getApiPath('performance') + slug + '/updated';
                    if(filters["nodeName"] !== undefined && filters["nodeName"].length > 0){
                        var nodePerf = [];
                        nodePerf.push(filters["nodeName"]);
                        filters["nodeName"] = nodePerf;
                    }
                }else{
                    url = getApiPath('performance') + slug;
                }
            }
            if (isCust) {
                if (slug==='tsAttach') {
                    url = getApiPath('performance') + slug + '/bookingsByCustomers';
                }else if(slug==='tsRenew'){
                    url = getApiPath('performance') + slug ; //elseIf added by Shankar. DE132565
                }
                //1st graph is going blank if we change the 3rd chart to customer in Total Renew - Perf page
                /*else if(slug === 'totalRenew'){
                    url = getApiPath('performance') + slug; // to make a proper api call when tried to change the category in 1st chart when we are in customers in 3rd chart in total renew performance
                }*/
                else if(slug==='swssRenew'){
                    url =getApiPath('performance') + slug ;
                }
                else {
                    url = getApiPath('performance') + slug + '/spc/customer';
                }
            }
            if (isCust === undefined) {
                if (slug === 'tsAttach') {
                    url = getApiPath('attach-performance')
                } else {
                    url = getApiPath('performance') + slug;
                }
            }
            apiDispatcher.post(url,{
                nodeName: filters["nodeName"],
                accountManagerName: filters.accounts ? JSON.stringify(filters.accounts) : null,
                segment: filters["segment"] ? filters["segment"] : null,
                installSite: filters["installSite"] ? filters["installSite"] : null,
                gvscsOrganisation: filters["gvscsOrganisation"] ? filters["gvscsOrganisation"] : null,
                //accountName: filters.accountName ? filters.accountName : null,
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
                bookmarkFlag : bookmarkFlag ? bookmarkFlag : null,
                refreshPropensity: filters["refreshPropensity"] ? filters["refreshPropensity"] : null,
                lowerAttachPropensity: filters["lowerAttachPropensity"] >= 0 ? filters["lowerAttachPropensity"] : null,
                higherAttachPropensity: filters["higherAttachPropensity"] >= 0 ? filters["higherAttachPropensity"] : null,
                coverage: filters["coverage"] ? filters["coverage"] : null,
                networkCollection : filters["networkCollection"] ? filters["networkCollection"] : null,
                globalShippedPeriod: filters["globalShippedPeriod"] ? filters["globalShippedPeriod"] : null,
                architectureGroups: filters["architectureGroups"] ? filters["architectureGroups"] : null,
                subArchitectureGroups: filters["subArchitectureGroups"] ? filters["subArchitectureGroups"] : null,
                productType: filters["productType"] ? filters["productType"] : null,
                warrantyCategory: filters["warrantyCategory"] ? filters["warrantyCategory"] : null,
                productFamily: filters["productFamily"] ? filters["productFamily"] : null,
                productName: filters["productName"] ? filters["productName"] : null,
                parentArchGroup: subArch ? subArch : null,
                 bookmarkName: GlobalBookmarkServ.getBookmarkName(),
                 parentNode: filters["parentNode"] ? filters["parentNode"] : null
            }).then(function (response) {
                if(drillRenewToProgression){
                    deferred.resolve(fillEnvelope(slug, response, 'drillRenewToProgression'));
                }
                else
                deferred.resolve(fillEnvelope(slug, response));
            }, function (reason) {
                deferred.reject(reason);
            });
            return deferred.promise;
        };


        performanceServObj.getRenewDrillData = function (slug, filters, subTab, subArch, toggle) {
            salesNodeName = angular.isArray(filters["nodeName"]) && filters["nodeName"].length === 0 ? "All Nodes" : filters["nodeName"];
            var deferred = $q.defer();
            if (subTab && subTab.length > 0) {
                var subSlug = subTabApiMap[slug][subTab];
                if (subSlug) {
                    slug = subSlug;
                }
            }
                var url;
                //change to point to correct url after enabling the performance in total renew
                if(slug === 'totalRenew'){
                    url= 'total-in-quarter-renewal-rate';
                }
                if(slug === 'tsRenew'){
                url= 'ts-in-quarter-renewal-rate';
            }
                if(slug === 'swssRenew'){
                url= 'swss-in-quarter-renewal-rate';
            }
            apiDispatcher.post(getApiPath(url),{
                nodeName: JSON.stringify(filters["nodeName"]),
                accountManagerName: filters.accounts ? JSON.stringify(filters.accounts) : null,
                segment: filters["segment"] ? filters["segment"] : null,
                installSite: filters["installSite"] ? filters["installSite"] : null,
                gvscsOrganisation: filters["gvscsOrganisation"] ? filters["gvscsOrganisation"] : null,
                //accountName: filters.accountName ? filters.accountName : null,
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
                refreshPropensity: filters["refreshPropensity"] ? filters["refreshPropensity"] : null,
                lowerAttachPropensity: filters["lowerAttachPropensity"] >= 0 ? filters["lowerAttachPropensity"] : null,
                higherAttachPropensity: filters["higherAttachPropensity"] >= 0 ? filters["higherAttachPropensity"] : null,
                coverage: filters["coverage"] ? filters["coverage"] : null,
                networkCollection : filters["networkCollection"] ? filters["networkCollection"] : null,
                globalShippedPeriod: filters["globalShippedPeriod"] ? filters["globalShippedPeriod"] : null,
                architectureGroups: filters["architectureGroups"] ? filters["architectureGroups"] : null,
                subArchitectureGroups: filters["subArchitectureGroups"] ? filters["subArchitectureGroups"] : null,
                productType: filters["productType"] ? filters["productType"] : null,
                warrantyCategory: filters["warrantyCategory"] ? filters["warrantyCategory"] : null,
                productFamily: filters["productFamily"] ? filters["productFamily"] : null,
                productName: filters["productName"] ? filters["productName"] : null,
                parentArchGroup: subArch ? subArch : null,
                 bookmarkName: GlobalBookmarkServ.getBookmarkName(),
                suite:  ( slug === 'asset' || slug === "ciscoOne") && filters["Suite"] ?  filters["Suite"] : null,
                productClassification: filters["productClassification"] ? filters["productClassification"] : null,
                parentNode: filters["parentNode"] ? filters["parentNode"] : null
            }).then(function (response) {
                if (toggle) {
                    deferred.resolve(fillEnvelope(slug, response, 'toggle'));
                } else {
                    deferred.resolve(fillEnvelope(slug, response, 'tsRenewDrill'));
                }
            }, function (reason) {
                deferred.reject(reason);
            });
            return deferred.promise;
        };

        performanceServObj.getRenewalBySalesLevel = function (slug, filters, subTab, subArch) {
            salesNodeName = angular.isArray(filters["nodeName"]) && filters["nodeName"].length === 0 ? "All Nodes" : filters["nodeName"];
            var deferred = $q.defer();
            if (subTab && subTab.length > 0) {
                var subSlug = subTabApiMap[slug][subTab];
                if (subSlug) {
                    slug = subSlug;
                }
            }
            var url;
            //change to point to correct url after enabling the performance in total renew
            if(slug==='totalRenew'){
            url= 'total-rate-by-sales';
            }
            if(slug==='tsRenew'){
            url= 'rate-by-sales';
            }
            if(slug==='swssRenew') {
            url= 'swss-rate-by-sales';
            }
            apiDispatcher.post(getApiPath(url), {
                nodeName: JSON.stringify(filters["nodeName"]),
                accountManagerName: filters.accounts ? JSON.stringify(filters.accounts) : null,
                segment: filters["segment"] ? filters["segment"] : null,
                installSite: filters["installSite"] ? filters["installSite"] : null,
                gvscsOrganisation: filters["gvscsOrganisation"] ? filters["gvscsOrganisation"] : null,
                contractType: filters.contractType?filters.contractType:null,
                contractNumber: filters.contractNumber?filters.contractNumber:null,
                serviceSO: filters.serviceSO?filters.serviceSO:null,
                guName: filters.guName?filters.guName:null,
                //accountName: filters.accountName ? filters.accountName : null,
                eos: !angular.equals({}, filters.eos) ? JSON.stringify(filters.eos): null,
                ldos: !angular.equals({}, filters.ldos) ? JSON.stringify(filters.ldos) : null,
                ship: !angular.equals({}, filters.ship) ? JSON.stringify(filters.ship) : null,
                cled: !angular.equals({},filters.cled) ? JSON.stringify(filters.cled) : null,
                partnerName: filters.partner ? filters.partner : null,
                country: filters["country"] ? filters["country"] : null,
                verticalMarket: filters["verticalMarket"] ? filters["verticalMarket"] : null,
                customer: filters["customer"] ? filters["customer"] : null,
                refreshPropensity: filters["refreshPropensity"] ? filters["refreshPropensity"] : null,
                lowerAttachPropensity: filters["lowerAttachPropensity"] >= 0 ? filters["lowerAttachPropensity"] : null,
                higherAttachPropensity: filters["higherAttachPropensity"] >= 0 ? filters["higherAttachPropensity"] : null,
                coverage: filters["coverage"] ? filters["coverage"] : null,
                networkCollection : filters["networkCollection"] ? filters["networkCollection"] : null,
                globalShippedPeriod: filters["globalShippedPeriod"] ? filters["globalShippedPeriod"] : null,
                architectureGroups: filters["architectureGroups"] ? filters["architectureGroups"] : null,
                subArchitectureGroups: filters["subArchitectureGroups"] ? filters["subArchitectureGroups"] : null,
                productType: filters["productType"] ? filters["productType"] : null,
                warrantyCategory: filters["warrantyCategory"] ? filters["warrantyCategory"] : null,
                productFamily: filters["productFamily"] ? filters["productFamily"] : null,
                productName: filters["productName"] ? filters["productName"] : null,
                parentArchGroup: subArch ? subArch : null,
                 bookmarkName: GlobalBookmarkServ.getBookmarkName(),
                 suite:  ( slug === 'asset' || slug === "ciscoOne") && filters["Suite"] ?  filters["Suite"] : null,
                productClassification: filters["productClassification"] ? filters["productClassification"] : null,
                parentNode: filters["parentNode"] ? filters["parentNode"] : null
            }).then(function (response) {
                deferred.resolve(fillEnvelope(slug, response));
                //deferred.resolve(response);
            }, function (reason) {
                deferred.reject(reason);
            });
            return deferred.promise;
        };

        performanceServObj.getRenewalByArchitecture = function (slug, filters, subTab, subArch) {
            salesNodeName = angular.isArray(filters["nodeName"]) && filters["nodeName"].length === 0 ? "All Nodes" : filters["nodeName"];
            var deferred = $q.defer();
            if (subTab && subTab.length > 0) {
                var subSlug = subTabApiMap[slug][subTab];
                if (subSlug) {
                    slug = subSlug;
                }
            }
            var url;
            /*if(slug==='tsRenew'){
            url= 'rate-by-sales';
            }*/
            if(slug==='swssRenew') {
            url= 'swss-rate-by-arch';
            }
            apiDispatcher.post(getApiPath(url), {
                nodeName: JSON.stringify(filters["nodeName"]),
                accountManagerName: filters.accounts ? JSON.stringify(filters.accounts) : null,
                segment: filters["segment"] ? filters["segment"] : null,
                installSite: filters["installSite"] ? filters["installSite"] : null,
                gvscsOrganisation: filters["gvscsOrganisation"] ? filters["gvscsOrganisation"] : null,
                contractType: filters.contractType?filters.contractType:null,
                contractNumber: filters.contractNumber?filters.contractNumber:null,
                serviceSO: filters.serviceSO?filters.serviceSO:null,
                guName: filters.guName?filters.guName:null,
                //accountName: filters.accountName ? filters.accountName : null,
                eos: !angular.equals({}, filters.eos) ? JSON.stringify(filters.eos): null,
                ldos: !angular.equals({}, filters.ldos) ? JSON.stringify(filters.ldos) : null,
                ship: !angular.equals({}, filters.ship) ? JSON.stringify(filters.ship) : null,
                cled: !angular.equals({},filters.cled) ? JSON.stringify(filters.cled) : null,
                partnerName: filters.partner ? filters.partner : null,
                country: filters["country"] ? filters["country"] : null,
                verticalMarket: filters["verticalMarket"] ? filters["verticalMarket"] : null,
                customer: filters["customer"] ? filters["customer"] : null,
                refreshPropensity: filters["refreshPropensity"] ? filters["refreshPropensity"] : null,
                lowerAttachPropensity: filters["lowerAttachPropensity"] >= 0 ? filters["lowerAttachPropensity"] : null,
                higherAttachPropensity: filters["higherAttachPropensity"] >= 0 ? filters["higherAttachPropensity"] : null,
                coverage: filters["coverage"] ? filters["coverage"] : null,
                networkCollection : filters["networkCollection"] ? filters["networkCollection"] : null,
                globalShippedPeriod: filters["globalShippedPeriod"] ? filters["globalShippedPeriod"] : null,
                architectureGroups: filters["architectureGroups"] ? filters["architectureGroups"] : null,
                subArchitectureGroups: filters["subArchitectureGroups"] ? filters["subArchitectureGroups"] : null,
                productType: filters["productType"] ? filters["productType"] : null,
                warrantyCategory: filters["warrantyCategory"] ? filters["warrantyCategory"] : null,
                productFamily: filters["productFamily"] ? filters["productFamily"] : null,
                productName: filters["productName"] ? filters["productName"] : null,
                parentArchGroup: subArch ? subArch : null,
                 bookmarkName: GlobalBookmarkServ.getBookmarkName(),
                 suite:  ( slug === 'asset' || slug === "ciscoOne") && filters["Suite"] ?  filters["Suite"] : null,
                productClassification: filters["productClassification"] ? filters["productClassification"] : null,
                parentNode: filters["parentNode"] ? filters["parentNode"] : null
            }).then(function (response) {
                deferred.resolve(fillEnvelope(slug, response));
                //deferred.resolve(response);
            }, function (reason) {
                deferred.reject(reason);
            });
            return deferred.promise;
        };


        performanceServObj.attachRateByWarranty = function (slug, filters, subTab, subArch) {
            salesNodeName = angular.isArray(filters["nodeName"]) && filters["nodeName"].length === 0 ? "All Nodes" : filters["nodeName"];
            if(filters["nodeName"] !== undefined && filters["nodeName"].length > 0){
                var node = [];
                node.push(filters["nodeName"][0]);
                filters["nodeName"] = node;
            }
            var deferred = $q.defer();
            if (subTab && subTab.length > 0) {
                var subSlug = subTabApiMap[slug][subTab];
                if (subSlug) {
                    slug = subSlug;
                }
            }
            apiDispatcher.post(getApiPath('attach-rate-warranty'), filters, {
                nodeName: JSON.stringify(filters["nodeName"]),
                accountManagerName: filters.accounts ? JSON.stringify(filters.accounts) : null,
                segment: filters["segment"] ? filters["segment"] : null,
                installSite: filters["installSite"] ? filters["installSite"] : null,
                gvscsOrganisation: filters["gvscsOrganisation"] ? filters["gvscsOrganisation"] : null,
                //accountName: filters.accountName ? filters.accountName : null,
                contractType: filters.contractType?filters.contractType:null,
                contractNumber: filters.contractNumber?filters.contractNumber:null,
                serviceSO: filters.serviceSO?filters.serviceSO:null,
                guName: filters.guName?filters.guName:null,
                eos: !angular.equals({}, filters.eos) ? JSON.stringify(filters.eos): null,
                ldos: !angular.equals({}, filters.ldos) ? JSON.stringify(filters.ldos) : null,
                ship: !angular.equals({}, filters.ship) ? JSON.stringify(filters.ship) : null,
                partnerName: filters.partner ? filters.partner : null,
                country: filters["country"] ? filters["country"] : null,
                verticalMarket: filters["verticalMarket"] ? filters["verticalMarket"] : null,
                customer: filters["customer"] ? filters["customer"] : null,
                refreshPropensity: filters["refreshPropensity"] ? filters["refreshPropensity"] : null,
                lowerAttachPropensity: filters["lowerAttachPropensity"] >= 0 ? filters["lowerAttachPropensity"] : null,
                higherAttachPropensity: filters["higherAttachPropensity"] >= 0 ? filters["higherAttachPropensity"] : null,
                coverage: filters["coverage"] ? filters["coverage"] : null,
                networkCollection : filters["networkCollection"] ? filters["networkCollection"] : null,
                globalShippedPeriod: filters["globalShippedPeriod"] ? filters["globalShippedPeriod"] : null,
                architectureGroups: filters["architectureGroups"] ? filters["architectureGroups"] : null,
                subArchitectureGroups: filters["subArchitectureGroups"] ? filters["subArchitectureGroups"] : null,
                productType: filters["productType"] ? filters["productType"] : null,
                warrantyCategory: filters["warrantyCategory"] ? filters["warrantyCategory"] : null,
                productFamily: filters["productFamily"] ? filters["productFamily"] : null,
                productName: filters["productName"] ? filters["productName"] : null,
                parentArchGroup: subArch ? subArch : null,
                bookmarkName: GlobalBookmarkServ.getBookmarkName(),
                suite:  ( slug === 'asset' || slug === "ciscoOne") && filters["Suite"] ?  filters["Suite"] : null,
                productClassification: filters["productClassification"] ? filters["productClassification"] : null,
                parentNode: filters["parentNode"] ? filters["parentNode"] : null
            }).then(function (response) {
                deferred.resolve(fillEnvelope(slug, response));
                //deferred.resolve(response);
            }, function (reason) {
                deferred.reject(reason);
            });
            return deferred.promise;
        };

        performanceServObj.inQuarterRenewalRate = function (slug, filters, subTab, subArch) {
            salesNodeName = angular.isArray(filters["nodeName"]) && filters["nodeName"].length === 0 ? "All Nodes" : filters["nodeName"];
            var deferred = $q.defer();
            var url;
            if (subTab && subTab.length > 0) {
                var subSlug = subTabApiMap[slug][subTab];
                if (subSlug) {
                    slug = subSlug;
                }
            }
            if(slug==='swssAttach'){
                url =getApiPath('in-quarter-swssattach-rate');
            }else if (slug === 'totalAttach') {
                url= getApiPath('in-quarter-totalattach-rate');
            } else {
                url= getApiPath('in-quarter-attach-rate');
            }            apiDispatcher.post(url, filters, {
                nodeName: JSON.stringify(filters["nodeName"]),
                accountManagerName: filters.accounts ? JSON.stringify(filters.accounts) : null,
                segment: filters["segment"] ? filters["segment"] : null,
                installSite: filters["installSite"] ? filters["installSite"] : null,
                gvscsOrganisation: filters["gvscsOrganisation"] ? filters["gvscsOrganisation"] : null,
                //accountName: filters.accountName ? filters.accountName : null,
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
                refreshPropensity: filters["refreshPropensity"] ? filters["refreshPropensity"] : null,
                lowerAttachPropensity: filters["lowerAttachPropensity"] >= 0 ? filters["lowerAttachPropensity"] : null,
                higherAttachPropensity: filters["higherAttachPropensity"] >= 0 ? filters["higherAttachPropensity"] : null,
                coverage: filters["coverage"] ? filters["coverage"] : null,
                networkCollection : filters["networkCollection"] ? filters["networkCollection"] : null,
                globalShippedPeriod: filters["globalShippedPeriod"] ? filters["globalShippedPeriod"] : null,
                architectureGroups: filters["architectureGroups"] ? filters["architectureGroups"] : null,
                subArchitectureGroups: filters["subArchitectureGroups"] ? filters["subArchitectureGroups"] : null,
                productType: filters["productType"] ? filters["productType"] : null,
                warrantyCategory: filters["warrantyCategory"] ? filters["warrantyCategory"] : null,
                productFamily: filters["productFamily"] ? filters["productFamily"] : null,
                productName: filters["productName"] ? filters["productName"] : null,
                parentArchGroup: subArch ? subArch : null,
                 bookmarkName: GlobalBookmarkServ.getBookmarkName(),
                 suite:  ( slug === 'asset' || slug === "ciscoOne") && filters["Suite"] ?  filters["Suite"] : null,
                productClassification: filters["productClassification"] ? filters["productClassification"] : null,
                parentNode: filters["parentNode"] ? filters["parentNode"] : null
            }).then(function (response) {
                deferred.resolve(fillEnvelope(slug, response));
                //deferred.resolve(response);
            }, function (reason) {
                deferred.reject(reason);
            });
            return deferred.promise;
        };

        performanceServObj.attachRateBySalesLevel = function (slug, filters, subTab, subArch) {
            salesNodeName = angular.isArray(filters["nodeName"]) && filters["nodeName"].length === 0 ? "All Nodes" : filters["nodeName"];
            var deferred = $q.defer();
            if (subTab && subTab.length > 0) {
                var subSlug = subTabApiMap[slug][subTab];
                if (subSlug) {
                    slug = subSlug;
                }
            }
            apiDispatcher.post(getApiPath('attach-rate-sales'), filters, {
                nodeName: JSON.stringify(filters["nodeName"]),
                accountManagerName: filters.accounts ? JSON.stringify(filters.accounts) : null,
                segment: filters["segment"] ? filters["segment"] : null,
                installSite: filters["installSite"] ? filters["installSite"] : null,
                gvscsOrganisation: filters["gvscsOrganisation"] ? filters["gvscsOrganisation"] : null,
                //accountName: filters.accountName ? filters.accountName : null,
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
                refreshPropensity: filters["refreshPropensity"] ? filters["refreshPropensity"] : null,
                lowerAttachPropensity: filters["lowerAttachPropensity"] >= 0 ? filters["lowerAttachPropensity"] : null,
                higherAttachPropensity: filters["higherAttachPropensity"] >= 0 ? filters["higherAttachPropensity"] : null,
                coverage: filters["coverage"] ? filters["coverage"] : null,
                networkCollection : filters["networkCollection"] ? filters["networkCollection"] : null,
                globalShippedPeriod: filters["globalShippedPeriod"] ? filters["globalShippedPeriod"] : null,
                architectureGroups: filters["architectureGroups"] ? filters["architectureGroups"] : null,
                subArchitectureGroups: filters["subArchitectureGroups"] ? filters["subArchitectureGroups"] : null,
                productType: filters["productType"] ? filters["productType"] : null,
                warrantyCategory: filters["warrantyCategory"] ? filters["warrantyCategory"] : null,
                productFamily: filters["productFamily"] ? filters["productFamily"] : null,
                productName: filters["productName"] ? filters["productName"] : null,
                parentArchGroup: subArch ? subArch : null,
                 bookmarkName: GlobalBookmarkServ.getBookmarkName(),
                 suite:  ( slug === 'asset' || slug === "ciscoOne") && filters["Suite"] ?  filters["Suite"] : null,
                productClassification: filters["productClassification"] ? filters["productClassification"] : null,
                parentNode: filters["parentNode"] ? filters["parentNode"] : null
            }).then(function (response) {
                deferred.resolve(fillEnvelope(slug, response));
                //deferred.resolve(response);
            }, function (reason) {
                deferred.reject(reason);
            });
            return deferred.promise;
        };


        performanceServObj.getChartInteraction = function (slug, filters, subTab, subArch, update) {
            salesNodeName = angular.isArray(filters["nodeName"]) && filters["nodeName"].length === 0 ? "All Nodes" : filters["nodeName"];
            var deferred = $q.defer();
            if (subTab && subTab.length > 0) {
                var subSlug = subTabApiMap[slug][subTab];
                if (subSlug) {
                    slug = subSlug;
                }
            }
            var url;
            if (update==='updateCustomer') {
                url = getApiPath('renew-chart-interaction');
            } else {
                url = getApiPath('performance') + slug + '/spc/customer' ;
            }
            apiDispatcher.post(url, {
                nodeName: JSON.stringify(filters["nodeName"]),
                accountManagerName: filters.accounts ? JSON.stringify(filters.accounts) : null,
                segment: filters["segment"] ? filters["segment"] : null,
                installSite: filters["installSite"] ? filters["installSite"] : null,
                gvscsOrganisation: filters["gvscsOrganisation"] ? filters["gvscsOrganisation"] : null,
                contractType: filters.contractType?filters.contractType:null,
                contractNumber: filters.contractNumber?filters.contractNumber:null,
                serviceSO: filters.serviceSO?filters.serviceSO:null,
                guName: filters.guName?filters.guName:null,
                eos: !angular.equals({}, filters.eos) ? JSON.stringify(filters.eos): null,
                ldos: !angular.equals({}, filters.ldos) ? JSON.stringify(filters.ldos) : null,
                ship: !angular.equals({}, filters.ship) ? JSON.stringify(filters.ship) : null,
                cled: !angular.equals({},filters.cled) ? JSON.stringify(filters.cled) : null,
                //partnerName: filters.partner ? filters.partner : null,
                country: filters["country"] ? filters["country"] : null,
                verticalMarket: filters["verticalMarket"] ? filters["verticalMarket"] : null,
                customer: filters["customer"] ? filters["customer"] : null,//DE145288 customer was not passed correctly
                refreshPropensity: filters["refreshPropensity"] ? filters["refreshPropensity"] : null,
                lowerAttachPropensity: filters["lowerAttachPropensity"] >= 0 ? filters["lowerAttachPropensity"] : null,
                higherAttachPropensity: filters["higherAttachPropensity"] >= 0 ? filters["higherAttachPropensity"] : null,
                coverage: filters["coverage"] ? filters["coverage"] : null,
                networkCollection : filters["networkCollection"] ? filters["networkCollection"] : null,
                globalShippedPeriod: filters["globalShippedPeriod"] ? filters["globalShippedPeriod"] : null,
                architectureGroups: filters["architectureGroups"] ? filters["architectureGroups"] : null,
                subArchitectureGroups: filters["subArchitectureGroups"] ? filters["subArchitectureGroups"] : null,
                productType: filters["productType"] ? filters["productType"] : null,
                warrantyCategory: filters["warrantyCategory"] ? filters["warrantyCategory"] : null,
                productFamily: filters["productFamily"] ? filters["productFamily"] : null,
                productName: filters["productName"] ? filters["productName"] : null,
                parentArchGroup: subArch ? subArch : null,
                quarterId: filters["quarterId"] ? filters["quarterId"] : null,
                activeKey: filters["activeKey"] ? filters["activeKey"] : null,
                 bookmarkName: GlobalBookmarkServ.getBookmarkName(),
                 suite:  ( slug === 'asset' || slug === "ciscoOne") && filters["Suite"] ?  filters["Suite"] : null,
                productClassification: filters["productClassification"] ? filters["productClassification"] : null,
                parentNode: filters["parentNode"] ? filters["parentNode"] : null
            }).then(function (response) {
                deferred.resolve(fillEnvelope(slug, response));
                //deferred.resolve(response);
            }, function (reason) {
                deferred.reject(reason);
            });
            return deferred.promise;
        };


        performanceServObj.getAttachChartInteraction = function (slug, filters, subTab, subArch) {
            salesNodeName = angular.isArray(filters["nodeName"]) && filters["nodeName"].length === 0 ? "All Nodes" : filters["nodeName"];
            var deferred = $q.defer();
            if (subTab && subTab.length > 0) {
                var subSlug = subTabApiMap[slug][subTab];
                if (subSlug) {
                    slug = subSlug;
                }
            }
            apiDispatcher.post(getApiPath('attach-customer'), {
                nodeName: JSON.stringify(filters["nodeName"]),
                accountManagerName: filters.accounts ? JSON.stringify(filters.accounts) : null,
                segment: filters["segment"] ? filters["segment"] : null,
                installSite: filters["installSite"] ? filters["installSite"] : null,
                gvscsOrganisation: filters["gvscsOrganisation"] ? filters["gvscsOrganisation"] : null,
                contractType: filters.contractType?filters.contractType:null,
                contractNumber: filters.contractNumber?filters.contractNumber:null,
                serviceSO: filters.serviceSO?filters.serviceSO:null,
                guName: filters.guName?filters.guName:null,
                eos: !angular.equals({}, filters.eos) ? JSON.stringify(filters.eos): null,
                ldos: !angular.equals({}, filters.ldos) ? JSON.stringify(filters.ldos) : null,
                ship: !angular.equals({}, filters.ship) ? JSON.stringify(filters.ship) : null,
                cled: !angular.equals({},filters.cled) ? JSON.stringify(filters.cled) : null,
                //partnerName: filters.partner ? filters.partner : null,
                country: filters["country"] ? filters["country"] : null,
                verticalMarket: filters["verticalMarket"] ? filters["verticalMarket"] : null,
                customer: filters.partner ? filters.partner : null,
                refreshPropensity: filters["refreshPropensity"] ? filters["refreshPropensity"] : null,
                lowerAttachPropensity: filters["lowerAttachPropensity"] >= 0 ? filters["lowerAttachPropensity"] : null,
                higherAttachPropensity: filters["higherAttachPropensity"] >= 0 ? filters["higherAttachPropensity"] : null,
                coverage: filters["coverage"] ? filters["coverage"] : null,
                networkCollection : filters["networkCollection"] ? filters["networkCollection"] : null,
                globalShippedPeriod: filters["globalShippedPeriod"] ? filters["globalShippedPeriod"] : null,
                architectureGroups: filters["architectureGroups"] ? filters["architectureGroups"] : null,
                subArchitectureGroups: filters["subArchitectureGroups"] ? filters["subArchitectureGroups"] : null,
                productType: filters["productType"] ? filters["productType"] : null,
                warrantyCategory: filters["warrantyCategory"] ? filters["warrantyCategory"] : null,
                productFamily: filters["productFamily"] ? filters["productFamily"] : null,
                productName: filters["productName"] ? filters["productName"] : null,
                parentArchGroup: subArch ? subArch : null,
                quarterId: filters["quarterId"] ? filters["quarterId"] : null,
                 bookmarkName: GlobalBookmarkServ.getBookmarkName(),
                 suite:  ( slug === 'asset' || slug === "ciscoOne") && filters["Suite"] ?  filters["Suite"] : null,
                productClassification: filters["productClassification"] ? filters["productClassification"] : null,
                parentNode: filters["parentNode"] ? filters["parentNode"] : null
                //activeKey: filters["activeKey"] ? filters["activeKey"] : null  //DE132814
            }).then(function (response) {
                deferred.resolve(fillEnvelope(slug, response));
            }, function (reason) {
                deferred.reject(reason);
            });
            return deferred.promise;
        };

        //Square Chart Interaction Sales and Customer
        performanceServObj.getAttachSquareChart = function (slug, filters, subTab, subArch, salesOrCust) {
            salesNodeName = angular.isArray(filters["nodeName"]) && filters["nodeName"].length === 0 ? "All Nodes" : filters["nodeName"];
            var deferred = $q.defer();
            if (subTab && subTab.length > 0) {
                var subSlug = subTabApiMap[slug][subTab];
                if (subSlug) {
                    slug = subSlug;
                }
            }
            var getAPI;
            if (salesOrCust === 'sales') {
                if(slug==='swssAttach'){
                    getAPI=getApiPath('average-days-to-swssAttach-sales');
                }else{
                    getAPI = getApiPath('average-days-to-attach-sales');
                }


            }
            if (salesOrCust === 'customer') {
                if(slug==='swssAttach'){
                    getAPI = getApiPath('average-days-to-swssAttach-customer');
                    }
                    else{
                        getAPI = getApiPath('average-days-to-attach-customer');
            }
        }
            apiDispatcher.post(getAPI, {
                nodeName: JSON.stringify(filters["nodeName"]),
                accountManagerName: filters.accounts ? JSON.stringify(filters.accounts) : null,
                segment: filters["segment"] ? filters["segment"] : null,
                installSite: filters["installSite"] ? filters["installSite"] : null,
                gvscsOrganisation: filters["gvscsOrganisation"] ? filters["gvscsOrganisation"] : null,
                contractType: filters.contractType?filters.contractType:null,
                contractNumber: filters.contractNumber?filters.contractNumber:null,
                serviceSO: filters.serviceSO?filters.serviceSO:null,
                guName: filters.guName?filters.guName:null,
                eos: !angular.equals({}, filters.eos) ? JSON.stringify(filters.eos): null,
                ldos: !angular.equals({}, filters.ldos) ? JSON.stringify(filters.ldos) : null,
                ship: !angular.equals({}, filters.ship) ? JSON.stringify(filters.ship) : null,
                cled: !angular.equals({},filters.cled) ? JSON.stringify(filters.cled) : null,
                //partnerName: filters.partner ? filters.partner : null,
                country: filters["country"] ? filters["country"] : null,
                verticalMarket: filters["verticalMarket"] ? filters["verticalMarket"] : null,
                customer: filters["customer"] ? filters["customer"] : null,
                refreshPropensity: filters["refreshPropensity"] ? filters["refreshPropensity"] : null,
                lowerAttachPropensity: filters["lowerAttachPropensity"] >= 0 ? filters["lowerAttachPropensity"] : null,
                higherAttachPropensity: filters["higherAttachPropensity"] >= 0 ? filters["higherAttachPropensity"] : null,
                coverage: filters["coverage"] ? filters["coverage"] : null,
                networkCollection : filters["networkCollection"] ? filters["networkCollection"] : null,
                globalShippedPeriod: filters["globalShippedPeriod"] ? filters["globalShippedPeriod"] : null,
                architectureGroups: filters["architectureGroups"] ? filters["architectureGroups"] : null,
                subArchitectureGroups: filters["subArchitectureGroups"] ? filters["subArchitectureGroups"] : null,
                productType: filters["productType"] ? filters["productType"] : null,
                warrantyCategory: filters["warrantyCategory"] ? filters["warrantyCategory"] : null,
                productFamily: filters["productFamily"] ? filters["productFamily"] : null,
                productName: filters["productName"] ? filters["productName"] : null,
                parentArchGroup: subArch ? subArch : null,
                quarterId: filters["quarterId"] ? filters["quarterId"] : null,
                 bookmarkName: GlobalBookmarkServ.getBookmarkName(),
                 suite:  ( slug === 'asset' || slug === "ciscoOne") && filters["Suite"] ?  filters["Suite"] : null,
                productClassification: filters["productClassification"] ? filters["productClassification"] : null,
                parentNode: filters["parentNode"] ? filters["parentNode"] : null
                //activeKey: filters["activeKey"] ? filters["activeKey"] : null  //DE132814
            }).then(function (response) {
                deferred.resolve(fillEnvelope(slug, response));
            }, function (reason) {
                deferred.reject(reason);
            });
            return deferred.promise;
        };


        performanceServObj.getAttCustInteraction = function (slug, filters, subTab, subArch) {
            salesNodeName = angular.isArray(filters["nodeName"]) && filters["nodeName"].length === 0 ? "All Nodes" : filters["nodeName"];
            var deferred = $q.defer();
            if (subTab && subTab.length > 0) {
                var subSlug = subTabApiMap[slug][subTab];
                if (subSlug) {
                    slug = subSlug;
                }
            }
            apiDispatcher.post(getApiPath('attach-customer-selection'), {
                nodeName: filters["nodeName"],
                accountManagerName: filters.accounts ? JSON.stringify(filters.accounts) : null,
                segment: filters["segment"] ? filters["segment"] : null,
                installSite: filters["installSite"] ? filters["installSite"] : null,
                gvscsOrganisation: filters["gvscsOrganisation"] ? filters["gvscsOrganisation"] : null,
                contractType: filters.contractType?filters.contractType:null,
                contractNumber: filters.contractNumber?filters.contractNumber:null,
                serviceSO: filters.serviceSO?filters.serviceSO:null,
                guName: filters.guName?filters.guName:null,
                eos: !angular.equals({}, filters.eos) ? JSON.stringify(filters.eos): null,
                ldos: !angular.equals({}, filters.ldos) ? JSON.stringify(filters.ldos) : null,
                ship: !angular.equals({}, filters.ship) ? JSON.stringify(filters.ship) : null,
                cled: !angular.equals({},filters.cled) ? JSON.stringify(filters.cled) : null,
                //partnerName: filters.partner ? filters.partner : null,
                country: filters["country"] ? filters["country"] : null,
                verticalMarket: filters["verticalMarket"] ? filters["verticalMarket"] : null,
                customer: filters.partner ? filters.partner : null,
                refreshPropensity: filters["refreshPropensity"] ? filters["refreshPropensity"] : null,
                lowerAttachPropensity: filters["lowerAttachPropensity"] >= 0 ? filters["lowerAttachPropensity"] : null,
                higherAttachPropensity: filters["higherAttachPropensity"] >= 0 ? filters["higherAttachPropensity"] : null,
                coverage: filters["coverage"] ? filters["coverage"] : null,
                networkCollection : filters["networkCollection"] ? filters["networkCollection"] : null,
                globalShippedPeriod: filters["globalShippedPeriod"] ? filters["globalShippedPeriod"] : null,
                architectureGroups: filters["architectureGroups"] ? filters["architectureGroups"] : null,
                subArchitectureGroups: filters["subArchitectureGroups"] ? filters["subArchitectureGroups"] : null,
                productType: filters["productType"] ? filters["productType"] : null,
                warrantyCategory: filters["warrantyCategory"] ? filters["warrantyCategory"] : null,
                productFamily: filters["productFamily"] ? filters["productFamily"] : null,
                productName: filters["productName"] ? filters["productName"] : null,
                parentArchGroup: subArch ? subArch : null,
                quarterId: filters["quarterId"] ? filters["quarterId"] : null,
                 bookmarkName: GlobalBookmarkServ.getBookmarkName(),
                 suite:  ( slug === 'asset' || slug === "ciscoOne") && filters["Suite"] ?  filters["Suite"] : null,
                productClassification: filters["productClassification"] ? filters["productClassification"] : null,
                parentNode: filters["parentNode"] ? filters["parentNode"] : null
                //activeKey: filters["activeKey"] ? filters["activeKey"] : null
            }).then(function (response) {
                deferred.resolve(fillEnvelope(slug, response));
            }, function (reason) {
                deferred.reject(reason);
            });
            return deferred.promise;
        };

        return performanceServObj;
    }
]);
