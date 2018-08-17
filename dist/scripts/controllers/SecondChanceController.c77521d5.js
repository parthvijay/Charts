'use strict';
angular.module('ciscoExecDashApp').controller('SecondChanceController', ['$scope', '$rootScope', '$http', 'RestUri', '$sessionStorage', 'FiltersServ', '$filter', '$timeout', '$uibModal', 'CiscoUtilities', 'secondChanceServ', 'RangeLimit', 'UserServ',function ($scope, $rootScope, $http, restUri, $sessionStorage, filtersServ, $filter, $timeout, $uibModal, CiscoUtilities, secondChanceServ,RangeLimit, UserServ) {

    $rootScope.analysis = 'campaign';
    $rootScope.$emit('user-info-updated', UserServ.data);
    $rootScope.dashboard = 'secondChanceController';
    // reset filters and remove any existing active bookmark
    // filtersServ.resetAllFilters();
    filtersServ.showInsightFilters('secondChance');
    $scope.currentBookmark = null;
    $scope.newBookmarkSaved = false;
    $scope.lineCountSelected = 0;
    $scope.dropdownsize = '50';
    $scope.paginationValues = ['50', '100', '150', '200', '250'];
    $scope.checkboxCount = 0;
    $scope.APIError = false;
    // $scope.dataObj = ["tsAttach", "tsRenew", "swssAttach", "swssRenew"];

    // $scope.overlayNoRowsTemplate = "<div class='noData-error'><img src='images/no-data-icon.svg' /><p class='black-text'>No data available</p></div>";

    $scope.oppRangeAppliedData = '';
    $scope.selectedNodes = [];
    $scope.isGlobal = false;

    $scope.owlCarouselOptions = {loop:true, items: 3, slideSpeed: 3000,navigation: true, scrollPerPage: true};
        //reload carousel on global filters open and close
    $scope.$watch('$scope.sidebarActive', function (newValue, oldValue) {
        if (newValue !== oldValue) {
            $timeout(function () {
                $('.owl-carousel').data('owlCarousel').reinit($scope.owlCarouselOptions);
            }, 500);
        }
    }, true);

    
    var sideToggleRoot = $rootScope.$on('sidebar-toggle', function (event, data) {
         $scope.sidebarActiveToggle(data);
    });

    $scope.sidebarActiveToggle = function(b) {
        $scope.sidebarAnimated = false;
        $scope.sidebarActive = b;
        if (window.innerWidth >= 1200 || true) {
            $timeout(function() {
                $scope.sidebarAnimated = true;
            }, 510);
        }
    };

    $scope.columnsData = [
        {
            "headerName": "Opportunity View",
            "headerClass": "alignCenterSalesLevel",
            "width": 350,
            "height": 100,
            "pinned": "left",
            "cellRenderer": "agGroupCellRenderer",
            "field": "group",
            "cellRendererParams": {
              "suppressCount": true,
              "checkbox": true
            }
          },
          {
            "headerName": "Total Opportunity",
            "headerClass": "alignCenter alignCenterTotalNetBook",
            "width": 250,
            "pinned": "left",
            "field": "totalOpportunity",
            "type": "numericColumn",
            "sort": "desc"
          },
          {
            "headerName": "TS Renew",
            "headerClass": "alignCenter alignCenterTotalNetBook",
            "width": 225,
            "field": "tsRenew",
            "type": "numericColumn"
          },
          {
            "headerName": "TS Attach",
            "headerClass": "alignCenter alignCenterTotalNetBook",
            "width": 225,
            "field": "tsAttach",
            "type": "numericColumn"
          },
          {
            "headerName": "SWSS Attach",
            "headerClass": "alignCenter alignCenterTotalNetBook",
            "width": 225,
            "field": "swssAttach",
            "type": "numericColumn"
          },
          {
            "headerName": "SWSS Renew",
            "headerClass": "alignCenter alignCenterTotalNetBook",
            "width": 225,
            "field": "swssRenew",
            "type": "numericColumn"
          }
    ]

    $scope.range = {
        'lowerLimitTsAttach': 0,
        'upperLimitTsAttach': 500,
        'lowerLimitSwssAttach': 0,
        'upperLimitSwssAttach': 500,
        'lowerLimitTsRenew': 0,
        'upperLimitTsRenew': 500,
        'lowerLimitSwssRenew': 0,
        'upperLimitSwssRenew': 500
    }

    // reload data on applying any filters
    $scope.getData = function () {
        var filtersToBeApplied = {};
        filtersToBeApplied = $scope.CiscoUtilities.cleansedFilters($scope.appliedFilters);
        filtersToBeApplied.isGbl = 'N';
        filtersToBeApplied.isGbl = $scope.isGlobal ? 'Y' : 'N';
        secondChanceServ.getData(filtersToBeApplied, 'second-chance-sales', $scope.range).then(function (res) {
                $scope.header = angular.copy(res.header);
                $scope.slides = angular.copy(res.slides);
                $scope.gridOptions.api.setColumnDefs($scope.formatColumnData($scope.columnsData));
                $scope.gridOptions.api.setColumnDefs($scope.formatColumnData($scope.columnsData));
                $scope.rowDataFromAPI = angular.copy(res.rowData);
                $scope.gridOptions.api.setRowData(res.rowData);
                $scope.gridOptions.minRowsToShow = res.rowData.length;
                // remove checkboxes at Sales Level
                $scope.removeCheckboxesAtSalesLevel();

                // reset the linecount
                $scope.lineCountSelected = 0;
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

    $scope.formatColumnData = function (colDef) {
        angular.forEach(colDef, function (v, k) {
            if (v.field !== "group") {
                var key = "valueFormatter";
                var value = function valFormatter(params) {
                    return $filter('formatGridValue')(params.value, false, false, true, true);
                };
                v[key] = value;
            }
            if (v.children) {
                angular.forEach(v.children, function (child) {
                    if (child.children) {
                        angular.forEach(child.children, function (subChild) {
                            var key = "valueFormatter";
                            var value = function valFormatter(params) {
                                return $filter('formatGridValue')(params.value, false, false, true, true);
                            };
                            subChild[key] = value;
                        })
                        angular.forEach(child.children, function (subChild) {
                            var key2 = "cellClassRules";
                            var value2 = {
                                'orangeTxt': function checkOpp(params) {
                                    if (params.data.salesLevel) {
                                        var indexOfValue = Object.values(params.data).indexOf(params.value);
                                        if (indexOfValue > -1) {
                                            var keys = Object.keys(params.data)[indexOfValue].split("_");
                                            var parentLevel = keys[0] + "_" + keys[1];
                                            var totalOpportunityValue = 0;
                                            for (var i = 0; i < Object.keys(params.data).length; i++) {
                                                if (Object.keys(params.data)[i].indexOf(parentLevel) > -1) {
                                                    // getting index to get value to compare with opp value
                                                    if (Object.keys(params.data)[i].indexOf("pipeline") > -1) {
                                                        var pipelineIndex = i;
                                                        break;
                                                    } else {
                                                        // get total opportunity value
                                                        totalOpportunityValue += Object.values(params.data)[i];
                                                    }
                                                }
                                            }
                                            // check if value is present
                                            if (Object.values(params.data)[pipelineIndex] > 0 && Object.values(params.data)[pipelineIndex] < totalOpportunityValue) {
                                                return true;
                                            }
                                        }
                                    }
                                },
                                'redTxt': function checkOpp(params) {
                                    if (params.data.salesLevel) {
                                        var indexOfValue = Object.values(params.data).indexOf(params.value);
                                        if (indexOfValue > -1) {
                                            var checkIfOpp = Object.keys(params.data)[indexOfValue].indexOf("opportunity") > -1;
                                            if (checkIfOpp) {
                                                // getting next index
                                                for (var i = indexOfValue; i < Object.keys(params.data).length; i++) {
                                                    if (Object.keys(params.data)[i].indexOf("pipeline") > -1) {
                                                        var pipelineIndex = i;
                                                        break;
                                                    }
                                                }
                                                // check if value is present
                                                if (Object.values(params.data)[pipelineIndex] === 0) {
                                                    return true;
                                                }
                                            }
                                        }
                                    }
                                },
                                'greenTxt': function checkOpp(params) {
                                    if (params.data.salesLevel) {
                                        return true;
                                    }
                                }
                            }
                            subChild[key2] = value2;
                        })
                    } else {
                        var key = "valueFormatter";
                        var value = function valFormatter(params) {
                            return $filter('formatGridValue')(params.value, false, false, true, true);
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
        sortingOrder: ['asc', 'desc'],
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
        onRowSelected: onRowSelected,
        rowHeight: 50,
        headerHeight: 75,
        animateRows: true,
        overlayNoRowsTemplate: $scope.overlayNoRowsTemplate,
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
            } else if (rowItem.subParticipants) {
                return {
                    group: true,
                    expanded: rowItem.expand,
                    children: rowItem.subParticipants,
                    key: rowItem.group,
                    checkbox: true
                };
            } else {
                return null;
            }
        },
        onGridReady: function (params) {
            // timeout added to load the HTML
            $timeout(function () {
                getSecondChanceGridHeight();
                $scope.mobWidth = (window.screen.width);
                if ($scope.mobWidth > 1600) {
                    params.api.sizeColumnsToFit();
                }
            }, 500);

            // Remove checkboxes at Sales Level
            $scope.removeCheckboxesAtSalesLevel();

            $scope.formatCustomerRows($scope.rowDataFromAPI);
        },

        onRowGroupOpened: function (params) {
            if (!params.node.expanded) {
                return;
            }
            /* Code for auto collapse of other expanded rows */
            var group = params.node.level === 0 ? params.data.group : params.node.parent.data.group;


            if ($scope.oppRangeAppliedData !== '') { // maintain applied range data after expand/collapse
                $scope.rowDataFromAPI = $scope.oppRangeAppliedData;
            }
            var customersDataFormatted = $scope.rowDataFromAPI;
            var rowDataFormatted = $filter('filter')(customersDataFormatted, { group: group });
            rowDataFormatted = rowDataFormatted[0];
            $scope.gridOptions.api.forEachNode((node) =>{
                if(params.node.data.group === node.data.group || node.level !== params.node.level) {
                    return;
                }
                if (node.group) {
                    node.setExpanded(false);
                }
            });
            if (params.node.level === 0) {
                customersDataFormatted.forEach(function (r) {
                    r.expand = false;
                });
                rowDataFormatted.expand = true;
            } else if (params.node.level === 1) {
                rowDataFormatted.participants.forEach(function (r) {
                    r.expand = false;
                });
                var subRowDataFormatted = $filter('filter')(rowDataFormatted.participants, { group: params.data.group });
                subRowDataFormatted = subRowDataFormatted[0];
                subRowDataFormatted.expand = true;

            }
            /* Code for auto collapse of other expanded rows */

            if (!params.data.customersLoaded) {
                $rootScope.$broadcast('CISCO-REQ-START');
                var file = params.node.level === 0 ? 'second-chance-customer' : 'second-chance-partner';
                var filters = {};
                filters = $scope.CiscoUtilities.cleansedFilters($scope.appliedFilters);
                filters.isGbl = 'N';
                filters.isGbl = $scope.isGlobal ? 'Y' : 'N';
                if (params.node.level === 0) {
                    filters.nodeName = [];
                    filters.nodeName.push(params.data.group);
                    secondChanceServ.sales = params.data.group;
                    secondChanceServ.getCustomers(filters, file, $scope.range).then(function (res) {
                        if (params.node.level === 0) {
                            rowDataFormatted.participants = res.participants;
                            rowDataFormatted.customersLoaded = true;
                        }
                        $scope.gridOptions.api.setRowData(customersDataFormatted); // display data on 1st level
                        $rootScope.$broadcast('CISCO-REQ-END');
                        $scope.gridOptions.api.forEachNode(function (node) {
                            for (let i = 0; i < $scope.selectedNodes.length; i++) {
                                if (node.key === $scope.selectedNodes[i].key && node.parent.key === $scope.selectedNodes[i].parent.key) {
                                    node.setSelected(true);
                                }
                            }
                        });
                    });
                } else {
                    secondChanceServ.expandCustomer = params.data;
                    secondChanceServ.getPartners(filters, file, $scope.range).then(function (res) {
                        subRowDataFormatted.subParticipants = res.subParticipants;
                        subRowDataFormatted.customersLoaded = true;
                        $scope.gridOptions.api.setRowData(customersDataFormatted); // display data on 1st level
                        $rootScope.$broadcast('CISCO-REQ-END');
                        $scope.gridOptions.api.forEachNode(function (node) {
                            for (let i = 0; i < $scope.selectedNodes.length; i++) {
                                if (node.key === $scope.selectedNodes[i].key && node.parent.key === $scope.selectedNodes[i].parent.key) {
                                    node.setSelected(true);
                                } else {
                                    node.setSelected(false);
                                }
                            }
                        });
                    })
                }
                
            } else {
                // $scope.gridOptions.api.updateRowData();
                // $scope.gridOptions.api.setRowData(customersDataFormatted);
            }

            // load more customers
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
        onPaginationChanged: function (params) {
            // remove checkboxes at Sales Level
            $scope.removeCheckboxesAtSalesLevel();
        },
        onBodyScroll: function () {
            // remove checkboxes at Sales Level
            $scope.removeCheckboxesAtSalesLevel();
        }
    };

    $scope.formatCustomerRows = function (data) {
        angular.forEach(data, function (value, key) {
            if (value.participants.length > 1) {
                angular.forEach(value.participants, function (c) {
                    if (c.savID) {
                        // c.group = c.group + '</br><span class="ag-grid sav-id">' + c.savID + '</span>';
                        c.group = c.group;
                    }
                })


            }
        })
        return data;
    }

    // $scope.expandFirstLevel = function () {
    //     // console.log('expand');
    // };

    $scope.onPageSizeChanged = function (newPageSize) {
        var value = document.getElementById('page-size').value;
        $scope.gridOptions.api.paginationSetPageSize(Number(value));
        $scope.removeCheckboxesAtSalesLevel();
    };

    function onRowSelected(event) {
        if (event.node.level == 1 && event.node.selected) {
            $scope.selectedNodes.push(event.node);
        } else if (event.node.level == 1 && !event.node.selected) {
            var index = $scope.selectedNodes.indexOf(event.node);
            if (index > -1) $scope.selectedNodes.splice(index, 1);
        }
    }

    function onSelectionChanged(event) {
        // $scope.checkboxCount = event.api.getSelectedNodes().length;
        var data = event.api.getSelectedNodes();
        if (data.length) {
            $scope.lineCountSelected = 0;
            $scope.checkboxCount = 1;
            var customerData = '';
            var parentCustomer = '';
            angular.forEach(data, function (value) {
                if (parentCustomer) {
                    if (parentCustomer !== value.parent.parent.data.group) {
                        $scope.checkboxCount = $scope.checkboxCount + 1;
                    } else {
                        if (customerData === value.parent.data.group) {
                            $scope.checkboxCount = $scope.checkboxCount;
                        } else {
                            $scope.checkboxCount = $scope.checkboxCount + 1;
                        }
                    }
                }
                $scope.savID = value.parent.data.savID;
                customerData = value.parent.data.group;
                parentCustomer = value.parent.parent.data.group;
            })
            $scope.lineCountSelected = data[0]['parent']['data']['line_count'];
        } else {
            $scope.lineCountSelected = 0;
            $scope.checkboxCount = 0;
        }
        $scope.$apply();
    }

    $scope.onBtExport = function () {
        // get selected rows
        $scope.getSelectedRows();
        // get expanded rows
        $scope.getExpandedRows();
        $scope.deformatData();
        var params = {
            columnGroups: true,
            fileName: "Second_Chance"
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
        $scope.gridOptions.api.forEachNode(function (node) {
            if (node.expanded) {
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
        })
    }

    $scope.getSelectedRows = function () {
        $scope.selectedRows = $scope.gridOptions.api.getSelectedRows();
    }

    $scope.setSelectedRows = function () {
        $scope.gridOptions.api.forEachLeafNode(function (node) {
            angular.forEach($scope.selectedRows, function (row) {
                if (row.group && row.group === node.data.group && row.savID === node.data.savID) {
                    node.setSelected(true);
                }
            });
        })
    }

    $scope.openSecondChanceDefinition = function () {
        $uibModal.open({
            templateUrl: 'views/modal/second-chance-definition.html',
            controller: 'DefinitionController',
            size: 'lg'
        });
    };

    $scope.toggleSavGlobalView = function() {
        $scope.isGlobal = !$scope.isGlobal;
        $scope.selectedNodes = [];
        $scope.getData();
    }

    $scope.deformatData = function () {
        var data = angular.copy($scope.rowDataFromAPI);
        angular.forEach(data, function (value) {
            value.group = value.group;
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

    // open Opportunity Range modal
    $scope.openOpportunityRangeSlider = function () {
        var modalInstance = $uibModal.open({
            templateUrl: 'views/modal/opportunity-range.html',
            windowClass: 'modal-open',
            controller: 'OpportunityRangeController',
            scope: $scope,
            size: 'sm'
        });
        modalInstance.result.then(function (result) {
            // get selected lowest and highest values of all sliders
            RangeLimit.setResult(result);
            $scope.range.lowerLimitTsAttach = result.lowestValue[0];
            $scope.range.upperLimitTsAttach = result.highestValue[0];
            $scope.range.lowerLimitTsRenew = result.lowestValue[1];
            $scope.range.upperLimitTsRenew = result.highestValue[1];
            $scope.range.lowerLimitSwssAttach = result.lowestValue[2];
            $scope.range.upperLimitSwssAttach = result.highestValue[2];
            $scope.range.lowerLimitSwssRenew = result.lowestValue[3];
            $scope.range.upperLimitSwssRenew = result.highestValue[3];
            $scope.getData();
            // var data = angular.copy($scope.rowDataFromAPI);
            // var size = Object.keys(data[0]).length;
            // var rangeObjects = {
            //     "tsAttach": { "max": result['highestValue'][0] * 1000, "min": result["lowestValue"][0] * 1000 },
            //     "tsRenew": { "max": result['highestValue'][1] * 1000, "min": result["lowestValue"][1] * 1000 },
            //     "swssAttach": { "max": result['highestValue'][2] * 1000, "min": result["lowestValue"][2] * 1000 },
            //     "swssRenew": { "max": result['highestValue'][3] * 1000, "min": result["lowestValue"][3] * 1000 },
            // }
            // //  console.log(data);
            // for (var individualData of data) {
            //     for (var range in rangeObjects) {
            //         if (rangeObjects[range]["max"] < individualData[range] || rangeObjects[range]["min"] > individualData[range]) {
            //             individualData["totalOpportunity"] -= individualData[range];
            //             delete individualData[range];
            //             // console.log(individualData.participants);

            //             for (var customers of individualData.participants) {
            //                 customers["totalOpportunity"] -= customers[range];
            //                 delete customers[range];
            //                 var dataparticipants = individualData.participants;
            //                 if (dataparticipants !== undefined) {
            //                     for (let i = 0; i < dataparticipants.length; i++) {
            //                         var datapartners = dataparticipants[i].subParticipants;
            //                         if (datapartners !== undefined) {
            //                             for (var individualCustomers of dataparticipants) {
            //                                 for (var individualPartners of datapartners) {
            //                                     if (!individualCustomers[range]) {
            //                                         delete individualPartners[range];
            //                                     }
            //                                 }
            //                             }
            //                         }
            //                     }
            //                 }
            //             }

            //         }
            //     }
            // }
            // var data2 = [];
            // for (var individualData of data) {
            //     if ((Object.keys(individualData).length + Object.keys(rangeObjects).length) !== size) {
            //         data2.push(individualData)
            //     }
            // }
            // $scope.oppRangeAppliedData = data2;
            // $scope.gridOptions.api.forEachNode(function (node) {
            //     for (let i = 0; i < data2.length; i++) {
            //         if (node.key === data2[i].group) {
            //             if (node.expanded) {
            //                 data2[i].expand = true;
            //             } else {
            //                 data2[i].expand = false;
            //             }
            //         }
            //     }
            // })
            // $scope.gridOptions.api.setRowData(data2);
        }, function () {
            // error case
        });
    };

    $scope.removeCheckboxesAtSalesLevel = function () {
        // Remove checkboxes at Sales Level
        $('.ag-row-level-0').find('.ag-group-checkbox').addClass('hide');

        // Remove checkboxes at Partner Level
        $('.ag-row-level-2').find('.ag-group-checkbox').addClass('hide');
    }

    // on widow resize adjust grid height
    $(window).resize(function () {
        getSecondChanceGridHeight();
    });

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
                        }
                    break;
                    case "network":
                        filterObj["networkCollection"] = value.network;
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
        var activeReportTab = 'secondChance';
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
        var nodeName = $scope.selectedNodes;
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
            var multipleSalesLevel = [];
            for(var a=0; a<nodeName.length; a++){
                multipleState.push(nodeName[a].data.group);
                // multipleStateId.push(nodeName[a].savID);
                multipleSalesLevel.push(nodeName[a].data.salesLevel);
            }
            nodeName = multipleState; // Change for DE163261
            // savId = multipleStateId;
        }
        var filterObj = $scope.getadvancedFilterObject();
        filterObj.isGbl = 'N';
        filterObj.isGbl = $scope.isGlobal ? 'Y' : 'N';
        secondChanceServ.getSmartIbReport(nodeName, multipleSalesLevel, index, activeReportTab, $scope.lineCountSelected, $scope.selectedNodes[0].data, filterObj).then(function() {
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