'use strict';
angular.module('ciscoExecDashApp').controller('ViewAppliedServiceFilterController', ['$uibModalInstance', '$scope','$sessionStorage','$rootScope',  function ($uibModalInstance, $scope, $sessionStorage, $rootScope) {


$scope.disableClearLink = true;
$scope.cancelModalSld = true; //changes for DE132150 - Sindhu
 var filterDetails = JSON.parse($sessionStorage.get('filters'));
 var advancedFilters = JSON.parse($sessionStorage.get('sldAdvancedFilters'));
 var filterCount = JSON.parse($sessionStorage.get('filterCount')); //Change for not calling the api when filter count is two by default - Sindhu
 var appliedFiltersCount = JSON.parse($sessionStorage.get('appliedFiltersCount'))

    var filterData = [
        {
          "title":"Sales",
          "selected_levels":[],
          "selected_values":[],
          "level": []
        },
        {
            "title": "Architecture",
            "selected_levels":[],
            "selected_values":[],
            "level": []
        },
        {
            "title": "Organization",
            "selected_levels":[],
            "selected_values":[],
            "level": []
        }
    ];


    angular.forEach(filterDetails, function(value) {
        if (value.categoryId === "sales") {
            if (value.level === 0) {
                filterData[0].selected_levels.push("Sales Level 1");
                filterData[0].selected_values.push(value.title);
                filterData[0].level.push(value.level);
            }
            if (value.level === 1) {
                filterData[0].selected_levels.push("Sales Level 2");
                filterData[0].selected_values.push(value.title);
                filterData[0].level.push(value.level);
            }
            if (value.level === 2) {
                filterData[0].selected_levels.push("Sales Level 3");
                filterData[0].selected_values.push(value.title);
                filterData[0].level.push(value.level);
            }
            if (value.level === 3) {
                filterData[0].selected_levels.push("Sales Level 4");
                filterData[0].selected_values.push(value.title);
                filterData[0].level.push(value.level);
            }
            if (value.level === 4) {
                filterData[0].selected_levels.push("Sales Level 5");
                filterData[0].selected_values.push(value.title);
                filterData[0].level.push(value.level);
            }
            if (value.level === 5) {
                filterData[0].selected_levels.push("Sales Level 6");
                filterData[0].selected_values.push(value.title);
                filterData[0].level.push(value.level);
            }
        }
        if (value.categoryId === "salesAM") {
            if (value.level === 1) {
                filterData[0].selected_levels.push("Account Manager");
                var actMng = [];
                actMng.push(value.title);
                filterData[0].selected_values.push(actMng);
                filterData[0].level.push(value.level);
            }
        }
        if (value.categoryId === "architectureGroups") {
            if (value.level === 0) {
                filterData[1].selected_levels.push(value.levelName);
                filterData[1].selected_values.push(value.title);
            }
        }
        if(value.categoryId === "organization") {
            if (value.level === 0) {
                filterData[2].selected_levels.push(value.levelName);
                filterData[2].selected_values.push(value.title);
            }
        }
        
    })  
    $scope.filters = filterData; 

    //     //$scope.filters = filters;
       
    //     $scope.bookmark = bookmark;
    //     $scope.activeTab = 0;
         $scope.checkedFilters = {};

        $scope.ok = function () {
            $uibModalInstance.dismiss('cancel');
        };

        $scope.cancel = function () {
            $uibModalInstance.dismiss('cancel');
            /*Change for not making the call when the view applied modal is closed when there is no filter selected - Sindhu*/
            if($scope.cancelModalSld === false){ //changes for DE132150 - Sindhu
                 $rootScope.$emit('view-applied-service-filter-date', {
                    'filtersData': advancedFilters
                })
             }
        };

        $scope.selectTab = function (t) {
            $scope.activeTab = t;
        };

    //     $scope.fromBookmark = $scope.bookmark != null ? true:false;

/*Changes for enabling View Applied functionality - Sindhu*/
//start
        $scope.removeSelectedFilter = function(c, d,index) {
            var count = 0;
            var countAcc = 0;
            $scope.cancelModalSingleSld = false;
            if(c.title != "Status") {
                for(var j=0;j<$scope.filters.length;j++) {
                    if($scope.filters[j].title == c.title) {
                        for(var i=0;i<c.selected_levels.length;i++) {
                            if(c.selected_levels[i] == d) {
                                $scope.filters[j].selected_values[i].splice(index, 1);
                                if($scope.filters[j].selected_values[i].length == 0) {
                                        // $scope.filters[j].selected_values.splice(index,1);
                                        // $scope.filters[j].selected_levels.splice(index,1);
                                        //         advancedFilters[j].selected.splice(index,1);
                                        $scope.filters[j].selected_levels.splice(index,1);
                                        advancedFilters[j].selected.splice(i,advancedFilters[j].selected.length-i);
                                }else{
                                        // $scope.filters[j].selected_values.splice(index,1);
                                        // advancedFilters[j].selected[i].splice(index,1);
                                        advancedFilters[j].selected[i].splice(index,1);
                                }
                                break;
                            }
                        }
                        break;
                    }
                }
            }
            $scope.changeClearLink();
        }

        $scope.changeClearLink = function () {
            $scope.disableClearLink = true;
            var keys = Object.keys($scope.checkedFilters);
            //changes for DE132150 - Sindhu
            if($scope.cancelModalSingleSld !== undefined && $scope.cancelModalSingleSld === false){
                $scope.cancelModalSld = false;
            }
            for (var i = 0; i < keys.length; i++) {
                if ($scope.checkedFilters[keys[i]].value == true) {
                    $scope.disableClearLink = false;
                    $scope.cancelModalSld = false; //changes for DE132150 - Sindhu
                    break;
                }
                var subKeys = Object.keys($scope.checkedFilters[keys[i]]);
                for (var j = 0; j < subKeys.length; j++) {
                    if ($scope.checkedFilters[keys[i]][subKeys[j]] == true) {
                        $scope.disableClearLink = false;
                        $scope.cancelModalSld = false; //changes for DE132150 - Sindhu
                        break;
                    }
                }
            }
        }

        $scope.clear = function() {
                for(var i=0;i<$scope.filters.length;i++) {
                    if($scope.filters[i].title == "Status")
                        continue;
                    if($scope.checkedFilters[$scope.filters[i].title+"_"] == true) {
                    $scope.filters[i].selected_levels = [];
                    $scope.filters[i].selected_values = [];
                    advancedFilters[i].selected = [];
                    $scope.selected_values = [];

                    delete $scope.checkedFilters[$scope.filters[i].title+"_"];
                    delete $scope.checkedFilters[$scope.filters[i].title];
                    continue;
                }
                for(var j=0;j<$scope.filters[i].selected_levels.length;j++) {
                    if($scope.checkedFilters[$scope.filters[i].title+"_"+$scope.filters[i].selected_levels[j]] == true) {
                            // $scope.filters[i].selected_levels.splice(j,1);
                            // $scope.filters[i].selected_values.splice(j,1);
                            // advancedFilters[i].selected[j] = [];
                            $scope.filters[i].selected_levels.splice(j,1);
                            $scope.filters[i].selected_values.splice(j,1);
                            advancedFilters[i].selected[j] = [];
                    }
                }
            }
            $scope.changeClearLink();
            // filterServ.isSalesLevelLoaded = false;
            // filterServ.appliedFilters = $scope.filters;
            // filterServ.setSelectedFilters();
            // filterServ.filtersChanged();
        }

        // End View applied
        $scope.changeCheckBox = function(checked, title, subTitle) {
            if(typeof(subTitle) == "undefined"){
                subTitle = "";
            }
            for (var i = 0; i < $scope.filters.length; i++) {
                if ($scope.filters[i]['title'] == title) {
                    for (var j = 0; j < $scope.filters[i].selected_levels.length; j++) {
                        $scope.checkedFilters[title][$scope.filters[i].selected_levels[j]] = checked;
                    }
                    break;
                }
            }
            $scope.checkedFilters[title +"_" + subTitle] = checked;
            $scope.changeClearLink();
        }
    }
]);