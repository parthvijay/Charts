/*jshint sub:true*/
'use strict';
angular.module('ciscoExecDashApp').directive('barStackedChart', [
    '$timeout', '$filter', '$window', '$compile', 'isMobile', 'CiscoUtilities', '$rootScope',
    function ($timeout, $filter, $window, $compile, isMobile, ciscoUtilities, $rootScope) {
        return {
            restrict: 'E',
            scope: {
                data: '=',
                colors: '=',
                columns: '=',
                expanded: '=',
                active: '=',
                sidebar: '=',
                selectedWaterFallQuarter: '=?',
                keys: '=',
                filtered: '=',
                quarter: '=',
                area: '=',
                slug: '=',
                subslug: '=?',
                view: '=',
                subtab: '=',
                currentweek: '=',
                currentquarter: '=',
                currentmonth: '=',
                currentyear: '=',
                selection: '=',
                selectionTitle: '=',
                percent: '=',
                viewtype: '=',
                campactivedrill: '=',
                selectionenabled: '=',
                selectionenabledarea: '=',
                customorder: '=',
                productfamily: '=',
                filteredproductfamily: '=',
                quarterheadership: '=',
                pieactivedrill: '=',
                sfdcbookingsdata: '=',
                sfdcbookingsquarterdata: '=',
                previousdata: '=',
                id: '=',
                targetdata: '=',
                selectedsublegend: '=?',
                drssfdclistview: '=',
                quarters: '='
            },
            link: function (scope, ele, attrs) {
                var quarterId = [];

                var refreshPCData = function () {
                    scope.$emit('refresh-spc-data', {
                        'quarterId': JSON.stringify(quarterId),
                        'activeKey': scope.active
                    });
                };

                var refreshAgingPCData = function () {
                    scope.$emit('refresh-spc-data', {
                        'quarterId': JSON.stringify(quarterId),
                        'agingKey': scope.active
                    })
                };

                var refreshServicePCData = function () {

                    scope.$emit('refresh-service-spc-data', {
                        'quarterId': JSON.stringify(quarterId),
                        'activeKey': scope.active,
                        'week': scope.quarter,
                        'chartId': scope.id
                    })
                }


                var activeSpcKey = "sales";
                scope.$on('active-spc-key-selection', function (event, data) {
                    activeSpcKey = data;
                });

                scope.$on('performance-selection-changed', function () {
                    scope.active = [];
                    quarterId = [];
                    scope.quarter = [];
                });

                if ($rootScope.dashboard === "services") {
                    scope.slug = scope.slug + "_" + scope.subslug;
                }

                var d3 = $window.d3;
                var event = isMobile ? "touchstart" : "click";
                scope.transitionDuration = 500;
                var ele = $(ele[0]).closest('.tile');
                var svg = d3.select(ele[0])
                    .append('svg');
                var table = d3.select(ele[0])
                    .append('table');
                var show = scope.columns;
                show = show < scope.data.length ? show : scope.data.length;
                var start = 0;
                var start_max = 0;
                var data = [];
                start = ciscoUtilities.getStartingIndex(scope.data, scope.view, scope.slug, scope.selection || scope.selectionTitle, show);
                data = scope.data.slice(start, show + start);
                var colors_theme = $window.ciscoConfig.colorsPalette[$rootScope.dashboard];
                var colors;
                var windowWidth = $(window).width();

                scope.selectedsublegend = null;

                $window.addEventListener('resize', function (event) {
                    $timeout(function () {
                        if ($(window).width() !== windowWidth) {
                            windowWidth = $(window).width();
                            scope.render(scope.data);
                        }
                    });
                });

                var groupWatch = scope.$watchGroup(['data', 'columns', 'expanded', 'productfamily', 'sidebar', 'area', 'viewtype', 'campactivedrill', 'sldData','productfamily'], function (newVals, oldVals) {

                    if (!scope.data) {
                        return;
                    }
                    //start = 0;
                    //start_max = 0;
                    if (scope.sidebar) {
                        $timeout(function () {
                            show = scope.columns;
                            show = show < scope.data.length ? show : scope.data.length;
                            start = 0;
                            start_max = scope.data.length - show;
                            data = [];
                            start = ciscoUtilities.getStartingIndex(scope.data, scope.view, scope.slug, scope.selection || scope.selectionTitle, show);
                            //added code for defect number DE133752, this piece of code helps the chart to show last week on initial load.
                            // if(scope.slug === "tsRenew_overview" && scope.selectionTitle === "QTD Weekly Renewal Bookings"){
                            //     start = scope.data.length-show;
                            // }
                            data = scope.data.slice(start, show + start);
                            scope.render(scope.data);
                        });
                    }
                }, true);

                var colorsWatch = scope.$watch('colors', function (newVals, oldVals) {
                    if (!scope.data) {
                        return;
                    }
                    if (scope.sidebar) {
                        $timeout(function () {
                            scope.render(scope.data);
                        });
                    }
                }, true);

                var areaWatch = scope.$watch('area', function (newVals, oldVals) {
                    if (!scope.data) {
                        return;
                    }
                    if (scope.sidebar) {
                        $timeout(function () {
                            show = scope.columns;
                            show = show < scope.data.length ? show : scope.data.length;
                            start = 0;
                            start_max = scope.data.length - show;
                            data = [];
                            start = ciscoUtilities.getStartingIndex(scope.data, scope.view, scope.slug, scope.selection || scope.selectionTitle, show);
                            data = scope.data.slice(start, show + start);
                            scope.render(scope.data);
                        });
                    }
                }, true);

                var subLegendWatch = scope.$watch('selectedsublegend', function (newVals, oldVals) {
                    $timeout(function () {
                        scope.render(scope.data);
                    });
                }, true);

                scope.$on('$destroy', function () {
                    groupWatch();
                    colorsWatch();
                    areaWatch();
                    subLegendWatch();
                });
                function segColor(c) {
                    var constant = $window.ciscoConfig.colorsPalette[$rootScope.dashboard]['constant'][c];
                    if (typeof constant !== 'undefined') {
                        return constant;
                    };
                    if (scope.colors === undefined) {
                        scope.colors = {};
                    };
                    var size = Object.keys(scope.colors).length;
                    if (!size || !scope.colors[c]) {
                        size = Object.keys(scope.colorsOpp).length;
                        if (!scope.colorsOpp[c]) {
                            scope.colorsOpp[c] = colors[size];
                        }
                        return scope.colorsOpp[c];
                    }
                    return scope.colors[c];
                }


                scope.render = function (data2) {
                    var sfdcDeals = {};
                    var shipquarters = {};
                    var sfdcDealsExpandedView = {};
                    var refreshQuarters = {};

                    scope.filteredproductfamily = scope.productfamily;
                    if (scope.viewtype === 'list' && scope.slug === 'drs') {
                        angular.forEach(scope.productfamily["shipTimelinePf"], function (key, value) {
                            angular.forEach(key.quarters, function (val, key) {
                                shipquarters[key] = 0;
                            })
                        })
                        scope.quarterheadership = shipquarters;
                    }

                    if (scope.viewtype === 'list' && scope.slug === 'refresh' && angular.isDefined(scope.productfamily)) {
                        angular.forEach(scope.productfamily[0]['quarters'], function (key, value) {
                            refreshQuarters[value] = 0;
                        })
                        scope.quarters = refreshQuarters;
                    }

                    if ((scope.viewtype === 'list' && scope.slug === 'drs' && scope.selection === 'SFDC Booked Deals' && scope.drssfdclistview === true && scope.sfdcbookingsdata !== undefined) || (scope.viewtype === 'list' && scope.slug === 'drs' && scope.selection === 'SFDC Booked Deals' && scope.drssfdclistview === false)) {
                        //changes made for DE137702. First time drop down is selected sfdcbookingsdata is undefined and when drill down to another sub arch that time sfdcbookingsdata is defined. -Vijayeta
                        if (scope.productfamily['sfdcBookings'].length > 0) {
                            var sfdcKeys = Object.keys(scope.productfamily['sfdcBookings'][0].areas[0].freq);
                            angular.forEach(scope.productfamily['sfdcBookings'], function (areas) {
                                angular.forEach(areas.areas, function (units) {
                                    //if($rootScope.isClick == undefined){
                                    if (sfdcDeals.hasOwnProperty(units.state)) {
                                        sfdcDeals[units.state]['SFDC Pipeline'] += units.freq[units.state]['SFDC Pipeline'];
                                    } else {
                                        //sfdcDeals[units.state] = units.freq[units.state]['SFDC Pipeline'];
                                        sfdcDeals[units.state] = angular.copy(units.freq[units.state]);
                                    }
                                    //}


                                    for (var subunits in units.freq[units.state]['areas_drill']) {
                                        if (sfdcDeals[units.state]['areas_drill'].hasOwnProperty(subunits)) {
                                            sfdcDeals[units.state]['areas_drill'][subunits]['SFDC Pipeline'] += units.freq[units.state]['areas_drill'][subunits]['SFDC Pipeline'];
                                        } else {
                                            sfdcDeals[units.state]['areas_drill'][subunits]['SFDC Pipeline'] = angular.copy(units.freq[units.state]['areas_drill'][subunits]['SFDC Pipeline']);
                                        }
                                    }

                                })
                            })
                            $rootScope.isClick = true;
                            scope.sfdcbookingsdata = sfdcDeals;
                            angular.forEach(scope.productfamily['sfdcBookings'], function (quarter) {
                                var currQuarter = quarter.quarter;
                                angular.forEach(quarter.areas, function (area) {
                                    if (sfdcDealsExpandedView.hasOwnProperty(area.state)) {
                                        sfdcDealsExpandedView[area.state][currQuarter] = angular.copy(area.freq[area.state]['SFDC Pipeline']);
                                        sfdcDealsExpandedView[area.state]['SFDC Pipeline'] +=area.freq[area.state]['SFDC Pipeline'];
                                    } else {
                                        sfdcDealsExpandedView[area.state] = angular.copy(area.freq[area.state]);
                                        sfdcDealsExpandedView[area.state][currQuarter] = angular.copy(area.freq[area.state]['SFDC Pipeline']);

                                    }

                                    for (var subunits in area.freq[area.state]['areas_drill']) {
                                        if (sfdcDealsExpandedView[area.state]['areas_drill'].hasOwnProperty(subunits)) {
                                            sfdcDealsExpandedView[area.state]['areas_drill'][subunits][currQuarter] = angular.copy(area.freq[area.state]['areas_drill'][subunits]['SFDC Pipeline']);
                                            sfdcDealsExpandedView[area.state]['areas_drill'][subunits]['SFDC Pipeline'] +=area.freq[area.state]['areas_drill'][subunits]['SFDC Pipeline'];
                                        } else {
                                            sfdcDealsExpandedView[area.state]['areas_drill'][subunits][currQuarter] =angular.copy(area.freq[area.state]['areas_drill'][subunits]);
                                            sfdcDealsExpandedView[area.state]['areas_drill'][subunits][currQuarter] = angular.copy(area.freq[area.state]['areas_drill'][subunits]['SFDC Pipeline']);
                                        }
                                    }
                                })
                            })
                            scope.sfdcbookingsquarterdata = sfdcDealsExpandedView;
                        } else {
                            scope.sfdcbookingsquarterdata = {};
                            scope.sfdcbookingsdata = {};
                        }
                    }

                    svg.selectAll('*').remove();
                    table.selectAll('*').remove();
                    scope.colorsOpp = {};
                    var data = angular.copy(data2);

                    if (!data || !data.length) {
                        scope.filtered = [];
                        matchTilesHeight(50);
                        return;
                    }

                    function click(d) {
                        if (!scope.selectionenabled) {
                            return;
                        }
                        if (scope.slug === 'drs' && scope.pieactivedrill) {
                            return;
                        }
                        var type = d.key ? d.key : d;

                        if (type === 'Previous Year') {
                            return;
                        }
                        if (!scope.selectionenabled) {
                            return;
                        }
                        if ((scope.pieactivedrill === undefined || scope.pieactivedrill === false) && scope.slug === 'drs') {
                            scope.pieactivedrill = type;
                            scope.$apply();
                            return;
                        }
                        if (scope.active.indexOf(type) > -1) {
                            if (d3.event.ctrlKey || d3.event.metaKey) {
                                scope.active.splice(scope.active.indexOf(type), 1);
                            } else {
                                //don't comment out the below condition it will break the chart interaction -- srinath
                                if (scope.active.length === 1 || (scope.slug === 'ciscoOne' && scope.active.length > 1)) {
                                    scope.active = [];
                                } else {
                                    scope.active = [];
                                    scope.active.push(type);
                                }
                            }
                        } else {
                            if (!d3.event.ctrlKey && !d3.event.metaKey) {
                                scope.active = [];
                            }
                           //disable multi-select for October release
                            if(((scope.subslug + scope.slug) === "tsrenew") && $rootScope.dashboard === "sales" || scope.slug === "subscription"){
                                  //do nothing
                            }else{
                                scope.active = [];
                            }
                            scope.active.push(type);
                            if(scope.slug === 'ciscoOne'){
                                sub_keys.forEach(function (s) {
                                    scope.active.push(s);
                                })
                            }
                        }    
                        scope.active.sort();
                        scope.$apply();

                        if ($rootScope.dashboard === "sales") {
                            if ((type.slice(0, 1) === "1") || (type.slice(0, 1) === ">") || (type.slice(0, 1) === "<")) {
                                refreshAgingPCData();
                            } else {
                                refreshPCData();
                            }
                        } else {
                            if(scope.subslug === "bookings"){
                                return;
                            }
                            if(scope.slug === "tsAttach_overview" && scope.id !== 2){
                                scope.active =  [];
                                                return;
                            }
                            refreshServicePCData();
                        }   
                    }
                    // scope.legendSelected = false;
                    function legend_click(d, i) {
                        var d = d.key ? d.key : d;
                       /* tip.hide();*/
                        // if (d==="Uncategorized") {
                        //     return;
                        // }
                        if(scope.selectedsublegend){
                            if (scope.active.indexOf(d) > -1) {
                                //get active sublegends
                                keys.forEach(function (k) {
                                    if (scope.active.indexOf(k) > -1) {
                                        scope.active.splice(scope.active.indexOf(k), 1);
                                    }
                                })
                                var selectedSubLegends = angular.copy(scope.active);
                                scope.active = [];
                                if (scope.legendSelected) {
                                    scope.active = angular.copy(keys);
                                    scope.legendSelected = false;
                                    //scope.active.push(scope.selectedsublegend);
                            }else{
                                    scope.active.push(d);
                                    scope.legendSelected = true;
                                }
                                selectedSubLegends.forEach(function (s) {
                                    scope.active.push(s);
                                })
                            } else {
                                //get active sublegends
                                keys.forEach(function (k) {
                                    if (scope.active.indexOf(k) > -1) {
                                        scope.active.splice(scope.active.indexOf(k), 1);
                                    }
                                })
                                scope.active.push(d);
                                scope.legendSelected = true;
                                //scope.active.push(scope.selectedsublegend);
                            }
                            scope.$apply();
                        }else{
                            click(d);
                        }
                    }

                    function sub_legend_click(s, i) {
                        /*$(".d3-tip").hide();
                        $(".tooltip").hide();*/
                        $('.tooltip').remove();
                        // if (s==="Uncategorized") {
                        //     return;
                        // }
                        if (scope.selectedsublegend && scope.selectedsublegend === s && !(d3.event.ctrlKey || d3.event.metaKey)) {
                            scope.selectedsublegend = null;
                            scope.render(data);
                            scope.active.splice($.inArray(s, scope.active), 1);
                            sub_keys.forEach(function (sub) {
                                scope.active.push(sub);
                            });
                        } else if (d3.event.ctrlKey || d3.event.metaKey) {
                            //To add or remove exisiting selection
                            if (scope.active.indexOf(s) > -1) {
                                scope.active.splice(scope.active.indexOf(s), 1);
                            } else {
                                scope.selectedsublegend = s;
                                scope.active.push(s);
                            }
                            scope.render(data2);
                        }else{
                            scope.selectedsublegend = s;
                            scope.render(data);
                            var tempKeys = [];
                            keys.forEach(function (k) {
                                if(scope.active.indexOf(k) > -1){
                                    tempKeys.push(k);
                                }
                            });
                            scope.active = [];
                            if(tempKeys.length === 1){
                                scope.active = tempKeys;
                            }else{
                                scope.active = keys;
                            }
                            scope.active.push(s);
                        }
                        scope.$apply();
                    }

                    function histoGram(fD, mF) {
                        if(scope.active===undefined){
                            scope.active = [];
                        }
                        var width = ele[0].offsetWidth;
                        var height = 275;

                        var margin = {
                            top: 20,
                            right: 20,
                            bottom: 30,
                            left: 60
                        };
                        var hGsvg = svg
                            .attr("width", width)
                            .attr("height", height)
                            .append("g")
                            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
                        width = width - margin.left - margin.right + 20;
                        height = height - margin.top - margin.bottom;


                        var x = d3.scaleBand().rangeRound([0, width])
                            .padding(0.1)
                            .align(0.1)
                            .domain(fD.map(function (d) {
                                return d.state;
                            }));
                        var xAxis = d3.axisBottom(x)
                            .tickPadding(5);

                        hGsvg.append("g").attr("class", "x axis")
                            .attr("transform", "translate(0," + height + ")")
                            .call(xAxis);

                        hGsvg.selectAll(".x.axis .tick text")
                            .call(d3_wrap, x.bandwidth());

                        hGsvg.selectAll(".x.axis .tick text")
                            .attr("state-id", function (d, i) {
                                for (var j = 0; j < fD.length; j++) {
                                    if (fD[j].state === d) {
                                        return fD[j].stateId;
                                    }
                                }
                                return -1;
                            })
                            .on(event, function (d, i) {
                                var qId = d3.select(this).attr("state-id");
                                click_quarter(d, qId);
                            });

                        var y = d3.scaleLinear().rangeRound([height, 0]);


                        var max = 0;
                        var max_array = [];

                        if (scope.active.length) {
                            scope.active.forEach(function (k) {
                                if(scope.keys.indexOf(k) === -1) {
                                    return;
                                }
                                max_array.push(d3.max(fD.filter(function (d) {
                                    return d.key === k;
                                }), function (d) {
                                    return d.value;
                                }));
                            });
                            max_array.forEach(function (e) {
                                max += e;
                            });
                        }
                        else {
                            max = d3.max(fD, function (d) {
                                return d.total;
                            });
                        }

                        max += max * 0.20;

                        // DE130905 (Fix for Previous line)
                        if(angular.isDefined(mF[0])){
                            if (mF[0].values.length) {
                                var max_2 = d3.max(mF[0].values, function (d) {
                                    return d.value;
                                });
                                max = Math.max(max, max_2);
                            }
                        }

                        // DE130905 (Fix for Target line)
                        if (scope.targetdata) {
                            max = Math.max(max, scope.targetdata);
                        }

  
                        y.domain([0, max]);

                        var yAxis = d3.axisLeft(y)
                            .tickFormat(function (d) {
                                return $filter('formatValue')(d);
                            }).ticks(6)
                            .tickSize(-width);

                       var tip = d3.tip()
                            .attr('class', 'd3-tip')
                            .offset([-10, 0])
                            .html(function (d) {
                                var value = d.value;
                                var total = d.total;

                                var ret = "<strong>" + d.state + "</strong><span style='color:" + segColor(d.key) + "'>" + d.key + ": $" + $filter('formatValue')(d.value, false, scope.percent) + "</span>";

                                if (total > value) {
                                    ret += "<span>Total: $" + $filter('formatValue')(d.total, false, scope.percent) + ' </span>';
                                }

                                if (scope.previousdata) {
                                    var prev_value = 0;
                                    var prev_value_arr = $filter('filter')(mF[0].values, { state: d.state });
                                    if (prev_value_arr.length) {
                                        prev_value = prev_value_arr[0].value;
                                    }
                                    ret += "<span style='color:" + segColor("Previous Year") + "'>Previous Year: $" + $filter('formatValue')(prev_value, false, scope.percent) + ' </span>';
                                }

                                return ret;
                            });

                        hGsvg.call(tip);

                        hGsvg.append("g")
                            .attr("class", "y axis")
                            .call(yAxis)
                            .append("text")
                            .attr("transform", "rotate(-90)")
                            .attr("y", 6)
                            .attr("dy", ".71em")
                            .style("text-anchor", "end")
                            .text("");
                        var bars = hGsvg.selectAll(".bar").data(fD).enter()
                            .append("g").attr("class", "bar");

                        var end = {};

                        bars.append("rect")
                            .attr("class", function (d, i) {
                                return 'front front_' + i;
                            })
                            .attr("x", function (d) {
                                return x(d.state) + (x.bandwidth() - 20) / 2;
                            })
                            .attr("y", function (d) {
                                if (scope.active.length && scope.active.indexOf(d.key) === -1) {
                                    return 0;
                                }
                                if (!end[d.state]) {
                                    end[d.state] = 0;
                                }
                                end[d.state] += d.value;
                                return y(end[d.state]);
                            })
                            .attr("width", 20)
                            .attr("height", function (d) {
                                if (scope.active.length && scope.active.indexOf(d.key) === -1) {
                                    return 0;
                                }
                                var m = scope.active.indexOf(d.key) === 0 || !d.start ? 0 : 2;
                                var val = y.range()[0] - y(d.value) - m;
                                return val > 0 ? val : 0;
                            })
                            .attr('fill', function (d) {
                                if (scope.active.length && scope.active.indexOf(d.key) === -1 || (scope.quarter.length && scope.quarter.indexOf(d.state) === -1)) {
                                    return '#ccc';
                                }
                                return segColor(d.key);
                            })
                            .on(event, legend_click)
                            .on('mouseover', bar_mouseover)
                            .on('mouseout', bar_mouseout);

                        bars.append("rect").attr('class', 'back')
                            .attr("x", function (d) {
                                return x(d.state) + (x.bandwidth() - 20) / 2;
                            })
                            .attr("y", function (d) {
                                return 0;
                            })
                            .attr("width", 20)
                            .attr("height", function (d) {
                                if (scope.active.length && scope.active.indexOf(d.key) === -1) {
                                    return 0;
                                }
                                return y(end[d.state]);
                            })
                            .attr('fill', function (d) {
                                return '#EDEEF1';
                            });

                        var lineFunc = d3.line()
                            .x(function (d) {
                                var v = x(d.state) + (x.bandwidth()) / 2;
                                v = v ? v : '';
                                return v;
                            })
                            .y(function (d) {
                                if (!x(d.state)) {
                                    return;
                                }
                                var v = y(d.value) ? y(d.value) : 0;
                                return v;
                            });

                        var lines = hGsvg.selectAll(".line")
                            .data(mF)
                            .enter().append("g")
                            .attr("class", "line");

                        lines.append("path")
                            .attr("class", "line")
                            .attr("d", function (d) {
                                return lineFunc(d.values);
                            })
                            .style("stroke", function (d) {
                                return segColor(d.type);
                            })
                            .attr('stroke-width', 2.5)
                            .attr('fill', 'none')
                            .style("stroke-opacity", function (d) {
                                return scope.active.length ? 0 : 1;
                            });

                        if (typeof quarterWatch !== 'undefined') {
                            quarterWatch();
                        }

                        var quarterWatch = scope.$watch('quarter', function (newVals, oldVals) {
                            select_quarter();
                        }, true);

                        if (typeof activeWatch !== 'undefined') {
                            activeWatch();
                        }

                        var activeWatch = scope.$watch('active', function (newVals, oldVals) {
                            mouseover();
                        }, true);

                        scope.$on('$destroy', function () {
                            quarterWatch();
                            activeWatch();
                        });
                        
                        if (scope.selectedWaterFallQuarter) {
                            scope.quarter.push(scope.selectedWaterFallQuarter);

                            //finding the index of the selected quarter to adjust the view
                            var index = scope.data.findIndex(function (x, y) {
                                return x.quarter === scope.selectedWaterFallQuarter;
                            })

                            start = ciscoUtilities.getStartingIndex(scope.data, scope.view, scope.slug, scope.selection || scope.selectionTitle, show);
                            if (start > index) {
                                start = index;
                            }
                            data = scope.data.slice(start, show + start);
                            scope.selectedWaterFallQuarter = '';
                            scope.render(data);
                         }

                        function moveLeft() {
                            if (start === 0)
                                return;
                            start--;
                            data = scope.data.slice(start, start + show);
                            scope.render(scope.data);
                        }

                        function moveRight() {
                            if (start === start_max)
                                return;
                            start++;
                            data = scope.data.slice(start, start + show);
                            scope.render(scope.data);
                        }

                        function mouseover() {
                            if(scope.active===undefined){
                            scope.active = [];
                        }
                            var max = 0;
                            var max_array = [];
                            if (scope.active.length) {
                                scope.active.forEach(function (k) {
                                    if(scope.keys.indexOf(k) === -1 || scope.selectedsublegend === k) {
                                        return;
                                    }
                                    max_array.push(d3.max(sF.filter(function (d) {
                                        return d.key === k;
                                    }), function (d) {
                                        return d.value;
                                    }));
                                });
                                max_array.forEach(function (e) {
                                    max += e;
                                });
                            }
                            else {
                                max = d3.max(fD, function (d) {
                                    return d.total;
                                });
                            }

                            max += max * 0.20;

                            // DE130905 (Fix for Previous line)
                            if(angular.isDefined(mF[0])){
                                if (mF[0].values.length) {
                                    var max_2 = d3.max(mF[0].values, function (d) {
                                        return d.value;
                                    });
                                    max = Math.max(max, max_2);
                                }
                             }

                            // DE130905 (Fix for Target line)
                            if (scope.targetdata) {
                                max = Math.max(max, scope.targetdata);
                            }

                            y.domain([0, max]);

                            hGsvg.selectAll("g.y.axis")
                                .call(yAxis);
                            var bars = hGsvg.selectAll(".bar").data(sF);
                            var end = {};

                            bars.select("rect.front").transition().duration(scope.transitionDuration)
                                .attr("y", function (d) {
                                    if (scope.active.length && scope.active.indexOf(d.key) === -1) {
                                        return 0;
                                    }
                                    if (!end[d.state]) {
                                        end[d.state] = 0;
                                    }
                                    end[d.state] += d.value;
                                    return y(end[d.state]);
                                })
                                .attr("height", function (d) {
                                    if (scope.active.length && scope.active.indexOf(d.key) === -1) {
                                        return 0;
                                    }
                                    var m = (scope.active.indexOf(d.key) === 0 || !d.start) ? 0 : 2;
                                    var val = y.range()[0] - y(d.value) - m;
                                    return val > 0 ? val : 0;
                                })
                                .attr('fill', function (d) {
                                    if (scope.active.length && scope.active.indexOf(d.key) === -1 || (scope.quarter.length && scope.quarter.indexOf(d.state) === -1)) {
                                        return '#ccc';
                                    }
                                    return segColor(d.key);
                                });

                            bars.select("rect.back").transition().duration(scope.transitionDuration)
                                .attr("height", function (d) {
                                    if (scope.active.length && scope.active.indexOf(d.key) === -1) {
                                        return 0;
                                    }
                                    return y(end[d.state]);
                                });

                            table.selectAll("td").attr('class', function (e) {
                                if (scope.active.length && scope.active.indexOf(e) === -1) {
                                    return 'disabled';
                                }
                                return '';
                            });

                            var lines = hGsvg.selectAll(".line")
                                .data(mF);

                            if (!scope.active.length) {
                                lines.select("path.line")
                                    .attr("d", function (d) {
                                        return lineFunc(d.values);
                                    })
                            }

                            lines.select("path.line").transition().duration(scope.transitionDuration)
                                .style("stroke-opacity", function (d) {
                                    if (scope.active.length) {
                                        return 0;
                                    }
                                    return 1;
                                });

                        }

                        function click_quarter(d, qId) {
                              
                            if (!scope.selectionenabledarea) {
                                return;
                            }
                            var type = d.state ? d.state : d;
                            if (scope.quarter.indexOf(type) > -1) {
                                if (d3.event.ctrlKey || d3.event.metaKey) {
                                    scope.quarter.splice(scope.quarter.indexOf(type), 1);
                                    quarterId.splice(quarterId.indexOf(qId), 1);
                                } else {
                                    if (scope.quarter.length === 1) {
                                        scope.quarter = [];
                                        quarterId = [];
                                    } else {
                                        scope.quarter = [];
                                        quarterId = [];
                                        scope.quarter.push(type);
                                        quarterId.push(qId);
                                    }
                                }
                            } else {
                                if (!d3.event.ctrlKey && !d3.event.metaKey) {
                                    scope.quarter = [];
                                    quarterId = [];
                                }
                                scope.quarter.push(type);
                                quarterId.push(qId);
                            }
                            if ($rootScope.dashboard === "services") {
                                     if(scope.subslug === "bookings"){
                                         return;
                                     }

                                         refreshServicePCData();

                            } else {
                                refreshPCData();
                            }
                            scope.$apply();
                        }

                        function select_quarter() {
                              
                            var bars = hGsvg.selectAll(".bar").data(sF);

                            bars.attr('class', function (d) {
                                var c = 'bar';
                                if (scope.quarter.indexOf(d.state) > -1) {
                                    c += ' quarter_selected';
                                }
                                return c;
                            });

                            bars.select("rect.front").transition().duration(scope.transitionDuration)
                                .attr('fill', function (d) {
                                    if ((scope.quarter.length && scope.quarter.indexOf(d.state) === -1) || scope.active.length && scope.active.indexOf(d.key) === -1) {
                                        return '#ccc';
                                    }
                                    return segColor(d.key);
                                });

                            hGsvg.selectAll(".x.axis .tick text")
                                .attr('class', function (d) {
                                    var c = '';
                                    if (scope.quarter.indexOf(d) > -1) {
                                        c = 'quarter_selected';
                                    }
                                    return c;
                                });

                            hGsvg.selectAll(".quarter")
                                .attr('class', function (d) {
                                    var c = 'quarter';
                                    if (scope.quarter.indexOf(d.state) > -1) {
                                        c += ' quarter_selected';
                                    }
                                    return c;
                                });
                        }

                        function unselect_quarter() {
                        
                            var bars = hGsvg.selectAll(".bar").data(sF);

                            bars.attr('class', function (d) {
                                var c = 'bar';
                                return c;
                            });

                            bars.select("rect.front").transition().duration(scope.transitionDuration)
                                .attr('fill', function (d) {
                                    return segColor(d.key);
                                });

                            hGsvg.selectAll(".x.axis .tick text")
                                .attr('class', function (d) {
                                    var c = '';
                                    return c;
                                });

                            hGsvg.selectAll(".quarter")
                                .attr('class', function (d) {
                                    var c = 'quarter';
                                    return c;
                                });
                        }

                        function bar_mouseover(d, i) {
                            bars.select("rect.front.front_" + i)
                                .attr('fill', function (d) {
                                    if ((scope.quarter.length && scope.quarter.indexOf(d.state) === -1) || (scope.active.length && scope.active.indexOf(d.key) === -1)) {
                                        return segColor(d.key);
                                    }
                                    return $filter('darken')(segColor(d.key));
                                });
                            //hide tooltip on zoom in/out
                            $(window).resize(function () {
                                tip.hide(d);
                            });
                            tip.show(d);

                        }

                        function bar_mouseout(d, i) {
                            bars.select("rect.front.front_" + i)
                                .attr('fill', function (d) {
                                    if ((scope.quarter.length && scope.quarter.indexOf(d.state) === -1) || (scope.active.length && scope.active.indexOf(d.key) === -1)) {
                                        return '#ccc';
                                    }
                                    return segColor(d.key);
                                });
                            //hide tooltip on zoom in/out
                            $(window).resize(function () {
                                tip.hide(d);
                            });
                            tip.hide(d);
                            
                        }

                        if (start !== 0) {
                            hGsvg.append("svg:image")
                                .attr("transform", "translate(0," + height + ")")
                                .attr('class', 'arrow-left')
                                .attr("x", function () {
                                    return -20;
                                })
                                .attr("y", function () {
                                    return 10;
                                })
                                .attr('width', 20)
                                .attr('height', 20)
                                .attr("xlink:href", "images/arrow-left.svg")
                                .on(event, moveLeft);
                        }

                        if (start !== start_max) {
                            hGsvg.append("svg:image")
                                .attr("transform", "translate(" + width + "," + height + ")")
                                .attr('class', 'arrow-right')
                                .attr("x", function () {
                                    return -10;
                                })
                                .attr("y", function () {
                                    return 10;
                                })
                                .attr('width', 20)
                                .attr('height', 20)
                                .attr("xlink:href", "images/arrow-right.svg")
                                .on(event, moveRight);
                        }

                        function showCurrent(qm) {
                            var tColor = "#333333";
                            var triangleX = x(qm) + (x.bandwidth()) / 2;
                            var triangleTopY = -5;
                            var triangleBottomY = y.range()[0] + 5;
                            var triangle = d3.symbol()
                                .type(d3.symbolTriangle)
                                .size(30);

                            hGsvg.append("line")
                                .attr("x1", x(qm) + (x.bandwidth()) / 2)
                                .attr("y1", -5)
                                .attr("x2", x(qm) + (x.bandwidth()) / 2)
                                .attr("y2", y.range()[0] + 5)
                                .attr("stroke-width", 2)
                                .attr("stroke", tColor);

                            hGsvg.append("path")
                                .attr("d", triangle)
                                .attr("stroke", tColor)
                                .attr("fill", tColor)
                                .attr("transform", function () {
                                    return "translate(" + triangleX + "," + triangleTopY + ") rotate(180)";
                                });

                            hGsvg.append("path")
                                .attr("d", triangle)
                                .attr("stroke", tColor)
                                .attr("fill", tColor)
                                .attr("transform", function () {
                                    return "translate(" + triangleX + "," + triangleBottomY + ")";
                                });
                        }

                        function showTarget(qm) {
                            var tColor = "#E77F4A";
                            hGsvg.append("line")
                                .attr("x1", 0)
                                .attr("y1", y(qm))
                                .attr("x2", x.range()[1])
                                .attr("y2", y(qm))
                                .attr("stroke-width", 2)
                                .attr("stroke", tColor)
                                .attr("stroke-dasharray", 2, 3);

                            hGsvg.append('text')
                                .attr('class', 'target-line')
                                .attr("x", "30")
                                .attr("y", y(qm) - 10)
                                .style('fill', tColor)
                                .text('Target: ' + $filter('formatValue')(scope.targetdata))
                        }

                        if (scope.targetdata && typeof y(scope.targetdata) !== 'undefined') {
                            scope.targetdata = Number(scope.targetdata);
                            scope.targetdata = scope.targetdata.toString()
                            showTarget(scope.targetdata);
                        }

                        if (scope.currentweek && typeof x(scope.currentweek) !== 'undefined') {
                            showCurrent(scope.currentweek);
                        }
                        if (scope.currentquarter && typeof x(scope.currentquarter) !== 'undefined') {
                            showCurrent(scope.currentquarter);
                        }

                        if (scope.currentmonth && typeof x(scope.currentmonth) !== 'undefined') {
                            showCurrent(scope.currentmonth);
                        }
                        if (scope.currentyear && typeof x(scope.currentyear) !== 'undefined') {
                            showCurrent(scope.currentyear);
                        }

                    }

                    function legend(lD, from) {
                        var len = lD.length;
                        if (scope.previousdata) {
                            keys.push('Previous Year');
                            len++;
                        }
                        var legendClass = '';
                        if (len > 3) {
                            legendClass = 'threePlus';
                        } else if (len === 3) {
                            legendClass = 'three';
                        } else if (len === 2) {
                            legendClass = 'two';
                        } else if (len === 1) {
                            legendClass = 'one';
                        }

                        if(scope.slug === 'ciscoOne'){
                            legendClass = 'threePlus';
                        }
                        var legend = table.attr('class', 'legend ' + legendClass);
                        var tr = legend.append("tbody").append('tr');
                        var td = tr.selectAll("td").data(lD).enter().append("td");
                        if(from === 'sub'){
                            var div = td.append('div').on(event, sub_legend_click);
                        }else{
                            var div = td.append('div').on(event, legend_click);
                        }

                        td
                            .attr('class', function (e) {
                                if (scope.active.length && scope.active.indexOf(e) === -1) {
                                    return 'disabled';
                                }
                                return '';
                            });

                        div
                            .attr('uib-tooltip', function (d) {
                                return d;
                            })
                            .attr('tooltip-append-to-body', 'true');

                        div.append("svg").attr("width", '8').attr("height", '8').append("rect")
                            .attr("width", '8').attr("height", '8')
                            .attr("fill", function (d) {
                                return segColor(d);
                            });
                        div.append('text')
                            .text(function (d) {
                                return d;
                            });
                        if(from && from === 'sub'){
                            //do Nothing
                        }else if(scope.slug === 'ciscoOne'){
                            table.append('hr');
                        }

                        $compile(ele.children('table'))(scope);
                    }

                    var fData = [];
                    var keys = [];
                    var sub_keys = [];

                    var fullData = angular.copy(scope.data);
                    var fullPreviousData = scope.previousdata ? angular.copy(scope.previousdata) : [];

                    if (scope.campactivedrill && scope.slug === 'drs' && scope.selection !== 'SFDC Booked Deals') {
                        fullData.forEach(function (d) {
                            var areas = d.areas;
                            areas.forEach(function (e) {
                                if (e.shiptimeFreq[scope.campactivedrill]) {
                                    for (var a in e.shiptimeFreq) {
                                        if (a === scope.campactivedrill) {
                                            e.shiptimeFreq = e.shiptimeFreq[a].areas_drill;
                                            return false;
                                        }
                                    }
                                } else {
                                    e.shiptimeFreq = {};
                                }
                            });
                        });
                    }

                    if ((scope.campactivedrill && scope.slug !== 'drs') || (scope.campactivedrill && scope.slug === 'drs' && scope.selection === 'SFDC Booked Deals')) {
                        fullData.forEach(function (d) {
                            var areas = d.areas;
                            areas.forEach(function (e) {
                                if (e.freq[scope.campactivedrill]) {
                                    for (var a in e.freq) {
                                        if (a === scope.campactivedrill) {
                                            e.freq = e.freq[a].areas_drill;
                                            return false;
                                        }
                                    }
                                } else {
                                    e.freq = {};
                                }
                            });
                        });
                    }


                    var show = scope.columns < fullData.length ? scope.columns : fullData.length;
                    start_max = fullData.length - show;
                    var data = fullData.slice(start, start + show);

                    var previousdata = fullPreviousData.slice(start, start + show);
                    if(scope.slug === 'drs' && scope.selection !== 'SFDC Booked Deals'){
                        for(var j=0; j < fullData.length;j++){  for (var k = 0; k < fullData[j].areas.length; k++) {
                                for (var prop in fullData[j].areas[k].shiptimeFreq) {
                                    if (keys.indexOf(prop) === -1)
                                        keys.push(prop);
                                }
                            }
                        }
                    }

                    if (scope.slug !== 'drs' || ((scope.slug === 'drs' && scope.selection === 'SFDC Booked Deals') && (scope.pieactivedrill === "" || scope.pieactivedrill === undefined || scope.pieactivedrill === false))) {
                        for (var j = 0; j < fullData.length; j++) {
                            for (var k = 0; k < fullData[j].areas.length; k++) {
                                for (var prop in fullData[j].areas[k].freq) {
                                    if (keys.indexOf(prop) === -1)
                                        keys.push(prop);
                                }
                                for (var prop1 in fullData[j].areas[k].sub_freq) {
                                    if (sub_keys.indexOf(prop1) === -1)
                                        sub_keys.push(prop1);
                                }
                            }
                        }
                    }

                    if (scope.slug === 'drs' && scope.selection === 'SFDC Booked Deals' && (scope.pieactivedrill !== "" && scope.pieactivedrill !== undefined && scope.pieactivedrill !== false)) {
                        for (var j = 0; j < fullData.length; j++) {
                            for (var k = 0; k < fullData[j].areas.length; k++) {
                                for (var prop in fullData[j].areas[k].freq) {
                                    for (var legendKeys in fullData[j].areas[k].freq[prop]['areas_drill']) {
                                        if (keys.indexOf(legendKeys) === -1)
                                            keys.push(legendKeys);
                                    }
                                }
                            }
                        }
                    }

                    keys.sort();
                    sub_keys.sort();

                    scope.keys = keys;


                    if (scope.customorder) {
                        var allCategories = scope.customorder;
                        keys.sort(function(a, b) {
                        return allCategories.indexOf(a) - allCategories.indexOf(b);
                        });
                    }

                    //multi-selected sub legends
                    var subKeysForMultiSelect = [];
                    if(scope.active !== ""){
                        scope.active.forEach(function (k) {
                            if (keys.indexOf(k) < 0) {
                                subKeysForMultiSelect.push(k);
                            }
                        })
                    }

                    data.forEach(function (d) {
                        var o = {};
                        o.state = d.quarter;
                        o.stateId = d.quarterId || d.quarter;
                        o.freq = {};
                        var areas = d.areas;
                        areas.forEach(function (e) {
                            if ($rootScope.dashboard === "sales") {
                                if (scope.view === 'performance') {
                                    if (scope.area.length>0 && activeSpcKey===1){
                                        activeSpcKey = "customer";
                                    }
                                }
                                if ((scope.area.length > 0 && scope.area.indexOf(e.state) === -1) && (activeSpcKey === "sales")) {
                                    return;
                                }
                            }
                            if (scope.selectedsublegend && subKeysForMultiSelect.length) {
                                var b = {};
                                for (var sk in subKeysForMultiSelect) {
                                    var skObj = e.sub_freq[subKeysForMultiSelect[sk]];
                                     if(skObj !== undefined){
                                        Object.keys(skObj).map(function (a) {
                                            if (typeof b[a] !== 'undefined') {
                                                b[a] += skObj[a];
                                            } else {
                                                b[a] = skObj[a];
                                            }
                                        })
                                    }
                                }
                            }else{
                                if (scope.slug === 'drs' && scope.selection !== 'SFDC Booked Deals') {
                                    var b = e.shiptimeFreq;
                                }

                                if ((scope.slug !== 'drs') || (scope.slug === 'drs' && scope.selection === 'SFDC Booked Deals')) {
                                    var b = e.freq;
                                }
                                if(scope.selectedsublegend){
                                    var b = e.sub_freq[scope.selectedsublegend];
                                }
                }

                            for (var prop in b) {
                                if (typeof b[prop] === 'object') {
                                    var val = 0;
                                    for (var prop_2 in b[prop]) {
                                        if (scope.slug === 'drs' && scope.pieactivedrill && prop_2 === 'areas_drill' && scope.selection === 'SFDC Booked Deals') {
                                            for (var prop_drs in b[prop]['areas_drill']) {
                                                for (var subunit in b[prop]['areas_drill'][prop_drs]) {
                                                    val += b[prop][prop_2][prop_drs][subunit];
                                                }
                                                if (typeof o.freq[prop] !== 'undefined') {
                                                    o.freq[prop_drs] += val;
                                                } else {
                                                    o.freq[prop_drs] = val;
                                                }
                                            }
                                        }
                                        if (prop_2 != 'areas_drill') {
                                            val += b[prop][prop_2];
                                        }
                                    }
                                } else {
                                    var val = b[prop];
                                }
                                if (scope.slug !== 'drs' || (scope.slug === 'drs' && scope.selection === 'SFDC Booked Deals' && (scope.pieactivedrill === undefined || scope.pieactivedrill === false)) || (scope.slug === 'drs' && scope.selection === 'Shipment History')) {
                                    if (typeof o.freq[prop] !== 'undefined') {
                                        o.freq[prop] += val;
                                    } else {
                                        o.freq[prop] = val;
                                    }
                                }
                            }
                        });
                        fData.push(o);
                    });

                    var cData = [];
                    fullData.forEach(function (d) {
                        var o = {};
                        o.state = d.quarter;
                        o.freq = {};
                        var areas = d.areas;
                        areas.forEach(function (e) {
                            if ($rootScope.dashboard === "sales") {
                                if (scope.area.length && scope.area.indexOf(e.state) === -1 && (activeSpcKey === "sales")) {
                                    return;
                                }
                            }
                            if (scope.selectedsublegend && subKeysForMultiSelect.length) {
                                var b = {};
                                for (var sk in subKeysForMultiSelect) {
                                    var skObj = e.sub_freq[subKeysForMultiSelect[sk]];
                                    if(skObj !== undefined){
                                        Object.keys(skObj).map(function (a) {
                                            if (typeof b[a] !== 'undefined') {
                                                b[a] += skObj[a];
                                            } else {
                                                b[a] = skObj[a];
                                            }
                                        })
                                    }
                                }
                            }else{
                                if (scope.slug === 'drs' && scope.selection !== 'SFDC Booked Deals') {
                                    var b = e.shiptimeFreq;
                                }
                                if ((scope.slug !== 'drs') || (scope.slug === 'drs' && scope.selection === 'SFDC Booked Deals')) {
                                    var b = e.freq;
                                }
                                if(scope.selectedsublegend){
                                    var b = e.sub_freq[scope.selectedsublegend];
                                }
                            }
                            for (var prop in b) {
                                if (typeof b[prop] === 'object') {
                                    var val = 0;
                                    for (var prop_2 in b[prop]) {
                                        if (prop_2 != 'areas_drill') {
                                            val += b[prop][prop_2];
                                        }
                                    }
                                } else {
                                    var val = b[prop];
                                }
                                if (typeof o.freq[prop] !== 'undefined') {
                                    o.freq[prop] += val;
                                } else {
                                    o.freq[prop] = val;
                                }
                            }
                        });
                        cData.push(o);
                    });

                    cData.forEach(function (d) {
                        d.total = 0;
                        for (var prop in d.freq) {
                            d.total += d.freq[prop];
                        }
                        if (scope.previousdata) {
                            var f = $filter('filter')(scope.previousdata, {
                                quarter: d.state
                            });
                            if (f.length) {
                                d.previoustotal = f[0].areas[0].freq['Previous Year'];
                            }
                        }
                    });

                    scope.filtered = cData;

                    fData.forEach(function (d) {
                        d.total = 0;
                        for (var prop in d.freq) {
                            d.total += d.freq[prop];
                        }
                    });

                    var sF = [];
                    var yColumn = [];
                    fData.forEach(function (d) {
                        for (var prop in keys) {
                            if (!yColumn[d.state]) {
                                yColumn[d.state] = 0;
                            }
                            if (d.freq[keys[prop]] === undefined) {
                                d.freq[keys[prop]] = 0;
                            }
                            sF.push({
                                state: d.state,
                                stateId: d.stateId,
                                total: d.total,
                                key: keys[prop],
                                start: yColumn[d.state] ? (yColumn[d.state] + 0) : yColumn[d.state],
                                end: yColumn[d.state] + d.freq[keys[prop]],
                                value: d.freq[keys[prop]]
                            });
                            yColumn[d.state] += d.freq[keys[prop]];
                        }

                    });

                    var mF = [];

                    if (previousdata) {
                        angular.forEach(previousdata, function (data) {
                            data.freq = {};
                            data.freq = data.areas[0].freq;
                        })
                        var p_keys = ciscoUtilities.getUniqueKeys(previousdata, "freq");

                        mF = p_keys.map(function (d) {
                            return {
                                type: d,
                                values: previousdata.map(function (t) {
                                    return {
                                        state: t.quarter,
                                        value: t.freq[d] || 0
                                    };
                                })
                            };
                        });
                    }
                    if (scope.viewtype === 'list') {
                        return;
                    }

                    var getOrder = false;

                    if (scope.view === "performance" && scope.slug === "renew") {
                        getOrder = true;
                        keys = ciscoUtilities.getUniqueKeys(sF, "key", getOrder);
                    }

                    var keys_length = keys.length;
                    var colors_p;
                    if (keys_length == 2) {
                        colors_p = 'colors_2';
                    } else if (keys_length <= 3) {
                        colors_p = 'colors_3';
                    } else if (keys_length <= 6) {
                        colors_p = 'colors_6';
                    } else if (keys_length <= 13) {
                        colors_p = 'colors';
                    } else {
                        colors_p = 'colors_more';
                    }

                    colors = colors_theme[colors_p];
                    legend(keys);
                    if(scope.slug === 'ciscoOne'){
                        legend(sub_keys, 'sub');
                    }
                    histoGram(sF, mF);
                };
            }
        };
    }
]);