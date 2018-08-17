/*jshint sub:true*/
'use strict';
angular.module('ciscoExecDashApp').controller('OpportunitiesController', [
    '$scope',
    'UserServ',
    '$http',
    '$route',
    '$timeout',
    'FiltersServ',
    'OpportunitiesServ',
    'SfdcServ',
    'PerformanceServ',
    '$filter',
    'ConfigServ',
    '$rootScope',
    '$routeParams',
    '$uibModal',
    '$q',
    '$location',
    'SecurityServ',
    'CiscoUtilities',
    'ShareDataServ',
    '$sessionStorage',
    'GlobalBookmarkServ',
    'Bookmark',
    'opportunities',
    'BookMarkData',
    '$window',
    function($scope, UserServ, $http, $route, $timeout, filtersServ, opportunitiesServ, sfdcServ, performanceServ, $filter, configServ, $rootScope, $routeParams, $uibModal, $q, $location, SecurityServ, CiscoUtilities, ShareDataServ, $sessionStorage, GlobalBookmarkServ,Bookmark, opportunities, BookMarkData, $window) {
        $rootScope.dashboard = 'sales';
        $rootScope.analysis = 'analysis';
        $scope.globalView = false; //If the bookmark url is copied and hit it directly, globalView was not been set
        $scope.hasSub = '';
        filtersServ.toggleInBookmark = false;
        var isCust = false;
        var isInquarterRenewal = false;
        var renewalRate = false;
        var renewalRateArch= false;
        var inQuarterRenewalRate = false;
        var attachRateBySalesLevel = false;
        var ceRenewInteraction = false;
        var updateCustomers = false;
        var attachCustomer = false;
        var ceAttachInteraction = false;
        var isQuartClicked = false;
        var updateAttachCustomers = false;
        var resetRenew = false;
        var fromToggle = false;
        var toggleglobaViewCheck =false;
        var salesSquareChart = false;
        var warrantyBarChart = false;
        var customerSquareChart = false;
        var toggleSubTab = false;
        var isFromFiscalSwitchButton = false;
        var activeCategoryBackup = undefined; //Changes for DE164052
        var drillRenewToProgression = false;
        $scope.showBackButton = false;
        $scope.rrtitle = false;
        $scope.subscription = '';
        $scope.isBack = false; // changes for DE132903
        $scope.drsShipListView = false;
        $scope.opportunities = opportunities;
        $scope.opportunitiesActive = $routeParams.opportunity;
        $scope.subopportunity = $routeParams.subopportunity;
        filtersServ.opportunitiesView = $scope.opportunitiesView;
        filtersServ.subopportunity = $scope.subopportunity;
        var retainActiveCategory=0;
        $scope.opportunitiesView = $routeParams.performance ? $routeParams.performance : 'opportunities';
        filtersServ.opportunitiesView = $scope.opportunitiesView;
        $scope.titleLimit = function (c) {
            if (c.expanded) {
                return 1000;
            } 
                return 45;
            };
        //the below change is to handle bookmark performance
        if($routeParams.performance !== undefined && $routeParams.performance.indexOf('performance') >=0){
                $scope.opportunitiesView = 'performance';
        }
        else{
             $scope.opportunitiesView = 'opportunities';
        }
        $scope.activeTab = 0;
        $scope.sidebarAnimated = true;
        $scope.userInfo = UserServ.data;
        configServ.currentQuarter = UserServ.data.currentQuarter;
        configServ.currentMonth = UserServ.data.currentMonth;
        configServ.currentYear = UserServ.data.currentYear;
        $scope.currentQuarter = UserServ.data.currentQuarter;
        $scope.currentMonth = UserServ.data.currentMonth;
        $scope.CiscoUtilities.setAmYornFlag(UserServ.data.amYorn);
        $scope.currentYear = UserServ.data.currentYear;
        $scope.quarterIdSelected = UserServ.data.currentQuarterId;
        $scope.colorsList = configServ.colors;
        $scope.changeAccountManager = false;
        $scope.filtersServ = filtersServ;
        $scope.hideoptionSymbols = false;
        $scope.isCampaigns = ($scope.opportunitiesActive === 'drs') ? true : false;
        $scope.constants = {
            opportunity: 'Actionable Opportunity',
            pipeline: 'SFDC Pipeline'
        };
        $scope.subArchLabel = 'See All Sub-Architectures';
        var pieChartActiveValue = undefined;
        $scope.canAccessTab = SecurityServ.canAccessTab;
        $scope.canCreatePipeline = SecurityServ.canCreatePipeline;
        if(!$scope.userInfo.sldPermission && $scope.opportunitiesActive !== "drs" && $scope.opportunitiesActive !== "ciscoOne" && ( $scope.opportunitiesActive === "tsRenew" ||  $scope.opportunitiesActive === "tsAttach")){
            $location.path('sales/analysis/asset');
        }

        if(!$scope.userInfo.asPermission && ($scope.opportunitiesActive === 'renew' && $scope.subopportunity === 'as')){
               $location.path('sales/analysis/asset');
        }
          if($scope.opportunitiesActive === 'attach' && $scope.subopportunity === 'swss'){
               $location.path('sales/analysis/asset');
        }
        //Change for DE171959
        if(window.location.hash === "#/sales/campaign/drs" || window.location.hash === "#/sales/campaign/ciscoOne") {
            $scope.CiscoUtilities.setGlobalParam(false);
            filtersServ.globalView = false;
        }

        //functions for bookmarks-Parth
        $scope.newBookmarkSaved = false;
        $scope.isFiltersChanged = false;
        $scope.globalBookmarkServ = GlobalBookmarkServ;
        $scope.currBookmark = null;
        if(JSON.parse($sessionStorage.get('bookmarkSelected'))!= null){
            GlobalBookmarkServ.checkSelectedBookMark();
        }

        /*$scope.currBookmark = GlobalBookmarkServ.bookmark;
        if($scope.currBookmark){
            if($scope.currBookmark.filter[5] !== undefined){
                $scope.globalView = $scope.currBookmark.filter[5];
                filtersServ.globalView = $scope.globalView;
                $scope.CiscoUtilities.setGlobalParam(filtersServ.globalView);
            }
        }*/

        $scope.$on('cmngFrmBookMark',function(data,event){
            if(event !== undefined && typeof(event) === 'boolean'){
                $scope.globalView = event;
            }
        });

        $scope.isBookmarkActive = GlobalBookmarkServ.isBookmarkActive;
        $scope.selectBookmark = GlobalBookmarkServ.selectBookmark;
        $scope.colorConfig = {};
        $scope.quartersDescColors = configServ.colorsPalette['services']['quartersDescColors'];
        $scope.quarterYearOpen = false;
        $scope.realizationXSubList = ['-2Q', '-1Q', 'In Q', '+1Q', '+2Q','+3Q', '+4Q'];
        $scope.realizationXList = ['-2 Quarters', '-1 Quarter', 'In Quarter', '+1 Quarter', '+2 Quarters','+3 Quarters', '+4 Quarters'];
        $scope.checkedKeys = [];
        $scope.quarterFreqData = {};
        $scope.linecountselected = 0;
        $scope.listamountselected = 0;
        $scope.selectedCorporateMonth = $scope.currentMonth;
        $scope.isSelectedDropDown = false;
        $scope.isDataCallReturned = true;
        $scope.selectedFiscal;

        if(UserServ.data.asPermission === false){
            if(angular.isDefined($scope.opportunities[2])) {
                if($scope.opportunities[2].subtabs[3]){
                    $scope.opportunities[2].subtabs.pop();
                }
            }

        }



        $scope.getListDataForSquareBlock = function (c) {
            var dataSet = {};
            c.currentMonthIndex = c.data[c.activeCategory].length-1;
            for(var i=0;i<c.data[c.activeCategory].length;i++){
                if($scope.currentMonth.replace(/ +/g, "").toLowerCase() == c.data[c.activeCategory][i].quarter.replace(/ +/g, "").toLowerCase()){
                    c.currentMonthIndex = i;
                }
                for(var j=0;j<c.data[c.activeCategory][i].areas.length;j++){
                    if(!dataSet[c.data[c.activeCategory][i].areas[j].state]){
                        dataSet[c.data[c.activeCategory][i].areas[j].state] = [];
                    }
                    dataSet[c.data[c.activeCategory][i].areas[j].state][i] = c.data[c.activeCategory][i].areas[j].days;
                }
            }
            c.dataSet = angular.copy(dataSet);
            c.allStates = Object.keys(c.dataSet);
        }

        $scope.addQuarters = function (c, selectedQuarter) {
            if (selectedQuarter===undefined) {
                selectedQuarter = $scope.currentQuarter;
            }
            if(!c.checked){
              c.checked =  [];
              var quarterNo = parseInt(selectedQuarter[1]);
              var year = parseInt(selectedQuarter.substring(4,6));
              var defaultPreviousYearQuarter = "Q" + quarterNo + "FY" + (year-1);
              for(var i = 0; i < c.data_set.length; i++){
                  c.checked[c.data_set[i]['state']] = (c.data_set[i]['state'] === selectedQuarter || c.data_set[i]['state'] === defaultPreviousYearQuarter)? true: false;
              }
              if (c.expanded) {
                        $scope.expand(c);
                    } else {
                        $scope.collapse(c);
                }
           }
       }

        $scope.addPreviousQuarters = function(key){
        var quarterNo = parseInt(key[1]);
        var year = parseInt(key.substring(4,6));
        if(quarterNo == 1) {
            year = year-1;
            return ("Q4FY" + year);
        }
        else {
            quarterNo = quarterNo - 1;
            return ("Q" + quarterNo + "FY" + year);
        }
    }

    $scope.addFutureQuaters = function(key){
        var quarterNo = parseInt(key[1]);
        var year = parseInt(key.substring(4,6));
        if(quarterNo == 4) {
            year = year+1;
            return ("Q1FY" + year);
        }
        else {
            quarterNo = quarterNo + 1;
            return ("Q" + quarterNo + "FY" + year);
        }
    }
         

         $scope.getQuarterValue = function(event, d){
             console.log(event,d);
         }


        $scope.isQuarterPresent = function(c, key, quarterNo,inQuarterIndex) {
            var tempObj;
            if(c.sldData){
                tempObj = c.sldData;
            } else {
                tempObj = c.data_set;
            }
            for (var i = 0; i < tempObj.length; i++) {
                if (tempObj[i]['state'] == key) {
                    // checking in Quarter value
                    var keys = angular.copy(Object.keys(tempObj[i]['freq']));
                    var inQuarterindex = keys.indexOf(key);
                    var arr = [];
                    //DE133292
                    if(keys.length == 1 && quarterNo == 0) {
                        arr[0] = angular.copy(tempObj[i]['freq'][keys[0]]);
                        arr[0]["state"] = keys[0];
                        return arr[quarterNo];
                    }

                    quarterNo = quarterNo - inQuarterIndex;
                    var flag = quarterNo >= 0 ? true : false;
                    quarterNo = Math.abs(quarterNo);
                    var tmpKey = key;
                    for(var k=0;k<quarterNo;k++) {
                        tmpKey = (flag == true) ? $scope.addFutureQuaters(tmpKey) : $scope.addPreviousQuarters(tmpKey);
                    }

                    if(tempObj){
                        if(tempObj[i]['freq'][tmpKey]) {
                            var arr = [];
                            arr = angular.copy(tempObj[i]['freq'][tmpKey]);
                            arr["state"] = tmpKey;
                            return arr;
                        }else{
                            return false;
                        }
                    }
                    else
                        return false;
                }
            }
        }

// Changes for US142538
//to store the subtab details after removing the broadcast for subscription
        $scope.getInsightFilters = function(activeTabValue,isSubtab){

            // for as renew explicit changes to hide product , status and dates filters
            if($scope.subopportunity === "as"){
                activeTabValue = "as";
                filtersServ.showInsightFilters(activeTabValue);
            }else{

            filtersServ.showInsightFilters(activeTabValue);
            }
            filtersServ.subopportunity = $scope.subopportunity;
            $rootScope.showRefreshInsightFilter     = filtersServ.showRefreshInsightFilter;
            $rootScope.showTSAttachInsightFilter    = filtersServ.showTSAttachInsightFilter;
        //adding the details from active-tab broadcast to already existing braodcast to reduce number of api calls
            var tempInsightFilters = {"showRefreshInsightFilter":filtersServ.showRefreshInsightFilter,
                                      "showTSAttachInsightFilter":filtersServ.showTSAttachInsightFilter,
                                      "oppotunityActive": $scope.opportunitiesActive, 
                                        "subOppotunityActive": $scope.subopportunity,
                                        "isSubTab": angular.isDefined(isSubtab)? isSubtab : false
                                    };
            $scope.$broadcast('opportunity-active-change',tempInsightFilters);
            // Changes for DE150615 and DE151166 - Sindhu
            $scope.$on('CountOnTab',function(data,event){
                $scope.appliedFiltersCount = event;
            });
        }


        $scope.getCheckedKeys = function(c) {
            var keys = Object.keys(c.checked);
            var result = [];
            for(var i=0;i<keys.length;i++) {
                if(c.checked[keys[i]] == true)
                    result.push(keys[i]);
            }
            $scope.checkedKeys = angular.copy(result);
        }

        $scope.getQuarterFreqData = function(c) {
           /* var tempObj;
            if(c.sldData){
                tempObj = c.sldData;
            } else {
                tempObj = c.data_set;
            }
            for(var i=0;i<tempObj.length;i++) {
                var result = [];
                var keys = Object.keys(tempObj[i].freq);
                for(var j=0;j<keys.length;j++) {
                    result[j] = tempObj[i].freq[keys[j]];
                }
                for(var j=result.length;j<7;j++) {
                    result[j] = {"rr":"", "values": ["",""]};
                }
                $scope.quarterFreqData[tempObj[i].state] = result;



            }*/
            var tempData = c.data_set ? c.data_set : c.sldData;
            for (var i = 0; i < tempData.length; i++) {
                var result = [];
                var keys = Object.keys(tempData[i].freq);
                var xList = (!c.expanded) ? angular.copy($scope.realizationXSubList) : angular.copy($scope.realizationXList);
                var inQuarterIndex = -1;
                for(var tempi = 0; tempi < xList.length; tempi++) {
                    if(xList[tempi].indexOf("In") != -1) {
                        inQuarterIndex = tempi;
                        break;
                    }
                }
                for(var tempi=0;tempi<xList.length;tempi++) {
                    var obj = $scope.isQuarterPresent(c, tempData[i].state, tempi, inQuarterIndex);
                    if(obj == false) {
                        result[tempi] = { "rr": "", "values": ["", ""] };
                    }
                    else
                        result[tempi] = obj;
                }
                $scope.quarterFreqData[tempData[i].state] = result;
             }
        }
        $scope.tableValues = function () {
            var keysArray = [];
            for (let key of $scope.tiles[1].keys) {
                var quarter = [];
                var quarterValue = [];
                var total = 0;
                for (let fItem of $scope.tiles[1].filtered) {
                    //If the key value is not present assign it with value 0
                    if (!fItem['freq'][key]) {
                        fItem['freq'][key] = 0;
                    }
                    total += fItem['freq'][key];
                    quarter.push(fItem['state']);
                    quarterValue.push(fItem['freq'][key]);
                }
                var item = Object.assign({}, { "name": key, "total": total, "state": quarterValue });
                keysArray.push(item);
            }
            $scope.subscription = keysArray;
        };

        $scope.getValueLabel = function(c) {
            if(c.viewType == 'chart' && c.type === "line_chart_rr"){
                if($scope.opportunitiesActive === 'attach'){
                return 'Attach Rate';
            }else{
                return 'Renewal Rate';
            }
            } else if (c.title === 'SFDC Booked Deals' || (c.categories && c.categories[c.activeCategory] === 'SFDC Booked Deals')) {
                return 'Expected Value in USD';
            } else if(c.viewType == 'chart' && c.isPercent){
                return 'Value shown in Percentage';
            } else if (c.type === 'square_block') {
                return 'Shipment Month';
            }
            return 'Value shown in USD';
        };

        var checkedItemsCache = []; // Change for DE158089
        $scope.checkQuarters = function (c, fromList) {
            if (c.type === 'line_chart_rr') {
                if (c.viewType === 'list' && !c.expanded) {
                    c.viewType = 'chart';
                }
                if(fromList){
                    checkedItemsCache.push(c.checked); // Change for DE158089
                }
                 // Change for DE158089
                if(checkedItemsCache.length > 0){
                    c.checked = checkedItemsCache[0];
                }
                var keys = Object.keys(c.checked);
                c.data = [];
                var xList = (!c.expanded) ? angular.copy($scope.realizationXSubList) : angular.copy($scope.realizationXList);
                var inQuarterIndex = -1;

                for(var tempi = 0; tempi < xList.length; tempi++) {
                    if(xList[tempi].indexOf("In") != -1) {
                        inQuarterIndex = tempi;
                        break;
                    }
                }
                for (var i = 0; i < xList.length; i++) {
                    var tmpObj = { 'state': xList[i], 'freq': {} };
                    for (var j = 0; j < keys.length; j++) {
                        if (c.checked[keys[j]] == false)
                            continue;
                        var result = $scope.isQuarterPresent(c, keys[j], i,inQuarterIndex);
                        if (result != false) {
                            tmpObj['freq'][keys[j]] = result;
                        }
                    }
                    c.data.push(tmpObj);
                }
                $scope.getCheckedKeys(c);
                $scope.getQuarterFreqData(c);
                $('.opportunity-tile').css("height", "auto");
                $('.opportunity-tile').css("min-height", "468px");
            }
        }
        $http.get('config/tooltips.json').then(function (d) {
        $scope.tooltips = d.data[0];        
    });

    $scope.setListViewElipsis = function (c) {
        if (c.viewType === 'list') {
            $timeout(function () {
                var x = document.getElementsByClassName("top-area1 fix-long-word");
                var extra = 0;
                if (!x.length) {
                    x = document.getElementsByClassName("customerData");
                    extra = 22;
                    if (x.length && c.expanded) {
                        return;
                    }
                }
                if (!x.length) {
                    var x = document.getElementsByClassName("sav-td second-col");
                }
                var width;
                for (var i = 0; i < x.length; i++) {
                    width = x[i].clientWidth - 10;
                }
                if ($scope.allowReportRequest(c)) {
                    width = width - 63 - extra;
                }
                if ($scope.allowReportRequest(c) && $scope.allowPipelineDetails(c) && $scope.canViewDetails()) {
                    width = width - 15;
                }
                if (c.categories) {
                    $('.custom-details tr td span.custom-name').css('max-width', width + 'px');
                    $('.expanded .table-scroll tr td:first-child > span').css('max-width', width + 'px');
                }
            }, 600);
        }
    }

    $scope.changeCheckedStates = function (c, state) {
        /*var a = $filter('filter')(c.lineCount, {title: state});
        var b =  $filter('filter')(c.listAmount, {title: state});*/
        var a=[];
        var b=[];
        angular.forEach(c.filtered,function(val){
                                      if(val.state === state){
                                         a.push({"title":state,"value":val.lineCount});
                                         b.push({"title":state,"value":val.listAmount});
                                      }
                                  })
        if (c.checkedstates == undefined || c.checkedstates.indexOf(state) == -1) {
            c.checkedstates.push(state);
            $scope.linecountselected += a[0].value;
            $scope.listamountselected += b[0].value;
        } else {
            c.checkedstates.splice(c.checkedstates.indexOf(state), 1);
            $scope.linecountselected -= a[0].value;
             $scope.listamountselected -= b[0].value;
        }
        //For case: To change the text between "Select All" or "Deselect All" based on the checkbox selections
        if (c.renderGraphForSelectAll && c.checkedstates.length !== c.filtered.length) {
            c.renderGraphForSelectAll = false;
        } else if (!c.renderGraphForSelectAll && c.checkedstates.length === c.filtered.length) {
            c.renderGraphForSelectAll = true;
        }
        //reset the ellipsis when in list view
        if (c.viewType === "list") {
            $scope.setListViewElipsis(c);
        }
    }
    $scope.selectAllCheckboxes = function (c) {
        //check if line count is available in data
        if (c) {
            $scope.linecountselected = 0;
            c.checkedstates = [];
            var a=[];
            var i=0;
            angular.forEach(c.filtered, function (value) {
                //var a = $filter('filter')(value.lineCount, {title: value.state});
                a.push({"value":value.lineCount,"title":value.state});
                c.checkedstates.push(value.state);
                $scope.linecountselected += a[i].value;
                i++;
                c.renderGraphForSelectAll = true;
            })
            //reset the ellipsis when in list view
            if (c.viewType === "list") {
                $scope.setListViewElipsis(c);
            }
        }
    }

    $scope.deselectAllCheckboxes = function (c) {
        c.checkedstates = [];
        $scope.linecountselected = 0;
        c.renderGraphForSelectAll = false;
        //reset the ellipsis when in list view
        if (c.viewType === "list") {
            $scope.setListViewElipsis(c);
        }
    }


    $scope.CheckedArea = function(ev) {
        $('.action_offset').hide();
        var state = $(ev.target).attr("state-id");
        if($scope.areaActive == undefined || $scope.areaActive.indexOf(state) == -1) {
            $scope.areaActive.push(state);
        }
        else {
            $scope.areaActive.splice($scope.areaActive.indexOf(state), 1);
        }
    }

    $scope.disableRequestReport = function (c){
        if(c.checkedstates == undefined || c.checkedstates.length == 0 || $scope.linecountselected > 500000){
            return true;
        }
        return false;
    }

    $scope.disableCollabRequest = function (c){
        if(c.checkedstates == undefined || c.checkedstates.length == 0 || c.checkedstates.length > 1){
            return true;
        }
        return false;
    }

    $scope.disableDownloadChart = function (c) {
        if (c.checkedstates == undefined || c.checkedstates.length == 0 || c.checkedstates.length > 4) {
            return true;
        }
        return false;
    }

    $scope.checkBoxCount = function (c){
        if(c.checkedstates == undefined || c.checkedstates.length > 1){
            return true;
        }
        return false;

    }

        $scope.getActiveOpportunityTitle = function() {
            for(var i=0;i<$scope.opportunities.length;i++) {
                if($scope.opportunities[i].slug == $scope.opportunitiesActive) {
                    return $scope.opportunities[i].title;
                }
            }
        }

        $scope.setListKeys = function(c) {
            c.listKeys = [];
            c.list_data = [];
            var tmpIndex = 0;
            if ($rootScope.dashboard === "sales") {
                /*for (var i = 1; i < c.data_net.length; i++) {
                    if (Object.keys(c.data_net[i].freq).length > Object.keys(c.data_net[tmpIndex].freq).length)
                        tmpIndex = i;
                }*/

                var fData = c.data_net ? c.data_net:c.data; // Changes by Shankar
                c.list_data = fData;

                //changing selected corporate month data.

                fData.forEach(function (a, b) {
                    if(a. quarter && a.quarter.indexOf($scope.selectedCorporateMonth) > -1){
                        fData = a.areas;
                        c.list_data = fData;
                    }
                });

                for (var i = 1; i < fData.length; i++) {
                   if(fData[i] && fData[i].freq){
                    if (Object.keys(fData[i].freq).length > Object.keys(fData[tmpIndex].freq).length){
                        tmpIndex = i;
                     }
                   }
                  }
                c.listKeys = angular.copy(Object.keys(fData[tmpIndex].freq));
                //c.listKeys = angular.copy(Object.keys(c.data_net[tmpIndex].freq));
            } else if ($rootScope.dashboard === "services") {
                for (var i = 1; i < c.data_net[c.activeCategory].length; i++) {
                    if (Object.keys(c.data_net[c.activeCategory][i].freq).length > Object.keys(c.data_net[c.activeCategory][tmpIndex].freq).length)
                        tmpIndex = i;
                }
                c.listKeys = angular.copy(Object.keys(c.data_net[c.activeCategory][tmpIndex].freq));
            }
        }


        $scope.clearBookmark = function() {
            $scope.currBookmark = null;
            GlobalBookmarkServ.clearBookmark();
        }

        $scope.getActiveTitle = function() {
            // Chnages for DE164142
            /*if ($location.$$path.search($scope.opportunitiesActive) > -1) {//DE164142- Bookmarks view changes
                return 'CiscoOne';
            }*/
            for(var i=0;i<$scope.opportunities.length;i++) {
                if($scope.opportunities[i].slug == $scope.opportunitiesActive) {
                    for(var j=0;typeof($scope.opportunities[i].subtabs) != "undefined" && j<$scope.opportunities[i].subtabs.length;j++) {
                        if($scope.subopportunity == $scope.opportunities[i].subtabs[j].slug)
                            return $scope.opportunities[i].subtabs[j].title;
                    }
                }
            }
            return "Asset";
        };


        // $scope.getAnnualMultiData = function (c) {
        //     if ( $scope.showTotalRenewCustomerExpand(c)) {
        //         var activeC = c.activeCategory;
        //         if (!c.categories || activeC === null) {
        //             return;
        //         }
        //         var title = c.categories[activeC];
        //         title = title ? title : "";
        //         var customer = title.toLowerCase().indexOf("customer") > -1
        //         var partner = title.toLowerCase().indexOf("partner") > -1;
        //         var sales = title.toLowerCase().indexOf("sales") > -1;
        //         var accountManager = title.toLowerCase().indexOf("account") > -1;

               
                
        //        var res = opportunitiesServ.getExpandedCustomerViewData($scope.opportunitiesActive, activeReportTab, pfBookmark,activeSubTab, selectedTab).then(function(response) {
        //             c.savAccountsList = response['data_List'];
        //             c.savAccountsNet =  response['data_net'];
        //             $scope.annualMultiData = response['data_net'];
        //             c.data_csv = response.data_net;
        //             c.data_listView = [];
        //             c.data_listView.firstTableHead = [];
        //             c.data_listView.secondTableHead = [];
        //             angular.forEach(response.data_net, function (v, i) {
        //                 if (i === 0) {
        //                     var firstTableHeadObj = {};
        //                     Object.keys(v).forEach(function (key, i) {
        //                         if (v[key] !== "") {
        //                             firstTableHeadObj[key] = v[key];
        //                         }
        //                     })
        //                     c.data_listView.firstTableHead.push(firstTableHeadObj);
        //                 } else if (i === 1) {
        //                     var secondTableHeadObj = {};
        //                     Object.keys(v).forEach(function (key, i) {
        //                         if (v[key] !== "") {
        //                             secondTableHeadObj[key] = v[key];
        //                         }
        //                     })
        //                     c.data_listView.secondTableHead.push(secondTableHeadObj);
        //                 } else {
        //                     c.data_listView.push(v);
        //                 }
        //             });
        //         });
        //     }
    
        // };

        $scope.filtersChanged = function() {
            if($rootScope.currentBookmark != null) {
                var bookmarkFilters = $rootScope.currentBookmark.bookmark.filterData;
                var appliedFilters = filtersServ.appliedFilters;
                $scope.isFiltersChanged = !angular.equals(bookmarkFilters, appliedFilters);
            }
            else
                $scope.isFiltersChanged = false;
        };



        $scope.getBookmarkFromUrl = function() {
            if ($scope.opportunitiesView === 'performance') {
                return ("/" + $rootScope.dashboard + '/' + $rootScope.analysis + '/' + $scope.opportunitiesActive + ((typeof ($scope.subopportunity) != "undefined") ? '/' + $scope.subopportunity : '') + ((typeof ($scope.opportunitiesView) != "undefined") ? '/' + $scope.opportunitiesView : ''));
            } else {
                return ("/" + $rootScope.dashboard + '/' + $rootScope.analysis + '/' + $scope.opportunitiesActive + ((typeof ($scope.subopportunity) != "undefined") ? '/' + $scope.subopportunity : ''));
            }
        };


        $scope.openSaveBookmarkModal = function (currentBookmark) {
            var openSaveBookmarkModalInstance = $uibModal.open({
                templateUrl: 'views/modal/save-bookmark.html',
                controller: 'SaveBookmarkController',
                size: 'sm',
                resolve: {
                    BookmarkResolve: ['BookMarkData', 'Bookmark', function (BookMarkData, Bookmark) {
                        var bookmark = (currentBookmark)? new Bookmark(BookMarkData.getBookMark(currentBookmark, currentBookmark.activeBookamrkType, currentBookmark.subType)) : new Bookmark();
                        bookmark.from = $scope.getBookmarkFromUrl();
                        bookmark.fromSubTabTitle = $scope.getActiveTitle();
                        if(angular.isDefined($scope.tiles)){
                        var activecat = $scope.tiles[0].activeCategory;                        
                        var middlecat= $scope.tiles[1].activeCategory;
                        var activecat2 = $scope.tiles[2].activeCategory;
                         }                        
                        var globalView = filtersServ.globalView;
                        var filtersArray = JSON.parse($sessionStorage.get('advancedFilters'));
                        bookmark.filterData = [];
                        bookmark.filterData.push($scope.appliedFilters);
                        bookmark.filterData.push(filtersArray);
                        bookmark.filterData.push(activecat);
                        bookmark.filterData.push(activecat2);
                        bookmark.filterData.push(middlecat);
                        bookmark.filterData.push(globalView);
                        if (currentBookmark) {
                            return {
                                Bookmark: bookmark,
                                activeBookamrkType: currentBookmark.activeBookamrkType,
                                subType: currentBookmark.subType,
                                showSaveAs: (currentBookmark.createdBy === $scope.userInfo.user.fullName),
                                isEditModal: false
                            };
                        } else {
                            return {Bookmark: bookmark, showSaveAs: false};
                        }
                    }]
                }
            });
            openSaveBookmarkModalInstance.result.then(function (response) {
                $scope.newBookmarkSaved = true;
                $timeout(function () {
                    $scope.newBookmarkSaved = false;
                }, 10000);
                $scope.filtersChanged();
            }, function (err) {
                console.log("err");
            })
        };

        $scope.openBookmarksDefinition = function (currentBookmark) {
            $uibModal.open({
                templateUrl: 'views/modal/view-applied-filter.html',
                controller: 'ViewAppliedController',
                size: 'lg',
                resolve: {
                    filters: function () {
                        return currentBookmark.filter;
                    },
                    bookmark: currentBookmark
                }
            });
        };

        var productFamily;

        $scope.CiscoUtilities = CiscoUtilities;

        $rootScope.$emit('user-info-updated', UserServ.data);

         $scope.requestText = function () {
        if ($scope.opportunitiesActive === 'ciscoOne') {
            return 'Request Cisco One Report';
        } if ($scope.subopportunity === 'as') {
            return 'Request AS Renew Opportunity Detail Report';
        } else {
            return 'Request Customer Detail Report';
        }
    }
      $scope.salesReport = function () {
        if ($scope.subopportunity === 'as') {
            return 'Request AS Renew Opportunity Detail Report';
        } else {
            return 'Request IB Inventory Report';
        }
    }
        //Fix for getting subtabs on loading :- Parth
        $scope.activeTab = $scope.opportunities.map(function(e) {
            return e.slug;
        }).indexOf($scope.opportunitiesActive);

        $('.sidebar-nav').scroll(function() {

            var s = $(this).scrollTop();
            $(this).find('.dropdown-menu.inner').css('margin-top', 0 - s);
        });

        $(document).on('mouseenter', 'li.sales-subfilter .ico-close', function() {
            var li = $(this).closest('li');
            var cat = li.attr('data-category');
            li.nextAll('li.sales-subfilter').filter('[data-category="' + cat + '"]').addClass('delete-line');
        });

        $(document).on('mouseleave', 'li.sales-subfilter .ico-close', function() {
            var li = $(this).closest('li');
            var cat = li.attr('data-category');
            li.nextAll('li.sales-subfilter').filter('[data-category="' + cat + '"]').removeClass('delete-line');
        });

        $rootScope.sidebarActive = false;
        $scope.appliedFilters = [];
        $scope.chartFilters = {};
        $scope.exceptionKeys = ["Compare", "Total", "sales"];
        $scope.closeAlert = function(index) {
            $scope.alerts.splice(index, 1);
        };

        if ($rootScope.dashboard == 'service') {
            $scope.opportunitiesActive = 'renew';
            $scope.activeTab = 1;
        }


        // $scope.getQuarters = function (c) {
        //     if(c && c[0]){
        //         return c[0].quarters;
        //     }
        // };

        var showShadow = function() {
            var $this = $('.sidebar-nav');
            var s_top = $this.scrollTop();
            if (s_top === 0) {
                $('.sidebar-brand').removeClass('shadow');
                $('.fixed-bottom').addClass('shadow');
            } else if ($this.scrollTop() + $this.innerHeight() >= $this[0].scrollHeight) {
                $('.fixed-bottom').removeClass('shadow');
                $('.sidebar-brand').addClass('shadow');
            } else {
                $('.sidebar-brand').addClass('shadow');
                $('.fixed-bottom').addClass('shadow');
            }
        };

        var matchTilesHeight = function(t) {
            $timeout(function() {
                var max_height = 0;
                $('.opportunity-tile:not(.error-tile)').each(function() {
                    $(this).css("height", "");
                    var h = $(this).height();
                    max_height = h > max_height ? h : max_height;
                });
                $('.opportunity-tile').height(max_height);
                $('.kpi').hide().css('visibility', 'visible');
                $('.kpi').fadeIn('slow');
            }, t);
        };

        var initSlick = function() {
            $('.slick-carousel').slick({
                dots: false,
                infinite: false,
                slidesToShow: 5,
                slidesToScroll: 5,
                responsive: [{
                    breakpoint: 1200,
                    settings: {
                        slidesToShow: 4,
                        slidesToScroll: 4
                    }
                }, {
                    breakpoint: 1024,
                    settings: {
                        slidesToShow: 3,
                        slidesToScroll: 3
                    }
                }, {
                    breakpoint: 900,
                    settings: {
                        slidesToShow: 2,
                        slidesToScroll: 2
                    }
                }, {
                    breakpoint: 768,
                    settings: "unslick"
                }]
            });
        };

        $('.sidebar-nav').scroll(function() {
            var s = $(this).scrollTop();
            $(this).find('.dropdown-menu.inner').css('margin-top', 0 - s);
        });

        $(document).on('mouseenter', 'li.sales-subfilter .ico-close', function() {
            var li = $(this).closest('li');
            var cat = li.attr('data-category');
            li.nextAll('li.sales-subfilter').filter('[data-category="' + cat + '"]').addClass('delete-line');
        });

        $(document).on('mouseleave', 'li.sales-subfilter .ico-close', function() {
            var li = $(this).closest('li');
            var cat = li.attr('data-category');
            li.nextAll('li.sales-subfilter').filter('[data-category="' + cat + '"]').removeClass('delete-line');
        });

        $(window).resize(function() {
            $('.slick-carousel').slick('resize');
        });

        $(window).on('orientationchange', function() {
            $('.slick-carousel').slick('resize');
        });

        $(document).mouseup(function(e) {
            var container = $(".action_offset,.action-button");
            if (!container.is(e.target) && container.has(e.target).length === 0) {
                $(".action_offset").hide();
            }

            container = $('svg, .d3-tip');
            if (!container.is(e.target) && container.has(e.target).length === 0) {
                //$(".d3-tip").hide();
            }

        });

        /* jQuery Code to be moved to directives - End */

        
        $scope.appliedFilters = [];

        $scope.closeAlert = function(index) {
            $scope.alerts.splice(index, 1);
        };

        $scope.getUniqueArch = function(data, keyName) {
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
            return Object.keys(keysHashmap).sort();
        }
        $scope.$watch('tiles', function (newValue, oldValue) {
            $scope.tableValues();
        },true);
        
        var campAreaWatch = $scope.$watch('areaActive', function(newVal) {
            if ($rootScope.analysis !== 'campaign') {
                return;
            }
            if (typeof $scope.tiles !== 'undefined' && $scope.tiles.length) {
                $scope.tiles.forEach(function(c) {
                    if (c.type === 'bar_double') {
                        $scope.normalizeDC(c);
                    }
                });
            }
        }, true);

        var campActiveDrillWatch = $scope.$watch('campActiveDrill', function(newVal) {
            if ($rootScope.analysis !== 'campaign') {
                return;
            }
            if (typeof $scope.tiles !== 'undefined' && $scope.tiles.length) {
                $scope.tiles.forEach(function(c) {
                    if (c.type === 'bar_double_horizontal') {
                        if(angular.isDefined(c.data_net)){
                            $scope.normalizeDHCNet(c);
                        }
                        $scope.normalizeDHC(c);
                    }
                });
            }
        });

        var pieActiveDrillWatch = $scope.$watch('pieActiveDrill', function(newVal) {
            if (newVal) {
                $scope.resetChartFilters();
                if (($scope.subopportunity === 'ts' || $scope.subopportunity === 'swss') && newVal!=="In Quarter Renewal Rate"){
                    $scope.getData();
                }// to differentiate between ts and swss renew with the total renew in case of drill down in first chart
                else if($scope.subopportunity === 'total' && newVal!=="In Quarter Total Renewal Rate"){
                    $scope.getData();
                }
                else if($scope.opportunitiesActive === "refresh" || $scope.opportunitiesActive === "drs"){
                    $scope.getData();
                }
            }
        });

        var drillQuarterRate = $scope.$on('drill-quarter-rate', function(event, data) {
            drillRenewToProgression = true;
            $scope.rrtitle = true;
            $scope.getData();
        })

        $scope.isPercent = function(c) {
            if (c.categories) {
                if (c.categories[0]) {
                    c.activeCategory = !c.activeCategory ? 0 : c.activeCategory;
                } else {
                    c.activeCategory = !c.activeCategory ? 2 : c.activeCategory;
                }
            }
            var title = c.categories ? c.categories[c.activeCategory] : c.title;
            c.isPercent = title.indexOf("%") > -1;
        };

        $scope.CheckedArea = function(ev) {
            $('.action_offset').hide();
            var state = $(ev.target).attr("state-id");
            if($scope.areaActive == undefined || $scope.areaActive.indexOf(state) == -1) {
                $scope.areaActive.push(state);
            }
            else {
                $scope.areaActive.splice($scope.areaActive.indexOf(state), 1);
            }
            $scope.$emit('refresh-all-data', {'pcNodeName': JSON.stringify($scope.areaActive)});
        }


        $scope.defaultWaterfall = function () {
            if ($scope.opportunitiesActive === 'renew' && ($scope.subopportunity === 'ts' || $scope.subopportunity === 'total' || $scope.subopportunity === 'swss') && $scope.opportunitiesView === 'performance') {
                opportunitiesServ.defaultWaterfall = true;
            }
        };
        $scope.defaultWaterfall();

        $scope.setExcelData = function (c) {
            var temp_array = [];
            c.data_set.forEach(function (quarter, i) {
                var obj1 = {};
                obj1["Fiscal Qtr ID"] = quarter.state;
                var obj2 = {};
                obj2["Fiscal Qtr ID"] = quarter.state + '_'
                c.rr_categories.forEach(function (subQ) {
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

        $scope.showTotalRenewCustomerExpand = function (c) {
            var activeC = c.activeCategory;
            if (!c.categories || activeC === null) {
                return;
            }
            var title = c.categories[activeC];
            title = title ? title : "";
            var customer = title.toLowerCase().indexOf("customer") > -1;
            if (c.expanded && customer && c.viewType == 'list' && $scope.opportunitiesActive == 'renew' && $scope.subopportunity == 'total' && c.type == 'bar_stacked_horizontal' && $scope.opportunitiesView === 'opportunities') {
                return true;
            }
            return false;
        }
    
        $scope.showTSSWSSRenewCustomerExpand = function (c) {
            var activeC = c.activeCategory;
            if (!c.categories || activeC === null) {
                return;
            }
            var title = c.categories[activeC];
            title = title ? title : "";
            var customer = title.toLowerCase().indexOf("customer") > -1;
            if (c.expanded && customer && c.viewType == 'list' && $scope.opportunitiesActive == 'renew' &&
                ($scope.subopportunity == 'ts' || $scope.subopportunity == 'swss') &&
                c.type == 'bar_stacked_horizontal' && $scope.opportunitiesView === 'opportunities') {
                return true;
            }
            return false;
        }
    
        $scope.showTSPartnerSalesAMExpand = function (c) {
            var activeC = c.activeCategory;
            if (!c.categories || activeC === null) {
                return;
            }
            var title = c.categories[activeC];
            title = title ? title : "";
            var customer = title.toLowerCase().indexOf("customer") > -1;
            if (c.expanded && !customer && c.viewType == 'list' && $scope.opportunitiesActive == 'renew' &&
                $scope.subopportunity == 'ts' &&
                c.type == 'bar_stacked_horizontal' && $scope.opportunitiesView === 'opportunities') {
                return true;
            }
            return false;
        }
    
        $scope.showSWSSPartnerSalesAMExpand = function (c) {
            var activeC = c.activeCategory;
            if (!c.categories || activeC === null) {
                return;
            }
            var title = c.categories[activeC];
            title = title ? title : "";
            var customer = title.toLowerCase().indexOf("customer") > -1;
            if (c.expanded && !customer && c.viewType == 'list' && $scope.opportunitiesActive == 'renew' &&
                $scope.subopportunity == 'swss' &&
                c.type == 'bar_stacked_horizontal' && $scope.opportunitiesView === 'opportunities') {
                return true;
            }
            return false;
        }

        // US194310: Akash changed logic
        $scope.getAnnualMultiData = function (data,c) {
            if ($scope.showTSPartnerSalesAMExpand(c) || $scope.showSWSSPartnerSalesAMExpand(c) || $scope.showTSSWSSRenewCustomerExpand(c) || $scope.showTotalRenewCustomerExpand(c)) {
                var activeC = c.activeCategory;
                if (!c.categories || activeC === null) {
                    return;
                }
                var title = c.categories[activeC];
                title = title ? title : "";
                var customer = title.toLowerCase().indexOf("customer") > -1
                var partner = title.toLowerCase().indexOf("partner") > -1;
                var sales = title.toLowerCase().indexOf("sales") > -1;
                var accountManager = title.toLowerCase().indexOf("manager") > -1;
                var link = "config/expanded_listviews/" + $scope.opportunitiesActive + "_" + $scope.subopportunity + "_";
                if (partner) {
                    link = link + "partners.json";
                } else if (sales) {
                    link = link + "sales.json";
                } else if (accountManager) {
                    link = link + "manager.json"
                } else if (customer) {
                    link = link + "customers.json"
                }
                $http.get(link, {}).then(function (response) {
                    $scope.data_csv = response.data;
                    if($scope.opportunitiesActive==='renew' && $scope.subopportunity==='total'){
                      data.data_List = data.data_net;  
                    }
                    angular.forEach( data.data_net, function (v) {
                        var temp_data_csv = {};
                        for (var key in $scope.data_csv[1]) {
                                temp_data_csv[key] = v[key] ? v[key] : "";
                        }
                        $scope.data_csv.push(temp_data_csv);    
                    });
                });

            }
    
        };

        $scope.csvDownload = function(event,c) {
            if ($scope.showTSPartnerSalesAMExpand(c) || $scope.showSWSSPartnerSalesAMExpand(c) || $scope.showTSSWSSRenewCustomerExpand(c) || $scope.showTotalRenewCustomerExpand(c)) {
                var title = c.categories[c.activeCategory];
                $scope.csv_data = angular.copy($scope.data_csv);
                angular.forEach($scope.csv_data, function (data,i) {
                    angular.forEach(data, function (v,j) {
                        if (!isNaN(v) && v != "") {
                            $scope.csv_data[i][j] = $filter('formatGridValue')(v); 
                        }
                    });
                });
                alasql('SELECT * INTO XlSX("'+title.split(' ').join('_')+'.csv",{headers:false}) FROM ?',[$scope.csv_data]);
            }else{
                downloadCSV(event.target, c);
            }
        };

        $scope.allowReportRequest = function (c) {
            if (($scope.subopportunity === 'swss' && $scope.opportunitiesView === 'performance') || ($scope.subopportunity === 'total' && $scope.opportunitiesView === 'performance')) {
                return false;
            }
            return $scope.allowCustomerReport(c) || $scope.allowSmartReport(c) || $scope.allowActionMetrics(c) || $scope.allowPipelineDetails(c) || $scope.inventoryReport(c);
        };

        $scope.showActionsDropdown = function (c) {
           return  $scope.allowActionMetrics(c) || $scope.allowPipelineDetails(c) || $scope.allowContractDetails(c);
        };

        $scope.isFiveSalesFilter = function(){
            var salesFilterCount = 0;
            if($scope.appliedFilters && $scope.appliedFilters.length > 0){
                for(var index = 0; index < $scope.appliedFilters.length; index++){
                    if($scope.appliedFilters[index].categoryId === 'sales'){
                        salesFilterCount++;
                    }
                }
            }
            return (salesFilterCount > 4)
        };

        $scope.allowCustomerReport = function (c) {

            if ($scope.opportunitiesActive === 'attach' && $scope.subopportunity === 'ts' && $scope.opportunitiesView === 'performance') {
                return false;
            }
            if($scope.opportunitiesActive === 'attach' && $scope.subopportunity === 'swss' && $scope.opportunitiesView === 'performance'){
                return false;
            }
            if ($scope.opportunitiesActive === 'renew' && ($scope.subopportunity === 'ts' || $scope.subopportunity === 'total' || $scope.subopportunity === 'swss') && $scope.opportunitiesView === 'performance') {
                return false;
            }   
            if($scope.opportunitiesActive === 'tsRenew' || $scope.opportunitiesActive === 'tsAttach'|| $scope.opportunitiesActive==='swssAttach'){
                return false;
            }
            if (c) {
                var activeC = c.activeCategory;
                if (!c.categories || activeC === null) {
                    return;
                }
                var title = c.categories[activeC];
                if(title){
                    return title.toLowerCase().indexOf("customer") > -1;
                } else {
                    return false;
                }
            }
        };
     $scope.inventoryReport = function (c) {
        if ($scope.opportunitiesActive === 'attach' && $scope.subopportunity === 'total' && $scope.opportunitiesView === 'performance') {
            return false;
        }
        if ($scope.opportunitiesActive === 'attach' && $scope.subopportunity === 'ts' && $scope.opportunitiesView === 'performance') {
            return false;
        }
        if ($scope.opportunitiesActive === 'attach' && $scope.subopportunity === 'swss' && $scope.opportunitiesView === 'performance') {
            return false;
        }
        // changes to enable Total renew performance as TS renew performance
        if ($scope.opportunitiesActive === 'renew' && ($scope.subopportunity === 'ts' || $scope.subopportunity === 'total' || $scope.subopportunity === 'swss') && $scope.opportunitiesView === 'performance') {
            return false;
        }
          if ($scope.opportunitiesActive === 'drs' || $scope.opportunitiesActive === 'ciscoOne' ){
            return false;
        }

        if (c) {
            var activeC = c.activeCategory;
            if (!c.categories || activeC === null) {
                return;
            }
            var title = c.categories[activeC];
                if(title && $rootScope.dashboard !== 'services'){ // changes for not returning true for SLD bookings by Sales chart which was showing FIlter to this customer dropdown 
                    return title.toLowerCase().indexOf("sales") > -1 || title.toLowerCase().indexOf("account managers") > -1;
                } else {
                    return false;
                }
        }
        };

        /*$scope.allowCustomerReport = function (c) {
            //adding change for showing three dots in all tabs -G
            return (
                $scope.opportunitiesActive === 'all' ||
                $scope.opportunitiesActive === 'refresh' ||
                $scope.opportunitiesActive === 'renew' ||
                $scope.opportunitiesActive === 'attach' );
        };*/

        $scope.allowSmartReport = function(c) {
            // DE141253
            if ($scope.opportunitiesActive === 'renew' && $scope.subopportunity === 'as') {
                return false;
            }
            //DE141714
            if ($scope.opportunitiesActive === 'attach' && $scope.subopportunity === 'ts' && $scope.opportunitiesView === 'performance') {
                return false;
            }
             if ($scope.opportunitiesActive === 'attach' && $scope.subopportunity === 'swss' && $scope.opportunitiesView === 'performance') {
                return false;
            }
            // US138177
            if ($scope.opportunitiesActive === 'renew' && ($scope.subopportunity === 'ts' || $scope.subopportunity === 'total' || $scope.subopportunity === 'swss') && $scope.opportunitiesView === 'performance') {
                return false;
            }
            if($scope.opportunitiesActive === 'tsRenew' || $scope.opportunitiesActive === 'tsAttach'){
                return false;
            }
            if (c) {
                var activeC = c.activeCategory;
                if (!c.categories || activeC === null) {
                    return;
                }
                var title = c.categories[activeC];
                if(title){
                    return title.toLowerCase().indexOf("customer") > -1;
                } else {
                    return false;
                }
            }
        };

        $scope.allowActionMetrics = function (c) {
            if (c) {
                var activeC = c.activeCategory;
                if (!c.categories || activeC === null) {
                    return;
                }
                var title = c.categories[activeC];
                var sales = $filter('filter')($scope.appliedFilters, {categoryId: 'Sales'});
                if($scope.opportunitiesActive === "drs"){
                     return sales.length &&
                        sales.length >= 4 &&
                        title.toLowerCase().indexOf("customer") > -1;
                }

            }
            return false;
        };

        //No need to add check for levels here until indipendent functionality is needed -G
       // $scope.allowPipelineDetails = function (c) {
           // if ($scope.opportunitiesActive == 'ciscoOne' || $scope.opportunitiesActive ==='all' || $scope.subopportunity === 'as' || $scope.opportunitiesView === 'performance') {
           //    return false;
          // }
        // US138177
          //  return true;
        //};

    $scope.allowPipelineDetails = function (c) {
        // DE141253
        if ($scope.opportunitiesActive === 'renew' && $scope.subopportunity === 'as') {
            return false;
        }
        //DE141714
        if ($scope.opportunitiesActive === 'attach' && $scope.subopportunity === 'ts' && $scope.opportunitiesView === 'performance') {
            return false;
        }
        // US138177
        // changes to enable Total renew performance as TS renew performance
        if ($scope.opportunitiesActive === 'renew' && ($scope.subopportunity === 'ts' || $scope.subopportunity === 'total' || $scope.subopportunity === 'swss' ) && $scope.opportunitiesView === 'performance') {
            return false;
        }
        if (c) {
            var activeC = c.activeCategory;
            if (!c.categories || activeC === null) {
                return;
            }
            var title = c.categories[activeC];
            title = title ? title : "";
            var sales = $filter('filter')($scope.appliedFilters, {categoryId: 'Sales'});
            return sales.length &&
                   sales.length >= 4 &&
                   title.toLowerCase().indexOf("customer") > -1;
        }
    };

        $scope.allowDrillOption = function(){
            return true;
        }

        $scope.allowGenerateCollab = function (c) {
            return (GlobalBookmarkServ.isCollabBookmarkActive() && (GlobalBookmarkServ.bookmark.name === "Collab-UC-LDOS" || GlobalBookmarkServ.bookmark.name === "Collab-Video-LDOS"));
        };

        $scope.isAccountManagerList = function(c) {
            var activeC = c.activeCategory;
            if (!c.categories || activeC === null) {
                return;
            }
            var title = c.categories[activeC];

            if (title !== undefined && title.toLowerCase().indexOf("account manager") > -1) {
                c.isAccountManagerList = title;
            } else {
                c.isAccountManagerList = false;
            }
        };

        $scope.drillAccountManager = function(isAccountManagerList, accMng, c) {
            if (isAccountManagerList) {
                c.isAccountManagerList = false;
                if ($scope.accounts.length === 0) {
                    $scope.accounts[1] = {};
                    $scope.accounts[1].selected = accMng;
                    $scope.actMngName = accMng;
                } else {
                    $scope.accounts[2] = {};
                    $scope.accounts[2].selected = accMng;
                }
                $scope.drllActMng = true;
                var accountManagerEventDetails = {};
                // Changes for DE133546
                if(c.activeCategory === 2)
                    accountManagerEventDetails.eventFrom = "customer";
                else
                    accountManagerEventDetails.eventFrom = "manager";
                accountManagerEventDetails.managerName = [];
                accountManagerEventDetails.managerName[0] = accMng;
                $rootScope.$emit('call-apply-filters', accountManagerEventDetails);
                resetScrollPosition(2);
            }
        };

        $scope.undrillAccountManager = function(c) {
            c.isAccountManagerList = true;
            if ($scope.accounts.length) {
                $scope.accounts = [];
                $scope.tiles[2].activeCategory = 3;
            }
            $scope.drllActMng = false;
            $scope.unDrillActMan = "undrill";
            $rootScope.$emit('call-apply-filters',$scope.unDrillActMan);
            resetScrollPosition(2);
        };

        $scope.showExpandCollapse = function(c) {
        if (c.disableExpandIcon === true){
            return false;
        }
            return true;
        };

        $scope.showChartViewIcon = function(c) {
            return true;
        };

        $scope.isAccountSelected = function() {
            var isLevelSelected = $filter('filter')($scope.appliedFilters, { categoryId: "salesAM"});
            return isLevelSelected.length > 0;
        };

        $scope.resetActive = function() {
            // AB --- Adding condition to stop resetting colorsopp after click on partner/customer
            if(angular.equals({}, $scope.chartFilters) && ($scope.active === '' || $scope.active === null)){
                $scope.colorsOpp = {};
            }
            //commenting it because its making all three charts in drs blank on drill down...Parth
            //if($scope.opportunitiesActive !== 'ciscoOne' && $scope.getActiveSPCTab() !== "customer") // Changes for DE135340
            $scope.active = '';
            $scope.campActiveDrill = '';
            $scope.quarterActive = [];
            $scope.areaActive = [];
        };

        $scope.allowContractDetails = function (c) {
           var page = $scope.opportunitiesActive === 'renew' && ($scope.subopportunity === 'ts' || $scope.subopportunity === 'swss' ||$scope.subopportunity === 'total');
           if ($scope.opportunitiesActive === 'renew' && ($scope.subopportunity === 'ts' || $scope.subopportunity === 'total' || $scope.subopportunity === 'swss' ) && $scope.opportunitiesView === 'performance') {
            return false;
            }
           var sales = $filter('filter')(filtersServ.retainSelectedFilters, { slug: 'sales' });
           var title = 'customer';
           if(c) {
            if(angular.isDefined(c.categories)){
                var title = c.categories[c.activeCategory];
                title = title ? title : "";
            }
            
           }
           return page && sales.length &&
           title.toLowerCase().indexOf("customer") > -1;
        };


        $scope.toggleViewType = function(c, t) {
            //Fix for DE121985  - Sindhu
            if (c.viewType === t) {
                return;
            }
            if($scope.opportunitiesActive === "refresh" && t === 'list'){
                if (c.type === "pie" || c.type === "bar_stacked"){
                    $scope.productFamily();
                }
            }

            $scope.getProductFamily(c);
            if($rootScope.isExpandArch != undefined){
                c.expandAllArch = false;
            }
            var a = c.activeTab;
            c.activeTab = null;
            c.viewType = t;
        // to move the scroll towards the current month in sales/customer chart in TS Attach performance - DE156224 
            if (c.type === "square_block" && c.viewType == 'list' && c.expanded === 1) {
                $scope.moveScrollToRight(c);
            }
            $timeout(function() {
                c.activeTab = a;
                bindTableScroll();
                $scope.setListViewElipsis(c);
            });
            // to move the scrolls down to current quarter  in TS Renew performance DE159320
            $scope.moveScrollToBottom();
            if (t == 'chart' && c.type == 'line_chart_rr') {
                $('.opportunity-tile').css("height", "auto");
                $('.opportunity-tile').css("min-height", "468px");
            } else{
             matchTilesHeight(200);
            };
        };

       $scope.productFamily = function(){
            var subArchitechture;
                var filtersToBeApplied = {};
                if ($scope.chartFilters) {
                    angular.extend(filtersToBeApplied, $scope.CiscoUtilities.cleansedFilters($scope.appliedFilters), $scope.chartFilters,$scope.propInsightSliderFilter);
                } else {
                    filtersToBeApplied = $scope.CiscoUtilities.cleansedFilters($scope.appliedFilters);
                }
                //commenting as this was overwritting the list view values of first chart under Refresh tab. Fix for DE142021
                /*if (filtersToBeApplied.quarterId) {
                    delete filtersToBeApplied.quarterId;
                }*/
                if ($scope.pieActiveDrill) {
                    subArchitechture = $scope.pieActiveDrill;
                } else {
                    subArchitechture = false;
                }
                if($scope.areaActive){
                   filtersToBeApplied["customer"]  = $scope.areaActive;
                }
                filtersToBeApplied["globalView"] = $scope.globalView;
            if($scope.opportunitiesActive!== "drs"){ //Adding this to avoid pf call on switching partner to sales chart in DRS.
            opportunitiesServ.getProductFamilyData($scope.opportunitiesActive, filtersToBeApplied, $scope.getActiveSubTab(), subArchitechture).then(function(response) {
                productFamily = angular.copy(response);
                if($scope.opportunitiesActive === "refresh"){
                    $scope.tiles.forEach( function(c){
                        if (c.type === "pie" || c.type === "bar_stacked"){
                            $scope.getProductFamily(c);
                        }
                    })
                }
            });
            }
        }

        $scope.chartToParent = function(c, index){
            $scope.isBack = true; // Changes for DE132903
            $scope.rrtitle = false;
            c['data-key'] = 'inQuarterRenewalRate';
            // to differentiate between ts and swss renew with total renew performance during drill down
            if($scope.subopportunity === 'total'){
                // code for changing the title in the 2nd option of 1st chart in total renew performance page.
                c.categories = ["In Quarter Total Renewal Rate", "Total Renewal Rate Progression - Quarterly Comparison", "Total Renewal Rate by Sales Levels"];
            }else if($scope.subopportunity==='ts'){
                c.categories = ["In Quarter Renewal Rate", "Renewal Rate Progression - Quarterly Comparison", "Renewal Rate by Sales Levels"];
            }else{
                //For SWSS renew to show 4 categories after click back button in waterfall chart.
                 c.categories = ["In Quarter Renewal Rate", "Renewal Rate Progression - Quarterly Comparison", "Renewal Rate by Sales Levels","SWSS Renewal Rate by Architecture"];
            }
            $scope.selectCategory(c, index, 'chartToParent'); // change for DE132903
            $scope.isBack = false;
        };

        $scope.closeMenu = function() {
            $scope.tabsActive = false;
        };

        $scope.checkAll = function(a, c) {
            angular.forEach(a, function(o) {
                o.checked = c;
            });
            $scope.getSelectedCount();
        };

        $scope.checkParent = function(a, c) {
            var s = true;
            if (!a.length) {
                s = false;
            }
            angular.forEach(a, function(o) {
                if (!o.checked) {
                    s = false;
                }
            });
            c.checked = s;
            $scope.getSelectedCount();
        };

        $scope.performanceDisabled = function() {
            // change to enable performance tab in Total Renew
            return $scope.opportunitiesActive === 'asset' || $scope.opportunitiesActive === 'eos' || $scope.opportunitiesActive === "subscription";
        };

        $scope.isChartClickable = function(c) {
            if(c && c.title === "AS Renew Bookings by Sales Levels") {
                return false;
            }
            return true;
        };

        $scope.isAreaClickable = function (c) {
            if(c && c.title === "AS Renew Bookings by Sales Levels" || c.title === "Average Days to Attach by Customers") {
                return false;
            }
            return true;
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

        $scope.toggleTabs = function() {
            $scope.tabsActive = !$scope.tabsActive;
        };

        var sideToggleRoot = $rootScope.$on('sidebar-toggle', function (event, data) {
             $scope.sidebarActiveToggle(data);
        });

        $scope.sidebarActiveToggle = function(b) {
            //DE137151
            $timeout(function () {
                $scope.moveScrollToBottom();
            }, 440);
            $scope.sidebarAnimated = false;
            $scope.sidebarActive = b;
            if (window.innerWidth >= 1200 || true) {
                $timeout(function() {
                    $scope.sidebarAnimated = true;
                }, 510);
            }
            $rootScope.$emit('selected-count');
        }

        $scope.hideShowStrip = function() {
            if ($scope.opportunities.length && $scope.opportunities[$scope.activeTab] && $scope.opportunities[$scope.activeTab].subtabs) {
                $rootScope.bHideFilterStrip = false;
            } else {
                $rootScope.bHideFilterStrip = true;
            }
        };

        $scope.hideShowStrip();

        $scope.opportunitiesActiveToggle = function(i, ind) {
            //Reset the activeCategoryForCSV to default when you switch tabs
            $scope.activeCategoryForCSV = "";
            //To Retain Customer chart when u apply SL5 and switch to main tabs.
            if(retainActiveCategory <= ind && $scope.appliedFiltersCount>=5){
                retainActiveCategory=  2;
            }
            else            
            retainActiveCategory = 0;
            $scope.linecountselected = 0;
            $scope.listamountselected = 0;
            if($scope.tiles){
                $scope.tiles[2].checkedstates = [];
                // Changes for DE163319
                if($scope.tiles[0].activeCategory !== undefined){
                    $scope.tiles[0].activeCategory = 0;
                }
            }
            //Changes for DE158089
            if(checkedItemsCache !== undefined){
                if(checkedItemsCache.length > 0){
                    checkedItemsCache = [];
                }
            }
            if ($scope.isBookmarkActive()) {
                if($scope.currBookmark){
                    toggleSubTab = true;
                }
            }
            pieChartActiveValue = undefined;
            if (i.disabled) {
                return;
            }
             $scope.showBackButton = false;
            $scope.opportunitiesActiveToggleFinal(i, ind);
        };

    // Changes for US142538
        if($scope.opportunitiesActive){
            if($routeParams.subopportunity === "as"){
              filtersServ.showInsightFilters("as");
            }else{
                 $scope.getInsightFilters($scope.opportunitiesActive);
             }           
        }

        $scope.opportunitiesActiveToggleFinal = function (i, ind, d) {
            CiscoUtilities.setAutoRenewal(false);
            $scope.linecount = 0;
            $scope.linecountselected = 0;
            $scope.listamount = 0;
            $scope.listamountselected = 0;
            $scope.resetChartFilters();
            if ($scope.opportunitiesActive === i.slug) {
                if ($scope.opportunitiesActive !== 'refresh') {
                    return;
                }
            }
            $scope.opportunitiesActive = i.slug;
            $scope.tabsActive = false;
            $scope.activeTab = ind;

            $scope.pieActiveDrill = '';
            $scope.selectedQuarterFromWaterFallChart = ''
            var activeSubTab = ($scope.opportunitiesActive === 'refresh' ? 2 : 0);
            $scope.subopportunity = (i.subtabs ? i.subtabs[activeSubTab].slug : '');
            //showing pop up when naviagting to subscription tab
            //Adding the code here to show the pop up only changing between the tabs and sub tabs.
            //to show the pop up even after the navigation from subscription to any other tabs
            var activeOpportunity = $scope.$watch('opportunitiesActive', function (newValue, oldValue) {
                if(newValue !== oldValue){
                    activeOpportunity();
                    filtersServ.showAlertBarForSubscriptionTab($scope.subopportunity, newValue, oldValue);
                }else if(newValue === oldValue && newValue === 'subscription'){
                    filtersServ.showAlertBarForSubscriptionTab($scope.subopportunity, newValue, oldValue);
                }
            }, true);
            $scope.showBookmarkCriteriaMsg();
                // to retain the Performance - Opportunity view when user switch between tabs
            if ($scope.performanceDisabled()) {
                $scope.opportunitiesView = 'opportunities';
            }
            // change for DE179737
            if ($scope.opportunitiesView === 'performance') {
                isCust = false;
            }
            $scope.hideShowStrip();
            //for realization , since we have only one chart
            if(angular.isDefined($scope.tiles) && angular.isDefined($scope.tiles[2])){
                      $scope.tiles[2].activeCategory = 0;
            }
            $scope.propInsightSliderFilter = {};

        // Changes for US142538
            $scope.getInsightFilters($scope.opportunitiesActive,false); //storing subtaab details
            // Change for DE165623
            // data was not displaying in 1st chart of swss and ts performance when toggled between ts and swss tabs
            if($scope.opportunitiesView === 'performance' && (($scope.opportunitiesActive === 'attach'&& ($scope.subopportunity == 'ts' || $scope.subopportunity == 'swss')) || ($scope.opportunitiesActive === 'renew' && $scope.subopportunity == 'ts'))){
                handlePerformance($scope.tiles[0],$scope.tiles[0].activeCategory);
            }
            if ($scope.isBookmarkActive()) {
                $scope.opportunitiesView = 'opportunities';
                if ($rootScope.analysis === 'campaign' || $location.path() === '/view-account/refresh') {
                    $rootScope.analysis = 'analysis';
                    $location.path($rootScope.dashboard + '/' + $rootScope.analysis + '/' + $scope.opportunitiesActive + '/' + $scope.subopportunity, true);
                } else {
                    $scope.getData();
                    $location.path($rootScope.dashboard + '/' + $rootScope.analysis + '/' + $scope.opportunitiesActive + '/' + $scope.subopportunity, false);
                }
            } else {
                var isTrue = false;
                if (d === 'reloadPage') {
                    isTrue = true;
                }
                $scope.getData();
                $location.path($rootScope.dashboard + '/' + $rootScope.analysis + '/' + $scope.opportunitiesActive + '/' + $scope.subopportunity, isTrue);
            }
        }

        $scope.resetChartFilters = function() {
            $scope.chartFilters = {};
            $scope.drilledInChartValue = {};
            $scope.resetActive();
        };

        $scope.opportunitiesViewToggle = function(i) {
            $scope.showBackButton = false;
            $scope.linecountselected = 0;
            $scope.listamountselected = 0;
            filtersServ.opportunitiesView = i;
            $scope.resetChartFilters();
            if($scope.tiles){
                $scope.tiles[2].checkedstates = [];
                // Changes for DE163319
                if($scope.tiles[0].activeCategory !== undefined){
                    $scope.tiles[0].activeCategory = 0;
                }
            }
            if ($scope.isBookmarkActive()) {
                if($scope.currBookmark){
                    toggleSubTab = true;
                }
            }else{
                pieChartActiveValue = undefined;// Change for DE165623
            }
            if ($scope.opportunitiesView === i || $scope.performanceDisabled() || (filtersServ.globalView && i === 'performance')) {
            return;
            }
            $scope.opportunitiesView = i;
            $scope.$broadcast('performance-selection-changed', {});
            $scope.resetChartFilters();

            if ($scope.opportunitiesView === 'performance') {
                // first chart was going blank when clicked on renewl opportunity link of any of the quarters and clicking on performance in total and swss renew
                if ((($scope.opportunitiesActive === "renew" || $scope.opportunitiesActive === "attach") && $scope.getActiveSubTab() === "ts") || ($scope.opportunitiesActive === "renew" && ($scope.getActiveSubTab() === "total" || $scope.getActiveSubTab() === "swss"))) {
                    if (isCust) {
                        isCust = false;
                    }
                    performanceServ.getDataset(true);
                }
                if (isCust) {
                    isCust = false;
                }
            }

            $scope.pieActiveDrill = '';
            $scope.selectedQuarterFromWaterFallChart = '';
            // Change for DE165623
            // data was not displaying in 1st chart of swss and ts performance when toggled between ts and swss tabs
            if($scope.opportunitiesView === 'performance' && (($scope.opportunitiesActive === 'attach'&& ($scope.subopportunity == 'ts' || $scope.subopportunity == 'swss')) || ($scope.opportunitiesActive === 'renew' && $scope.subopportunity == 'ts'))){
                handlePerformance($scope.tiles[0],$scope.tiles[0].activeCategory);
            }else{
                $scope.getData();
            }
            //$scope.defaultWaterfall();
           $location.path($rootScope.dashboard + '/' + $rootScope.analysis + '/' + $scope.opportunitiesActive + '/' + $scope.subopportunity + '/' + $scope.opportunitiesView, false);
        };

        $scope.opportunitiesSubtabToggle = function(subtab) {
            CiscoUtilities.setAutoRenewal(false);
            $scope.pieActiveDrill = "";//To reset the drilled down in pie chart to defualt once we switch subtabs in tabs
            //$scope.subopportunity = subtab;
            $scope.linecountselected = 0;
            $scope.listamountselected = 0;
             $scope.showBackButton = false;
             isInquarterRenewal = true;
            if($scope.tiles){
                //
                if($scope.tiles[2]){
                    $scope.tiles[2].checkedstates = [];
               }
                // Changes for DE163319
                if($scope.tiles[0].activeCategory !== undefined){
                    $scope.tiles[0].activeCategory = 0;
                }
            }
            //Changes for DE158089
            if(checkedItemsCache !== undefined){
                if(checkedItemsCache.length > 0){
                    checkedItemsCache = [];
                }
            }
            if ($scope.isBookmarkActive()) {
                if($scope.currBookmark){
                    toggleSubTab = true;
                }
            }
            if ($scope.subopportunity === subtab || subtab.disabled) {
                return;
            }

            $scope.subopportunity = subtab;
            filtersServ.subopportunity = $scope.subopportunity;
            //showing pop up when naviagting to subscription tab
            //Adding the code here to show the pop up only changing between the tabs and sub tabs.
            //to show the pop up even after the navigation from subscription to any other tabs
            var activeOpportunity = $scope.$watch('opportunitiesActive', function (newValue, oldValue) {
                if(newValue !== oldValue){
                    activeOpportunity();
                    filtersServ.showAlertBarForSubscriptionTab($scope.subopportunity, newValue, oldValue);
                }else if(newValue === oldValue && newValue === 'subscription'){
                    filtersServ.showAlertBarForSubscriptionTab($scope.subopportunity, newValue, oldValue);
                }
            }, true);
            $scope.showBookmarkCriteriaMsg();
            if(subtab === "as"){
                $scope.getInsightFilters(subtab);
                filtersServ.globalView = false;
                $scope.CiscoUtilities.setGlobalParam(false);
            }
            else{
                $scope.getInsightFilters($scope.opportunitiesActive);
            }
            pieChartActiveValue = undefined;
            $scope.resetChartFilters();
            $scope.opportunities[$scope.activeTab].active = subtab;           
            $scope.pieActiveDrill = '';
            if ($scope.performanceDisabled()) {
                $scope.opportunitiesView = 'opportunities';
            }
            if ($scope.opportunitiesView === 'performance') {
                if (isCust) {
                    isCust = false;
                }
            }
          
            $scope.pieActiveDrill = '';
            $scope.selectedQuarterFromWaterFallChart = '';
            // Change for DE165623
            // data was not displaying in 1st chart of swss and ts performance when toggled between ts and swss tabs
            if($scope.opportunitiesView === 'performance' && ($scope.opportunitiesActive === 'attach'&& ($scope.subopportunity == 'ts' || $scope.subopportunity == 'swss'))){
                handlePerformance($scope.tiles[0],$scope.tiles[0].activeCategory);
            }
        //commenting for reducing the number of calls in the application.
        //added the condition for making the call only on SLD
          if($rootScope.dashboard === "services"){
             $scope.getData();
          }
            //$scope.getData();
            //$scope.defaultWaterfall();
            $location.path($rootScope.dashboard + '/' + $rootScope.analysis + '/' + $scope.opportunitiesActive + '/' + $scope.subopportunity, false);
        };

        var isNumeric = function(n) {
            return !isNaN(parseFloat(n)) && isFinite(n);
        }

        $scope.getActiveSubTab = function() {
            if($scope.opportunitiesActive === 'all' || $scope.opportunitiesActive === 'asset') {
                $scope.subopportunity = undefined;
            }
            if ($scope.opportunities && $scope.opportunities.length > 0) {
                if ($scope.subopportunity !== undefined) {
                    if ($scope.subopportunity.indexOf('?') > 0) {
                        return $scope.subopportunity.split('?')[0];
                    } else {
                        return $scope.subopportunity;
                    }
                }
            }
            return null;
        };

        $scope.spaceQuarter = function(c){
            if($scope.opportunitiesActive === "refresh"){
               return c.replace(/\s+/g,'');
            }
            else {
                return c;
            }
        };
        //Added for broadcast the slug to display prop filters on condition -AllOpp,Refresh and Attach - shankar
    // Changes for US142538
        /*var currentTabWatch = $scope.$watch('opportunitiesActive', function (newVal) {
            filtersServ.showInsightFilters(newVal);
            $rootScope.showRefreshInsightFilter     = filtersServ.showRefreshInsightFilter;
            $rootScope.showTSAttachInsightFilter    = filtersServ.showTSAttachInsightFilter;
            var tempInsightFilters = {"showRefreshInsightFilter":filtersServ.showRefreshInsightFilter,
                                      "showTSAttachInsightFilter":filtersServ.showTSAttachInsightFilter
                                    };
            $scope.$broadcast('opportunity-active-change',tempInsightFilters);
        });*/

        $scope.addSubscriptionClass = function() {
            if($scope.opportunitiesActive == "subscription") {
                $rootScope.subscriptionFlag = true;
            } else {
                $rootScope.subscriptionFlag = false;
            }
        };
    //changes for showing pop up when navigated to Subscription tab
        $scope.hideSubscriptionAlertMsg = function(flag) {   
            if (flag || $scope.subopportunity == "security" || $scope.subopportunity == "collaboration") {
                filtersServ.subscriptionPopupFlag = true;
            }
        };

        $scope.showBookmarkCriteriaMsg = function() {
            if (BookMarkData.getCurrentBookmark() != null) {
                var bookmarkFilters = angular.copy(BookMarkData.getCurrentBookmark().bookmark.filter);
                var appliedFilters = angular.copy(filtersServ.appliedFilters);
                if (($scope.subscriptionTabTemp == "subscription" || $scope.opportunitiesActive == "subscription")  && $scope.subopportunity !== "other") {
                    $scope.isFiltersChanged = true;
                    $timeout(function() {
                        $scope.isFiltersChanged = false;
                    },5000);
                }
            } else {
                $scope.isFiltersChanged = false;
            }
            if ($scope.subscriptionTabTemp == "subscription" && ($scope.subopportunity == "security" || $scope.subopportunity == "collaboration")) {
                $scope.subscriptionTabTemp = $scope.opportunitiesActive; 
            } else {
                $scope.subscriptionTabTemp = $scope.opportunitiesActive; 
            }
        };

        $scope.getData = function() {
            $scope.addSubscriptionClass();
           //    $scope.lineCount=0;
           // $scope.linecountselected=0;
           pieChartActiveValue = undefined;
            var deferred = $q.defer();
            $('.tooltip').show();
            $('.d3-tip').show();
            $('.tooltip').hide();
            $('.d3-tip').hide();
            var v = $scope.opportunitiesView;
            var subArchitechture;
            var source = null;
            // Changes for DE151248 - Sindhu
            if($scope.opportunitiesActive === 'asset'){
                $scope.$broadcast('opportunity-active-change',{"showRefreshInsightFilter":false,
                                    "showTSAttachInsightFilter":false , "disableTerritotyCoverage":true
                });
            }else if($scope.opportunitiesActive === 'refresh'){
                $scope.$broadcast('opportunity-active-change',{"showRefreshInsightFilter":true,
                                    "showTSAttachInsightFilter":false, "disableTerritotyCoverage":false
                });
            } else if($scope.opportunitiesActive === "subscription") {
                $scope.$broadcast('opportunity-active-change', {
                    "showRefreshInsightFilter": false,
                    "showTSAttachInsightFilter": false, 
                    "disableTerritotyCoverage": false
                });
            }else if($scope.opportunitiesActive === 'renew'){
                $scope.$broadcast('opportunity-active-change',{"showRefreshInsightFilter":false,
                                    "showTSAttachInsightFilter":false, "disableTerritotyCoverage":false
                });
            }else if($scope.opportunitiesActive === 'attach'){
                $scope.$broadcast('opportunity-active-change',{"showRefreshInsightFilter":false,
                                    "showTSAttachInsightFilter":true , "disableTerritotyCoverage":false
                });
            }
            // Changes for DE150615 and DE151166 - Sindhu
            $scope.$on('CountOnTab',function(data,event){
                $scope.appliedFiltersCount = event;
            });

            if($routeParams.subopportunity=== "source=SFDC"){
                source = "SFDC";
            }
            else{
                source = null;
            }
            // List/Net toggle
            $scope.netDisabled = false;
            $scope.listDisabled = false;
            if (($scope.opportunitiesActive === 'refresh' && $scope.opportunitiesView !== 'performance') || ($scope.opportunitiesActive === "subscription" && $scope.opportunitiesActive !== 'performance') || ($scope.opportunitiesActive === 'asset' && $scope.opportunitiesActive !== 'performance')) {
                if($scope.netDisabled === false && $scope.isListOrNet === 'net'){
                    $scope.isListOrNet = 'net';
                } else {
                    $scope.isListOrNet = 'list';
                }
            } else if (($scope.opportunitiesActive === 'renew' && $scope.subopportunity === 'ts' && $scope.opportunitiesView !== 'performance') || ($scope.opportunitiesActive === 'renew' && $scope.subopportunity === 'swss' && $scope.opportunitiesView !== 'performance') ) {
                if($scope.netDisabled === false &&  $scope.isListOrNet === 'net'){
                    $scope.isListOrNet = 'net';
                } else {
                    $scope.isListOrNet = $scope.isListOrNet ? $scope.isListOrNet : 'net';
                }
            } // changes to enable Total renew performance as TS renew performance
            else if(($scope.opportunitiesActive == 'renew' && $scope.subopportunity === 'total'&& $scope.opportunitiesView !== 'performance') || ($scope.opportunitiesActive == 'renew' && $scope.subopportunity === 'as' && $scope.opportunitiesView !== 'performance')){
                $scope.isListOrNet = 'net';
                $scope.listDisabled = true;
            }
            else {
                $scope.isListOrNet = 'list';
            }
            if ((($scope.opportunitiesActive == 'attach') ||($scope.opportunitiesView === 'performance') || ($scope.opportunitiesActive == 'ciscoOne')) ) {
                $scope.netDisabled = true;
            }
            var filtersToBeApplied = {};
            if (!angular.equals({}, $scope.chartFilters) && $scope.chartFilters.sales !== "[]") {
                if($scope.tempCust === undefined) // Changes for DE132585 and DE133019
                angular.extend(filtersToBeApplied, $scope.CiscoUtilities.cleansedFilters($scope.appliedFilters), $scope.chartFilters, $scope.propInsightSliderFilter);
                else{
                    //Changes for DE132585
                    if (($scope.chartFilters.customer !== undefined && $scope.chartFilters.customer !== '[]') || ($scope.chartFilters.partner !== undefined && $scope.chartFilters.partner !== '[]')){
                        angular.extend(filtersToBeApplied, $scope.CiscoUtilities.cleansedFilters($scope.appliedFilters), $scope.chartFilters, $scope.propInsightSliderFilter);
                    }else{
                        filtersToBeApplied = $scope.CiscoUtilities.cleansedFilters($scope.appliedFilters);
                        angular.extend(filtersToBeApplied, $scope.propInsightSliderFilter);
                    }
                }
            } else {
                filtersToBeApplied = $scope.CiscoUtilities.cleansedFilters($scope.appliedFilters);
                angular.extend(filtersToBeApplied, $scope.propInsightSliderFilter);
            }
            if (filtersToBeApplied.quarterId) {
                delete filtersToBeApplied.quarterId;
            }
            if ($scope.opportunitiesActive === "refresh" || $scope.opportunitiesActive === "ciscoOne") {
                subArchitechture = $scope.pieActiveDrill;
            } else {
                subArchitechture = false;
            }
            if(filtersServ.opportunitiesActive === "subscription"){
                var archFilter = [];
                if(filtersServ.subopportunity === "security"){
                    archFilter.push("Security");
                    filtersToBeApplied.architectureGroups = JSON.stringify(archFilter);
                }else if(filtersServ.subopportunity === "collaboration"){
                    archFilter.push("Collaboration");
                    filtersToBeApplied.architectureGroups = JSON.stringify(archFilter);
                }
            }
            if ($scope.isBookmarkActive()) {
                if (GlobalBookmarkServ.bookmark !== undefined) {
                    var bookmarkFilter = $scope.CiscoUtilities.cleansedFilters($scope.appliedFilters);
                    angular.extend(filtersToBeApplied, bookmarkFilter);
                    $scope.whichBookmark = GlobalBookmarkServ.bookmark.name;
                    if ($scope.isFiltersChanged && GlobalBookmarkServ.bookmark.isModified) {
                        $scope.isFiltersChanged = true;
                    }
                } else {
                    $scope.whichBookmark = $scope.bkmark.name;
                    if(!$scope.isFiltersChanged) {
                        $scope.appliedFilters = angular.copy($scope.bkmark.filter[0]);
                    }
                    var bookmarkFilter = $scope.CiscoUtilities.cleansedFilters($scope.appliedFilters);
                    angular.extend(filtersToBeApplied, bookmarkFilter);
                    if ($scope.isFiltersChanged && GlobalBookmarkServ.bookmark.isModified) {
                        $scope.isFiltersChanged = true;
                    }
                }
               
                //showing pop up when naviagting to subscription tab
                //Adding the code here to show the pop up only changing between the tabs and sub tabs.
                //to show the pop up even after the navigation from subscription to any other tabs
                var activeOpportunity = $scope.$watch('opportunitiesActive', function (newValue, oldValue) {
                    if(newValue !== oldValue){
                        activeOpportunity();
                        filtersServ.showAlertBarForSubscriptionTab($scope.subopportunity, newValue, oldValue);
                    }else if(newValue === oldValue && newValue === 'subscription'){
                        filtersServ.showAlertBarForSubscriptionTab($scope.subopportunity, newValue, oldValue);
                    }
                }, true);
                $scope.showBookmarkCriteriaMsg();

                
            }
            //the name of object was not changed here, changing it to fix DE137366 -G
            if(filtersToBeApplied && filtersToBeApplied.accounts){
                if(filtersToBeApplied.accounts.length > 1){
                    $scope.tilesAccounts = true;
                } else {
                    $scope.tilesAccounts = false;
                }
            }
            else{
                $scope.tilesAccounts = false; //DE140340
            }
            if($scope.opportunitiesActive === 'renew' && $scope.subopportunity === 'as')
            {
                    filtersToBeApplied['customerName'] = $scope.chartFilters.customer;
            }
        // Changes for US142538
            if(filtersToBeApplied["refreshPropensity"]){
                var refreshProp = filtersToBeApplied["refreshPropensity"];
                if(!$rootScope.showRefreshInsightFilter){
                    refreshProp = null;
                    filtersToBeApplied["refreshPropensity"] = refreshProp;
                }
            }
            if(filtersToBeApplied["higherAttachPropensity"] !== undefined && filtersToBeApplied["lowerAttachPropensity"] !== undefined){
                var highAttachProp = filtersToBeApplied["higherAttachPropensity"];
                var lowAttachProp = filtersToBeApplied["lowerAttachPropensity"];
                if(!$rootScope.showTSAttachInsightFilter){
                    highAttachProp = null;
                    lowAttachProp = null;
                    filtersToBeApplied["higherAttachPropensity"] = highAttachProp;
                    filtersToBeApplied["lowerAttachPropensity"] = lowAttachProp;
                }
            }
            if($scope.opportunitiesView === 'opportunities' && $scope.opportunitiesActive === 'attach' && $scope.subopportunity == 'ts' && !toggleSubTab){
                if($scope.currBookmark){
                    if($scope.currBookmark.filter[2]){ // Changes for DE164130
                        if($scope.currBookmark.filter[2] === 1){
                            pieChartActiveValue = "warranty";
                        }
                       else  if($scope.currBookmark.filter[2] === 2){
                            pieChartActiveValue = "aging";
                        }
                    }
                    //$scope.currBookmark.filter.splice(2,1);
                }
            }
            if($scope.opportunitiesActive !== 'asset' && filtersToBeApplied.dataset){
                delete filtersToBeApplied.dataset;
            }
            $scope.assignFiscal();
            filtersToBeApplied.selectedFiscal = $scope.selectedFiscal;
            filtersToBeApplied["globalView"] = $scope.globalView;
            //To Make Default 1st chart as warranty in TSAttach Tab.
            if($scope.opportunitiesView === 'opportunities' && $scope.opportunitiesActive === 'attach' && $scope.subopportunity == 'ts'){
                pieChartActiveValue = "warranty";
            }
            
            if($scope.opportunitiesView === 'opportunities' && $scope.opportunitiesActive === 'attach' && $scope.subopportunity == 'ts'){
                        if($scope.tiles){
                            if($scope.tiles[0].activeCategory === 0){
                                pieChartActiveValue = "warranty";
                            }
                            else  if($scope.tiles[0].activeCategory === 2){
                                pieChartActiveValue = "aging";
                             }
                            else if($scope.tiles[0].activeCategory === 1){
                                 pieChartActiveValue = undefined;
                            }

                        }
                        
            }
            switch (v) {
                case 'opportunities':
                    opportunitiesServ.getData($scope.opportunitiesActive, filtersToBeApplied, $scope.getActiveSubTab(), false, subArchitechture, source, pieChartActiveValue, $scope.switchFiscal).then(function(response) {
                        $rootScope.accessIssue = "";
                        //Update the value of fiscal in the Data object
                        if(response[1].selectedFiscal){
                            response[1].selectedFiscal = $scope.selectedFiscal;
                        }
                        $scope.switchFiscal = false;
                        if ($scope.quarterActive && $scope.quarterActive.length > 0) {
                            var retainedQuarter = angular.copy($scope.quarterActive);
                            // adding this line to solve DE132577, since quarterId was not going to the backend -G
                            filtersToBeApplied['quarterId'] = $scope.chartFilters.quarterId;
                        }

                        if ($scope.areaActive && $scope.areaActive.length > 0) {
                            var retainedArea = angular.copy($scope.areaActive);
                        }
                        if ($scope.active && $scope.active.length > 0) {
                            var retainedPieActive = angular.copy($scope.active);
                        }

                        if($scope.opportunitiesActive === "refresh"){
                            $scope.hasSub = response.hasSub;
                        } else {
                            $scope.hasSub = false;
                        }

                        // Change for DE165623
                        if($scope.currBookmark && !toggleSubTab){
                            if($scope.currBookmark.filter[2]){ // Changes for DE164130
                                response[0].activeCategory = $scope.currBookmark.filter[2];
                                if($scope.opportunitiesView === 'opportunities' && $scope.opportunitiesActive === 'attach' && $scope.subopportunity == 'ts' && !toggleSubTab){
                                    if(response[0].data[response[0].activeCategory] === undefined){
                                        response[0].data[response[0].activeCategory] = response[0].data[0];
                                    }
                                }
                            }
                            //Changes for DE164052
                            if($scope.currBookmark.filter[2] !== undefined){
                                activeCategoryBackup = $scope.currBookmark.filter[2];
                            }
                            $scope.currBookmark.filter[2]= undefined;
                        }

                        //middle chart in swss attach was not updating switching between ts and swss attach tabs
                        if ($scope.opportunitiesActive === "attach" && $scope.opportunitiesView === 'opportunities' && $scope.getActiveSubTab() === "swss") {
                            if(response[0].activeCategory !== undefined){
                                response[1].data = response[0].data[response[0].activeCategory];
                            }
                        }
                        //uncommenting this as customer call was not happening to get all the customers, when we clear all the sav and SL filters from view applied
                        if(!pieChartActiveValue){
                            if (($scope.chartFilters.customer === undefined || $scope.chartFilters.customer == '') &&
                            ($scope.chartFilters.partner === undefined || $scope.chartFilters.partner == '') && !(angular.isDefined($scope.appliedFilters[4]) && $scope.appliedFilters[4].categoryId === "sales")) {
                                // if($scope.appliedFiltersCount >= 5){ //to Skip the AM call when u switch from SL5 to SL2 - DE193100
                                    if (angular.isDefined(response[2].activeCategory)){
                                         $scope.getSPCData(response[2].activeCategory);
                                    }

                                // }
                                
                            }
                        }

                        //swss attach changing main tabs and subtabs and returning back stable charts
                        if ($scope.opportunitiesActive === "attach" && response[0].activeCategory === 1 && $scope.getActiveSubTab() === "swss") {
                            response[2].data[0] = angular.copy(response[2].aging[1])
                        }

                        $scope.resetActive();
                        if (retainedQuarter && retainedQuarter.length > 0) {
                            $scope.quarterActive = angular.copy(retainedQuarter);
                        }
                        if (retainedArea && retainedArea.length > 0) {
                            $scope.areaActive = angular.copy(retainedArea);
                        }
                        if (retainedPieActive && retainedPieActive.length > 0) {
                            $scope.active = angular.copy(retainedPieActive);
                        }
                        if(angular.isDefined($scope.appliedFilters[4])){
                            if(angular.isDefined($scope.appliedFilters[4].title) && $scope.appliedFilters[4].categoryId === 'sales'){
                                if (($scope.appliedFilters[4].title.length) && ($scope.accounts.length === 0)) {
                                    response[2].categories = angular.copy(response[2]["categories-main"]);
                                    //Changes for DE130915 - Sindhu
                                    if(response[2].activeCategory != 3){
                                        $scope.drllActMng = true;
                                    }
                                    if ($scope.drllActMng === false) {
                                        response[2].activeCategory = 3;
                                        $scope.getSPCData(3);
                                    } else {
                                        var tab = $scope.getActiveSPCTab();
                                        var actCatgry = configServ.opportunitiesKeyNameMap[tab];
                                    if (!$scope.chartFilters.partner && !angular.isDefined($scope.chartFilters.pcNodeName)) {
                                        if($scope.chartFilters.pcNodeName === '[]' || $scope.chartFilters.pcNodeName === undefined){
                                            if($scope.catgActive !== undefined) // Changes for DE137362
                                                actCatgry = $scope.catgActive;
                                            else
                                                actCatgry = 2;
                                        }
                                    }
                                        //Customer Call is happening twice because of this check                                    
                                        response[2].activeCategory = actCatgry;
                                        if(!angular.isDefined($scope.chartFilters.pcNodeName)){
                                            if($scope.chartFilters.pcNodeName === '[]' || $scope.chartFilters.pcNodeName === undefined){
                                                //when cleared account manager from view applied, then clicked an any acc manager on the chart, it was not taking to customer's chart.
                                                if(response[2].activeCategory === 3){
                                                    $scope.isAccountManagerList(response[2]);
                                                }
                                                $scope.getSPCData(actCatgry);
                                            }
                                        }
                                    }
                                }
                            } else if($scope.isBookmarkActive()){
                                var flagCount = 0;
                                angular.forEach($scope.appliedFilters,function(salesFilter){
                                    if(salesFilter.categoryId === "sales"){
                                        flagCount++;
                                    }
                                })
                                if(flagCount > 4){
                                    response[2].categories = angular.copy(response[2]["categories-main"]);
                                }else { //Change for DE164130
                                    response[2].categories = angular.copy(response[2]["categories-main"].slice(0, 3));
                                }
                            }
                            else {
                                response[2].categories = angular.copy(response[2]["categories-main"].slice(0, 3));
                            }
                        } else {
                            response[2].categories = angular.copy(response[2]["categories-main"].slice(0, 3));
                        }
                        if ((response[2].activeCategory + 1) > response[2].categories.length) {
                            response[2].activeCategory = 0;
                        }
                        var activeTabName = $scope.getActiveSPCTab();
                        if ($scope.accounts.length > 1){//chart title was becoming blank DE147819
                                response[2].activeCategory = 2;
                        }
                        //if (($scope.accounts.length > 0 && $scope.accounts[1].selected.length > 1) && $scope.changeAccountManager) {
                        //DE189217 SWSS Renew Contract Line Coverage Filter results in no data

                        if ($scope.accounts.length > 0 && response[2].activeCategory != 1) {
                            $scope.changeAccountManager = false;
                            opportunitiesServ.getSPCData($scope.opportunitiesActive, configServ.opportunitiesKeyIndexMap[2], filtersToBeApplied, $scope.getActiveSubTab(),subArchitechture).then(function(custData) {
                                custData = fillPCCategories(custData, $scope.accounts);
                                custData[2].activeCategory = 2;
                                $scope.tiles = custData;
                                $scope.toggleViewType($scope.tiles[2], $scope.tiles[2].viewType);
                                deferred.resolve(true);
                            });
                        }
                        if (($scope.opportunitiesActive === "attach" || $scope.opportunitiesActive === "renew") && $scope.getActiveSubTab() === "swss") {
                            if ($scope.swssActive) {
                                response[0].activeCategory = $scope.swssActive;
                            }
                        }
                        if ($scope.accounts.length > 0) {
                            if ($scope.accMngDrilled) {
                                $scope.actMngName = $scope.actMngName ? $scope.actMngName : $scope.accounts;
                                fillPCWithAccMng(response, $scope.actMngName);
                                $scope.accMngDrilled = false;
                            } else {
                                fillPCWithAccMng(response, $scope.accounts);
                            }
                            if(response[2].activeCategory=== 1) {
                               $scope.getSPCData(1);
                            }
                        }
                        var flag = false;
                        var index = 0;
                        var sales = $filter('filter')($scope.appliedFilters, {categoryId: 'Sales'});
                         // !$scope.chartFilters.pcNodeName condition is added to not to make getspc call when any partner/sales/AM is selected in the 3rd chart
                         if(response[2] && response[2].categories && response[2].categories.length > 0 && (!sales ||(sales && sales.length > 3)) && !$scope.chartFilters.pcNodeName){
                            for(var i = 0; i < response[2].categories.length; i++){
                                if(response[2].categories[i] && response[2].categories[i].toLowerCase().indexOf("customer") > -1){
                                    flag = true;
                                    index = i;
                                }
                            }
                        }
                        // need to change the code back because removing it will break dropdown menu selection
                        // if((flag ||(!sales ||(sales && sales.length < 4)) && !$scope.isSelectedDropDown && !$scope.currBookmark) && $scope.accounts.length===0){//accounts.length check after applying accounts multiple times its calling SPC data(1915 line number)  
                        //     response[2].activeCategory = index;
                        //     $scope.getSPCData(index);
                        // }
                    //In Acc Manager Level, Change filter level less than 5 then Account Manager should not display in third chart
                        if((retainActiveCategory===3 && $scope.appliedFiltersCount)){
                            retainActiveCategory=0;
                        }
                        //To retain the selected charts when we toggle within subtabs.
                        if((retainActiveCategory && !$scope.globalView)){                                
                            $scope.getSPCData(retainActiveCategory);
                            response[2].activeCategory = retainActiveCategory;
                        }
                        //On Click BackButton in waterfall chart swss/ts Customer API call should go
                        if($scope.showBackButton=== true){
                            $scope.getSPCData(2);
                            response[2].activeCategory = retainActiveCategory;
                        }
                       
                        if(toggleglobaViewCheck){
                            
                            response[2].activeCategory = 0;
                            
                            toggleglobaViewCheck= false;
                            
                        }
                        
                        
                        
                        if($scope.currBookmark){
                            if($scope.currBookmark.filter[3] === 0 || $scope.currBookmark.filter[3]){
                                //after going to applied bookmark-changing category to customer -OnClick customer customer category should assign.
                                if($scope.areaActive){  
                                    if(angular.isDefined(response[2].activeCategory)) {
                                        $scope.getSPCData(response[2].activeCategory);  
                                    }
                                }
                                else{
                                    $scope.getSPCData($scope.currBookmark.filter[3]);               
                                    response[2].activeCategory= $scope.currBookmark.filter[3];
                                }
                            }
                        }
                        if($scope.isSelectedDropDown){
                            $scope.isSelectedDropDown = false;
                        }
                        $scope.isDataCallReturned = true;
                        $scope.tiles = response;
                        //Tiles Mismatch- Switching from Subscription to Refresh
                        setTimeout(function() {
                            matchTilesHeight(500);
                          }, 1000);
                        //$scope.linecountselected = 0;
                        //$scope.listamountselected = 0;
                        //$scope.tiles[2].checkedstates = [];
                        $scope.$broadcast('active-spc-key-selection', $scope.getActiveSPCTab());
                        deferred.resolve(true);
                        if (maintainAreaOfPartCust) {
                            maintainAreaOfPartCust = false;
                            $scope.$broadcast('select-area', $scope.chartFilters);
                        }
                    });
                    break;
                case 'performance':
                     // check for extending bookmark filters into filterdetails : -KD
                    if ($scope.isBookmarkActive() && !GlobalBookmarkServ.bookmark) {
                          angular.extend(filtersToBeApplied, bookmarkFilter);
                    }
                    // changes to enable Total renew performance as TS renew performance
                    if ($scope.opportunitiesActive === "renew" && ($scope.getActiveSubTab() === "ts" || $scope.getActiveSubTab() === "total")) {
                        if ((angular.isDefined($scope.tiles) && $scope.tiles[2].activeCategory === 1) && $scope.tiles[2]['data-key'] === 'renewalBookingsByQuarter') {
                            if (!resetRenew) {
                                if($scope.isBack)// changes for DE132903
                                    isCust = false;
                                else {           // changes for DE132903
                                    //change for not making only the customer call when we are un customers in 3rd chart and change the category in 1st chart and again go back to InQuarter Renewl rate in both TS and Total renew performance
                                    if(angular.isDefined(isInquarterRenewal) && !isInquarterRenewal){
                                        isCust = true;
                                    }
                                }
                            }
                        } // changes for DE132903
                        if ((angular.isDefined($scope.tiles) && $scope.tiles[2].activeCategory === 0) && $scope.tiles[2]['data-key'] === 'renewalBookingsByQuarter') {
                            isCust = false;
                        }
                    }
                    //for drilling in ts renew first chart...-Parth
                    if (drillRenew ) {
                        performanceServ.getRenewDrillData($scope.opportunitiesActive, filtersToBeApplied, $scope.getActiveSubTab(), false, fromToggle).then(function(response) {
                            $scope.tiles = response;
                            deferred.resolve(true);
                        });
                        drillRenew = false;
                        fromToggle = false;
                        break;
                    }
                    if(drillRenewToProgression){
                        performanceServ.getPerformanceData($scope.opportunitiesActive, filtersToBeApplied, $scope.getActiveSubTab(), false, false,drillRenewToProgression).then(function(response) {
                                            $scope.tiles = response;
                                            deferred.resolve(true);
                        });
                        drillRenewToProgression = false;
                        break;
                    }
                    if (renewalRate) {
                        performanceServ.getRenewalBySalesLevel($scope.opportunitiesActive, filtersToBeApplied, $scope.getActiveSubTab(), false).then(function(response) {
                            $scope.tiles = response;
                            deferred.resolve(true);
                        });
                        renewalRate = false;
                        break;
                    }
                    if (renewalRateArch) {
                        performanceServ.getRenewalByArchitecture($scope.opportunitiesActive, filtersToBeApplied, $scope.getActiveSubTab(), false).then(function(response) {
                            $scope.tiles = response;
                            deferred.resolve(true);
                        });
                        renewalRateArch = false;
                        break;
                    }
                    if (ceRenewInteraction) {
                        angular.extend(filtersToBeApplied, $scope.chartFilters);
                        performanceServ.getChartInteraction($scope.opportunitiesActive, filtersToBeApplied, $scope.getActiveSubTab(), false).then(function(response) {
                            if (response[2].activeCategory===1) {
                                $scope.$broadcast('renew-performance-customer', $scope.tiles[2]);
                            }
                            $scope.tiles = response;
                            deferred.resolve(true);
                        });
                        ceRenewInteraction = false;
                        break;
                    }
                    //interaction on customer chart from second chart
                    if (ceAttachInteraction) {
                        angular.extend(filtersToBeApplied, $scope.chartFilters);
                        performanceServ.getAttachChartInteraction($scope.opportunitiesActive, filtersToBeApplied, $scope.getActiveSubTab(), false).then(function(response) {
                            if (response[2].activeCategory===1) {
                                $scope.$broadcast('renew-performance-customer', $scope.tiles[2]);
                            }
                            $scope.tiles = response;
                            deferred.resolve(true);
                        });
                        ceAttachInteraction = false;
                        break;
                    }
                    //interaction on selecting customer on third chart on ts renew
                    if (updateCustomers){
                        angular.extend(filtersToBeApplied, $scope.chartFilters);
                        performanceServ.getChartInteraction($scope.opportunitiesActive, filtersToBeApplied, $scope.getActiveSubTab(), false, 'updateCustomer').then(function(response) {
                            $scope.tiles = response;
                            $scope.$broadcast('active-spc-key-selection', $scope.tiles[2].activeCategory);
                            deferred.resolve(true);
                        });
                        updateCustomers = false;
                        break;
                    }
                    //interaction on selecting customer on third chart on ts attach
                    if (updateAttachCustomers) {
                        angular.extend(filtersToBeApplied, $scope.chartFilters);
                        performanceServ.getAttCustInteraction($scope.opportunitiesActive, filtersToBeApplied, $scope.getActiveSubTab(), false, 'updateCustomer').then(function(response) {
                            $scope.tiles = response;
                            $scope.$broadcast('active-spc-key-selection', $scope.tiles[2].activeCategory);
                            deferred.resolve(true);
                        });
                        updateAttachCustomers = false;
                        break;
                    }
                    if (inQuarterRenewalRate) {
                        performanceServ.inQuarterRenewalRate($scope.opportunitiesActive, filtersToBeApplied, $scope.getActiveSubTab(), false).then(function(response) {
                            $scope.tiles = response;
                            if($scope.tiles[0]["data-key"]=== "corporateAttachRate"&& $scope.tiles[0].type==="bar")
                            {
                                $scope.setListKeys($scope.tiles[0]);
                            }

                            deferred.resolve(true);
                        });
                        inQuarterRenewalRate = false;
                        break;
                    }
                    //squareCharts for TS Attach
                    if (salesSquareChart || customerSquareChart) {
                        var salesOrCustomer;
                        if (salesSquareChart) {
                            salesOrCustomer = 'sales';
                        } else {
                            salesOrCustomer = 'customer';
                        }
                        performanceServ.getAttachSquareChart($scope.opportunitiesActive, filtersToBeApplied, $scope.getActiveSubTab(), false, salesOrCustomer).then(function(response) {
                            $scope.tiles = response;
                            $scope.getListDataForSquareBlock($scope.tiles[2]);
                            //Change for DE156224
                            if ($scope.tiles[2].type === "square_block" && $scope.tiles[2].viewType == 'list' && $scope.tiles[2].expanded === 1) {
                                $scope.moveScrollToRight($scope.tiles[2]);
                            }
                            deferred.resolve(true);
                        });
                        salesSquareChart = false;
                        customerSquareChart = false;
                        break;
                    }/*else if($scope.getActiveSubTab() === 'ts' && $scope.opportunitiesActive === 'attach'){
                       performanceServ.getRenewDrillData($scope.opportunitiesActive, filtersToBeApplied, $scope.getActiveSubTab(), false, fromToggle).then(function(response) {
                            $scope.tiles = response;
                            if(response[2].activeCategory===undefined){
                                    response[2].activeCategory = 0;
                            }
                            if(response[2].type ==='line_chart_rr'){
                                $scope.toggleViewType(response[2],'chart')
                            }
                            deferred.resolve(true);
                        });
                        drillRenew = false;
                        fromToggle = false;
                        break;
                    }*/
                    if (attachRateBySalesLevel) {
                        performanceServ.attachRateBySalesLevel($scope.opportunitiesActive, filtersToBeApplied, $scope.getActiveSubTab(), false).then(function(response) {
                            $scope.tiles = response;
                            if($scope.tiles[0]["data-key"]=== "corporateAttachRate" && $scope.tiles[0].type==="line"){
                                $scope.setListKeys($scope.tiles[0]);
                            }
                            deferred.resolve(true);
                        });
                        attachRateBySalesLevel = false;
                        break;
                    }
                    if (warrantyBarChart) {
                        performanceServ.attachRateByWarranty($scope.opportunitiesActive, filtersToBeApplied, $scope.getActiveSubTab(), false).then(function(response) {
                            $scope.tiles = response;
                            if($scope.tiles[0]["data-key"]=== "corporateARBySales" && $scope.tiles[0].type==="bar"){
                                $scope.setListKeys($scope.tiles[0]);
                            }
                            deferred.resolve(true);
                        });
                        warrantyBarChart = false;
                        break;
                    }
                    else {
                        if (attachCustomer){
                            isCust=true;
                        }
                        // if ($scope.opportunitiesActive === "attach" && $scope.getActiveSubTab() === "ts") {
                        //     if (($scope.tiles && $scope.tiles[0].activeCategory===0) || ($scope.tiles && $scope.tiles[2].activeCategory===1)) {
                        //         performanceServ.getPerformanceData($scope.opportunitiesActive, filtersToBeApplied, $scope.getActiveSubTab(), false, false).then(function(response) {
                        //             $scope.tiles = response;
                        //             if($scope.tiles[0]["data-key"]=== "corporateAttachRate" && $scope.tiles[0].type==="bar"){
                        //                 $scope.setListKeys($scope.tiles[0]);
                        //             }
                        //         })
                        //     }
                        // }
                        performanceServ.getPerformanceData($scope.opportunitiesActive, filtersToBeApplied, $scope.getActiveSubTab(), false, isCust).then(function(response) {
                            $rootScope.accessIssue = "";
                            resetRenew = false;
                            if ($scope.getActiveSubTab() === "ts") {
                                if (response[2].activeCategory===1) {
                                    $scope.$broadcast('renew-performance-customer', $scope.tiles[2]);
                                }
                            }

                            if ($scope.opportunitiesActive === "attach" && $scope.getActiveSubTab() === "swss") {
                                response[2].disabled = true;
                            }
                            if($scope.tiles){
                                //changes to retain the category in the first chart in Total renew performance when filter is applied
                                if($scope.opportunitiesView === 'performance' && (($scope.opportunitiesActive === 'attach'&& ($scope.subopportunity == 'ts' || $scope.subopportunity == 'swss'|| $scope. subopportunity == 'total')) || ($scope.opportunitiesActive === 'renew' && ($scope.subopportunity == 'ts' || $scope.subopportunity == 'swss' || $scope.subopportunity == 'total'))) && !toggleSubTab){
                                    var actCatBackup = $scope.tiles[0].activeCategory;
                                }
                            }
                            $scope.tiles = response;
                            //in Total Renew perf, when drilled down to InQuarter Renewal and go to TS Renew performance and come back to Total renew performance, the 1st graph was not correct. ANd back arrow was missing in both ts/total renew perf - DE182671
                            if($scope.opportunitiesView === 'performance' && ($scope.opportunitiesActive === 'renew' &&($scope.subopportunity == 'total' || $scope.subopportunity == 'ts'))){
                                if($scope.tiles[0].title === 'Renewal Rate Progression - Quarterly Comparison' && $scope.tiles[0].categories.length === 0){
                                    if($scope.subopportunity == 'total'){
                                        $scope.tiles[0].type = 'line_chart_rr';
                                        $scope.pieActiveDrill = 'In Quarter Total Renewal Rate';
                                    }else if($scope.subopportunity == 'ts'){
                                        $scope.pieActiveDrill = 'In Quarter Renewal Rate';
                                    }
                                }
                            }
                            if(response[2].activeCategory===undefined){
                                    response[2].activeCategory = 0;
                            }
                            if(response[2].type ==='line_chart_rr'){
                                $scope.toggleViewType(response[2],'chart')
                            }
                            if($scope.tiles[0]["data-key"]=== "corporateAttachRate"){
                                $scope.setListKeys($scope.tiles[0]);
                            }
                             // Changes for DE132903
                             // to make customer call in total renew performance when customer option is selected in 3rd chart with the category changed in the 1st chart
                            if ($scope.opportunitiesActive === 'renew' && ($scope.subopportunity === 'ts' || $scope.subopportunity === 'swss' || $scope.subopportunity === 'total') && $scope.opportunitiesView === 'performance'){
                                if ((angular.isDefined($scope.tiles) && $scope.tiles[2].activeCategory === 1) && $scope.tiles[2]['data-key'] === 'renewalBookingsByQuarter')
                                $scope.getSPCData(1);
                                isCust = true;
                            }
                            //Need to check - why this code is required.
                            /*if ($scope.opportunitiesActive === "renew" && $scope.getActiveSubTab() === "ts") {
                                if ($scope.tiles && $scope.tiles[0].activeCategory===1) {
                                    if(!renewalRate) {
                                        performanceServ.getRenewalBySalesLevel($scope.opportunitiesActive, filtersToBeApplied, $scope.getActiveSubTab(), false).then(function(response) {
                                            $scope.tiles = response;
                                        });
                                    }
                                }
                                if (!isCust) {
                                    if ($scope.tiles && $scope.tiles[2].activeCategory===1){
                                        performanceServ.getPerformanceData($scope.opportunitiesActive, filtersToBeApplied, $scope.getActiveSubTab(), false, false).then(function(response) {
                                            $scope.tiles = response;
                                            if($scope.tiles[0]["data-key"]=== "corporateAttachRate"){
                                                $scope.setListKeys($scope.tiles[0]);
                                            }
                                        })
                                    }
                                }
                            }*/
                            // check why commented : - ketan to arun
                            // if($scope.opportunitiesActive === "renew"){
                            //     $scope.updateRenewTabData();
                            // }
                            // if(retainActiveCategory && !$scope.globalView){                                
                            //     $scope.getSPCData(retainActiveCategory);
                            //     $scope.tiles[2].activeCategory= retainActiveCategory;
                            //     isCust = true;
                            // }
                            if(actCatBackup){
                                $scope.selectCategory($scope.tiles[0],actCatBackup,0);
                            }

                            if ($scope.isBookmarkActive()) {
                                if (GlobalBookmarkServ.bookmark !== undefined) {
                                    //changes to retain the category in the first chart in Total renew performance when filter is applied
                                    if($scope.opportunitiesView === 'performance' && (($scope.opportunitiesActive === 'attach'&& ($scope.subopportunity == 'ts' || $scope.subopportunity == 'swss'|| $scope. subopportunity == 'total')) || ($scope.opportunitiesActive === 'renew' && ($scope.subopportunity == 'ts' || $scope.subopportunity == 'swss' || $scope.subopportunity == 'total'))) && !toggleSubTab){
                                        if($scope.currBookmark.filter[2] !== undefined){
                                            //Changes for DE164052
                                            activeCategoryBackup = $scope.currBookmark.filter[2];
                                            if($scope.currBookmark.filter[2]){
                                                //Bookmark was created on RR by SL chart but when bookmark is applied, it landed on Waterfall chart and hence, Bookmark criteria changed message was displayed.
                                                if($scope.opportunitiesActive === 'renew' && ($scope.subopportunity == 'ts' || $scope.subopportunity == 'swss' || $scope.subopportunity == 'total')){    
                                                    opportunitiesServ.defaultWaterfall = false;
                                                }
                                                $scope.selectCategory($scope.tiles[0],$scope.currBookmark.filter[2],0);
                                                  $scope.currBookmark.filter[2]= undefined; //Changes for DE164091
                                            }
                                        }
                                    }
                                }
                            }
                            if($scope.currBookmark){
                                if($scope.currBookmark.filter[4]){
                                    $scope.selectCategory($scope.tiles[1],$scope.currBookmark.filter[4],0);
                                    $scope.currBookmark.filter[4]= undefined;
                                }
                            }

                         $scope.getBookmarkCaptureByCategory();
                         if (opportunitiesServ.showWaterfall) {
                            $scope.selectCategory($scope.tiles[0], 1, 0);
                            $timeout(function () {
                                $scope.expand($scope.tiles[0], 0, $scope.opportunitiesActive);
                            }, 500);
                            opportunitiesServ.showWaterfall = false;
                        }
                        if(opportunitiesServ.defaultWaterfall) {
                            $scope.selectCategory($scope.tiles[0], 1, 0);
                            opportunitiesServ.defaultWaterfall = false;
                            matchTilesHeight(1200);
                        }
                            deferred.resolve(true);
                        });
                        attachCustomer = false;
                    }
                    break;
                default:
            }
            return deferred.promise;
        };

        $scope.getBookmarkCaptureByCategory = function(){
            if($scope.isBookmarkActive()){
                if (GlobalBookmarkServ.bookmark !== undefined) {
                    if($scope.opportunitiesView === 'performance' && (($scope.opportunitiesActive === 'attach'&& ($scope.subopportunity == 'ts' || $scope.subopportunity == 'swss'|| $scope. subopportunity == 'total')) || ($scope.opportunitiesActive === 'renew' && $scope.subopportunity == 'ts')) && !toggleSubTab){
                            if($scope.currBookmark){
                                if($scope.currBookmark.filter[3]){
                                $scope.selectCategory($scope.tiles[2],$scope.currBookmark.filter[3],0);
                                $scope.currBookmark.filter[3]= undefined; //Changes for DE164091
                            }
                        }
                    }
                }
            }
        }

        $scope.updateRenewTabData = function(){
            if($scope.getActiveSubTab() === 'swss' && $scope.opportunitiesView === 'performance'){
                $scope.addQuarters($scope.tiles[2], $scope.currentQuarter);
                $scope.tiles[2].rr_categories = performanceServ.getQuarter($scope.tiles[2].data_set);
            }
        };

        $scope.getProductFamily = function (c) {
            if (angular.isDefined(productFamily)) {
                if (c.selectedFiscal === "FY") {
                    c.productfamilylist = angular.copy(productFamily['data_list_fy']);
                    c.productfamilynet = angular.copy(productFamily['data_net_fy']);
                } else if (c.selectedFiscal === "FM") {
                    c.productfamilylist = angular.copy(productFamily['data_list_fm']);
                    c.productfamilynet = angular.copy(productFamily['data_net_fm']);
                }
                else {
                    c.productfamilylist = angular.copy(productFamily['data_list']);
                    c.productfamilynet = angular.copy(productFamily['data_net']);
                }

            }
        }
 
        //function used to pass the quarter and sales values to tableau
        $scope.quarterToTableau = function(d, e){
            if(d.state === e && $scope.opportunitiesActive === "renew" && $scope.getActiveSubTab() === "ts"){
                   var tableauUrl;  
                   var sales = $filter('filter')($scope.appliedFilters, {categoryId: 'Sales'});
                   if(sales && sales.length <= 3){
                        var filtersApplied = $scope.CiscoUtilities.cleansedFilters($scope.appliedFilters);
                        var salesLevel = "NODE="
                        tableauUrl =  "https://cr-analytics.cisco.com/#/site/CDOanalytics/views/TSRR_2/RenewalRatePerformance?QFY=" + e + "&" ;
                           //https://stg-tableau.cisco.com/#/site/CDOanalytics/views/TSRR/PerformanceDetails
                        angular.forEach(filtersApplied.nodeName,function(salesValue){
                            tableauUrl = tableauUrl + salesLevel + salesValue + "&";
                        })
                       
                        $window.open(tableauUrl, '_blank');
                    }
               
            }
        }

        // changes for DE133541 and DE132186
        var fillPCWithAccMng = function(response, name) {
            var tempCategories = response[2].categories;
            response[2].categories = [];
            if (name.length === 1) {
                response[2].categories[1] = name + "'s Partners";
                response[2].categories[2] = name + "'s Customers";
            } else if( name.length > 1){
                response[2].categories[0] = "";
                response[2].categories[1] = "";
                response[2].categories[2] = 'Opportunities by Customers';
            }else{
                response[2].categories = tempCategories;
            }

            return response;
        }

        // changes for DE133541 and DE132186
        var fillPCCategories = function(response, name) {
            var tempCategories = response[2].categories;
            response[2].categories = [];
            if (name.length === 1) {
                response[2].categories[1] = name + "'s Partners";
                response[2].categories[2] = name + "'s Customers";
            } else if( name.length > 1){
                response[2].categories[0] = "";
                response[2].categories[1] = "";
                response[2].categories[2] = 'Opportunities by Customers';
            }else{
                response[2].categories = tempCategories;
            }

            return response;
        }

        var handlePerformance = function (c, index) {
            if ($scope.opportunitiesActive === "renew" && $scope.getActiveSubTab() === "ts") {
                if (c["data-key"]==="inQuarterRenewalRate" || c["data-key"]==="totalRenewalRateProgression") {
                    if (index === 2) {
                        c["data-key"] = "inQuarterRenewalRate";
                    }
                    if (c.types) {
                        c.type = c.types[index];
                    }
                    if (c.type === "bar" ) {
                        drillRenew = true;
                        fromToggle = true;
                    }
                    if (c.type === "line") {
                        renewalRate = true;
                    }
                } else {
                    if (index===0){
                        isCust = false;
                    }
                }
                $scope.getData();
            }
            // changes to enable Total renew performance as TS renew performance
            if ($scope.opportunitiesActive === "renew" && $scope.getActiveSubTab() === "total") {
                if (c["data-key"]==="inQuarterRenewalRate" || c["data-key"]==="totalRenewalRateProgression") {
                    if (index===2) {
                        c["data-key"] = "inQuarterRenewalRate";
                    }
                    //making isCust false when we change the category to 1st option in 1st chart while in customers in 3rd chart
                    if(c["data-key"]==="inQuarterRenewalRate"){
                        if (index===0){
                            isCust = false;
                        }
                    }
                    if (c.types) {
                        c.type = c.types[index];
                    }
                    if (c.type === "bar") {
                        drillRenew = true;
                        fromToggle = true;
                    }
                    if (c.type === "line") {
                        renewalRate = true;
                    }
                } else {
                    if (index===0){
                        isCust = false;
                    }
                }
                $scope.getData();
            }
            if ($scope.opportunitiesActive === "renew" && $scope.getActiveSubTab() === "swss") {
                if (c["data-key"]==="inQuarterRenewalRate" || c["data-key"]==="totalRenewalRateProgression") {
                    if (index === 2 || index === 3) {
                    c["data-key"] = "inQuarterRenewalRate";
                    }
                    if (c.types) {
                    c.type = c.types[index];
                    }
                    if (c.type === "bar") {
                    drillRenew = true;
                    fromToggle = true;
                    }
                    if (c.type === "line" && index ===2) {
                        renewalRate = true;
                    }
                    if(c.type==="line" && index===3){
                        renewalRateArch= true;
                    }
                } else {
                    if (index===0){
                        isCust = false;
                    }   
                }
                    $scope.getData();
                }

            if ($scope.opportunitiesActive === "attach" && $scope.getActiveSubTab() === "ts") {
                if (c['data-key']==='corporateARBySales' || c['data-key']==='corporateAttachRate') {
                    if (c.types) {
                        c.type = c.types[index];
                    }
                    if(index === 0){
                        c['data-key'] = "corporateARBySales";
                    }
                    if (index===1){
                        warrantyBarChart = true;
                        c['data-key'] = "corporateARBySales";
                    }
                    if (index===2){
                        inQuarterRenewalRate = true;
                        c['data-key'] = "corporateAttachRate";
                    }
                }
                //if (c['data-key']==="arQuarterlyProgression") {
                if (c['data-key']==="arQuarterlyProgression" || c['data-key']==="bookingsBySalesLevel") {
                    if (index===1) {
                        $scope.chartFilters = {};
                        salesSquareChart = true;
                        c['data-key'] = "bookingsBySalesLevel";
                    }
                    if (index===0){
                        $scope.chartFilters = {};
                        isCust = false;
                        c['data-key'] = "arQuarterlyProgression";
                    }
                    if (index===2) {
                        $scope.chartFilters = {};
                        customerSquareChart = true;
                        c['data-key'] = "bookingsBySalesLevel";
                    }
                    if (index===3) {
                        $scope.chartFilters = {};
                        attachCustomer = true;
                    }
                }
                $scope.getData();
            }
            if (($scope.opportunitiesActive === "attach" && $scope.getActiveSubTab() === "swss") || ($scope.opportunitiesActive === "attach" && $scope.getActiveSubTab() === "total")){
                  if (c['data-key']==='corporateARBySales' || c['data-key']==='corporateAttachRate') {
                    if (c.types) {
                        c.type = c.types[index];
                    }
                    if(index === 0){
                        c['data-key'] = "corporateARBySales";
                    }
                    if (index===1){
                        inQuarterRenewalRate = true;
                        c['data-key'] = "corporateAttachRate";
                    }
                }
                //if (c['data-key']==="bookingsBySalesLevel") {
                   if (c['data-key']==="arQuarterlyProgression" || c['data-key']==="bookingsBySalesLevel") {
                    if (index===1) {
                        $scope.chartFilters = {};
                        salesSquareChart = true;
                        c['data-key'] = "bookingsBySalesLevel";
                    }
                    if (index===0){
                        $scope.chartFilters = {};
                        isCust = false;
                        c['data-key'] = "arQuarterlyProgression";
                    }
                    if (index===2) {
                        $scope.chartFilters = {};
                        customerSquareChart = true;
                        c['data-key'] = "bookingsBySalesLevel";
                    }
                    if (index===3) {
                        $scope.chartFilters = {};
                        attachCustomer = true;
                    }
                }

                $scope.getData();
            }
        }

        $scope.clearSPCData = function(index, c) {
            var defered = $q.defer();
            if ($scope.opportunitiesView === 'performance') {
                $scope.$broadcast('performance-selection-changed', {});
                handlePerformance(c, index);
                  if ($scope.opportunitiesActive === "attach" && $scope.getActiveSubTab() === "ts") {//fix for DE145690
                    if (c["data-key"]=== "bookingsBySalesLevel" && index=== 0){
                         $scope.$broadcast('active-spc-key-selection', configServ.opportunitiesKeyIndexMap[index]);
                     }
                  }
                return defered.promise;
            };
            if ($scope.opportunitiesActive === "attach" && $scope.getActiveSubTab() === "swss") {
                if (c.type === "pie") {
                    $scope.swssActive = c.activeCategory;
                }
            }

            var spcKey = configServ.opportunitiesKeyIndexMap[index];
            if ($scope.exceptionKeys.indexOf(spcKey) > -1) {
                defered.resolve(true);
                return defered.promise;
            }
            if (angular.equals({}, $scope.chartFilters)) {
                if ($scope.accounts[1] && $scope.accounts[1].selected.length > 0) {
                    $scope.accMngDrilled = true;
                }
            } else {
                $scope.resetChartFilters();
                if ($scope.accounts[1] && $scope.accounts[1].selected.length > 0) {
                    $scope.accMngDrilled = true;
                }
                if ($scope.opportunitiesActive !== "ciscoOne" && $scope.opportunitiesActive !== "drs"){
                    $scope.isDataCallReturned = false;
                    $scope.getData();
                }
            }

            defered.resolve(true);

            return defered.promise;
        };

        //this function is for ts screens
        var handleChartInteraction = function() {
            if ($scope.opportunitiesActive==='renew') {
                ceRenewInteraction = true;
            }
            if ($scope.opportunitiesActive==='attach') {
                ceAttachInteraction = true;
            }

            $scope.getData();
        }

        $scope.getSPCData = function(index) {
            // $('.tooltip').hide();
            // $('.d3-tip').hide();
             $scope.linecountselected = 0;
             $scope.listamountselected = 0;
            if($scope.tiles){
                $scope.tiles[2].checkedstates = [];
                $scope.tiles[2].renderGraphForSelectAll = false ;
                // Changes for DE163319
                /*if($scope.tiles[0].activeCategory !== undefined){
                    $scope.tiles[0].activeCategory = 0;
                }*/
            }
            var defered = $q.defer();
            var isQuaterChanged = false;
            if ($scope.opportunitiesView === 'performance') {
                // changes to make customer call when after changing the category in 1st chart and selecting customer in 3rd chart in Total renew performance
                if (($scope.opportunitiesActive === "renew" || $scope.opportunitiesActive === "attach") && (($scope.getActiveSubTab() === "ts" || $scope.getActiveSubTab() === "swss")) || ($scope.opportunitiesActive === 'renew' && $scope.getActiveSubTab() === 'total')) {
                    if (index==='sales'){
                        if($scope.isSelectedDropDown){
                            $scope.isSelectedDropDown = false;
                        }
                        defered.resolve(true);
                        return defered.promise;
                    } else {
                        if ($scope.opportunitiesActive === "attach" && $scope.getActiveSubTab() === "ts") {
                            if($scope.chartFilters.quarterId && $scope.chartFilters.quarterId.length > 2) {
                                // Changes for DE132812
                                if($scope.oldQuarter === undefined && $scope.chartFilters.quarterId !== undefined){
                                    isQuaterChanged = true;
                                }if($scope.oldQuarter !== undefined && $scope.oldQuarter !== $scope.chartFilters.quarterId){
                                    isQuaterChanged = true;
                                }
                                if ($scope.chartFilters.activeKey && $scope.chartFilters.activeKey.length > 0) {
                                    if(!isQuaterChanged){
                                        defered.resolve(true);
                                        return defered.promise;
                                    }else{
                                        isQuartClicked = true; // Changes for DE132812
                                        $scope.chartFilters.activeKey = [];
                                        handleChartInteraction();
                                    }
                                }else {
                                    isQuartClicked = true; // Changes for DE132812
                                    handleChartInteraction();
                                }
                                $scope.oldQuarter =  $scope.chartFilters.quarterId;
                            }else {
                                if (isQuartClicked) {
                                    isQuartClicked = false;
                                    handleChartInteraction();
                                }
                            }
                        } else {
                            handleChartInteraction();
                        }
                    }
                }
                if($scope.isSelectedDropDown){
                    $scope.isSelectedDropDown = false;
                }
                defered.resolve(true);
                return defered.promise;
            }
            var activeSPCKey = index;
            
            if (typeof index === "number") {
                activeSPCKey = configServ.opportunitiesKeyIndexMap[index];
            }
           

            $scope.$broadcast('active-spc-key-selection', activeSPCKey);

         

            if (activeSPCKey === "sales" && ($scope.chartFilters.pcNodeName && $scope.chartFilters.pcNodeName.length > 0)) {
                var selectedArea = JSON.parse($scope.chartFilters.pcNodeName);
                if (selectedArea.length > 0){
                    $scope.resetChartFilters();
                    $scope.isDataCallReturned = false;
                    $scope.getData();
                }
                if($scope.isSelectedDropDown){
                    $scope.isSelectedDropDown = false;
                }
                defered.resolve(true);
                return defered.promise;
            }

            if ($scope.exceptionKeys.indexOf(activeSPCKey) > -1) {
               if($scope.opportunitiesActive === "refresh"){
                    if(angular.isDefined($scope.tiles)){
                        if ($scope.tiles[0].viewType === 'list' || $scope.tiles[1].viewType === 'list' ){
                           $scope.productFamily();
                        }
                    }
                }
                if($scope.isSelectedDropDown){
                    $scope.isSelectedDropDown = false;
                }
                defered.resolve(true);
                return defered.promise;

            }//Changes by Shankar
            if(activeSPCKey=== "customer" && $scope.opportunitiesActive === "refresh"){
                if(angular.isDefined($scope.tiles)){
                    if ($scope.tiles[0].viewType === 'list' || $scope.tiles[1].viewType === 'list' ){
                       $scope.productFamily();
                    }
                }
            }

            var allFilters = {};
            var subArchitechture = true;

            if ($scope.opportunitiesActive === "refresh") {
                subArchitechture = $scope.pieActiveDrill;
            } else {
                subArchitechture = false;
            }

            
            clearPCFilter($scope.chartFilters);
            if ($scope.isBookmarkActive()) {
                if (GlobalBookmarkServ.bookmark !== undefined) {
                    var bookmarkFilter = $scope.CiscoUtilities.cleansedFilters($scope.appliedFilters);
                    angular.extend(allFilters, bookmarkFilter);
                    $scope.whichBookmark = GlobalBookmarkServ.bookmark.name;
                    if ($scope.isFiltersChanged || GlobalBookmarkServ.bookmark.isModified) {
                        $scope.isFiltersChanged = true;
                    }
                } else {
                    $scope.whichBookmark = $scope.bkmark.name;
                    if(!$scope.isFiltersChanged) {
                        $scope.appliedFilters = angular.copy($scope.bkmark.filter[0]);
                    }

                    var bookmarkFilter = $scope.CiscoUtilities.cleansedFilters($scope.appliedFilters);
                    angular.extend(allFilters, bookmarkFilter);
                    if ($scope.isFiltersChanged || GlobalBookmarkServ.bookmark.isModified) {
                        $scope.isFiltersChanged = true;
                    }
                }
            }
            //active key need not be passed for following scenarios in if condition-nm
            // if($scope.chartFilters.activeKey){ //DE144839
            //     if(activeSPCKey=== "customer" && ($scope.subopportunity ==='total'||$scope.opportunitiesActive==='all'))
            //         {
            //             delete $scope.chartFilters["activeKey"];
            //         }
            //     }
            angular.extend(allFilters, $scope.CiscoUtilities.cleansedFilters($scope.appliedFilters), $scope.chartFilters,$scope.propInsightSliderFilter);
            allFilters["globalView"] = $scope.globalView;
            opportunitiesServ.getSPCData($scope.opportunitiesActive, activeSPCKey, allFilters, $scope.getActiveSubTab(), subArchitechture, pieChartActiveValue).then(function(response) {
                if (angular.isObject($scope.tiles[2]["aging"]) && $scope.tiles[2].aging[1] && $scope.tiles[2].aging[1].length !== 0 && $scope.tiles[0].activeCategory === 1) {
                    if (activeSPCKey === "partner") {
                        var i = 1;
                        $scope.tiles[2].data[1] = angular.copy($scope.tiles[2].aging[i]);

                    }
                    if (activeSPCKey === "customer") {
                        i = 1;
                        $scope.tiles[2].data[2] = angular.copy($scope.tiles[2].aging[i]);
                    }
                }

                if ($scope.tiles[2].activeCategory === 3 && $scope.tiles[0].activeCategory === 0) {
                    $scope.tempAccountData = $scope.tiles[2].data[3];
                }

                if ($scope.tiles[2].activeCategory === 3 && $scope.tiles[0].activeCategory === 1) {
                    $scope.tiles[2].data[3] = angular.copy($scope.tiles[2].aging[1]);
                }

                if($scope.showBackButton===true ){//Onclick of Denominator in swss/ts customer API call should go
                    response[2].activeCategory=2;
                }
                $scope.tiles = response;

                //$scope.linecountselected = 0;
                //$scope.listamountselected = 0;
                //$scope.tiles[2].checkedstates = [];
                $scope.updateSelectionDropDownFlag();
                matchTilesHeight(100);
                $scope.toggleViewType(response[2], response[2].viewType);

                defered.resolve(true);
            });
            return defered.promise;
        };

         $scope.updateSelectionDropDownFlag = function(){
            if($scope.isSelectedDropDown && $scope.isDataCallReturned){
                $scope.isSelectedDropDown = false;
            }
        };

        var refreshSpcDataEvent = $scope.$on('refresh-spc-data', function(event, data) {
           
            $scope.drilledInChartValue = {};
            if(!$scope.pieActiveDrill){
                if(["security", "collaboration"].includes(CiscoUtilities.getSubTab())) { // Sub BEs are selected from security/collab sub-tabs, so pushing subcategory.
                    $scope.drilledInChartValue.subCatagory = data.activeKey;
                } else {
                    $scope.drilledInChartValue.catagory = data.activeKey;
                }
            } else {
                $scope.drilledInChartValue.catagory = $scope.pieActiveDrill;
                $scope.drilledInChartValue.subCatagory = data.activeKey;
            }
            if(data.agingKey){
                $scope.drilledInChartValue.agingSelection = data.agingKey;
            }
            $scope.drilledInChartValue.quarter = data.quarterId;
            if ($scope.chartFilters.pcNodeName && $scope.chartFilters.pcNodeName.length > 0) {
                var selectedArea = JSON.parse($scope.chartFilters.pcNodeName);
                if (selectedArea.length > 0 && ($scope.chartFilters.activeKey && (data.activeKey === null || data.activeKey === ''))) {
                    angular.extend($scope.chartFilters, data);
                    maintainAreaOfPartCust = true;
                    //customer call preventing second time after deselecting legend again.- DE132907
                    if(($scope.chartFilters.activeKey)!==(data.activeKey)){
                        $scope.getData();
                    }
                }
            }
            angular.extend($scope.chartFilters, data);
            var activeTab = $scope.getActiveSPCTab();
            if (activeTab) {
                if ($scope.opportunitiesActive === "refresh"){
                    var filtersToBeApplied = {};
                    var subArchitechture;

                    if ($scope.opportunitiesActive === "refresh") {
                        subArchitechture = $scope.pieActiveDrill;
                    } else {
                        subArchitechture = false;
                    }
                    if ($scope.chartFilters) {
                        angular.extend(filtersToBeApplied, $scope.CiscoUtilities.cleansedFilters($scope.appliedFilters), $scope.chartFilters, $scope.propInsightSliderFilter);
                    } else {
                        filtersToBeApplied = $scope.CiscoUtilities.cleansedFilters($scope.appliedFilters);
                    }
                    if($scope.areaActive){
                        filtersToBeApplied["customer"]  = $scope.areaActive;
                     }
                     filtersToBeApplied["globalView"] = $scope.globalView;
                    if($scope.opportunitiesActive === "refresh"){
                        if(angular.isDefined($scope.tiles)){
                            if($scope.tiles[0].viewType === 'list' || $scope.tiles[1].viewType === 'list' ){
                                opportunitiesServ.getProductFamilyData($scope.opportunitiesActive, filtersToBeApplied, $scope.getActiveSubTab(), subArchitechture).then(function(response) {
                                    productFamily = response;
                                    if($scope.opportunitiesActive === "refresh"){
                                        $scope.tiles.forEach( function(c){
                                            if (c.type === "pie" || c.type === "bar_stacked"){
                                                $scope.getProductFamily(c);
                                            }
                                        })
                                    }
                                });
                            }
                        }
                    }
                }
                $scope.isSelectedDropDown = true;
                $scope.getSPCData(activeTab);
                // Changes for expanded list view to update when u select quarter from middle chart
                if ($scope.tiles[2].activeCategory === 2 && $scope.tiles[2].expanded === 1) {
                    $scope.expand($scope.tiles[2], 2);
                }
            }
        });

        var maintainAreaOfPartCust = false;
        var refreshAllDataEvent = $scope.$on('refresh-all-data', function(event, data) {
            var activeTab = $scope.getActiveSPCTab();
            if (activeTab && activeTab !== "sales") {
                if (data && data.pcNodeName) {
                    data[$scope.getActiveSPCTab()] = data.pcNodeName;
                }
                maintainAreaOfPartCust = true;
                if ($scope.chartFilters.partner) {
                    if (activeTab === "customer" && angular.isArray(JSON.parse($scope.chartFilters["partner"]))) {
                        delete $scope.chartFilters["partner"];
                    }
                }
                if ($scope.chartFilters.customer) {
                    if (activeTab === "partner" && angular.isArray(JSON.parse($scope.chartFilters["customer"]))) {
                        delete $scope.chartFilters["customer"];
                    }
                }
                if ($scope.areaActive.length === 0) {
                    if ($scope.quarterActive && $scope.quarterActive.length > 0) {
                        var retainedQuarter = angular.copy($scope.quarterActive);
                        var retainedQuarterId = $scope.chartFilters.quarterId;
                    }
                    if ($scope.active && $scope.active.length > 0) {
                        var retainedActive = angular.copy($scope.active);
                    }
                    $scope.resetChartFilters();
                    if (retainedQuarter && retainedQuarter.length > 0) {
                        $scope.quarterActive = angular.copy(retainedQuarter);
                        data.quarterId = retainedQuarterId;
                    }
                    if (retainedActive && retainedActive.length > 0) {
                        $scope.active = angular.copy(retainedActive);
                    }
                    angular.extend($scope.chartFilters, data);
                    if(!angular.isDefined($scope.chartFilters.pcNodeName)){
                        if($scope.chartFilters.pcNodeName === '[]' || $scope.chartFilters.pcNodeName === undefined){
                            $scope.getSPCData(activeTab);
                        }
                    }
                }
                angular.extend($scope.chartFilters, data);
                if ($scope.opportunitiesView === 'performance') {
                    if ($scope.opportunitiesActive === "renew" && $scope.getActiveSubTab() === "ts"){
                        updateCustomers = true;
                    }
                    if ($scope.opportunitiesActive === "attach" && $scope.getActiveSubTab() === "ts"){
                        updateAttachCustomers = true;
                    }
                }
                $scope.isSelectedDropDown = true;
                $scope.getData();
            }
            if($scope.opportunitiesActive === "refresh" && ($scope.tiles[0].viewType === 'list' || $scope.tiles[1].viewType === 'list' )){
                var filtersToBeApplied = {};
                var subArchitechture;
                var refreshListFilters = {};
                if (activeTab === 'sales'){
                    refreshListFilters.nodeName = data.pcNodeName;
                }
                angular.extend($scope.chartFilters, refreshListFilters);
                if ($scope.opportunitiesActive === "refresh" || $scope.opportunitiesActive === "ciscoOne") {
                    subArchitechture = $scope.pieActiveDrill;
                } else {
                    subArchitechture = false;
                }
                if ($scope.chartFilters) {
                    angular.extend(filtersToBeApplied, $scope.CiscoUtilities.cleansedFilters($scope.appliedFilters), $scope.chartFilters, $scope.propInsightSliderFilter);
                } else {
                    filtersToBeApplied = $scope.CiscoUtilities.cleansedFilters($scope.appliedFilters);
                }
                if($scope.areaActive){
                    filtersToBeApplied["customer"]  = $scope.areaActive;
                 }
                filtersToBeApplied["globalView"] = $scope.globalView;
                opportunitiesServ.getProductFamilyData($scope.opportunitiesActive, filtersToBeApplied, $scope.getActiveSubTab(), subArchitechture).then(function(response) {
                    productFamily = response;
                    if($scope.opportunitiesActive === "refresh"){
                        $scope.tiles.forEach( function(c){
                            if (c.type === "pie" || c.type === "bar_stacked"){
                                $scope.getProductFamily(c);
                            }
                        })
                    }
                });
            }
            $('.tooltip').show();
            $('.d3-tip').show();
        });

        $scope.getActiveSPCTab = function() { //activeTab
            var activeKey = null;
            angular.forEach($scope.tiles, function(tile) {
                if (tile['data-key'] === 'spc' || tile['data-key'] ==="renewalBookingsByQuarter" || tile['data-key']==="bookingsBySalesLevel") {
                    activeKey = tile.activeCategory;
                }
            });
            //opportunitiesKeyIndexMap ->0:sales,1:partner,2:customer
            //In case of Renew,tsrenew,third chart, when selectig booking by customer, activeCategory is coming as 1,
            // //so it takes activeTab as partner but it should be customer so forcefully passing activeCateogry as 2.
            //     if(angular.isDefined($scope.tiles) && angular.isDefined($scope.tiles[2].categories) && $scope.tiles[2].categories.length > 0 ){
            //         if ($scope.tiles[2].categories[1].indexOf("Customers") != -1){
            //             activeKey = 2;
            //         }
            //     }
                return configServ.opportunitiesKeyIndexMap[activeKey] || "sales";
            }

        $scope.salesLevel = [];
        $scope.accounts = [];


        $scope.getTileActiveOpp = function(c) {
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
        };


        $scope.getSalesLevelFilterValues = function(level, $event) {
            if ($event && $event.target.nodeName !== "A") {
                var nodeName = null;
                if (level > 1) {
                    nodeName = $scope.salesLevel[level - 1].selected;
                }
                filtersServ.getSalesFilterData(level, nodeName).then(function(response) {
                    if (!$scope.salesLevel[level]) {
                        $scope.salesLevel[level] = {
                            "values": response.values
                        };
                    } else {
                        $scope.salesLevel[level].values = response.values;
                    }
                    $scope.getSelectedCount();
                });
            } else {
                $scope.getSelectedCount();
            }
        };


        $scope.getAccountManagerFilterValues = function($event, fillKey) {
            if ($event && $event.target && $event.target.nodeName !== "A") {
                var level = 5;
                var nodeName = $scope.salesLevel[5].selected;
                if ($scope.salesLevel[6] && ($scope.salesLevel[6].selected && $scope.salesLevel[6].selected !== "*")) {
                    nodeName = $scope.salesLevel[6].selected
                    level = 6;
                }
                var accountSelected = $scope.accounts[1] && $scope.accounts[1].selected ? $scope.accounts[1].selected : null;
                filtersServ.getAccountManagerFilterData(level, nodeName, fillKey === 1 ? null : accountSelected).then(function(response) {
                    $scope.accounts[fillKey] = response;
                    $scope.getSelectedCount();
                });
            } else {
                if (fillKey === 1) {
                    $scope.accounts[2] = null;
                }
                $scope.getSelectedCount();
            }
        };


        $scope.hasAppliedFilters = function(category) {
            return $filter('filter')($scope.appliedFilters, { categoryId: category }).length;
        };

        var getBookmarkId = function (query) {
            var beforeHashValues = query[0].split('/');
            if (beforeHashValues[3] === 'all') {
                $scope.subopportunity = undefined;
            } else {
                $scope.subopportunity = beforeHashValues[4];
            }
            var len1 = beforeHashValues.length-1;
            var bkmarkId = beforeHashValues[len1];
            var bkmarkHashId = query[1].split('=')[1];
            var bothIds = {};
            bothIds.id = bkmarkId;
            bothIds.hashId = bkmarkHashId;

            return bothIds;
        }

        $scope.$on('filter-changed', function(data, event) {
            $scope.isFiltersChanged = event;
            $('.opportunity-tile').css("height", "auto");
        });



        $scope.$on('apply-filter', function(data, event) {
            data.preventDefault();
            $scope.currBookmark = GlobalBookmarkServ.bookmark;
            $scope.appliedFilters = event.appliedFilters;
            $scope.accounts = event.accounts;
            $scope.changeAccountManager = event.changeAccountManager;
            $scope.salesLevel = event.nodeName;
            $scope.appliedFiltersCount = event.appliedFiltersCount;

            $scope.sidebarActiveToggle(false);

            $sessionStorage.appliedFilters = JSON.stringify($scope.appliedFilters);
            $sessionStorage.put('appliedFilters', JSON.stringify($scope.appliedFilters));
            $sessionStorage.put('filterCount', JSON.stringify($scope.appliedFiltersCount)); //Change for not making the call when the view applied modal is closed when there is no filter selected - Sindhu
        //placing the code here for reducing the number of api calls
            if ($location.$$path.search($scope.opportunitiesActive) === -1) {
                return;
            }
            if (window.location.hash === "/sales/campaign/drs" || window.location.hash === "/sales/campaign/ciscoOne") {
                $scope.chartFilters = {};
                $scope.resetActive();
                $scope.drilledInChartValue = {};
                $scope.getData();
                if ($scope.opportunitiesView === 'performance') return;
                var activeTabName = $scope.getActiveSPCTab();
                if ($scope.exceptionKeys.indexOf(activeTabName) === -1) {
                    $scope.getSPCData(activeTabName);
                }
            } else {
                $scope.chartFilters = {};
                $scope.resetActive();
                $scope.drilledInChartValue = {};
                var locationStr;
                if ($location.absUrl().indexOf('?')===-1) {
                    locationStr = $location.path();
                } else {
                    locationStr = $location.url();
                }
                var queryParameter = locationStr.split('?');
                if (queryParameter.length > 1) {
                    var ids = getBookmarkId(queryParameter);
                    BookMarkData.getBookmarkById(ids).then(function(res){
                        $scope.bkmark = res.bookmarks[0];
                        $scope.currBookmark = res.bookmarks[0];
                        GlobalBookmarkServ.changeBookmarkActive();
                        GlobalBookmarkServ.bookmark = res.bookmarks[0];
                        GlobalBookmarkServ.activeBookmark = res.bookmarks[0].name;

                        $scope.getData().then(function() {
                            if ($scope.opportunitiesActive === "refresh") {
                                $scope.tiles.forEach(function(c) {
                                    if (c.type === "pie" || c.type === "bar_stacked") {
                                        $scope.getProductFamily(c);
                                    }
                                })
                            }
                        });
                        if ($scope.opportunitiesView === 'performance') return;
                        var activeTabName = $scope.getActiveSPCTab();
                    });
                } else {
                    if ($scope.opportunitiesView === 'performance') {
                        if (($scope.opportunitiesActive === "renew" || $scope.opportunitiesActive === "attach") && ($scope.getActiveSubTab() === "ts" || $scope.getActiveSubTab() === "swss" || $scope.getActiveSubTab() === "total")) {
                            if (isCust) {
                                isCust = false;
                                resetRenew = true;
                            }
                            performanceServ.getDataset(true);
                        }
                    }

                    $scope.getData(true).then(function() {
                        if ($scope.opportunitiesActive === "refresh") {
                            $scope.tiles.forEach(function(c) {
                                if (c.type === "pie" || c.type === "bar_stacked") {
                                    $scope.getProductFamily(c);
                                }
                            })
                        }
                    });
                    if ($scope.opportunitiesView === 'performance') return;
                    var activeTabName = $scope.getActiveSPCTab();
                }
            }

            if ($scope.tiles !== undefined) {
                if ($scope.tiles[2].expanded === 1) {
                    $scope.expand($scope.tiles[2], 2);
                }
                //Reseting the checkboxes if new filters are applied -G (Change is added here so that it can
                // work fine in ciscoOne and DRS too) for DE146668
                $scope.tiles[2].checkedstates = []
            }
        });

        $scope.clearFilters = function(category, keepApplied) {
            var cF = {};
            cF.category = category;
            cF.keepApplied = keepApplied;
           $rootScope.$emit('clear-filter-params',cF);
           if (typeof keepApplied === 'undefined') {
                if(($scope.tiles[2].expand === 1)){
                    $scope.expand($scope.tiles,2);
                }
             }

        };

        var rootActiveDrill =  $rootScope.$on('active-drill',function(event,data){
            if($scope.pieActiveDrill === data){
                $scope.pieActiveDrill = '';
            }
        })

        var clearPCFilter = function(pcFilter) {
            if (pcFilter.pcNodeName){
                if (pcFilter.customer){
                    delete pcFilter.customer;
                }
                if (pcFilter.partner){
                    delete pcFilter.partner;
                }
                delete pcFilter.pcNodeName;
                //pcFilter.pcNodeName = '';
            }
        }

        $scope.removeFilter = function(c) {
            $rootScope.$emit('remove-filters', c);
        };


         $scope.expand = function (c, i, active) {
             resetScrollPosition(i, c.type);
             realizationTableScroll();
             //To set activeCategoryForCSV to customers if sales level > 4 for donwload CSV - shankar 
            if($scope.isFiveSalesFilter() && c.categories){
                $scope.activeCategoryForCSV = c.categories[c.activeCategory];
             }
            var activeReportTab;
            var activeSubTab = $scope.getActiveSubTab();
            var selectedTab = $scope.getActiveSPCTab();
            if($scope.appliedFiltersCount < 5 && selectedTab==="manager"){
                selectedTab = "sales";
            }
            $scope.drsShipListView = false;
            if (activeSubTab == null) {
                activeReportTab = $scope.opportunitiesActive;
            } else {
                activeReportTab = $scope.getActiveSubTab() + $scope.opportunitiesActive;
            }
            // list/net data change on sortby
            $scope.sortBy = 'list';
             if (i == 2 && (($scope.opportunitiesActive == 'refresh'&& $scope.getActiveSPCTab() === "customer")  
                     || ($scope.opportunitiesActive == 'renew' && $scope.getActiveSPCTab() === "customer") 
                     || ($scope.opportunitiesActive == 'renew' && $scope.getActiveSubTab() !== 'total' && $scope.getActiveSPCTab() === "sales") 
                     || ($scope.opportunitiesActive == 'renew' && $scope.getActiveSubTab() !== 'total' && $scope.getActiveSPCTab() === "partner") 
                     || ($scope.opportunitiesActive == 'renew' && $scope.getActiveSubTab() !== 'total' && $scope.getActiveSPCTab() === "manager") 
                     || ($scope.opportunitiesActive == 'attach' && $scope.subopportunity == 'swss'&& $scope.getActiveSPCTab() !== "partner" && $scope.getActiveSubTab() !== "manager" )
                     || ($scope.opportunitiesActive == 'attach'&& $scope.subopportunity !== 'ts' && $scope.subopportunity !== 'total' 
                         && $scope.getActiveSPCTab() === "customer")) &&  ($scope.getActiveSubTab() !== 'ts' || $scope.getActiveSubTab() !== 'swss')  ) {
                var pfBookmark = {};
                pfBookmark= $scope.CiscoUtilities.cleansedFilters($scope.appliedFilters); //using global object for expanded view call as well.
                pfBookmark.quarterIdValues = [];
                pfBookmark.quarterId = [];
                pfBookmark.quarterId = $scope.chartFilters.quarterId;
                angular.extend(pfBookmark, $scope.chartFilters);
                angular.forEach($scope.tiles[1].data, function(data) {
                    pfBookmark.quarterIdValues.push(data.quarterId);
                });
                angular.forEach($scope.appliedFilters, function(value) { //needed for level 4 and below SL
                    if (value.categoryId === "sales") {
                        pfBookmark.nodeName= value.title;
                    }
                })

                if ($scope.isBookmarkActive()) {
                    angular.extend(pfBookmark, GlobalBookmarkServ.bookmark);
                }
                 pfBookmark["globalView"] = $scope.globalView;
                 //setTimeout(function () {
                       opportunitiesServ.getExpandedCustomerViewData($scope.opportunitiesActive, activeReportTab, pfBookmark,activeSubTab, selectedTab).then(function(response){
                        c.savAccountsList = response['data_List'];
                        c.savAccountsNet =  response['data_net'];
                        $scope.getAnnualMultiData(response,c);
                    })
                 //}, 500);
                
                
            }

                c.expanded = 1;
                if (window.innerWidth < 850) {
                    c.columns = 4;
                } else {
                if (filtersServ.sidebarActive && window.innerWidth >= 1200) {
                    c.columns = 8;
                }
                else {
                    if(c.type === "bar_stacked_double_vertical"){
                        c.columns = 8;
                    }else{
                        c.columns = 15;
                }
                c.columns = 15;
            }
        }
                // changes for DE156224
                if (c.type === "square_block" && c.viewType == 'list') {
                    $scope.moveScrollToRight(c);
                }

        
                bindTableScroll();

                if(c.type === "line_chart_rr"){
                    $scope.checkQuarters(c);
                }
                $scope.setListViewElipsis(c);
        };

        $scope.freezeHeader = function (numColumn) {
            realizationTableScroll();
            drsTable(numColumn);
            
        };
        /*$scope.test = function (numColumn) {
            console.log(numColumn,'hgello');
            realizationTableScroll();
            drsTable(numColumn);
            
        };*/

        $scope.freezeColumn = function (q) {

            realizationTableColumnScroll(q);
            realizationTableScroll();   
        };

        $scope.moveScrollToBottom = function () {
            $timeout(function () {
                var element = document.getElementById("bottom-scroll");
                if (element) {
                    element.scrollTop = element.scrollHeight;
                    element.scrollLeft = element.scrollWidth;
                }
            }, 500);
        }

        // changes for DE156224
        $scope.moveScrollToRight = function (c) {
            $timeout(function () {
                var element = document.getElementById("right-scroll");
                if (element) {
                    element.scrollLeft = element.scrollWidth;
                }
            }, 60);
        }

         $scope.collapse = function (c, i) {
            resetScrollPosition(i, c.type);
            // if ($rootScope.dashboard==='sales'){
            //     if (c.type === "line_chart_rr"){
            //         c.expanded = 0;
            //         $scope.checkQuarters(c);
            //     }
            //  }
             //adding check to stop this code from shrinking line-chart-r-r to small size. -G
             
             // AB -- Set $scope.drsShipListView = false to avoid updating data on DRS sfdc booked deals
             $scope.drsShipListView = false;
          //   if ((c.type != "line_chart_rr" || c.description === "performance.tsRenew.bar.description") && c.description !== "Corporate 15/12 Attach Rate") {
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
             // } else {
                 if (window.innerWidth < 850) {
                    c.columns = 4;
                } else {
                    if(c.type === "bar_stacked_double_vertical" || c.type === "bar_target"){
                        c.columns = 5;
                    }else{
                        c.columns = 6;
                    }
                }
            
                $scope.setListViewElipsis(c);

         };
         $scope.setColumnLength = function (c, i) {
            resetScrollPosition(i, c.type);
            // if ($rootScope.dashboard==='sales'){
            //     if (c.type === "line_chart_rr"){
            //         c.expanded = 0;
            //         $scope.checkQuarters(c);
            //     }
            //  }
             //adding check to stop this code from shrinking line-chart-r-r to small size. -G
             if (c.type != "line_chart_rr") {
                     c.expanded = 0;
                 }
             // AB -- Set $scope.drsShipListView = false to avoid updating data on DRS sfdc booked deals
             $scope.drsShipListView = false;
                
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
             // } else {
                 if (window.innerWidth < 850) {
                    c.columns = 4;
                } else {
                    if(c.type === "bar_stacked_double_vertical" || c.type === "bar_target"){
                        c.columns = 5;
                    }else{
                        c.columns = 6;
                    }
                }
            

         };
         



        $scope.getDrilledHead = function(c) {
            if (!c) {
                return;
            }
            var arr = [];
            c.forEach(function(d) {
                for (var prop in d.freq) {
                    arr.push(prop);
                }
            });
            return arr;
        };

        $scope.getDrilledBody = function(c) {
            if (!c) {
                return;
            }
            var arr = [];
            c.forEach(function(d) {
                for (var prop in d.freq) {
                    arr.push(d.freq[prop]);
                }
            });
            return arr;
        };

        $scope.drilledCols = [];

        $scope.drillUndrillColumn = function(c) {
            var index = $scope.drilledCols.indexOf(c.state);
            if (index > -1) {
                $scope.drilledCols.splice(index, 1);
                return;
            }
            $scope.drilledCols.push(c.state);
        };

        $scope.isDrilled = function(c) {
            return $scope.drilledCols.indexOf(c.state) > -1;
        };

        $scope.showShadow = function () {
            showShadowResponsive();
        }
        $scope.initializeLineChartRR = function (c) {
            if(c.type == 'line_chart_rr') {
                $scope.toggleViewType(c, 'chart');
                if(c.data_net && c.data_net[c.activeCategory]){
                    var tmpObj = c.data_net[c.activeCategory][0];
                }else if(c.data && c.data[c.activeCategory]){
                    var tmpObj =  c.data[c.activeCategory][0];
                }else{
                    var tmpObj = c.data_set;
                }
                if(!tmpObj){
                   var tmpObj = $scope.currentQuarter;
                }
                var tmpKeys = Object.keys(tmpObj);
                for(var tmp_i = 0;tmp_i<tmpKeys.length;tmp_i++) {
                    c[tmpKeys[tmp_i]] = tmpObj[tmpKeys[tmp_i]];
                }
                 if ($scope.opportunitiesActive === "attach" && ($scope.subopportunity === "ts" || $scope.subopportunity === "swss" || $scope.subopportunity === "total")) {
                     $scope.realizationXSubList = ['In Q', '+1Q', '+2Q', '+3Q', '+4Q'];
                    $scope.realizationXList = ['In Quarter', '+1 Quarter', '+2 Quarters', '+3 Quarters', '+4 Quarters'];
                }
                else {
                    $scope.realizationXSubList = ['-2Q', '-1Q', 'In Q', '+1Q', '+2Q', '+3Q', '+4Q'];
                    $scope.realizationXList = ['-2 Quarters', '-1 Quarter', 'In Quarter', '+1 Quarter', '+2 Quarters', '+3 Quarters', '+4 Quarters'];
                }
                $scope.selectedQuarter = $scope.currentQuarter;
                return;
            }
        }

        $scope.selectCategory = function(c, i, ind) {
        if(c.checkedstates) {
            c.checkedstates = [];
        }
        $scope.linecount = 0;
        $scope.linecountselected = 0;
             c.renderGraphForSelectAll = false;
            pieChartActiveValue = undefined;
            $scope.isSelectedDropDown = true;
            $scope.activeCategoryForCSV = c.categories[i];
            resetScrollPosition(i, c.type);
             //to check if the navigation is to InQuarter Renewal in 1st graph in ts/total renew performance
            isInquarterRenewal = false;
            if(ind === 0 && i === 0 && $scope.opportunitiesActive === 'renew' && ($scope.subopportunity === 'total' || $scope.subopportunity === 'ts')){
                isInquarterRenewal = true;
            }
            if (c.activeCategory === i && ind !== 'chartToParent') {
                if($scope.isSelectedDropDown){
                    $scope.isSelectedDropDown = false;
                }
                return;
            }
            // Change for DE164052
            if ($scope.isBookmarkActive()) {
                if($scope.currBookmark){
                    if(ind === 0 && $location.path() === $scope.currBookmark.urlDetails.appUrl){
                        //Changes for DE164052
                        if(activeCategoryBackup !== undefined){
                            if(activeCategoryBackup !== i){
                                $scope.isFiltersChanged = true;
                            }
                        }
                    }
                }
            }
            c.activeCategory = i;
            $scope.catgActive = i;
            /*retainActiveCategory = i;*/
            if($scope.opportunitiesView!=='performance' )
                retainActiveCategory = i;
            if (c.types) {
                c.type = c.types[i];
            }
            if(c.types && c.type == 'line_chart_rr') {
                 $scope.initializeLineChartRR(c);
            }

            if($scope.opportunitiesView === 'opportunities' && $scope.opportunitiesActive === 'attach' && $scope.subopportunity == 'ts'){
                        if($scope.tiles[0].activeCategory === 0){
                            pieChartActiveValue = "warranty";
                        }
                       else  if($scope.tiles[0].activeCategory === 2){
                            pieChartActiveValue = "aging";
                        }
                        else if($scope.tiles[0].activeCategory === 1){
                             pieChartActiveValue = undefined;
                        }
                    }

            //added for chart view getting blank- srinath
            if(c.type ==='line_chart_rr'){
                $scope.toggleViewType(c,'chart')
            }
            /*if(c.unique_key === 'corporate_attach_rate' && c.activeCategory !== 2){
                $scope.setListKeys(c);
            }*/
            //Added by UX/Srinath to fix customer name greying out
            if (c.type === 'bar_stacked_horizontal'){
                $scope.areaActive = [];
            }
            if ($scope.tiles[0].activeCategory === 1 && $scope.opportunitiesActive === "attach" && $scope.opportunitiesView !== 'performance') {
                $scope.tiles[1].activeCategory = 1;
            }

            if ($scope.tiles[0].activeCategory === 0 && $scope.opportunitiesActive === "attach" && $scope.opportunitiesView !== 'performance') {
                $scope.tiles[1].activeCategory = 0;
            }
            if (c.type === 'pie') {
                $scope.colorsOpp = {};
                 var tabActive = true;

                 if($scope.opportunitiesView === 'opportunities' && $scope.opportunitiesActive === 'attach' && $scope.subopportunity == 'ts'){
                      $scope.chartFilters = {};
                        $scope.resetChartFilters();
                        $scope.isSelectedDropDown = false;
                        $scope.getData();
                        return;
                    }
                 $scope.tiles[1].data = angular.copy($scope.tiles[0].data[i]);
                // Broadcasting to pie chart to fix Architecture and Aging switch -- KD
                 var activeTab = $scope.getActiveSPCTab();
                if (activeTab === "sales") {
                    $rootScope.$broadcast('pie-tab-selection',tabActive);
                    $scope.tiles[2].data[0] = angular.copy($scope.tiles[0].data[i]);
                }
                if (activeTab === "manager") {
                     $rootScope.$broadcast('pie-tab-selection',tabActive);
                    if (i === 1) {
                        $scope.tiles[2].data[$scope.tiles[2].activeCategory] = angular.copy($scope.tiles[2].aging[i]);
                    } else {
                        $scope.tiles[2].data[$scope.tiles[2].activeCategory] = $scope.tempAccountData;
                    }

                }
                if (activeTab === "partner" || activeTab === "customer") {
                     $rootScope.$broadcast('pie-tab-selection',tabActive);
                     if(activeTab === "customer")// Changes for DE135069
                        $scope.getSPCData(2);
                    else
                        $scope.tiles[2].data[$scope.tiles[2].activeCategory] = angular.copy($scope.tiles[2].aging[i]);

                }

                return;
            } // broadcast end

            c.isPercent = $scope.CiscoUtilities.isPercent(c);
            $scope.isAccountManagerList(c);
            //matchTilesHeight(200);

            $scope.clearSPCData(i, c).then(function() {
                $scope.getSPCData(i).then(function() {
                    if ((c.expanded === 1 && c.activeCategory === 2 ) || ((c.expanded === 1 && c.activeCategory === 0 && ($scope.getActiveSubTab() === "swss"|| $scope.getActiveSubTab() === "as"|| $scope.getActiveSubTab() === "ts"))|| (c.expanded === 1 && c.activeCategory === 1 && ($scope.getActiveSubTab() === "swss"|| $scope.getActiveSubTab() === "as"|| $scope.getActiveSubTab() === "ts"))||  (c.expanded === 1 && c.activeCategory === 3 && ($scope.getActiveSubTab() === "swss"|| $scope.getActiveSubTab() === "ts")||(c.expanded === 1 && c.activeCategory === 4 && ($scope.getActiveSubTab() === "swss"|| $scope.getActiveSubTab() === "as" ||$scope.getActiveSubTab() === "ts"))|| (c.expanded === 1 && c.activeCategory === 2 && ($scope.getActiveSubTab() === "swss"|| $scope.getActiveSubTab() === "ts"|| $scope.getActiveSubTab() === "as"))))) {
                        $scope.expand(c,2);
                     }
                         
                    var hasSubTab = $scope.getActiveSubTab();
                    if (angular.isDefined(hasSubTab) && hasSubTab!==null && hasSubTab.indexOf("swss") > -1) {
                        var pieState = $scope.tiles[0].activeCategory;
                        if (i === 3) {
                            if (pieState === 1) {
                                $scope.tiles[2].data[$scope.tiles[2].activeCategory] = angular.copy($scope.tiles[2].aging[pieState]);
                            } else {
                                $scope.tiles[2].data[$scope.tiles[2].activeCategory] = $scope.tempAccountData;
                            }
                        } else {
                            if (i === 0) {
                                if ($scope.tiles[0].activeCategory === 0) {
                                    $scope.tiles[2].data[$scope.tiles[2].activeCategory] = $scope.tiles[0].data[0];
                                } else {
                                    $scope.tiles[2].data[$scope.tiles[2].activeCategory] = angular.copy($scope.tiles[1].data);
                                }
                            } else {
                                if($scope.tiles[2].aging){
                                    $scope.tiles[2].data[$scope.tiles[2].activeCategory] = angular.copy($scope.tiles[2].aging[pieState]);
                                }
                            }

                        }
                    }
                    $scope.setListViewElipsis(c);
                });
            });
            //for resetting the tile height in swss attach
            $('.opportunity-tile').css("height", "auto");
            $('.opportunity-tile').css("min-height", "510px");
           // matchTilesHeight(200);

        };

        $scope.campActiveUndrill = function(c) { /* Added function to undrill the drilled campaign view */
            $scope.campActiveDrill = false;
            c.updated = !c.updated;
            matchTilesHeight(50);
        };

         $scope.showCustomerExpand = function (c) {
            var activeC = c.activeCategory;
            if (!c.categories || activeC === null) {
                return;
            }
            var title = c.categories[activeC];
            title = title ? title : "";
            var customer = title.toLowerCase().indexOf("customer") > -1;
            var sales = title.toLowerCase().indexOf("sales") > -1;
            var manager = title.toLowerCase().indexOf("manager") > -1;
        
        if (c.expanded && (customer || ((sales||manager) && ($scope.subopportunity === 'as')) || (sales) &&($scope.subopportunity === 'swss' && $scope.opportunitiesView !== 'performance')) && ($scope.opportunitiesActive === 'refresh' || ($scope.opportunitiesActive === 'renew' && (($scope.subopportunity === 'ts' && $scope.opportunitiesView !== 'performance') || $scope.subopportunity === 'swss' || $scope.subopportunity === 'as' || $scope.subopportunity === 'total')) || ($scope.opportunitiesActive === 'attach' &&  $scope.subopportunity === 'swss'))) { return true;
            }
            //For Expanded customers list view in swss/ts perf
            // if (c.expanded && (customer || (sales && $scope.subopportunity === 'as')) && ($scope.opportunitiesActive === 'refresh' || ($scope.opportunitiesActive === 'renew' && (($scope.subopportunity === 'ts' && $scope.opportunitiesView !== 'performance') || ($scope.subopportunity === 'swss' && $scope.opportunitiesView != 'performance') || $scope.subopportunity === 'as' || $scope.subopportunity === 'total')) || ($scope.opportunitiesActive === 'attach' &&  $scope.subopportunity === 'swss')))
            //     { return true;}
            //For Expanded customers list view in swss/ts/Total perf
            // if (c.expanded && (customer || (sales && $scope.subopportunity === 'as')) && ($scope.opportunitiesActive === 'refresh' || ($scope.opportunitiesActive === 'renew' && (($scope.subopportunity === 'ts' && $scope.opportunitiesView !== 'performance') || ($scope.subopportunity === 'swss' && $scope.opportunitiesView != 'performance') || ($scope.subopportunity === 'total' && $scope.opportunitiesView != 'performance') || ($scope.subopportunity === 'as' || ($scope.subopportunity === 'total' && $scope.opportunitiesView != 'performance')))) || ($scope.opportunitiesActive === 'attach' &&  $scope.subopportunity === 'swss'))){

            //     return true;
            // }

            return false;
        };

        $scope.showTotalRenewCustomerExpand = function (c) {
            var activeC = c.activeCategory;
            if (!c.categories || activeC === null) {
                return;
            }
            var title = c.categories[activeC];
            title = title ? title : "";
            var customer = title.toLowerCase().indexOf("customer") > -1;
            if (c.expanded && customer && c.viewType == 'list' && $scope.opportunitiesActive == 'renew' && $scope.subopportunity == 'total' && c.type == 'bar_stacked_horizontal' && $scope.opportunitiesView === 'opportunities') {
                return true;
            }
            return false;
        }
        $scope.showTSPartnerSalesAMExpand = function (c) {
            var activeC = c.activeCategory;
            if (!c.categories || activeC === null) {
                return;
            }
            var title = c.categories[activeC];
            title = title ? title : "";
            var customer = title.toLowerCase().indexOf("customer") > -1;
            if (c.expanded && !customer && c.viewType == 'list' && $scope.opportunitiesActive == 'renew' &&
                $scope.subopportunity == 'ts' &&
                c.type == 'bar_stacked_horizontal' && $scope.opportunitiesView === 'opportunities') {
                return true;
            }
            return false;
        }
        $scope.showSWSSPartnerSalesAMExpand = function (c) {
            var activeC = c.activeCategory;
            if (!c.categories || activeC === null) {
                return;
            }
            var title = c.categories[activeC];
            title = title ? title : "";
            var customer = title.toLowerCase().indexOf("customer") > -1;
            if (c.expanded && !customer && c.viewType == 'list' && $scope.opportunitiesActive == 'renew' &&
                $scope.subopportunity == 'swss' &&
                c.type == 'bar_stacked_horizontal' && $scope.opportunitiesView === 'opportunities') {
                return true;
            }
            return false;
        }

        $scope.canViewDetails = function() {
            return (
                $scope.opportunitiesActive === 'refresh' ||
                ($scope.opportunitiesActive === 'renew' && $scope.subopportunity == 'ts') ||
                ($scope.opportunitiesActive === 'renew' && $scope.subopportunity == 'swss') ||
                ($scope.opportunitiesActive === 'renew' && $scope.subopportunity == 'total') ||
                ($scope.opportunitiesActive === 'attach' && $scope.subopportunity == 'ts') ||
                ($scope.opportunitiesActive === 'attach' && $scope.subopportunity == 'swss') ||
                ($scope.opportunitiesActive === 'attach' && $scope.subopportunity == 'total') ||
                ($scope.opportunitiesActive === 'ciscoOne')
            );
        };


        $scope.hasSalesLevel = function (level) {
            var sales = $filter('filter')(filtersServ.retainSelectedFilters, { slug : 'sales' });
            return sales.length &&
            sales[0].selected_levels.indexOf('Sales Level ' + level) > -1;
        }

        $scope.toggleVar = function (e, c) { /* yopgupta - Added to toggle passed variable */
            if (!$(e.target).hasClass('selectbox-container') && !$(e.target).closest('.selectbox-container').length && !$(e.target).hasClass('insight-filter') && !$(e.target).closest('.insight-filter').length && $(e.target).closest('li').hasClass('allow-toggle')) {
                c.active = !c.active;
            }
        };

        $(window).resize(function () {
            if ($scope.tiles) {
                $scope.tiles.forEach(function (c) {
                    if (c.expanded) {
                        $scope.expand(c);
                    } else {
                        $scope.collapse(c);
                    }
                });
            }
        });

        var matchTilesHeight1 = function(t) {
            $timeout(function() {
                var max_height = 0;
                $('.opportunity-tile:not(.error-tile)').each(function() {
                    $(this).css("height", "");
                    var h = $(this).height();
                    max_height = h > max_height ? h : max_height;
                });
                $('.opportunity-tile').height(max_height);
                $('.kpi').hide().css('visibility', 'visible');
                $('.kpi').fadeIn('slow');
            }, t);
        };

        var ngRepeatFinishedEvent = $scope.$on('ngRepeatFinished', function() {
            matchTilesHeight(50);
        });

        var ngRepeatOppEvent = $scope.$on('ngRepeatOpp', function() {
            $timeout(function() {
                initSlick();
            }, 10);
        });

        var drillRenew = false;

        $scope.$on('$destroy', function() {
            ngRepeatFinishedEvent();
            ngRepeatOppEvent();
            refreshSpcDataEvent();
            refreshAllDataEvent();
            campActiveDrillWatch();
            pieActiveDrillWatch();
            campAreaWatch();
            sideToggleRoot();
            drillQuarterRate();
            //rootApplyBookmark();
            rootActiveDrill();
            collabRportEvent();
        });

       $scope.expandAllArchitecture = function (c) {
            if($scope.opportunitiesActive === 'drs' && c.type === 'bar_double_horizontal_drs'){
                var arch = $scope.isListOrNet === 'list'? c.productfamilylist['campaignPf'] : c.productfamilynet['campaignPf'];
            }
            else if($scope.opportunitiesActive === 'drs' && c.type === 'bar_stacked' && c.activeCategory === 0){
                var arch = $scope.isListOrNet === 'list'? c.productfamilylist['shipTimelinePf'] : c.productfamilynet['shipTimelinePf'];
            } else if($scope.opportunitiesActive === 'drs' && c.type === 'bar_stacked' && c.activeCategory === 1 && !c.expanded) {
                var arch = $scope.isListOrNet === 'list'? c.sfdcbookingsdata : c.sfdcbookingsdata;
            } else if($scope.opportunitiesActive === 'drs' && c.type === 'bar_stacked' && c.activeCategory === 1 && c.expanded) {
                var arch = $scope.isListOrNet === 'list'? c.sfdcbookingsquarterdata : c.sfdcbookingsquarterdata;
            } else {
                var arch = $scope.isListOrNet === 'list'? c.productfamilylist : c.productfamilynet;
            }
            if(c.activeCategory === 1){
                c.expandAllArchSFDC = !c.expandAllArchSFDC;
            } else {
                c.expandAllArch = !c.expandAllArch;
            }
            for (var archList in arch) {
                if(c.activeCategory === 1){
                    $scope.showAllArchs(arch[archList], c, c.expandAllArchSFDC);
                } else {
                    $scope.showAllArchs(arch[archList], c, c.expandAllArch);
                }
            }
        };

        $scope.showAllArchs = function (archList, c, state) {
            if($scope.opportunitiesActive === 'drs' && c.type === 'bar_stacked' && c.activeCategory === 1 && !c.expanded){
                var arch = $scope.isListOrNet === 'list'? c.sfdcbookingsdata : c.sfdcbookingsdata;
            }
            else if($scope.opportunitiesActive === 'drs' && c.type === 'bar_stacked' && c.activeCategory === 1 && c.expanded){
                var arch = $scope.isListOrNet === 'list'? c.sfdcbookingsquarterdata : c.sfdcbookingsquarterdata;
            }
            else {
                var arch = $scope.isListOrNet === 'list'? c.productfamilylist : c.productfamilynet;
            }


            archList.show = state || !archList.show;

            $rootScope.isExpandArch = true;
            for (var routing in archList.routing) {
                //archList.routing[routing].show = state || archList.show;
            }
            //added changes for the exapnd list view defect -Shankar
            if (!state && c.activeCategory !== 1) {
                c.expandAllArch = allExpand(arch);
            }else {
                c.expandAllArchSFDC = allExpand(arch);
            }

        };


        function allExpand(architectureList) {
            for (var archList in architectureList) {
                var arch = architectureList[archList];
                if (!arch.show) {
                    return false;
                }
                //added changes for the exapnd list view defect -Shankar
                /*for (var routing in arch.routing) {
                    if (!arch.routing[routing].show) {
                        return false;
                    }
                }*/
            }
            return true;
        }


    // service to get move data from expanded view to steps
        $scope.viewDetails = function (d, contractpopupCheck) {

          $('.action_offset').hide();
            var selectedSubArch = "";
            var selectedArch = "";
            var selectedQuarterId = [];
            var custDetails = {};
            var custFilterDetails = [];
            var actManager = [];
            var actName = '';
            var architectureType = [];
            var coverageFilter = "";            
            var networkFilter = "";

            custDetails.userInfo = $scope.userInfo.user.userId;

            if ($scope.opportunitiesActive === 'drs'){
               if ($(d.target).attr("state-id") !== undefined) {
                    custDetails.state = $(d.target).attr("state-id");
                    custDetails.stateId = $(d.target).attr('state-savmid');
                }
                else{
                     custDetails.state=d.quarter;
                }
            } else {
                if ($(d.target).attr("state-id") !== undefined) {
                    custDetails.state = $(d.target).attr("state-id");
                    custDetails.savId = $(d.target).attr('state-savmid');
                }
                else{
                    angular.extend(custDetails,d);
                }
            }
          
            custDetails.opportunity = $scope.opportunitiesActive;
            if($scope.opportunitiesActive === 'drs'){
                custDetails.subTab = $scope.opportunitiesActive;
                custDetails.subopportunity = 'campaign';
             }else {
                custDetails.subTab = $scope.subopportunity + $scope.opportunitiesActive;
                custDetails.subopportunity = $scope.subopportunity;
             }

            custDetails.selectedQuarterId = $scope.chartFilters.quarterId;
            custDetails.activeKey = $scope.chartFilters.quarterId;

            if ($scope.pieActiveDrill !== null && $scope.pieActiveDrill !== undefined && $scope.pieActiveDrill !== false && $scope.pieActiveDrill !== true && !$scope.hasSub) {
                if ($scope.chartFilters.activeKey !== null && $scope.chartFilters.activeKey !== undefined) {
                    custDetails.selectedSubArch = $scope.chartFilters.activeKey;
                    custDetails.selectedArch = $scope.pieActiveDrill;
                } else {
                    custDetails.selectedArch = $scope.pieActiveDrill;
                }
            } else {
                custDetails.selectedArch = $scope.active;
            }

             var accountDetails = [];
             accountDetails.push(custDetails);
            custFilterDetails.push($scope.appliedFilters, $scope.chartFilters);
         $sessionStorage.accountDetails = JSON.stringify(accountDetails);
            $sessionStorage.put('accountDetails', JSON.stringify(accountDetails));

            $sessionStorage.appliedFilters = JSON.stringify(custFilterDetails);
            $sessionStorage.put('appliedFilters', JSON.stringify(custFilterDetails));

            //donot uncomment
            //$sessionStorage.put('isListOrNetView', $scope.isListOrNet);

            if ($scope.isBookmarkActive()) {
                angular.extend(custDetails, GlobalBookmarkServ.bookmark);
            }
            ShareDataServ.addDetails(custDetails, custFilterDetails);
            if(!contractpopupCheck){
                $location.path('/view-account/' + $scope.opportunitiesActive);
                $route.reload();
            }
            else {

                $scope.currCust = accountDetails.length - 1;
                var filtersToBeApplied = $scope.CiscoUtilities.cleansedFilters(custFilterDetails["0"]);
                  filtersToBeApplied.quarterId = $scope.chartFilters.quarterId;
                  filtersToBeApplied.activeKey =  $scope.chartFilters.activeKey;
                filtersToBeApplied.customer= accountDetails[$scope.currCust].state;
                opportunitiesServ.getTotalContracts(accountDetails[$scope.currCust], filtersToBeApplied, actManager, actName, architectureType, coverageFilter, networkFilter).then(function (d) {
                        $scope.contracts = d.data;

                        $scope.contracts.forEach(function (c) {
                            c.select = true;
                        });
                    
                    
                    $scope.selectedContracts = angular.copy($scope.contracts);
                    $scope.contractSelected1 = $scope.contracts.length;
                    ShareDataServ.setContracts($scope.contracts, $scope.selectedContracts);

                    var modalInstance = $uibModal.open({
                        templateUrl: 'views/modal/total-contract.html',
                        controller: 'ContractController',
                        controllerAs: 'vm',
                        scope: $scope,
                        resolve: {
                            Contracts: function () {
                                return {
                                    list: $scope.contracts, 
                                    selected: $scope.contractSelected,
                                    contractName: accountDetails[0].state,
                                    showApply: contractpopupCheck
                                };
                            }
                        },
                        windowClass: 'modal-open',
                        size: 'lg'
                    });

                    modalInstance.result.then(function (result) {
                        $scope.contracts = result.updatedContracts;
                        $scope.contractSelected = result.noOfContractSelected;
                        $scope.selectedContracts = result.selectedContracts;
                        ShareDataServ.setContracts($scope.contracts, $scope.selectedContracts);
                    }, function () {
                        //error case
                    });
                }); 


            }
            
        }

        var collabRportEvent = $scope.$on('create-collab-proposal', function(event, collabData, nodeName){
            $scope.collabData = angular.copy(collabData);
            if(GlobalBookmarkServ && GlobalBookmarkServ.bookmark){
                $scope.collabData['bookmarkName'] = GlobalBookmarkServ.bookmark.name;
            }
            $scope.openRequestReport(nodeName,"Create Collab Presentation and Proposal");
        });

        $scope.openRequestReport = function(nodeName, reportType) {
            var activeReportTab = '';
            var index = '';
            var selectedFilter = "";
            var selectedAccountManager = "";
            var selectedAccountManagerName = "";
            var architectureType = [];
            var coverageFilter = "";
            var selectedArch = "";
            var selectedSubArch = "";
            var activeDrillSelected = "";
            var quarterIdValues = [];
            var selectedQuarterId = [];
            var selectedTab = $scope.getActiveSPCTab();

           var filters = ShareDataServ.getFiltersDetails();
            $rootScope.$on('filters-on-detail',filters);

            if (!$scope.getActiveSubTab()) {
                switch($scope.opportunitiesActive){
                    case "drs":
                        activeReportTab = "drs"
                    break;
                    case "all":
                        activeReportTab = "allOpp"
                    break;
                    case "asset":
                        activeReportTab = "asset"
                    break;
                    default:
                        activeReportTab = "ciscoOne";
                    break;
                }
            } else {
                activeReportTab = $scope.getActiveSubTab() + $scope.opportunitiesActive;
            }
            if($scope.drilledInChartValue && $scope.drilledInChartValue.quarter && $scope.drilledInChartValue.quarter != null){
                selectedQuarterId = $scope.drilledInChartValue.quarter;
            } else {
                selectedQuarterId = $scope.chartFilters.quarterId;
            }
             var selectedQuarterData = $scope.tiles[1].data;
            
            if(activeReportTab == "drs"){
                if($scope.tiles[1].activeCategory == 0)
                    selectedQuarterData = $scope.tiles[1].shipment_data.data;
                else if ($scope.tiles[1].activeCategory == 1)
                    selectedQuarterData = $scope.tiles[1].sfdc_data;
            }
            if(($scope.subopportunity === "as" || $scope.subopportunity === "total") && $scope.opportunitiesActive === "renew"){
                selectedQuarterData = $scope.tiles[1].data_net;
            }

           angular.forEach(selectedQuarterData, function(data) {
                quarterIdValues.push(data.quarterId);
            })
            
            quarterIdValues = JSON.stringify(quarterIdValues);
            architectureType = JSON.stringify(architectureType);
            if ($scope.pieActiveDrill !== null && $scope.pieActiveDrill !== undefined && $scope.pieActiveDrill !== false && $scope.pieActiveDrill !== true && $scope.pieActiveDrill !== '') {
                if ($scope.chartFilters.activeKey !== null && $scope.chartFilters.activeKey !== undefined && $scope.chartFilters.activeKey !== ''){
                        selectedSubArch = $scope.chartFilters.activeKey;
                }
                else {
                        selectedArch = $scope.pieActiveDrill;
                }
            }
            else {
                    selectedArch = $scope.chartFilters.activeKey;
            }

            if (reportType === "Request Customer Detail Report" ) {
                index = 1;
            } else if(reportType === "Create Collab Presentation and Proposal"){
                index = 2;
            } else if (reportType === "Request Smart IB Report"){
                index = 3;
            } else if(selectedTab === "manager"){
                index = 4;
            }else {
                index = 0;
            }

            if (reportType === "Request Customer Detail Report"  || reportType === "Request IB Inventory Report" || reportType === "Request Smart IB Report") {
                var multipleState = [];
                var multipleStateId = [];
                for(var a=0; a<nodeName.length; a++){
                    multipleState.push(nodeName[a].split(">")[0]);
                    multipleStateId.push(nodeName[a].split(">")[1]);
                }
                nodeName = multipleState;
            }else{
                if (typeof nodeName !== 'string') {
                    if($scope.opportunitiesActive === 'drs'){
                        nodeName = $(nodeName.target).attr("state");
                    } else {
                        nodeName = $(nodeName.target).attr("state-id");
                    }
                }
            }
            if((!nodeName || (nodeName && nodeName.length === 0)) && reportType === "Create Collab Presentation and Proposal"){
                nodeName = $scope.tiles[2].checkedstates;
            }
            var filterObj = $scope.getadvancedFilterObject();
            if($scope.subopportunity === "as"){
                filterObj["appliedFilters"]  = $scope.appliedFilters
            }
            filterObj["globalView"] = $scope.globalView;
            filterObj["activecategory"] = $scope.tiles[2].activecategory;
            opportunitiesServ.getSmartIbReport(nodeName, index, activeReportTab, architectureType, selectedArch, selectedSubArch, quarterIdValues, selectedQuarterId, filterObj, $scope.collabData, $scope.linecountselected, $scope.listamountselected, pieChartActiveValue).then(function() {
                if(index === 2){
                    $uibModal.open({
                        templateUrl: 'views/modal/page-success-message.html',
                        controller: 'CollabReportSuccessController',
                        size: 'xs'
                    });
                } else {
                    $uibModal.open({
                        templateUrl: 'views/modal/request-report.html',
                        controller: 'RequestReportController',
                        size: 'sm'
                    });
                }
            });
        };

        $scope.openActionMetrics = function(nodeName) {
            var salesFilter = [];
            var actManager = [];
            var actName = '';
            var architectureType = [];
            var coverageFilter = "";

            var filters = ShareDataServ.getFiltersDetails();
            $rootScope.$on('filters-on-detail',filters);


            angular.forEach($scope.appliedFilters, function(value) {
                if (value.categoryId === "sales") {
                    if (value.level === 4) {
                        salesFilter = value.title;
                    }
                    if (value.level === 5) {
                        salesFilter = value.title;
                    }
                }
                if (value.categoryId === "product") {
                        angular.forEach(value.title,function(arch){
                                architectureType.push(arch);
                        })

                }
                if (value.categoryId === "salesAM") {
                    if (value.level === 1) {
                        if(typeof value.title === "string"){
                            actManager = value.title;
                        } else {
                            actManager = value.title;
                        }
                    }
                }
                if(value.categoryId === "account" && value.levelName === "SAV Account"){
                            actName = value.title["0"];
                }
                if (value.categoryId === "coverage") {
                    coverageFilter = value.coverage;
                }
            })
            architectureType = JSON.stringify(architectureType);
            salesFilter = JSON.stringify(salesFilter);
            actManager = JSON.stringify(actManager);

            if (nodeName && typeof nodeName !== 'string') {
                nodeName = $(nodeName.target).attr("state");
            }
        
            opportunitiesServ.getActionMetricsData(nodeName, salesFilter, actManager, actName, architectureType, coverageFilter).then(function(response) {
                $uibModal.open({
                    templateUrl: 'views/modal/action-metrics.html',
                    controller: 'ActionMetricsController',
                    size: 'lg'
                });
            })


        };

        $scope.openViewApplied = function () {
            $uibModal.open({
                templateUrl: 'views/modal/view-applied-filter.html',
                controller: 'ViewAppliedFilterController',
                size: 'lg',
                backdrop: 'static'

            });
        };

        //adding this function outside, can be used by other functions to store value for service call this.-G
        //Creating filterObj. will return a object containg all the filter elements with values. -G
        $scope.getadvancedFilterObject = function(){
            var filterObj = {};
        var opptyLegend = [];
            var suiteLegend = [];
            if($scope.appliedFilters){
                 if($scope.subopportunity === "as"){
                     filterObj["appliedSales"] = {};
                 }

                angular.forEach($scope.appliedFilters, function(value) {
                    switch(value.categoryId){
                        case "sales":
                                filterObj["sales"] = [];
                                filterObj.sales.push.apply(filterObj.sales, value.title);
                            if($scope.subopportunity === "as"){
                                 filterObj["appliedSales"][value.level] = JSON.stringify(value.title);
                            }
                        break;
                        case "salesAM":
                            filterObj["accountManagerName"] = [];
                            filterObj.accountManagerName.push(value.title);
                        break;
                        case "product":
                            if(value.levelName === "Architecture"){
                                filterObj["architectureGroups"] = value.title;
                            } else if(value.levelName === "Sub-Architecture"){
                                filterObj["subArchitectureGroups"] = value.title;
                            } else if(value.levelName === "Product Family"){
                                filterObj["productFamily"] = value.title;
                            } else if(value.levelName === "Product ID"){
                                filterObj["productName"] = value.title;
                            } else if(value.levelName === "Product Type"){
                                filterObj["productType"] = value.title;
                            } else if(value.levelName === "Warranty"){
                                filterObj["warrantyCategory"] = value.title;
                            }else if(value.levelName === "Suite"){
                                filterObj["Suite"] = value.title;
                            } else if(value.levelName === "Asset Type"){
                                filterObj["productClassification"] = value.title;
                            } else{
                                //do nothing
                            }
                        break;
                        case "account":
                            if(value.levelName === "GU Name"){
                                filterObj["guName"] = value.title;
                            } else if(value.levelName === "SAV Account"){
                                filterObj["accountName"] = value.title;
                            } else if(value.levelName === "Install Site"){
                                filterObj["installSite"] = value.title;
                            } else if(value.levelName === "Country"){
                                filterObj["country"] = value.title;
                            } else if(value.levelName === "Segment"){
                                filterObj["segment"] = value.title;
                            } else if(value.levelName === "Partner"){
                                filterObj["partnerName"] = value.title;
                            } else if(value.levelName === "Territory Coverage"){
                                filterObj["gvscsOrganisation"] = value.title;
                            } else if(value.levelName === 'Vertical Market'){
                                filterObj["verticalMarket"] = value.title;
                            } else {
                                //do nothing
                            }
                        break;
                        case "services":
                             if (value.levelName === 'Contract Type'){
                            filterObj["contractType"] = value.title;
                        }else if (value.levelName === 'Contract Number'){
                            filterObj["contractNumber"] = value.title;
                        }else if (value.levelName === 'Service SO'){
                            filterObj["serviceSO"] = value.title;
                        }
                        break;
                        case "date":
                            if(value.title === "EoS Date"){
                                filterObj["eos"] = {
                                    "to":value.to,
                                    "from":value.from,
                                    "period":value.period,
                                    "direction":value.direction
                                };
                            } else if(value.title === "LDoS Date"){
                                filterObj["ldos"] = {
                                    "to":value.to,
                                    "from":value.from,
                                    "period":value.period,
                                    "direction":value.direction
                                };
                            } else if(value.title === "Shipment / Processing Date"){
                                filterObj["ship"] = {
                                    "to":value.to,
                                    "from":value.from,
                                    "period":value.period,
                                    "direction":value.direction
                                };
                            } else if(value.title === "Covered Line / Term End Date"){
                                    filterObj["cled"] = {
                                        "to":value.to,
                                        "from":value.from,
                                        "period":value.period
                                };
                            }
                        break;
                        case "dataset":
                            filterObj.dataset = {};
                            if(value.coveredStartDate){
                                filterObj.dataset['coveredStartDate'] = value.coveredStartDate;
                            }
                            if(value.coveredEndDate){
                                filterObj.dataset['coveredEndDate'] = value.coveredEndDate;
                            }
                            if(value.uncoveredStartDate){
                                filterObj.dataset['uncoveredStartDate'] = value.uncoveredStartDate;
                            }
                            if(value.coveredStartDate){
                                filterObj.dataset['uncoveredEndDate'] = value.uncoveredEndDate;
                            }
                        break;                        
                        case "coverage":
                            filterObj["coverage"] = value.coverage;
                        break;
                        case "network":
                            filterObj["networkCollection"] = value.network;
                        break;
                        case "sweeps":
                            filterObj["sweep"] = value.sweeps;
                        break;
                        case 5:
                            filterObj["refreshPropensity"] = value.refresh;
                        break;
                        case 6:
                            filterObj["higherAttachPropensity"] = value.maxValue;
                            filterObj["lowerAttachPropensity"] = value.minValue;
                        break;
                        default:
                        //do nothing
                        break;
                    }
                })
            }
            if($scope.drilledInChartValue && $scope.drilledInChartValue.agingSelection){
                filterObj["agingSelection"] = $scope.drilledInChartValue.agingSelection;
            }
            if($scope.opportunitiesActive === "ciscoOne"){
                if($scope.active){
                    for(var i=0; i<$scope.active.length; i++){
                        if($scope.active[i] === 'ADD' || $scope.active[i] === 'NEW' || $scope.active[i] === 'UPGRADE'){
                            opptyLegend.push($scope.active[i]);
                        }else{
                            suiteLegend.push($scope.active[i]);
                        }
                    }
                }
                if($scope.selectedsublegend){
                    filterObj["selectedSuite"] = [];
                    filterObj.selectedSuite = suiteLegend;
                    //filterObj.selectedSuite.push($scope.selectedsublegend);
                } if(opptyLegend.length > 0 && opptyLegend.length <= 3) {
                    filterObj["selectedOppBySuite"] = [];
                    filterObj.selectedOppBySuite = opptyLegend;
                    //filterObj.selectedOppBySuite.push($scope.selectedlegend);
                }
            } else if($scope.opportunitiesActive === "asset" || $scope.subopportunity === "total") {
                if($scope.drilledInChartValue && $scope.drilledInChartValue.catagory){
                    filterObj["customerReportTotalType"] = [];
                    filterObj.customerReportTotalType.push($scope.drilledInChartValue.catagory);
                }
            } else if($scope.opportunitiesActive === "renew" && $scope.subopportunity === "ts" &&$scope.tiles[0] && $scope.tiles[0].keys) {
                if($scope.drilledInChartValue && $scope.drilledInChartValue.catagory){
                    filterObj["customerReportTotalType"] = [];
                    filterObj.customerReportTotalType.push($scope.drilledInChartValue.catagory);
                } else {
                    filterObj["customerReportTotalType"] = [];
                    filterObj.customerReportTotalType.push.apply(filterObj.customerReportTotalType, $scope.tiles[0].keys);
                }
            } else if($scope.opportunitiesActive === "renew" || $scope.subopportunity === "swss"){
                if($scope.drilledInChartValue && $scope.drilledInChartValue.catagory && $scope.drilledInChartValue.catagory != null){
                    filterObj["swssRenewType"] = [];
                    filterObj.swssRenewType.push($scope.drilledInChartValue.catagory);
                }
            } else {
                if($scope.drilledInChartValue && $scope.drilledInChartValue.catagory){
                    if($scope.drilledInChartValue.catagory.length > 0){
                         filterObj["architectureGroups"] = [];
                         filterObj.architectureGroups.push($scope.drilledInChartValue.catagory);
                    }                   
                } else if ($scope.pieActiveDrill !== null && $scope.pieActiveDrill !== undefined && $scope.pieActiveDrill !== false && $scope.pieActiveDrill !== true && $scope.pieActiveDrill !== '') {
                     filterObj["architectureGroups"] = [];
                     filterObj.architectureGroups.push( $scope.pieActiveDrill);
                }
                if($scope.drilledInChartValue && $scope.drilledInChartValue.subCatagory) {
                    if($scope.drilledInChartValue.subCatagory.length > 0){
                         filterObj["subArchitectureGroups"] = [];
                         filterObj.subArchitectureGroups.push($scope.drilledInChartValue.subCatagory);
                    }                     
                }
            }
            return filterObj;
        };
        $scope.highlightRow = function (s) {
        var month = s.split('FY')[0].trim().toLowerCase();
        var quartersLastMonth = ["jan", "apr", "jul", "oct"];
        if (quartersLastMonth.indexOf(month) > -1) {
            return true;
        }
        if(s === "Total"){
            return true;
        }
        return false;
    };

    $scope.quarterSort = function (c) {
        if((c.categories && c.categories[c.activeCategory] === 'In Quarter Attach Rate')
            || c.title === 'Corporate 15/12 Attach Rate by Months'
            || (c.categories && c.categories[c.activeCategory] === 'In Quarter SWSS Attach Rate')
            || c.title === 'SWSS Attach Rate by Months'
            | (c.categories && c.categories[c.activeCategory] === 'In Quarter Total Attach Rate')
            || c.title === 'Total Attach Rate by Months'
        ){
            return true;
        }
        return false;
    }
    $scope.showRedTriangle = function (d, f) {
        return d.freq[f] != null
            && d.freq[f] != ''
            && d.freq[f] != 0
            && ((f == 'YOY' && d.freq[f] < 0) || (f == 'YOY % Share of Business' && d.freq[f] < 0) || (f == '% of Target' && d.freq[f] < 95));
    }

    $scope.showGreenTriangle = function (d, f) {
        return d.freq[f] != null
            && d.freq[f] != ''
            && d.freq[f] != 0
            && ((f == 'YOY' &&  d.freq[f] > 0) || (f == 'YOY % Share of Business' &&  d.freq[f] > 0) ||  (f == '% of Target' && d.freq[f] > 100));
    }

    $scope.formatPercentageValues = function (f) {
        if(f == "% of Target" ||
            f == "YOY" ||
            f == "Attach Rate" ||
            f == "Target" ||
            f == '% Share of Business' ||
            f == 'YOY % Share of Business'){
            return true;
        }
        else{
            return false;
        }
    }

    // $scope.showDataWarningText = function (c) {
    //     var sales = $filter('filter')($scope.appliedFilters, { categoryId: 'Sales' });
    //     if(sales && sales.length > 0
    //         && sales[sales.length-1].title
    //         && sales[sales.length-1].title.length > 1
    //         && c.categories
    //         && (c.categories[c.activeCategory] === 'In Quarter Attach Rate'
    //             || c.categories[c.activeCategory] === 'Renewal Rate by Sales Levels'
    //             || c.categories[c.activeCategory] === 'In Quarter SWSS Attach Rate'
    //             || c.categories[c.activeCategory] === 'Corporate 15/12 Attach Rate by Sales Levels'
    //             || c.categories[c.activeCategory] === 'SWSS Attach Rate by Sales Levels'
    //             || c.categories[c.activeCategory] === 'Corporate 15/12 Attach Rate by Warranty Types')){
    //         return true;
    //     }
    //     return false;
    // }

    $scope.showTargetLine = function (c) {
        if((c.categories && c.categories[c.activeCategory] === 'Corporate 15/12 Attach Rate by Sales Levels') || (c.categories && c.categories[c.activeCategory] === 'SWSS Attach Rate by Sales Levels')){
            return true;
        }
        return false;
    }



    $scope.showSelectedMonthText = function (c) {
         if(c.categories && (c.categories[c.activeCategory] === 'Corporate 15/12 Attach Rate by Sales Levels' || c.categories[c.activeCategory] === 'SWSS Attach Rate by Sales Levels' ||c.categories[c.activeCategory] === 'Total Attach Rate by Sales Levels' || c.categories[c.activeCategory] === 'Corporate 15/12 Attach Rate by Warranty Types')){
          return true;
        }
        return false;
    }

     $scope.yoyLineChart = function (c) {
        if(c.title === 'Corporate 15/12 Attach Rate by Months'
            || c.title === 'SWSS Attach Rate by Months' || c.title === 'Total Attach Rate by Months'){
            return true;
        }
        return false;
    }

    $scope.rotateXaxisText = function (c) {
        if(c.categories && c.categories[c.activeCategory] === 'Corporate 15/12 Attach Rate by Warranty Types'){
            return true;
        }
        return false;
    }
    $scope.toggleFiscalSelection = function (c, selection) {
        if(c.selectedFiscal === selection){
            return;
        }
        var indexOfFiscalSelection = c.title.indexOf('-');
        var activeTab = $scope.getActiveSPCTab();
        c.title = c.title.slice(0, indexOfFiscalSelection);
        c.title = c.title + '- ' + selection;
        c.selectedFiscal = selection;
        isFromFiscalSwitchButton = true;
        $scope.selectedFiscal = c.selectedFiscal;
        $scope.switchFiscal = true;
        $scope.resetChartFilters();
        $scope.getData();
        
        if(($scope.opportunitiesActive === "attach" && $scope.subopportunity === "ts") || ($scope.opportunitiesActive === "attach" && $scope.subopportunity === "swss")) {
            if($scope.switchFiscal === true ){
                retainActiveCategory;
            }
        }
    }

    $scope.assignFiscal = function(){
        var tempFiscal = angular.copy($scope.selectedFiscal);
        if(!$scope.selectedFiscal || !$scope.selectedFiscal === ''){
            $scope.selectedFiscal = 'FQ'
        }
        if(!isFromFiscalSwitchButton){
            $scope.selectedFiscal = 'FQ'
        }
        isFromFiscalSwitchButton = false;
    }

    $scope.changeToOpportunity = function (quarter) {
        $scope.opportunitiesViewToggle('opportunities');
        $scope.selectedQuarterFromWaterFallChart = quarter;
         $scope.showBackButton = true;
    }
    $scope.backButton = function () {
        $scope.showBackButton = false;
        $scope.opportunitiesViewToggle('performance');
        opportunitiesServ.showWaterfall = true;
    };

    $scope.hidePipeline = function () {
        if (filtersServ.globalView) {
            return false;
        } else {
            return true;
        }
    };

        
    $scope.toggleGlobalView = function (){
        filtersServ.isFromBookmark = false;
        $scope.showBackButton = false;
        //$scope.tiles[2].activeCategory = 0;
        if($scope.isBookmarkActive()){
            filtersServ.toggleInBookmark = true; //change for DE171977
            $scope.clearBookmark();
        }
        $scope.linecountselected = 0;  // clearing line count while switiching from sav to gu and vice versa
        $scope.listamountselected = 0;
        $scope.resetChartFilters(); // resetting the previous selected filters while toggle
        filtersServ.globalView = angular.copy(!filtersServ.globalView);
        $scope.globalView = angular.copy(!$scope.globalView);
        toggleglobaViewCheck= angular.copy($scope.globalView);
        //use the following flag to make API call for Global or Sales View
        $scope.CiscoUtilities.setGlobalParam(filtersServ.globalView);
        if ($scope.opportunitiesView === 'performance') {
            return;
        }
    }
    
    $scope.unDrillToPreviousSalesLevel = function (selectedSalesValueForDrill) {
        //index of selectedvalue
        var indexOfPreviousSalesSelectedValue = filtersServ.selectedSalesValues.indexOf(selectedSalesValueForDrill) - 1;
        var selectedArrayLength = filtersServ.selectedSalesValues.length;
        filtersServ.salesLevelRemoved = true;

        if (selectedArrayLength === 0) {
            delete filtersServ.selectedSalesValueForDrill;
            //delete $scope.selectedSalesValueForDrill;
        } else if (selectedArrayLength > 0) {
            filtersServ.selectedSalesValueForDrill = filtersServ.selectedSalesValues[indexOfPreviousSalesSelectedValue];
           // $scope.selectedSalesValueForDrill = filtersServ.selectedSalesValues[indexOfPreviousSalesSelectedValue];
            filtersServ.selectedSalesValues.pop();
        }
    }

    $scope.drillToNextSalesLevel = function (selectedSalesLevel) {
        filtersServ.selectedSalesValueForDrill = selectedSalesLevel;
    }
        
    $scope.dom2Image = function (value, index) {
        $scope.hideoptionSymbols = true;
        var temp = document.getElementById('kpi_' + index + 'chart_' + value.type);
        if (value.type === 'line_chart_rr' && value.expanded) {
            console.log(temp.getElementsByClassName('graph-desc')[0]);
            temp.getElementsByClassName('graph-desc')[0].style.width = "130%";
            temp.getElementsByClassName('graph-desc')[0].className = temp.getElementsByClassName('graph-desc')[0].className.replace(/(?:^|\s)graph-desc(?!\S)/g, 'hide-table')
        }
        domtoimage.toJpeg(document.getElementById('kpi_' + index + 'chart_' + value.type), { bgcolor: "#ffffff" })
            .then(function (dataUrl) {
                var link = document.createElement('a');
                if (value.categories != undefined)
                    link.download = value.categories[value.activeCategory] + '.jpeg';
                else
                    link.download = value.title + '.jpeg';
                link.href = dataUrl;
                document.body.appendChild(link);
                link.click();
                $scope.hideoptionSymbols = false;
                console.log(temp.getElementsByClassName('hide-table'));
                if (temp.getElementsByClassName('hide-table').length > 0) {
                    temp.getElementsByClassName('hide-table')[0].className = temp.getElementsByClassName('hide-table')[0].className.replace(/(?:^|\s)hide-table(?!\S)/g, 'graph-desc');
                    console.log(document.getElementById('line_chart_rr_table'));
                    domtoimage.toJpeg(document.getElementById('line_chart_rr_table'), { bgcolor: "#ffffff" })
                        .then(function (dataUrl) {
                            var link = document.createElement('a');
                            if (value.categories != undefined)
                                link.download = value.categories[value.activeCategory] + '_table.jpeg';
                            else
                                link.download = value.title + '_table.jpeg';
                            link.href = dataUrl;
                            document.body.appendChild(link);
                            link.click();
                        });
                    temp.getElementsByClassName('graph-desc')[0].style.width = "100%";
                }
                if (temp.getElementsByClassName('left-fix hide-text').length > 0)
                    temp.getElementsByClassName('left-fix hide-text')[0].className = temp.getElementsByClassName('left-fix hide-text')[0].className.replace(/(?:^|\s)left-fix hide-text(?!\S)/g, 'left-fix select-text')
            });
    }

    $scope.downloadNonScrollbarCharts = function(c, index) {
        $scope.hideoptionSymbols = true;
        $timeout(function () {
         $scope.dom2Image(c,index);
        },2000);
    }

    //For 'bar_stacked_horizontal', 'bar_stacked_double_horizontal', 'square_block', 'bar_double_horizontal' and 'bar_double_horizontal_drs' to redraw chart. Code by Akash
    $scope.downloadCharts = function (c, index) {
        if (c.type === "bar_double_horizontal") {
           
            $scope.redrawdom = true;
        }
        $scope.copytodom = !$scope.copytodom;
        $scope.hideoptionSymbols = true;
        $timeout(function () {
            var temp = document.getElementById('kpi_' + index + 'chart_' + c.type);
            temp.getElementsByClassName('left-fix select-text')[0].className = temp.getElementsByClassName('left-fix select-text')[0].className.replace(/(?:^|\s)left-fix select-text(?!\S)/g, 'left-fix hide-text')
            $scope.dom2Image(c, index);
            $scope.copytodom = !$scope.copytodom;
            $scope.redrawdom = false;
        }, 1500);
    }

    // AutoRenewal ( only for Subscription tab )
    $scope.clickAutoRenewalCheckbox = function(autoRenewalStatus) {
        CiscoUtilities.setAutoRenewal(autoRenewalStatus);
        $scope.resetChartFilters();
        $scope.getData();
    }
}
] );
