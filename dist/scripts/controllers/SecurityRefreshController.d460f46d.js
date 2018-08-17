'use strict';

angular.module('ciscoExecDashApp').controller('SecurityRefreshController', ['$scope', '$rootScope', '$http', 'RestUri', '$sessionStorage', 'FiltersServ', 'securityRefreshServ', '$filter', '$timeout', '$uibModal', 'CiscoUtilities', function ($scope, $rootScope, $http, restUri, $sessionStorage, filtersServ, securityRefreshServ, $filter, $timeout, $uibModal, CiscoUtilities) {


    $rootScope.analysis = 'campaign';
    $rootScope.dashboard = 'securityRefresh';
    $rootScope.$emit('user-info-updated', UserServ.data);
    //reset filters and remove any existing active bookmark
    //filtersServ.resetAllFilters();
    filtersServ.showInsightFilters('securityRefresh');
    $scope.currentBookmark = null;
    $scope.newBookmarkSaved = false;
    $scope.lineCountSelected = 0;
    $scope.listamountselected = 0;
    $scope.CiscoUtilities = CiscoUtilities;
    CiscoUtilities.setGlobalParam(false);//Change for DE171959
    $scope.checkboxCount = 0;
    $scope.dropdownsize = '10';
    $scope.paginationValues = ['10', '25', '50', '100', '500'];
    //$scope.owlCarouselOptions = {navigation: true, pagination: false, rewindNav: false, items: 3, responsive: false};
    $scope.owlCarouselOptions = {loop:true, items: 3, slideSpeed: 3000,navigation: true, scrollPerPage: true};
        //reload carousel on global filters open and close
    $scope.$watch('$scope.sidebarActive', function (newValue, oldValue) {
        if (newValue !== oldValue) {
            $timeout(function () {
                $('.owl-carousel').data('owlCarousel').reinit($scope.owlCarouselOptions);
            }, 500);
        }
    },true);

    
    var sideToggleRoot = $rootScope.$on('sidebar-toggle', function (event, data) {
         $scope.sidebarActiveToggle(data);
    });


    $rootScope.showRefreshInsightFilter = filtersServ.showRefreshInsightFilter;
    $rootScope.showTSAttachInsightFilter = filtersServ.showTSAttachInsightFilter;
    var tempInsightFilters = {"showRefreshInsightFilter":filtersServ.showRefreshInsightFilter,
                                "showTSAttachInsightFilter":filtersServ.showTSAttachInsightFilter
                            };
    $scope.$broadcast('opportunity-active-change',tempInsightFilters);

    // $scope.moveScrollToBottom = function () {
    //     $timeout(function () {
    //         var element = document.getElementById("bottom-scroll");
    //         if (element) {
    //             element.scrollTop = element.scrollHeight;
    //             element.scrollLeft = element.scrollWidth;
    //         }
    //     }, 500);
    // }

    $scope.sidebarActiveToggle = function(b) {
        
        $scope.sidebarAnimated = false;
        $scope.sidebarActive = b;
        if (window.innerWidth >= 1200 || true) {
            $timeout(function() {
                $scope.sidebarAnimated = true;
            }, 510);
        }
    };
    
    
    //$http.get('../data/campaigns/sr.json')
    $scope.getData = function(){
        var filtersToBeApplied = {};
        filtersToBeApplied = $scope.CiscoUtilities.cleansedFilters($scope.appliedFilters);
        securityRefreshServ.getData(filtersToBeApplied, 'security-refresh-Sales').then(function (res) {
            $rootScope.accessIssue = "";
            $scope.$broadcast('opportunity-active-change',tempInsightFilters);
            $rootScope.accessIssue = "";
            $scope.lineCountSelected = 0;
            $scope.header = angular.copy(res.header);
            $scope.slides = angular.copy(res.slides);
            $scope.gridOptions.api.setColumnDefs($scope.formatColumnData(res.columnsData));
            $scope.rowDataFromAPI = angular.copy(res.rowsData);
            $scope.gridOptions.api.setRowData($scope.formatRowData(res.rowsData));
            $scope.gridOptions.minRowsToShow = res.rowsData.length;
            $scope.removeCheckboxesAtSalesLevel(); // Change for DE159123

            //timeout added to load the HTML
            $timeout(function () {
                getSecurityRefreshGridHeight();
            }, 500);
        });
    }

    $scope.$on('apply-filter', function (data, event) {
        data.preventDefault();

        $scope.appliedFilters = event.appliedFilters;
        $scope.appliedFiltersCount = event.appliedFiltersCount;


        $scope.sidebarActiveToggle(false);

        $sessionStorage.appliedFilters = JSON.stringify($scope.appliedFilters);
        $sessionStorage.put('appliedFilters', JSON.stringify($scope.appliedFilters));
        $sessionStorage.put('filterCount', JSON.stringify($scope.appliedFiltersCount));

        $scope.getData();

    });

    $scope.openViewApplied = function () {
        $uibModal.open({
            templateUrl: 'views/modal/view-applied-filter.html',
            controller: 'ViewAppliedFilterController',
            size: 'lg',
            backdrop: 'static'

        });
    };

    $scope.formatRowData = function (data) {
        angular.forEach(data, function (value, key) {
            if (value.savID) {
                value.savName = value.savName + '</br><span class="ag-grid sav-id">' + value.savID + '</span>';
            }
        })
        return data;
    }
    
    $scope.formatColumnData = function (colDef) {
        angular.forEach(colDef, function (v, k) {
            if (v.field === "totalNetBookings") {
                var key = "valueFormatter";
                var value = function valFormatter(params) {
                    return $filter('formatGridValue')(params.value, false, false, true);
                };
                v[key] = value;
            }
            if (v.children) {
                angular.forEach(v.children, function (child) {
                    if (child.children) {
                        angular.forEach(child.children, function (subChild) {
                            var key = "valueFormatter";
                            var value = function valFormatter(params) {
                                return $filter('formatGridValue')(params.value, false, false, true);
                            };
                            subChild[key] = value;
                        })
                        angular.forEach(child.children, function (subChild) {
                            var key2 = "cellClassRules";
                            var value2 = {

                                    'orangeTxt': function checkOpp(params) {
                                    if (params.data.salesLevel) {
                                       for( i in params.data){
                                           if( i  === params.colDef.field){
                                            var keys = i.split("_");
                                            var parentLevel = keys[0] + "_" + keys[1];
                                            break;
                                           }
                                       }
                                        //var indexOfValue = Object.values(params.data).indexOf(params.value);
                                           
                                            var totalOpportunityValue = 0;
                                            for (var i = 0; i < Object.keys(params.data).length; i++) {
                                                if (Object.keys(params.data)[i].indexOf(parentLevel) > -1) {
                                                    //getting pipeline index to get pipeline value to compare with opp value
                                                    if (Object.keys(params.data)[i].indexOf("sfdcpipeline") > -1) {
                                                        var pipelineIndex = i;
                                                    } else {
                                                        //get total opportunity value
                                                        totalOpportunityValue += Object.values(params.data)[i];
                                                    }
                                                }
                                            }
                                            //check if pipeline value is present
                                            if (((Object.values(params.data)[pipelineIndex] > 0) || (Object.values(params.data)[pipelineIndex] < 0))  && Object.values(params.data)[pipelineIndex] < totalOpportunityValue) {
                                                return true;
                                            }
                                    }
                                },
                                'redTxt': function checkOpp(params) {
                                    if (params.data.salesLevel) {
                                        for( i in params.data){
                                           if( i  === params.colDef.field){
                                            var keys = i.split("_");
                                            var parentLevel = keys[0] + "_" + keys[1];
                                            break;
                                           }
                                       }
                                        //var indexOfValue = Object.values(params.data).indexOf(params.value);
                                           
                                            var totalOpportunityValue = 0;
                                            for (var i = 0; i < Object.keys(params.data).length; i++) {
                                                if (Object.keys(params.data)[i].indexOf(parentLevel) > -1) {
                                                    //getting pipeline index to get pipeline value to compare with opp value
                                                    if (Object.keys(params.data)[i].indexOf("sfdcpipeline") > -1) {
                                                        var pipelineIndex = i;
                                                        break;
                                                    } 
                                                }
                                            }
                                                //check if pipeline value is present
                                                if ((Object.values(params.data)[pipelineIndex] === 0) || (Object.values(params.data)[pipelineIndex] === undefined)){
                                                    return true;
                                                }
                                            }
                                        },
                                
                            
                                'greenTxt': function checkOpp(params) {
                                    if (params.data.salesLevel) {
                                        return true
                                    }
                                },
                            }
                            subChild[key2] = value2;
                        })
                    } else {
                        var key = "valueFormatter";
                        var value = function valFormatter(params) {
                            return $filter('formatGridValue')(params.value, false, false, true);
                        };
                        child[key] = value;
                    }
                })
            }
        })
        return colDef;
    }

    $scope.gridOptions = {
        angularCompileRows: true,
        columnDefs: null,
        rowData: null,
        enableSorting: true,
        sortingOrder:['asc','desc'],
        enableColResize: true,
        suppressAggFuncInHeader: true,
        suppressMovableColumns: true,
        suppressContextMenu: true,
        rowSelection: 'multiple',
        groupSelectsChildren: true,
        pagination: true,
        paginationPageSize: 10,
        suppressRowClickSelection: true,
        onSelectionChanged: onSelectionChanged,
        rowHeight:50,
        animateRows: true,
        rowClassRules: {
            'highlight-parent': function (params) {
                if (params.node.aggData) {
                    return true;
                }
            }
        },
        getNodeChildDetails: function (rowItem) {
            if (rowItem.participants) {
                return {
                    group: true,
                    expanded: rowItem.expand,
                    children: rowItem.participants,
                    key: rowItem.group,
                    checkbox: true
                };
            } else {
                return null;
            }
        },
        onGridReady: function (params) {
            //timeout added to load the HTML
            $timeout(function () {
                getSecurityRefreshGridHeight();
            }, 1000);


            //Removing Checkboxes at Sales Level
            $scope.removeCheckboxesAtSalesLevel();
            //$scope.APIError = true;
        },
        onRowGroupOpened: function (params) {
            var filters = {};
            filters = $scope.CiscoUtilities.cleansedFilters($scope.appliedFilters);
            filters.nodeName = [];
            filters.nodeName.push(params.data.group);
            //set expand and collapse for selected node
            $scope.expandCollapseNode(params);
            //clicking on sales Level
            if (params.node.expanded && !params.data.customersLoaded) {
                $rootScope.$broadcast('CISCO-REQ-START');
                securityRefreshServ.getCustomers(filters).then(function (res) {
                    //format customers rows for SAV ID
                    var customersDataFormatted = angular.copy($scope.rowDataFromAPI);
                    var rowDataFormatted = $filter('filter')(customersDataFormatted, { group: params.data.group })[0];
                    rowDataFormatted.participants = angular.copy(res.participants);
                   
                    rowDataFormatted.customersLoaded = true;
                    $scope.formatCustomerRows(customersDataFormatted);
                    $scope.getSelectedRows();
                    $scope.gridOptions.api.setRowData(customersDataFormatted);
                    $scope.setSelectedRows();
                    $scope.dataToSetAfterExport = angular.copy(customersDataFormatted);
                    $scope.removeCheckboxesAtSalesLevel();
                    $rootScope.$broadcast('CISCO-REQ-END');
                    
                    //for Export
                    var rowData = $filter('filter')($scope.rowDataFromAPI, { group: params.data.group })[0];
                    rowData.participants = res.participants;
                    rowData.customersLoaded = true;
                });
            }
            //Loading more customers
            if (params.data.addCustomers) {
                $http.get('data/campaigns/sr_customers_more.json')
                    .then(function (res) {
                        var rowData = $filter('filter')($scope.rowDataFromAPI, { group: params.data.salesLevel })[0];
                        rowData.participants.pop();
                        rowData.participants = rowData.participants.concat(res.data.participants);
                        rowData.expand = true;
                        rowData.customersLoaded = true;
                        $scope.gridOptions.api.setRowData($scope.rowDataFromAPI);
                    });
            }
        },
        overlayLoadingTemplate: '<div class="loaderBg" ng-show="loader"></div><div ng-show="loader" class="sham-spinner-container"></div>',
        overlayNoRowsTemplate: '<div class="col-sm-12">\n' +
        '                    <div class="page-level-msg error">\n' +
        '                        <div class="error-ico">\n' +
        '                            <img class="nodata" src="images/nodata.svg" alt="" /></div>\n' +
        '                        <span class="error-msg">No Data Available!</span>\n' +
        '                        <span class="grey-text">Currently, there is no data available for your selection.</span>\n' +
        '                        <span>You may want to review your filters.</span>\n' +
        '                        </div>\n' +
        '                </div>',
        onPaginationChanged: function (params) {
            //Removing Checkboxes at Sales Level
            $scope.removeCheckboxesAtSalesLevel();
        },
        onBodyScroll: function(){
            $scope.removeCheckboxesAtSalesLevel();
        }
    };

    $scope.expandCollapseNode = function (params) {
        var data = $scope.rowDataFromAPI;
        var selectedNode = $filter('filter')(data, {group: params.data.group})[0];
        selectedNode.expand = params.node.expanded;
    }
    $scope.formatCustomerRows = function (data) {
        angular.forEach(data, function (value, key) {
            if (value.participants.length >= 1) {
                angular.forEach(value.participants, function (c) {
                    if (c.savID) {
                        c.group = c.group + '</br><span class="ag-grid sav-id">' + c.savID + '</span>';
                    }
                })
            }

        })
        return data;
    }

    $scope.onPageSizeChanged = function (newPageSize) {
        var value = document.getElementById('page-size').value;
        $scope.gridOptions.api.paginationSetPageSize(Number(value));
        $scope.removeCheckboxesAtSalesLevel();
    };

    function onSelectionChanged(event) {
        $scope.checkboxCount = event.api.getSelectedNodes().length;
        var data = event.api.getSelectedNodes();
        if (data.length) {
            $scope.lineCountSelected = 0;
            $scope.listamountselected = 0;
            angular.forEach(data, function (value) {
                $scope.lineCountSelected += value.data.line_count;
                //$scope.listamountselected += value.data.list_amount;
            })
        } else {
            $scope.lineCountSelected = 0;
            $scope.listamountselected = 0;
        }
        $scope.$apply();
    }

    $scope.onBtExport = function () {
        //getting selected rows
        $scope.selectedRows = $scope.gridOptions.api.getSelectedRows();
        //getting expanded rows
        $scope.getExpandedRows(); 
        $scope.deformatData();
        var params = {
            columnGroups: true,
            fileName: "Security_Refresh"
        }
        $scope.gridOptions.api.exportDataAsCsv(params);        
        if (!$scope.dataToSetAfterExport) {
            var data = angular.copy($scope.rowDataFromAPI);
        } else {
            var data = angular.copy($scope.dataToSetAfterExport);
        }
        $scope.setExpandedRows(data);
        $scope.gridOptions.api.setRowData(data);
        $scope.setSelectedRows();
        $scope.removeCheckboxesAtSalesLevel();
    }

    $scope.getExpandedRows = function () {
        $scope.expandedRows = [];
        $scope.gridOptions.api.forEachNode(function(node){
            if(node.expanded){
                $scope.expandedRows.push(node.data);
            }
        })
    }

    $scope.setExpandedRows = function (data) {
        angular.forEach(data, function (sales) {
            if ($scope.expandedRows.length > 0) {
                angular.forEach($scope.expandedRows, function (row) {
                    if (row.group === sales.group) {
                        sales.expand = true;
                    }
                });
            }
        });
    }

    $scope.getSelectedRows = function () {
        $scope.selectedRows = $scope.gridOptions.api.getSelectedRows();
    }
    $scope.setSelectedRows = function () {
        $scope.gridOptions.api.forEachLeafNode(function (node) {
            angular.forEach($scope.selectedRows, function (row) {
                if(row.group && row.group === node.data.group&& row.savID === node.data.savID){
                    node.setSelected(true);
                }
            });
        })
    }
    $scope.deformatData = function () {
        var data = angular.copy($scope.rowDataFromAPI);
        angular.forEach(data, function (value) {
            value.group = '-->' + value.group;
            if (value.participants.length > 1) {
                angular.forEach(value.participants, function (p) {
                    if (p.savID) {
                        p.group = p.group + ' - ' + p.savID;
                    }
                })
            }
        })
        $scope.gridOptions.api.setRowData(data);
    }

    $scope.sliderTextColor = function (key, value, d) {
        //if (value === 0) {
            //return "blackTxt sliderValue";
        //}

        //getting next pipeline index
        var totalPipelineValue = 0;
        for (var i = 0; i < Object.keys(d.dataset).length; i++) {
            if (Object.keys(d.dataset)[i].indexOf("PIPELINE") > -1) {
                var pipelineIndex = i;
                break;
            }else {
                totalPipelineValue += Object.values(d.dataset)[i];
            }
        }
        //check if pipeline value is present
        if (Object.values(d.dataset)[pipelineIndex] === 0) {
            return "redTxt sliderValue";
        }else if(Object.values(d.dataset)[pipelineIndex] < totalPipelineValue){
            return "orangeTxt sliderValue"
        }else {
            return "greenTxt sliderValue";
        }
    }

    $scope.removeCheckboxesAtSalesLevel = function () {
        //Removing Checkboxes at Sales Level
        $('.ag-row-level-0').find('.ag-group-checkbox').addClass('hide');
    }
      //On widow resize adjust grid height
      $(window).resize(function () {
      getSecurityRefreshGridHeight();
      });

    $scope.openSecurityDefinition = function () {
        $uibModal.open({
            templateUrl: 'views/modal/security-refresh-definition.html',
            controller: 'DefinitionController',
            size: 'lg'
        });
    };

    $scope.getadvancedFilterObject = function(){
        var filterObj = {};
        if($scope.appliedFilters){
            angular.forEach($scope.appliedFilters, function(value) {
                switch(value.categoryId){
                    case "sales":
                        if(value.level === 4 || value.level === 5){
                            filterObj["sales"] = [];
                            filterObj.sales.push.apply(filterObj.sales, value.title)
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
                        } else{
                            //do nothing
                        }
                    break;
                    case "account":
                        if(value.levelName === "SAV Account"){
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
                        } else {
                            //do nothing
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
                        } else if(value.title === "Shipment Date"){
                            filterObj["ship"] = {
                                "to":value.to,
                                "from":value.from,
                                "period":value.period,
                                "direction":value.direction
                            };
                        } else if(value.title === "Covered Line End Date") {
                            filterObj["cled"] = {
                                "to":value.to,
                                "from":value.from,
                                "period":value.period
                            };
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
        return filterObj;
    };

    $scope.openRequestReport = function(reportType) {
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
            activeReportTab = "securityRefresh";
            var nodeName = $scope.gridOptions.api.getSelectedRows();
            var savId = [];

            if (reportType === "Request Customer Detail Report" ) {
                index = 1;
            } else if(reportType === "Create Collab Presentation and Proposal"){
                index = 2;
            } else {
                index = 0;
            }

            if (reportType === "Request Customer Detail Report"  || reportType === "Request Smart IB Report") {
                var multipleState = [];
                var multipleStateId = [];
                for(var a=0; a<nodeName.length; a++){
                    multipleState.push(nodeName[a].group.slice(0,nodeName[a].group.indexOf("</br>")));
                    multipleStateId.push(nodeName[a].savID);
                }
                nodeName = multipleState; // Change for DE163261
                savId = multipleStateId;
            }else{
                nodeName = nodeName.group.slice(0,nodeName.group.indexOf("</br>")); // Change for DE163261
                savId = nodeName.savID
            }
            var filterObj = $scope.getadvancedFilterObject();
            securityRefreshServ.getSmartIbReport(nodeName, index, activeReportTab, $scope.lineCountSelected, $scope.listamountselected, filterObj, savId).then(function() {
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
}]);