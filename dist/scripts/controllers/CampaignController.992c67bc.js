'use strict';
angular.module('ciscoExecDashApp').controller('CampaignController', [
    '$scope',  'opportunities', 'user', '$http', '$timeout', 'FiltersServ', 'OpportunitiesServ', 'PerformanceServ', 'UserServ', '$filter', 'ConfigServ', '$rootScope', '$routeParams', '$uibModal', '$q', '$location', 'CiscoUtilities', '$controller', 'GlobalBookmarkServ',
    function($scope,  opportunities, user, $http, $timeout, filtersServ, opportunitiesServ, performanceServ, userServ, $filter, configServ, $rootScope, $routeParams, $uibModal, $q, $location, CiscoUtilities, $controller, GlobalBookmarkServ) {

        $controller('OpportunitiesController', { $scope: $scope,  opportunities: opportunities, user: user, $http: $http, $timeout: $timeout, filtersServ: filtersServ, opportunitiesServ: opportunitiesServ, performanceServ: performanceServ, userServ: userServ, $filter: $filter, configServ: configServ, $rootScope: $rootScope, $routeParams: $routeParams, $uibModal: $uibModal, $q: $q, $location: $location, CiscoUtilities: CiscoUtilities });
        $rootScope.analysis = 'campaign';
        $scope.drilledCols = [];
        $scope.subArchLabel = 'See Opportunity Types';
        $scope.hasSub = '';
        $scope.isDrs = false;
        $scope.hasSuite = false;
        var productFamilyDRS;
        $scope.retArea=[];
        $scope.drsShipListView = false;
        $scope.isBookmarkActive = GlobalBookmarkServ.isBookmarkActive;
        var pieChartActiveValue;
        $scope.isDataCheckActive = false;

        if ($scope.isBookmarkActive()) {
            GlobalBookmarkServ.changeBookmarkActiveFalse($scope.opportunitiesActive);
        }

        $scope.hideShowStrip = function() {
            $rootScope.bHideFilterStrip = false;
        };

        $scope.isChartClickable = function() {
            return true;
        };
        $scope.isAreaClickable = function () {
            return true;
        };

        $scope.isQuarterClickable = function() {
            return false;
        };

        $scope.collapse = function(c) {
            c.expanded = 0;
            if (c.type === 'bar_double') {
                c.columns = 5;
            } else {
                c.columns = 6;
            }
        };

        $scope.getInsightFilters = function(activeTabValue){
            filtersServ.showInsightFilters(activeTabValue);
            $rootScope.showRefreshInsightFilter     = filtersServ.showRefreshInsightFilter;
            $rootScope.showTSAttachInsightFilter    = filtersServ.showTSAttachInsightFilter;
            var tempInsightFilters = {"showRefreshInsightFilter":filtersServ.showRefreshInsightFilter,
                                      "showTSAttachInsightFilter":filtersServ.showTSAttachInsightFilter
                                    };
            $scope.$broadcast('opportunity-active-change',tempInsightFilters);
        //Changes for DE150615 and DE151166 - Sindhu
            $scope.$on('CountOnTab',function(data,event){
                $scope.appliedFiltersCount = event;
            });
        };

        //To get checkboxes
    // $scope.showActionsDropdown = function (c) {
    //     return $scope.downloadChartCheckboxes(c);
    // }

   



    $scope.allowReportRequest = function (c) {
        return $scope.allowCustomerReport(c) || $scope.allowSmartReport(c) || $scope.allowActionMetrics(c) || $scope.allowPipelineDetails(c);
    };

    $scope.showActionsDropdown = function (c) {
        return $scope.allowPipelineDetails(c) ;
    }

    $scope.allowReportRequest = function (c) {
        if (c) {
            var activeC = c.activeCategory;
            if (!c.categories || activeC === null) {
                return;
            }
            var title = c.categories[activeC];
            title = title ? title : "";
            return title.toLowerCase().indexOf("customer") > -1;
        }
    };

    //To get checkboxes
    $scope.showActionsDropdown = function (c) {
        return $scope.allowActionMetrics(c) || $scope.allowPipelineDetails(c) || $scope.allowContractDetails(c) || $scope.downloadChartCheckboxes(c);
    }

    $scope.downloadChartCheckboxes = function (c) {
        if (   c.type == 'bar_double_horizontal_drs' || c.type == 'bar_double_horizontal')
            return true;
    }
    $scope.allowCustomerReport = function (c) {
        if (c) {
            var activeC = c.activeCategory;
            if (!c.categories || activeC === null) {
                return;
            }
            var title = c.categories[activeC];
            title = title ? title : "";
            return title.toLowerCase().indexOf("customer") > -1;
        }
    };

    $scope.$on('filter-changed', function(data, event) {
        $scope.isFiltersChanged = event;
        $('.opportunity-tile').css("height", "auto");
    });

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

       return $scope.opportunitiesActive === 'drs';
     };

    $scope.allowPipelineDetails = function (c) {
        if (!c.categories || activeC === null) {
            return;
        }
        var activeC = c.activeCategory;
        var title = c.categories[activeC];
        title = title ? title : "";
        var sales = $filter('filter')($scope.appliedFilters, {categoryId: 'Sales'});
        return sales.length &&
               sales.length >= 4 &&
               title.toLowerCase().indexOf("customer") > -1;
    };

    $scope.showCustomerExpand = function (c) {
        return false;
    };

    $scope.canCreatePipeline = function() {
        return $scope.opportunitiesActive === 'drs';
    };

    $scope.canViewDetails = function (isAmSelected) {
        //var AMsales = $filter('filter')($scope.appliedFilters, {categoryId: 'salesAM'});
        if ($scope.opportunitiesActive === 'ciscoOne' && isAmSelected !== 'AMSelected') {
            return false;
        }
        return true;
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
            return arr.reverse(); //Inconsistent order of Pipeline & Opportunity columns after chart expansion in DRS
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
            return arr.reverse(); //Inconsistent order of Pipeline & Opportunity columns after chart expansion in DRS
        };

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

        $scope.getData = function(isInternalCall) {
            filtersServ.globalView = false;
            $scope.CiscoUtilities.setGlobalParam( filtersServ.globalView);
            var deferred = $q.defer();
            $('.d3-tip').hide();
            var v = $scope.opportunitiesView;
            var subArchitechture;
            var filtersToBeApplied = {};
            $scope.opportunitiesActive = $routeParams.opportunity;
            $scope.$broadcast('prop-insight-slider-filter',$scope.opportunitiesActive);

            // Changes for US142538
            $scope.$broadcast('opportunity-active-change',{"showRefreshInsightFilter":true,
                                    "showTSAttachInsightFilter":false
            });

            if($scope.pieActiveDrill && $scope.opportunitiesActive === 'drs'){
                $scope.chartFilters.activeKey = $scope.pieActiveDrill;
            }

            if ($scope.chartFilters) {
                angular.extend(filtersToBeApplied, $scope.CiscoUtilities.cleansedFilters($scope.appliedFilters), $scope.chartFilters,$scope.propInsightSliderFilter);
            } else {
                filtersToBeApplied = $scope.CiscoUtilities.cleansedFilters($scope.appliedFilters);
            }

            if (filtersToBeApplied.quarterId) {
                delete filtersToBeApplied.quarterId;
            }

            if ($scope.opportunitiesActive === "ciscoOne") {
                subArchitechture = $scope.pieActiveDrill;
            } else {
                subArchitechture = false;
                $scope.isDrs = true;
            }

            if ($scope.isBookmarkActive()) {
                var bookmarkFilter;
                if (GlobalBookmarkServ.bookmark !== undefined) {
                    bookmarkFilter = $scope.CiscoUtilities.cleansedFilters($scope.appliedFilters);
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
                    bookmarkFilter = $scope.CiscoUtilities.cleansedFilters($scope.appliedFilters);
                    angular.extend(filtersToBeApplied, bookmarkFilter);
                    if ($scope.isFiltersChanged && GlobalBookmarkServ.bookmark.isModified) {
                        $scope.isFiltersChanged = true;
                    }
                }
            }

            if(filtersToBeApplied && filtersToBeApplied.accounts){
                if(filtersToBeApplied.accounts.length > 1){
                    $scope.tilesAccounts = true;
                } else {
                    $scope.tilesAccounts = false;
                }
            }else{
                $scope.tilesAccounts = false;
            }
            if ($scope.hasSuite) {
                filtersToBeApplied.hasSuite = $scope.hasSuite;
            } else {
                filtersToBeApplied.hasSuite = $scope.hasSuite;
            }
            opportunitiesServ.getData($scope.opportunitiesActive, filtersToBeApplied, null, $scope.opportunitiesActive, subArchitechture).then(function(response) {
            //DE140032 - Arun Dada - Sales Level/partner/customer selection goes after drill down
                if($scope.retArea.length>0){
                    $scope.areaActive=$scope.retArea;

                 }else{
                    $scope.areaActive=[];
                }

                $rootScope.accessIssue = "";
                $scope.drsShipListView = true;

                if ($scope.opportunitiesActive === 'ciscoOne') {
                    $scope.hasSub = response.hasSub;
                    // Why are we doing this below line? Commented it to fix DE156000 -G
                    //$scope.toggleViewType(response[2], 'chart');
                }
                else if($scope.opportunitiesActive === 'drs'){ //adding this else condition to land on shipment history chart in middle tile.
                    response[1].activeCategory = 0;
                }
                if (angular.isDefined($scope.tiles)){
                    if(($scope.opportunitiesActive==='drs') && (($scope.tiles[0].type === 'bar_double_horizontal_drs' && $scope.tiles[0].viewType === 'list') || ($scope.tiles[1].type === 'bar_stacked' && $scope.tiles[1].viewType === 'list'))){
                        $scope.getProductFamilyDataDRS();
                    }
                }
                if ($scope.getActiveSPCTab() !== 'sales'  && (angular.isDefined(response[2].activeCategory) && angular.isDefined($scope.tiles)) && !angular.isDefined($scope.chartFilters.pcNodeName) && !(angular.isDefined($scope.appliedFilters[4]) && $scope.appliedFilters[4].categoryId === "sales")) {
                    if(($scope.chartFilters.pcNodeName === '[]' || $scope.chartFilters.pcNodeName === undefined) && response[2].activeCategory !== 3) {
                        $scope.getSPCData($scope.tiles[2].activeCategory);
                    }
                }
                //DE144473 added if block for any value other then sales was selected in drop down new data was not comming
                if ($scope.opportunitiesActive === 'ciscoOne' && ($scope.chartFilters.customer === undefined || $scope.chartFilters.customer === '') &&
                            ($scope.chartFilters.partner === undefined || $scope.chartFilters.partner === '') && !(angular.isDefined($scope.appliedFilters[4]) && $scope.appliedFilters[4].categoryId === "sales")) {
                                if (angular.isDefined(response[2].activeCategory)){
                                     $scope.getSPCData(response[2].activeCategory);
                                }
                }

                if ($scope.quarterActive && $scope.quarterActive.length > 0) {
                    var retainedQuarter = angular.copy($scope.quarterActive);
                }
                if ($scope.areaActive && $scope.areaActive.length > 0) {
                    var retainedArea = angular.copy($scope.areaActive);
                }
                $scope.resetActive();
                $('.d3-tip').hide();
                if (retainedQuarter && retainedQuarter.length > 0) {
                    $scope.quarterActive = angular.copy(retainedQuarter);
                }
                if (retainedArea && retainedArea.length > 0) {
                    $scope.areaActive = angular.copy(retainedArea);
                }
                var activeTabName = $scope.getActiveSPCTab();
                //updating category because account manager is selected from global bookmark...Parth
                if ($scope.accounts.length > 0) {
                    if (($scope.chartFilters && $scope.chartFilters.pcNodeName !== undefined) || $scope.areaActive.length > 0) {
                        response[2].activeCategory = configServ.opportunitiesKeyNameMap[activeTabName];
                    } else {
                        if (response[2].activeCategory === 1) {
                            response[2].activeCategory = 1;
                        } else {
                            response[2].activeCategory = 3;
                        }

                    }
                }
                if(angular.isDefined($scope.appliedFilters[4])){
                    if(angular.isDefined($scope.appliedFilters[4].title)  && $scope.appliedFilters[4].categoryId === 'sales'){
                        if (($scope.appliedFilters[4].title.length) && ($scope.accounts.length === 0)) {
                            response[2].categories = angular.copy(response[2]["categories-main"]);
                            if ($scope.drllActMng === false && response[2].isAccountManagerList === true) {
                                response[2].activeCategory = 3;
                                $scope.getSPCData(3);
                            } else {
                                var tab = $scope.getActiveSPCTab();
                                var actCatgry = configServ.opportunitiesKeyNameMap[tab];
                                if ($scope.userInfo.pipelinePermission && !$scope.chartFilters.partner && !angular.isDefined($scope.chartFilters.pcNodeName)) {
                                    if($scope.chartFilters.pcNodeName === '[]' || $scope.chartFilters.pcNodeName === undefined){
                                        if($scope.catgActive !== undefined){// Changes for DE137362
                                            actCatgry = $scope.catgActive;
                                        // else
                                        //     actCatgry = 2;

                                        } 
                                    }
                                }
                                response[2].activeCategory = actCatgry;
                                if (response[2].activeCategory !== 0) {
                                    if($scope.opportunitiesActive === 'drs'){//Added if blog for DE145704
                                        if(!angular.isDefined($scope.chartFilters.pcNodeName)){
                                            $scope.getSPCData(actCatgry);
                                          }
                                    }
                                    else{
                                        $scope.getSPCData(actCatgry);
                                    }
                                  }
                            }
                        }else{ // Change for DE135329
                            if ($scope.opportunitiesActive === 'ciscoOne' && !angular.isDefined($scope.chartFilters.pcNodeName)) {
                                if($scope.chartFilters.pcNodeName === '[]' || $scope.chartFilters.pcNodeName === undefined){
                                    $scope.getSPCData(2);
                                }
                            }
                        }
                    }else{ //Fix for DE134724
                        response[2].categories = angular.copy(response[2]["categories-main"].slice(0, 3));
                    }
                } else {
                    response[2].categories = angular.copy(response[2]["categories-main"].slice(0, 3));
                }
                if ((response[2].activeCategory + 1) > response[2].categories.length) {
                    response[2].activeCategory = 0;
                }
                if ($scope.accounts.length > 1){//chart title was becoming blank DE147819
                    response[2].activeCategory = 2;
                }
                if ($scope.accounts.length > 0) {
                    fillPCWithAccMng(response, $scope.accounts);
                    if (response[2].activeCategory === 0 || !response[2].activeCategory  || response[2].activeCategory +1 > response[2].categories.length) {
                        response[2].activeCategory = 2;
                        $scope.getSPCData(2);
                    }

                    if (response[2].activeCategory === 1) { // when acct manager is selected and it is in partner's view.
                        $scope.getSPCData(1);
                    }
                    if (response[2].activeCategory !== 1 && $scope.opportunitiesActive==='drs') { // DE147819 clicking on AM customer is coming blank
                        $scope.getSPCData(2);
                    }

                    $scope.tiles = response;
                    matchTilesHeight(50);

                    $scope.tiles.forEach(function(c) {
                        if (c.type === 'bar_double' || c.type === 'bar_double_horizontal_drs') {
                            $scope.tiles[0].orgData = angular.copy($scope.tiles[0].data);

                            if(angular.isDefined(c.data_net)){
                                $scope.tiles[0].orgDataNet = angular.copy($scope.tiles[0].data_net);
                                $scope.normalizeDCNet(c);
                            }

                            $scope.normalizeDC(c);

                        }
                        if (c.type === 'bar_double_horizontal') {
                            $scope.tiles[2].orgData = angular.copy($scope.tiles[2].data);
                            $scope.tiles[2].orgDataNet = angular.copy($scope.tiles[2].data_net);
                            if(angular.isDefined(c.data_net)){
                                $scope.normalizeDHCNet(c);
                            }

                            $scope.normalizeDHC(c);

                        }
                        if(angular.isDefined($scope.tiles[1].sfdc_data)){
                            if($scope.tiles[1].sfdc_data){
                                if( $scope.tiles[1].sfdc_data.length === 0 && c.type === 'bar_stacked' && c.categories[c.activeCategory] === 'SFDC Booked Deals'){
                                    c.info = 'nodata';
                                } else {
                                    c.info = '';
                                }
                            }
                        }
                    });
                    if(($scope.opportunitiesActive ==='drs')&&(($scope.tiles[0].type === 'bar_double_horizontal_drs' && $scope.tiles[0].viewType === 'list') || ($scope.tiles[1].type === 'bar_stacked' && $scope.tiles[1].viewType === 'list'))){
                        $scope.getProductFamilyDataDRS();
                    }
                    if(isInternalCall){
                        $scope.makeCustomerCall(response);
                    }
                    deferred.resolve(true);
                } else {
                    $scope.tiles = response;
                    matchTilesHeight(50);
                    if ($location.$$path === "/sales/campaign/drs" || $location.$$path === "/sales/campaign/ciscoOne") {
                        $scope.tiles.forEach(function(c) {
                            if (c.type === 'bar_double' || c.type === 'bar_double_horizontal_drs') {
                                $scope.tiles[0].orgData = angular.copy($scope.tiles[0].data);
                                if(angular.isDefined(c.data_net)){
                                    $scope.tiles[0].orgDataNet = angular.copy($scope.tiles[0].data_net);
                                    $scope.normalizeDCNet(c);
                                }

                                $scope.normalizeDC(c);

                            }
                            if (c.type === 'bar_double_horizontal') {
                                var activeTab = $scope.getActiveSPCTab();
                                if (activeTab === 'sales') {
                                    $scope.tiles[2].orgData = [];
                                    $scope.tiles[2].orgDataNet = [];
                                    $scope.tiles[2].orgData = angular.copy($scope.tiles[2].data);
                                    if(angular.isDefined(c.data_net)){
                                        $scope.tiles[2].orgDataNet = angular.copy($scope.tiles[2].data_net);
                                    }
                                }
                                else{//DE139897 old value were shown
                                    $scope.tiles[2].orgData[0] = angular.copy($scope.tiles[2].data[0]);
                                    if(angular.isDefined(c.data_net)){
                                        $scope.tiles[2].orgDataNet[0] = angular.copy($scope.tiles[2].data_net[0]);
                                    }
                                }
                                if(angular.isDefined(c.data_net)){
                                    $scope.normalizeDHCNet(c);
                                }

                                $scope.normalizeDHC(c);

                            }
                            if(angular.isDefined($scope.tiles[1].sfdc_data)){
                                if($scope.tiles[1].sfdc_data){
                                    if( $scope.tiles[1].sfdc_data.length === 0 && c.type === 'bar_stacked' && c.categories[c.activeCategory] === 'SFDC Booked Deals'){
                                        c.info = 'nodata';
                                    } else {
                                         c.info = '';
                                    }
                                }
                            }
                        });
                    }
                    if(isInternalCall){
                        $scope.makeCustomerCall(response);
                    }
                    //Need to check with ketan why they wrote two times
                    /*if(($scope.opportunitiesActive!== 'ciscoOne')&&(($scope.tiles[0].type === 'bar_double_horizontal_drs' && $scope.tiles[0].viewType === 'list') || ($scope.tiles[1].type === 'bar_stacked' && $scope.tiles[1].viewType === 'list'))){
                            $scope.getProductFamilyDataDRS();
                    }*/
                    deferred.resolve(true);
                }
            });

            return deferred.promise;
        }

        $scope.makeCustomerCall = function(response){
            var flag = false;
            var index = 0;
            var sales = $filter('filter')($scope.appliedFilters, {categoryId: 'Sales'});
            if(response[2] && response[2].categories && response[2].categories.length > 0 && (!sales ||(sales && sales.length > 3))){
                for(var i = 0; i < response[2].categories.length; i++){
                    if(response[2].categories[i] && response[2].categories[i].toLowerCase().indexOf("customer") > -1){
                        flag = true;
                        index = i;
                    }
                }
            }
            if(flag ||(!sales ||(sales && sales.length < 4)) && !$scope.isDataCheckActive  && !$scope.currBookmark){
                response[2].activeCategory = index;
                $scope.getSPCData(index);
            }
             if($scope.currBookmark){
                if($scope.currBookmark.filter[3]=== 0 || $scope.currBookmark.filter[3]){
                        $scope.getSPCData($scope.currBookmark.filter[3]);
                        response[2].activeCategory= $scope.currBookmark.filter[3];
                }
            }
            if($scope.isDataCheckActive){
                $scope.isDataCheckActive = false;
            }
        }

         $scope.getSPCData = function(index) {
            $('.tooltip').hide();
            $('.d3-tip').hide();
            var defered = $q.defer();
            var activeSPCKey = index;
            if (typeof index === "number") {
                activeSPCKey = configServ.opportunitiesKeyIndexMap[index];
            }

            $scope.$broadcast('active-spc-key-selection', activeSPCKey);

            if (activeSPCKey === "sales" && ($scope.chartFilters.pcNodeName && $scope.chartFilters.pcNodeName.length > 0)) {
                var selectedArea = JSON.parse($scope.chartFilters.pcNodeName);
                if (selectedArea.length > 0){
                    $scope.resetChartFilters();
                    $scope.getData(true);
                }
                defered.resolve(true);
                return defered.promise;
            }

            if ($scope.exceptionKeys.indexOf(activeSPCKey) > -1) {
                defered.resolve(true);
                return defered.promise;
            }

            var allFilters = {};
            var subArchitechture = true;

            if ($scope.opportunitiesActive === 'ciscoOne') {
                subArchitechture = $scope.pieActiveDrill;
            } else {
                subArchitechture = false;
            }
            if($scope.pieActiveDrill || subArchitechture){ // OR condition to send active key (once selected from first chart) in  third chart switch.-NM
                $scope.chartFilters.activeKey = $scope.pieActiveDrill;
            }
            clearPCFilter($scope.chartFilters);
            if($scope.pieActiveDrill || subArchitechture){
                $scope.chartFilters.activeKey === $scope.pieActiveDrill;
            }

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

            angular.extend(allFilters, $scope.CiscoUtilities.cleansedFilters($scope.appliedFilters), $scope.chartFilters,$scope.propInsightSliderFilter);
            if ($scope.hasSuite) {
                allFilters.hasSuite = $scope.hasSuite;
            } else {
                allFilters.hasSuite = $scope.hasSuite;
            }
            opportunitiesServ.getSPCData($scope.opportunitiesActive, activeSPCKey, allFilters, $scope.getActiveSubTab(), subArchitechture).then(function(response) {
                $scope.tiles = response;
                $scope.linecountselected = 0;
                $scope.listamountselected = 0;
                matchTilesHeight(100);
                $scope.tiles.forEach(function(c) {
                    if (c.type === 'bar_double') {
                        $scope.normalizeDC(c);
                        if(angular.isDefined(c.data_net)){
                            $scope.normalizeDCNet(c);
                        }
                    }
                    if (c.type === 'bar_double_horizontal') {
                        c.salesData = c.orgData;
                        c.salesData_net = c.orgDataNet ;
                        c.orgData = null;
                        c.orgDataNet = null;
                        if(angular.isDefined(c.data_net)){
                            $scope.normalizeDHCNet(c);
                        }
                        $scope.normalizeDHC(c);
                    }
                });
                 $scope.tiles[2].checkedstates = [];
                $scope.toggleViewType(response[2], response[2].viewType);
                defered.resolve(true);
            });
            // Changes for DE133249
            $('.tooltip').show();
            $('.d3-tip').show();
            return defered.promise;
        };

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

        var refreshAllDataEvent = $scope.$on('refresh-all-data', function(event, data) {
            var activeTab = $scope.getActiveSPCTab();
            if (activeTab && activeTab !== "sales") {
                if (data && data.pcNodeName) {
                    data[$scope.getActiveSPCTab()] = data.pcNodeName;
                }
                 var maintainAreaOfPartCust = true;
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
                }
                angular.extend($scope.chartFilters, data);
                $scope.isDataCheckActive = true;
                $scope.getData(true);
            }
            if($scope.opportunitiesActive === "drs" && activeTab === "sales" && ($scope.tiles[0].viewType === 'list' || $scope.tiles[1].viewType === 'list' )){
                var refreshListFiltersDRS = {};
                refreshListFiltersDRS.sales = data.pcNodeName;
                angular.extend($scope.chartFilters, refreshListFiltersDRS);
                $scope.getProductFamilyDataDRS();
            }
            $('.tooltip').show();
            $('.d3-tip').show();
            $scope.retArea = JSON.parse(data.pcNodeName);
        });

        $scope.getProductFamilyDataDRS = function() {
            //$scope.drsShipListView = true;
            var subArchitechture;
            var filtersToBeApplied = {};
            $scope.opportunitiesActive = $routeParams.opportunity;
            if ($scope.chartFilters) {
                angular.extend(filtersToBeApplied, $scope.CiscoUtilities.cleansedFilters($scope.appliedFilters), $scope.chartFilters,$scope.propInsightSliderFilter);
            } else {
                filtersToBeApplied = $scope.CiscoUtilities.cleansedFilters($scope.appliedFilters);
            }
            if (filtersToBeApplied.quarterId) {
                delete filtersToBeApplied.quarterId;
            }
            if ($scope.pieActiveDrill) {
                subArchitechture = $scope.pieActiveDrill;
            } else {
                subArchitechture = false;
            }
            opportunitiesServ.getProductFamilyDataDRS($scope.opportunitiesActive, filtersToBeApplied, subArchitechture).then(function(response) {
                productFamilyDRS = response;
                $scope.tiles.forEach( function(c){
                    if (c.type === "bar_double_horizontal_drs" || c.type === "bar_stacked"){
                        $scope.getProductFamilyDRS(c);
                    }
                })

            });


        };

        $scope.getProductFamilyDRS = function(c){
            if(angular.isDefined(productFamilyDRS)){
                c.productfamilylist = angular.copy(productFamilyDRS['data_list']);
                c.productfamilynet = angular.copy(productFamilyDRS['data_net']);
            }
        };

        var campAreaWatch = $scope.$watch('areaActive', function(newVal) {
            if (typeof $scope.tiles !== 'undefined' && $scope.tiles.length) {
                $scope.tiles.forEach(function(c) {
                    if (c.type === 'bar_double' || c.type === 'bar_double_horizontal_drs') {
                        if(angular.isDefined(c.data_net)){
                                    $scope.normalizeDCNet(c);
                                }
                                    $scope.normalizeDC(c);

                    }
                });
            }
        }, true);

        var campActiveDrillWatch = $scope.$watch('campActiveDrill', function(newVal) {
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

        var pieActiveDrillWatch = $scope.$watch('pieactivedrill', function(newVal) {
            if (newVal) {
                $scope.resetChartFilters();
                $scope.getData(true);
            }
        });

        $scope.selectCategory = function(c, i, ind) {
            $scope.drsShipListView = false;
            if (c.type === 'bar_double_horizontal'){
                    $scope.areaActive = [];
            }
            c.activeCategory = i;
            if (c.type === 'bar_stacked_horizontal'){
                $scope.areaActive = [];
            }
            if ($scope.opportunitiesActive === 'ciscoOne' && c.type === 'pie') {
                if (c.activeCategory === 1) {
                    $scope.hasSuite = true;
                } else {
                    $scope.hasSuite = false;
                }
                $scope.resetChartFilters();
                $scope.retArea = [];
                $scope.selectedsublegend = "";
                $scope.getData(true);
                return;
            }
            if ($scope.opportunitiesActive === 'ciscoOne' && c.type === 'bar_stacked_horizontal') {
                $scope.resetChartFilters();
                $scope.retArea = [];
                $scope.selectedsublegend = "";
            }
            if(c.type === 'bar_stacked'){
                if(c.info === 'nodata'){
                    delete c.info;
                }
                if(c.activeCategory === 0){
                    $scope.tiles[1].shipment_data = angular.copy($scope.tiles[1].shipment_data);
                }
                if(c.activeCategory === 1 && $scope.tiles[1].sfdc_data.length){
                    $scope.tiles[1].sfdc_data = angular.copy($scope.tiles[1].sfdc_data);
                }

                if(c.activeCategory === 1 && $scope.tiles[1].sfdc_data.length === 0){
                    c.info = 'nodata';
                }
            } else {
            $scope.clearSPCData(i, c).then(function() {
                $scope.getSPCData(i).then(function() {
                    var hasSubTab = $scope.getActiveSubTab();
                    if (c.type === 'bar_double_horizontal' || c.type === 'bar_stacked') {
                        var activeTab = $scope.getActiveSPCTab();
                        if (activeTab === "sales") {
                            c.orgData[0] = angular.copy(c.salesData[0]);
                            c.orgDataNet[0] = angular.copy(c.salesData_net[0]);

                            if($scope.opportunitiesActive === 'drs' && $scope.pieActiveDrill){
                                c.orgData[2] = angular.copy(c.salesData[2]);
                                c.orgDataNet[2] = angular.copy(c.salesData_net[2]);
                            }
                        }

                    if(angular.isDefined(c.data_net)){
                            $scope.normalizeDHCNet(c);
                        }
                        $scope.normalizeDHC(c);
                    }
                    c.isPercent = $scope.CiscoUtilities.isPercent(c);
                    $scope.isAccountManagerList(c);
                   // $('.d3-tip').hide();
                    matchTilesHeight(50);
                });
            });
            }
            resetScrollPosition(ind);
        };

        $scope.toggleViewType = function(c, t) {
            //Fix for DE121985  - Sindhu
            if (c.viewType === t) {
                return;
            }

            $scope.getProductFamily(c);
            if($rootScope.isExpandArch !== undefined){
                c.expandAllArch = false;
            }
            var a = c.activeTab;
            c.activeTab = null;
            c.viewType = t;
            $timeout(function() {
                c.activeTab = a;
                bindTableScroll();
            });
            if ($scope.opportunitiesActive === 'drs' && t === 'list' && (c.type === 'bar_stacked' || c.type === 'bar_double_horizontal_drs')){
                $scope.getProductFamilyDataDRS();
            }
            matchTilesHeight(100);
        };



        $scope.normalizeDC = function(c) {
            if ($rootScope.analysis !== 'campaign') {
                return;
            }
            if (!c.orgData) {
                c.orgData = angular.copy(c.data);
            }

            var data = angular.copy(c.orgData);

            var newdata = [];
            var quarters = [];
            var uKeys = [];
            var duplicateKeys = [];
            for (var k = 0; k < data.length; k++) {
                var uniqueArch = $scope.getUniqueArch(data[k].areas, "freq");
                for (var j = 0; j < uniqueArch.length; j++) {
                    duplicateKeys.push(uniqueArch[j]);
                }
            }

            var uniqueArchitecture = [];
            $.each(duplicateKeys, function(i, el) {
                if ($.inArray(el, uniqueArchitecture) === -1){
                    uniqueArchitecture.push(el);
                 }
            });

            for (var prop in uniqueArchitecture) {
                quarters.push(uniqueArchitecture[prop]);
            }

            quarters.forEach(function(e) {
                var o = {};
                o.quarter = e;
                o.areas = [];
                o.areas_drill = [];
                data.forEach(function(d) {
                    var q = {};
                    q.state = d.quarter;
                    q.freq = {};
                    var areas = d.areas;
                    areas.forEach(function(e) {
                        var activeTab = $scope.getActiveSPCTab();
                        if (activeTab === 'sales') {
                            if ($scope.areaActive.length && $scope.areaActive.indexOf(e.state) === -1) {
                                return true;
                            }
                        }
                        var freq = e.freq[o.quarter];
                        for (var prop in freq) {
                            if (prop === 'areas_drill') {
                                for (var prop_2 in freq[prop]) {
                                    var g = {};
                                    g.quarter = prop_2;
                                    g.areas = [];

                                    var newobj = {};
                                    newobj.state = d.quarter;
                                    newobj.freq = freq[prop][prop_2];
                                    g.areas.push(newobj);

                                    var ifExists = $filter('filter')(o.areas_drill, { quarter: prop_2 });
                                    if (ifExists.length) {
                                        var state = $filter('filter')(ifExists[0].areas, { state: d.quarter });
                                        if (state.length) {
                                            for (var prop_3 in state[0].freq) {
                                                state[0].freq[prop_3] += newobj.freq[prop_3];
                                            }
                                        } else{
                                            ifExists[0].areas.push(newobj);
                                         }
                                    } else {
                                        o.areas_drill.push(g);
                                    }
                                }
                                continue;
                            }
                            if (typeof q.freq[prop] !== 'undefined') {
                                q.freq[prop] += freq[prop];
                            } else {
                                q.freq[prop] = freq[prop];
                            }
                        }
                    });
                    o.areas.push(q);
                });
                newdata.push(o);
            });
            c.data = newdata;
        };

        $scope.normalizeDCNet = function(c) {
            if ($rootScope.analysis !== 'campaign') {
                return;
            }
            if (!c.orgDataNet) {
                c.orgDataNet = angular.copy(c.data_net);
            }

            var data_net = angular.copy(c.orgDataNet);

            var newdata = [];
            var quarters = [];
            var uKeys = [];
            var duplicateKeys = [];
            for (var k = 0; k < data_net.length; k++) {
                var uniqueArch = $scope.getUniqueArch(data_net[k].areas, "freq");
                for (var j = 0; j < uniqueArch.length; j++) {
                    duplicateKeys.push(uniqueArch[j]);
                }
            }

            var uniqueArchitecture = [];
            $.each(duplicateKeys, function(i, el) {
                if ($.inArray(el, uniqueArchitecture) === -1){
                    uniqueArchitecture.push(el);
                   }
            });

            for (var prop in uniqueArchitecture) {
                quarters.push(uniqueArchitecture[prop]);
            }

            quarters.forEach(function(e) {
                var o = {};
                o.quarter = e;
                o.areas = [];
                o.areas_drill = [];
                data_net.forEach(function(d) {
                    var q = {};
                    q.state = d.quarter;
                    q.freq = {};
                    var areas = d.areas;
                    areas.forEach(function(e) {
                        var activeTab = $scope.getActiveSPCTab();
                        if (activeTab === 'sales') {
                            if ($scope.areaActive.length && $scope.areaActive.indexOf(e.state) === -1) {
                                return true;
                            }
                        }
                        var freq = e.freq[o.quarter];
                        for (var prop in freq) {
                            if (prop === 'areas_drill') {
                                for (var prop_2 in freq[prop]) {
                                    var g = {};
                                    g.quarter = prop_2;
                                    g.areas = [];

                                    var newobj = {};
                                    newobj.state = d.quarter;
                                    newobj.freq = freq[prop][prop_2];
                                    g.areas.push(newobj);

                                    var ifExists = $filter('filter')(o.areas_drill, { quarter: prop_2 });
                                    if (ifExists.length) {
                                        var state = $filter('filter')(ifExists[0].areas, { state: d.quarter });
                                        if (state.length) {
                                            for (var prop_3 in state[0].freq) {
                                                state[0].freq[prop_3] += newobj.freq[prop_3];
                                            }
                                        } else{
                                            ifExists[0].areas.push(newobj);
                                           }
                                    } else {
                                        o.areas_drill.push(g);
                                    }
                                }
                                continue;
                            }
                            if (typeof q.freq[prop] !== 'undefined') {
                                q.freq[prop] += freq[prop];
                            } else {
                                q.freq[prop] = freq[prop];
                            }
                        }
                    });
                    o.areas.push(q);
                });
                newdata.push(o);
            });
            c.data_net = newdata;
        };

        $scope.normalizeDHC = function(c) {
            if (!c.orgData) {
                c.orgData = angular.copy(c.data);

                var activeTab = $scope.getActiveSPCTab();
                if (activeTab === "partner" || activeTab === "customer" || activeTab === "manager") {
                    if (c.salesData) {
                        c.orgData[0] = angular.copy(c.salesData[0]);
                    }
                }
            }
            c.activeCategory = c.activeCategory ? c.activeCategory : 0;
            var data = angular.copy(c.orgData[c.activeCategory]);
            var newdata = [];
            var ifExists = [];

            if (!data){
                return;
             }
            data.forEach(function(d) {
                var areas = d.areas;
                areas.forEach(function(e) {
                    var o = {};
                    o.quarter = e.state;
                    o.areas = [];
                    o.stateId = e.stateId;

                    var b = e.freq;
                    for (var prop in b) {
                        if ($scope.campActiveDrill && $scope.campActiveDrill !== prop) {
                            continue;
                        }
                        var obj = {};
                        obj.state = prop;
                        obj.freq = b[prop];
                        obj.areas_drill = [];
                        var areas_drill = obj.freq["areas_drill"];
                        delete obj.freq["areas_drill"];

                        for (var a in areas_drill) {
                            var obj_n = {};
                            obj_n.state = a;
                            obj_n.freq = areas_drill[a];

                            ifExists = $filter('filter')(newdata, { quarter: e.state });
                            if (ifExists.length) {
                                var state = $filter('filter')(ifExists[0].areas, { state: prop });
                                if (state.length) {
                                    var state_2 = $filter('filter')(state[0].areas_drill, { state: a });
                                    if (state_2 && state_2.length) {
                                        for (var prop_3 in state_2[0].freq) {
                                            state_2[0].freq[prop_3] += obj_n.freq[prop_3];
                                        }
                                    }
                                }
                            } else {
                                obj.areas_drill.push(obj_n);
                            }
                        }

                        ifExists = $filter('filter')(newdata, { quarter: e.state });
                        if (ifExists.length) {
                            var state = $filter('filter')(ifExists[0].areas, { state: prop });
                            if (state && state.length) {
                                for (var prop_2 in b[prop]) {
                                    state[0].freq[prop_2] += b[prop][prop_2];
                                }
                            }
                        } else {
                            o.areas.push(obj);
                        }
                    }
                    if (!ifExists.length) {
                        newdata.push(o);
                    }
                });
            });
            c.data[c.activeCategory] = newdata;
        };


        $scope.normalizeDHCNet = function(c) {
            if (!c.orgDataNet) {
                c.orgDataNet = angular.copy(c.data_net);

                var activeTab = $scope.getActiveSPCTab();
                if (activeTab === "partner" || activeTab === "customer" || activeTab === "manager") {
                    if (c.salesData_net) {
                        c.orgDataNet[0] = angular.copy(c.salesData_net[0]);
                    }
                }
            }
            c.activeCategory = c.activeCategory ? c.activeCategory : 0;
            var data_net = angular.copy(c.orgDataNet[c.activeCategory]);
            var newdata = [];
            var ifExists = [];

            if (!data_net){
                return;
              }

            data_net.forEach(function(d) {
                var areas = d.areas;
                areas.forEach(function(e) {
                    var o = {};
                    o.quarter = e.state;
                    o.areas = [];
                    o.stateId = e.stateId;

                    var b = e.freq;
                    for (var prop in b) {
                        if ($scope.campActiveDrill && $scope.campActiveDrill !== prop) {
                            continue;
                        }
                        var obj = {};
                        obj.state = prop;
                        obj.freq = b[prop];
                        obj.areas_drill = [];
                        var areas_drill = obj.freq["areas_drill"];
                        delete obj.freq["areas_drill"];

                        for (var a in areas_drill) {
                            var obj_n = {};
                            obj_n.state = a;
                            obj_n.freq = areas_drill[a];

                            ifExists = $filter('filter')(newdata, { quarter: e.state });
                            if (ifExists.length) {
                                var state = $filter('filter')(ifExists[0].areas, { state: prop });
                                if (state.length) {
                                    var state_2 = $filter('filter')(state[0].areas_drill, { state: a });
                                    if (state_2 && state_2.length) {
                                        for (var prop_3 in state_2[0].freq) {
                                            state_2[0].freq[prop_3] += obj_n.freq[prop_3];
                                        }
                                    }
                                }
                            } else {
                                obj.areas_drill.push(obj_n);
                            }
                        }

                        var ifExists = $filter('filter')(newdata, { quarter: e.state });
                        if (ifExists.length) {
                            var state = $filter('filter')(ifExists[0].areas, { state: prop });
                            if (state && state.length) {
                                for (var prop_2 in b[prop]) {
                                    state[0].freq[prop_2] += b[prop][prop_2];
                                }
                            }
                        } else {
                            o.areas.push(obj);
                        }
                    }
                    if (!ifExists.length) {
                        newdata.push(o);
                    }
                });
            });
            c.data_net[c.activeCategory] = newdata;
        };

        $scope.getNetworkData = function() {
            $http.get('config/network.json').then(function(d) {
                $scope.networkData = d.data;
            });
        };
        $scope.getNetworkData();
    // US131289

    $scope.getMcrEstimate = function (addUpgradeParam) {

       $('.action_offset').hide();
         var addUpgradeValue;
        if(addUpgradeParam === 'addUpgrade'){
            addUpgradeValue = ["ADD","UPGRADE"];
        }
        else if(addUpgradeParam === 'upgrade'){
            addUpgradeValue = ["UPGRADE"];
        }


        if(addUpgradeParam === 'addUpgrade' &&  $scope.addUpgrade){
                return;
        }
        else if(addUpgradeParam === 'upgrade' &&   $scope.upgrade){
             return;
        }
         var v = $scope.opportunitiesView;
            var subArchitechture;
            var filtersToBeApplied = {};
            $scope.opportunitiesActive = $routeParams.opportunity;
            var source = null;
            if($routeParams.subopportunity=== "source=SFDC"){
                source = "SFDC";
            }
            else{
                source = null;
            }

            if($scope.pieActiveDrill && $scope.opportunitiesActive === 'drs'){
                $scope.chartFilters.activeKey = $scope.pieActiveDrill;
            }

            if ($scope.chartFilters) {
                angular.extend(filtersToBeApplied, $scope.CiscoUtilities.cleansedFilters($scope.appliedFilters), $scope.chartFilters,$scope.propInsightSliderFilter);
            } else {
                filtersToBeApplied = $scope.CiscoUtilities.cleansedFilters($scope.appliedFilters);
            }

            if (filtersToBeApplied.quarterId) {
                delete filtersToBeApplied.quarterId;
            }

            if ($scope.opportunitiesActive === "ciscoOne") {
                subArchitechture = $scope.pieActiveDrill;
            } else {
                subArchitechture = false;
                $scope.isDrs = true;
            }

            if(filtersToBeApplied && filtersToBeApplied.accounts){
                if(filtersToBeApplied.accounts.length > 1){
                    $scope.tilesAccounts = true;
                } else {
                    $scope.tilesAccounts = false;
                }
            }else{
                $scope.tilesAccounts = false;
            }
            opportunitiesServ.getCiscoOneMCR($scope.opportunitiesActive, filtersToBeApplied,  subArchitechture, addUpgradeValue).then(function(response) {
            //mcr Code , donot remove :- KD
                    $uibModal.open({
                        templateUrl: 'views/modal/create-estimate.html',
                        controller: 'CreateEstimateController',
                        size: 'xs'
                    });
                    $scope.chartFilters["customer"] = [];
                    var mcrResponse = {};
                    mcrResponse.payloadId = response.objectId;
                    mcrResponse.responseFormat = "XML/JSON";
                    var testerForm = angular.element('#ciscoReadyForm');
                    testerForm.find('.configUIRequest').val(JSON.stringify(mcrResponse));
                    testerForm.prop("action",'https://apps.cisco.com/cfgon/public/config/ConfigUIInterface/storage/ciscoReadyToMcr');
                    testerForm.submit();
            });

    };

        // Tooltip for 3rd chart - C1 MCR
        $scope.isLineItemTooltip = function(e) {
            if (e) {
                return e;
            }
        };
           // List/Net toggle
        $scope.netDisabled = false;

        if($scope.opportunitiesActive === 'ciscoOne') {
            $scope.netDisabled = true;
            $scope.isListOrNet = 'list';
        }
        else if(($scope.opportunitiesActive === 'drs')){
             $scope.isListOrNet = 'net';
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
        };

        var fillPCCategories = function(response, name) {
            response[2].categories = [];
            response[2].categories[1] = name + "'s Partners";
            response[2].categories[2] = name + "'s Customers";

            return response;
        };

        $rootScope.$on('customer-name',function(event,data){
            $scope.hoverIn(data);
        });

        $scope.hoverIn = function(customer){
              $scope.chartFilters["customer"] = customer.state;
               $scope.upgrade = false;
               $scope.addUpgrade = false;

               if(!customer.freq_2.upgradeLineItems && !customer.freq_2.addLineItems){
                    $scope.upgrade = true;
                    $scope.addUpgrade = true;
                    }
               if(!customer.freq_2.upgradeLineItems ){
                        $scope.upgrade = true;

                }

            if((customer.freq_2.addLineItems + customer.freq_2.upgradeLineItems) > 5000){
                       $scope.addUpgrade = true;

            }
            if(customer.freq_2.upgradeLineItems > 5000){
                $scope.upgrade = true;
            }
        };

        $scope.showMcrTable = function(c) {
            var title = c.title;
        if (c.categories) {
            var activeC = c.activeCategory;
            if (activeC) {
                title = c.categories[activeC];
            }
        };

        var isCustomer = title.toLowerCase().indexOf("customer") > -1;
            if($scope.opportunitiesActive === "ciscoOne" && $scope.pieActiveDrill && $scope.accounts.length >= 1 && isCustomer){
                return true;
            }
            return false;
        };

        $scope.$on('$destroy', function() {
            campActiveDrillWatch();
            campAreaWatch();
            refreshAllDataEvent();
        });
    }
]);
