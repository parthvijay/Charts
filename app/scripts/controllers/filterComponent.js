(function (angular) {
    'use strict';
    FilterDetailController.$inject = ['FiltersServ',
        'ShareDataServ',
        'UserServ',
        '$rootScope',
        '$timeout',
        '$http',
        '$routeParams',
        '$filter',
        '$sessionStorage',
        '$scope',
        'BookMarkData',
        '$location',
        'GlobalBookmarkServ',
        '$q',
        'CiscoUtilities',
        '$uibModal'
    ];
    /* @ngInject */
    function FilterDetailController(filtersServ, ShareDataServ, UserServ, $rootScope, $timeout, $http, $routeParams, $filter, $sessionStorage, $scope, BookMarkData, $location, GlobalBookmarkServ, $q, CiscoUtilities, $uibModal) {

        var vm = this;
        //$scope.filtersServ = filtersServ;
        vm.isPidUpload = false;
        vm.sales = {};
        vm.filtersChecked = 0;
        vm.salesLevel = [];
        vm.accounts = [];
        vm.appliedFilters = [];
        vm.filters = [];
        vm.userInfo = {};
        vm.lockSalesFilter = {};
        vm.changeAccountManager = false;
        vm.propInsightSliderFilter = {};
        vm.month = '';
        vm.rangeFrom = '';
        vm.rangeTo = '';
        vm.propensityToTSAttach = {};
        vm.propensityToTSAttach = {};
        vm.isTsAttachFilter = false;
        vm.isBookmarkActive = GlobalBookmarkServ.isBookmarkActive;
        vm.isCollabBookmarkActive = GlobalBookmarkServ.isCollabBookmarkActive;
        vm.cmngFrmBookMark = false;
        filtersServ.isFromBookmark = false;
        vm.partnerFilterObj = {};
        vm.contractNameFilterObj = {};
        vm.contractNameFilterChange = {};
        var selectedSAVForSalesLevel = [];
        var selectedServiceSO = [];
        var isSavClicked = false;
        var applyButtonClicked = false;
        var isClearAllClicked = false;
        vm.isSavSearch = false;
        vm.isPartnerSearch = false;
        vm.tempAdvancedFilterObj = {};
        vm.tempSavEmptyFlag = true;
        $scope.propAttachCount = 0;
        $scope.propRefreshCount = 0;
        $scope.activeSubTab = CiscoUtilities.getSubTab();
        // $scope.partnerLoaded = false;
        //code added for counter in insight Filters -G
        vm.isSecurityRefresh = false;
        vm.isCollaborationRefresh = false;
        vm.isSecondChance = false;
        var architectureSelected = []; // to take the backup of architecture and its dependent filter
        $scope.insightsTabTouched = false;
        filtersServ.uploadedPIDData = null;
        filtersServ.uploadedPIDCount = 0;
        vm.filtersServ = filtersServ;
        filtersServ.globalView = false;
        if (vm.isBookmarkActive()) {
            filtersServ.isFromBookmark = true;
        }
        if (filtersServ.copyBookmark) {
            filtersServ.isFromBookmark = true;
        }
        vm.checkSalesSelected = [false, false, false, false, false, false, false];
        vm.checkAccountSelected = [false, false, false, false, false, false, false, false];
        showShadow();
        $('.sidebar-nav').scroll(showShadow);

        $scope.showDataSetFilters = function (c) {
            if (c.title === "Product" || c.title === "Dates" || c.title === "Status" || c.title === "Account" || c.title === "Services") {
                return filtersServ.disablePDS;
            } else {
                return !filtersServ.showDataSetFilters && c && c.type === 'dataset';
            }
        };

        $scope.disableSweep = function (filter) {
            var tab = filtersServ.opportunitiesActive;
            var subTab = filtersServ.opportunitiesView;
            if (filter.toLowerCase() === 'sweeps contracts' &&
                (tab !== 'renew' ||
                    (tab === 'renew' && subTab !== 'opportunities'))) {
                return true;
            }
            return false;
        }


        $scope.sidebarActiveToggle = function () {
            vm.sidebarActiveToggle();
        };

        $scope.getData = function () {
            vm.getData();
        };

        $http.get("config/filters.json", {}).then(function (d) {
            vm.advancedFilters = d.data;
            for (var a = 0; a < vm.advancedFilters[4].categories.length; a++) {
                vm.advancedFilters[4].categories[a].isRangeFrom = false;
                vm.advancedFilters[4].categories[a].isRangeTo = false;
                vm.advancedFilters[4].categories[a].isPeriod = false;
            }


            inititaiteAccessFilters();
        });

        var inititaiteAccessFilters = function () {
            vm.userInfo = UserServ.data;
            var i;
            if (vm.userInfo.salesLevel > 1 && !filtersServ.globalView) {
                i = vm.userInfo.salesLevel - 1;
            } else {
                i = 0;
            }
            vm.salesLevelInit().then(function () {
                //On Copy Url bookmark we are making this check as false for displaying message
                vm.messageCheck = false;
                angular.forEach(vm.advancedFilters, function (filter) {
                    //do not remove the code this is to optimize the calls
                    if (filter.title === "Account" || filter.title === "Product" || filter.title === "Services") {
                        //do nothing
                    } else {
                        vm.getFiltersDropdown(filter, i);
                        i = 0;
                    }

                })
                vm.applyFilters();
                vm.sales.active = true;

            });
        }
        // disable apply button on load for subscription tabs based on filter selection in subtabs and enable after selecting filters.
        vm.isApplyEnabled = function(){
            if ((vm.filtersServ.opportunitiesActive !== 'subscription' && !vm.filtersChecked && !vm.filterToController.appliedFiltersCount) 
                || (vm.filtersServ.opportunitiesActive === 'subscription' && ['security','collaboration'].includes(CiscoUtilities.getSubTab()) && vm.filtersChecked <= 2 && vm.filterToController.appliedFiltersCount <= 2)
                || (vm.filtersServ.opportunitiesActive === 'subscription' && CiscoUtilities.getSubTab() === 'other' && vm.filtersChecked <= 1 && vm.filterToController.appliedFiltersCount <= 1) 
                || vm.isAnyDateError()){
                return true;
            } else {
                return false;
            }
        }

        vm.$onChanges = function (changesObj) {
            if (!filtersServ.isFromBookmark) {
                filtersServ.globalView = changesObj.name.currentValue;
                if (angular.isDefined(changesObj.name.currentValue)) {
                    //This is to set the model for the Global vs Sav view slider
                    $rootScope.$broadcast('cmngFrmBookMark', filtersServ.globalView);
                    vm.partnerFilterObj = {}; // DE183576
                    vm.contractNameFilterObj = {}; // clearing contract no.and partner name filter obj. while taggling from sav to gu and vice versa
                    if (changesObj.name.currentValue) {
                        $http.get("config/filters.json", {}).then(function (d) {
                            vm.advancedFilters[0] = d.data[0];
                            vm.getFiltersDropdown(vm.advancedFilters[0], 0);
                            vm.advancedFilters[1] = d.data[1];
                            vm.applyFilters();
                            setSessionFilters();
                        })

                    } else {
                        $http.get("config/filters.json", {}).then(function (d) {
                            vm.advancedFilters[0] = angular.copy(d.data[0]);
                            vm.advancedFilters[1] = angular.copy(d.data[1]);
                            $sessionStorage.remove('appliedFilters');
                            $sessionStorage.remove('advancedFilters');
                            inititaiteAccessFilters();
                            vm.applyFilters();
                            setSessionFilters();
                            selectedSAVForSalesLevel = [];
                            selectedServiceSO = [];
                        })
                    }

                }
                filtersServ.isFromBookmark = false;
            }
            //     $scope.drillToNextSalesLevel(changesObj.selectedsales.currentValue);

        }

        var setSessionFilters = function () {
            $sessionStorage.advancedFilters = JSON.stringify(vm.advancedFilters);
            $sessionStorage.put('advancedFilters', JSON.stringify(vm.advancedFilters));
            $sessionStorage.put('filters', JSON.stringify(vm.appliedFilters));
        }

        //Changes for disabling period field for collab bookmarks
        vm.disablePeriodForCollabBkmrk = function (filtr) {
            if (filtr.isPeriod === true && filtr.title === 'LDoS Date') {
                return {
                    "pointer-events": "none",
                    "cursor": "not-allowed"
                }
            }
        }

        vm.getFiltersCount = function (filters) {
            vm.filtersChecked = 0;
            vm.filtersChecked = $scope.propAttachCount + $scope.propRefreshCount;
            for (var j = 0; j < filters.length; j++) {
                if (filters[j].title == 'Dates') {
                    if (filtersServ.opportunitiesActive !== 'as') { // not to show the applied filters count other than sales level in AS Renew
                        filters[j].categories.forEach(function (v, k) {
                            var pos = v.month;
                            var rF = v.rangeFrom;
                            var rT = v.rangeTo;
                            var per = v.selected; // deselecting the period was not working
                            //Changes for enabling fixed date
                            var fixDate = v.fixedDate;
                            var relDate = v.relativeDate;
                            if (v.dates !== 'fixedDate') {
                                if (rT && rF && !isNaN(rF) && !isNaN(rT) && parseInt(rT) >= parseInt(rF) && per && (v.rangeFrom !== '-0') && (v.rangeTo !== '-0')) {
                                    vm.filtersChecked += 1;
                                }
                            } else {
                                if (fixDate && relDate) {
                                    vm.filtersChecked += 1;
                                }
                            }
                        });
                    }
                } else if (filters[j].title == 'Sales') {
                    if (filters[j].selected && filters[j].selected.length > 0) {
                        for (var k = 0; k < filters[j].selected.length; k++) {
                            if (filters[j].selected[k] && filters[j].selected[k].length > 0) {
                                vm.filtersChecked += 1;
                            }
                        }
                    }
                } else if (filters[j].title === 'Status') {
                    if (filtersServ.opportunitiesActive !== 'as') { // not to show the applied filters count other than sales level in AS Renew
                        if (filters[j].categories && filters[j].categories.length > 0) {
                            for (var k = 0; k < filters[j].categories.length; k++) {
                                if (filters[j].categories[k].title !== "SWEEPs Contracts") {
                                    if (filters[j].categories[k].selected !== "All") {
                                        vm.filtersChecked += 1;
                                    }
                                } else {
                                    if (filters[j].categories[k].selected !== "No") {
                                        if (!$scope.disableSweep(filters[j].categories[k].title)) {
                                            vm.filtersChecked += 1;
                                        }

                                    }
                                }
                            }
                        }
                    }
                } else if (filters[j].title === 'Dataset') {
                    if (filtersServ.opportunitiesActive !== 'as') { // not to show the applied filters count other than sales level in AS Renew
                        if ($scope.checkDataSet(filters[j].categories)) {
                            for (var k = 0; k < filters[j].categories.length; k++) {
                                if ((filters[j].categories[k].years.from !== filters[j].categories[k].default_years.from || filters[j].categories[k].years.to !== filters[j].categories[k].default_years.to) && filters[j].categories[k].years.from !== "0000" && filters[j].categories[k].years.to !== "0000" && filters[j].categories[k].years.from > "1995" && filters[j].categories[k].years.to < (new Date()).getFullYear() + 2 && filters[j].categories[k].years.from <= filters[j].categories[k].years.to) {
                                    //to decrement the count if dataset filters are applied in TAV and moved to Refresh/subscription where dataset filters is not present
                                    if (filtersServ.showDataSetFilters) {
                                        vm.filtersChecked += 1;
                                    }
                                }
                            }
                        }
                    }
                } else {
                    if (filtersServ.opportunitiesActive !== 'as') { // not to show the applied filters count other than sales level in AS Renew
                        if (filters[j].selected && filters[j].selected.length > 0) {
                            for (var k = filters[j].selected.length - 1; k >= 0; k--) {
                                if (filters[j].selected[k] && filters[j].selected[k].length > 0) {
                                    vm.filtersChecked += 1;
                                }
                            }
                        }
                    }
                }
            }
            var defaultPropToRefresh = ["Unlikely", "Low", "Medium", "High", "Very Likely"];
            var defaultPropToAttach = JSON.stringify({
                "maxValue": 100,
                "minValue": 0
            });
            var countInsight = 0;
            if (vm.appliedFilters !== undefined) {
                for (var b = 0; b < vm.appliedFilters.length; b++) {
                    if (vm.appliedFilters[b].title === 'propensity') {
                        var latestPropensityRefresh = vm.appliedFilters[b].refresh;
                        if (JSON.stringify(latestPropensityRefresh) !== JSON.stringify(defaultPropToRefresh)) {
                            countInsight++;
                        }
                    }
                    if (vm.appliedFilters[b].title === 'attachPropensity') {
                        var latestPropensityAttach = JSON.stringify({
                            "maxValue": vm.appliedFilters[b].maxValue,
                            "minValue": vm.appliedFilters[b].minValue
                        });
                        if (latestPropensityAttach !== defaultPropToAttach) {
                            countInsight++;
                        }
                    }
                }
            }
            if (vm.filtersChecked >= 2) {
                vm.filtersChecked -= countInsight;
            } else if (vm.filtersChecked >= 0 && vm.filtersChecked < 2 && countInsight) {
                vm.filtersChecked = 0;
            }
            for (var a = 0; a < vm.appliedFilters.length; a++) {
                if (vm.appliedFilters[a].title === 'propensity') {
                    if (vm.showRefreshInsightFilter) {
                        if (JSON.stringify(defaultPropToRefresh) !== JSON.stringify(vm.appliedFilters[a].refresh)) {
                            vm.filtersChecked += 1;
                        }
                    }
                } else if (vm.appliedFilters[a].title === 'attachPropensity') {
                    if (vm.showTSAttachInsightFilter) {
                        if (defaultPropToAttach !== JSON.stringify({
                                "maxValue": vm.appliedFilters[a].maxValue,
                                "minValue": vm.appliedFilters[a].minValue
                            })) {
                            vm.filtersChecked += 1;
                        }
                    }
                }

            }
            //$scope.$emit('CountOnTab',vm.filtersChecked) 
            //for asset veiw in case of territory coverage filter 
            if (filtersServ.disableTerritoryCoverage) {
                if (angular.isDefined(vm.advancedFilters[1].selected[7]) && vm.advancedFilters[1].selected[7] !== null) {
                    if (vm.advancedFilters[1].selected[7].length > 0) {
                        --vm.filtersChecked;
                    }
                }
            }
            // if(angular.isDefined(vm.advancedFilters[2].selected[6]) && vm.advancedFilters[2].selected[6] !== null){
            //         if(vm.advancedFilters[2].selected[6].length > 0){
            //             --vm.filtersChecked;
            //         }
            // }

        }


        $scope.$on('opportunity-active-change', function (data, event) {
            if (angular.isDefined(event.oppotunityActive)) {
                var opportunityActive = event.oppotunityActive;
                var subOpportunityActive = event.subOppotunityActive;
                //taking the backup of selected filters and its status in other tabs, beforclicking on the subscription tab
                if (opportunityActive === 'subscription' && !event.isSubTab) {
                    architectureSelected = angular.copy(vm.advancedFilters[2]);
                }

                //clearing the architecture and its dependent filters when navigated to Subscription tab from any other tabs
                if (opportunityActive === 'subscription') {
                    for (var i = 1; i < 4; i++) {
                        if (angular.isDefined(vm.advancedFilters[2].levels)) {
                            vm.advancedFilters[2].levels[i] = [];
                        }
                        if (angular.isDefined(vm.advancedFilters[2].selected)) {
                            vm.advancedFilters[2].selected[i] = [];
                        }
                    }
                    //function where the fiters are set based the subscription tabs
                    vm.advancedFilters[2] = resetFiltersForSubscription(vm.advancedFilters[2]);
                    if (subOpportunityActive === 'security') {
                        vm.advancedFilters[2].selected[0].push("Security");
                    } else if (subOpportunityActive === 'collaboration') {
                        vm.advancedFilters[2].selected[0].push("Collaboration");
                    } else if (subOpportunityActive === "other") {
                        vm.advancedFilters[2].disabled[0] = false;
                    }
                    //there is no necessity to make a call to get sub arch filter values when navigating to other tab. this was breaking when applied few extra filters in collaboration tab and clear those and navigate to other tab under subscription
                    if(subOpportunityActive !== "other"){
                        vm.getFiltersDropdown(vm.advancedFilters[2], 1);
                    }
                } else {
                    //Resetting the architecture and its dependent filters if any applied in tabs other than subscription, when navigated from Subscrition tab
                    if (angular.isDefined(vm.advancedFilters[2].selected) && angular.isDefined(vm.advancedFilters[2].disabled)) {
                        //to check if the arch and its dependent filters are dropped only when we move from subscription to any other tabs
                        if ((CiscoUtilities.getSubTab() === "other" && vm.advancedFilters[2].disabled[7] === true) || (angular.isDefined(vm.advancedFilters[2].selected[0]) && (vm.advancedFilters[2].selected[0][0] === 'Security' || vm.advancedFilters[2].selected[0][0] === 'Collaboration')) && (angular.isDefined(vm.advancedFilters[2].disabled[0]) && vm.advancedFilters[2].disabled[0] === true) && !vm.isCollabBookmarkActive()) {
                            for (var a = 0; a < 4; a++) {
                                if (a === 0) {
                                    if (angular.isDefined(architectureSelected.levels)) {
                                        if (angular.isDefined(architectureSelected.levels[a])) {
                                            architectureSelected.selected[a] = [];
                                        }
                                    }
                                } else {
                                    if (angular.isDefined(architectureSelected.levels)) {
                                        if (angular.isDefined(architectureSelected.levels[a])) {
                                            architectureSelected.levels[a] = [];
                                            architectureSelected.selected[a] = [];
                                        }
                                    }
                                }
                            }
                            //asset type filter was not clearing when navigated to subscription -> collab and to Renew tab.
                            if (angular.isDefined(architectureSelected.selected)) {
                                architectureSelected.selected[7] = [];
                            }
                            //was retaining the architecture's dependent filters that are applied in subscription tab, when navigated to other tabs
                            if (architectureSelected.length !== 0) {
                                vm.advancedFilters[2] = angular.copy(architectureSelected);
                            }
                        }
                    }
                    // when applied few product filters in tabs other than subscription and click on clear all after naviagting to subscription tab and again come back to some other tab, then it was retaining the previously selected filters. "isClearAllClicked" indicates if clear all is clicked or not
                    if (!isClearAllClicked && angular.isDefined(architectureSelected.levels) && architectureSelected.length !== 0) {
                        //retaining the independent product filters that are applied in subscription tabs in other tabs also
                        for (var k = 4; k < 7; k++) {
                            architectureSelected.selected[k] = angular.copy(vm.advancedFilters[2].selected[k]);
                        }
                        vm.advancedFilters[2] = angular.copy(architectureSelected);
                    }
                    //on clicking on some subscriptions bookmark and navigating to any other tabs, then we have no data stored in architectureSelected. In that case, we will try to set only the architecture and filters dependent on it
                    if (!isClearAllClicked && architectureSelected.length === 0) {
                        //Subscription & Security filters are retained when switched from Subscription to TAV
                        if (angular.isDefined(vm.advancedFilters[2].selected) && angular.isDefined(vm.advancedFilters[2].disabled)) {
                            //to make sure if the arch and its dependent filters are dropped only when we move from subscription to any other tabs and not when it is a collab bokkmark
                            if ((CiscoUtilities.getSubTab() === "other" && vm.advancedFilters[2].disabled) || (angular.isDefined(vm.advancedFilters[2].selected[0]) && (vm.advancedFilters[2].selected[0][0] === 'Security' || vm.advancedFilters[2].selected[0][0] === 'Collaboration')) && (angular.isDefined(vm.advancedFilters[2].disabled[0]) && vm.advancedFilters[2].disabled[0] === true) && !vm.isCollabBookmarkActive()) {
                                if (angular.isDefined(vm.advancedFilters[2].selected)) {
                                    vm.advancedFilters[2].selected[0] = [];
                                    vm.advancedFilters[2].selected[7] = [];
                                }
                                for (var i = 1; i < 4; i++) {
                                    if (angular.isDefined(vm.advancedFilters[2].levels)) {
                                        vm.advancedFilters[2].levels[i] = [];
                                    }
                                    if (angular.isDefined(vm.advancedFilters[2].selected)) {
                                        vm.advancedFilters[2].selected[i] = [];
                                    }
                                }
                            }
                        }
                    }
                    //clearing the architecture and asset filter when clicked on clear all and navigated to any other tabs and not when it is a collab bookmark
                    if (isClearAllClicked) {
                        if (angular.isDefined(vm.advancedFilters[2].selected) && angular.isDefined(vm.advancedFilters[2].disabled)) {
                            //to make sure if the arch and its dependent filters are dropped only when we move from subscription to any other tabs and not when it is a collab bokkmark
                            if ((CiscoUtilities.getSubTab() === "other" && vm.advancedFilters[2].disabled) || (angular.isDefined(vm.advancedFilters[2].selected[0]) && (vm.advancedFilters[2].selected[0][0] === 'Security' || vm.advancedFilters[2].selected[0][0] === 'Collaboration')) && (angular.isDefined(vm.advancedFilters[2].disabled[0]) && vm.advancedFilters[2].disabled[0] === true) && !vm.isCollabBookmarkActive()) {
                                if (angular.isDefined(vm.advancedFilters[2].selected)) {
                                    vm.advancedFilters[2].selected[0] = [];
                                    vm.advancedFilters[2].selected[7] = [];
                                    isClearAllClicked = false;
                                }
                            }
                        }
                    }
                    //not to enable the filters when it is a collab bokkmark
                    if (!vm.isCollabBookmarkActive()) {
                        vm.advancedFilters["2"].disabled = [];
                        vm.advancedFilters["2"].disabled[0] = false;
                        vm.advancedFilters["2"].disabled[7] = false;
                    }
                    if (angular.isDefined(vm.advancedFilters[2].selected) && angular.isDefined(vm.advancedFilters[2].selected[0])) {
                        if (vm.advancedFilters[2].selected[0].length === 0) {
                            vm.advancedFilters[2].levels[1] = [];
                            vm.advancedFilters[2].selected[1] = [];
                        }
                    }
                }
                vm.applyFilters();
            }
            vm.showRefreshInsightFilter = event.showRefreshInsightFilter;
            vm.showTSAttachInsightFilter = event.showTSAttachInsightFilter;
            vm.getFiltersCount(vm.advancedFilters);
            //Check if propensity filters are defined when we change tab and update isFilterApplied to broadcast new count
            $scope.$emit('CountOnTab', vm.filtersChecked);
        });
        vm.getFiltersDropdown = function (c, i, autoload, changeEvent) {
            var auto = typeof autoload === 'undefined' ? false : autoload;
            var slug = c.slug;
            var accounManager;
            var advancedSalesFilterValues = [];
            var countryValues = [];
            var segmentValues = [];
            var orgFilterValues = [];
            var savmFilterValues = [];
            var warrantyValues = [];
            var productTypeValues = [];
            /*vm.filtersChecked = 0; 
            vm.filtersChecked = $scope.propAttachCount+$scope.propRefreshCount;*/
            if (!(c.slug === "account" && i === 5)) {
                vm.isPartnerSearch = false;
            }
            if (!(c.slug === "account" && i === 1)) {
                vm.isSavSearch = false;
            }
            if (c.title !== "Dates") { //was clearing all sales level filter on selecting Ldos filter under dates.
                var currentFilter = $filter('filter')(vm.advancedFilters, {
                    slug: slug
                })[0];
                if (i === 6 && currentFilter.selected.length < 6) {
                    var current_level = i - 2;
                } else {
                    var current_level = i - 1;
                }
                var selected = currentFilter.selected[current_level] ? currentFilter.selected[current_level] : '';

                if (changeEvent === 'change') {
                    if (slug === 'product') {
                        for (var f = i; f <= 3; f++) {
                            if (currentFilter.selected[f] && currentFilter.selected[f].length > 0) {
                                vm.filtersChecked -= 1;
                            }
                            currentFilter.levels[f] = [];
                            currentFilter.selected[f] = [];
                        }
                    } else if (slug === 'account') {
                        for (var f = i; f <= 2; f++) {
                            currentFilter.levels[f] = [];
                            currentFilter.selected[f] = [];
                        }
                    } else {
                        currentFilter.levels.length = i;
                        currentFilter.selected.length = i;
                    }
                }
                // waas throwing an error when applied few filters in subscription -> collaboration tab and cleared those filters and navigate to other tab as currentFilter.selected[4] and currentFilter.selected[0] in this case was null
                if (selected.length || i === 0 || auto || (angular.isDefined(currentFilter.selected[4]) && currentFilter.selected[4] !== null && currentFilter.selected[4].length !== 0 && angular.isDefined(currentFilter.selected[0]) && currentFilter.selected[0] !== null && currentFilter.selected[0].length !== 0)) {

                    if (vm.advancedFilters[0].selected.length > 6 && c.slug === 'sales' && i >= 6) {
                        accounManager = selected;
                        // vm.advancedFilters[0].selected[5] = [];
                        if (vm.advancedFilters[0].selected[5] != undefined && vm.advancedFilters[0].selected[5].length > 0) {
                            var config = vm.advancedFilters[0].selected[5];
                        } else if (current_level === 6 && accounManager.length === 0) { //selection and deselection of account manager was displaying sav account filter
                            var config = null;
                        } else {
                            var config = vm.advancedFilters[0].selected[4];
                        }
                    } else if ((angular.isDefined(currentFilter.selected[0]) || angular.isDefined(currentFilter.selected[1])) && c.slug === 'product') {

                        var config = selected;
                    } else if (angular.isDefined(currentFilter.selected[4]) && (currentFilter.levels.length === 6 && i >= 4)) {
                        if (angular.isDefined(currentFilter.selected[5]) && currentFilter.selected[5].length !== 0) {
                            var config = currentFilter.selected[5];
                        } else {
                            var config = currentFilter.selected[4];
                        }
                    } else {
                        var config = selected;
                    }
                    // if(progressive === true){
                    //     var config = selected;
                    // }
                    if (currentFilter.slug === "account" && i === 1) {
                        var config = selected;
                    }
                    if (vm.advancedFilters[0].levels.length === 0) {
                        vm.advancedFilters[0].levels[0] = [];
                    }
                    if (c.slug === "account" && angular.isDefined(vm.advancedFilters[1].selected[1])) {
                        vm.installSiteNodeName = [];
                        if (vm.advancedFilters[0].selected[5] != undefined && vm.advancedFilters[0].selected[5].length > 0) {
                            vm.installSiteNodeName = vm.advancedFilters[0].selected[5];
                        } else {
                            vm.installSiteNodeName.push(vm.advancedFilters[0].selected[4]);
                        }
                    }
                    //Checking slug and i to make sure this triggers only in case of Sav Account
                    if (slug === 'account' && i === 2 && vm.tempSavEmptyFlag) {
                        if (vm.advancedFilters[1].selected && vm.advancedFilters[1].selected[1].length < 2) {
                            vm.tempAdvancedFilterObj = angular.copy(vm.advancedFilters);
                            vm.tempSavEmptyFlag = false;
                        }
                    }
                    filtersServ.getDropdown(config, i + 1, slug, accounManager, vm.installSiteNodeName, currentFilter).then(function (response) {
                        // var slug = response.config.slug;
                        var level = i;
                        var responseKey = [];
                        if (level === 7 && slug === 'sales') {
                            slug = 'account';
                            level = 0;
                        }
                        var currentFilter = $filter('filter')(vm.advancedFilters, {
                            slug: slug
                        })[0];
                        if (response.length > 2) {
                            for (var j = 0; j < response.length; j++) {
                                responseKey.push(Object.keys(response[j]));
                            }
                            if (responseKey[0][0] === 'country') {
                                angular.forEach(response[0].country, function (keys, country) {
                                    countryValues.push({
                                        "keys": country
                                    });
                                })
                                currentFilter.levels[3] = countryValues;
                                vm.advancedFilters[1].levels[3] = countryValues;
                            }
                            if (responseKey[1][0] === 'segment') {
                                angular.forEach(response[1].segment, function (keys, segment) {
                                    segmentValues.push({
                                        "keys": segment
                                    });
                                })
                                currentFilter.levels[4] = segmentValues;
                                vm.advancedFilters[1].levels[4] = segmentValues;
                            }
                            if (responseKey[2][0] === 'org') {
                                angular.forEach(response[2].org, function (keys, org) {
                                    orgFilterValues.push({
                                        "keys": keys[0]
                                    });
                                })
                                currentFilter.levels[7] = orgFilterValues;
                                vm.advancedFilters[1].levels[7] = orgFilterValues;
                            }
                            if (responseKey[0][0] === 'savmFilter') {
                                angular.forEach(response[0].savmFilter, function (keys, savmFilter) {
                                    savmFilterValues.push({
                                        "keys": savmFilter
                                    });
                                })
                                currentFilter.levels[0] = savmFilterValues;
                                vm.advancedFilters[2].levels[0] = savmFilterValues;
                                if (vm.isSecurityRefresh && c.title === "Product") {
                                    // Disabling the architecture filter and freezing the architecture to security under security refresh page
                                    vm.advancedFilters[2].selected[0] = [];
                                    vm.advancedFilters[2].selected[0].push("Security");
                                    vm.getFiltersDropdown(vm.advancedFilters[2], 1);
                                }
                                if (vm.isCollaborationRefresh && c.title === "Product") {
                                    vm.advancedFilters[2].selected[0] = [];
                                    vm.advancedFilters[2].selected[0].push("Collaboration");
                                    vm.getFiltersDropdown(vm.advancedFilters[2], 1);
                                }
                                //disabling the architecture filter and getting the corresponding sub architectures for subscription tabs
                                $scope.activeSubTab = CiscoUtilities.getSubTab();
                                if (["security", "collaboration", "other"].includes($scope.activeSubTab) && c.title === "Product") {
                                    vm.advancedFilters[2].selected[0] = [];
                                    vm.advancedFilters[2].selected[7] = []; // was showing subscription more than one time in view applied when applied some sub arch filter
                                    vm.advancedFilters[2].selected[7].push("Subscription - T&C", "Subscription - SaaS");
                                    if ($scope.activeSubTab === 'security' && c.title === "Product") {
                                        vm.advancedFilters[2].selected[0].push("Security");
                                    }
                                    if ($scope.activeSubTab === 'collaboration' && c.title === "Product") {
                                        vm.advancedFilters[2].selected[0].push("Collaboration");
                                    }
                                    vm.getFiltersDropdown(vm.advancedFilters[2], 1);
                                }
                            }
                            if (responseKey[1][0] === 'warranty') {
                                angular.forEach(response[1].warranty, function (keys, warranty) {
                                    warrantyValues.push({
                                        "keys": warranty
                                    });
                                })
                                currentFilter.levels[5] = warrantyValues;
                                vm.advancedFilters[2].levels[5] = warrantyValues;
                            }
                            if (responseKey[2][0] === 'productType') {
                                angular.forEach(response[2].productType, function (keys, productType) {
                                    productTypeValues.push({
                                        "keys": productType
                                    });
                                })
                                currentFilter.levels[4] = productTypeValues;
                                vm.advancedFilters[2].levels[4] = productTypeValues;
                            }
                        } else {
                            if (slug == 'account' && level === 2) {
                                if ((angular.isDefined(vm.advancedFilters[1].selected[1]) && vm.advancedFilters[1].selected[1].length > 0) && (angular.isDefined(vm.advancedFilters[1].selected[2]) && vm.advancedFilters[1].selected[2].length > 0)) {
                                    if (vm.instalSiteBackup) {
                                        vm.advancedFilters[1].levels[2] = vm.instalSiteBackup;
                                    }
                                } else if ((angular.isDefined(vm.advancedFilters[1].selected[1]) && vm.advancedFilters[1].selected[1].length > 0) && (angular.isDefined(vm.advancedFilters[1].selected[2]) && vm.advancedFilters[1].selected[2].length === 0)) {
                                    vm.advancedFilters[1].levels[2] = [{}];
                                }

                            } else {
                                if ((angular.isDefined(vm.advancedFilters[1].selected[1]) && vm.advancedFilters[1].selected[1] !== null && vm.advancedFilters[1].selected[1].length > 0) && (angular.isDefined(vm.advancedFilters[1].selected[2]) && vm.advancedFilters[1].selected[2] !== null && vm.advancedFilters[1].selected[2].length > 0)) {
                                    if (vm.instalSiteBackup) {
                                        vm.advancedFilters[1].levels[2] = vm.instalSiteBackup;
                                    }
                                } else if ((angular.isDefined(vm.advancedFilters[1].selected[1]) && vm.advancedFilters[1].selected[1] !== null && vm.advancedFilters[1].selected[1].length > 0) && (angular.isDefined(vm.advancedFilters[1].selected[2]) && vm.advancedFilters[1].selected[2] !== null && vm.advancedFilters[1].selected[2].length === 0)) {
                                    vm.advancedFilters[1].levels[2] = [{}];
                                }
                                angular.forEach(response, function (salesFilterResponse) {
                                    angular.forEach(salesFilterResponse, function (keys, salesFilterValues) {
                                        for (var i = 0; i < keys.length; i++) {
                                            if (level === 0) {
                                                advancedSalesFilterValues.push({
                                                    "keys": keys[i]
                                                });
                                            } else if (level === 6) {
                                                advancedSalesFilterValues.push({
                                                    "keys": keys[i]
                                                });
                                            } else {
                                                advancedSalesFilterValues.push({
                                                    "keys": keys[i],
                                                    "parent": salesFilterValues
                                                });
                                            }
                                        }
                                    })
                                })
                                if (i === 0 && slug === 'sales') {
                                    vm.sales1Backup = advancedSalesFilterValues;
                                }
                            }

                            //
                            if (currentFilter.levels_name[i] === "Product Family" || currentFilter.levels_name[i] === "Product ID") {

                                retainSearchPopulation(advancedSalesFilterValues, currentFilter, i)
                            } else {
                                if (slug === 'services') {

                                } else {
                                    currentFilter.levels[level] = advancedSalesFilterValues;
                                }
                            }


                        }
                        if (level === 5 && slug === 'sales') {
                            vm.getFiltersDropdown({
                                slug: slug,
                                progressive: true
                            }, 6, true);
                        }

                        //condition for loading next level selected filters without making an api call
                        if (slug === 'sales' || slug === 'product') {
                            currentFilter.full_levels[i] = angular.copy(currentFilter.levels[i]);
                            getRetainSelectedFilters();
                            checkDependentFilters(slug);
                            //Architecture filter was resetted to empty when product filter is not expand. As a result if we switch to subscription-> security and try to apply sales level filters without expanding product filter, chart legends was giving all the subarchitecture values
                            resetSubscriptionFilters();
                            var dropdown = angular.element(document.querySelector('.nya-bs-select.check-in.open'));
                            if (dropdown[0]) {
                                var title = dropdown[0].dataset.title;
                                $timeout(function () {
                                    var attr = '[data-title=' + '"' + title + '"' + ']';
                                    angular.element(document.querySelector(attr)).addClass('open');

                                });
                            }

                        }
                        if (slug === 'account') {
                            currentFilter.full_levels[i] = angular.copy(currentFilter.levels[i]);
                            var dropdown = angular.element(document.querySelector('.nya-bs-select.check-in.open'));
                            if (dropdown[0]) {
                                var title = dropdown[0].dataset.title;
                                $timeout(function () {
                                    var attr = '[data-title=' + '"' + title + '"' + ']';
                                    angular.element(document.querySelector(attr)).addClass('open');

                                });
                            }
                        }

                    });
                } else if (selected.length === 0 && i === 2 && currentFilter.slug === "account" && vm.tempAdvancedFilterObj) {
                    vm.tempAdvancedFilterObj[1].levels = vm.advancedFilters[1].levels;
                    vm.tempAdvancedFilterObj[1].selected = vm.advancedFilters[1].selected;
                    vm.advancedFilters = angular.copy(vm.tempAdvancedFilterObj);
                    vm.tempSavEmptyFlag = true;
                    for (var y = 0; y < 6; y++) {
                        vm.advancedFilters[0].API_call[y] = false;
                    }
                    vm.getFiltersDropdown(vm.advancedFilters[0], vm.advancedFilters[0].selected.length, true);
                } else if (selected.length === 0 && i === 1 && currentFilter.slug === "sales") {
                    vm.advancedFilters[0].levels[0] = vm.sales1Backup;
                }
            }
            vm.getFiltersCount(vm.advancedFilters);
            setPartnerFilterObj(c, i);
            setServiceFilterObj(c, i);


            //placing a call after we get all the values from other filters
            //changing logic for DE144871 no call should happen on when nothing is selected and you deselect
            if ((c.slug === "sales" || (c.slug === "account")) && (vm.advancedFilters && vm.advancedFilters[1].active)) {
                if (!(changeEvent === 'change')) {
                    $scope.filterPartnerSearch();
                    if (angular.isDefined(isSavClicked) && !isSavClicked) {
                        $scope.filterSavSearch(vm.advancedFilters[0].selected[6], vm.advancedFilters[1]);
                    }
                } else {
                    if (vm.advancedFilters[c.slug === "sales" ? 0 : 1].selected[i - 1] && vm.advancedFilters[c.slug === "sales" ? 0 : 1].selected[i - 1].length > 0) {
                        if (c.slug === "sales") {
                            vm.checkSalesSelected[i - 1] = true;
                            $scope.filterPartnerSearch();
                            $scope.filterSavSearch(vm.advancedFilters[0].selected[6], vm.advancedFilters[1]);
                        } else {
                            vm.checkAccountSelected[i - 1] = true;
                            vm.checkPartnerSavCall(i);
                        }

                    } else {
                        if (c.slug === "sales" && vm.checkSalesSelected[i - 1] == true) {
                            $scope.filterPartnerSearch();
                            $scope.filterSavSearch(vm.advancedFilters[0].selected[6], vm.advancedFilters[1]);
                            vm.checkSalesSelected[i - 1] = false;
                        }
                        if (c.slug === "account" && vm.checkAccountSelected[i - 1] == true) {
                            vm.checkPartnerSavCall(i);
                            vm.checkAccountSelected[i - 1] = false;
                        }

                    }
                }
            }

            vm.checkPartnerSavCall = function (i) {
                if (i === 3 || i === 2 || i === 0) {
                    $scope.filterPartnerSearch();
                    $scope.filterSavSearch(vm.advancedFilters[0].selected[6]);
                } else if (i === 1)
                    $scope.filterPartnerSearch();
                else if (i === 4)
                    $scope.filterSavSearch(vm.advancedFilters[0].selected[6]);
            }
            // Set to zero if filter count is negative- KD
            if (vm.filtersChecked < 0) {
                vm.filtersChecked = 0;
            }
        };

        $scope.resetYear = function (c) {
            c.categories[0].years = angular.copy(c.categories[0].default_years);
            c.categories[1].years = angular.copy(c.categories[1].default_years);
            vm.getFiltersDropdown(c, 1, undefined, "");
        };

        $scope.checkDataSet = function (d) {
            if (d[0].years.from.length === 4 && d[0].years.to.length === 4 && d[1].years.from.length === 4 && d[1].years.to.length === 4) {
                if ((d[0].years.from === "0000" || d[0].years.to === "0000") || (d[1].years.from === "0000" || d[1].years.to === "0000")) {
                    return false;
                } else {
                    return true;
                }
            } else {
                return false;
            }
        }

        var serviceFilterChange = $scope.$watch('vm.contractNameFilterChange', function (newVal, oldVal) {
            if (newVal !== oldVal) {
                vm.advancedFilters[3].API_call = [false, false];
            }
        }, true);

        var setServiceFilterObj = function (fromEvent, index) {
            if (fromEvent && fromEvent.slug && fromEvent.selected) {
                switch (fromEvent.slug) {
                    case "sales":
                        if (fromEvent.selected.length) {
                            for (var i = fromEvent.selected.length; i <= fromEvent.selected.length; i--) {
                                if (i < 0) {
                                    break;
                                }
                                if (i < 6) {
                                    if (fromEvent.selected[i]) {
                                        if (fromEvent.selected[i].length > 0) {
                                            vm.contractNameFilterObj["nodeName"] = fromEvent.selected[i];
                                            vm.contractNameFilterChange["nodeName"] = fromEvent.selected[i];
                                            break;
                                        }
                                    }
                                }
                            }
                        }
                        if (!vm.contractNameFilterObj.savmGroupName || vm.contractNameFilterObj.savmGroupName === '') {
                            vm.contractNameFilterObj["savmGroupName"] = "";
                            vm.contractNameFilterChange["savmGroupName"] = "";
                        }
                        break;
                    case "account":
                        vm.contractNameFilterObj["savmGroupName"] = fromEvent.selected[1];
                        vm.contractNameFilterObj["partnerName"] = fromEvent.selected[6];
                        vm.contractNameFilterObj["guName"] = fromEvent.selected[0];
                        vm.contractNameFilterChange["savmGroupName"] = fromEvent.selected[1];
                        vm.contractNameFilterChange["partnerName"] = fromEvent.selected[6];
                        break;
                    case "services":
                        if (fromEvent.selected) {
                            if (fromEvent.selected[0]) {
                                vm.contractNameFilterObj["contractType"] = fromEvent.selected[0];
                            }
                            if (fromEvent.selected[1]) { // After Deselecting & Removing Contract Number from searchbox we are sending empty array to REST. so added a check with length
                                vm.contractNameFilterObj["contractNumber"] = fromEvent.selected[1].length == 0 ? null : fromEvent.selected[1];
                            }
                            if (fromEvent.selected[2]) {
                                vm.contractNameFilterObj["soNumber"] = fromEvent.selected[2].length == 0 ? null : fromEvent.selected[2];
                            }
                        }

                        break;
                    default:
                        //do nothing
                        break;
                }
            }
            if (vm.advancedFilters["1"].selected.length > 1) {
                vm.contractNameFilterObj["savmGroupName"] = vm.advancedFilters["1"].selected["1"];
            }
            filtersServ.setServiceFilterPayload(vm.contractNameFilterObj);
        }

        vm.onServiceChange = function (c, index) {
            if (c.slug === 'services') {
                for (var i = index + 1; i <= c.selected.length; i++) {
                    c.API_call[i] = false;
                }
            }
        }

        var loadServiceDropDown = function (c, i) {
            var serviceFilterValues = [];
            filtersServ.getDropdown('', i + 1, "services").then(function (response) {
                angular.forEach(response.filter, function (keys, serviceFilter) {
                    serviceFilterValues.push({
                        "keys": serviceFilter
                    });
                })
                // Levels data was not getting updated with the selected values
                if (c && c.selected[i] && c.selected[i].length > 0) {
                    angular.forEach(c.selected[i], function (value) {
                        var flag = false;
                        for (var fil = 0; fil < serviceFilterValues.length; fil++) {
                            if (serviceFilterValues[fil].keys === value) {
                                flag = true;
                            } else {
                                // do nothing
                            }
                        }
                        if (!flag) {
                            serviceFilterValues.push({
                                "keys": value
                            });
                        }
                    });
                }
                if (serviceFilterValues.length === 0) {
                    serviceFilterValues.push({
                        "keys": "No Search Results"
                    });
                }
                vm.advancedFilters[3].levels[i] = serviceFilterValues;
                var dropdown = angular.element(document.querySelector('.nya-bs-select.check-in.open'));
                if (dropdown[0]) {
                    var title = dropdown[0].dataset.title;
                    $timeout(function () {
                        var attr = '[data-title=' + '"' + title + '"' + ']';
                        angular.element(document.querySelector(attr)).addClass('open');

                    });
                }
            });
        }

        vm.filterServiceSearch = function (c, index) {
            if (index === 0) {
                vm.contractNameFilterObj["contractTypeSearch"] = c.contractTypeSearch;
            } else if (index === 1) {
                vm.contractNameFilterObj["contractNumberSearch"] = c.contractNumSearch;
            } else {
                vm.contractNameFilterObj["serviceSOSearch"] = c.soNumSearch;
            }
            loadServiceDropDown(c, index);
        }

        var serviceFilters = function (c, i) {
            setServiceFilterObj(c, i);
            if (!c.API_call[i]) {
                loadServiceDropDown(c, i);
                c.API_call[i] = true;
            } else {
                if (i === 2) {
                    setPartnerFilterObj(c, i);
                    //removed unwanted code which was written to call partner, sav and sales api as soon as we select/deselect some Service SO
                }
            }
        }

        var populateFilters = function (c, i) {
            if (i === 0 && angular.isDefined(c.selected) && c.selected.length > 0) {
                if (((angular.isDefined(c.selected[2]) && c.selected[2].length === 0) || c.selected[2] === undefined) && (angular.isDefined(c.selected[0]) && c.selected[0].length > 0)) {
                    c.levels[2] = [{}];
                    c.API_call[2] = false;
                } else if (angular.isDefined(c.selected[0]) && c.selected[0].length === 0) {
                    c.levels[2] = [];
                }
            }
            if (!c.API_call[i]) {
                filtersServ.newFunctionFilter(vm.advancedFilters, c, i).then(function (response) {
                    c.levels[i] = [];
                    if (c.slug === 'account' && i === 2) {
                        angular.forEach(response.site, function (keys, instalSite) {
                            for (var x = 0; x < keys.length; x++) {
                                var name = {};
                                var location = {};
                                var temp = keys[x].replace(/\<\?\~\>/g, "<");
                                var len = temp.split("<")[0];
                            }
                            keys[x] = temp.split("<")[0];
                            name[x] = temp.split("<")[1];
                            location[x] = temp.split("<")[2];
                            c.levels[i].push({
                                "keys": keys[x],
                                "name": name[x],
                                "location": location[x]
                            });
                        })
                        vm.instalSiteBackup = c.levels[i];
                    }
                    // if(c.searchStr){
                    //     retainSearchPopulation(response, c, i);
                    //  }
                    else {
                        angular.forEach(response.filter, function (keys, value) {
                            c.levels[i].push({
                                "keys": value
                            });
                        })
                        //GU search was dropping previously selected GU's when a new search was made
                        var populatedFilters = angular.copy(c.levels[i]);
                        if (c && c.selected[i] && c.selected[i].length > 0) {
                            angular.forEach(c.selected[i], function (value) {
                                var flag = false;
                                for (var fil = 0; fil < populatedFilters.length; fil++) {
                                    if (populatedFilters[fil].keys === value) {
                                        flag = true;
                                    } else {
                                        // do nothing
                                    }
                                }
                                if (!flag) {
                                    populatedFilters.push({
                                        "keys": value
                                    });
                                }
                            });
                        }
                        c.levels[i] = angular.copy(populatedFilters);
                        if (c.levels[i].length === 0) {
                            c.levels[i].push({
                                "keys": "No Search Results"
                            });
                        }
                    }
                    var dropdown = angular.element(document.querySelector('.nya-bs-select.check-in.open'));
                    if (dropdown[0]) {
                        var title = dropdown[0].dataset.title;
                        $timeout(function () {
                            var attr = '[data-title=' + '"' + title + '"' + ']';
                            angular.element(document.querySelector(attr)).addClass('open');

                        });
                    }
                    vm.getFiltersCount(vm.advancedFilters);
                })
                c.API_call[i] = true;
            }

        }

        var populateSalesOnSav = function (c) {
            filtersServ.getDropdown(c.selected[1], 0, c.slug, undefined, undefined, undefined, vm.advancedFilters[3]).then(function (response) {
                for (var x = 0; x < 6; x++) {
                    vm.advancedFilters[0].API_call[x] = true;
                }
                if ((angular.isDefined(vm.advancedFilters[1].selected[1]) && vm.advancedFilters[1].selected[1].length > 0) && (angular.isDefined(vm.advancedFilters[1].selected[2]) && vm.advancedFilters[1].selected[2].length > 0)) {
                    if (vm.instalSiteBackup) {
                        vm.advancedFilters[1].levels[2] = vm.instalSiteBackup;
                    }
                } else if ((angular.isDefined(vm.advancedFilters[1].selected[1]) && vm.advancedFilters[1].selected[1].length > 0) && (angular.isDefined(vm.advancedFilters[1].selected[2]) && vm.advancedFilters[1].selected[2].length === 0)) {
                    vm.advancedFilters[1].levels[2] = [{}];
                }
                for (var y = 0; y < 6; y++) {
                    vm.advancedFilters[0].levels[y] = [];
                    vm.advancedFilters[0].selected[y] = [];
                }
                angular.forEach(response.sales1, function (keys, sale1) {
                    for (var b = 0; b < keys.length; b++) {
                        vm.advancedFilters[0].levels[0].push({
                            "keys": keys[b]
                        });
                        vm.advancedFilters[0].selected[0].push(keys[b]);
                        vm.filtersChecked += 1;
                    }
                })
                angular.forEach(response.sales2, function (keys, sale2) {
                    for (var c = 0; c < keys.length; c++) {
                        vm.advancedFilters[0].levels[1].push({
                            "keys": keys[c],
                            "parent": sale2
                        });
                        vm.advancedFilters[0].selected[1].push(keys[c]);
                        vm.filtersChecked += 1;
                    }
                })
                angular.forEach(response.sales3, function (keys, sale3) {
                    for (var d = 0; d < keys.length; d++) {
                        vm.advancedFilters[0].levels[2].push({
                            "keys": keys[d],
                            "parent": sale3
                        });
                        vm.advancedFilters[0].selected[2].push(keys[d]);
                        vm.filtersChecked += 1;
                    }
                })
                angular.forEach(response.sales4, function (keys, sale4) {
                    for (var e = 0; e < keys.length; e++) {
                        vm.advancedFilters[0].levels[3].push({
                            "keys": keys[e],
                            "parent": sale4
                        });
                        vm.advancedFilters[0].selected[3].push(keys[e]);
                        vm.filtersChecked += 1;
                    }
                })
                angular.forEach(response.sales5, function (keys, sale5) {
                    for (var f = 0; f < keys.length; f++) {
                        vm.advancedFilters[0].levels[4].push({
                            "keys": keys[f],
                            "parent": sale5
                        });
                        vm.advancedFilters[0].selected[4].push(keys[f]);
                        vm.filtersChecked += 1;
                    }
                })
                angular.forEach(response.sales6, function (keys, sale6) {
                    for (var g = 0; g < keys.length; g++) {
                        vm.advancedFilters[0].levels[5].push({
                            "keys": keys[g],
                            "parent": sale6
                        });
                        vm.advancedFilters[0].selected[5].push(keys[g]);
                        vm.filtersChecked += 1;
                    }
                })
                //If applied till SL6 and select any service SO, then populateSales call will happen. If by any chance the response is nul, then account manager filter was still visible
                if (angular.isDefined(vm.advancedFilters[0].levels)) {
                    if (angular.isDefined(vm.advancedFilters[0].levels[4]) && vm.advancedFilters[0].levels[4].length > 0) {
                        vm.getFiltersDropdown(vm.advancedFilters[0], 6);
                    } else {
                        vm.advancedFilters[0].levels[6] = [];
                        if (angular.isDefined(vm.advancedFilters[0].selected[6]))
                            vm.advancedFilters[0].selected[6] = [];
                    }
                }
                if (angular.isDefined(applyButtonClicked) && applyButtonClicked !== null) {
                    if (applyButtonClicked === true) {
                        vm.applyFilters();
                        applyButtonClicked = false;
                    }
                }
                //if the response was null,then the count was retained as 7 when applied it SL6 before
                vm.getFiltersCount(vm.advancedFilters);
            });
        }

        $scope.checkIfSAV = function (c, i) {
            if (c.slug === 'account' && c.levels_name[i] === "SAV Account" && c.active) {
                var checkAnyDropdownOpen = angular.element(document.querySelector('.nya-bs-select.check-in.open'));
                if (checkAnyDropdownOpen.length) {
                    return;
                } else if (angular.isDefined(c.selected[1]) && c.selected[1] !== null) { // To make sure call is made only if any sav is selected
                    if (c.selected[1].length) {
                        if (angular.equals(selectedSAVForSalesLevel, c.selected[1])) {
                            return;
                        }
                        isSavClicked = false;
                        //API call to load sales level
                        populateSalesOnSav(c);
                        selectedSAVForSalesLevel = angular.copy(c.selected[1]);
                    } else if (c.selected[1].length === 0) { // Changes for resetting the populated sales level values when we uncheck the selected SAV
                        if (angular.equals(selectedSAVForSalesLevel, c.selected[1])) { // changes to remove the populated sales level, when the sav is deselected and only if there is a change in the SAV values
                            return;
                        }
                        for (var g = 0; g < vm.advancedFilters[0].levels.length; g++) {
                            if (angular.isDefined(vm.advancedFilters[0].levels[g])) {
                                if (g !== 0) { // after selecting and deslecting sav, and tried to select some values in SL1, SL2 dropdown was not showing up
                                    vm.advancedFilters[0].API_call[g] = false;
                                }
                                vm.advancedFilters[0].levels[g] = [];
                                vm.advancedFilters[0].selected[g] = [];
                            }
                        }
                        //removing the install site filter from global filters if no sav is selected
                        if (angular.isDefined(vm.advancedFilters[1].levels)) {
                            if (angular.isDefined(vm.advancedFilters[1].levels[2])) {
                                vm.advancedFilters[1].levels[2] = [];
                                vm.advancedFilters[1].selected[2] = [];
                            }
                        }

                        //selectedSAVForSalesLevel was not getting updated. as a result, if some sav is applied and removed and again applied, sales levels were not getting populated
                        selectedSAVForSalesLevel = angular.copy(c.selected[1]);
                        vm.getFiltersDropdown(vm.advancedFilters[0], 0);
                    }
                }
            }
            // to make an api call to get Sales levels, sav and partner values when selected few SO numbers and clicked outside
            if (c.slug === 'services' && c.levels_name[i] === "Service SO" && c.active) {
                var checkAnyDropdownOpen = angular.element(document.querySelector('.nya-bs-select.check-in.open'));
                if (checkAnyDropdownOpen.length) {
                    return;
                } else if (angular.isDefined(c.selected[2]) && c.selected[2] !== null) { // To make sure call is made only if any sav is selected
                    if (c.selected[2].length) {
                        if (angular.equals(selectedServiceSO, c.selected[2])) {
                            return;
                        }
                        if (CiscoUtilities.getGlobalParam() === 'N') {
                            $scope.filterSavSearch(vm.advancedFilters[0].selected[6], vm.advancedFilters[1]);
                        } else {
                            filtersServObj.newFunctionFilter(vm.advancedFilters, vm.advancedFilters[1], 0);
                        }
                        $scope.filterPartnerSearch();
                        selectedServiceSO = angular.copy(c.selected[2]);
                    }
                }
            }
        }

        vm.isChanged = function (c, i) {
            if (c.slug === 'sales' && i === 5) {
                vm.advancedFilters[3].API_call[2] = false;
            } else if (c.slug === 'account' && (i === 0 || i === 1 || i === 5)) {
                vm.advancedFilters[3].API_call[2] = false;
            } else if (c.slug === 'services' && (i === 0 || i === 1)) {
                vm.advancedFilters[3].API_call[2] = false;
            }
        }


        // Freeze Architecture and Asset type for subscription tabs 
        var resetSubscriptionFilters = function () {
            $scope.activeSubTab = CiscoUtilities.getSubTab();
            if (['security', 'collaboration', "other"].includes($scope.activeSubTab)) {
                if ($scope.activeSubTab === 'security') {
                    vm.advancedFilters[2].selected[0] = [];
                    vm.advancedFilters[2].selected[0].push("Security");
                }
                if ($scope.activeSubTab === 'collaboration') {
                    vm.advancedFilters[2].selected[0] = [];
                    vm.advancedFilters[2].selected[0].push("Collaboration");
                }
                vm.advancedFilters[2].selected[7] = [];
                vm.advancedFilters[2].selected[7].push("Subscription - T&C", "Subscription - SaaS");
            }
        }

        $scope.changeFilterSelection = function (c, i) {
            //Architecture filter was resetted to empty when product filter is not expand. As a result if we switch to subscription-> security and try to apply sales level filters without expanding product filter, chart legends was giving all the subarchitecture values
            resetSubscriptionFilters();
            if (!c.new_func_call[i]) {
                var slug = c.slug;
                var currentFilter = $filter('filter')(vm.advancedFilters, {
                    slug: slug
                })[0];
                var retainFilter = $filter('filter')(filtersServ.retainSelectedFilters, {
                    slug: slug
                })[0];
                if (slug === 'sales' ||
                    (slug === 'account' && i <= 2) ||
                    (slug === 'product' && i < 4)) {

                    var previousLevel = i - 1;
                    //check if previous level filter is selected
                    if (previousLevel >= 0) {
                        // if(i === 0 && slug === 'account'){
                        //     previousLevel = 0;
                        //     currentFilter.API_call[i] = false;
                        // }
                        if (slug === 'account') {
                            //check if GU Name or SAV Account is selected
                            if ((currentFilter.selected[previousLevel] || currentFilter.selected[previousLevel - 1]) && !currentFilter.API_call[2]) {
                                //Loading next filter with API data
                                //$scope.loadNextLevelFilter(c, 2);
                            }
                        } else if (currentFilter.selected[previousLevel] &&
                            currentFilter.selected[previousLevel].length > 0 &&
                            !currentFilter.API_call[i]) {
                            //Loading next filter with API data
                            $scope.loadNextLevelFilter(c, i);
                        }
                        if (i === 0 && slug === 'account') {
                            // $scope.loadNextLevelFilter(c, i);
                        }
                        if (slug === 'sales' && i === 6) {
                            $scope.loadNextLevelFilter(c, i);
                        }
                    }
                    //retaining if any of the selected filters are present
                    // if (false && currentFilter.retain_selected) {
                    //     //currentFilter.selected = angular.copy(currentFilter.retain_selected);
                    //     retainFilter.selected = angular.copy(currentFilter.retain_selected);
                    //     delete currentFilter.retain_selected;
                    //     filtersServ.retainSelectedUpdated = false;
                    // }
                    //check if any filter is selected
                    if (currentFilter.selected[i] && currentFilter.selected[i].length > 0) {
                        //copying all the selected values to retain them by value not by selected indexes
                        var selected = currentFilter.selected[i];

                        var nextLevel = i + 1;
                        //checking selected values and previously retained selected values
                        if (retainFilter) {
                            // if (false && currentFilter.retain_selected && currentFilter.selected[i].length < currentFilter.retain_selected[i].length) {
                            //     currentFilter.selected = angular.copy(currentFilter.retain_selected);
                            //     retainFilter.selected = angular.copy(currentFilter.retain_selected);
                            //     delete currentFilter.retain_selected;
                            // }
                            var filterAddedFlag = false;
                            var filterRemovedFlag = false;
                            for (var r = 0; r < retainFilter.selected.length; r++) {
                                if (retainFilter.selected[r] && currentFilter.selected[r] &&
                                    !angular.equals(retainFilter.selected[r].sort(), currentFilter.selected[r].sort())) {
                                    if (retainFilter.selected[r].length < currentFilter.selected[r].length) {
                                        filterAddedFlag = true;
                                    }
                                    if (retainFilter.selected[r].length > currentFilter.selected[r].length) {
                                        filterRemovedFlag = true;
                                    }
                                }
                            }
                            if (filterRemovedFlag) {
                                $scope.loadNextLevelSelectedFilter(c, nextLevel);
                                getRetainSelectedFilters();
                                checkDependentFilters(slug);
                                $timeout(function () {
                                    if (currentFilter.retain_selected) {
                                        currentFilter.selected = angular.copy(currentFilter.retain_selected);
                                        retainFilter.selected = angular.copy(currentFilter.retain_selected);
                                    }
                                }, true);
                            }
                            if (filterAddedFlag) {
                                if (slug === 'product' && nextLevel >= 4) {

                                } else {
                                    currentFilter.API_call[nextLevel] = false;
                                }
                                getRetainSelectedFilters();
                                checkDependentFilters(slug);
                                $timeout(function () {
                                    if (currentFilter.retain_selected) {
                                        currentFilter.selected = angular.copy(currentFilter.retain_selected);
                                        retainFilter.selected = angular.copy(currentFilter.retain_selected);
                                    }
                                }, true);
                            }
                        }
                        //retaining all the selected values
                        getRetainSelectedFilters();

                        //loading next level without any data when upper levels have selection
                        if (((slug === 'sales' && i < 6 & i !== 4) ||
                                (slug === 'product' && i < 4)) &&
                            !currentFilter.API_call[nextLevel]) {
                            currentFilter.levels[nextLevel] = [{}];
                        } else if (slug === 'sales' && i === 4 && !currentFilter.API_call[nextLevel]) {
                            currentFilter.levels[nextLevel] = [{}];
                            currentFilter.levels[nextLevel + 1] = [{}];
                        }
                    }
                    //Remove next filter selection when current filter selections are none
                    if (currentFilter.selected.length && currentFilter.selected[i]) {
                        if (slug === 'sales' && currentFilter.selected[i].length === 0 && i < 5) {
                            for (var level = i; level < currentFilter.selected.length; level++) {
                                var nextLevel = level + 1;
                                currentFilter.levels[nextLevel] = [];
                                currentFilter.API_call[nextLevel] = false;
                                // AM dropdown was being displayed even after SL5 has been deselected
                                if (i === 4 && nextLevel < 7) {
                                    currentFilter.levels[nextLevel + 1] = [];
                                    currentFilter.API_call[nextLevel + 1] = false;
                                }
                            }
                            var backupSalesFilter = angular.copy(currentFilter.selected);
                            for (var a = i; a < currentFilter.selected.length; a++) {
                                backupSalesFilter[a + 1] = [];
                            }
                            currentFilter.selected = backupSalesFilter;
                        }
                        //commenting this, as event was not being recognized in firefox.
                        if (slug === 'account' && (i === 0 || i === 1)) {
                            /*if(event.toElement.nextElementSibling){
                                if(event.toElement.nextElementSibling.nodeName !== undefined){
                                    if(event.toElement.nextElementSibling.nodeName === 'A' || event.toElement.nextElementSibling.nodeName === 'BUTTON'){ */
                            isSavClicked = true;
                            var savBackup = angular.copy(currentFilter.selected[i]);
                            currentFilter.API_call[i] = false;
                            //supressing the sav/partner call on expand/collapse of the sav dropdown
                            if (!angular.equals(savBackup, currentFilter.selected[i])) {
                                $scope.loadNextLevelFilter(c, i);
                            }
                            currentFilter.levels[2] = [{}];
                            currentFilter.selected[2] = [];
                            currentFilter.API_call[2] = false;
                            /*}
                            }                   
                        }else if(event.toElement.tagName === 'A' || event.toElement.tagName === 'BUTTON'){ 
                            isSavClicked = true;
                            currentFilter.API_call[i] = false;
                            $scope.loadNextLevelFilter(c, i);
                            currentFilter.levels[2] = [{}];
                            currentFilter.selected[2] = [];
                            currentFilter.API_call[2] = false;
                        }*/

                        }
                        if (slug === 'product' && currentFilter.selected[i].length === 0 && i < 3) {
                            for (var level = i; level < 3; level++) {
                                var nextLevel = level + 1;
                                currentFilter.levels[nextLevel] = [];
                                currentFilter.API_call[nextLevel] = false;
                            }
                            var backupProductFilter = angular.copy(currentFilter.selected);
                            for (var a = i; a < 3; a++) {
                                backupProductFilter[a + 1] = [];
                            }
                            currentFilter.selected = backupProductFilter;
                        }
                    }

                }
            }
            if (c.slug === 'account' && c.levels_name[i] === "SAV Account" && c.active) {
                var checkAnyDropdownOpen = angular.element(document.querySelector('.nya-bs-select.check-in.open'));
                if (checkAnyDropdownOpen.length) {
                    return;
                } else if (angular.isDefined(c.selected[1]) && c.selected[1].length) {
                    if (angular.equals(selectedSAVForSalesLevel, c.selected[1])) {
                        return;
                    }
                    //API call to load sales level
                    populateSalesOnSav(c);
                    selectedSAVForSalesLevel = angular.copy(c.selected[1]);
                }
            }
            setServiceFilterObj(c, i);
            if (c.new_func_call[i]) {
                if (c.slug === "services") {

                    serviceFilters(c, i);
                } else {
                    populateFilters(c, i);
                }
            }
            vm.getFiltersCount(vm.advancedFilters);
        }

        $scope.loadNextLevelFilter = function (c, n) {

            var slug = c.slug;
            var currentFilter = $filter('filter')(vm.advancedFilters, {
                slug: slug
            })[0];
            var nextLevel = n;
            if (!currentFilter.API_call[nextLevel]) {
                currentFilter.full_levels[nextLevel] = [{}];
                var config = {
                    level: nextLevel,
                    slug: slug
                };
                if (slug === 'account' && nextLevel === 1) {
                    n = n + 1;
                } else {
                    currentFilter.API_call[nextLevel] = true;
                }
                if (slug === 'account' && nextLevel === 1 && c.selected) {
                    if (c.selected[1]) {
                        if (c.selected[1].length === 0) {
                            vm.getFiltersDropdown(c, n, undefined, 'change');
                        }
                    }
                }
                vm.getFiltersDropdown(c, n);
            }
        }

        $scope.loadNextLevelSelectedFilter = function (c, n) {
            var slug = c.slug;
            var currentFilter = $filter('filter')(vm.advancedFilters, {
                slug: slug
            })[0];
            var current_level = n - 1
            if (slug === 'sales') {
                for (var i = current_level; i <= currentFilter.selected.length; i++) {
                    var nextLevel = i + 1;
                    var selected = currentFilter.selected[i] ? angular.copy(currentFilter.selected[i]) : '';
                    var nextFilter = [];
                    if (selected !== '' && nextLevel < 6) {

                        selected.forEach(function (s) {
                            if (currentFilter.API_call[nextLevel]) {
                                var parent = s;
                                nextFilter = nextFilter.concat($filter('filter')(currentFilter.full_levels[nextLevel], {
                                    parent: parent
                                }));
                            } else if (!currentFilter.API_call[nextLevel] && nextLevel < 6) {
                                nextFilter = [{}];
                            }
                        })
                        //updating next level selected filter based on the previous selection
                        if (currentFilter.selected[nextLevel]) {
                            var arr = [];
                            currentFilter.selected[nextLevel].forEach(function (a, b) {
                                var index = nextFilter.findIndex(function (x, y) {
                                    return x.keys === a;
                                })
                                if (index >= 0) {
                                    arr.push(a);
                                }
                            });
                            currentFilter.selected[nextLevel] = angular.copy(arr);
                        }
                        currentFilter.levels[nextLevel] = angular.copy(nextFilter);
                    } else if (nextLevel === 6) {
                        if (currentFilter.selected[4].length > 0) {
                            currentFilter.levels[nextLevel] = angular.copy(currentFilter.full_levels[nextLevel]);
                        } else {
                            currentFilter.levels[nextLevel] = [];
                        }
                    }
                }
            } else if (slug === 'product') {
                for (var i = current_level; i <= currentFilter.selected.length; i++) {
                    var nextLevel = i + 1;
                    var selected = currentFilter.selected[i] ? angular.copy(currentFilter.selected[i]) : '';
                    var nextFilter = [];
                    if (selected !== '' && nextLevel < 4) {
                        selected.forEach(function (s) {
                            if (currentFilter.API_call[nextLevel]) {
                                var parent = s;
                                //to make sure the filtering is done for the parent string as a whole and not as a substring. Earlier if the parent is USC, then the filtering was happening for all the values with the parent USC, UCSS, UCSSB2E etc.
                                nextFilter = nextFilter.concat($filter('filter')(currentFilter.full_levels[nextLevel], {
                                    parent: parent
                                }, true));
                            } else if (!currentFilter.API_call[nextLevel] && nextLevel < 4) {
                                nextFilter = [{}];
                            }
                        })
                        if (currentFilter.selected[nextLevel]) {
                            var arr = [];
                            currentFilter.selected[nextLevel].forEach(function (a, b) {
                                var index = nextFilter.findIndex(function (x, y) {
                                    return x.keys === a;
                                })
                                if (index >= 0) {
                                    arr.push(a);
                                }
                            });
                            currentFilter.selected[nextLevel] = angular.copy(arr);
                        }
                        currentFilter.levels[nextLevel] = angular.copy(nextFilter);
                    }
                }
            }
        }

        vm.selectAllCheckboxes = function (c, f, index) {
            var arr = [];
            angular.forEach(f, function (o) {
                arr.push(o[0]);
            });
            c.selected[index] = arr;
            vm.getFiltersDropdown(c, index + 1);
        };

        vm.showBorder = function (c, index) {
            return (c.levels_name[index] === 'Account Manager' || c.levels_name[index] === 'Product Type');
        };

        //vm.dateError = false;

        vm.isDateError = function (d) {
            var rF = d.rangeFrom ? parseInt(d.rangeFrom) : 0;
            var rT = d.rangeTo ? parseInt(d.rangeTo) : 0;
            d.dateError = false;
            if (rT < rF && d.rangeFrom && d.rangeTo) {
                d.dateError = true;
            }
            return rT < rF;
        };
        vm.isDatsetError = function (d) {
            var dataSetF = d.years.from ? parseInt(d.years.from) : 0;
            var datasetT = d.years.to ? parseInt(d.years.to) : 0;
            d.datasetError = false;
            if (dataSetF < 1996 || datasetT > ((new Date()).getFullYear() + 1)) {
                d.datasetError = true;
            }
            if (datasetT < dataSetF) {
                d.datasetError = true;
            }
            return datasetT < dataSetF;
        }
        vm.isAnyDateError = function () {
            var datesFilter = $filter('filter')(vm.advancedFilters, {
                type: 'date'
            })[0];
            var dataSetFilter = $filter('filter')(vm.advancedFilters, {
                type: 'dataset'
            })[0];
            var error = false;
            datesFilter.categories.forEach(function (a) {

                if (a.dateError || (a.rangeFrom === '-0') || (a.rangeTo === '-0')) {
                    error = true;
                    return;
                }
            });
            dataSetFilter.categories.forEach(function (b) {

                if ((b.datasetError || b.years.from === undefined || b.years.to === undefined) || (b.years.from.length < 4 || b.years.length < 4) || (b.years.from === "0000" || b.years.to === "0000")) {
                    error = true;
                    return;
                }
            });
            return error;
        };

        /*vm.isDateNegative = function (d) {
             var rF = parseInt(d.rangeFrom);
             var rT = parseInt(d.rangeTo);
             if(rT<0 || rF<0){
                 vm.dateError = true;
                 return true;
             }else if(rT>0 && rF>0){
                 vm.dateError = false;
             }
        }*/

        vm.isMultiple = function (c, index) {
            return !(c.levels_name[index] === 'Territory Coverage');
        };


        vm.sidebarActiveToggle = function (b) {
            $rootScope.$broadcast('sidebar-toggle', b);
        };

        var getBookmarkId = function (query) {
            var beforeHashValues = query[0].split('/');
            if (beforeHashValues[3] === 'all') {
                $scope.subopportunity = undefined;
            } else {
                $scope.subopportunity = beforeHashValues[4];
            }
            var len1 = beforeHashValues.length - 1;
            var bkmarkId = beforeHashValues[len1];
            var bkmarkHashId = query[1].split('=')[1];
            var bothIds = {};
            bothIds.id = bkmarkId;
            bothIds.hashId = bkmarkHashId;

            return bothIds;
        }

        var updateNewFilterObjects = function (bkmrkFilters, filter) {
            if (!(bkmrkFilters.API_call && bkmrkFilters.full_levels && bkmrkFilters.search_api && bkmrkFilters.new_func_call)) {
                bkmrkFilters.API_call = [];
                bkmrkFilters.full_levels = [];
                bkmrkFilters.search_api = [];
                bkmrkFilters.API_call = filter.API_call;
                bkmrkFilters.full_levels = filter.full_levels;
                bkmrkFilters.search_api = filter.search_api;
                bkmrkFilters.new_func_call = filter.new_func_call;
            }
            return bkmrkFilters;
        }

        vm.salesLevelInit = function () {
            let activeTab = CiscoUtilities.getSubTab();
            var deferred = $q.defer();
            var filterDetails = JSON.parse($sessionStorage.get('appliedFilters'));
            var filtersArray = JSON.parse($sessionStorage.get('advancedFilters'));
            var salesLevelData = {};
            var salesFilterData = [];
            var length123;
            var isSalesLocked = false;
            var filtersBackup = angular.copy(vm.advancedFilters);
            if (activeTab === "secondChance") {
                vm.clearFilters(0, true);
            }
            $sessionStorage.put('isCollabActive', vm.isCollabBookmarkActive());
            if (vm.isBookmarkActive() || typeof ($routeParams.subopportunity) === "string") {
                var locationStr;
                if ($location.absUrl().indexOf('?') === -1) {
                    locationStr = $location.path();
                } else {
                    locationStr = $location.url();
                }
                var queryParameter = locationStr.split('?');
                if (queryParameter.length > 1) {
                    isClearAllClicked = true;
                    var ids = getBookmarkId(queryParameter);
                    BookMarkData.getBookmarkById(ids).then(function (res) {
                        var bookmark = res.bookmarks[0];
                        filtersServ.isFromBookmark = true;
                        if (bookmark.filter[5]) {
                            filtersServ.globalView = bookmark.filter[5];
                            CiscoUtilities.setGlobalParam(filtersServ.globalView);
                            //This is to set the model for the Global vs Sav view slider
                            $rootScope.$broadcast('cmngFrmBookMark', filtersServ.globalView);
                        }
                        if (bookmark.filter[1]["3"].title !== "Services") {
                            var dateFilter = angular.copy(bookmark.filter[1]["3"]);
                            var statusFilter = angular.copy(bookmark.filter[1]["4"]);
                            if (bookmark.filter[1]["5"]) {
                                if (bookmark.filter[1]["5"].title === "Dataset") {
                                    var datasetFilter = bookmark.filter[1]["5"];
                                }
                            }
                            bookmark.filter[1]["3"] = vm.advancedFilters["3"];
                            bookmark.filter[1]["4"] = dateFilter;
                            bookmark.filter[1]["5"] = statusFilter;
                            if (datasetFilter) {
                                bookmark.filter[1]["6"] = datasetFilter;
                            }
                        }
                        //Adding few extra objects that are are added newly which are not present in the old bookmarks
                        for (var b = 0; b < 4; b++) {
                            bookmark.filter[1][b] = updateNewFilterObjects(bookmark.filter[1][b], filtersBackup[b]);
                        }
                        //Adding new account and product filters in case of old bookmarks where these are not present
                        if (bookmark.filter[1][1].levels.length !== vm.advancedFilters[1].levels.length) {
                            var accountFilter = angular.copy(vm.advancedFilters[1]);
                            for (var h = 0; h < accountFilter.levels.length; h++) {
                                for (var l = 0; l < bookmark.filter[1][1].levels.length; l++) {
                                    if (accountFilter.levels_name[h] === bookmark.filter[1][1].levels_name[l]) {
                                        accountFilter.levels[h] = bookmark.filter[1][1].levels[l];
                                        accountFilter.selected[h] = bookmark.filter[1][1].selected[l];
                                    }
                                }
                            }
                            bookmark.filter[1][1] = accountFilter;
                        }
                        if (bookmark.filter[1][2].levels.length !== vm.advancedFilters[2].levels.length) {
                            var productFilter = angular.copy(vm.advancedFilters[2]);
                            for (var h = 0; h < productFilter.levels.length; h++) {
                                for (var l = 0; l < bookmark.filter[1][2].levels.length; l++) {
                                    if (productFilter.levels_name[h] === bookmark.filter[1][2].levels_name[l]) {
                                        productFilter.levels[h] = bookmark.filter[1][2].levels[l];
                                        productFilter.selected[h] = bookmark.filter[1][2].selected[l];
                                    }
                                }
                            }
                            bookmark.filter[1][2] = productFilter;
                        }
                        if (bookmark.filter[1]["6"]) {
                            //do nothing
                        } else {
                            bookmark.filter[1]["6"] = vm.advancedFilters["6"];
                        }
                        if (bookmark.filter[1]["3"].levels) {
                            if (bookmark.filter[1]["3"].levels.length === 2) {
                                bookmark.filter[1]["3"].levels_name = angular.copy(vm.advancedFilters["3"].levels_name);
                                bookmark.filter[1]["3"].searchable = angular.copy(vm.advancedFilters["3"].searchable);
                                bookmark.filter[1]["3"].search_api = angular.copy(vm.advancedFilters["3"].search_api);
                                bookmark.filter[1]["3"].disabled = angular.copy(vm.advancedFilters["3"].disabled);
                                bookmark.filter[1]["3"].API_call = angular.copy(vm.advancedFilters["3"].API_call);
                                bookmark.filter[1]["3"].new_func_call = angular.copy(vm.advancedFilters["3"].new_func_call);
                            }
                        }
                        //adding missed sweep filter in old bookmarks
                        if (bookmark.filter[1]["5"].categories.length === 2) {
                            bookmark.filter[1]["5"].categories[2] = angular.copy(vm.advancedFilters["5"].categories[2]);
                        }
                        vm.advancedFilters = bookmark.filter[1];
                        vm.advancedFilters[4] = getDateFormat(bookmark.filter[1]["4"]); // there was a mismatch in the date format of collab filters and the format after adding relative dates

                        //angular.forEach( vm.advancedFilters,function(filter){

                        //do not remove the code this is to optimize the calls :- Ketan
                        /*if(filter.title  === "Account" || filter.title === "Product"){
                                     //do nothing
                             }else{
                                 vm.getFiltersDropdown(filter,i);
                                 i = 0 ;
                             }

                        });*/
                        if ($routeParams.bkmark !== undefined) {
                            GlobalBookmarkServ.selectBookmark(bookmark);
                        }
                        // disabling the filters for subscription bookmarks
                        resetSubscriptionFilters(); // replaced disableFiltersForSubscription() b'cos of duplication
                        $sessionStorage.put('isCollabActive', vm.isCollabBookmarkActive()); // was not updating the vm.isCollabBookmarkActive() in case of copy url and share bookmark scenarios
                        if (vm.isCollabBookmarkActive() !== undefined && vm.isCollabBookmarkActive() === true) {
                            if (vm.advancedFilters !== undefined) {
                                for (var x = 0; x < vm.advancedFilters.length; x++) {
                                    vm.advancedFilters[x].disabled = [];
                                }
                                for (var z = 0; z <= 3; z++) {
                                    if (vm.advancedFilters[z].selected !== undefined && vm.advancedFilters[z].selected.length > 0) {
                                        for (var y = 0; y < vm.advancedFilters[z].selected.length; y++) {
                                            if (angular.isDefined(vm.advancedFilters[z].selected[y]) && vm.advancedFilters[z].selected[y].length > 0) {
                                                vm.advancedFilters[z].disabled[y] = true;
                                            }
                                        }
                                    }
                                }
                                if (vm.advancedFilters[4].categories !== undefined) {
                                    for (var a = 0; a < vm.advancedFilters[4].categories.length; a++) {
                                        if (vm.advancedFilters[4].categories[a].rangeFrom !== null)
                                            vm.advancedFilters[4].categories[a].isRangeFrom = true;
                                        else
                                            vm.advancedFilters[4].categories[a].isRangeFrom = false;
                                        if (vm.advancedFilters[4].categories[a].rangeTo !== null)
                                            vm.advancedFilters[4].categories[a].isRangeTo = true;
                                        else
                                            vm.advancedFilters[4].categories[a].isRangeTo = false;
                                        if (vm.advancedFilters[4].categories[a].selected !== null)
                                            vm.advancedFilters[4].categories[a].isPeriod = true;
                                        else
                                            vm.advancedFilters[4].categories[a].isPeriod = false;
                                    }
                                }
                            }
                        }
                        vm.refreshPropFiltersForBookmarks();
                        vm.applyFilters();
                    });
                } else {
                    if (vm.isBookmarkActive()) {
                        if (GlobalBookmarkServ.bookmark.filter[5]) {
                            filtersServ.globalView = GlobalBookmarkServ.bookmark.filter[5];
                            CiscoUtilities.setGlobalParam(filtersServ.globalView);
                            //This is to set the model for the Global vs Sav view slider
                            $rootScope.$broadcast('cmngFrmBookMark', filtersServ.globalView);
                        }
                        isClearAllClicked = true;
                        var filtersArray;
                        filtersArray = GlobalBookmarkServ.bookmark.filter[1];
                        for (i = 0; i < filtersArray[0].selected.length; i++) {
                            if (filtersArray[0].selected[i] && angular.isDefined(filtersArray[0].selected[i]) && (filtersArray[0].selected[i]) != '') { //added empty check for defect DE138851
                                if (filtersArray[0].selected[i]["0"] === vm.userInfo.salesData['level' + (i + 1)]) {
                                    vm.advancedFilters[0].selected[i] = [];
                                    vm.advancedFilters[0].disabled = [];
                                    vm.advancedFilters[0].selected[i].push(vm.userInfo.salesData['level' + (i + 1)]);
                                    var levelsCount = i;
                                    vm.advancedFilters[0].levels[i] = [];
                                    vm.advancedFilters[0].levels[levelsCount][0] = {};
                                    vm.advancedFilters[0].levels[levelsCount][0].keys = vm.userInfo.salesData['level' + (i + 1)];
                                    vm.advancedFilters[0].levels[levelsCount][0].selected = true;
                                    vm.advancedFilters[0].disabled[i] = true;
                                } else {
                                    GlobalBookmarkServ.bookmark.filter[1]["0"] = updateNewFilterObjects(GlobalBookmarkServ.bookmark.filter[1]["0"], filtersBackup["0"]);
                                    vm.advancedFilters["0"] = GlobalBookmarkServ.bookmark.filter[1]["0"];
                                }
                            }
                        }
                        if (filtersArray["0"].selected.length === 0) {
                            GlobalBookmarkServ.bookmark.filter[1]["0"] = updateNewFilterObjects(GlobalBookmarkServ.bookmark.filter[1]["0"], filtersBackup["0"]);
                            vm.advancedFilters["0"] = GlobalBookmarkServ.bookmark.filter[1]["0"];
                        }
                        //Adding new account and product filters in case of old bookmarks where these are not present
                        if (GlobalBookmarkServ.bookmark.filter[1]["1"].levels.length !== vm.advancedFilters[1].levels.length) {
                            var accountFilter = angular.copy(vm.advancedFilters[1]);
                            for (var h = 0; h < accountFilter.levels.length; h++) {
                                for (var l = 0; l < GlobalBookmarkServ.bookmark.filter[1]["1"].levels.length; l++) {
                                    if (accountFilter.levels_name[h] === GlobalBookmarkServ.bookmark.filter[1]["1"].levels_name[l]) {
                                        accountFilter.levels[h] = GlobalBookmarkServ.bookmark.filter[1]["1"].levels[l];
                                        accountFilter.selected[h] = GlobalBookmarkServ.bookmark.filter[1]["1"].selected[l];
                                    }
                                }
                            }
                            GlobalBookmarkServ.bookmark.filter[1]["1"] = accountFilter;
                        }
                        if (GlobalBookmarkServ.bookmark.filter[1]["2"].levels.length !== vm.advancedFilters[2].levels.length) {
                            var productFilter = angular.copy(vm.advancedFilters[2]);
                            for (var h = 0; h < productFilter.levels.length; h++) {
                                for (var l = 0; l < GlobalBookmarkServ.bookmark.filter[1]["2"].levels.length; l++) {
                                    if (productFilter.levels_name[h] === GlobalBookmarkServ.bookmark.filter[1]["2"].levels_name[l]) {
                                        productFilter.levels[h] = GlobalBookmarkServ.bookmark.filter[1]["2"].levels[l];
                                        productFilter.selected[h] = GlobalBookmarkServ.bookmark.filter[1]["2"].selected[l];
                                    }
                                }
                            }
                            GlobalBookmarkServ.bookmark.filter[1]["2"] = productFilter;
                        }
                        vm.advancedFilters["1"] = GlobalBookmarkServ.bookmark.filter[1]["1"];
                        vm.advancedFilters["2"] = GlobalBookmarkServ.bookmark.filter[1]["2"];
                        //filters of old bookmarks where not getting updated because of the new filter's addition that is Services
                        if (GlobalBookmarkServ.bookmark.filter[1]["3"].title !== "Services") {
                            var dateFilter = angular.copy(GlobalBookmarkServ.bookmark.filter[1]["3"]);
                            var statusFilter = angular.copy(GlobalBookmarkServ.bookmark.filter[1]["4"]);
                            if (GlobalBookmarkServ.bookmark.filter[1]["5"]) {
                                if (GlobalBookmarkServ.bookmark.filter[1]["5"].title === "Dataset") {
                                    var datasetFilter = GlobalBookmarkServ.bookmark.filter[1]["5"];
                                }
                            }
                            GlobalBookmarkServ.bookmark.filter[1]["3"] = vm.advancedFilters["3"];
                            GlobalBookmarkServ.bookmark.filter[1]["4"] = dateFilter;
                            GlobalBookmarkServ.bookmark.filter[1]["5"] = statusFilter;
                            if (datasetFilter) {
                                GlobalBookmarkServ.bookmark.filter[1]["6"] = datasetFilter;
                            }
                        }
                        if (GlobalBookmarkServ.bookmark.filter[1]["3"].levels) {
                            if (GlobalBookmarkServ.bookmark.filter[1]["3"].levels.length === 2) {
                                GlobalBookmarkServ.bookmark.filter[1]["3"].levels_name = angular.copy(vm.advancedFilters["3"].levels_name);
                                GlobalBookmarkServ.bookmark.filter[1]["3"].searchable = angular.copy(vm.advancedFilters["3"].searchable);
                                GlobalBookmarkServ.bookmark.filter[1]["3"].search_api = angular.copy(vm.advancedFilters["3"].search_api);
                                GlobalBookmarkServ.bookmark.filter[1]["3"].disabled = angular.copy(vm.advancedFilters["3"].disabled);
                                GlobalBookmarkServ.bookmark.filter[1]["3"].API_call = angular.copy(vm.advancedFilters["3"].API_call);
                                GlobalBookmarkServ.bookmark.filter[1]["3"].new_func_call = angular.copy(vm.advancedFilters["3"].new_func_call);
                            }
                        }
                        vm.advancedFilters["3"] = GlobalBookmarkServ.bookmark.filter[1]["3"];
                        vm.advancedFilters["4"] = getDateFormat(GlobalBookmarkServ.bookmark.filter[1]["4"]);
                        //adding missed sweep filter in old bookmarks
                        if (GlobalBookmarkServ.bookmark.filter[1]["5"].categories.length === 2) {
                            GlobalBookmarkServ.bookmark.filter[1]["5"].categories[2] = angular.copy(vm.advancedFilters["5"].categories[2]);
                        }
                        vm.advancedFilters["5"] = GlobalBookmarkServ.bookmark.filter[1]["5"];
                        //Since there are many bookmarks which doesn't have dataSet obj we need to check it and assign it.
                        if (GlobalBookmarkServ.bookmark.filter[1]["6"]) {
                            vm.advancedFilters["6"] = GlobalBookmarkServ.bookmark.filter[1]["6"];
                        } else {
                            GlobalBookmarkServ.bookmark.filter[1]["6"] = vm.advancedFilters["6"];
                        }
                        //Adding few extra objects that are are added newly which are not present in the old bookmarks 
                        for (var a = 1; a < 4; a++) {
                            GlobalBookmarkServ.bookmark.filter[1][a] = updateNewFilterObjects(GlobalBookmarkServ.bookmark.filter[1][a], filtersBackup[a]);
                        }
                        // disabling the filters for subscription bookmarks
                        resetSubscriptionFilters(); // replaced disableFiltersForSubscription() b'cos of duplication
                        $scope.activeSubTab = CiscoUtilities.getSubTab();
                        // checkboxes for architecture and asset type filters was enabled when accessed some bookmarks created under any of the subscription tabs
                        if (["security", "collaboration", "other"].includes($scope.activeSubTab)) {
                            vm.advancedFilters[2] = resetFiltersForSubscription(vm.advancedFilters[2]);
                            if ($scope.activeSubTab === "security") {
                                vm.advancedFilters[2].selected[0].push("Security");
                            }
                            if ($scope.activeSubTab === "collaboration") {
                                vm.advancedFilters[2].selected[0].push("Collaboration");
                            }
                        }
                        if (vm.isCollabBookmarkActive() !== undefined && vm.isCollabBookmarkActive() === true) {
                            if (vm.advancedFilters !== undefined) {
                                for (var x = 0; x < vm.advancedFilters.length; x++) {
                                    vm.advancedFilters[x].disabled = [];
                                }
                                for (var z = 0; z <= 3; z++) {
                                    if (vm.advancedFilters[z].selected !== undefined && vm.advancedFilters[z].selected.length > 0) {
                                        for (var y = 0; y < vm.advancedFilters[z].selected.length; y++) {
                                            if (angular.isDefined(vm.advancedFilters[z].selected[y]) && vm.advancedFilters[z].selected[y].length > 0) {
                                                vm.advancedFilters[z].disabled[y] = true;
                                            }
                                        }
                                    }
                                }
                                if (vm.advancedFilters[4].categories !== undefined) {
                                    for (var a = 0; a < vm.advancedFilters[4].categories.length; a++) {
                                        if (vm.advancedFilters[4].categories[a].rangeFrom !== null)
                                            vm.advancedFilters[4].categories[a].isRangeFrom = true;
                                        else
                                            vm.advancedFilters[4].categories[a].isRangeFrom = false;
                                        if (vm.advancedFilters[4].categories[a].rangeTo !== null)
                                            vm.advancedFilters[4].categories[a].isRangeTo = true;
                                        else
                                            vm.advancedFilters[4].categories[a].isRangeTo = false;
                                        if (vm.advancedFilters[4].categories[a].selected !== null)
                                            vm.advancedFilters[4].categories[a].isPeriod = true;
                                        else
                                            vm.advancedFilters[4].categories[a].isPeriod = false;
                                        // if(vm.advancedFilters[4].categories[a].direction !== null)
                                        //     vm.advancedFilters[4].categories[a].isDirection = true;
                                        // else
                                        //     vm.advancedFilters[4].categories[a].isDirection = false;
                                    }

                                }
                            }
                        }
                        vm.autoSelectUserInfoSalesData(filterDetails, filtersArray);
                    } else {
                        vm.autoSelectUserInfoSalesData(filterDetails, filtersArray);
                        // disabling the architecture filter when the subscription tab is directly loaded(hitting the url directly) 
                        $scope.activeSubTab = CiscoUtilities.getSubTab();

                        //when accessed a bookmark created on subscription - > other, and click on clear bookmark, asset type filter was also getting cleared from view applied
                        if (["security", "collaboration", "other"].includes($scope.activeSubTab)) {
                            vm.advancedFilters[2] = resetFiltersForSubscription(vm.advancedFilters[2]);
                            if ($scope.activeSubTab === "security") {
                                vm.advancedFilters[2].selected[0].push("Security");
                            }
                            if ($scope.activeSubTab === "collaboration") {
                                vm.advancedFilters[2].selected[0].push("Collaboration");
                            }
                        }
                    }
                }
                var i = vm.advancedFilters[0].selected.length;
                angular.forEach(vm.advancedFilters, function (filter) {
                    if (filter.title === "Services") { // Not to call contract Type api on load

                    } else {
                        vm.getFiltersDropdown(filter, i);
                        i = 0;
                    }
                })
                vm.refreshPropFiltersForBookmarks();
                deferred.resolve(true);
            } else {
                vm.autoSelectUserInfoSalesData(filterDetails, filtersArray);
                if (window.location.hash === "#/campaigns/securityRefresh") {
                    vm.advancedFilters["2"].disabled = [];
                    vm.advancedFilters["2"].disabled[0] = true;
                    vm.advancedFilters[2].selected[0] = [];
                    vm.advancedFilters[2].selected[0].push("Security");
                }
                if (window.location.hash === "#/campaigns/collaborationRefresh") {
                    vm.advancedFilters["2"].disabled = [];
                    vm.advancedFilters["2"].disabled[0] = true;
                    vm.advancedFilters[2].selected[0] = [];
                    vm.advancedFilters[2].selected[0].push("Collaboration");
                }
                // if (window.location.hash === "#/campaigns/secondChance") {
                //     vm.advancedFilters["2"].disabled = [];
                //     vm.advancedFilters["2"].disabled[0] = true;
                // }

                deferred.resolve(true);
            }
            return deferred.promise;
        };

        //Changing the code to fix the Sales-level diabled issue, also refactored the code to
        //reduce repetition. -G
        vm.autoSelectUserInfoSalesData = function (filterDetails, filtersArray) {
            var isSalesLocked = false;
            var length123;
            var salesFilterData = [];
            if (filterDetails !== null) {
                isSalesLocked = true;
                length123 = filterDetails.length;
                if (filtersArray !== null) {
                    vm.advancedFilters = filtersArray;
                }
                angular.forEach(filterDetails, function (salesFilter) {
                    if (salesFilter.categoryId === "sales") {
                        salesFilterData.push(salesFilter);
                    }
                })
            } else {
                length123 = vm.userInfo.salesLevel;
            }
            vm.lockSalesFilter = {};
            if (isSalesLocked) {
                length123 = salesFilterData.length + 1;
            }
            if (vm.userInfo.salesLevel > 1) {
                vm.advancedFilters[0].disabled = [];
                vm.advancedFilters[0].levels[0] = [];
                length123 = vm.userInfo.salesLevel;
                for (var i = 1; i < length123; i++) {
                    vm.advancedFilters[0].selected[i - 1] = [];
                    if (angular.isDefined(vm.userInfo.salesData['level' + i]) && angular.isDefined(vm.advancedFilters[0].selected[i - 1])) {
                        vm.advancedFilters[0].selected[i - 1].push(vm.userInfo.salesData['level' + i]);
                        vm.advancedFilters[0].disabled[i - 1] = true;
                        var levelsCount = i - 1;
                        vm.advancedFilters[0].levels[i - 1] = []
                        vm.advancedFilters[0].levels[levelsCount][0] = {};
                        vm.advancedFilters[0].levels[levelsCount][0].keys = vm.userInfo.salesData['level' + i];
                        vm.advancedFilters[0].levels[levelsCount][0].selected = true;
                        if (i < vm.userInfo.salesLevel) {
                            vm.lockSalesFilter['level' + i] = true;
                        }
                    }
                }
            } else {
                vm.advancedFilters[0].disabled = [];
            }
        }

        var resetFiltersForSubscription = function (fltr) {
            fltr.disabled = [];
            fltr.disabled[0] = true;
            fltr.selected[0] = [];
            fltr.disabled[7] = true;
            fltr.selected[7] = [];
            fltr.selected[7].push("Subscription - T&C", "Subscription - Saas");
            return fltr;
        }
        // toggle passed variable 
        vm.toggleVar = function (e, c) {
            // let activeSubTab = CiscoUtilities.getSubTab();
            c.active = !c.active;
            $scope.rzLoader();
            if (window.location.hash === "#/campaigns/securityRefresh") {
                vm.isSecurityRefresh = true;
            }
            if (window.location.hash === "#/campaigns/collaborationRefresh") {
                vm.isCollaborationRefresh = true;
            }
            if (window.location.hash === "#/campaigns/secondChance") {
                vm.isSecondChance = true;
                if (c.title === 'LDoS Date' || c.title === 'Shipment / Processing Date' || c.title === 'Covered Line / Term End Date') {
                    c.active = false;
                }
            }

            //do not remove the code this is to optimize the calls
            if (c.title === "Account" || c.title === "Product") {
                if (c.active) {
                    $scope.activeSubTab = CiscoUtilities.getSubTab();
                    if (vm.isSecurityRefresh && c.title === "Product") {
                        vm.advancedFilters["2"].disabled = [];
                        vm.advancedFilters["2"].disabled[0] = true;
                    }
                    if (vm.isCollaborationRefresh && c.title === "Product") {
                        vm.advancedFilters["2"].disabled = [];
                        vm.advancedFilters["2"].disabled[0] = true;
                    }
                    if (vm.isSecondChance && c.title === "Product") {
                        vm.advancedFilters["2"].disabled = [false, false, false, false, false, false, true, true];
                    }
                    // To disable the corresponding filters of subscription on click of product filter;
                    if (["security", "collaboration", "other"].includes($scope.activeSubTab) && c.title === "Product") {
                        vm.advancedFilters["2"].disabled = [];
                        if ($scope.activeSubTab !== "other" && c.title === "Product") {
                            vm.advancedFilters["2"].disabled[0] = true;
                        }
                        vm.advancedFilters["2"].disabled[7] = true;
                    }
                    vm.getFiltersDropdown(c, 0);
                }
            }
            if (c.title === 'Dates') {
                if (vm.isSecondChance) {
                    vm.advancedFilters['4'].categories['1'].disabled = [true, true, true, true];
                    // vm.advancedFilters['4'].categories.forEach(e) {

                    // }
                }
            }
        };

        $scope.rzLoader = function () {
            $timeout(function () {
                $scope.$broadcast('rzSliderForceRender');
            });
        }


        vm.clearFilters = function (category, keepApplied) {
            selectedSAVForSalesLevel = []; // when you search 2nd time for a sav after clearing filters,sl1-sl6 are not loading. so clearing previous sav name here 
            selectedServiceSO = [];
            var cF = {};
            if (!angular.isDefined(vm.propensityToRefresh)) {
                vm.propensityToRefresh = {};
            }
            if (!angular.isDefined(vm.propensityToTSAttach)) {
                vm.propensityToTSAttach = {};
            }
            cF.category = category;
            cF.keepApplied = keepApplied;
            isSavClicked = false;
            applyButtonClicked = false;
            isClearAllClicked = true;
            vm.filtersChecked = 0;
            vm.filtersChecked = $scope.propAttachCount + $scope.propRefreshCount;
            vm.partnerFilterObj = {};
            vm.contractNameFilterObj = {};
            if (typeof keepApplied === 'undefined' || typeof keepApplied === 'boolean') {
                vm.propensityToRefresh.minValue = 1;
                vm.propensityToRefresh.maxValue = 5;
                vm.propensityToTSAttach.minValue = 0;
                vm.propensityToTSAttach.maxValue = 100;
                vm.propInsightSliderFilter = false;
                $scope.insightsTabTouched = false;
            }
            if (vm.advancedFilters) {
                $scope.resetYear(vm.advancedFilters[6]);
            }
            if (angular.isDefined(vm.advancedFilters) && angular.isDefined(vm.advancedFilters[1].selected[1]) && vm.advancedFilters[1].selected[1] !== null) {
                if (vm.advancedFilters[1].selected[1].length > 0) {
                    vm.advancedFilters[1].selected[1] = [];
                }
            }
            $rootScope.$broadcast('clear-filter-params', cF);

        }

        $rootScope.$on('view-applied-filter-date', function (data, event) {
            //Onclearing of filters in viewapplied after opening bookmark
            if (vm.isBookmarkActive()) {
                vm.viewAppliedChangedBookmark = true;
            } else {
                vm.viewAppliedChangedBookmark = false;
            }
            var tempFilters = angular.copy(vm.advancedFilters);
            var flagNeedPartnerCall = false;
            vm.gvscsFilterToStrng = "";
            if (angular.isDefined(event.filtersData[1].selected[7])) {
                vm.gvscsFilterToStrng = event.filtersData[1].selected[7]["0"];
                vm.advancedFilters[1].selected[7] = "";
                vm.advancedFilters[1].selected[7] = vm.gvscsFilterToStrng;
            }
            $scope.appliedFilters = event.filtersData;
            vm.advancedFilters = event.filtersData;
            vm.advancedFilters[4] = getDateFormat(event.filtersData[4]); //Changes for enabling fixed date

            vm.filtersChecked = 0;
            vm.filtersChecked = $scope.propAttachCount + $scope.propRefreshCount;
            for (var j = 0; j < vm.advancedFilters.length; j++) {
                if (vm.advancedFilters[j].title === 'Dates') {
                    for (var x = 0; x < vm.advancedFilters[j].categories.length; x++) {
                        if (vm.advancedFilters[j].categories[x].rangeTo === "") {
                            vm.advancedFilters[j].categories[x].rangeTo = null;
                        }
                        //Changes for enabling fixed date
                        if (vm.advancedFilters[j].categories[x].dates !== 'fixedDate') {
                            if (vm.advancedFilters[j].categories[x].rangeTo !== null) {
                                vm.filtersChecked += 1;
                            }
                        } else {
                            if (vm.advancedFilters[j].categories[x].fixedDate !== null && vm.advancedFilters[j].categories[x].relativeDate !== null) {
                                vm.filtersChecked += 1;
                            }
                        }
                        /*if((vm.advancedFilters[j].categories[x].rangeTo !== null) || (vm.advancedFilters[j].categories[x].fixedDate !== null && vm.advancedFilters[j].categories[x].relativeDate !== null))
                            vm.filtersChecked += 1;*/
                        /*else if(vm.advancedFilters[j].categories[x].rangeTo != "")
                            vm.filtersChecked += 1;*/
                    }
                } else if (vm.advancedFilters[j].title === 'Status') {
                    if (vm.advancedFilters[j].categories && vm.advancedFilters[j].categories.length > 0) {
                        for (var k = 0; k < vm.advancedFilters[j].categories.length; k++) {
                            if (vm.advancedFilters[j].categories[k].title !== "SWEEPs Contracts") {
                                if (vm.advancedFilters[j].categories[k].selected !== "All") {
                                    vm.filtersChecked += 1;
                                    vm.isFiltersChecked = true;
                                }
                            } else {
                                if (vm.advancedFilters[j].categories[k].selected !== "No") {
                                    vm.filtersChecked += 1;
                                    vm.isFiltersChecked = true;
                                }
                            }
                        }
                    }
                } else {
                    if (vm.advancedFilters[j].selected && vm.advancedFilters[j].selected.length > 0) {
                        for (var k = vm.advancedFilters[j].selected.length - 1; k >= 0; k--) {
                            if (vm.advancedFilters[j].selected[k] && vm.advancedFilters[j].selected[k].length > 0) {
                                vm.isFiltersChecked = true;
                                vm.filtersChecked += 1;
                            }
                        }
                    }
                }
            }
            if (vm.advancedFilters[0].selected[6] !== undefined) { // Changes for DE135076
                vm.getFiltersDropdown(vm.advancedFilters[0], 7);
            }

            if (vm.advancedFilters[1].selected[0] !== undefined && vm.advancedFilters[1].selected[0] !== null) { // changes for DE150613
                if (vm.advancedFilters[1].selected[0].length === 0) {
                    vm.getFiltersDropdown(vm.advancedFilters[0], 0);
                }
            }
            //change for DE153924 - was not showing all the values in SL1 when cleared all the sales level from view applied with sav selected
            if (vm.advancedFilters[0].selected[0] !== undefined && vm.advancedFilters[0].selected[0] !== null) {
                if (vm.advancedFilters[0].selected[0].length === 0) {
                    vm.getFiltersDropdown(vm.advancedFilters[0], 0);
                }
            }
            //Change for reseting the parteners object if we clear selected sales from view Applied using X
            if (vm.advancedFilters[0].selected !== undefined && vm.advancedFilters[0].selected !== null) {
                if (vm.advancedFilters[0].selected.length === 0) {
                    vm.getFiltersDropdown(vm.advancedFilters[0], 0);
                }
            }

            if (vm.isPidUpload === true && vm.advancedFilters[2].selected[0].length === 0) { 
                if (vm.advancedFilters[2].selected[4] !== undefined) {
                    var prodTypeTemp = [];
                    prodTypeTemp = vm.advancedFilters[2].selected[4];
                }
                if (vm.advancedFilters[2].selected[5] !== undefined) {
                    var warrantyTemp = [];
                    warrantyTemp = vm.advancedFilters[2].selected[5];
                }
                vm.getFiltersDropdown(vm.advancedFilters[2], 0);
                if (prodTypeTemp !== undefined) {
                    vm.advancedFilters[2].selected[4] = prodTypeTemp;
                }
                if (warrantyTemp !== undefined) {
                    vm.advancedFilters[2].selected[5] = warrantyTemp;
                }
            }
            if (JSON.stringify(tempFilters[0].selected) != JSON.stringify(vm.advancedFilters[0].selected)) {
                if (vm.advancedFilters[1].selected[6] !== undefined && vm.advancedFilters[1].selected[6] !== null) {
                    if (vm.advancedFilters[1].selected[6].length > 0 && (vm.advancedFilters[0].selected[0] === undefined || vm.advancedFilters[0].selected[0] === null)) {
                        var selectedpartner = vm.advancedFilters[1].selected[6];
                        vm.advancedFilters[1].levels[6] = [];
                        for (var a = 0; a < selectedpartner.length; a++) {
                            vm.advancedFilters[1].levels[6].push({
                                "keys": selectedpartner[a]
                            });
                        }
                    } else if (vm.advancedFilters[1].selected[6].length > 0 && vm.advancedFilters[0].selected[0] !== undefined) {
                        if (vm.advancedFilters[0].selected[0].length === 0) {
                            var selectedpartner = vm.advancedFilters[1].selected[6];
                            vm.advancedFilters[1].levels[6] = [];
                            for (var a = 0; a < selectedpartner.length; a++) {
                                vm.advancedFilters[1].levels[6].push({
                                    "keys": selectedpartner[a]
                                });
                            }
                        } else {
                            setPartnerFilterObj(vm.advancedFilters[0], vm.advancedFilters[0].selected.length);
                            flagNeedPartnerCall = true;
                        }
                    }
                }
            }
            if (JSON.stringify(tempFilters[1].selected) != JSON.stringify(vm.advancedFilters[1].selected)) {
                setPartnerFilterObj(vm.advancedFilters[1], vm.advancedFilters[1].selected.length);
                flagNeedPartnerCall = true;
            }
            if (flagNeedPartnerCall) {
                $scope.filterPartnerSearch();
            }

            vm.getFiltersCount(vm.advancedFilters)
            vm.applyFilters(); //end
        });


        var clearFilterParams = $rootScope.$on('clear-filter-params', function (event, data) {
            $http.get("config/filters.json", {}).then(function (d) {
                var i = vm.userInfo.salesLevel - 1;
                // angular.forEach(vm.advancedFilters[0].levels, function(selectedFilter){
                //                         //vm.advancedFilters = d.data;
                //     if(angular.isDefined(selectedFilter.selected)){
                //     } else {
                //         vm.advancedFilters[0] = d.data[0];
                //          vm.filtersChecked = 0;
                //          angular.forEach(vm.advancedFilters, function(filter) {
                //                vm.getFiltersDropdown(filter, i);
                //          })
                //     }
                //  })
                vm.advancedFilters[3] = d.data[3];
                vm.advancedFilters[4] = d.data[4];
                vm.advancedFilters[5] = d.data[5];
                vm.advancedFilters[1].selected = [];
                vm.advancedFilters[1] = d.data[1];
                vm.advancedFilters[1].levels[0] = [{}];
                vm.advancedFilters[1].levels[1] = [];
                vm.advancedFilters[1].levels[2] = [];
                vm.advancedFilters[1].partnerSearch = "";
                vm.advancedFilters[1].savSearch = "";
                vm.advancedFilters[2] = d.data[2];
                vm.tempAdvancedFilterObj = angular.copy(d.data);
                vm.filtersChecked = 0;
                vm.filtersChecked = $scope.propAttachCount + $scope.propRefreshCount;
                if (window.location.hash === "#/campaigns/collaborationRefresh") {
                    vm.advancedFilters["2"].disabled = [];
                    vm.advancedFilters["2"].disabled[0] = true;
                    vm.advancedFilters[2].selected[0] = [];
                    vm.advancedFilters[2].selected[0].push("Collaboration");
                }
                // disabling the filters for subscription bookmarks
                resetSubscriptionFilters(); // replaced disableFiltersForSubscription() b'cos of duplication
                if (i === 0) {
                    vm.advancedFilters[0] = d.data[0];
                    angular.forEach(vm.advancedFilters, function (filter) {
                        vm.getFiltersDropdown(filter, i);
                    })
                } else {
                    for (var j = vm.advancedFilters[0].levels.length; j > i; j--) {
                        vm.advancedFilters[0].levels[j - 1] = [];
                    }
                    angular.forEach(vm.advancedFilters, function (filter) {
                        vm.getFiltersDropdown(filter, i);
                        i = 0;
                    })
                }
                for (var i in vm.appliedFilters) {
                    if (vm.appliedFilters[i].categoryId === 'coverage') {
                        vm.appliedFilters.splice(i, 1);
                    }
                    if (vm.appliedFilters[i].categoryId === 'network') {
                        vm.appliedFilters.splice(i, 1);
                    }
                    if (vm.appliedFilters[i].categoryId === 'sweeps') {
                        vm.appliedFilters.splice(i, 1);
                    }
                    if (vm.appliedFilters[i].categoryId === 5) {
                        vm.appliedFilters[i].refresh = ["Unlikely", "Low", "Medium", "High", "Very Likely"];
                    }
                    if (vm.appliedFilters[i].categoryId === 6) {
                        vm.appliedFilters[i].maxValue = 100;
                        vm.appliedFilters[i].minValue = 0;
                    }
                }
                vm.propInsightSliderFilter = false;
                vm.applyFilters();
            });
            // var category = data.category;
            // var keepApplied = data.keepApplied;
            // if (!category || category === 1) {
            //     for (var i = vm.userInfo.salesLevel; i <= 6; i++) {
            //         if (i === vm.userInfo.salesLevel) {
            //             //vm.setNextSalesLevelSelection(i);
            //         } else {
            //             vm.salesLevel[i] = false;
            //         }
            //     }
            //     vm.accounts = [];
            // }
            // if (!category || category === 2) {
            //     angular.forEach(vm.filters, function(c) {


        });


        var removeFiltersOne = $rootScope.$on('remove-filters', function (event, data) {
            var i = vm.appliedFilters.indexOf(data);
            $rootScope.$broadcast('active-drill', data.title);
            if (data.categoryId === 1) {
                if (data.level < 5) {
                    vm.accounts = [];
                }
                vm.setNextSalesLevelSelection(data.level);
                var categoryFound = false;
                do {
                    if (vm.appliedFilters[i] && vm.appliedFilters[i].categoryId === 1) {
                        var salesChildFilter = vm.appliedFilters.splice(i, 1);
                        if (salesChildFilter[0].level === data.level) {
                            vm.salesLevel[salesChildFilter[0].level].selected = '';
                        } else {
                            vm.salesLevel[salesChildFilter[0].level] = false;
                        }
                        categoryFound = true;
                    } else {
                        categoryFound = false;
                    }
                } while (categoryFound);
            } else if (data.categoryId == 3) {
                var accountFound = false;
                do {
                    if (vm.appliedFilters[i] && vm.appliedFilters[i].categoryId === 3) {
                        var accountsChildFilter = vm.appliedFilters.splice(i, 1);
                        if (accountsChildFilter[0].level === data.level) {
                            vm.accounts[accountsChildFilter[0].level].selected = '';
                        } else {
                            vm.accounts[accountsChildFilter[0].level] = false;
                        }
                        accountFound = true;
                    } else {
                        accountFound = false;
                    }
                } while (accountFound);
            } else if (data.categoryId === 2) {
                var filters = $filter('filter')(vm.filters, {
                    categoryId: 2
                });
                filters = filters[0];
                for (var k = 0; k < vm.filters[0].filters.length; k++) {
                    if (vm.filters[0].filters[k].title === data.title) {
                        vm.filters[0].filters[k].checked = false;
                        vm.checkParent(vm.filters[0].filters, vm.filters[0]);
                    }
                }
            } else if (data.categoryId === 4) {
                var filters = $filter('filter')(vm.filters, {
                    categoryId: 4
                });
                filters = filters[0];
                filters.selected = '';
            }
            //vm.getSelectedCount();
            vm.applyFilters();
            return;
        })


        var rootApplyBookmark = $rootScope.$on('apply-bookmark', function (event, data) {
            vm.messageCheck = false;
            //Receting the variables, incase of using url to open the bookmark.
            vm.isBookmarkActive = GlobalBookmarkServ.isBookmarkActive;
            vm.isCollabBookmarkActive = GlobalBookmarkServ.isCollabBookmarkActive;
            $sessionStorage.put('isCollabActive', true);
            if (vm.isBookmarkActive()) {
                vm.cmngFrmBookMark = true;
            }
            vm.salesLevelInit();
            vm.applyFilters();
        });

        vm.filtersChanged = function () {
            var bookmarkFilters = [];
            if (vm.isBookmarkActive()) {
                if (angular.isDefined(vm.advancedFilters["0"].disabled)) {
                    for (var i = 0; i <= vm.advancedFilters["0"].disabled.length; i++) {
                        if (vm.advancedFilters["0"].disabled[i] === true) {
                            bookmarkFilters.push(vm.appliedFilters[i]);
                        }
                    }
                }
                bookmarkFilters.push.apply(bookmarkFilters, GlobalBookmarkServ.bookmark.filter[0]);
                var appliedFilters = vm.appliedFilters;
                //OnChange of filters in viewapplied in bookmark
                if (vm.viewAppliedChangedBookmark) {
                    vm.messageCheck = false;
                } else {
                    vm.messageCheck = true;
                }
                //BookmarkFilters have two arrays we only need to compare the first one -G
                //Change added for filter change message
                vm.isFiltersChanged = !angular.equals(bookmarkFilters, appliedFilters);
                if (vm.cmngFrmBookMark) {
                    vm.isFiltersChanged = false;
                }
                //On Copy Url this check we are making false so that bookmark criteria message will not print
                if (vm.messageCheck) {
                    vm.isFiltersChanged = false;
                }
                if (window.location.hash.indexOf("bkmark") > 0 && vm.TempChecking) {
                    vm.isFiltersChanged = true;
                }
                if (vm.TempChecking)
                    vm.isFiltersChanged = true;
            } else {
                vm.isFiltersChanged = false;
            }
            $rootScope.$broadcast('filter-changed', vm.isFiltersChanged);
        };


        vm.applyFilters = function (event) {
            vm.accounts = [];
            vm.appliedFilters = [];
            vm.messageCheck = true;
            vm.TempChecking = false; //Changes for only On Apply Click if param is there then we are making tempcheck true otherwies false
            if (angular.isDefined(event) && event !== null) {
                applyButtonClicked = true; //changes for updating the sales filters in the session once we click on apply directly after selecting sav
                vm.TempChecking = true;
            }
            if (vm.advancedFilters[0].slug === 'sales') {
                for (var i = 0; i < 6; i++) {
                    if (angular.isDefined(vm.advancedFilters[0].selected[i])) {
                        if (vm.advancedFilters[0].selected[i] !== null) {
                            if (vm.advancedFilters[0].selected[i].length > 0) {
                                vm.appliedFilters.push({
                                    "title": vm.advancedFilters[0].selected[i],
                                    "level": i,
                                    "categoryId": "sales",
                                    "levels_values": vm.advancedFilters[0].levels[i]
                                });
                            }
                        }
                    }
                }

                if (vm.advancedFilters[0].selected.length === 7) {
                    if (vm.advancedFilters[0].selected[6].length != 0) {
                        vm.appliedFilters.push({
                            "title": vm.advancedFilters[0].selected[6],
                            "level": 1,
                            "categoryId": "salesAM"
                        });
                        for (var i = 0; i < vm.advancedFilters[0].selected[6].length; i++) {
                            vm.accounts.push(vm.advancedFilters[0].selected[6][i]);
                        }
                    }
                }

            }

            if (vm.advancedFilters[2].slug === 'product') {
                for (var i = 0; i < 8; i++) {

                    if (angular.isDefined(vm.advancedFilters[2].selected[i])) {
                        if (vm.advancedFilters[2].selected[i] !== null) {
                            if (vm.advancedFilters[2].selected[i].length > 0) {
                                vm.appliedFilters.push({

                                    "title": vm.advancedFilters[2].selected[i],
                                    "level": i,
                                    "categoryId": "product",
                                    "levelName": vm.advancedFilters[2].levels_name[i]
                                });
                            }
                        }
                    }


                }
            }

            if (vm.advancedFilters[1].slug === 'account') {
                for (var i = 0; i < vm.advancedFilters[1].selected.length; i++) {
                    if (angular.isDefined(vm.advancedFilters[1].selected[i])) {
                        if (vm.advancedFilters[1].selected[i] !== null) {
                            if (vm.advancedFilters[1].selected[i].indexOf("<?~>") > -1) {
                                //vm.advancedFilters[j].selected[i] = vm.advancedFilters[j].selected[i].replace("<?~>","").split("")[0];
                            }
                            if (typeof (vm.advancedFilters[1].selected[i]) === "string") {
                                vm.gvscsFilter = "";
                                vm.gvscsFilter = vm.advancedFilters[1].selected[i];
                                vm.advancedFilters[1].selected[i] = [];
                                vm.advancedFilters[1].selected[i].push(vm.gvscsFilter);
                            }

                            if (vm.advancedFilters[1].selected[i].length) {
                                vm.appliedFilters.push({
                                    "title": vm.advancedFilters[1].selected[i],
                                    "level": i,
                                    "categoryId": "account",
                                    "levelName": vm.advancedFilters[1].levels_name[i]
                                });
                            }
                        }
                    }
                }

            }

            if (vm.advancedFilters[3].slug === 'services') {
                for (var i = 0; i < vm.advancedFilters[3].selected.length; i++) {
                    if (angular.isDefined(vm.advancedFilters[3].selected[i])) {
                        if (vm.advancedFilters[3].selected[i] !== null) {
                            if (vm.advancedFilters[3].selected[i].length > 0) {
                                vm.appliedFilters.push({
                                    "title": vm.advancedFilters[3].selected[i],
                                    "level": i,
                                    "categoryId": "services",
                                    "levelName": vm.advancedFilters[3].levels_name[i]
                                });
                            }
                        }
                    }
                }
            }

            if (vm.advancedFilters[4].type === 'date') {
                for (var i = 0; i < vm.advancedFilters[4].categories.length; i++) {
                    //Change for date filter 
                    var pos = vm.advancedFilters[4].categories[i].month;
                    var rF = vm.advancedFilters[4].categories[i].rangeFrom;
                    var rT = vm.advancedFilters[4].categories[i].rangeTo;
                    var per = vm.advancedFilters[4].categories[i].selected;
                    //Changes for enabling fixed date
                    var fixDate = vm.advancedFilters[4].categories[i].fixedDate;
                    var relDate = vm.advancedFilters[4].categories[i].relativeDate;
                    //var dir = vm.advancedFilters[3].categories[i].direction;
                    if (!((rT && rF && !isNaN(rF) && !isNaN(rT) && parseInt(rT) >= parseInt(rF) && per && (rF !== '-0') && (rT !== '-0')) || (fixDate && relDate))) {
                        //vm.advancedFilters[4].categories[i].rangeFrom = null;
                        //vm.advancedFilters[4].categories[i].rangeTo = null;
                        //vm.advancedFilters[4].categories[i].period = null;
                        //vm.advancedFilters[4].categories[i].direction = null;
                    } // End for date filter
                    if (rF === "" && rT === "" && !fixDate && !relDate) { // 
                        vm.advancedFilters[4].categories[i].active = undefined;
                    }
                    if (angular.isDefined(vm.advancedFilters[4].categories[i].active)) {
                        //Chnages for enabling fixed date
                        var periodData = vm.advancedFilters[4].categories[i].selected;
                        var toDate = vm.advancedFilters[4].categories[i].rangeTo;
                        var fromDate = vm.advancedFilters[4].categories[i].rangeFrom;
                        if (vm.advancedFilters[4].categories[i].dates === 'fixedDate') {
                            vm.advancedFilters[4].categories[i].selected = "Months";
                            periodData = "fixed";
                            fromDate = $filter('date')(vm.advancedFilters[4].categories[i].fixedDate, 'dd-MMM-yyyy');
                            toDate = $filter('date')(vm.advancedFilters[4].categories[i].relativeDate, 'dd-MMM-yyyy');
                        }
                        // Able to apply fixed date range without End Date.
                        if (angular.isDefined(fromDate) && angular.isDefined(toDate) && fromDate !== null && toDate !== null && toDate !== "" && fromDate !== "") {
                            vm.appliedFilters.push({
                                "to": toDate,
                                "from": fromDate,
                                //"direction": vm.advancedFilters[4].categories[i].direction,
                                "period": periodData,
                                "categoryId": "date",
                                "title": vm.advancedFilters[4].categories[i].title,
                                "filterType": vm.advancedFilters[4].categories[i].dates
                            });
                        }
                    }
                }
            }

            if (vm.advancedFilters[5].categories[0].title === 'Coverage') {
                vm.appliedFilters.push({
                    "coverage": vm.advancedFilters[5].categories[0].selected,
                    "categoryId": "coverage",
                    "title": vm.advancedFilters[5].categories[0].title
                });
            }

            if (vm.advancedFilters[5].categories[1].title === 'Network Collection') {
                vm.appliedFilters.push({
                    "network": vm.advancedFilters[5].categories[1].selected,
                    "categoryId": "network",
                    "title": vm.advancedFilters[5].categories[1].title
                });
            }
            if (vm.advancedFilters[5].categories[2].title === 'SWEEPs Contracts') {
                vm.appliedFilters.push({
                    "sweeps": vm.advancedFilters[5].categories[2].selected,
                    "categoryId": "sweeps",
                    "title": vm.advancedFilters[5].categories[2].title
                });
            }

            if (angular.isDefined(vm.advancedFilters[6])) {
                if (vm.advancedFilters[6].type === 'dataset') {
                    vm.appliedFilters.push({
                        "categoryId": "dataset",
                        "coveredStartDate": vm.advancedFilters[6].categories[0].years.from,
                        "coveredEndDate": vm.advancedFilters[6].categories[0].years.to,
                        "uncoveredStartDate": vm.advancedFilters[6].categories[1].years.from,
                        "uncoveredEndDate": vm.advancedFilters[6].categories[1].years.to
                    });
                }
            }


            if (vm.propInsightSliderFilter) {
                if (vm.propInsightSliderFilter.lowerAttachPropensity !== undefined) {
                    $rootScope.lowerAttachPropensity = vm.propInsightSliderFilter.lowerAttachPropensity;
                }
                if (vm.propInsightSliderFilter.higherAttachPropensity !== undefined) {
                    $rootScope.higherAttachPropensity = vm.propInsightSliderFilter.higherAttachPropensity;
                }
                //The value is setting as [null] somewhere, I have debugged this problem for too long but can't find the source.
                //Adding work arround, should be looked into again -G
                if (vm.propInsightSliderFilter.refreshPropensity !== undefined && vm.propInsightSliderFilter.refreshPropensity !== "[null]") {
                    $rootScope.refreshPropensity = vm.propInsightSliderFilter.refreshPropensity;
                }
                if ($rootScope.refreshPropensity !== undefined) {
                    vm.propInsightSliderFilter.refreshPropensity = $rootScope.refreshPropensity;
                }
                if (vm.isTsAttachFilter && vm.propInsightSliderFilter.refreshPropensity && vm.propInsightSliderFilter.refreshPropensity.length < 48) {
                    vm.appliedFilters.push({
                        "title": "propensity",
                        "categoryId": 5,
                        "refresh": vm.propInsightSliderFilter.refreshPropensity
                    })
                }

                if ($rootScope.lowerAttachPropensity !== undefined) {
                    vm.propInsightSliderFilter.lowerAttachPropensity = $rootScope.lowerAttachPropensity;
                }
                if ($rootScope.lowerAttachPropensity !== undefined) {
                    vm.propInsightSliderFilter.higherAttachPropensity = $rootScope.higherAttachPropensity;
                }

                if (vm.isTsAttachFilter) {
                    vm.appliedFilters.push({
                        "title": "attachPropensity",
                        "categoryId": 6,
                        "minValue": vm.propInsightSliderFilter.lowerAttachPropensity,
                        "maxValue": vm.propInsightSliderFilter.higherAttachPropensity
                    })
                }


            }

            for (var i = 0; i < vm.filters.length; i++) {
                if (vm.filters[i].checked && false) {
                    var s = angular.copy(vm.filters[i]);
                    s.title = 'All ' + s.title;
                    s.categoryId = 2;
                    vm.appliedFilters.push(s);
                    continue;
                }
                if (vm.filters[i].type === 'radio') {
                    if (vm.filters[i].selected) {
                        vm.appliedFilters.push({
                            "title": vm.filters[i].selected,
                            "categoryId": 4
                        });
                    }
                } else {
                    for (var j = 0; j < vm.filters[i].filters.length; j++) {
                        if (vm.filters[i].filters[j].checked) {
                            vm.filters[i].filters[j].categoryId = 2;
                            vm.appliedFilters.push(vm.filters[i].filters[j]);
                        }
                    }
                }
            }

            vm.getFiltersCount(vm.advancedFilters);
            $scope.$emit('CountOnTab', vm.filtersChecked);
            //if(vm.isPidUpload !== true){
            $sessionStorage.advancedFilters = JSON.stringify(vm.advancedFilters);
            $sessionStorage.put('advancedFilters', JSON.stringify(vm.advancedFilters));
            //}

            vm.filterToController = {};
            vm.filterToController.appliedFilters = vm.appliedFilters;
            vm.filterToController.accounts = vm.accounts;
            vm.filterToController.changeAccountManager = vm.changeAccountManager;
            vm.filterToController.nodeName = vm.salesLevel;
            vm.filterToController.salesLevel = vm.salesLevel;
            //count incerament for update for insights in bookmark -shankar
            //uncommenting it as the view applied count was not showing up if we navigate to Security Refresh
            //setTimeout(function(){
            vm.filterToController.appliedFiltersCount = vm.filtersChecked;
            //},500);
            //vm.appliedFilters.isCollabBookmark = vm.isCollabBookmarkActive(); 
            $sessionStorage.put('filters', JSON.stringify(vm.appliedFilters));
            //We need to call this function here since vm.appliedFilters needs
            //all the updated values to be cpompared with Bookmark filters -G
            vm.filtersChanged();
            vm.cmngFrmBookMark = false;
            filtersServ.checkIfSalesLevelIsDrilled(vm.advancedFilters[0]);
            //count incerament for update for insights in bookmark -shankar
            //setTimeout(function(){
            $rootScope.$broadcast('apply-filter', vm.filterToController);
            //},1000);


        };

        vm.propInsightSliderFilter = {};
        $http.get("config/insight_slider.json", {}).then(function (d) {
            vm.propensityToRefresh = {
                minValue: d.data.propensityToRefresh.minValue,
                maxValue: d.data.propensityToRefresh.maxValue,
                options: {
                    floor: d.data.propensityToRefresh.minValue,
                    ceil: d.data.propensityToRefresh.maxValue,
                    showTicksValues: true,
                    translate: function (value) {
                        return d.data.propensityToRefresh["valueTag"][value - 1];
                    }
                }
            };

            vm.propensityToTSAttach = {
                minValue: d.data.propensityToTSAttach.minValue,
                maxValue: d.data.propensityToTSAttach.maxValue,
                options: {
                    floor: d.data.propensityToTSAttach.minValue,
                    ceil: d.data.propensityToTSAttach.maxValue,
                    showTicksValues: d.data.propensityToTSAttach.gap,
                    translate: function (value) {
                        return value + '%';
                    }
                }
            };
            vm.refreshPropFiltersForBookmarks();
        });

        /*
         * Adding this code for the issue where bookmark is giving updated message even though
         * the user chanes it back to its default state.
         * NOTE FOR THE FUTURE : add propensity filters in  Advanced filter object.
         */
        vm.refreshPropFiltersForBookmarks = function () {
            if (vm.isBookmarkActive()) {
                var bookmark = GlobalBookmarkServ.bookmark;
                var flag = {};
                if (bookmark.filter[0]) {
                    for (var i = 0; i < bookmark.filter[0].length; i++) {
                        if (bookmark.filter[0][i] && bookmark.filter[0][i].title === "attachPropensity") {
                            flag.lowerAttachPropensity = bookmark.filter[0][i].minValue;
                            flag.higherAttachPropensity = bookmark.filter[0][i].maxValue;
                        } else if (bookmark.filter[0][i] && bookmark.filter[0][i].title === "propensity") {
                            flag.refreshPropensity = bookmark.filter[0][i].refresh
                        }
                    }
                }
                vm.isTsAttachFilter = true;
                vm.isFiltersChecked = true;
                var tempCheck = ["Unlikely", "Low", "Medium", "High", "Very Likely"];
                var topValue = 1;
                var bottomValue = 5;

                if (flag.refreshPropensity) {
                    var refArr;
                    if (typeof flag.refreshPropensity === "object") {
                        refArr = flag.refreshPropensity;
                    } else {
                        refArr = JSON.parse(flag.refreshPropensity);
                    }

                    for (var i = 0; i < tempCheck.length; i++) {
                        if (tempCheck[i] === refArr[0]) {
                            topValue = i + 1;
                        }
                        if (tempCheck[i] === refArr[refArr.length - 1]) {
                            bottomValue = i + 1;
                        }
                    }
                }
                //insight filter display in View applied filter
                vm.propInsightSliderFilter = flag;
                vm.propensityToRefresh = {
                    minValue: topValue,
                    maxValue: bottomValue,
                    options: {
                        floor: 1,
                        ceil: 5,
                        showTicksValues: true,
                        translate: function (value) {
                            return tempCheck[value - 1];
                        }
                    }
                };

                vm.propensityToTSAttach = {
                    minValue: flag.lowerAttachPropensity,
                    maxValue: flag.higherAttachPropensity,
                    options: {
                        floor: 0,
                        ceil: 100,
                        showTicksValues: 20,
                        translate: function (value) {
                            return value + '%';
                        }
                    }
                };
            }
        };

        //adding watch on propensity filter
        var propensityToRefreshWatch = $scope.$watch('vm.propensityToRefresh', function (newVal, oldVal) {
            var defaultPropensityToRefresh = JSON.stringify({
                "maxValue": 5,
                "minValue": 1
            });
            if (newVal !== undefined) {
                if (newVal.maxValue === undefined || newVal.minValue === undefined) {
                    var latestPropRefresh = JSON.stringify({
                        "maxValue": 5,
                        "minValue": 1
                    });
                } else {
                    var latestPropRefresh = JSON.stringify({
                        "maxValue": newVal.maxValue,
                        "minValue": newVal.minValue
                    });
                }
            }
            if (newVal != oldVal) {
                vm.isFiltersChecked = true;
                if (latestPropRefresh != defaultPropensityToRefresh) {
                    if ($scope.propRefreshCount !== undefined && $scope.propRefreshCount === 0) {
                        vm.filtersChecked += 1;
                        $scope.propRefreshCount++;
                    }
                } else {
                    if ($scope.propRefreshCount > 0) {
                        vm.filtersChecked -= 1;
                        $scope.propRefreshCount--;
                    }
                }
                //vm.isTsAttachFilter =  false; 
                vm.propInsightSliderFilter = {};
                var propensityRefreshValues = [];
                for (var i = vm.propensityToRefresh.minValue; i <= vm.propensityToRefresh.maxValue; i++) {
                    propensityRefreshValues.push(vm.propensityToRefresh.options.translate(i));
                }

                vm.propInsightSliderFilter.refreshPropensity = JSON.stringify(propensityRefreshValues);
            } else {
                vm.propInsightSliderFilter = {};
                vm.propInsightSliderFilter.refreshPropensity = ["Unlikely", "Low", "Medium", "High", "Very Likely"];
            }
        }, true);

        var propensityToTSAttachWatch = $scope.$watch('vm.propensityToTSAttach', function (newVal, oldVal) {
            var defaultPropensityToAttach = JSON.stringify({
                "maxValue": 100,
                "minValue": 0
            });
            if (newVal !== undefined) {
                if (newVal.maxValue === undefined || newVal.minValue === undefined) {
                    var latestPropAttach = JSON.stringify({
                        "maxValue": 100,
                        "minValue": 0
                    });
                } else {
                    var latestPropAttach = JSON.stringify({
                        "maxValue": newVal.maxValue,
                        "minValue": newVal.minValue
                    });
                }
            }
            if (!vm.propInsightSliderFilter) {
                vm.propInsightSliderFilter = {};
            }
            if (newVal != oldVal) {
                vm.isFiltersChecked = true;
                if (latestPropAttach != defaultPropensityToAttach) {
                    if ($scope.propRefreshCount !== undefined && $scope.propAttachCount === 0) {
                        vm.filtersChecked += 1;
                        $scope.propAttachCount++;
                    }
                } else {
                    if ($scope.propAttachCount > 0) {
                        vm.filtersChecked -= 1;
                        $scope.propAttachCount--;
                    }
                }

                vm.isTsAttachFilter = true;
                vm.propInsightSliderFilter.lowerAttachPropensity = vm.propensityToTSAttach.minValue;
                vm.propInsightSliderFilter.higherAttachPropensity = vm.propensityToTSAttach.maxValue;
            } else {
                vm.isTsAttachFilter = false;
                vm.propInsightSliderFilter.lowerAttachPropensity = 0;
                vm.propInsightSliderFilter.higherAttachPropensity = 100;
            }
        }, true);


        $scope.$on('selected-count', function (data, event) {
            //vm.getSelectedCount();

        });

        vm.checkAll = function (a, c) {
            angular.forEach(a, function (o) {
                o.checked = c;
            });
            //vm.getSelectedCount();
        };

        vm.checkParent = function (a, c) {
            var s = true;
            if (!a.length) {
                s = false;
            }
            angular.forEach(a, function (o) {
                if (!o.checked) {
                    s = false;
                }
            });
            c.checked = s;
            //vm.getSelectedCount();
        };

        var callApply = $rootScope.$on('call-apply-filters', function (event, data) {
            if (data === "undrill") {
                vm.accounts = [];
                // removing values from advanced filters incase someone has clicked on undrill
                //without this line Undrill will not work for Account Manager
                if (vm.advancedFilters[0] && vm.advancedFilters[0].selected && vm.advancedFilters[0].selected.length === 7) {
                    vm.advancedFilters[0].selected[6] = [];
                    // when clciked on undrill, it was not showing all the account managers on the third chart
                    if (vm.advancedFilters[1].levels[1].length > 0) {
                        if (vm.advancedFilters[1].selected[1].length > 0)
                            vm.filtersChecked -= 1;
                        vm.advancedFilters[1].selected[1] = [];
                        vm.advancedFilters[1].levels[1] = [];
                    }
                    if (vm.advancedFilters[1].levels[2].length > 0) {
                        if (vm.advancedFilters[1].selected[2].length > 0)
                            vm.filtersChecked -= 1;
                        vm.advancedFilters[1].selected[2] = [];
                        vm.advancedFilters[1].levels[2] = [];
                    }
                    vm.filtersChecked -= 1;
                }
            }
            if (vm.advancedFilters[0] && vm.advancedFilters[0].selected && data && data.eventFrom === "manager") {
                for (var i = 0; i < data.managerName.length; i++) {
                    vm.advancedFilters[0].selected[6] = [];
                    vm.advancedFilters[0].selected[6][i] = data.managerName[i];
                    vm.getFiltersDropdown(vm.advancedFilters[0], 6);
                }
            }
            vm.applyFilters();
        })

        $scope.$on('$destroy', function () {
            callApply();
            clearFilterParams();
            removeFiltersOne();
            rootApplyBookmark();
        })

        //code added for insight filters counter -G
        $scope.increaseCounterForPropFilters = function () {
            if (!$scope.insightsTabTouched) {
                //vm.filtersChecked += 2; // Changes for DE136358 and DE137118
                $scope.insightsTabTouched = true;
            }
        };

        $scope.filterPartnerSearch = function (autoSuggestObj, i) {
            var partnerValues = [];
            var payload = {};
            vm.showList = true;
            if (autoSuggestObj) {
                vm.partnerFilterObj["partnerSearchStrng"] = autoSuggestObj.partnerSearch;
                vm.isPartnerSearch = true;
            } else { 
                vm.partnerFilterObj["partnerSearchStrng"] = null;
            }
            filtersServ.getDropdown(payload, 5, 'partnerSearch').then(function (response) {
                angular.forEach(response.partner, function (keys, partner) {
                    partnerValues.push({
                        "keys": partner
                    });
                })
                // if(partnerValues.length === 0){
                //     partnerValues.push({"keys": "No Search Results"});
                //     vm.showList = false;
                // }
                if (vm.isPartnerSearch && autoSuggestObj && autoSuggestObj.selected[6] && autoSuggestObj.selected[6].length > 0) {
                    angular.forEach(autoSuggestObj.selected[6], function (value) {
                        var flag = false;
                        for (var fil = 0; fil < partnerValues.length; fil++) {
                            if (partnerValues[fil].keys === value) {
                                flag = true;
                            } else {
                                // do nothing
                            }
                        }
                        if (!flag) {
                            partnerValues.push({
                                "keys": value
                            });
                        }
                    });
                }
                if (partnerValues.length === 0) {
                    partnerValues.push({
                        "keys": "No Search Results"
                    });
                    vm.showList = false;
                }
                vm.advancedFilters[1].levels[6] = partnerValues;
                vm.tempAdvanceFilters = angular.copy(vm.advancedFilters); 
                if (vm.tempAdvanceFilters[1].selected[6] !== undefined && vm.tempAdvanceFilters[1].selected[6] !== null) {
                    if (vm.tempAdvanceFilters[1].selected[6].length > 0 && vm.advancedFilters[0].selected[0] !== undefined) {
                        if (vm.advancedFilters[0].selected[0].length > 0) {
                            var partnerSelect = vm.tempAdvanceFilters[1].selected[6];
                            var tempPartner = [];
                            angular.forEach(vm.advancedFilters[1].levels[6], function (value) {
                                var flag = false;
                                for (var fil = 0; fil < partnerSelect.length; fil++) {
                                    if (partnerSelect[fil] === value.keys) {
                                        flag = true;
                                    } else {
                                        // do nothing
                                    }
                                }
                                if (!flag) {
                                    tempPartner.push({
                                        "keys": value.keys
                                    });
                                }
                            });
                            vm.advancedFilters[1].levels[6] = tempPartner;
                            for (var b = 0; b < partnerSelect.length; b++) {
                                vm.advancedFilters[1].levels[6].unshift({
                                    "keys": partnerSelect[b]
                                });
                            }
                            vm.advancedFilters[1].selected[6] = partnerSelect;
                        } else if (vm.advancedFilters[0].selected.length === 0 && (vm.advancedFilters[0].selected[0] === undefined || vm.advancedFilters[0].selected[0] === null)) {
                            var selectedprtnr = vm.advancedFilters[1].selected[6];
                            vm.advancedFilters[1].levels[6] = [];
                            for (var a = 0; a < selectedprtnr.length; a++) {
                                vm.advancedFilters[1].levels[6].push({
                                    "keys": selectedprtnr[a]
                                });
                            }
                        } else if (vm.advancedFilters[0].selected[0] !== undefined) {
                            if (vm.advancedFilters[0].selected[0].length === 0) {
                                var selectptr = vm.advancedFilters[1].selected[6];
                                vm.advancedFilters[1].levels[6] = [];
                                for (var c = 0; c < selectptr.length; c++) {
                                    vm.advancedFilters[1].levels[6].push({
                                        "keys": selectptr[c]
                                    });
                                }
                            }
                        }
                    } else if (vm.tempAdvanceFilters[1].selected[6].length > 0 && vm.advancedFilters[0].selected.length === 0 && (vm.advancedFilters[0].selected[0] === undefined || vm.advancedFilters[0].selected[0] === null) && (!autoSuggestObj || autoSuggestObj === "")) {
                        var selectedprtnr = vm.advancedFilters[1].selected[6];
                        vm.advancedFilters[1].levels[6] = [];
                        for (var a = 0; a < selectedprtnr.length; a++) {
                            vm.advancedFilters[1].levels[6].push({
                                "keys": selectedprtnr[a]
                            });
                        }
                    }
                }

                if (vm.isPartnerSearch) {
                    $timeout(function () {
                        angular.element('#accountFilters_6').focus()
                    }, 0);
                }
            });
        };

        $scope.drillToNextSalesLevel = function (salesValue) {
            var levelSelected = 0;
            if (salesValue) {
                if (filtersServ.selectedSalesValues.indexOf(salesValue) < 0) {
                    filtersServ.selectedSalesValues.push(salesValue);



                    //this applies to only sales level
                    var salesLevelFilter = vm.advancedFilters[0];
                    //select last sales level from levels as the data in the graph
                    //will be based on the last node selected from filter section
                    var levelsIndex;
                    //find the index of selected value from levels
                    var selectedSalesNode;
                    angular.forEach(salesLevelFilter.levels, function (level, levelIndex) {
                        angular.forEach(level, function (salesNode, salesNodeIndex) {
                            if (salesNode.keys === salesValue) {
                                levelsIndex = levelIndex;
                                selectedSalesNode = salesValue;
                            }
                        })
                    })
                    salesLevelFilter.selected[levelsIndex] = [];
                    salesLevelFilter.selected[levelsIndex].push(selectedSalesNode);
                    //creating c object with slug for changeFilterSelection function to pick only sales level
                    filtersServ.salesLevelRemoved = false;
                    //var c = {slug: "sales"}
                    $scope.changeFilterSelection(vm.advancedFilters[0], levelsIndex + 1);
                    if (!angular.isDefined(levelsIndex)) {
                        for (var k = 1; k < vm.advancedFilters[0].levels.length; k++) {
                            if (angular.isDefined(vm.advancedFilters[0].levels[k]) && vm.advancedFilters[0].levels[k].length === 1) {
                                if (k < 6) {
                                    levelSelected = k;
                                }
                            }
                        }
                        filtersServ.getDropdown(vm.advancedFilters[0].selected[levelSelected - 1], levelSelected + 1, vm.advancedFilters[0].slug).then(function (response) {
                            var salesLevelFilterValues = [];
                            angular.forEach(response, function (salesFilterResponse) {
                                angular.forEach(salesFilterResponse, function (keys, salesFilterValues) {
                                    for (var i = 0; i < keys.length; i++) {
                                        salesLevelFilterValues.push({
                                            "keys": keys[i],
                                            "parent": salesFilterValues
                                        });
                                    }
                                })
                            })
                            vm.advancedFilters[0].levels[levelSelected] = salesLevelFilterValues;
                            salesLevelFilter = vm.advancedFilters[0];
                            angular.forEach(salesLevelFilter.levels, function (level, levelIndex) {
                                angular.forEach(level, function (salesNode, salesNodeIndex) {
                                    if (salesNode.keys === salesValue) {
                                        levelsIndex = levelIndex;
                                        selectedSalesNode = salesValue;
                                    }
                                })
                            })
                            salesLevelFilter.selected[levelsIndex] = [];
                            salesLevelFilter.selected[levelsIndex].push(selectedSalesNode);
                            //creating c object with slug for changeFilterSelection function to pick only sales level
                            filtersServ.salesLevelRemoved = false;
                            //var c = {slug: "sales"}
                            $scope.changeFilterSelection(vm.advancedFilters[0], levelsIndex + 1);
                            vm.applyFilters();
                        });
                    }
                } else {
                    //Removing last level selected values
                    //this applies to only sales level
                    var salesLevelFilter = vm.advancedFilters[0];
                    var levelsIndex = salesLevelFilter.selected.length - 1;
                    for (var i = salesLevelFilter.selected.length; i <= salesLevelFilter.selected.length; i--) {
                        if (angular.isDefined(salesLevelFilter.selected[i])) {
                            if (salesLevelFilter.selected[i].length > 0) {
                                salesLevelFilter.selected[i] = [];
                                break;
                            }
                        }
                    }

                    //creating c object with slug for changeFilterSelection function to pick only sales level
                    filtersServ.salesLevelRemoved = false;
                    var c = {
                        slug: "sales"
                    }
                    $scope.changeFilterSelection(vm.advancedFilters[0], levelsIndex);
                }
                vm.applyFilters();
            } else {
                //vm.clearFilters();
                //when we click the back arrow for any SL1 selected from the chart, it was not making a call to go back to Global sales level
                if (filtersServ.salesLevelRemoved === true) {
                    if (angular.isDefined(vm.advancedFilters[0].levels)) {
                        vm.advancedFilters[0].levels[1] = [];
                        vm.advancedFilters[0].selected[1] = [];
                        vm.advancedFilters[0].selected[0] = [];
                    }
                    vm.applyFilters();
                }
            }
        }

        //watch for pushing and popping the filter values after drilling in and out
        $scope.$watch('vm.filtersServ.selectedSalesValueForDrill', function (newValue, oldValue) {
            if (newValue !== oldValue && (filtersServ.selectedSalesValues.indexOf(newValue) < 0 || filtersServ.salesLevelRemoved)) {
                $scope.drillToNextSalesLevel(newValue);
            }
        }, true);

        $scope.filterSavSearch = function (accounManager, autoSuggestObj, i) {
            var payload = {};
            var savmFilterValues = [];
            $scope.isExpandSav = false;
            if (autoSuggestObj) {
                vm.partnerFilterObj["savSearchStrng"] = autoSuggestObj.savSearch;
                setPartnerFilterObj(autoSuggestObj, i); //To add the selected country and segment into payload for savSearch
                if (autoSuggestObj.savSearch !== undefined) {
                    vm.isSavSearch = true;
                }
                if (vm.advancedFilters[1].selected[1] && vm.advancedFilters[1].selected[1].length > 0) {
                    if (vm.advancedFilters[1].savSearch !== undefined && vm.advancedFilters[1].savSearch !== "") {
                        vm.partnerFilterObj["SavnodeName"] = null;
                    } else {
                        var pyld = vm.advancedFilters[0].selected[vm.advancedFilters[0].selected.length - 1];
                        if (pyld) {
                            vm.partnerFilterObj["SavnodeName"] = pyld;
                        }
                    }
                }
            } else { 
                vm.partnerFilterObj["savSearchStrng"] = null;
            }
            filtersServ.getDropdown(payload, 5, 'savSearch', accounManager).then(function (response) {
                angular.forEach(response.savmFilter, function (keys, savmFilter) {
                    savmFilterValues.push({
                        "keys": savmFilter
                    });
                })

                if (vm.isSavSearch && autoSuggestObj && autoSuggestObj.selected[1] && autoSuggestObj.selected[1].length > 0) {
                    angular.forEach(autoSuggestObj.selected[1], function (value) {
                        var flag = false;
                        for (var fil = 0; fil < savmFilterValues.length; fil++) {
                            if (savmFilterValues[fil].keys === value) {
                                flag = true;
                            } else {
                                // do nothing
                            }
                        }
                        if (!flag) {
                            savmFilterValues.push({
                                "keys": value
                            });
                        }
                    });
                }
                if (savmFilterValues.length === 0) {
                    savmFilterValues.push({
                        "keys": "No Search Results"
                    });
                }
                vm.advancedFilters[1].levels[1] = savmFilterValues;
                if (vm.isSavSearch) {
                    $timeout(function () {
                        angular.element('#accountFilters_1').focus()
                    }, 0);
                }
            });
        };

        vm.productSearch = function (c, index) {
            if (c.new_func_call[index]) {
                c.API_call[index] = false;
                populateFilters(c, index);
            } else {
                vm.getFiltersDropdown(c, index);
            }
        }

        var retainSearchPopulation = function (response, currentFilter, index) {
            var filterValue = [];
            if (currentFilter.selected[index] && currentFilter.selected[index].length > 0) {
                angular.forEach(currentFilter.selected[index], function (val) {
                    angular.forEach(currentFilter.levels[index], function (key) {
                        if (key.keys === val) {
                            response.push(key);
                        }
                    })
                })
            }
            if (response.length === 0 && ((currentFilter.selected[index] && currentFilter.selected[index].length === 0) || !currentFilter.selected[index])) {
                response.push({
                    "keys": "No Search Results"
                });
            }
            var newLevelsArray = [];

            angular.forEach(response, function (value, key) {
                var exists = false;
                angular.forEach(newLevelsArray, function (val2, key) {
                    if (angular.equals(value.keys, val2.keys)) {
                        exists = true
                    };
                });
                if (exists == false && value.keys !== "") {
                    newLevelsArray.push(value);
                }
            });

            currentFilter.levels[index] = angular.copy(newLevelsArray);

        }

        var setPartnerFilterObj = function (fromEvent, index) {
            if (fromEvent && fromEvent.slug && fromEvent.selected) {
                switch (fromEvent.slug) {
                    case "sales":
                        // This code will fix Slaes object loosing values when deselected.
                        if (index === 0) {
                            delete vm.partnerFilterObj["nodeName"];
                            delete vm.partnerFilterObj["SavnodeName"];
                        } else if (index === 1) {
                            if (fromEvent.selected[0] !== "[]") {
                                vm.partnerFilterObj["nodeName"] = fromEvent.selected[0];
                                vm.partnerFilterObj["SavnodeName"] = fromEvent.selected[0];
                            }
                        } else if (index < 7) {
                            for (var flag = 0; flag < index; flag++) {
                                vm.partnerFilterObj["nodeName"] = fromEvent.selected[flag];
                                vm.partnerFilterObj["SavnodeName"] = fromEvent.selected[flag];
                                if (!fromEvent.selected[flag + 1] || fromEvent.selected[flag + 1].length === 0) {
                                    break;
                                } else {

                                }
                            }
                        } else {
                            //do nothing
                        }
                        if (!vm.partnerFilterObj.savmGroupName || vm.partnerFilterObj.savmGroupName === '') {
                            vm.partnerFilterObj["installSite"] = "";
                            vm.partnerFilterObj["savmGroupName"] = "";
                        }
                        break;
                    case "account":
                        vm.partnerFilterObj["country"] = fromEvent.selected[3];
                        vm.partnerFilterObj["segment"] = fromEvent.selected[4];
                        vm.partnerFilterObj["installSite"] = fromEvent.selected[2];
                        vm.partnerFilterObj["savmGroupName"] = fromEvent.selected[1];
                        vm.partnerFilterObj["partnerName"] = fromEvent.selected[6];
                        // Partner list is not refreshed after resetting SAV and Install Sites
                        if (vm.partnerFilterObj && vm.partnerFilterObj.savmGroupName && vm.partnerFilterObj["savmGroupName"].length == 0) {
                            vm.partnerFilterObj["installSite"] = "";
                        }

                        break;
                    case "services":
                        vm.partnerFilterObj["serviceSO"] = fromEvent.selected[2];
                    default:
                        //do nothing
                        break;
                }
            }
            if (index == 1 && fromEvent.savSearch && vm.advancedFilters["0"].selected.length >= 1) {
                vm.partnerFilterObj["nodeName"] = vm.advancedFilters["0"].selected[0];
            }
            if (vm.advancedFilters["1"].selected.length > 1) {
                vm.partnerFilterObj["savmGroupName"] = vm.advancedFilters["1"].selected["1"];
            }
            filtersServ.setPartnerFilterPayload(vm.partnerFilterObj);
        }
        vm.startDate = function (c) {
            c.startDate = true;
        };

        vm.endDate = function (c) {
            c.endDate = true;
        };

        $scope.clearStartDate = function (c) {
            c.fixedDate = null;
            vm.getFiltersCount(vm.advancedFilters);
        };

        $scope.clearEndDate = function (c) {
            c.relativeDate = null;
            vm.getFiltersCount(vm.advancedFilters);
        };
        //selecting prev Expiration date than Start Date is not disabled
        vm.dateOptions = {
            formatYear: 'yy',
            startingDay: 1,
            initDate: new Date(),
            startDate: {
                minDate: '',
                maxDate: ''
            },
            endDate: {
                minDate: '',
                maxDate: ''
            }
        };

        //selecting prev Expiration date than Start Date is not disabled
        vm.changeMinAndMaxDates = function (c) {
            var date = new Date(c.fixedDate);
            date.setDate(date.getDate() + 1);
            vm.dateOptions.endDate.minDate = new Date(date);
            c.relativeDate = '';
        };

        vm.datesToggle = function (i, c) {
            c.dates = i;
            //selecting prev Expiration date than Start Date is not disabled
            c.fixedDate = '';
            c.relativeDate = '';
            c.rangeFrom = '';
            c.rangeTo = '';
            c.selected = 'Months';
            vm.getFiltersCount(vm.advancedFilters); //Change for enabling Fixed date
        };

        vm.period = function (i, d) {
            // Changes for DE151726 and DE151727
            if (d.selected === i) {
                d.selected = "";
            } else {
                d.selected = i;
            }
            vm.getFiltersDropdown(vm.advancedFilters[4]);
        };

        $scope.movePartnerSearchDiv = function () {
            appendPartnerDiv();
        };

        $scope.showPIDUpload = function (c) {
            console.log(c);
        }

        $scope.openPIDUpload = function () {
            var modalInstance = $uibModal.open({
                templateUrl: 'views/modal/upload-PID.html',
                controller: 'UploadPIDController',
                size: 'md',
                backdrop: 'static',
                resolve: {
                    uploadedPIDData: function () {
                        return angular.copy(filtersServ.uploadedPIDData);
                    }
                }
            });
            modalInstance.result.then(function (response) {
                filtersServ.uploadedPIDData = response;
                filtersServ.uploadedPIDCount = filtersServ.uploadedPIDData.length;
                //use the above response to send to backend and update the filters
            });
        }

        //Function to change the date format of collab bookmarks after adding Relative dates
        var getDateFormat = function (convertToReldateFormat) {
            for (var a = 0; a < convertToReldateFormat.categories.length; a++) {
                if (convertToReldateFormat.categories[a].dates !== 'fixedDate') {
                    if (convertToReldateFormat.categories[a].period === null) {
                        convertToReldateFormat.categories[a].period = ["Months", "Quarters", "Years"];
                        convertToReldateFormat.categories[a].selected = "Months";
                        convertToReldateFormat.categories[a].dates = "relativeDate";
                    } else if (typeof (convertToReldateFormat.categories[a].period) === 'string') {
                        convertToReldateFormat.categories[a].selected = convertToReldateFormat.categories[a].period;
                        convertToReldateFormat.categories[a].period = ["Months", "Quarters", "Years"];
                        convertToReldateFormat.categories[a].dates = "relativeDate";
                    } //Chnage for enabling fixed date
                } else {
                    if (convertToReldateFormat.categories[a].fixedDate !== null && convertToReldateFormat.categories[a].relativeDate !== null) {
                        convertToReldateFormat.categories[a].fixedDate = new Date(convertToReldateFormat.categories[a].fixedDate);
                        convertToReldateFormat.categories[a].relativeDate = new Date(convertToReldateFormat.categories[a].relativeDate);
                    }
                }
            }
            return convertToReldateFormat;
        }

        $rootScope.$on('filtersAfterPidUpload', function (data, event) {
            vm.isPidUpload = true;
            var responseKeyPID = [];
            var pidArch = [];
            var pidSubArch = [];
            var pidProdFamily = [];
            var pidProdIdFilter = [];
            //vm.advancedFilters[2].selected[0] = [];
            //vm.advancedFilters[2].selected[1] = [];
            //vm.advancedFilters[2].selected[2] = [];
            $scope.pidFiltersData = event.pidFiltersData;
            responseKeyPID.push(Object.keys($scope.pidFiltersData));
            if (responseKeyPID[0][0] === 'architecture') {
                angular.forEach($scope.pidFiltersData.architecture, function (keys, archFilter) {
                    if (keys.length === 1) {
                        pidArch.push({
                            "keys": keys[0]
                        }); // was showing the parent under architecture filter
                    } else if (keys.length > 1) {
                        for (var c = 0; c < keys.length; c++) {
                            pidArch.push({
                                "keys": keys[c]
                            }); // was showing the parent under architecture filter
                        }
                    }
                })
                vm.advancedFilters[2].levels[0] = pidArch;
                if (vm.advancedFilters[2].selected[0] !== undefined && vm.advancedFilters[2].selected[0].length > 0) {
                    var archOld = vm.advancedFilters[2].selected[0];
                    vm.advancedFilters[2].selected[0] = [];
                    vm.filtersChecked -= 1;
                } else {
                    vm.advancedFilters[2].selected[0] = [];
                }
                for (var i = 0; i < pidArch.length; i++) {
                    vm.advancedFilters[2].selected[0].push(pidArch[i].keys);
                }
                vm.filtersChecked += 1;
            }
            if (responseKeyPID[0][1] === 'subArch') {
                angular.forEach($scope.pidFiltersData.subArch, function (keys, subArchFilter) {
                    if (keys.length === 1) {
                        pidSubArch.push({
                            "keys": keys[0],
                            "parent": subArchFilter
                        });
                    } else if (keys.length > 1) {
                        for (var b = 0; b < keys.length; b++) {
                            pidSubArch.push({
                                "keys": keys[b],
                                "parent": subArchFilter
                            });
                        }
                    }
                })
                vm.advancedFilters[2].levels[1] = pidSubArch;
                if (vm.advancedFilters[2].selected[1] !== undefined && vm.advancedFilters[2].selected[1].length > 0) {
                    var subArchOld = vm.advancedFilters[2].selected[1];
                    vm.advancedFilters[2].selected[1] = [];
                    vm.filtersChecked -= 1;
                } else {
                    vm.advancedFilters[2].selected[1] = [];
                }
                for (var j = 0; j < pidSubArch.length; j++) {
                    vm.advancedFilters[2].selected[1].push(pidSubArch[j].keys);
                }
                vm.filtersChecked += 1;
                vm.advancedFilters[2].API_call[1] = true;
            }
            if (responseKeyPID[0][2] === 'productFamily') {
                angular.forEach($scope.pidFiltersData.productFamily, function (keys, prodFamilyFilter) {
                    if (keys.length === 1) {
                        pidProdFamily.push({
                            "keys": keys[0],
                            "parent": prodFamilyFilter
                        });
                    } else if (keys.length > 1) {
                        for (var a = 0; a < keys.length; a++) {
                            pidProdFamily.push({
                                "keys": keys[a],
                                "parent": prodFamilyFilter
                            });
                        }
                    }
                })
                vm.advancedFilters[2].levels[2] = pidProdFamily;
                if (vm.advancedFilters[2].selected[2] !== undefined && vm.advancedFilters[2].selected[2].length > 0) {
                    var prodFamilyOld = vm.advancedFilters[2].selected[2];
                    vm.advancedFilters[2].selected[2] = [];
                    vm.filtersChecked -= 1;
                } else {
                    vm.advancedFilters[2].selected[2] = [];
                }
                for (var k = 0; k < pidProdFamily.length; k++) {
                    vm.advancedFilters[2].selected[2].push(pidProdFamily[k].keys);
                }
                vm.filtersChecked += 1;
                vm.advancedFilters[2].API_call[2] = true;
            }
            if (responseKeyPID[0][3] === 'pids') {
                angular.forEach($scope.pidFiltersData.pids, function (keys, pidFilter) {
                    if (keys.length === 1) {
                        pidProdIdFilter.push({
                            "keys": keys[0],
                            "parent": pidFilter
                        });
                    } else if (keys.length > 1) {
                        for (var d = 0; d < keys.length; d++) {
                            pidProdIdFilter.push({
                                "keys": keys[d],
                                "parent": pidFilter
                            });
                        }
                    }
                })
                vm.advancedFilters[2].levels[3] = pidProdIdFilter;
                if (vm.advancedFilters[2].selected[3] !== undefined && vm.advancedFilters[2].selected[3].length > 0) {
                    var prodIdOld = vm.advancedFilters[2].selected[3];
                    vm.advancedFilters[2].selected[3] = [];
                    vm.filtersChecked -= 1;
                } else {
                    vm.advancedFilters[2].selected[3] = [];
                }
                for (var l = 0; l < pidProdIdFilter.length; l++) {
                    vm.advancedFilters[2].selected[3].push(pidProdIdFilter[l].keys);
                }
                vm.filtersChecked += 1;
                vm.advancedFilters[2].API_call[3] = true;
            }
            vm.advancedFilters[2].full_levels = angular.copy(vm.advancedFilters[2].levels);
            delete vm.advancedFilters[2].retain_selected;
        })

        var getRetainSelectedFilters = function () {
            var retainSelectedFilters = [];
            var dependentFilters = [];
            angular.forEach(vm.advancedFilters, function (value, key) {
                if (value.type === 'dropdown') {
                    var selected = {};
                    selected.slug = value.slug;
                    selected.selected_levels = [];
                    selected.selected_values = [];
                    selected.selected = [];
                    value.levels_name.forEach(function (v, k) {
                        if (value.selected[k] && value.selected[k].length) {
                            if (value.slug === 'product' && k >= 4) {
                                //getting selected values for product type and warranty
                                selected.selected_levels.push(v);
                                selected.selected.push(value.selected[k]);
                            } else {
                                selected.selected_levels.push(v);
                                var arr = [];
                                value.selected[k].forEach(function (a, b) {
                                    var index = value.levels[k].findIndex(function (x, y) {
                                        return x.keys === a;
                                    })
                                    if (value.levels[k] && value.levels[k][index] && !value.levels[k][index].parent) {
                                        arr.push(a);
                                    } else if (value.levels[k] && value.levels[k][index] && value.levels[k][index].parent) {
                                        arr.push(a);
                                    }
                                });
                                selected.selected.push(arr);
                            }
                        }
                    });
                    retainSelectedFilters.push(selected);
                }
            });
            filtersServ.retainSelectedFilters = angular.copy(retainSelectedFilters);
        }

        $scope.hideFiltersForTab = function (filter) {
            //Hide GU Name filter on Sales Account View
            if (CiscoUtilities.getGlobalParam() === 'Y') {
                var globalSavView = true;
            } else {
                var globalSavView = false;
            }
            if (filter.toLowerCase() === 'gu name' && !globalSavView) {
                return true;
            } else if (filter.toLowerCase() === 'sav account' && globalSavView) {
                return true;
            }
            return false;
        }

        var checkDependentFilters = function (slug) {
            //removing dependent filters
            angular.forEach(filtersServ.retainSelectedFilters, function (filter) {
                if (filter.slug === slug) {
                    //setting lower level selected values after removing dependencies
                    var selectedFilters = angular.copy(filter);
                    var currentFilter = $filter('filter')(vm.advancedFilters, {
                        slug: slug
                    })[0];
                    currentFilter.retain_selected = [];
                    currentFilter.selected = [];
                    for (var j = 0; j < selectedFilters.selected.length; j++) {
                        for (var k = 0; k < currentFilter.levels_name.length; k++) {
                            if (currentFilter.levels_name[k] === selectedFilters.selected_levels[j]) {
                                var arr = [];
                                //getting selected values for product type and warranty
                                if (filter.slug === 'product' && !selectedFilters.selected_values[j] && selectedFilters.selected[j]) {
                                    currentFilter.retain_selected[k] = angular.copy(selectedFilters.selected[j]);
                                    currentFilter.selected[k] = angular.copy(selectedFilters.selected[j]);
                                    break;
                                }
                                for (var l = 0; l < selectedFilters.selected[j].length; l++) {
                                    arr.push(selectedFilters.selected[j][l]);
                                }
                                currentFilter.retain_selected[k] = angular.copy(arr);
                                currentFilter.selected[k] = angular.copy(arr);
                                break;
                            }
                        }
                    }
                }
            });
        }
    }

    angular.module('ciscoExecDashApp').component('filterDetail', {
        templateUrl: 'views/filter-detail.html',
        // templateUrl: function ($element, $attrs) {
        //     return $attrs.template;
        // },
        bindings: {
            name: '<'
        },
        controller: FilterDetailController,
        controllerAs: 'vm'
    });
})(window.angular);
