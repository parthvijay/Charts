/**
 * Created by msirwani on 9/7/2016.
 */
'use strict';
angular.module('ciscoExecDashApp').factory('CiscoUtilities', ['ConfigServ', function (configServ) {
    var globalViewFlag = 'N';
    var amYornFlag = '';
    var autoRenewal = 'N';
    var chartAlignemntMap = {
        "performance": {
            "all": {},
            "refresh": {
                "Refresh SFDC Bookings": {
                    "cKey": false,
                    "display": false,
                    "last": true
                }
            },
            "renew": {
                "Renewal Rate by Sales Levels": {
                    "cKey": "currentQuarter",
                    "sKey": "state",
                    "display": "-1"
                },
                "Total Renewal Bookings by Quarter": {
                    "cKey": false,
                    "display": false,
                    "last": true
                },
                "TS Renewal Bookings by Quarter": {
                    "cKey": false,
                    "display": false,
                    "last": true
                },
                "SWSS Renewal Bookings by Quarter": {
                    "cKey": false,
                    "display": false,
                    "last": true
                },
                "Total Missed ($)": {
                    "cKey": false,
                    "display": false,
                    "last": true
                },
                "Compare Missed ($)": {
                    "cKey": false,
                    "display": false,
                    "last": true
                },
                "Total Renew Rate (%)": {
                    "cKey": "currentMonth",
                    "sKey": "state",
                    "display": "-5"
                },
                "Compare Renew Rate (%)": {
                    "cKey": "currentMonth",
                    "sKey": "state",
                    "display": "-5"
                },
                "SWSS Renew by Architecture": {
                    "cKey": false,
                    "display": false,
                    "last": true
                },
                "SWSS Renew Breakdown ($)": {
                    "cKey": "currentMonth",
                    "sKey": "quarter",
                    "display": "+7"
                },
                "SWSS Renew Breakdown (%)": {
                    "cKey": "currentMonth",
                    "sKey": "quarter",
                    "display": "-5"
                },
                "AS Renew Bookings by Sales Levels": {
                    "cKey": "currentQuarter",
                    "sKey": "quarter",
                    "display": "-5",
                    "falseQuarter": "state"
                },
                "AS Annual/Multi Year Renewals": {
                    "cKey": "currentQuarter",
                    "sKey": "quarter",
                    "display": "-5"
                },
                "AS Renew Bookings Breakdown ($)": {
                    "cKey": "currentQuarter",
                    "sKey": "quarter",
                    "display": "-5"
                },
                "Renewal Realization Rate (%)": {
                    "cKey": "currentQuarter",
                    "sKey": "quarter",
                    "display": "-5",
                    "falseQuarter": "state"
                },
                "Renewal Conversion Rate (%)": {
                    "cKey": "currentQuarter",
                    "sKey": "quarter",
                    "display": "-5",
                    "falseQuarter": "state"
                }
            },
            "attach": {
                "Corporate 15/12 Attach Rate by Months": {
                    "sKey": "state",
                    "cKey": "currentMonth",
                    "display": -5
                },
                "Corporate 15/12 Attach Rate": {
                    "sKey": "state",
                    "cKey": "currentMonth",
                    "display": -5
                },
                "In Quarter Attach Rate": {
                    "sKey": "state",
                    "cKey": "currentQuarter",
                    "display": 2
                },
                "Attach Rate by Sales Levels": {
                    "sKey": "state",
                    "cKey": "currentMonth",
                    "display": -1
                },
                "Average Days to Attach by Sales Levels": {
                    "sKey": "quarter",
                    "cKey": "currentMonth",
                    "display": -1
                },
                "Average Days to Attach by Customers": {
                    "sKey": "quarter",
                    "cKey": "currentMonth",
                    "display": -1
                },
                "SWSS Attach Rate by Months": {
                    "sKey": "state",
                    "cKey": "currentMonth",
                    "display": -5
                },
                 "Total Attach Rate by Months": {
                    "sKey": "state",
                    "cKey": "currentMonth",
                    "display": -5
                },
                "Total Unattached ($)": {
                    "cKey": false,
                    "display": false,
                    "last": true
                },
                "Compare Unattached ($)": {
                    "cKey": false,
                    "display": false,
                    "last": true
                },
                "SWSS Attach by Architecture": {
                    "cKey": false,
                    "display": false,
                    "last": true
                },
                "SWSS Attach Performance ($)": {
                    "cKey": false,
                    "display": false,
                    "last": true
                },
                "SWSS Total Attach Rate %": {
                    "cKey": false,
                    "display": false,
                    "last": true
                },
                "SWSS Compare Attach Rate %": {
                    "cKey": false,
                    "display": false,
                    "last": true
                }
            }
        },
        "opportunities": {
            "all": {
                "Total Opportunities by Period": {
                    "cKey": "currentQuarter",
                    "sKey": "quarter",
                    "display": "-2"
                }
            },
            "asset": {
                "Asset View by Processing Date- FQ": {
                    "cKey": "currentQuarter",
                    "sKey": "quarter",
                    "display": "-5"
                },
                "Asset View by Processing Date- FM": {
                    "cKey": "currentMonth",
                    "sKey": "quarter",
                    "display": -5
                },
                "Asset View by Processing Date- FY": {
                    "cKey": "currentYear",
                    "sKey": "quarter",
                    "display": -5
                }
            },
            "refresh": {
                "Refresh by Period- FQ": {
                    "cKey": "currentQuarter",
                    "sKey": "quarter",
                    "display": "-5"
                },
                "Refresh by Period- FY": {
                    "cKey": "currentYear",
                    "sKey": "quarter",
                    "display": "-5"
                },
                "Refresh by Period- FM": {
                    "cKey": "currentMonth",
                    "sKey": "quarter",
                    "display": "-5"
                },
                "Opportunities by EOS Period- FQ": {
                    "cKey": "currentQuarter",
                    "sKey": "quarter",
                    "display": "-5"
                },
                "Opportunities by EOS Period- FY": {
                    "cKey": "currentYear",
                    "sKey": "quarter",
                    "display": "-5"
                },
                "Opportunities by EOS Period- FM": {
                    "cKey": "currentMonth",
                    "sKey": "quarter",
                    "display": "-5"
                },
                "Opportunities by LDOS Period- FQ": {
                    "cKey": "currentQuarter",
                    "sKey": "quarter",
                    "display": "-2"
                },
                "Opportunities by LDOS Period- FY": {
                    "cKey": "currentYear",
                    "sKey": "quarter",
                    "display": "-2"
                },
                "Opportunities by LDOS Period- FM": {
                    "cKey": "currentMonth",
                    "sKey": "quarter",
                    "display": "-2"
                }
            },
            "subscription": {
                "Security Subscription by Contract/Term Expiry- FQ": {
                    "cKey": "currentQuarter",
                    "sKey": "quarter",
                    "display": -1
                },
                "Security Subscription by Contract/Term Expiry- FM": {
                    "cKey": "currentMonth",
                    "sKey": "quarter",
                    "display": -1
                },
                "Security Subscription by Contract/Term Expiry- FY": {
                    "cKey": "currentYear",
                    "sKey": "quarter",
                    "display": -1
                },
                "Collab Subscription by Contract/Term Expiry- FQ": {
                    "cKey": "currentQuarter",
                    "sKey": "quarter",
                    "display": -1
                },
                "Collab Subscription by Contract/Term Expiry- FM": {
                    "cKey": "currentMonth",
                    "sKey": "quarter",
                    "display": -1
                },
                "Collab Subscription by Contract/Term Expiry- FY": {
                    "cKey": "currentYear",
                    "sKey": "quarter",
                    "display": -1
                },
                "Other Subscription by Contract/Term Expiry- FQ": {
                    "cKey": "currentQuarter",
                    "sKey": "quarter",
                    "display": -1
                },
                "Other Subscription by Contract/Term Expiry- FM": {
                    "cKey": "currentMonth",
                    "sKey": "quarter",
                    "display": -1
                },
                "Other Subscription by Contract/Term Expiry- FY": {
                    "cKey": "currentYear",
                    "sKey": "quarter",
                    "display": -1
                }
            },
            "renew": {
                "Total Renewal by Period- FQ": {
                    "cKey": "currentQuarter",
                    "sKey": "quarter",
                    "display": "-3"
                },
                "Total Renewal by Period- FM": {
                    "cKey": "currentMonth",
                    "sKey": "quarter",
                    "display": "-3"
                },
                "Total Renewal by Period- FY": {
                    "cKey": "currentYear",
                    "sKey": "quarter",
                    "display": -5
                },
                "TS Renewal by Period- FQ": {
                    "cKey": "currentQuarter",
                    "sKey": "quarter",
                    "display": "-3"
                },
                "TS Renewal by Period- FM": {
                    "cKey": "currentMonth",
                    "sKey": "quarter",
                    "display": "-3"
                },
                "TS Renewal by Period- FY": {
                    "cKey": "currentYear",
                    "sKey": "quarter",
                    "display": -5
                },
                "SWSS Renewal by Period- FQ": {
                    "cKey": "currentQuarter",
                    "sKey": "quarter",
                    "display": "-3"
                },
                "SWSS Renewal by Period- FM": {
                    "cKey": "currentMonth",
                    "sKey": "quarter",
                    "display": "-3"
                },
                "SWSS Renewal by Period- FY": {
                    "cKey": "currentYear",
                    "sKey": "quarter",
                    "display": -5
                },
                "AS Renew by Period- FQ": {
                    "cKey": "currentQuarter",
                    "sKey": "quarter",
                    "display": "-3"
                },
                "AS Renew by Period- FM": {
                    "cKey": "currentMonth",
                    "sKey": "quarter",
                    "display": "-3"
                },
                
                "AS Renew by Period- FY": {
                    "cKey": "currentYear",
                    "sKey": "quarter",
                    "display": -5
                }
            },
            "attach": {
                "Total Attach by Period- FQ": {
                    "cKey": "currentQuarter",
                    "sKey": "quarter",
                    "display": "-5",
                    "exception": true,
                    "exceptionOptions": {
                        "last": true,
                        "display": "-1"
                    }
                },
                "Total Attach by Period- FY": {
                    "cKey": "currentYear",
                    "sKey": "quarter",
                    "display": "-5",
                    "exception": true,
                    "exceptionOptions": {
                        "last": true,
                        "display": "-1"
                    }
                },
                "Total Attach by Period- FM": {
                    "cKey": "currentMonth",
                    "sKey": "quarter",
                    "display": "-5",
                    "exception": true,
                    "exceptionOptions": {
                        "last": true,
                        "display": "-1"
                    }
                },
                 "Unattached Shipments by Period- FQ": {
                    "cKey": "currentQuarter",
                    "sKey": "quarter",
                    "display": "-5",
                    "exception": true,
                    "exceptionOptions": {
                        "last": true,
                        "display": "-1"
                    }
                },
                "Unattached Shipments by Period- FM": {
                    "cKey": "currentMonth",
                    "sKey": "quarter",
                    "display": "-5",
                    "exception": true,
                    "exceptionOptions": {
                        "last": true,
                        "display": "-1"
                    }
                },
                "Unattached Shipments by Period- FY": {
                    "cKey": "currentYear",
                    "sKey": "quarter",
                    "display": "-5",
                    "exception": true,
                    "exceptionOptions": {
                        "last": true,
                        "display": "-1"
                    }
                },
                "Attach by Period": {
                    "cKey": "currentMonth",
                    "sKey": "quarter",
                    "display": "-5",
                    "exception": true,
                    "exceptionOptions": {
                        "last": true,
                        "display": "-1"
                    }
                },
                "SWSS Attach by Period - FM": {
                    "cKey": "currentMonth",
                    "sKey": "quarter",
                    "display": false,
                    "exception": true,
                    "exceptionOptions": {
                        "last": true,
                        "display": false
                    }
                },
                "SWSS Attach by Period - FY": {
                    "cKey": "currentYear",
                    "sKey": "quarter",
                    "display": false,
                    "exception": true,
                    "exceptionOptions": {
                        "last": true,
                        "display": false
                    }
                },
                "SWSS Attach by Period - FQ": {
                    "cKey": "currentQuarter",
                    "sKey": "quarter",
                    "display": false,
                    "exception": true,
                    "exceptionOptions": {
                        "last": true,
                        "display": false
                    }
                }
            },
            "drs": {
                "SFDC Booked Deals": {
                    "cKey": "currentQuarter",
                    "sKey": "quarter",
                    "display": "-4"
                },
                "Shipment History": {
                    "cKey": "currentYear",
                    "sKey": "quarter",
                    "display": "-5"
                }
            },
            "ciscoOne": {
                "Cisco ONE Shipment by Quarter": {
                    "cKey": "currentQuarter",
                    "sKey": "quarter",
                    "display": "-4"
                }
            },
            "tsRenew_opportunities": {
                "TS Renew Opportunity by Quarter": {
                    "cKey": "currentQuarter",
                    "sKey": "quarter",
                    "display": "-4"
                }
            },
            
            "tsRenew_overview": {
                "QTD Weekly Renewal Bookings": {
                    "cKey": "currentQuarter",
                    "sKey": "quarter",
                    "display": "-4"
                }
            },
             "tsRenew_bookings": {
                "TS Renewal Bookings by Quarter": {
                    "cKey": "currentQuarter",
                    "sKey": "quarter",
                    "display": "-4"
                }
            },
             "tsAttach_opportunities": {
                "TS Attach Opportunity by Quarter": {
                    "cKey": "currentQuarter",
                    "sKey": "quarter",
                    "display": "-4"
                },
                "Unattached Shipments by Period": {
                     "cKey": "currentMonth",
                    "sKey": "quarter",
                    "display": "-1"
                }

            },
            "tsAttach_overview": {
                "QTD Weekly Attach Service Sold": {
                    "cKey": "currentQuarter",
                    "sKey": "quarter",
                    "display": "-4"
                }
            },
             "tsAttach_bookings": {
                "Service Sold by Month": {
                    "cKey": "currentMonth",
                    "sKey": "quarter",
                    "display": "-1"
                }
            },
            "tsAttach_realization": {
                "Attach Rate by Sales Levels": {
                    "cKey": "currentQuarter",
                    "sKey": "quarter",
                    "display": "-4"
                }
            }

        }
    };

    return {
        getUniqueKeys: function (data, keyName, order) {
            var keysHashmap = {};
            for (var i = 0; i < data.length; i++) {
                if (data[i].hasOwnProperty(keyName)) {
                    if (typeof data[i][keyName] === "object") {
                        for (var fKey in data[i][keyName]) {
                            keysHashmap[fKey] = 0;
                        }
                    } else {
                        keysHashmap[data[i][keyName]] = 0;
                    }
                }
            }
            if (order) {
                return Object.keys(keysHashmap);
            } else {
                return Object.keys(keysHashmap).sort();
            }

        },
        getStartingIndex: function (data, view, slug, selection, colSize) {
            var sIndex = 0;
            var alignObj = chartAlignemntMap[view][slug][selection];
            if (!alignObj) {
                return sIndex;
            } else if (Object.keys(alignObj).length === 0) {
                return sIndex;
            }
            if (alignObj.cKey === false && alignObj.last === true) {
                return data.length - colSize;
            }

            for (var i = 0; i < data.length; i++) {
                if(alignObj.falseQuarter) {
                    if (data[i][alignObj.falseQuarter] === configServ[alignObj.cKey]) {
                        sIndex = i;
                    }
                } else {
                    if (data[i][alignObj.sKey] === configServ[alignObj.cKey]) {
                        sIndex = i;
                    }
                }
            }

            sIndex = sIndex + (+alignObj.display);

            sIndex = sIndex < 0 ? 0 : sIndex;
            if (alignObj.exception && sIndex === 0) {
                if (alignObj.exceptionOptions.last) {
                    sIndex = data.length - colSize;
                }
                if (alignObj.exceptionOptions.display) {
                    sIndex = eval("" + sIndex + alignObj.exceptionOptions.display); // jshint ignore:line
                }
            }
            if ((sIndex + colSize) > data.length) {
                sIndex = sIndex - ((sIndex + colSize) - data.length);
            }
            //condition for square charts because of not getting current month in response---Parth
            if (sIndex <= 0 && (selection === "Average Days to Attach by Sales Levels" || selection === "Average Days to Attach by Customers")) {
                sIndex = data.length - colSize;
            }
            return sIndex < 0 ? 0 : sIndex;
        },
        getOppHeading: function (c) {
            if (c !== undefined) {
                if (c.toLowerCase().indexOf('sales') > -1) {
                    return configServ.opportunitiesNameIndexMap[0];
                }
                else if (c.toLowerCase().indexOf('partner') > -1) {
                    return configServ.opportunitiesNameIndexMap[1];
                }
                else if (c.toLowerCase().indexOf('customer') > -1) {
                    return configServ.opportunitiesNameIndexMap[2];
                }
                else if (c.toLowerCase().indexOf('manager') > -1) {
                    return configServ.opportunitiesNameIndexMap[3];
                } else if (c.toLowerCase().indexOf('sav') > -1) {
                    return configServ.opportunitiesNameIndexMap[4];
                }
            }
            /*changes for DE135877*/
            if(c === "TS Attach Service Sold by Route to Market"){
                return "Market";
            }
        },
            isPercent: function (c) {
                if (c.categories) {
                    if (c.categories[0]) {
                        c.activeCategory = !c.activeCategory ? 0 : c.activeCategory;
                    } else {
                        c.activeCategory = !c.activeCategory ? 2 : c.activeCategory;
                    }
                }
                var title = c.categories ? c.categories[c.activeCategory] : c.title;
                if (title === undefined) {
                    return false;
                } else {
                return title.indexOf("%") > -1 || title.indexOf("Renewal Rate") > -1 || title.indexOf("Rate") > -1;
                }
            },
            getTileActiveOpp: function (c) {
                if (c !== undefined) {
                    if (c.toLowerCase().indexOf('sales') > -1) {
                        return configServ.opportunitiesKeyIndexMap[0];
                    } else if (c.toLowerCase().indexOf('partner') > -1) {
                        return configServ.opportunitiesKeyIndexMap[1];
                    } else if (c.toLowerCase().indexOf('customer') > -1) {
                        return configServ.opportunitiesKeyIndexMap[2];
                    } else if (c.toLowerCase().indexOf('manager') > -1) {
                        return configServ.opportunitiesKeyIndexMap[3];
                    } else if (c.toLowerCase().indexOf('sav') > -1) {
                        return configServ.opportunitiesKeyIndexMap[4];
                    }
                }
            },
            getTotalLabel: function (c) {
                if (c !== undefined) {
                if (c.toLowerCase().indexOf('bookings') > -1) {
                        return 'Total Bookings';
                } else if (c === 'Service Sold by Shipment Month') {
                    return 'Total Service';
                    } else if (c === 'In Quarter Renewal Rate') {
                        return 'Current Year RR';
                    }
                    else {
                        return 'Total Value';
                    }
                }
            },
            getListViewLabel: function (c, v, a) {
                var title = c.categories ? c.categories[c.activeCategory] : c.title;
                if (title === undefined) {
                    return false;
                } else if (a) {
                    return "Sub-Architectures";
                } else if (title === "SFDC Booked Deals" && v === "performance") {
                    return "Period";
                } else if (title === "SWSS Attach by Architecture" && v === "opportunities") {
                    return "Architectures";
                } else {
                    return configServ.chartListViewLabel[title];
                }
            },
            findWithAttr: function (array, attr, value) {
            for(var i = 0; i < array.length; i += 1) {
                    if(array[i][attr] === value) {
                        return i;
                    }
                }
                return -1;
            },
            cleansedFilters : function(filters) {
                var _appliedFilters = {};

                var _lastSalesLevel = {};
                var _coverageFilterApplied = "";
                var _propensityFilter = "";
                var _propensityLowerAttachFilter = "";
                var _propensityHigherAttachFilter = "";
                for (var i = 0; i < filters.length; i++) {
                    var _filter = filters[i];
                    if (_filter.categoryId === 1 && _filter.title === "*") {
                        continue;
                    }
                    if (_filter.categoryId === "sales" && (_filter.level > _lastSalesLevel.level || !_lastSalesLevel.level) && angular.isDefined(_filter.title)) {
                        if(_filter.title.length > 0){
                        _lastSalesLevel.title = _filter.title;
                        _lastSalesLevel.level = _filter.level;
                        _lastSalesLevel.levels_values = _filter.levels_values;
                        _appliedFilters.minLevel = _filter.level + 1;
                      } 
                       
                       _appliedFilters.parentNode = [];
                       if(filters[i].level > 0){
                             angular.forEach(_lastSalesLevel.title,function(value){
                              angular.forEach(_lastSalesLevel.levels_values,function(parentNode){
                                          if(value === parentNode.keys){
                                               _appliedFilters.parentNode.push(parentNode.parent)
                                          }
                              })
                          })
                            var uniqueNames = [];
                                angular.forEach(_appliedFilters.parentNode, function(i, el){
                                    if($.inArray(i, uniqueNames) === -1) uniqueNames.push(i);
                                });
                            _appliedFilters.parentNode = angular.copy(uniqueNames);
                       }
                          
                    } else if(_filter.categoryId === "salesAM" && _filter.title.length > 0){
                         _appliedFilters.accounts = _filter.title;
                    } else if (_filter.categoryId === "product" && angular.isDefined(_filter.title)) {
                        if (_filter.levelName === 'Architecture' && _filter.title.length > 0){
                            _appliedFilters.architectureGroups = JSON.stringify(_filter.title);
                        }
                        if (_filter.levelName === 'Sub-Architecture' && _filter.title.length > 0){
                            _appliedFilters.subArchitectureGroups = JSON.stringify(_filter.title);
                        }
                        if (_filter.levelName === 'Product Family' && _filter.title.length > 0){
                            _appliedFilters.productFamily = JSON.stringify(_filter.title);
                        }
                        if (_filter.levelName === 'Product ID' && _filter.title.length > 0){
                            _appliedFilters.productName = JSON.stringify(_filter.title);
                        }
                        if (_filter.levelName === 'Product Type' && _filter.title.length > 0){
                            _appliedFilters.productType = JSON.stringify(_filter.title);
                        }
                        if (_filter.levelName === 'Warranty' && _filter.title.length > 0){
                            _appliedFilters.warrantyCategory = JSON.stringify(_filter.title);
                        }
                        if (_filter.levelName === 'Suite' && _filter.title.length > 0){
                            _appliedFilters.Suite = JSON.stringify(_filter.title);
                        }
                        if (_filter.levelName === "Asset Type" && _filter.title.length > 0){
                            _appliedFilters.productClassification = JSON.stringify(_filter.title);
                        }
                    } else if (_filter.categoryId === "account" && angular.isDefined(_filter.title)) {

                        if (_filter.levelName === 'GU Name' && _filter.title.length > 0){
                            _appliedFilters.guName = JSON.stringify(_filter.title);
                        }
                        if (_filter.levelName === 'SAV Account' && _filter.title.length > 0){
                            _appliedFilters.customer = JSON.stringify(_filter.title);
                        }
                        if (_filter.levelName === 'Install Site' && _filter.title.length > 0){
                            _appliedFilters.installSite = JSON.stringify(_filter.title);
                        }
                        if (_filter.levelName === 'Country' && _filter.title.length > 0){
                            _appliedFilters.country = JSON.stringify(_filter.title);
                        }
                        if (_filter.levelName === 'Segment' && _filter.title.length > 0){
                            _appliedFilters.segment = JSON.stringify(_filter.title);
                        }
                        if (_filter.levelName === 'Vertical Market' && _filter.title.length > 0){
                            _appliedFilters.verticalMarket = JSON.stringify(_filter.title);
                        }
                        if (_filter.levelName === 'Partner' && _filter.title.length > 0){
                            _appliedFilters.partner = JSON.stringify(_filter.title);
                        }
                        if (_filter.levelName === 'Territory Coverage' && _filter.title.length > 0){
                            _appliedFilters.gvscsOrganisation = JSON.stringify(_filter.title);
                        }

                    } else if (_filter.categoryId === "services" && angular.isDefined(_filter.title)) {

                        if (_filter.levelName === 'Contract Type' && _filter.title.length > 0){
                            _appliedFilters.contractType = JSON.stringify(_filter.title);
                        }
                        if (_filter.levelName === 'Contract Number' && _filter.title.length > 0){
                            _appliedFilters.contractNumber = JSON.stringify(_filter.title);
                        }
                        if (_filter.levelName === 'Service SO' && _filter.title.length > 0){
                            _appliedFilters.serviceSO = JSON.stringify(_filter.title);
                        }

                    } else if (_filter.categoryId === "date") {
                         if (_filter.title === 'EoS Date'){
                                 _appliedFilters.eos = {};
                            if(angular.isDefined(_filter.from)){
                               _appliedFilters.eos.from = _filter.from;
                            }
                            if(angular.isDefined(_filter.to)){
                               _appliedFilters.eos.to = _filter.to;
                            }
                            if(angular.isDefined(_filter.direction)){
                               _appliedFilters.eos.direction = (_filter.direction === "From now") ? "fromNow" : _filter.direction;
                            }
                            if(angular.isDefined(_filter.period)){
                               _appliedFilters.eos.period = _filter.period;
                            }
                        }
                        if (_filter.title === 'LDoS Date'){
                            _appliedFilters.ldos = {};
                            if(angular.isDefined(_filter.from)){
                               _appliedFilters.ldos.from = _filter.from;
                            }
                            if(angular.isDefined(_filter.to)){
                               _appliedFilters.ldos.to = _filter.to;
                            }
                            if(angular.isDefined(_filter.direction)){
                               _appliedFilters.ldos.direction = (_filter.direction === "From now") ? "fromNow" : _filter.direction;
                            }
                            if(angular.isDefined(_filter.period)){
                               _appliedFilters.ldos.period = _filter.period;
                            }
                        }
                        if (_filter.title === 'Shipment / Processing Date'){
                            _appliedFilters.ship = {};
                            if(angular.isDefined(_filter.from)){
                               _appliedFilters.ship.from = _filter.from;
                            }
                            if(angular.isDefined(_filter.to)){
                               _appliedFilters.ship.to = _filter.to;
                            }
                            if(angular.isDefined(_filter.direction)){
                               _appliedFilters.ship.direction = (_filter.direction === "From now") ? "fromNow" : _filter.direction;
                            }
                            if(angular.isDefined(_filter.period)){
                               _appliedFilters.ship.period = _filter.period;
                            }
                        }
                        //For Contract End Date
                        if (_filter.title === 'Covered Line / Term End Date'){
                            _appliedFilters.cled = {};
                            if(angular.isDefined(_filter.from)){
                               _appliedFilters.cled.from = _filter.from;
                            }
                            if(angular.isDefined(_filter.to)){
                               _appliedFilters.cled.to = _filter.to;
                            }
                            if(angular.isDefined(_filter.direction)){
                               _appliedFilters.cled.direction = (_filter.direction === "From now") ? "fromNow" : _filter.direction;
                            }
                            if(angular.isDefined(_filter.period)){
                               _appliedFilters.cled.period = _filter.period;
                            }
                        }
                    }else if(_filter.categoryId === 'dataset'){
                        _appliedFilters.dataset = {};
                        if(_filter.coveredStartDate){
                            _appliedFilters.dataset['coveredStartDate'] = _filter.coveredStartDate;
                        }
                        if(_filter.coveredEndDate){
                            _appliedFilters.dataset['coveredEndDate'] = _filter.coveredEndDate;
                        }
                        if(_filter.uncoveredStartDate){
                            _appliedFilters.dataset['uncoveredStartDate'] = _filter.uncoveredStartDate;
                        }
                        if(_filter.coveredStartDate){
                            _appliedFilters.dataset['uncoveredEndDate'] = _filter.uncoveredEndDate;
                        }
                    } else if (_filter.categoryId === 5 ) {
                        _propensityFilter = _filter.refresh;
                    }else if(_filter.categoryId === 6) {
                        _propensityLowerAttachFilter = _filter.minValue;
                        _propensityHigherAttachFilter = _filter.maxValue;
                    } else if(_filter.categoryId === "coverage"){
                            _appliedFilters.coverage = _filter.coverage;
                    } else if(_filter.categoryId === "network"){
                            _appliedFilters.networkCollection = _filter.network;
                    } else if(_filter.categoryId === "sweeps"){
                        _appliedFilters.sweep = _filter.sweeps;
                }
                }

                if (_lastSalesLevel.level >=0 && _lastSalesLevel.level < 6) {
                        _appliedFilters.nodeName = _lastSalesLevel.title;
                }

                if (_coverageFilterApplied) {
                    _appliedFilters.coverage = _coverageFilterApplied;
                }
                if(_propensityFilter){
                    _appliedFilters.refreshPropensity = _propensityFilter;
                }
                if(_propensityLowerAttachFilter || _propensityHigherAttachFilter){
                    _appliedFilters.lowerAttachPropensity = _propensityLowerAttachFilter;
                     _appliedFilters.higherAttachPropensity = _propensityHigherAttachFilter;
                }

                return _appliedFilters;
            },

            setGlobalParam : function(globalFlag){
               globalViewFlag = globalFlag ?'Y': 'N';
            },

            getGlobalParam : function(){
                 return globalViewFlag;
            },

            setAmYornFlag : function(amYorn){
                amYornFlag = amYorn;
            },

            getAmYorn : function(){
                return amYornFlag;
            },

            // AutoRenewal state (subscription)
            setAutoRenewal : function(state){
                autoRenewal = state ? 'Y' : 'N';
            },
            getAutoRenewal : function(){
                return autoRenewal;
            },

            // To determine the active tab/subTab, fetcing laststring from the url.
            getSubTab: function() {
                let url = window.location.hash;
                let substr = url.substr(url.lastIndexOf('/') + 1);
                return substr;
            }

        };
    }]);