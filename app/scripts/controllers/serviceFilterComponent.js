(function(angular) {
    'use strict';
    ServiceFilterDetailController.$inject = ['FiltersServ',
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
    ];
    /* @ngInject */
    function ServiceFilterDetailController(filtersServ, ShareDataServ, UserServ, $rootScope, $timeout, $http, $routeParams, $filter, $sessionStorage, $scope, BookMarkData, $location, GlobalBookmarkServ, $q) {

        var vm = this;        
        vm.sales = {};
        vm.filtersChecked = 0;
        vm.salesLevel = [];
        vm.accounts = [];
        vm.sldAppliedFilters = [];
        vm.filters = [];
        vm.userInfo = {};
        vm.lockSalesFilter = {};
        vm.changeAccountManager = false;
        vm.propInsightSliderFilter = {};
        vm.month = '';
        vm.direction = '';
        vm.rangeFrom = '';
        vm.rangeTo = '';
        vm.propensityToTSAttach = {};
        vm.propensityToTSAttach = {};
        vm.isTsAttachFilter =  false;
        vm.isBookmarkActive = GlobalBookmarkServ.isBookmarkActive;
        vm.cmngFrmBookMark = false;
        if(vm.isBookmarkActive()){
            vm.cmngFrmBookMark = true;  
        }

        showShadow();
        $('.sidebar-nav').scroll(showShadow);
// change the path to filter_service.json and load the data :
//TODO : sindhu
         $http.get("config/filter_services.json", {}).then(function (d) {
            vm.sldAdvancedFilters = d.data;
            vm.userInfo = UserServ.data; 
            //vm.getSldFiltersDropdown();
               
            angular.forEach(vm.sldAdvancedFilters,function(filter){
                     vm.getSldFiltersDropdown(filter,0);
                     //i = 0 ;
                 })
                    vm.applyFilters();
                    vm.sales.active = true;

                /*vm.sldSalesLevelInit().then(function(){
               
                angular.forEach(vm.advancedFilters,function(filter){
                     vm.getSldFiltersDropdown(filter,i);
                     i = 0 ;
                  })
                    vm.applyFilters();
                    vm.sales.active = true;

            });*/

            
        });

         vm.getSldFiltersDropdownCount = function (c, i, autoload,changeEvent) {                       
            vm.filtersChecked = 0;
            vm.appliedFiltersCount = JSON.parse($sessionStorage.get('appliedFiltersCount'));
            for(var j=0; j < vm.sldAdvancedFilters.length; j++){
                    if(vm.sldAdvancedFilters[j].selected && vm.sldAdvancedFilters[j].selected.length > 0){
                        for (var k = vm.sldAdvancedFilters[j].selected.length - 1; k >= 0; k--) {
                            if(vm.sldAdvancedFilters[j].selected[k] && vm.sldAdvancedFilters[j].selected[k].length > 0){
                                vm.isFiltersChecked = true;
                                vm.filtersChecked += 1;
                            }
                        }
                    }
                }
            };

        vm.getSldFiltersDropdown = function (c, i, autoload,changeEvent) {
            var auto = typeof autoload === 'undefined' ? false : autoload;
            var slug = c.slug;
            var advancedSalesFilterValues = [];
            var orgFilterValues = [];
            var savmFilterValues = [];
            vm.filtersChecked = 0;                   

                var currentFilter = $filter('filter')(vm.sldAdvancedFilters, {slug: slug})[0];
              if(c.slug == 'sales'){
                if(vm.sldAdvancedFilters[0].levels[0].length == 0){
                    filtersServ.getDropdown(null, 1, slug).then(function (response) {
                        angular.forEach(response, function(salesFilterResponse){                       
                            angular.forEach(salesFilterResponse, function(keys, salesFilterValues){                            
                                for (var i = 0 ; i < keys.length; i++){
                                    advancedSalesFilterValues.push({"keys": keys[i]});
                                    vm.sldAdvancedFilters[0].levels[0].push({"keys": keys[i]});
                                } 
                            })
                        })

                    });
                }//currentFilter.levels[0] = advancedSalesFilterValues;
              }else if(c.slug == 'architecture'){
                filtersServ.getDropdown(null, 1, slug).then(function (response) {
                            angular.forEach(response, function(salesFilterResponse){                       
                                angular.forEach(salesFilterResponse, function(keys, salesFilterValues){                            
                                    for (var i = 0 ; i < keys.length; i++){
                                            advancedSalesFilterValues.push({"keys": keys[i]});
                                vm.sldAdvancedFilters[1].levels[0].push({"keys": keys[i]});
                                          }
                                })
                            })          
                    });
                }else if(c.slug == 'organization'){
                filtersServ.getDropdown(null, 1, slug).then(function (response) {
                            angular.forEach(response, function(salesFilterResponse){                       
                                angular.forEach(salesFilterResponse, function(keys, salesFilterValues){                            
                                    for (var i = 0 ; i < keys.length; i++){
                                            advancedSalesFilterValues.push({"keys": keys[i]});
                                vm.sldAdvancedFilters[2].levels[0].push({"keys": keys[i]});
                                          }
                                })
                            })          
                    });
                }
        };


        vm.selectAllCheckboxes = function (c, f, index) {
            var arr = [];
            angular.forEach(f, function (o) {                
                arr.push(o[0]);
            });
            c.selected[index] = arr;
            vm.getFiltersDropdown(c, index + 1);
        };

       

        vm.isMultiple = function (c, index) {
            return !(c.levels_name[index] === 'Territory Coverage');
        };

     
        vm.sidebarActiveToggle = function(b) {
            $rootScope.$broadcast('sidebar-toggle', b);
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


        

        vm.toggleVar = function(e, c) { /* yopgupta - Added to toggle passed variable */
           c.active = !c.active;
        };

        


        vm.clearFilters = function(category, keepApplied) {
            var cF = {};
            cF.category = category;
            cF.keepApplied = keepApplied;
            vm.filtersChecked = 0;

          if (typeof keepApplied === 'undefined' || typeof keepApplied === 'boolean') {
                vm.propensityToRefresh.minValue = 1;
                vm.propensityToRefresh.maxValue = 5;
                vm.propensityToTSAttach.minValue = 0;
                vm.propensityToTSAttach.maxValue = 100;
                vm.propInsightSliderFilter = false;
               
            }
            $rootScope.$broadcast('clear-filter-params', cF);
            
        }

        $rootScope.$on('view-applied-service-filter-date', function(data, event) {

            vm.gvscsFilterToStrng = "";
            if(angular.isDefined(event.filtersData[1].selected[5])){
                vm.gvscsFilterToStrng =  event.filtersData[1].selected[5]["0"];
                vm.sldAdvancedFilters[1].selected[5] = "";
                vm.sldAdvancedFilters[1].selected[5] =  vm.gvscsFilterToStrng;
            }
           $scope.sldAppliedFilters = event.filtersData;
            vm.sldAdvancedFilters = event.filtersData;
            vm.filtersChecked = 0;
            for(var j=0; j < vm.sldAdvancedFilters.length; j++){
                    if(vm.sldAdvancedFilters[j].selected && vm.sldAdvancedFilters[j].selected.length > 0){
                        for (var k = vm.sldAdvancedFilters[j].selected.length - 1; k >= 0; k--) {
                            if(vm.sldAdvancedFilters[j].selected[k] && vm.sldAdvancedFilters[j].selected[k].length > 0){
                                vm.isFiltersChecked = true;
                                vm.filtersChecked += 1;
                        }
                    }
                }                    
            }
             vm.applyFilters(); //end
        });
        

        var clearFilterParams = $rootScope.$on('clear-filter-params', function(event, data) {
                    vm.sldAdvancedFilters[0].selected =  [];
                    vm.sldAdvancedFilters[1].selected =  [];
                    vm.sldAdvancedFilters[2].selected =  [];
                    vm.applyFilters();        
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


        var removeFiltersOne = $rootScope.$on('remove-filters', function(event, data) {
            var i = vm.sldAppliedFilters.indexOf(data);
            $rootScope.$broadcast('active-drill', data.title);
            if (data.categoryId === 1) {
                if (data.level < 5) {
                    vm.accounts = [];
                }
                vm.setNextSalesLevelSelection(data.level);
                var categoryFound = false;
                do {
                    if (vm.sldAppliedFilters[i] && vm.sldAppliedFilters[i].categoryId === 1) {
                        var salesChildFilter = vm.sldAppliedFilters.splice(i, 1);
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
                    if (vm.sldAppliedFilters[i] && vm.sldAppliedFilters[i].categoryId === 3) {
                        var accountsChildFilter = vm.sldAppliedFilters.splice(i, 1);
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
                var filters = $filter('filter')(vm.filters, { categoryId: 2 });
                filters = filters[0];
                for (var k = 0; k < vm.filters[0].filters.length; k++) {
                    if (vm.filters[0].filters[k].title === data.title) {
                        vm.filters[0].filters[k].checked = false;
                        vm.checkParent(vm.filters[0].filters, vm.filters[0]);
                    }
                }
            } else if (data.categoryId === 4) {
                var filters = $filter('filter')(vm.filters, { categoryId: 4 });
                filters = filters[0];
                filters.selected = '';
            }
            //vm.getSelectedCount();
            vm.applyFilters();
            return;
        })


        var rootApplyBookmark = $rootScope.$on('apply-bookmark', function (event, data) {
            vm.sldSalesLevelInit();
            vm.applyFilters();
        });

        vm.filtersChanged = function() {
            if(vm.isBookmarkActive()) {
                var bookmarkFilters = GlobalBookmarkServ.bookmark.filter;
                var sldAppliedFilters = vm.sldAppliedFilters;
                vm.isFiltersChanged = !angular.equals(bookmarkFilters, sldAppliedFilters);
                if(vm.cmngFrmBookMark){
                    vm.isFiltersChanged = false;
                }
            }
            else {
                vm.isFiltersChanged = false;
            }
            $rootScope.$broadcast('filter-changed', vm.isFiltersChanged);  
        };
    

        vm.applyFilters = function() {
            vm.filtersChanged();
            vm.cmngFrmBookMark = false;
            vm.accounts = [];
            vm.sldAppliedFilters = []; 
          
            if(vm.sldAdvancedFilters[0].slug === 'sales'){
              for(var i = 0 ; i < 3 ; i++){
                if(angular.isDefined(vm.sldAdvancedFilters[0].selected[i])){
                    if(vm.sldAdvancedFilters[0].selected[i] !== null){
                           if(vm.sldAdvancedFilters[0].selected[i].length > 0){                         
                                vm.sldAppliedFilters.push({
                                "title": vm.sldAdvancedFilters[0].selected[i],
                                "level": i,
                                "categoryId": "sales"
                             });
                        }
                        }
                    } 
                }
           
        }                        

        if(vm.sldAdvancedFilters[1].slug === 'architecture'){
          for(var i = 0 ; i < vm.sldAdvancedFilters[1].selected.length ; i++){

            if(angular.isDefined(vm.sldAdvancedFilters[1].selected[i])){
                 if(vm.sldAdvancedFilters[1].selected[i] !== null){
                if(vm.sldAdvancedFilters[1].selected[i].length > 0){
                 vm.sldAppliedFilters.push({
               
                "title": vm.sldAdvancedFilters[1].selected[i],
                "level": i,
                "categoryId": "architectureGroups", //Change for sending correct values for architectureGroups for the api call - Sindhu
                "levelName": vm.sldAdvancedFilters[1].levels_name[i]
             });
            }
             }
         }

            
            }
        }

        if(vm.sldAdvancedFilters[2].slug === 'organization'){
          for(var i = 0 ; i < vm.sldAdvancedFilters[2].selected.length ; i++){
            if(angular.isDefined(vm.sldAdvancedFilters[2].selected[i])){
                if(vm.sldAdvancedFilters[2].selected[i] !== null){
               
                    if(vm.sldAdvancedFilters[2].selected[i].length){
                        vm.sldAppliedFilters.push({
                            "title": vm.sldAdvancedFilters[2].selected[i],
                            "level": i,
                            "categoryId": "organization",
                            "levelName": vm.sldAdvancedFilters[2].levels_name[i]
                        });
                    }
                }
            }                            
          }                            

        }

            /*if(vm.propInsightSliderFilter){

                var str = vm.propInsightSliderFilter.refreshPropensity.length;

                 if(str < 48){


                      vm.sldAppliedFilters.push({
                       "title": "propensity",
                       "categoryId": 5,
                       "refresh": vm.propInsightSliderFilter.refreshPropensity
                     })
                }

                if(vm.isTsAttachFilter){
                    vm.sldAppliedFilters.push({
                       "title": "attachPropensity",
                       "categoryId": 6,
                       "minValue": vm.propInsightSliderFilter.lowerAttachPropensity,
                       "maxValue" : vm.propInsightSliderFilter.higherAttachPropensity
                     })
                }


            }

            for (var i = 0; i < vm.filters.length; i++) {
                if (vm.filters[i].checked && false) {
                    var s = angular.copy(vm.filters[i]);
                    s.title = 'All ' + s.title;
                    s.categoryId = 2;
                    vm.sldAppliedFilters.push(s);
                    continue;
                }
                if (vm.filters[i].type === 'radio') {
                    if (vm.filters[i].selected) {
                        vm.sldAppliedFilters.push({
                            "title": vm.filters[i].selected,
                            "categoryId": 4
                        });
                    }
                } else {
                    for (var j = 0; j < vm.filters[i].filters.length; j++) {
                        if (vm.filters[i].filters[j].checked) {
                            vm.filters[i].filters[j].categoryId = 2;
                            vm.sldAppliedFilters.push(vm.filters[i].filters[j]);
                        }
                    }
                }
            }*/
             $sessionStorage.sldAdvancedFilters = JSON.stringify(vm.sldAdvancedFilters);
            $sessionStorage.put('sldAdvancedFilters', JSON.stringify(vm.sldAdvancedFilters));
            vm.sldFilterToController  = {};
            vm.sldFilterToController.sldAppliedFilters = vm.sldAppliedFilters;
            vm.sldFilterToController.nodeName = vm.salesLevel;
            vm.sldFilterToController.salesLevel = vm.salesLevel;
            vm.sldFilterToController.sldAppliedFiltersCount = vm.filtersChecked;  
            
            $sessionStorage.put('filters', JSON.stringify(vm.sldAppliedFilters));
            $sessionStorage.put('accounts', JSON.stringify(vm.accounts));   
            $sessionStorage.put('appliedFiltersCount', JSON.stringify(vm.filtersChecked));
            $rootScope.$broadcast('sld-apply-filter', vm.sldFilterToController);   

        };



        //Propensity changes by meera
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
        });

        //adding watch on propensity filter
        var propensityToRefreshWatch = $scope.$watch('vm.propensityToRefresh',function(newVal,oldVal){
            if(newVal != oldVal){
                vm.isFiltersChecked = true;
                vm.isTsAttachFilter =  false;
                var propensityRefreshValues = [];
                for(var i = vm.propensityToRefresh.minValue; i <= vm.propensityToRefresh.maxValue; i++){
                   propensityRefreshValues.push(vm.propensityToRefresh.options.translate(i));
                }

                vm.propInsightSliderFilter.refreshPropensity = JSON.stringify(propensityRefreshValues);
            } else {
                vm.propInsightSliderFilter.refreshPropensity = ["Unlikely","Low","Medium","High","Very Likely"];
            }
        }, true);

var propensityToTSAttachWatch = $scope.$watch('vm.propensityToTSAttach',function(newVal,oldVal){
            if(newVal != oldVal){
                vm.isFiltersChecked = true;

                vm.isTsAttachFilter = true;
                vm.propInsightSliderFilter.lowerAttachPropensity = vm.propensityToTSAttach.minValue;
                vm.propInsightSliderFilter.higherAttachPropensity = vm.propensityToTSAttach.maxValue;
            }else{
                vm.isTsAttachFilter = false;
                vm.propInsightSliderFilter.lowerAttachPropensity = 0;
                vm.propInsightSliderFilter.higherAttachPropensity = 100;
            } 
        }, true);


        $scope.$on('selected-count', function(data, event) {
            //vm.getSelectedCount();

        });

        vm.checkAll = function(a, c) {
            angular.forEach(a, function(o) {
                o.checked = c;
            });
            //vm.getSelectedCount();
        };

vm.checkParent = function(a, c) {
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
            //vm.getSelectedCount();
        };

        var callApply = $rootScope.$on('call-apply-filters',function(event, data){
            if(data === "undrill"){
                vm.accounts = [];
                // removing values from advanced filters incase someone has clicked on undrill
                //without this line Undrill will not work for Account Manager
                if (vm.sldAdvancedFilters[0] && vm.sldAdvancedFilters[0].selected && vm.sldAdvancedFilters[0].selected.length === 7) {
                    vm.sldAdvancedFilters[0].selected[6] = [];
                }
            }
            if(vm.sldAdvancedFilters[0] && vm.sldAdvancedFilters[0].selected && data && data.eventFrom === "manager"){
                for(var i = 0 ; i < data.managerName.length ; i++){
                    vm.sldAdvancedFilters[0].selected[6] = [];
                    vm.sldAdvancedFilters[0].selected[6][i] = data.managerName[i];
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
    }

    angular.module('ciscoExecDashApp').component('servicefilterDetail', {
        templateUrl: 'views/service-filter-detail.html',
        controller: ServiceFilterDetailController,
        controllerAs: 'vm'
    });
})(window.angular);