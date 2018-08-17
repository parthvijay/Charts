/*jshint sub:true*/
'use strict';
angular.module('ciscoExecDashApp').directive('barStackedHorizontalChart', [
    '$timeout',
    '$filter',
    '$window',
    '$compile',
    'isMobile',
    'CiscoUtilities',
    '$interval',
    '$rootScope',
    function($timeout, $filter, $window, $compile, isMobile, ciscoUtilities, $interval, $rootScope) {
        return {
            restrict: 'E',
            scope: {
                data: '=',
                copytodom: '=',
                colors: '=',
                columns: '=',
                expanded: '=',
                active: '=?',
                sidebar: '=',
                keys: '=',
                filtered: '=',
                filteredquarter: '=',
                quarter: '=?',
                area: '=?',
                viewtype: '=',
                activecategory: '=',
                action: '=',
                isaccountmanagerlist: '=',
                drillaccountmanager: '&',
                selectionenabled: '=',
                selectionenabledarea: '=',
                multipleselectionenabled: '=',
                customorder: '=',
                expandeddata: '=',
                filteredexpandeddata: '=',
                quarterfilterenabled: '=',
                id: '=',
                subslug: '=',
                slug: '=',
                callparam: '=',
                checkedstates: '=?',
                selectionTitle: '=',
                pieactivedrill: '=',
                islineitemtooltip: '=',
                allowreports: '=',
                linecount: '=',
                linecountselected: '=',
                selectedsublegend: '=?',
                 listamount: '=',
                listamountselected: '=',
                renderGraphForSelectAll: '=?',
                view: '='
            },
            link: function(scope, ele, attrs) {
                var refreshAllData = function() {
                    scope.$emit('refresh-all-data', {
                        'pcNodeName': JSON.stringify(scope.area)
                    });
                };
                var refreshPCData = function() {
                    scope.$emit('refresh-spc-data', {
                        'activeKey': scope.active
                    });
                };
                var refreshAgingPCData = function() {
                    scope.$emit('refresh-spc-data', {
                        'agingKey': scope.active
                    })
                };


                var refreshServicePCData = function() {
                    scope.$emit('refresh-service-spc-data', {
                        'activeKey': scope.active,
                        'chartId': scope.id,
                        'pcNodeName' : JSON.stringify(scope.area),
                        'callParam' : scope.callparam
                    })
                }
                scope.$on('select-area', function(event, data) {
                    if (data && data.pcNodeName) {
                        $timeout(function() {
                            scope.area = JSON.parse(data.pcNodeName);
                        }, 100);
                    }
                });
                if ($rootScope.dashboard === "services") {
                    scope.slug = scope.slug + "_" + scope.subslug;
                }

                var activeSpcKey = "sales";
                scope.$on('active-spc-key-selection', function(event, data) {
                    activeSpcKey = data;
                });

                var d3 = $window.d3;
                var event = isMobile ? "touchstart" : "click";
                scope.transitionDuration = 500;
                var ele = $(ele[0]).closest('.tile');
                ele.find('svg, table, .scrollContainer, .xContainerFixed').remove();
                var svgContainer = d3.select(ele[0]).append('div').attr('class', 'scrollContainer').attr('ng-nicescroll', 'true');
                var svg = svgContainer.append('svg');
                var xContainer = d3.select(ele[0]).append('div').attr('class', 'xContainerFixed');
                var xContainerSvg = xContainer.append('svg');
                var table = d3.select(ele[0])
                    .append('table');
                //var colors;
                var show = scope.columns;
                scope.selectedsublegend = null;
                //DE151738- To Reset Line Count to zero whn we Deselect AM- Arun Dada
                //scope.linecountselected=0;
                var colors_theme = $window.ciscoConfig.colorsPalette[$rootScope.dashboard];
                var colors;

                var windowWidth = $(window).width();
                $window.addEventListener('resize', function(event) {
                    $timeout(function() {
                        if ($(window).width() !== windowWidth) {
                            windowWidth = $(window).width();
                            scope.render(scope.data);
                        }
                    });
                });

                scope.$on('renew-performance-customer', function(event, newVals) {
                    scope.data = newVals.data[0];
                    scope.render(scope.data);
                });

                var groupWatch = scope.$watchGroup(['data', 'expandeddata', 'columns', 'expanded', 'sidebar', 'viewtype', 'activecategory', 'isaccountmanagerlist', 'sldData'], function(newVals, oldVals) {
                    if (!scope.data) {
                        return;
                    }
                    if (true) {
                        $timeout(function() {
                            scope.render(scope.data);
                        });
                    }
                }, true);

                var colorsWatch = scope.$watch('colors', function(newVals, oldVals) {
                    if (!scope.data) {
                        return;
                    }
                    if (true) {
                        $timeout(function() {
                            scope.render(scope.data);
                        });
                    }
                }, true);
                var domWatch = scope.$watch('copytodom', function (newVals, oldVals) {
                    if (newVals !== oldVals) {
                        $timeout(function () {
                            if (scope.checkedstates.length > 0) {
                                if (scope.copytodom) {
                                    var data = [];
                                    for (var individualData of scope.data) {
                                        var selectedArea = [];
                                        for (var selectedState of individualData['areas']) {
                                            if (scope.checkedstates.includes(selectedState['state']))
                                                selectedArea.push(selectedState)
                                        }
                                        data.push({"quarter": individualData['quarter'], "areas": selectedArea})
                                    }
                                    scope.render(data);
                                } else {
                                    scope.render(scope.data);
                                }
                            }
                            else
                                scope.render(scope.data);
                        });
                    }
                }, true);

                var quarterWatch = scope.$watch('quarter', function(newVals, oldVals) {
                    if (!scope.data || !scope.quarterfilterenabled) {
                        return;
                    }
                    if (true) {
                        $timeout(function() {
                            scope.render(scope.data);
                        });
                    }
                }, true);

                var subLegendWatch = scope.$watch('selectedsublegend', function (newVals, oldVals) {
                    $timeout(function () {
                        scope.render(scope.data);
                    });
                }, true);

                var renderGraphForSelectAllWatch = scope.$watch('renderGraphForSelectAll', function (newVals, oldVals) {
                    if(newVals !== oldVals){
                        
                            scope.render(scope.data);
                        
                    }
                }, true);

                scope.$on('$destroy', function() {
                    groupWatch();
                    colorsWatch();
                    quarterWatch();
                    subLegendWatch();
                    renderGraphForSelectAllWatch();
                    domWatch();
                });

                function segColor(c) {
                    var constant = $window.ciscoConfig.colorsPalette[$rootScope.dashboard]['constant'][c];
                    if (typeof constant !== 'undefined') {
                        return constant;
                    };
                    if (scope.colors===undefined) {
                        scope.colors = {};
                    };
                    var size = Object.keys(scope.colors).length;
                    if (!size) {
                        var size = Object.keys(scope.colorsOpp).length;
                        if (!scope.colorsOpp[c]) {
                            scope.colorsOpp[c] = colors[size];
                        }
                        return scope.colorsOpp[c];
                    }
                    return scope.colors[c];
                }

                scope.render = function (data2) {
                    svg.selectAll('*').remove();
                    xContainerSvg.selectAll('*').remove();
                    table.selectAll('*').remove();

                    scope.colorsOpp = {};

                    var data = angular.copy(data2);
                    if (!data || !data.length) {
                        scope.filtered = [];
                        return;
                    }

                    function click(d) {
                        scope.callparam = "";
                        if (!scope.selectionenabled) {
                            return;
                        }
                        var type = d.key ? d.key : d;
                        if (scope.active.indexOf(type) > -1) {
                            if (d3.event.ctrlKey || d3.event.metaKey) {
                                scope.active.splice(scope.active.indexOf(type), 1);
                            } else {
                                if (scope.active.length === 1  || (scope.slug === 'ciscoOne' && scope.active.length > 1)) {
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

                        if ((type.slice(0, 1) === "1") || (type.slice(0, 1) === ">") || (type.slice(0, 1) === "<")) {
                            refreshAgingPCData();
                        } else {
                            if ($rootScope.dashboard === "services") {
                                if(scope.slug === "tsAttach_overview" && scope.id !== 2){
                                     scope.active = [];
                                    return;
                                }
                                refreshServicePCData();
                            }
                            else{
                                //Supressing the customer call on click of topmost legends in customer chart
                                if(scope.slug !== 'ciscoOne'){
                                    refreshPCData();
                                    refreshAllData();
                                }
                            }

                        }
                        scope.$apply();
                    }

                    function legend_click(d) {
                        var d = d.key ? d.key : d;
                       /* $(".d3-tip").hide();
                        $(".tooltip").hide();*/
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
                                    scope.active.push(scope.selectedsublegend);
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
                                scope.active.push(scope.selectedsublegend);
                            }
                            scope.$apply();
                        }else{
                            click(d);
                        }
                    }

                    function sub_legend_click(s, i) {
                        /*tip.hide();*/
                        $('.tooltip').remove();
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
                    function histoGram(fD) {
                        if(scope.active===undefined){
                            scope.active = [];
                        };
                        var hG = {}, hGDim = { t: 10, r: 20, b: 0, l: 30 };
                        var elOffsetWidth = ele[0].offsetWidth;
                        if (elOffsetWidth === 0 && ele.hasClass('ng-hide')) {
                            elOffsetWidth = $(ele[0]).siblings('div.tile-head-area').width();
                        }
                        hGDim.w = (elOffsetWidth) - hGDim.r;
                        hGDim.h = 55 * fData.length - hGDim.t - hGDim.b;

                        var transX;
                        
                            transX = 105;
                            hGDim.w -= 15;
                       

                        if (hGDim.w < 0) {
                            return;
                        }

                        var hGsvg = svg
                            .attr("width", hGDim.w > 0 ? hGDim.w : 0)
                            .attr("height", (hGDim.h) > 240 ? (hGDim.h + 15) : 240).append("g")
                            .attr("transform", "translate(" + transX + ",0)");
                        var x = d3.scaleLinear().range([0, hGDim.w - 100]);
                        var y = d3.scaleBand().range([0, hGDim.h])
                            .domain(fD.map(function(d) {
                                return d.state;
                            }));

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

                        if (scope.active.length && scope.selectionenabled && false) {
                            x.domain([0, d3.max(sF.filter(function (d) {
                                return scope.active.indexOf(d.key) > -1;
                            }), function (d) {
                                return d.value + (d.value * 0.20);
                            })]);
                        } else {
                            x.domain([0, max]);
                        }

                        var xAxis = d3.axisBottom(x)
                            .tickFormat(function (d) {
                                return $filter('formatValue')(d);
                            }).ticks(4)
                            .tickSize(-240);
                        var yAxis = d3.axisLeft(y)
                            .tickFormat(function (d) {
                                return d;
                            });

                        angular.element(ele.find('.scrollContainer')).bind("scroll", function () {
                            $('.action_offset').hide();
                            var scrollTop = ele.find('.scrollContainer').scrollTop();
                            var element = Math.floor(scrollTop / 55);
                            var activeElements = fD.filter(function (d) {
                                if (scope.active.length && scope.selectionenabled) {
                                    return scope.active.indexOf(d.key) > -1;
                                }
                                return true;
                            });
                            var keys_count = scope.active.length ? scope.active.length : keys.length;
                            activeElements = activeElements.slice(element * keys_count, (element * keys_count) + (5 * keys_count));

                            var max = 0;
                            var max_array = [];

                            if (scope.active.length) {
                                scope.active.forEach(function (k) {
                                    if(scope.keys.indexOf(k) === -1) {
                                        return;
                                    }
                                    max_array.push(d3.max(activeElements.filter(function (d) {
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
                                max = d3.max(activeElements, function (d) {
                                    return d.total;
                                });
                            }

                            max += max * 0.20;

                            x.domain([0, max]);

                            xContainerSvg.selectAll("g.x.axis").call(xAxis);

                            var bars = hGsvg.selectAll(".bar").data(sF);
                            var end = {};

                            bars.select("rect.front").transition().duration(scope.transitionDuration)
                                .attr("x", function (d) {
                                    if (scope.active.length && scope.active.indexOf(d.key) === -1) {
                                        return 0;
                                    }
                                    if (!end[d.state]) {
                                        end[d.state] = 0;
                                    }
                                    var ret = end[d.state];
                                    end[d.state] += d.value;
                                    return x(ret);
                                })
                                .attr("width", function (d) {
                                    if (scope.active.length && scope.active.indexOf(d.key) === -1) {
                                        return 0;
                                    }
                                    var m = (scope.active.indexOf(d.key) === 0 || !d.start) ? 2 : 2;
                                    var val = x(d.value) - m;
                                    return val > 0 ? val : 0;
                                });

                            bars.select("rect.back").transition().duration(scope.transitionDuration)
                                .attr("x", function (d) {
                                    if (scope.active.length && scope.selectionenabled) {
                                        if (scope.active.indexOf(d.key) === -1) {
                                            return 0;
                                        }
                                    }
                                    return x(end[d.state]);
                                })
                                .attr("width", function (d) {
                                    var val = x.range()[1] - x(d.total);
                                    if (scope.active.length && scope.selectionenabled) {
                                        if (scope.active.indexOf(d.key) === -1) {
                                            return 0;
                                        }
                                        val = x.range()[1] - x(end[d.state]);
                                    }
                                    return val > 0 ? val : 0;
                                });

                        });

                        xContainerSvg.attr("width", hGDim.w)
                            .attr("height", 20);

                        var transX = 104;
                        var userAgent = $window.navigator.userAgent;
                        if(userAgent.indexOf('Firefox') > -1){
                            transX = 94;
                        }

                        xContainerSvg.append("g")
                            .attr("class", "x axis")
                            .attr("transform", "translate(" + (transX) + "," + (5) + ")")
                            .call(xAxis);

                        hGsvg.append("g").attr("class", "y axis")
                            /* .attr("transform", "translate(-15,-12)") */
                            .call(yAxis);

                        hGsvg.selectAll('.y.axis .tick text')
                            .call(d3_wrap, y.bandwidth())
                            //.on(event, click_area)
                            .on(event, open_dropdown)
                            .attr('uib-tooltip', function (d) {
                                return d;
                            })
                            .attr('tooltip-append-to-body', 'true');
                            // ux fix for checkboxes in patners
                       // if (scope.action || scope.allowreports) {

                            hGsvg.selectAll(".action-button")
                                .data(d3.map(fD, function(d) {
                                    return d.state ;
                                }).keys())
                                .enter()
                                .append("svg:image")
                                .attr('class', 'action-button')
                                .attr('id', function(d){
                                    return "checkbox-"+d;
                                })
                                .attr("x", function() {
                                    return -105;
                                })
                                .attr("y", function(d) {
                                    var state = d.split(">")[0];
                                    return y(state) + (y.bandwidth() - 12) / 2;
                                })
                                .attr('width', 16)
                                .attr('height', 16)
                                .attr("xlink:href", function(d){
                                    
                                    return (scope.checkedstates.indexOf(d) == -1)? "images/checkbox.svg" : "images/checkbox-enable.svg"
                                })
                                .on('click', clickCheckBox);

                       // }

                        $compile(ele.find('.scrollContainer'))(scope);
                        $compile(ele.find('.y.axis .tick text'))(scope);

                        // Tooltip for 3rd chart - C1 MCR
                        var estimate = scope.islineitemtooltip;
                        if (scope.pieactivedrill && scope.selectionTitle === 'Cisco ONE Migration Opportunities by Customers') {
                            scope.coLineItems = true;
                        }


                        var tip = d3.tip()
                            .attr("class", function () {
                                var c = "d3-tip";
                                if (scope.coLineItems) {
                                    c += " d3-lineItem";
                                }
                                return c;
                            })
                            .offset([-10, 0])
                            .html(function (d) {

                                var a = "<strong>" + d.state + "</strong>";

                                // Tooltip for 3rd chart - C1 MCR
                                if (scope.pieactivedrill && scope.selectionTitle === 'Cisco ONE Migration Opportunities by Customers') {
                                    var getKey;
                                    for (var i = 0; i < estimate.length; i++) {
                                        if (estimate[i].name === d.state) {
                                            getKey = i;
                                        }
                                    }
                                    var keyLower = (d.key).toLowerCase() + '_lineitems';
                                    var lineitemsTotal = 0;
                                    for (var items in (estimate[getKey])) {
                                        if (items.endsWith("_lineitems")) {
                                            lineitemsTotal += estimate[getKey][items];
                                        }
                                    }

                                    a += "<table><tr><th><i>Amount ($)</i></th>";
                                    a += "<th class='text-right'><i> line items (#) </i></th></tr>";
                                    a += "<tr><td><span style='color:" + segColor(d.key) + "'>" + d.key + ": $" + $filter('formatValue')(d.value) + "</span></td>";

                                    if (keys.length > 0) {
                                        a += "<td class='text-right'><span style='color:" + segColor(d.key) + "'>" + (estimate[getKey][keyLower]) + "</span></td></tr>";
                                        a += "<tr><td><span>Total: $" + $filter('formatValue')(d.total) + '</span></td>';
                                        a += "<td class='text-right'><span>" + lineitemsTotal + '</span></td></tr></table>';
                                    }
                                } else {
                                    var a = "<strong>" + d.state + "</strong><span style='color:" + segColor(d.key) + "'>" + d.key + ": $" + $filter('formatValue')(d.value) + "</span>";
                                    if (keys.length > 0) {
                                        a += "<span>Total: $" + $filter('formatValue')(d.total) + '</span>';
                                    }
                                }
                                return a;
                            });
                        hGsvg.call(tip);

                        var bars = hGsvg.selectAll(".bar").data(fD).enter()
                            .append("g").attr("class", "bar");

                        var end = {};

                        bars.append("rect")
                            .attr("class", function (d, i) {
                                return 'front front_' + i;
                            })
                            .attr("x", function (d) {
                                if (scope.active.length && scope.active.indexOf(d.key) === -1) {
                                    return 0;
                                }
                                if (!end[d.state]) {
                                    end[d.state] = 0;
                                }
                                var ret = end[d.state];
                                end[d.state] += d.value;
                                return x(ret);
                            })
                            .attr("y", function (d) {
                                return y(d.state) + (y.bandwidth() - 15) / 2;
                            })
                            .attr("width", function (d) {
                                if (scope.active.length && scope.active.indexOf(d.key) === -1) {
                                    return 0;
                                }
                                var m = (scope.active.indexOf(d.key) === 0 || !d.start) ? 2 : 2;
                                var val = x(d.value) - m;
                                return val > 0 ? val : 0;
                            })
                            .attr("height", function(d) {
                                return 15;
                            })
                            .attr('fill', function (d) {
                                if (scope.selectionenabledarea && ((scope.area.length && scope.area.indexOf(d.state)) === -1) || (scope.active.length && scope.active.indexOf(d.key) === -1)) {
                                    return '#ccc';
                                }
                                return segColor(d.key);
                            })
                            .on(event, legend_click)
                            .on('mouseover', bar_mouseover)
                            .on('mouseout', bar_mouseout);

                        bars.append("rect").attr('class', 'back')
                            .attr("x", function (d) {
                                if (scope.active.length && scope.selectionenabled) {
                                    if (scope.active.indexOf(d.key) === -1) {
                                        return 0;
                                    }
                                }
                                return x(end[d.state]);
                            })
                            .attr("y", function (d) {
                                return y(d.state) + (y.bandwidth() - 15) / 2;
                            })
                            .attr("width", function (d) {
                                var val = x.range()[1] - x(d.total);
                                if (scope.active.length && scope.selectionenabled) {
                                    if (scope.active.indexOf(d.key) === -1) {
                                        return 0;
                                    }
                                    val = x.range()[1] - x(end[d.state]);
                                }
                                return val > 0 ? val : 0;
                            })
                            .attr("height", function(d) {
                                return 15;
                            })
                            .attr('fill', function (d) {
                                return '#EDEEF1';
                            });

                        var areaWatch = scope.$watch('area', function (newVals, oldVals) {
                            if (!scope.selectionenabledarea) {
                                return;
                            }
                            select_area();
                        }, true);

                        var activeWatch = scope.$watch('active', function (newVals, oldVals) {
                            if (!scope.selectionenabled) {
                                return;
                            }
                            mouseover();
                        }, true);

                        scope.$on('$destroy', function () {
                            areaWatch();
                            activeWatch();
                        });

                        function mouseover() {
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
                            } else {
                                max = d3.max(fD, function (d) {
                                    return d.total;
                                });
                            }

                            max += max * 0.20;

                            x.domain([0, max]);

                            xContainerSvg.selectAll("g.x.axis")
                                .call(xAxis);

                            var bars = hGsvg.selectAll(".bar").data(sF);
                            var end = {};

                            bars.select("rect.front").transition().duration(scope.transitionDuration)
                                .attr("x", function (d) {
                                    if (scope.active.length && scope.active.indexOf(d.key) === -1) {
                                        return 0;
                                    }
                                    if (!end[d.state]) {
                                        end[d.state] = 0;
                                    }
                                    var ret = end[d.state];
                                    end[d.state] += d.value;
                                    return x(ret);
                                })
                                .attr("width", function (d) {
                                    if (scope.active.length && scope.active.indexOf(d.key) === -1) {
                                        return 0;
                                    }
                                    var m = (scope.active.indexOf(d.key) === 0 || !d.start) ? 2 : 2;
                                    var val = x(d.value) - m;
                                    return val > 0 ? val : 0;
                                })
                                .attr('fill', function (d) {
                                    if (scope.selectionenabledarea && ((scope.area.length && scope.area.indexOf(d.area || d.state) === -1) || (scope.active.length && scope.active.indexOf(d.key) === -1))) {
                                        return '#ccc';
                                    }
                                    return segColor(d.key);
                                });

                            bars.select("rect.back").transition().duration(scope.transitionDuration)
                                .attr("x", function (d) {
                                    if (scope.active.length && scope.selectionenabled) {
                                        if (scope.active.indexOf(d.key) === -1) {
                                            return 0;
                                        }
                                    }
                                    return x(end[d.state]);
                                })
                                .attr("width", function (d) {
                                    var val = x.range()[1] - x(d.total);
                                    if (scope.active.length && scope.selectionenabled) {
                                        if (scope.active.indexOf(d.key) === -1) {
                                            return 0;
                                        }
                                        val = x.range()[1] - x(end[d.state]);
                                    }
                                    return val > 0 ? val : 0;
                                });

                            table.selectAll("td").attr('class', function (e) {
                                if (scope.active.length && scope.active.indexOf(e) === -1) {
                                    return 'disabled';
                                }
                                return '';
                            });
                        }

                        function actionMouseover(e) {
                            if (typeof actionInterval !== 'undefined') {
                                $interval.cancel(actionInterval);
                            }
                            var state;
                            if (typeof e === "object") {
                                state = e.state;
                            } else {
                                state = e.split(">")[0];
                                var stateId = e.split(">")[1];
                            }
                            //Please donot remove this code :-
                            //Mentioned multiple times not to remove the code if you dont know :- KD
                             angular.forEach(scope.filtered,function(customer){
                                  if(customer.state === (state || stateId)){
                                                  $rootScope.$broadcast('customer-name',customer);
                                  }

                           })
                            $('.action_offset a').attr("state-id", state);
                            $('.action_offset a').attr("state-savmid", stateId);
                            $('.action_offset').show().css({
                                'top': ($(this).offset().top + 30),
                                'left': $(this).offset().left,
                            })
                        }

                        function clickCheckBox(e) {
                            var a =[];
                            var b = [];
                            var checkedStatus = ($(this).attr("href") == "images/checkbox.svg")? true : false;
                                   if(scope.activecategory === 0 || scope.activecategory === 2 || scope.activecategory === 3){                                
                                  angular.forEach(scope.filtered,function(val){
                                      if(val.state === e){  
                                         a.push({"title":e,"value":val.lineCount});
                                         b.push({"title":e,"value":val.listAmount});
                                      }
                                  })
                                } else{
                                    var a = $filter('filter')(scope.linecount, { title: e });
                                    var b = $filter('filter')(scope.listamount, { title: e });
                                }
                            if(checkedStatus) {
                                $(this).attr("href", "images/checkbox-enable.svg");
                                if(scope.checkedstates.length == 0 || scope.checkedstates.indexOf(e) == -1) {
                                    scope.checkedstates.push(e);
                                }
                                if (a.length) {
                                scope.linecountselected = parseInt(scope.linecountselected);
                                scope.linecountselected += a[0].value;
                                scope.listamountselected = parseInt(scope.listamountselected);
                                scope.listamountselected += b[0].value;
                            }
                                scope.$apply();
                            }
                            else {

                                $(this).attr("href", "images/checkbox.svg");
                                if(scope.checkedstates.length > 0 && scope.checkedstates.indexOf(e) != -1) {
                                    scope.checkedstates.splice(scope.checkedstates.indexOf(e), 1);
                            }
                            if (a.length && scope.linecountselected) {
                                scope.linecountselected = parseInt(scope.linecountselected);
                                scope.linecountselected -= a[0].value;
                                scope.listamountselected -= b[0].value;
                            }
                                scope.$apply();
                            }
                            //For case: To change the text between "Select All" or "Deselect All" based on the checkbox selections
                            if(scope.renderGraphForSelectAll && scope.checkedstates.length !== scope.filtered.length){
                                scope.renderGraphForSelectAll = false;
                            }else if(!scope.renderGraphForSelectAll && scope.checkedstates.length === scope.filtered.length){
                                scope.renderGraphForSelectAll = true;
                            }
                            scope.$apply();
                        }


                        function mouseout() {
                            var bars = hGsvg.selectAll(".bar").data(sF);
                            bars.select("rect.front").transition().duration(scope.transitionDuration)
                                .attr('fill', function (d) {
                                    if (scope.selectionenabledarea && ((scope.area.length && scope.area.indexOf(d.area || d.state) === -1) || (scope.active.length && scope.active.indexOf(d.key) === -1))) {
                                        return '#ccc';
                                    }
                                    return segColor(d.key);
                                });
                            table.selectAll("td").attr('class', function (e) {
                                return '';
                            });
                        }

                        function open_dropdown(e) {
                            var state;
                            var stateId
                            if (typeof e === "object") {
                                state = e.state;
                            } else {
                                state = e;
                                d3.map(fD, function (d) {
                                    if(d.state === e && (d.stateId != "" && d.stateId != "undefined")){
                                        stateId = d.stateId;
                                    }
                                });
                            }
                            if(!scope.action){
                                click_area(e);
                            }else{
                                if (typeof actionInterval !== 'undefined') {
                                    $interval.cancel(actionInterval);
                                }
                                $('.action_offset a').attr("state-id", state);
                                $('.action_offset a').attr("state-savmid", stateId);
                                if(scope.area == undefined || scope.area.indexOf(state) == -1)
                                    $('.action_offset a#click_area_text').html("Filter to this Customer");
                                else
                                    $('.action_offset a#click_area_text').html("Remove this Customer");
                                $('.action_offset').show().css({
                                    'top': ($(this).offset().top + 30),
                                    'left': $(this).offset().left,
                                })
                            }
                            //Please donot remove this code :-
                            //Mentioned multiple times not to remove the code if you dont know :- KD
                             angular.forEach(scope.filtered,function(customer){
                                  if(customer.state === (state || stateId)){
                                                  $rootScope.$broadcast('customer-name',customer);
                                  }

                           })
                        }

                        function close_dropdown(e) {
                            window.actionInterval = $interval(function () {
                                if (!$(':hover').last().closest('.action_offset').length) {
                                    $('.action_offset').hide();
                                    $interval.cancel(actionInterval);
                                }
                            }, 300);
                        }

                        function click_area(d) {
                            //Fix for DE132526
                            if(scope.view === "performance"){
                                return;
                            }
                            if($rootScope.dashboard !== "services"){
                            if(scope.subslug === "overview" && scope.id === 2){
                                    return;
                                }
                            }else if($rootScope.dashboard === "services"){
                                if(scope.subslug === "overview" && scope.id === 2){
                                    if(scope.slug !== "tsAttach_overview" && scope.slug !== "tsRenew_overview")
                                        return;
                                }
                            }
                            scope.callparam = "nodeNameClick";
                            if (!scope.selectionenabledarea) {
                                return;
                            }
                            if (scope.isaccountmanagerlist) {
                                scope.drillaccountmanager({ arg1: true, arg2: d });
                                scope.listamountselected = 0;
                                scope.linecountselected = 0;
                                scope.$apply();
                                return;
                            }

                            var type = d;
                            if (scope.area.indexOf(type) > -1) {
                                if ((d3.event.ctrlKey || d3.event.metaKey) && scope.multipleselectionenabled) {
                                    scope.area.splice(scope.area.indexOf(type), 1);
                                } else {
                                    if (scope.area.length === 1) {
                                        scope.area = [];
                                    } else {
                                        scope.area = [];
                                        scope.area.push(type);
                                    }
                                }
                            } else {
                                if ((!d3.event.ctrlKey && !d3.event.metaKey) || !scope.multipleselectionenabled) {
                                    scope.area = [];
                                }
                                scope.area.push(type);
                            }
                            scope.$apply();
                            $('.tooltip').remove();
                            //donot remove this func call :_ KD
                            if ($rootScope.dashboard === "services") {
                                if(scope.subslug === "overview" && scope.id === 2){
                                    return;
                                }
                                refreshServicePCData();
                            } else {
                                
                                refreshAllData();
                            }

                        }

                        function select_area() {
                            var bars = hGsvg.selectAll(".bar").data(sF);

                            bars.attr('class', function(d) {
                                var c = 'bar';
                                if (scope.area.indexOf(d.state) > -1) {
                                    c += ' quarter_selected';
                                }
                                return c;
                            });

                            bars.select("rect.front").transition().duration(scope.transitionDuration)
                                .attr('fill', function (d) {
                                    if ((scope.area.length && scope.area.indexOf(d.state) === -1) || (scope.active.length && scope.active.indexOf(d.key) === -1)) {
                                        return '#ccc';
                                    }
                                    return segColor(d.key);

                                });

                            hGsvg.selectAll(".y.axis .tick text")
                                .attr('class', function(d) {
                                    var c = '';
                                    if (scope.area.indexOf(d) > -1) {
                                        c = 'quarter_selected';
                                    }
                                    return c;
                                });
                        }

                        function unselect_area() {
                            var bars = hGsvg.selectAll(".bar").data(sF);

                            bars.attr('class', function(d) {
                                var c = 'bar';
                                return c;
                            });

                            bars.select("rect.front").transition().duration(scope.transitionDuration)
                                .attr('fill', function(d) {
                                    return segColor(d.key);
                                });

                            hGsvg.selectAll(".y.axis .tick text")
                                .attr('class', function(d) {
                                    var c = '';
                                    return c;
                                });
                        }

                        function bar_mouseover(d, i) {
                            bars.select("rect.front.front_" + i)
                                .attr('fill', function (d) {
                                    if ((scope.area.length && scope.area.indexOf(d.state) === -1) || (scope.active.length && scope.active.indexOf(d.key) === -1)) {
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
                                    if ((scope.area.length && scope.area.indexOf(d.state) === -1) || (scope.active.length && scope.active.indexOf(d.key) === -1)) {
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

                        return hG;
                    }

                    function legend(keys, from) {
                        var len = keys.length;
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
                        var td = tr.selectAll("td").data(keys).enter().append("td");
                        if(from === 'sub'){
                            var div = td.append('div').on(event, sub_legend_click);
                        }else{
                            var div = td.append('div').on(event, legend_click);
                        }

                        td
                            .attr('class', function (e) {
                                if (scope.active.length && scope.active.indexOf(e) === -1 && scope.selectionenabled) {
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

                    var keys = [];
                    var fData = [];

                    //multi-selected sub legends
                    var subKeysForMultiSelect = [];
                    if(scope.active !== undefined && scope.active !== ""){
                        scope.active.forEach(function (k) {
                            if (scope.keys.indexOf(k) < 0) {
                                subKeysForMultiSelect.push(k);
                            }
                        })
                    }

                    data.forEach(function (d) {
                        if (d.quarter !== "DUMMY" && (scope.quarterfilterenabled && scope.quarter.length && scope.quarter.indexOf(d.quarter) === -1)) {
                            return;
                        }
                        var areas = d.areas;
                        areas.forEach(function (e) {
                            var ifAdded = $filter('keyValueInArray')(fData, e.state);
                            if (ifAdded !== -1) {
                                if (scope.selectedsublegend && subKeysForMultiSelect.length) {
                                    var b = {};
                                    for (var sk in subKeysForMultiSelect) {
                                        var skObj = e.sub_freq[subKeysForMultiSelect[sk]];
                                        Object.keys(skObj).map(function (a) {
                                            if (typeof b[a] !== 'undefined') {
                                                b[a] += skObj[a];
                                            } else {
                                                b[a] = skObj[a];
                                            }
                                        })
                                    }
                                } else {
                                    var b = e.freq;
                                }
                                var c = e.lineCount;
                                var c_2 = e.listAmount;
                                 fData[ifAdded].lineCount += c ;
                                 fData[ifAdded].listAmount += c_2;
                                for (var prop in b) {
                                    if (typeof fData[ifAdded].freq[prop] !== 'undefined') {
                                        fData[ifAdded].freq[prop] += b[prop];
                                    } else {
                                        fData[ifAdded].freq[prop] = b[prop];
                                    }
                                }
                            } else {
                                if (scope.selectedsublegend) {
                                    e.freq = e.sub_freq[scope.selectedsublegend];
                                }
                                if (e.freq===undefined) {
                                    return;
                                }
                                fData.push(angular.copy(e));
                            }
                        });
                    });

                    var sub_keys= [];

                    sub_keys = ciscoUtilities.getUniqueKeys(fData, "sub_freq");

                    fData.forEach(function(d) {
                        d.total = 0;
                        for (var prop in d.freq) {
                            d.total += d.freq[prop];
                        }
                    });
                    scope.filtered = fData;
                    if(!scope.checkedstates)
                        scope.checkedstates = [];
                    //added scope variable for expanded view list and net :kd
                    scope.filteredexpandeddata = scope.expandeddata;

                    var tF = fData.map(function(d) {
                        return {
                            state: d.state,
                            freq: data.map(function(t) {
                                return {
                                    key: t.quarter,
                                    value: data.filter(function(f) {
                                        return (f.quarter === t.quarter);
                                    })[0].areas.filter(function(f) {
                                        return (f.state === d.state);
                                    }).map(function(t) {
                                        return objectSum(t.freq);
                                    })[0]
                                };
                            }),
                            total: d.total
                        };
                    });

                    scope.filteredquarter = tF;

                    fData.sort(function(a, b) {
                        return b.total - a.total;
                    });

                    var sF = [];
                    var yColumn = [];
                    fData.forEach(function(d) {
                        var freqKeys = Object.keys(d.freq).sort();
                        if (scope.customorder) {
                            var allCategories = scope.customorder;
                            freqKeys.sort(function(a, b) {
                                return allCategories.indexOf(a) - allCategories.indexOf(b);
                            });
                        }
                        for (var i = 0; i < freqKeys.length; i++) {
                            var prop = freqKeys[i];
                            if (!yColumn[d.state]) {
                                yColumn[d.state] = 0;
                            }
                            if (d.total >= 0) {
                                sF.push({
                                    state: d.state,
                                    stateId: d.stateId,
                                    total: d.total,
                                    key: prop,
                                    start: yColumn[d.state] ? (yColumn[d.state] + 0) : yColumn[d.state],
                                    end: yColumn[d.state] + d.freq[prop],
                                    value: d.freq[prop]
                                });
                                yColumn[d.state] += d.freq[prop];
                            }
                        }
                    });
                    if (scope.viewtype === 'list') {
                        return;
                    }

                    keys = ciscoUtilities.getUniqueKeys(sF, "key");

                    if (scope.customorder) {
                        var allCategories = scope.customorder;
                        keys.sort(function (a, b) {
                            return allCategories.indexOf(a) - allCategories.indexOf(b);
                        });
                    }
                    keys.sort();
                    sub_keys.sort();
                    scope.keys = keys;

                    var flags = [], states = [], l = sF.length, i;
                    for (i = 0; i < l; i++) {
                        if (flags[sF[i].state]) {
                            continue;
                        }
                        flags[sF[i].state] = true;
                        states.push({ state: sF[i].state, total: sF[i].total });
                    }

                    states.forEach(function (a, b) {
                        keys.forEach(function (c, d) {
                            var check = $filter('filter')(sF, { state: a.state, key: c });
                            if (!check.length) {
                                var ind = ciscoUtilities.findWithAttr(sF, 'state', a.state);
                                var obj = {
                                    state: a.state,
                                    total: a.total,
                                    key: c,
                                    start: 0,
                                    end: 0,
                                    value: 0
                                };
                                sF.splice(ind, 0, obj);
                            }
                        });
                    });

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
                    histoGram(sF);
                    //DE145020 Legends turning black- UX integration
                    if(scope.colors){
                        if(keys_length != Object.keys(scope.colors).length && Object.keys(scope.colors).length > 0){
                            for(var i=0;i<keys_length;i++){
                                if(Object.values(scope.colors).indexOf(colors[i]) === -1){
                                    var v = colors[i];
                                }
                                if(Object.keys(scope.colors).indexOf(keys[i]) === -1){
                                    var k = keys[i];
                                }
                                scope.colors[k] = v;
                            }
                        }
                    }
                    legend(keys);
                    if(sub_keys.length){
                        legend(sub_keys, 'sub');
                    }
                    
                };
            }
        };
    }
]);