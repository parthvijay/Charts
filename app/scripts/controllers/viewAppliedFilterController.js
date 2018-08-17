'use strict';
angular.module('ciscoExecDashApp').controller('ViewAppliedFilterController', ['$uibModalInstance', '$scope','$sessionStorage','$rootScope','FiltersServ',  function ($uibModalInstance, $scope, $sessionStorage, $rootScope, filtersServ) {



 var filterDetails = JSON.parse($sessionStorage.get('appliedFilters'));
 var advancedFilters = JSON.parse($sessionStorage.get('advancedFilters'));
 $scope.disableClearLink = true;
 var isCollab = $sessionStorage.get('isCollabActive'); // Change for US136100 - Sindhu
 $scope.cancelModal = true; //changes for DE132150 - Sindhu
 $scope.disableSales = true;
 $scope.filtersServ = filtersServ;
 $scope.disableProduct = true;
 $scope.disableDate = true;
 $scope.disableDataSet = true;
 //commenting unwanted code
 //var filterCount = JSON.parse($sessionStorage.get('filterCount')); //Change for not calling the api when filter count is two by default - Sindhu
    var filterData = [
        {
          "title":"Sales",
          "selected_levels":[],
          "selected_values":[],
          "disabled_values":[],
          "level": []
        },
        {
          "title":"Account",
          "selected_levels":[],
          "selected_values":[],
          "disabled_values":[],
          "level": []
        },
        {
          "title":"Product",
          "selected_levels":[
            // "Architecture",
            // "Sub-Architecture",
            // "Product Family",
            // "Product ID",
            // "Product Type",
            // "Warranty"
          ],
          "selected_values":[],
          "disabled_values":[],
          "level": []
        },
        {
          "title":"Services",
          "selected_levels":[],
          "selected_values":[],
          "disabled_values":[],
          "level": []
        },
        {
          "title":"Dates",
          "selected_levels":[
            // "EoS Date",
            // "LDoS Date",
            // "Shipment Date"
          ],
          "selected_values":[],
          "disabled_values":[],
          "level": []
        },
        {
          "title":"Status",
          "selected_levels":[
            //"Coverage",
            //"Network Collection" // changes for defect DE131947 - Sindhu
          ],
          "selected_values":[],
          "level": []
        },
        {
          "title":"Dataset",
          "selected_levels":[],
          "selected_values":[],
          "level": []
        }
    ];
   
    $scope.insightFilters = {
        "propensityToRefresh":  ["Unlikely", "Low", "Medium", "High", "Very Likely"],
        "propensityToTSAttach": "0%-100%"
    }
  
   $scope.hideInvalidFilters = function(c){
    if(filtersServ.disablePDS){
       return  !(( c.title === "Account"|| c.title === "Services"|| c.title === "Product" || c.title === "Dates" || c.title === "Status" || c.title === 'Dataset') && filtersServ.disablePDS);
    }else{
        return !(c.title === 'Dataset' && !filtersServ.showDataSetFilters);
    }
   }
     // in case of having vhart filters we do send put in sessio value of appliedfilters, for that value handling below if and else condition
      var sessionAppliedFilterValues = [];

        if(filterDetails.length === 2){
            sessionAppliedFilterValues = angular.copy(filterDetails[0]);
        }else{
            sessionAppliedFilterValues = angular.copy(filterDetails);
        }
    angular.forEach(sessionAppliedFilterValues, function(value) {
        if (value.categoryId === "sales") {
            if(value.title.length > 0)
                $scope.disableSales = false;
            if (value.level === 0) {
                filterData[0].selected_levels.push("Sales Level 1");
                filterData[0].selected_values.push(value.title);
                filterData[0].level.push(value.level);
                if(advancedFilters["0"].disabled && angular.isDefined(advancedFilters["0"].disabled[0])){
                    filterData[0].disabled_values.push(advancedFilters["0"].disabled["0"]);
                } else {
                    filterData[0].disabled_values.push(false);
                }
            }
            if (value.level === 1) {
                filterData[0].selected_levels.push("Sales Level 2");
                filterData[0].selected_values.push(value.title);
                filterData[0].level.push(value.level);
                if(advancedFilters["0"].disabled && angular.isDefined(advancedFilters["0"].disabled[1])){
                    filterData[0].disabled_values.push(advancedFilters["0"].disabled["1"]);
                } else {
                    filterData[0].disabled_values.push(false);
                }
            }
            if (value.level === 2) {
                filterData[0].selected_levels.push("Sales Level 3");
                filterData[0].selected_values.push(value.title);
                filterData[0].level.push(value.level);
                if(advancedFilters["0"].disabled && angular.isDefined(advancedFilters["0"].disabled[2])){
                    filterData[0].disabled_values.push(advancedFilters["0"].disabled["2"]);
                } else {
                    filterData[0].disabled_values.push(false);
                }
            }
            if (value.level === 3) {
                filterData[0].selected_levels.push("Sales Level 4");
                filterData[0].selected_values.push(value.title);
                filterData[0].level.push(value.level);
                if(advancedFilters["0"].disabled && angular.isDefined(advancedFilters["0"].disabled[3])){
                    filterData[0].disabled_values.push(advancedFilters["0"].disabled["3"]);
                } else {
                    filterData[0].disabled_values.push(false);
                }
            }
            if (value.level === 4) {
                filterData[0].selected_levels.push("Sales Level 5");
                filterData[0].selected_values.push(value.title);
                filterData[0].level.push(value.level);
                if(advancedFilters["0"].disabled && angular.isDefined(advancedFilters["0"].disabled[4])){
                    filterData[0].disabled_values.push(advancedFilters["0"].disabled["4"]);
                } else {
                    filterData[0].disabled_values.push(false);
                }
            }
            if (value.level === 5) {
                filterData[0].selected_levels.push("Sales Level 6");
                filterData[0].selected_values.push(value.title);
                filterData[0].level.push(value.level);
                if(advancedFilters["0"].disabled && angular.isDefined(advancedFilters["0"].disabled[5])){
                    filterData[0].disabled_values.push(advancedFilters["0"].disabled["5"]);
                } else {
                    filterData[0].disabled_values.push(false);
                }
            }
        }
        if (value.categoryId === "salesAM") {
            if (value.level === 1) {
                filterData[0].selected_levels.push("Account Manager");
                //Change for DE130912 - Sindhu
                //var actMng = [];
                //actMng.push(value.title);
                filterData[0].selected_values.push(value.title);
                filterData[0].level.push(value.level);
            }
        }
        if(value.categoryId === "account") {
            if (value.level === 0) {
                if(!filtersServ.globalView){
                    //do nothing in case of asset view
                }else{
                    filterData[1].selected_levels.push(value.levelName);
                    filterData[1].selected_values.push(value.title);
                    filterData[1].level.push(value.level);
                }
                // Changes for US136100
                if(advancedFilters["1"].disabled && angular.isDefined(advancedFilters["1"].disabled[0])){
                    filterData[1].disabled_values.push(advancedFilters["1"].disabled["0"]);
                } else {
                    filterData[1].disabled_values.push(false);
                }
            }
            if (value.level === 1) {
                filterData[1].selected_levels.push(value.levelName);
                filterData[1].selected_values.push(value.title);
                filterData[1].level.push(value.level);
                // Changes for US136100
                if(advancedFilters["1"].disabled && angular.isDefined(advancedFilters["1"].disabled[1])){
                    filterData[1].disabled_values.push(advancedFilters["1"].disabled["1"]);
                } else {
                    filterData[1].disabled_values.push(false);
                }
            }
            if (value.level === 2) {
                filterData[1].selected_levels.push(value.levelName);
                filterData[1].selected_values.push(value.title);
                filterData[1].level.push(value.level);
                  // Changes for US136100
                if(advancedFilters["1"].disabled && angular.isDefined(advancedFilters["1"].disabled[2])){
                    filterData[1].disabled_values.push(advancedFilters["1"].disabled["2"]);
                } else {
                    filterData[1].disabled_values.push(false);
                }
            }
            if (value.level === 3) {
                filterData[1].selected_levels.push(value.levelName);
                filterData[1].selected_values.push(value.title);
                filterData[1].level.push(value.level);
                // Changes for US136100
                if(advancedFilters["1"].disabled && angular.isDefined(advancedFilters["1"].disabled[3])){
                    filterData[1].disabled_values.push(advancedFilters["1"].disabled["3"]);
                } else {
                    filterData[1].disabled_values.push(false);
                }
            }
            if (value.level === 4) {
                filterData[1].selected_levels.push(value.levelName);
                filterData[1].selected_values.push(value.title);
                filterData[1].level.push(value.level);
                // Changes for US136100
                if(advancedFilters["1"].disabled && angular.isDefined(advancedFilters["1"].disabled[4])){
                    filterData[1].disabled_values.push(advancedFilters["1"].disabled["4"]);
                } else {
                    filterData[1].disabled_values.push(false);
                }
            }
            if (value.level === 5) {
                filterData[1].selected_levels.push(value.levelName);
                filterData[1].selected_values.push(value.title);
                filterData[1].level.push(value.level);
                // Changes for US136100
                if(advancedFilters["1"].disabled && angular.isDefined(advancedFilters["1"].disabled[5])){
                    filterData[1].disabled_values.push(advancedFilters["1"].disabled["5"]);
                } else {
                    filterData[1].disabled_values.push(false);
                }
            }
            if (value.level === 6) {
                filterData[1].selected_levels.push(value.levelName);
                filterData[1].selected_values.push(value.title);
                filterData[1].level.push(value.level);
                // Changes for US136100
                if(advancedFilters["1"].disabled && angular.isDefined(advancedFilters["1"].disabled[6])){
                    filterData[1].disabled_values.push(advancedFilters["1"].disabled["6"]);
                } else {
                    filterData[1].disabled_values.push(false);
                }
            }
            if (value.level === 7) {
                if(filtersServ.disableTerritoryCoverage){
                    //do nothing in case of asset view
                }else{                    
                    filterData[1].selected_levels.push(value.levelName);
                    filterData[1].selected_values.push(value.title);
                    filterData[1].level.push(value.level);
                }
                // Changes for US136100
                if(advancedFilters["1"].disabled && angular.isDefined(advancedFilters["1"].disabled[7])){
                    filterData[1].disabled_values.push(advancedFilters["1"].disabled["7"]);
                } else {
                    filterData[1].disabled_values.push(false);
                }
            }
        }
        if(!filtersServ.disablePDS){
        if(value.categoryId === "product") {
            // Changes for US136100
            if(value.title.length > 0)
                    $scope.disableProduct = false;
            if ((window.location.hash === "#/campaigns/securityRefresh") || (window.location.hash === "#/campaigns/collaborationRefresh") || (window.location.hash === "#/sales/analysis/subscription/security") || (window.location.hash === "#/sales/analysis/subscription/collaboration") || (window.location.hash === "#/sales/analysis/subscription/other")) {
                $scope.disableProduct = true;
            }
            if (value.level === 0) {
                filterData[2].selected_levels.push(value.levelName);
                filterData[2].selected_values.push(value.title);
                filterData[2].level.push(value.level);
                // Changes for US136100
                if(advancedFilters["2"].disabled && angular.isDefined(advancedFilters["2"].disabled[0])){
                    filterData[2].disabled_values.push(advancedFilters["2"].disabled["0"]);
                } else {
                    filterData[2].disabled_values.push(false);
                }
            }
            if (value.level === 1) {
                filterData[2].selected_levels.push(value.levelName);
                filterData[2].selected_values.push(value.title);
                filterData[2].level.push(value.level);
                // Changes for US136100
                if(advancedFilters["2"].disabled && angular.isDefined(advancedFilters["2"].disabled[1])){
                    filterData[2].disabled_values.push(advancedFilters["2"].disabled["1"]);
                } else {
                    filterData[2].disabled_values.push(false);
                }
            }
            if (value.level === 2) {
                filterData[2].selected_levels.push(value.levelName);
                filterData[2].selected_values.push(value.title);
                filterData[2].level.push(value.level);
                // Changes for US136100
                if(advancedFilters["2"].disabled && angular.isDefined(advancedFilters["2"].disabled[2])){
                    filterData[2].disabled_values.push(advancedFilters["2"].disabled["2"]);
                } else {
                    filterData[2].disabled_values.push(false);
                }
            }
            if (value.level === 3) {
                filterData[2].selected_levels.push(value.levelName);
                filterData[2].selected_values.push(value.title);
                filterData[2].level.push(value.level);
                // Changes for US136100
                if(advancedFilters["2"].disabled && angular.isDefined(advancedFilters["2"].disabled[3])){
                    filterData[2].disabled_values.push(advancedFilters["2"].disabled["3"]);
                } else {
                    filterData[2].disabled_values.push(false);
                }
            }
            if (value.level === 4) {
                filterData[2].selected_levels.push(value.levelName);
                filterData[2].selected_values.push(value.title);
                filterData[2].level.push(value.level);
                // Changes for US136100
                if(advancedFilters["2"].disabled && angular.isDefined(advancedFilters["2"].disabled[4])){
                    filterData[2].disabled_values.push(advancedFilters["2"].disabled["4"]);
                } else {
                    filterData[2].disabled_values.push(false);
                }
            }
            if (value.level === 5) {
                filterData[2].selected_levels.push(value.levelName);
                filterData[2].selected_values.push(value.title);
                filterData[2].level.push(value.level);
                // Chnages for US136100
                if(advancedFilters["2"].disabled && angular.isDefined(advancedFilters["2"].disabled[5])){
                    filterData[2].disabled_values.push(advancedFilters["2"].disabled["5"]);
                } else {
                    filterData[2].disabled_values.push(false);
                }
            }
            if (value.level === 6) {
                
                    filterData[2].selected_levels.push(value.levelName);
                    filterData[2].selected_values.push(value.title);
                    filterData[2].level.push(value.level);
                              
                // Chnages for US136100
                if(advancedFilters["2"].disabled && angular.isDefined(advancedFilters["2"].disabled[5])){
                    filterData[2].disabled_values.push(advancedFilters["2"].disabled["5"]);
                } else {
                    filterData[2].disabled_values.push(false);
                }
            }
            if (value.level === 7) {
                filterData[2].selected_levels.push(value.levelName);
                filterData[2].selected_values.push(value.title);
                filterData[2].level.push(value.level);
                // Chnages for US136100
                if(advancedFilters["2"].disabled && angular.isDefined(advancedFilters["2"].disabled[7])){
                    filterData[2].disabled_values.push(advancedFilters["2"].disabled["7"]);
                } else {
                    filterData[2].disabled_values.push(false);
                }
            }
        }
        if(value.categoryId === "services") {
            if (value.level === 0) {
                filterData[3].selected_levels.push(value.levelName);
                filterData[3].selected_values.push(value.title);
                filterData[3].level.push(value.level);
            }
            if (value.level === 1) {
                filterData[3].selected_levels.push(value.levelName);
                filterData[3].selected_values.push(value.title);
                filterData[3].level.push(value.level);
            }
            if (value.level === 2) {
                filterData[3].selected_levels.push(value.levelName);
                filterData[3].selected_values.push(value.title);
                filterData[3].level.push(value.level);
            }
        }
        // "Relative Date within 1 to 2 Months From now"
        if (value.categoryId === "date") {
                // Changes for US136100
                if(value.title.length > 0)
                    $scope.disableDate = false;
                //Start Change for date filter - Sindhu
                //if(value.direction !== null || value.from !== null || value.period !== null || value.to !== null){
                if(value.to !== null){
                    filterData[4].selected_levels.push(value.title); //Change for date filter End
            //Changes for enabling fixed date
            if(value.filterType !== 'fixedDate')
                    //DE148152- Space issue- Arun Dada
                var composeDate = "Relative Date within" + " " + value.from + " to " + value.to + " " + value.period ;
                    else
                        var composeDate = "Fixed Date within " + value.from + " to " + value.to;
                var showDate = [];
                showDate.push(composeDate);
                filterData[4].selected_values.push(showDate);
                filterData[4].level.push(value.level);
                // Changes for US136100
                if(isCollab !== undefined && isCollab === "true"){
                    if(filterData[4].selected_values.length === 1 && value.title === 'LDoS Date')
                        filterData[4].disabled_values[0] = true;
                    else{
                        for(var i=0; i<advancedFilters["4"].categories.length; i++){
                            if(value.title === advancedFilters["4"].categories[i].title){
                                if(advancedFilters["4"].categories[i].isPeriod && advancedFilters["4"].categories[i].isRangeFrom && advancedFilters["4"].categories[i].isRangeTo){
                                    filterData[4].disabled_values[i] = true;
                                }else{
                                    filterData[4].disabled_values[i] = false;
                                }
                            }
                        }
                    }
                }
            }
        }
        if(value.categoryId === "coverage") {
            var coverage = [];
            coverage.push(value.coverage);
            // changes for defect DE131947 - Sindhu
            if(coverage[0] !== "All"){
                filterData[5].selected_levels.push("Coverage");
                filterData[5].selected_values.push(coverage);
                filterData[5].level.push(value.level);
            }
        }
        if(value.categoryId === "network") {
            var network = [];
            network.push(value.network);
            // changes for defect DE131947 - Sindhu
            if(network[0] !== "All"){
                filterData[5].selected_levels.push("Network Collection");
                filterData[5].selected_values.push(network);
                filterData[5].level.push(value.level);
            }
        }
        if(value.categoryId === "sweeps") {
            var sweeps = [];
            sweeps.push(value.sweeps);
            // changes for defect DE131947 - Sindhu
            if(sweeps[0] !== "No"){
                var tab = filtersServ.opportunitiesActive;
                var subTab = filtersServ.opportunitiesView;
               if (tab === 'renew' ||
                (tab === 'renew' && subTab == 'opportunities')){
                    filterData[5].selected_levels.push("SWEEPs Contracts");
                    filterData[5].selected_values.push(sweeps);
                    filterData[5].level.push(value.level);
                }     
            }
        }
    }
        if(value.categoryId === "dataset"){
            filterData[6].selected_levels.push("Covered IB Shipment/Processing FY Range");
            filterData[6].selected_levels.push("Uncovered IB Shipment FY Range");
            filterData[6].selected_values.push(new Array(value.coveredStartDate + " - " + value.coveredEndDate));
            filterData[6].selected_values.push(new Array(value.uncoveredStartDate + " - " + value.uncoveredEndDate));
        }
        if(value.categoryId === 5){
             if(!Array.isArray(value.refresh)){ // View Applied after applying bookmark was not opening - Sindhu
                // Change for DE151973 - Sindhu
                if(value.refresh !== "[]"){
                    $scope.insightFilters.propensityToRefresh = JSON.parse(value.refresh);
                } //Change for DE152608
            }
        }
        if(value.categoryId === 6){
            // Change for DE151973 - Sindhu
            if(value.minValue !== null && value.maxValue !== null){
                $scope.insightFilters.propensityToTSAttach = value.minValue + "%-" + value.maxValue+"%";
            }
        }
        $scope.filters = filterData;
    })

    for (var i = 1; i < $scope.filters[0].disabled_values.length; i++) {
        if ($scope.filters[0].disabled_values[0] === $scope.filters[0].disabled_values[i]) {
            $scope.disableSales = $scope.filters[0].disabled_values[0];
        } /*else { // Changes for DE136810
            $scope.disableSales = false;
            break;
        }*/
    }

    // Changes for US136100

    for (var i = 1; i < $scope.filters[2].disabled_values.length; i++) {
        if ($scope.filters[2].disabled_values[0] === $scope.filters[2].disabled_values[i]) {
            $scope.disableProduct = $scope.filters[2].disabled_values[0];
        }
    }

    //for (var i = 1; i < $scope.filters[3].disabled_values.length; i++) {
        if ((($scope.filters[4].disabled_values[0] || $scope.filters[4].disabled_values[1] || $scope.filters[4].disabled_values[2]) === true) && advancedFilters[4].categories[1].dates !== "fixedDate") {
            $scope.disableDate = true;
        }
    //}

    $scope.activeTab = 0;
    $scope.checkedFilters = {};

    $scope.refactorPID = function () {
        //DE144354- In Bookmarks Applied Filters is not working
        if($scope.filters!==undefined){
            if ($scope.filters[2].selected_values[3] && $scope.filters[2].selected_levels[3] === "Product ID" && $scope.filters[2].selected_values[3].length > 10) {
                $scope.selectedPIDCount = $scope.filters[2].selected_values[3].length;
                $scope.selectedPIDList = $scope.filters[2].selected_values[3];
                $scope.filters[2].selected_values[3] = [{key: $scope.selectedPIDCount + " Applied IDs"}]
            }
        }
    }

    $scope.refactorPID();

    $scope.updatePID = function () {
        if ($scope.filters[2].selected_values[3] && $scope.filters[2].selected_levels[3] === "Product ID" && $scope.selectedPIDList) {
            $scope.filters[2].selected_values[3] = $scope.selectedPIDList;
        }
    }

    $scope.ok = function () {
        $uibModalInstance.dismiss('cancel');
    };

    $scope.cancel = function () {
        $scope.updatePID();
        $uibModalInstance.dismiss('cancel');
        /*Change for not making the call when the view applied modal is closed when there is no filter selected - Sindhu*/
        if($scope.cancelModal === false){ //changes for DE132150 - Sindhu
         $rootScope.$emit('view-applied-filter-date', {
            'filtersData': advancedFilters
        })
        }
    };

    $scope.selectTab = function (t) {
        $scope.activeTab = t;
    };

    //Changes for DE152598
    var removeLevels = function(fltr,selectedLevel,ind,i){
        var parentFltr = selectedLevel[ind];
        var levleToClear = fltr.levels[i+1];
        var len =0;
        if(levleToClear !== undefined){
            for(var a=0; a<levleToClear.length; a++){
                if(levleToClear[a].parent === parentFltr){
                    var initialIndex = a;
                    break;
                }
            }
            for(var b=initialIndex; b<levleToClear.length; b++){
                if(levleToClear[b].parent === parentFltr){
                    len++;
                }
            }
            levleToClear.splice(initialIndex,len);
            return levleToClear;
        }
    }

    //     $scope.fromBookmark = $scope.bookmark != null ? true:false;

    //Changes for clearing the dependent(child) filters in view applied - Start - Sindhu

    $scope.isLevelPresent = function (filter_name, level_name) {
        var isLevelPresent = false;
        for (var i = 0; $scope.filters.length; i++) {
            if ($scope.filters[i].title == filter_name) {
                for (var j = 0; j < $scope.filters[i].selected_levels.length; j++) {
                    if ($scope.filters[i].selected_levels[j] == level_name) {
                        isLevelPresent = true;
                        break;
                    }
                }
                break;
            }
        }
        return isLevelPresent;
    }

    $scope.deleteDependent = function (filter_name, level_name) {
        for (var i = 0; $scope.filters.length; i++) {
            if ($scope.filters[i].title == filter_name) {
                for (var j = 0; j < $scope.filters[i].selected_levels.length; j++) {
                    if ($scope.filters[i].selected_levels[j] == level_name) {
                        $scope.filters[i].selected_levels.splice(j, 1);
                        $scope.filters[i].selected_values.splice(j, 1);
                        break;
                    }
                }
                break;
            }
        }
    }

    $scope.removeDependents = function () {
        var isAccountManagerPresent = $scope.isLevelPresent("Sales", "Account Manager");
        //if (!isAccountManagerPresent) {
        //$scope.deleteDependent("Account", "SAV Account");//sav is can be selected without account manager
        //}
        if($scope.filtersServ.globalView){
            var isSAVAccountPresent = $scope.isLevelPresent("Account", "GU Name");
        }else{
            var isSAVAccountPresent = $scope.isLevelPresent("Account", "SAV Account");
        }
        if (!isSAVAccountPresent) {
            $scope.deleteDependent("Account", "Install Site");
        }
    }

    $scope.findDependentFilters = function(c, d, index) {
        var dependents = [];
        /* Finding parent filter name which has dependents. */
        var parentFilter = c.selected_values[c.selected_levels.indexOf(d)][index];
        var levelSelected = c.selected_levels.indexOf(d); //Change for DE145272
        for(var i=0;i<advancedFilters.length;i++) {
             if(c.title == advancedFilters[i].title && advancedFilters[i].levels !== undefined) { //was failing for dates filter - Sindhu
                for(var j=0;j<advancedFilters[i].levels.length;j++) {
                    for(var k=0;k<advancedFilters[i].levels[j].length;k++) {
                        //Change for DE145272

                    if(advancedFilters[i].levels[j][k].parent && advancedFilters[i].levels[j][k].parent.toLowerCase() == parentFilter.toLowerCase() && j > levelSelected) { // Changes for DE145272
                            // find index in c selected values
                            for(var l=0;l<c.selected_values.length;l++) {
                                for(var m=0;m<c.selected_values[l].length;m++) {
                                    if(c.selected_values[l][m].toLowerCase() == advancedFilters[i].levels[j][k].keys.toLowerCase() && l===j) {
                                        dependents.push({
                                            "d": c.selected_levels[l], // filter level
                                            "key": c.selected_values[l][m] // Filter name
                                        });
                                        /* Finding all the dependents of the above parent filter */
                      // Changes for DE145272 - Was not clearing arch and sub-arch filters if the name of both filters are same.
                                        if(advancedFilters[i].levels[j][k].parent.toLowerCase() !== c.selected_values[l][m].toLowerCase())
                                            var dependentFilters = angular.copy($scope.findDependentFilters(c, c.selected_levels[l], m));
                                        else{
                                            if(c.selected_levels[l+1] !== undefined)
                                            var dependentFilters = angular.copy($scope.findDependentFilters(c, c.selected_levels[l+1], m));
                                        }
                                        if(dependentFilters !== undefined)
                                        dependents = angular.copy(dependents.concat(dependentFilters));
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        return dependents;
    }

    $scope.findIndex = function(c, d, key) {
        var level = c.selected_levels.indexOf(d);
        if(level != -1) {
            for(var i=0;i<c.selected_values[level].length;i++) {
                if(c.selected_values[level][i] == key) {
                    return i;
                }
            }
        }
        return -1;
    }

    $scope.removeSelectedFilterHelper = function(c, d, index) {
        var dependents = $scope.findDependentFilters(c, d, index);
        $scope.removeSelectedFilter(c, d, index);
        for(var i=0;i<dependents.length;i++) {
            $scope.removeSelectedFilter(c, dependents[i]["d"], $scope.findIndex(c,dependents[i]["d"],dependents[i]["key"]));
        }
    }

    //Changes for clearing the dependent(child) filters in view applied - End

/*Changes for enabling View Applied functionality - Sindhu*/
//start
        $scope.removeSelectedFilter = function(c, d,index) {
            var count = 0;
            var countAcc = 0;
            $scope.cancelModalSingle = false;
            //if(c.title != "Status") { // changes for defect DE131947 - Sindhu
                for(var j=0;j<$scope.filters.length;j++) {
                    if($scope.filters[j].title === c.title) {
                        for(var i=0;i<c.selected_levels.length;i++) {
                            if(c.selected_levels[i] === d) {
                                $scope.filters[j].selected_values[i].splice(index, 1);
                                if($scope.filters[j].selected_values[i].length === 0) {
                                    if(c.title === "Sales" || c.title === "Product") {
                                        if(c.title === "Sales"){
                                        $scope.filters[j].selected_values.splice(i, $scope.filters[j].selected_values.length-i);
                                        $scope.filters[j].selected_levels.splice(i, $scope.filters[j].selected_levels.length-i);
                                            advancedFilters[j].selected.splice(i,advancedFilters[j].selected.length-i);
                                            if(advancedFilters[j].retain_selected){
                                                advancedFilters[j].retain_selected.splice(i,advancedFilters[j].retain_selected.length-i);
                                            }
                                            // Changes for DE156091
                                            advancedFilters[j].API_call[i] = false;
                                            //when few sales levels are applied and in view applied if we try to clear all the sales levels as a whole, then the api_call was not set to false. As a result, in global filter if we select some SL1, Sl2 was not showing up
                                            for(var h=i+1; h<advancedFilters[j].levels.length; h++){
                                                advancedFilters[j].API_call[h] = false;
                                            }
                                            //if(d !== "Account Manager") // changes for defect DE131940 and DE133048 - Sindhu
                        /*When there is only one account Manager selected and is cleared from view applied, it was not clearing the sav account and install site filters*/
                                                /*if(d !== "Sales Level 6")
                                                    advancedFilters[j].levels.splice(i+1,advancedFilters[j].levels.length-i);

                                            advancedFilters[1].levels[0] = [{"keys": "No Search Results"}]; // Changes for DE135076
                                            advancedFilters[1].levels[1] = [];
                                            advancedFilters[1].selected[0] = [];
                                            advancedFilters[1].selected[1] = [];
                                            if($scope.filters[1].level[0] === 0){
                                                if($scope.filters[1].level[1] === 1){
                                                    $scope.filters[1].selected_values.splice(0,2);
                                                    $scope.filters[1].selected_levels.splice(0,2);
                                                }else{
                                                    $scope.filters[1].selected_values.splice(0,1);
                                                    $scope.filters[1].selected_levels.splice(0,1);
                                                }
                                            }*/
                                            //was not clearing the levels
                                            if(d !== "Account Manager"){
                                                if(advancedFilters[j].selected[i+1] === undefined){
                                                    advancedFilters[j].levels.splice(i+1,advancedFilters[j].levels.length-1);
                                                }
                                            }
                                            if($scope.filters[j].selected_values.length === 0){
                                                $scope.disableSales = true;
                                            }
                                        }else if(c.title === "Product" && c.level[i] <= 3){
                                            for(var x=i; x<c.level.length ; x++){
                                                if(c.level[x] <= 3){
                                                    count ++;
                                                    advancedFilters[j].selected[x] = [];
                                                    if(advancedFilters[j].retain_selected){
                                                        if(advancedFilters[j].retain_selected[x]){
                                                            advancedFilters[j].retain_selected[x] = [];
                                                        }
                                                    }
                                                }
                                                if(x<3){
                                                    advancedFilters[j].levels[x+1] = [];
                                                }
                                            }
                                            $scope.filters[j].selected_values.splice(i, count);
                                            $scope.filters[j].selected_levels.splice(i, count);
                                        }else if(c.title === "Product" && c.level[i] > 3){
                                            $scope.filters[j].selected_values.splice(i, 1);
                                            $scope.filters[j].selected_levels.splice(i, 1);
                                            advancedFilters[j].selected[c.level[i]].splice(0,1);
                                            if(advancedFilters[j].retain_selected){
                                                if(advancedFilters[j].retain_selected[c.level[i]]){
                                                    advancedFilters[j].retain_selected[c.level[i]].splice(0,1);
                                                }
                                            }
                                        }
                                        // Changes for US136100
                                        if($scope.filters[j].selected_values.length === 0){
                                            $scope.disableProduct = true;
                                        }
                                    }else if(c.title === "Account" && c.level[i] <= 1){
                                        for(var y=c.level[i]; y<=c.level.length ; y++){
                                            if(y<=2){
                                                countAcc ++;
                                                advancedFilters[j].selected[y] = [];
                                                if(advancedFilters[j].retain_selected){
                                                    if(advancedFilters[j].retain_selected[y]){
                                                        advancedFilters[j].retain_selected[y] = [];
                                                    }
                                                }
                                            }
                                            if(y<2){
                                                advancedFilters[j].levels[y+1] = [];
                                            }
                                            }
                                            $scope.filters[j].selected_values.splice(i, countAcc);
                                            $scope.filters[j].selected_levels.splice(i, countAcc);
                                    }else if(c.title === "Account" && c.level[i] > 1){
                                            $scope.filters[j].selected_values.splice(i, 1);
                                            $scope.filters[j].selected_levels.splice(i, 1);
                                            advancedFilters[j].selected[c.level[i]].splice(0,1);
                                            if(advancedFilters[j].retain_selected){
                                                if(advancedFilters[j].retain_selected[c.level[i]]){
                                                    advancedFilters[j].retain_selected[c.level[i]].splice(0,1);
                                                }
                                            }
                                    }else if(c.title === "Services"){
                                        $scope.filters[j].selected_values.splice(i, 1);
                                        $scope.filters[j].selected_levels.splice(i, 1);
                                        //change for DE179623
                                        for(var g=0; g<advancedFilters[j].levels.length; g++){
                                            if(advancedFilters[j].levels_name[g] === d){
                                                break;
                                            }
                                        }
                                        advancedFilters[j].selected[g] = [];
                                    }else {
                                        $scope.filters[j].selected_values.splice(i, 1);
                                        $scope.filters[j].selected_levels.splice(i, 1);
                                        if(c.title === "Dates"){
                                            //Changes for DE143740 - Sindhu
                                            $scope.filters[j].disabled_values.splice(i, 1);
                                            for(var a=0;a<advancedFilters[j].categories.length;a++){
                                                if(advancedFilters[j].categories[a].title == d){
                                                    if(advancedFilters[j].categories[a].dates !== 'fixedDate'){
                                                    advancedFilters[j].categories[a].selected =  "Months";
                                                    advancedFilters[j].categories[a].rangeFrom = null;
                                                    advancedFilters[j].categories[a].rangeTo = null;
                                                    }else{//Changes for enabling fixed date
                                                        advancedFilters[j].categories[a].fixedDate = null;
                                                        advancedFilters[j].categories[a].relativeDate = null;
                                                    }
                                                }
                                            }
                                            // Changes for US136100
                                            if($scope.filters[j].selected_values.length === 0){
                                                $scope.disableDate = true;
                                            }
                                        }else if(c.title === "Status"){ // changes for defect DE131947 - Sindhu
                                            for(var a=0;a<advancedFilters[j].categories.length;a++){
                                                if(advancedFilters[j].categories[a].title === d){
                                                  if(advancedFilters[j].categories[a].title !== "SWEEPs Contracts"){
                                                    advancedFilters[j].categories[a].selected = "All";
                                                  }else{
                                                    advancedFilters[j].categories[a].selected = "No";
                                                  }
                                                   
                                                }
                                            }
                                        }else{
                                            advancedFilters[j].selected.splice(i,1);
                                            advancedFilters[j].levels.splice(i,1);
                                        }
                                    }
                                }else{
                                    if(c.title === "Sales" || c.title === "Product") {
                                        if(c.title === "Sales"){
                                            // Changes for DE133051 - Sindhu
                                            //$scope.filters[j].selected_values.splice(i+1, $scope.filters[j].selected_values.length-i);
                                            //$scope.filters[j].selected_levels.splice(i+1, $scope.filters[j].selected_levels.length-i);
                                            //Changes for DE152598
                                            if(c.selected_levels[i] !== "Account Manager"){
                                                var updatedLevels = removeLevels(advancedFilters[j],advancedFilters[j].selected[i],index,i);
                                            }
                                            if(updatedLevels){
                                                advancedFilters[j].levels[i+1] = updatedLevels;
                                            }
                                            /*Changes for DE135076*/
                                            if(c.selected_levels[i] === "Account Manager" && c.selected_levels[i-1] != "Sales Level 6"){//updated condition for DE140339- VN
                                                advancedFilters[j].selected[i+1].splice(index,1);
                                                if(advancedFilters[j].retain_selected){
                                                    if(advancedFilters[j].retain_selected[i+1]){
                                                        advancedFilters[j].retain_selected[i+1].splice(index,1);
                                                    }
                                                }
                                            }
                                            else{
                                                advancedFilters[j].selected[i].splice(index,1);
                                                if(advancedFilters[j].retain_selected){
                                                    if(advancedFilters[j].retain_selected[i]){
                                                        advancedFilters[j].retain_selected[i].splice(index,1);
                                                    }
                                                }
                                            }
                                            //advancedFilters[j].selected.splice(i+1,advancedFilters[j].selected.length-i);
                                            //if(d !== 'Sales Level 5') // Changes for DE133051 - Sindhu
                                            //advancedFilters[j].levels.splice(i+2,advancedFilters[j].levels.length-i);
                                        }else if(c.title === "Product" && c.level[i] <= 3){
                                            // was clearing the next level filter in the filters section when only one is cancelled on the higher level - Sindhu
                                            /*for(var x=i; x<c.level.length ; x++){
                                                if(c.level[x] <= 3){
                                                    count ++;
                                                    advancedFilters[j].selected[x+1] = [];
                                                }*/

                                                /*if(x<3)
                                                    advancedFilters[j].levels[x+1] = [];*/
                                            //}
                                            //$scope.filters[j].selected_levels.splice(i+1, count-1);
                                            advancedFilters[j].selected[i].splice(index,1);
                                            if(advancedFilters[j].retain_selected){
                                                if(advancedFilters[j].retain_selected[i]){
                                                    advancedFilters[j].retain_selected[i].splice(index,1);
                                                }
                                            }
                                        }else if(c.title === "Product" && c.level[i] > 3){
                                            advancedFilters[j].selected[c.level[i]].splice(index,1); //Changes for the issue in warranty and Product Id filters in view applied - Sindhu
                                            if(advancedFilters[j].retain_selected){
                                                if(advancedFilters[j].retain_selected[c.level[i]]){
                                                    advancedFilters[j].retain_selected[c.level[i]].splice(index,1);
                                                }
                                            }
                                        }
                                    }else if(c.title === "Account" && c.level[i] <= 1){
                                         // was clearing the next level filter in the filters section when only one is cancelled on the higher level - Sindhu
                                        /*for(var y=i; y<c.level.length ; y++){
                                                if(c.level[y] <= 1){
                                                    countAcc ++;
                                                    advancedFilters[j].selected[y+1] = [];
                                                }*/
                                                /*if(y<1)
                                                    advancedFilters[j].levels[x+1] = [];*/
                                            //}
                                            //$scope.filters[j].selected_levels.splice(i+1, countAcc-1);
                                            advancedFilters[j].selected[c.level[i]].splice(index,1);
                                            if(advancedFilters[j].retain_selected){
                                                if(advancedFilters[j].retain_selected[c.level[i]]){
                                                    advancedFilters[j].retain_selected[c.level[i]].splice(index,1);
                                                }
                                            }
                                    }else if(c.title === "Account" && c.level[i] > 1){
                                            advancedFilters[j].selected[c.level[i]].splice(index,1);
                                            if(advancedFilters[j].retain_selected){
                                                if(advancedFilters[j].retain_selected[c.level[i]]){
                                                    advancedFilters[j].retain_selected[c.level[i]].splice(index,1);
                                                }
                                            }
                                    }else if(c.title === "Services"){
                                        advancedFilters[j].selected[c.level[i]].splice(index,1);
                                    }else {
                                        $scope.filters[j].selected_values.splice(i, 1);
                                        $scope.filters[j].selected_levels.splice(i, 1);
                                        if(c.title === "Dates"){
                                            for(var a=0;a<advancedFilters[j].categories.length;a++){
                                                if(advancedFilters[j].categories[a].title == d){
                                                    if(advancedFilters[j].categories[a].dates !== 'fixedDate'){
                                                    advancedFilters[j].categories[a].selected =  "Months";
                                                    advancedFilters[j].categories[a].rangeFrom = null;
                                                    advancedFilters[j].categories[a].rangeTo = null;
                                                    }else{//Changes for enabling fixed date
                                                        advancedFilters[j].categories[a].fixedDate = null;
                                                        advancedFilters[j].categories[a].relativeDate = null;
                                                    }
                                                }
                                            }
                                        }else if(c.title === "Status"){ // changes for defect DE131947 - Sindhu
                                            for(var a=0;a<advancedFilters[j].categories.length;a++){
                                                if(advancedFilters[j].categories[a].title === d){
                                                    advancedFilters[j].categories[a].selected = "All";
                                                }
                                            }
                                        }else{
                                            advancedFilters[j].selected[i].splice(index,1);
                                            advancedFilters[j].selected.splice(i,1);
                                            advancedFilters[j].levels.splice(i,1);
                                        }
                                    }
                                }
                                break;
                            }
                        }
                        break;
                    }
                }
            //}

            $scope.removeDependents(); //Changes for clearing the dependent(child) filters in view applied
            $scope.changeClearLink();
           // filterServ.isSalesLevelLoaded = false;
            //filterServ.appliedFilters = $scope.filters;
            //filterServ.setSelectedFilters();
            //filterServ.filtersChanged();
        }

        $scope.clear = function() {
            $scope.cancelModal = false; // changes for DE139767
                for(var i=0;i<$scope.filters.length;i++) {
                    /*if($scope.filters[i].title == "Status")
                        continue;*/ // changes for defect DE131947 - Sindhu
                    if($scope.checkedFilters[$scope.filters[i].title] !== undefined && $scope.checkedFilters[$scope.filters[i].title].value === true) { //Changes for DE142407 - Sindhu
                    $scope.filters[i].selected_levels = [];
                    if($scope.filters[i].title === "Sales"){
                        $scope.disableSales = true;
                        //when few sales levels are applied and in view applied if we try to clear all the sales levels as a whole, then the api_call was not set to false. As a result, in global filter if we select some SL1, Sl2 was not showing up
                        for(var h=1; h<advancedFilters[i].levels.length; h++){
                            advancedFilters[i].API_call[h] = false;
                        }
                        advancedFilters[i].levels.splice(1,advancedFilters[i].levels.length-1);
                        for(var x=0;x<advancedFilters[i].selected.length;x++){
                            advancedFilters[i].selected[x] = [];
                            if(advancedFilters[i].retain_selected){
                                if(advancedFilters[i].retain_selected[x]){
                                    advancedFilters[i].retain_selected[x] = [];
                                }
                            }
                        }
                        /*advancedFilters[1].levels[0] = [{"keys": "No Search Results"}];
                        advancedFilters[1].levels[1] = [];
                        advancedFilters[1].selected[0] = [];
                        advancedFilters[1].selected[1] = [];*/
            // was clearing the next level filter in the filters section when only one is cancelled on the higher level - Sindhu
                        /*if($scope.filters[1].level[0] === 0){
                            if($scope.filters[1].level[1] === 1){
                                $scope.filters[1].selected_values.splice(0,2);
                                $scope.filters[1].selected_levels.splice(0,2);
                            }else{
                                $scope.filters[1].selected_values.splice(0,1);
                                $scope.filters[1].selected_levels.splice(0,1);
                            }
                        }*/
                    }else if($scope.filters[i].title === "Account"){
                        advancedFilters[i].levels[0] = [{}];
                        advancedFilters[i].levels[1] = [];
                        advancedFilters[i].levels[2] = [];
                        //fix for DE144522 for customer search
                        advancedFilters[1].levels[1] = [{"keys": "No Search Results"}];
                        for(var y=0;y<advancedFilters[i].selected.length;y++){ //Fix for the issue in territory filter during unit test - Sindhu
                            advancedFilters[i].selected[y] = [];
                            if(advancedFilters[i].retain_selected){
                                if(advancedFilters[i].retain_selected[y]){
                                    advancedFilters[i].retain_selected[y] = [];
                                }
                            }
                        }
                        //advancedFilters[i].selected[5] = ""; //Change for territory Coverage filte - Sindhu
                    }else if($scope.filters[i].title === "Product"){
                        $scope.disableProduct = true; // Changes for US136100
                        advancedFilters[i].levels[1] = [];
                        advancedFilters[i].levels[2] = [];
                        advancedFilters[i].levels[3] = [];
                        for(var z=0;z<advancedFilters[i].selected.length;z++){
                            advancedFilters[i].selected[z] = [];
                            if(advancedFilters[i].retain_selected){
                                if(advancedFilters[i].retain_selected[z]){
                                    advancedFilters[i].retain_selected[z] = [];
                                }
                            }
                        }
                    }else if($scope.filters[i].title === "Services"){
                        $scope.filters[i].selected_values = [];
                        advancedFilters[i].selected = [];
                    }else if($scope.filters[i].title === 'Status'){ // changes for defect DE131947 - Sindhu
                        advancedFilters[5].categories[0].selected = "All";
                        advancedFilters[5].categories[1].selected = "All";
                        advancedFilters[5].categories[2].selected = "No";
                    }else if($scope.filters[i].title === 'Dates'){ // Dates filters were not getting cleared from view applied - Sindhu
                        $scope.disableDate = true; // Changes for US136100
                        for(var a=0;a<advancedFilters[4].categories.length;a++){
                            //DE148157- Console error removal -Unable to clear Shipment date filter from view applied when applied along with EOS date- ArunDada
                            if(advancedFilters[4].categories[a].dates !== 'fixedDate'){
                                advancedFilters[4].categories[a].selected =  "Months";
                                advancedFilters[4].categories[a].rangeFrom = null;
                                advancedFilters[4].categories[a].rangeTo = null;
                            }else{//Changes for enabling fixed date
                                advancedFilters[4].categories[a].fixedDate = null;
                                advancedFilters[4].categories[a].relativeDate = null;
                            }
                        }
                    }
                    $scope.selected_values = [];
                    delete $scope.checkedFilters[$scope.filters[i].title+"_"];
                    delete $scope.checkedFilters[$scope.filters[i].title];
                    continue;
                }
                for(var j=0;j<$scope.filters[i].selected_levels.length;j++) {
                    // if($scope.checkedFilters[$scope.filters[i].title+"_"+$scope.filters[i].selected_levels[j]] == true) {
                    if (typeof ($scope.checkedFilters[$scope.filters[i].title]) != "undefined" && $scope.checkedFilters[$scope.filters[i].title][$scope.filters[i].selected_levels[j]] == true) {
                        delete $scope.checkedFilters[$scope.filters[i].title][$scope.filters[i].selected_levels[j]];
                        if($scope.filters[i].title == "Sales") {
                            $scope.filters[i].selected_levels.splice(j,$scope.filters[i].selected_levels.length-j);
                            $scope.filters[i].selected_values.splice(j,$scope.filters[i].selected_values.length-j);
                            //when few sales levels are applied and in view applied if we try to clear all the sales levels as a whole, then the api_call was not set to false. As a result, in global filter if we select some SL1, Sl2 was not showing up
                            for(var h=j+1; h<advancedFilters[i].levels.length; h++){
                                advancedFilters[i].API_call[h] = false;
                            }
                            if(j == 0){
                                for(var x=0; x<advancedFilters[i].selected.length;x++){
                                    advancedFilters[i].selected[x] = [];
                                    if(advancedFilters[i].retain_selected){
                                        if(advancedFilters[i].retain_selected[x]){
                                            advancedFilters[i].retain_selected[x] = [];
                                        }
                                    }
                                }
                                for(var y=1;y<advancedFilters[i].levels.length;y++){
                                    advancedFilters[i].levels[y] = [];
                                }
                                $scope.disableSales = true;
                            }else{
                                advancedFilters[i].selected.splice(j,advancedFilters[i].selected.length-j);
                                if(advancedFilters[i].retain_selected){
                                    advancedFilters[i].retain_selected.splice(j,advancedFilters[i].retain_selected.length-j);
                                }
                                advancedFilters[i].API_call[j] = false;// Chnages for DE156091
                                if(j !== 5) // changes for DE135072
                                    advancedFilters[i].levels.splice(j+1,advancedFilters[i].levels.length-j);
                                /*if(j === 5)
                                    advancedFilters[1].levels[0] = [{"keys": "No Search Results"}];*/
                            }
                            /*When any of the sales filters cleared from view applied, it was not clearing the sav account and install site filters*/
                                            /*advancedFilters[1].levels[0] = [{"keys": "No Search Results"}];
                                            advancedFilters[1].levels[1] = [];
                                            advancedFilters[1].selected[0] = [];
                                            advancedFilters[1].selected[1] = [];
                                            if($scope.filters[1].level[0] === 0){
                                                if($scope.filters[1].level[1] === 1){
                                                    $scope.filters[1].selected_values.splice(0,2);
                                                    $scope.filters[1].selected_levels.splice(0,2);
                                                }else{
                                                    $scope.filters[1].selected_values.splice(0,1);
                                                    $scope.filters[1].selected_levels.splice(0,1);
                                                }
                                            }*/
                        }
                        else if($scope.filters[i].title == "Product") {
                            for(var k=1;k+j<$scope.filters[i].selected_levels.length;k++) {
                                //When cleared sub-arch from View Applied, Asset type wass also getting cleared
                                if($scope.filters[i].selected_levels[k+j]=="Product Type" || $scope.filters[i].selected_levels[k+j] == "Warranty"|| $scope.filters[i].selected_levels[k+j] == "Suite"|| $scope.filters[i].selected_levels[k+j] == "Asset Type")
                                    break;
                            }
                            $scope.filters[i].selected_levels.splice(j,k);
                            $scope.filters[i].selected_values.splice(j,k);
                            //sub-arch and product family filters were not getting cleared under subscription when cleared from view applied
                            if(j>k){ //it was not clearing product family filter as k will be less than j
                                advancedFilters[i].selected[$scope.filters[i].level[j]] = [];
                            }else{
                                for(var x=j; x<=k ; x++){
                                    if(x<4){
                                        advancedFilters[i].selected[$scope.filters[i].level[x]] = [];
                                    }else{
                                        advancedFilters[i].selected[$scope.filters[i].level[x]] = [];
                                    }
                                }
                            }
                            //was pointing to a wrong index of $scope.filters[i].level[j]] as it was getting spliced out. So added the code before the splice
                            if(advancedFilters[i].retain_selected){
                                if(advancedFilters[i].retain_selected[$scope.filters[i].level[j]]){
                                    advancedFilters[i].retain_selected[$scope.filters[i].level[j]] = [];
                                }
                            }
                //When cleared sub-arch from View Applied, Asset type wass also getting cleared
                            $scope.filters[i].level.splice(j,k);
                            $scope.filters[i].disabled_values.splice(j,k);
                            //advancedFilters[i].selected[j] = []
                            //Change for DE144867 - Sindhu
                            for(var y=j+1;y<=advancedFilters[i].selected.length;y++){
                                if(y < 4){
                                    advancedFilters[i].selected[y] = [];
                                    if(advancedFilters[i].retain_selected){
                                        if(advancedFilters[i].retain_selected[y]){
                                            advancedFilters[i].retain_selected[y] = [];
                                        }
                                    }
                                    advancedFilters[i].levels[y] = [];
                                }
                            }
                        }else if($scope.filters[i].title == "Account") {
                            for(var k=1;k+j<$scope.filters[i].selected_levels.length;k++) {
                                if($scope.filters[i].selected_levels[k+j]=="Country" || $scope.filters[i].selected_levels[k+j] == "Segment" || $scope.filters[i].selected_levels[k+j] == "Partner" || $scope.filters[i].selected_levels[k+j] == "Territory Coverage" || $scope.filters[i].selected_levels[k+j] == "Vertical Market") // added missed territory Coverage - SIndhu
                                    break;
                            }

                            $scope.filters[i].selected_levels.splice(j,k);
                            $scope.filters[i].selected_values.splice(j,k);
                            advancedFilters[i].selected[$scope.filters[i].level[j]] = []; //Change for clearing independent filters - Sindhu
                            if(advancedFilters[i].retain_selected){
                                if(advancedFilters[i].retain_selected[$scope.filters[i].level[j]]){
                                    advancedFilters[i].retain_selected[$scope.filters[i].level[j]] = [];
                                }
                            }
                            // Fix for DE145463 - Sindhu
                            if(j === 0){
                                advancedFilters[i].selected[2] = [];
                                if(advancedFilters[i].retain_selected){
                                    if(advancedFilters[i].retain_selected[2]){
                                        advancedFilters[i].retain_selected[2] = [];
                                    }
                                }
                                advancedFilters[i].levels[2] = [];
                            }else if(j === 1){
                                advancedFilters[i].selected[2] = [];
                                if(advancedFilters[i].retain_selected){
                                    if(advancedFilters[i].retain_selected[2]){
                                        advancedFilters[i].retain_selected[2] = [];
                                    }
                                }
                            }
                            /*for(var y=j+1;y<k;y++){
                                advancedFilters[i].selected[y] = [];
                                advancedFilters[i].levels[y] = [];
                            }*/
                        }else if($scope.filters[i].title == "Services"){
                            $scope.filters[i].selected_levels.splice(j,1);
                            $scope.filters[i].selected_values.splice(j,1);
                            advancedFilters[i].selected.splice(j,1);
                        }else {
                            // changes for defect DE131947 - Sindhu
                            if($scope.filters[i].title === 'Status'){
                                $scope.filters[i].selected_levels.splice(j,1);
                                $scope.filters[i].selected_values.splice(j,1);
                                if($scope.filters[i].categories[j].title === "SWEEPs Contracts"){
                                    advancedFilters[i].categories[j].selected = "No";
                                }else{
                                    advancedFilters[i].categories[j].selected = "All";
                                }
                              
                            }else if($scope.filters[i].title == "Dates"){ // Date filters were not getting cleared from the view applied - Sindhu
                                for(var a=0;a<advancedFilters[4].categories.length;a++){
                                    if(advancedFilters[4].categories[a].title == $scope.filters[i].selected_levels[j]){
                                        //Remove console error categories undefined
                                        if(advancedFilters[4].categories[a].dates !== 'fixedDate'){
                                            advancedFilters[4].categories[a].selected =  "Months";
                                            advancedFilters[4].categories[a].rangeFrom = null;
                                            advancedFilters[4].categories[a].rangeTo = null;
                                        }else{//Changes for enabling fixed date
                                            advancedFilters[4].categories[a].fixedDate = null;
                                            advancedFilters[4].categories[a].relativeDate = null;
                                        }
                                    }
                                }
                                $scope.filters[i].selected_levels.splice(j,1);
                                $scope.filters[i].selected_values.splice(j,1);
                                //Changes for DE143740 - Sindhu
                                $scope.filters[i].disabled_values.splice(j,1);
                            }else{
                                $scope.filters[i].selected_levels.splice(j,1);
                                $scope.filters[i].selected_values.splice(j,1);
                                advancedFilters[i].selected.splice(j,1);
                                advancedFilters[i].levels.splice(j,1);
                            }
                        }
                        delete $scope.checkedFilters[$scope.filters[i].title+"_"];
                        delete $scope.checkedFilters[$scope.filters[i].title];
                    }
                }
            }
            $scope.removeDependents(); //Changes for clearing the dependent(child) filters in view applied - Start
            $scope.changeClearLink();
            // filterServ.isSalesLevelLoaded = false;
            // filterServ.appliedFilters = $scope.filters;
            // filterServ.setSelectedFilters();
            // filterServ.filtersChanged();
        }

        $scope.changeClearLink = function () {
            $scope.disableClearLink = true;
            //$scope.cancelModal = true; //changes for DE132150 - Sindhu
            var keys = Object.keys($scope.checkedFilters);
            if($scope.cancelModalSingle !== undefined && $scope.cancelModalSingle === false){
                $scope.cancelModal = false;
            }
            for (var i = 0; i < keys.length; i++) {
                if ($scope.checkedFilters[keys[i]] === true) {
                    $scope.disableClearLink = false;
                    //$scope.cancelModal = false; //changes for DE139767 - Sindhu
                    break;
                }
                var subKeys = Object.keys($scope.checkedFilters[keys[i]]);
                for (var j = 0; j < subKeys.length; j++) {
                    if ($scope.checkedFilters[keys[i]][subKeys[j]] === true) {
                        $scope.disableClearLink = false;
                        //$scope.cancelModal = false; //changes for DE139767 - Sindhu
                        break;
                    }
                }
            }
        }

        // Changes for DE136810
        $scope.isDisabled = function(c,d){
           // Changes for US136100
            if(c.title === "Dataset"){
                return true;
            } else if(c.title !== 'Dates'  && ! (c.title === "Product" && d === "Product ID" && $scope.selectedPIDCount)) {
                for(var i=0 ; i<c.selected_levels.length; i++){
                     if(c.disabled_values !== undefined && d === c.selected_levels[i]){ // Changes for US136100
                        return c.disabled_values[i];
                    }
                }
            } else if(c.title === 'Dates'){ // Changes for US136100
                if(isCollab !== undefined && isCollab === "true"){
        //Changes for enabling fixed date
                    if(c.selected_values.length === 1 && d === 'LDoS Date'){
                        if(advancedFilters[4].categories[1].dates !== 'fixedDate'){
                            c.disabled_values[0] = true;
                            return c.disabled_values[0];
                        }
                        else{
                            c.disabled_values[0] = false;
                            return c.disabled_values[0];
                        }
                    }
                    else{
                        for(var j=0; j<c.selected_values.length ; j++){
                            if(c.disabled_values !== undefined){
                                if(d === 'LDoS Date' && c.selected_levels[j] === d){
                                    if(advancedFilters["4"].categories[1].dates !== 'fixedDate'){
                                        c.disabled_values[j] = true;
                                        return c.disabled_values[j];
                                    }
                                    else{
                                        c.disabled_values[j] = false;
                                        return c.disabled_values[j];
                                    }
                                }
                            }
                        }
                    }
                }
            } else if(c.title === "Product" && d === "Product ID" && $scope.selectedPIDCount){
                return true;
            }
        }

        // End View applied
        $scope.changeCheckBox = function(checked, title, subTitle) {
            if(typeof(subTitle) == "undefined"){
                subTitle = "";
                for (var i = 0; i < $scope.filters.length; i++) {
                    if ($scope.filters[i]['title'] == title) {
                        for (var j = 0; j < $scope.filters[i].selected_levels.length; j++) {
                            $scope.checkedFilters[title][$scope.filters[i].selected_levels[j]] = checked;
                        }
                    break;
                    }
                }
            }else { // Changes for DE132549
            var flag = true;
            for (var i = 0; i < $scope.filters.length; i++) {
                if ($scope.filters[i]['title'] === title) {
                    for (var j = 0; j < $scope.filters[i].selected_levels.length; j++) {
                        if ($scope.checkedFilters[title][$scope.filters[i].selected_levels[j]] !== checked) {
                            flag = false;
                            break;
                        }
                    }
                    if (flag === true) {
                        if (typeof ($scope.checkedFilters[title]) === "undefined")
                            $scope.checkedFilters[title] = {};
                        //$scope.checkedFilters[title +"_" + subTitle] = checked;
                        //DE144518 - Selecting sav doesn't select Accoutn checkbox- Arun DADA
                        $scope.checkedFilters[title]['value'] = checked;
                    }
                    else{
                        //$scope.checkedFilters[title +"_" + subTitle] = false;
                        $scope.checkedFilters[title]['value'] = false; // Changes for DE132549
                    }
                    break;
                }
            }
        }
            //$scope.checkedFilters[title +"_" + subTitle] = checked; // Changes for DE132549
            $scope.changeClearLink();
        }
    }
]);
