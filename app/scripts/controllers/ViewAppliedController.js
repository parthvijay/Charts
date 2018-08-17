'use strict';
angular.module('ciscoExecDashApp').controller('ViewAppliedController', ['$uibModalInstance', '$scope', 'filters', 'bookmark','FiltersServ', function ($uibModalInstance, $scope, filters, bookmark, filtersServ) {

    $scope.filtersServ = filtersServ;
    var filterData = [
        {
          "title":"Sales",
          "selected_levels":[],
          "selected_values":[]
        },
        {
          "title":"Account",
          "selected_levels":[],
          "selected_values":[]
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
          "selected_values":[]
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
          "selected_values":[]
        },
        {
          "title":"Status",
          "selected_levels":[
            "Coverage",
            "Network Collection",
            "SWEEPs Contracts"
          ],
          "selected_values":[]
        },
        {
          "title":"Dataset",
          "selected_levels":[],
          "selected_values":[],
          "level": []
        }
    ];


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

    $scope.disableRemoveIcon = function (c, d, i) {
        if (d === 'Product ID' && $scope.selectedPIDCount) {
            return true;
        }
        return false;
    }

    //Changes for DE136744
    $scope.insightFilters = {
        "propensityToRefresh":  ["Unlikely", "Low", "Medium", "High", "Very Likely"],
        "propensityToTSAttach": "0%-100%"
    }
      
      //this is a generic function for both view applied filters and view applied filters on bookmark need to return false in case of later
    $scope.hideInvalidFilters = function(c){
        if(filtersServ.disablePDS){
            return  !(( c.title === "Account"|| c.title === "Services"|| c.title === "Product" || c.title === "Dates" || c.title === "Status" || c.title === 'Dataset') && filtersServ.disablePDS);
         }else{
             return !(c.title === 'Dataset' && !filtersServ.showDataSetFilters);
         }
    };

    angular.forEach(filters[0], function(value) {
        if (value.categoryId === "sales") {
            if (value.level === 0) {
                filterData[0].selected_levels.push("Sales Level 1");
                filterData[0].selected_values.push(value.title);
            }
            if (value.level === 1) {
                filterData[0].selected_levels.push("Sales Level 2");
                filterData[0].selected_values.push(value.title);
            }
            if (value.level === 2) {
                filterData[0].selected_levels.push("Sales Level 3");
                filterData[0].selected_values.push(value.title);
            }
            if (value.level === 3) {
                filterData[0].selected_levels.push("Sales Level 4");
                filterData[0].selected_values.push(value.title);
            }
            if (value.level === 4) {
                filterData[0].selected_levels.push("Sales Level 5");
                filterData[0].selected_values.push(value.title);
            }
            if (value.level === 5) {
                filterData[0].selected_levels.push("Sales Level 6");
                filterData[0].selected_values.push(value.title);
            }
        }
        if (value.categoryId === "salesAM") {
            if (value.level === 0) {
                filterData[0].selected_levels.push("Account Manager");
                var actMng = [];
                actMng.push(value.title);
                filterData[0].selected_values.push(actMng);
            }
        }
        if(value.categoryId === "account") {
            if (value.level === 0) {
                filterData[1].selected_levels.push(value.levelName);
                filterData[1].selected_values.push(value.title);
            }
            if (value.level === 1) {
                filterData[1].selected_levels.push(value.levelName);
                filterData[1].selected_values.push(value.title);
            }
            if (value.level === 2) {
                filterData[1].selected_levels.push(value.levelName);
                filterData[1].selected_values.push(value.title);
            }
            if (value.level === 3) {
                filterData[1].selected_levels.push(value.levelName);
                filterData[1].selected_values.push(value.title);
            }
            if (value.level === 4) {
                filterData[1].selected_levels.push(value.levelName);
                filterData[1].selected_values.push(value.title);
            }
            if (value.level === 5) {
                filterData[1].selected_levels.push(value.levelName);
                filterData[1].selected_values.push(value.title);
            }
            if (value.level === 6) {
                filterData[1].selected_levels.push(value.levelName);
                filterData[1].selected_values.push(value.title);
            }
            if (value.level === 7) {
                filterData[1].selected_levels.push(value.levelName);
                filterData[1].selected_values.push(value.title);
            }
        }
        if(value.categoryId === "product") {
            if (value.level === 0) {
                filterData[2].selected_levels.push(value.levelName);
                filterData[2].selected_values.push(value.title);
            }
            if (value.level === 1) {
                filterData[2].selected_levels.push(value.levelName);
                filterData[2].selected_values.push(value.title);
            }
            if (value.level === 2) {
                filterData[2].selected_levels.push(value.levelName);
                filterData[2].selected_values.push(value.title);
            }
            if (value.level === 3) {
                filterData[2].selected_levels.push(value.levelName);
                filterData[2].selected_values.push(value.title);
            }
            if (value.level === 4) {
                filterData[2].selected_levels.push(value.levelName);
                filterData[2].selected_values.push(value.title);
            }
            if (value.level === 5) {
                filterData[2].selected_levels.push(value.levelName);
                filterData[2].selected_values.push(value.title);
            }
            if(value.level === 6){
                filterData[2].selected_levels.push(value.levelName);
                filterData[2].selected_values.push(value.title);
            }
            if(value.level === 7){
                filterData[2].selected_levels.push(value.levelName);
                filterData[2].selected_values.push(value.title);
            }
        }
        if(value.categoryId === "services") {
            if (value.level === 0) {
                filterData[3].selected_levels.push(value.levelName);
                filterData[3].selected_values.push(value.title);
            }
            if (value.level === 1) {
                filterData[3].selected_levels.push(value.levelName);
                filterData[3].selected_values.push(value.title);
            }
            if (value.level === 2) {
                filterData[3].selected_levels.push(value.levelName);
                filterData[3].selected_values.push(value.title);
            }
        }
        "Relative Date within 1 to 2 Months From now"
        if (value.categoryId === "date") {
            filterData[4].selected_levels.push(value.title);
            //DE148152- Space issue- Arun Dada
            var composeDate = "Relative Date within" + " " + value.from + " to " + value.to + " " + value.period; //Change for DE151344
            var showDate = [];
            showDate.push(composeDate);
            filterData[4].selected_values.push(showDate);
        }
        if(value.categoryId === "coverage") {
            var coverage = [];
            coverage.push(value.coverage);
            // changes for defect DE137549 - Sindhu
            if(coverage[0] !== "All"){
                filterData[5].selected_levels.push("Coverage");
            filterData[5].selected_values.push(coverage);
                /*filterData[4].level.push(value.level);*/
            }
        }
        if(value.categoryId === "network") {
            var network = [];
            network.push(value.network);
            if(network[0] !== "All"){
                filterData[5].selected_levels.push("Network Collection");
                filterData[5].selected_values.push(network);
            }
        }
        if(value.categoryId === "sweeps") {
            // the applied filter pop up was not showing up in bookmarks page for newly created bookmark
            var sweeps = [];
            sweeps.push(value.sweeps);
            if(sweeps[0] !== "No"){
                filterData[5].selected_levels.push("SWEEPs Contracts");
                filterData[5].selected_values.push(sweeps);
            }
        }
        if(value.categoryId === "dataset"){
            filterData[6].selected_levels.push("Covered IB Shipment/Processing FY Range");
            filterData[6].selected_levels.push("Uncovered IB Shipment FY Range");
            filterData[6].selected_values.push(new Array(value.coveredStartDate + " - " + value.coveredEndDate));
            filterData[6].selected_values.push(new Array(value.uncoveredStartDate + " - " + value.uncoveredEndDate));
        }
        // Changes for DE136744
        if(value.categoryId === 5){
            if(!Array.isArray(value.refresh))
            $scope.insightFilters.propensityToRefresh = JSON.parse(value.refresh);
        }
        if(value.categoryId === 6){
            $scope.insightFilters.propensityToTSAttach = value.minValue + "%-" + value.maxValue+"%";
        }
    })

        //$scope.filters = filters;
        $scope.filters = filterData;
        $scope.bookmark = bookmark;
        $scope.activeTab = 0;
        $scope.checkedFilters = {};
        $scope.disableClearLink = true;

        $scope.ok = function () {
            $uibModalInstance.dismiss('cancel');
        };

        $scope.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        };

        $scope.selectTab = function (t) {
            $scope.activeTab = t;
        };

        $scope.fromBookmark = $scope.bookmark != null ? true:false;

        $scope.removeSelectedFilter = function(c, d,index) {
            if(c.title != "Status") {
                for(var j=0;j<$scope.filters.length;j++) {
                    if($scope.filters[j].title == c.title) {
                        for(var i=0;i<c.selected_levels.length;i++) {
                            if(c.selected_levels[i] == d) {
                                $scope.filters[j].selected_values[i].splice(index, 1);
                                if($scope.filters[j].selected_values[i].length == 0) {
                                    if(c.title == "Sales" || c.title == "Product") {
                                        $scope.filters[j].selected_values.splice(i, $scope.filters[j].selected_values.length-i);
                                        $scope.filters[j].selected_levels.splice(i, $scope.filters[j].selected_levels.length-i);
                                    }
                                    else {
                                        $scope.filters[j].selected_values.splice(i, 1);
                                        $scope.filters[j].selected_levels.splice(i, 1);
                                    }
                                }
                                break;
                            }
                        }
                        break;
                    }
                }
            }
            filterServ.isSalesLevelLoaded = false;
            filterServ.appliedFilters = $scope.filters;
            filterServ.setSelectedFilters();
            filterServ.filtersChanged();
            $scope.changeClearLink();
        }

        $scope.clear = function() {
            for(var i=0;i<$scope.filters.length;i++) {
                if($scope.filters[i].title == "Status")
                    continue;
                if($scope.checkedFilters[$scope.filters[i].title+"_"] == true) {
                    $scope.filters[i].selected_levels = [];
                    $scope.selected_values = [];
                    delete $scope.checkedFilters[$scope.filters[i].title+"_"];
                    delete $scope.checkedFilters[$scope.filters[i].title];
                    continue;
                }
                for(var j=0;j<$scope.filters[i].selected_levels.length;j++) {
                    if($scope.checkedFilters[$scope.filters[i].title+"_"+$scope.filters[i].selected_levels[j]] == true) {
                        if($scope.filters[i].title == "Sales") {
                            $scope.filters[i].selected_levels.splice(j,$scope.filters[i].selected_levels.length-j);
                            $scope.filters[i].selected_values.splice(j,$scope.filters[i].selected_values.length-j);
                        }
                        else if($scope.filters[i].title == "Product") {
                            for(var k=1;k+j<$scope.filters[i].selected_levels.length;k++) {
                                if($scope.filters[i].selected_levels[k+j]=="Product Type" || $scope.filters[i].selected_levels[k+j] == "Warranty")
                                    break;
                            }
                            $scope.filters[i].selected_levels.splice(j,k);
                            $scope.filters[i].selected_values.splice(j,k);
                        }
                        else {
                            $scope.filters[i].selected_levels.splice(j,1);
                            $scope.filters[i].selected_values.splice(j,1);
                        }
                    }
                }
            }
            filterServ.isSalesLevelLoaded = false;
            filterServ.appliedFilters = $scope.filters;
            filterServ.setSelectedFilters();
            filterServ.filtersChanged();
            $scope.changeClearLink();
        }

        $scope.changeClearLink = function () {
            $scope.disableClearLink = true;
            var keys = Object.keys($scope.checkedFilters);
            for (var i = 0; i < keys.length; i++) {
                if ($scope.checkedFilters[keys[i]].value == true) {
                    $scope.disableClearLink = false;
                    break;
                }
                var subKeys = Object.keys($scope.checkedFilters[keys[i]]);
                for (var j = 0; j < subKeys.length; j++) {
                    if ($scope.checkedFilters[keys[i]][subKeys[j]] == true) {
                        $scope.disableClearLink = false;
                        break;
                    }
                }
            }
        }

        $scope.changeCheckBox = function(checked, title, subTitle) {
            if(typeof(subTitle) == "undefined"){
                subTitle = "";
            }
            $scope.checkedFilters[title +"_" + subTitle] = checked;
            $scope.changeClearLink();
        }
    }
]);
