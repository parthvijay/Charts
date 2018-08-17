'use strict';
angular.module('ciscoExecDashApp').controller('ServicesController', ['$scope', 'opportunities', 'user', '$http', '$timeout', 'FiltersServ', 'OpportunitiesServ', 'PerformanceServ', 'UserServ', '$filter', 'ConfigServ', '$rootScope', '$routeParams', '$uibModal', '$q', '$sessionStorage', '$location', 'CiscoUtilities', '$controller', 'SldServ', function ($scope, opportunities, user, $http, $timeout, filtersServ, opportunitiesServ, performanceServ, userServ, $filter, configServ, $rootScope, $routeParams, $uibModal, $q, $sessionStorage, $location, CiscoUtilities, $controller, SldServ) {
        $controller('OpportunitiesController', {
            $scope: $scope,
            opportunities: opportunities,
            user: user,
            $http: $http,
            $timeout: $timeout,
            filtersServ: filtersServ,
            opportunitiesServ: opportunitiesServ,
            performanceServ: performanceServ,
            userServ: userServ,
            $filter: $filter,
            configServ: configServ,
            $rootScope: $rootScope,
            $routeParams: $routeParams,
            $uibModal: $uibModal,
            $q: $q,
            $sessionStorage: $sessionStorage,
            $location: $location,
            CiscoUtilities: CiscoUtilities
        });

        $rootScope.dashboard = 'services';
        $scope.colorsOpp = {};
        $scope.realizationXList = ['-2 Quarters', '-1 Quarter', 'In Quarter', '+1 Quarter ', '+2 Quarters ', '+3 Quarters ', '+4 Quarters '];
        $scope.checkedKeys = [];
        $scope.quarterFreqData = {};
        $scope.areaActive = [];
        $scope.quarterActive = [];
        $scope.chartFilters = {};
        $scope.chartFilters.sales = [];
        $scope.legendOrNodenameParam = "";
        $scope.chartFilters.savmGroupName = "[]";

        //var sldFiltersToBeApplied = sldCleansedFilters();

        //Change for assigning the current week - Sindhu
        $rootScope.$on('user-info-updated', function(event, data) {
            $scope.userData = data;
             $scope.currentQuarter =  $scope.userData.currentQuarter;
        });

        $scope.currentQuarter =  $scope.userData.currentQuarter;

        $scope.isChartClickable = function (c, i) {
            
            return true;
        };

        $scope.freezeHeader = function () {
            realizationTableScroll();
        };
        $scope.isAreaClickable = function (c, i) {
           
            return true;
        };

        $scope.closeDropdown = function () {
            $scope.quarterYearOpen = false;
        };
        $scope.hasMultipleSelection = function (c, i) {
          
            return true;
        };

        $scope.isQuarterClickable = function () {
            return true;
        };

        $scope.isQuarterFilterEnabled = function (c, i) {
            return true;
        };

        $scope.expanded_renewal_view = function (c) {
            if (c.expanded && (c.title == "TS Renewal Bookings by Route to Market" || c.title == "TS Attach Service Sold by Route to Market")){
                return true;
            }
            return false;
        }

         $scope.dataFormatting = function(c) {
                 var currentyear, previousyear;
                previousyear =  c.years["0"];
                  currentyear =   c.years["1"];
            var tdata = {};
            for(var i=0;i<c.sldData.length;i++) {
                for(var j=0;j<c.sldData[i].areas.length;j++) {
                    if(tdata[c.sldData[i].areas[j].state] == undefined) {
                        tdata[c.sldData[i].areas[j].state] = {currentyear: {"direct":c.sldData[i].areas[j].freq.Direct?c.sldData[i].areas[j].freq.Direct:0, "partner":c.sldData[i].areas[j].freq.Partner?c.sldData[i].areas[j].freq.Partner:0, "total": (c.sldData[i].areas[j].freq.Direct?c.sldData[i].areas[j].freq.Direct:0 + c.sldData[i].areas[j].freq.Partner?c.sldData[i].areas[j].freq.Partner:0)}, previousyear: {"direct":c.sldData[i].areas[j].freq_2.Direct?c.sldData[i].areas[j].freq_2.Direct:0, "partner":c.sldData[i].areas[j].freq_2.Partner?c.sldData[i].areas[j].freq_2.Partner:0, "total": (c.sldData[i].areas[j].freq_2.Direct?c.sldData[i].areas[j].freq_2.Direct:0 + c.sldData[i].areas[j].freq_2.Partner? c.sldData[i].areas[j].freq_2.Partner:0)}};
                    }
                    else {
                        tdata[c.sldData[i].areas[j].state][currentyear]["direct"] += c.sldData[i].areas[j].freq.Direct?c.sldData[i].areas[j].freq.Direct:0;
                        tdata[c.sldData[i].areas[j].state][currentyear]["partner"] += c.sldData[i].areas[j].freq.Partner?c.sldData[i].areas[j].freq.Partner:0;
                        tdata[c.sldData[i].areas[j].state][currentyear]["total"] += (c.sldData[i].areas[j].freq.Direct + c.sldData[i].areas[j].freq.Partner);
                        tdata[c.sldData[i].areas[j].state][previousyear]["direct"] += c.sldData[i].areas[j].freq_2.Direct?c.sldData[i].areas[j].freq_2.Direct:0;
                        tdata[c.sldData[i].areas[j].state][previousyear]["partner"] += c.sldData[i].areas[j].freq_2.Direct?c.sldData[i].areas[j].freq_2.Direct:0;
                        tdata[c.sldData[i].areas[j].state][previousyear]["total"] += (c.sldData[i].areas[j].freq_2.Direct + c.sldData[i].areas[j].freq_2.Partner);
                    }
                }
            }
            c.tdata = tdata;
            return tdata;
        }

        //Include distributor on overview tab is set
        $scope.isDistributor = function (isDistributorFlag) {
            $scope.globalCheckbox = isDistributorFlag;
            var opportunityTabParam = $scope.getActiveSubTab();

            $scope.getSPCdata($scope.tiles[1].activeCategory);

        }

        $scope.setExcelData = function (c) {
            var temp_array = [];
            c.data_set.forEach(function (quarter, i) {
                var obj1 = {};
                obj1["Fiscal Qtr ID"] = quarter.state;
                var obj2 = {};
                obj2["Fiscal Qtr ID"] = quarter.state + '_'
                c.categories.forEach(function (subQ) {
                    obj1[subQ] = "";
                    obj1[subQ + '_'] = "";
                    obj2[subQ] = "";
                    obj2[subQ + '_'] = "";
    
                })
                temp_array.push(obj1);
                temp_array.push(obj2);
                c.data_excel = temp_array;
            })
            
            c.data_excel.forEach(function (row) {
                var quarterState = row["Fiscal Qtr ID"];
                c.data_set.forEach(function (q, i) {
                    if (quarterState === q.state) {
                        Object.keys(q.freq).forEach(function (key) {
                            Object.keys(row).forEach(function (r) {
                                if (r === key) {
                                    row[key] = q.freq[key]["rr"] + '%';
                                }
                            })
                        })
                    } else if (quarterState.indexOf(q.state) > -1 && quarterState.indexOf('_') > -1) {
                        Object.keys(q.freq).forEach(function (key) {
                            Object.keys(row).forEach(function (r) {
                                if (r === key) {
                                    row[key] ='$'+ $filter('formatGridValue')(q.freq[key]["values"][0]);
                                }
                                else if (r.indexOf(key) > -1 && r.indexOf('_') > -1) {
                                    row[key + '_'] ='$'+ $filter('formatGridValue')(q.freq[key]["values"][1]);
                                }
                            })
                        })
                    }
                })
            })
        }

        $scope.csvDownload = function(event,c) {
            downloadCSV(event.target, c);
        };
        //Getting quarter data on overview tab
        $scope.getQYData = function () {
            var selectingCurrentQuarter = [];
            var index = 0;
            var count = 0;
            SldServ.getPeriod().then(function (response) {
                $scope.quarterYear = response.period;
                angular.forEach( $scope.quarterYear ,function(key,value){
                    selectingCurrentQuarter.push(value);
                    if($scope.quarterIdSelected==key)
                        index = count;

                    count++;
                })
                $scope.quarterYearSelected = selectingCurrentQuarter[index];
            });
        };

        $scope.getActiveSPCTab = function () { //activeTab
            var activeKey = null;
            angular.forEach($scope.tiles, function (tile) {
                if (tile['data-key'] === 'spc') {
                    activeKey = tile.activeCategory;
                }
            });
            return configServ.sldKeyIndexMap[activeKey] || "sales";
        }


        $scope.getSPCdata = function (index, opportunityTabParam, salesOrCust, chartId) {            
            var activeSPCKey = index;
            var sldFiltersToBeApplied = {};
            $scope.salesCustDrop = false;
        //changes for DE132385
            if($rootScope.weekData !== undefined && $rootScope.weekData){
                $scope.chartFilters.quarterId = $rootScope.weekData;
            }
            angular.extend(sldFiltersToBeApplied, $scope.getadvancedsldFilterObject());
            if (typeof index === "number") {
                activeSPCKey = configServ.sldKeyIndexMap[index];
                $scope.salesCustDrop = true;
            }

            $scope.$broadcast('active-spc-key-selection', activeSPCKey);

            SldServ.getSPCData($scope.opportunitiesActive, sldFiltersToBeApplied, $scope.getActiveSubTab(), $scope.globalCheckbox, activeSPCKey, opportunityTabParam, $scope.quarterIdSelected, $scope.chartFilters, $scope.salesCustDrop, salesOrCust, chartId).then(function (response) {
                $rootScope.accessIssue = "";
                $scope.tiles = response;
                matchTilesHeight(100);
            });         
        }


        $scope.getSelectedQuarter = function (key) {
            $scope.quarterIdSelected = key;
            $scope.tiles[2].activeCategory = 1;
            $scope.getData();
            
            
                
        }

        //Getting data for all the tabs.
        $scope.getData = function () {
            $('.tooltip').hide();
            $('.d3-tip').hide();
            if ($scope.getActiveSubTab() === "overview") {
                $scope.getQYData();
            }
         
           
            $scope.globalCheckbox = false;
            var sldFiltersToBeApplied = {};
            angular.extend(sldFiltersToBeApplied, $scope.getadvancedsldFilterObject());
            $scope.dashboard = "services";
            SldServ.getsldData($scope.opportunitiesActive, sldFiltersToBeApplied, $scope.getActiveSubTab(), $scope.quarterIdSelected, $scope.globalCheckbox).then(function (response) {
                $scope.moveScrollToBottom();
                $scope.resetActive();
                //To Get the data after selection retain in tsAttach/Renew Overview.by making weeklybookings API cal
                $scope.$emit('refresh-service-spc-data', {
                    'activeKey': '',
                    'chartId': 1,
                    'pcNodeName' : JSON.stringify($scope.areaActive),
                    'callParam' : "nodeNameClick"
                 })
                $rootScope.accessIssue = "";
                $scope.tiles = response;
                matchTilesHeight(100);
                $scope.resetChartFilters();
                if ($scope.getActiveSubTab() === "overview") {

                    $scope.tiles[1].activeCategory = 1;
                    $scope.tiles[2].activeCategory = 1;
                    if($scope.userData.currentQuarterId === $scope.quarterIdSelected){
                        $scope.currentQuarter = $scope.userData.currentWeek;
                        configServ.currentQuarter = $scope.userData.currentWeek;
                    } else {
                        $scope.currentQuarter = undefined;
                    }
                     //Change for assigning the current week - Sindhu
                } 
                else if ($scope.getActiveSubTab() === "realization"){
                    $scope.currentQuarter = $scope.userData.currentQuarter;
                    configServ.currentQuarter = $scope.userData.currentQuarter;
                    $scope.doExpand(response[0]);
                    configServ.currentQuarter = $scope.userData.currentQuarter;
                } else if($scope.getActiveSubTab() === "opportunities"){
                    $scope.tiles[2].activeCategory = 1;
                    $scope.currentQuarter = $scope.userData.currentQuarter;
                    configServ.currentQuarter = $scope.userData.currentQuarter;
                    $scope.currentMonth = $scope.userData.currentMonth;
                    configServ.currentQuarter = $scope.userData.currentQuarter;
                }
                else {
                    $scope.currentQuarter = $scope.userData.currentQuarter;
                    configServ.currentQuarter = $scope.userData.currentQuarter;
                    $scope.currentMonth = $scope.userData.currentMonth;
                    configServ.currentQuarter = $scope.userData.currentQuarter;
                    $scope.tiles[2].currentMonth=$scope.userData.currentMonth; //Change for assigning the current month- NM
                }
                //calling data formatting function explicitly tofix defect DE132140
                if($scope.tiles[1] && $scope.tiles[1].expanded === 1 && $scope.tiles[1].viewType === "list"){
                    $scope.dataFormatting($scope.tiles[1]);
                }




            });
        };

        $scope.openViewApplied = function () {
            $uibModal.open({
                templateUrl: 'views/modal/view-applied-filter.html',
                controller: 'ViewAppliedServiceFilterController',
                size: 'lg',
                backdrop: 'static'

            });
        };

        //function to call expand.
        $scope.doExpand = function (chartObj) {
            //making sure that category is empty before we fill it up -G

            //calling expand explicity
            //P.S. Important do not remove. -G
            if (chartObj.type === "line_chart_rr") {
                chartObj.currentQuarter = $scope.currentQuarter;
                chartObj.expanded = 1;
                chartObj.categories = [];
                // angular.forEach(chartObj.sldData, function (val) {
                //     chartObj.categories.push(val.state);
                // });
                for(var index = 0; index < chartObj.sldData.length; index++){
                    chartObj.categories.push(chartObj.sldData[index].state);
                    if (chartObj.sldData[index].state === chartObj.currentQuarter) {
                        break;
                    }
                }
                $timeout(function () {
                    $scope.toggleViewType(chartObj, "list");
                    $scope.expand(chartObj, 0, "tsRenew");
                }, 0);

            }
        }

        $scope.selectCategory = function (c, i, ind) {                     
            $scope.resetChartFilters();
            if (c.types) {
                c.type = c.types[i];
            }
            var tab = $scope.getActiveSPCTab();
            c.activeCategory = i;
            var opportunityTabParam = $scope.getActiveSubTab();
            if (c.id === 2) {
                opportunityTabParam = "opportunities";
            }
            if($scope.getActiveSubTab() === "realization"){
                if($scope.tiles[0]["unique_key"]=== "corporate_attach_rate")
                    {
                        $scope.setListKeys($scope.tiles[0]);
                    }
                $('.opportunity-tile').css("height", "auto");
                $('.opportunity-tile').css("min-height", "468px");
                return;
            }
            
            $scope.getSPCdata(i, opportunityTabParam);
            resetScrollPosition(ind);

        };

        $scope.$on('sld-apply-filter', function (data, event) {
            data.preventDefault();

            $scope.sldAppliedFilters = event.sldAppliedFilters;
            $scope.salesLevel = event.nodeName;
            $scope.sldAppliedFiltersCount = event.sldAppliedFiltersCount;


            $scope.sidebarActiveToggle(false);

            $scope.getData();
        });

         $scope.resetActive = function() {
            $scope.quarterActive = [];
            $scope.colorsOpp = {};
            $scope.active = [];

            //132531- Arun Dada - areaActive was becoming null whenever quarter change so i avoided it
            var temp=$scope.areaActive; 
            if($scope.tiles !== undefined && $scope.tiles[1]!==undefined && $scope.tiles[1].sldData[0]!==undefined){
            
            for(var i=0;i<$scope.tiles[1].sldData[0].areas.length;i++){
                 if($scope.tiles[1].sldData[0].areas[i].state===temp){
                        $scope.areaActive=temp;
                            break;
                      } 
                      if(temp.indexOf($scope.tiles[1].sldData[0].areas[i].state)>-1){
                        $scope.areaActive=temp;
                            break;
                      }
                      else
                            $scope.areaActive=[];     
                }
            }
        
        };

        $scope.resetChartFilters = function() {
            var activeKey = $scope.chartFilters.activeKey; // Change for DE132340
            $scope.chartFilters = {};
           // $scope.chartFilters.activeKey=activeKey; // Change for DE132340
            $scope.chartFilters.sales = [];
            $scope.chartFilters.quarterId = "[]";
            $scope.chartFilters.savmGroupName = "[]";
            $scope.resetActive();
        };

        var refreshServicePcData = $rootScope.$on('refresh-service-spc-data', function (event, data) {
            $('.tooltip').hide();
            $('.d3-tip').hide();
            var tab = $scope.getActiveSPCTab();
            // $scope.chartFilters.sales = [];
            if(!data.quarterId){
                data.quarterId = "[]";
            }
            $scope.chartFilters.quarterId = "[]";
            $scope.chartFilters.savmGroupName = "[]";
            $scope.saleOrCUst = false;
            if(!data.quarterId){
                data.quarterId = "[]";
            }
            var opportunityTabParam = $scope.getActiveSubTab();
            if (($scope.getActiveSubTab() === "overview") && $scope.tiles[1].activeCategory === 0 && (angular.equals(data.pcNodeName, undefined)) && angular.equals(data.week, undefined)) {
                return;
            } else{
                 if(data.chartId === 1 && $scope.getActiveSubTab() === "overview"){
                    if($scope.tiles[1].activeCategory === 0){
                        tab = "sales";
                    } else {
                        tab = "customer";
                    }
                    if (tab === "customer") {
                        $scope.chartFilters.savmGroupName = data.pcNodeName;
                       if (data.callParam === "nodeNameClick" && ($scope.opportunitiesActive === "tsAttach" || $scope.opportunitiesActive === "tsRenew")) {
                            tab = "weeklyBookings"
                        }
                    } else if (tab === "sales") {
                        $scope.chartFilters.sales = JSON.parse(data.pcNodeName);
                         if(data.callParam === "nodeNameClick" && $scope.opportunitiesActive === "tsAttach") {
                            tab = "weeklyBookings"
                        }

                     }

                     //for making click on chart calls , need to append weeklybookings to the url to update weekly renewal chart on over view tab :- KETAN
                   
                     if(!angular.equals(data.quarterId, {}) || !angular.equals(data.quarterId, undefined)){
                       data.quarterId = $scope.quarterIdSelected;
                     }
                  }
                else if(data.chartId === 0 && $scope.getActiveSubTab() === "opportunities"){
            //Change for DE129773 - Sindhu
                    if($scope.tiles[1].activeCategory === 0 && $scope.tiles[2].activeCategory === 0 && $scope.getActiveSubTab() === "opportunities"){
                        tab = "sales";
                        $scope.saleOrCUst = true;
                    } else    if($scope.tiles[1].activeCategory === 0 && $scope.tiles[2].activeCategory === 1 && $scope.getActiveSubTab() === "opportunities"){
                        tab = "customer";
                        $scope.saleOrCUst = true;
                    }

                    //for making click on chart calls , need to append weeklybookings to the url to update weekly renewal chart on over view tab :- KETAN

                } else if (data.chartId === 0) {
                    if ($scope.tiles[1].activeCategory === 0 && $scope.getActiveSubTab() === "overview") {
                        tab = "sales";
                        $scope.saleOrCUst = true;
                    } else {
                        tab = "customer";
                        $scope.saleOrCUst = true;

                    }  //Change for DE129773opposerv - Sindhu
                }else if(data.chartId === 2 && ($scope.getActiveSubTab() === "opportunities" || $scope.getActiveSubTab() === "overview")){
                    if(angular.equals(data.pcNodeName, "[]")){
                         opportunityTabParam = "opportunities";
                    }
                    if(tab === "customer"){
                        $scope.chartFilters.savmGroupName =  data.pcNodeName;
                        $scope.chartFilters.sales = [];
                    }
                    else if(tab === "sales" ){
                        $scope.chartFilters.sales =  JSON.parse(data.pcNodeName);
                        $scope.chartFilters.savmGroupName = [];
                    }

                }else if(data.chartId === 1 && $scope.getActiveSubTab() === "opportunities"){
                    $scope.saleOrCUst = true;
                }
        //changes for DE132385
                if($scope.opportunitiesActive === "tsAttach" && $scope.getActiveSubTab() === "overview"){
                    if(data.chartId === 0){
                        $rootScope.weekData = data.quarterId;
                    }
                }
                $scope.legendOrNodenameParam = "";
                $scope.chartFilters.activeKey = data.activeKey;
                $scope.chartFilters.quarterId = data.quarterId;
                $scope.getSPCdata(tab, opportunityTabParam, $scope.saleOrCUst, data.chartId);
            }

        });


        var refreshServiceAllData = $rootScope.$on('refresh-service-all-data', function (event, data) {

        });

        $scope.collapse = function (c) {
             //adding check to stop this code from shrinking line-chart-r-r to small size. -G
             if (c.title !== "Corporate 15/12 Attach Rate") {
                 c.expanded = 0;
                 if ($(window).width() < 850) {
                     c.columns = 4;
                 } else {
                     c.columns = 6;
                     $scope.moveScrollToBottom();
                 }
                 // Don't confuse with the above condition, we can be inside even if the chart type is line_chart_rr -G
                 if (c.type === "line_chart_rr" && c.checked) {
                     $scope.checkQuarters(c);
                 }
             } else {
                 if (c.expanded == true && c.disableExpandIcon == true) {
                     if (window.innerWidth < 850) {
                         c.columns = 4;
                     } else {
                         c.columns = 15;
                         $scope.moveScrollToBottom();
                     }
                     return;
                 }
             }
         }; 

        $scope.getadvancedsldFilterObject = function () {
            var filterObj = {};
            filterObj["sales"] = [];
            if ($scope.sldAppliedFilters) {
                angular.forEach($scope.sldAppliedFilters, function (value) {
                    switch (value.categoryId) {
                        case "sales":
                            filterObj.sales.push.apply(filterObj.sales, value.title)
                            break;
                        case "architectureGroups":
                            filterObj["architectureGroups"] = value.title;
                            break;
                        case "organization":
                            filterObj["gvscsOrganisation"] = value.title;
                            break;
                        default:
                            //do nothing
                            break;
                    }
                })
            }
            return filterObj;
        }

    }
]);
