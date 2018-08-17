/*jshint sub:true*/
'use strict';
angular.module('ciscoExecDashApp').directive('pieChart', [
    '$timeout', '$filter', '$window', '$compile', 'isMobile', 'CiscoUtilities', '$sce', '$rootScope', '$interval',
    function($timeout, $filter, $window, $compile, isMobile, ciscoUtilities, $sce, $rootScope, $interval) {
        return {
            restrict: 'E',
            scope: {
                data: '=',
                colors: '=',
                columns: '=',
                expanded: '=',
                active: '=',
                sidebar: '=',
                keys: '=',
                quarter: '=',
                area: '=',
                selection: '=',
                selectionTitle: '=',
                slug: '=',
                subslug: '=?',
                view: '=',
                colorsOpp: '=',
                pieactivedrill: '=',
                hasSub: '=',
                subarchlabel: '=',
                selectionenabled: '=',
                keyinfo: '=',
                viewtype: '=',
                filtered: '=',
                customorder: '=',
                productfamily: '=',
                filteredproductfamily: '=',
                id: '=',
                selectedsublegend: '=?',
                selectedlegend: '=?'
            },
            link: function(scope, ele, attrs) {
                var doNothingFunc = function() {
                    d3.event.stopPropagation();
                    return;
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
                        'pcNodeName' : JSON.stringify(scope.area)
                    })
                }
                if ((scope.slug !== 'refresh' && scope.slug !== 'ciscoOne')||scope.strictnosub){
                    scope.hasSub = false;
                }
                else{
                    scope.hasSub = true;
                }
                var activeSpcKey = 'sales';
                scope.$on('active-spc-key-selection', function(event, data) {
                    activeSpcKey = data;
                });

                var d3 = $window.d3;
                var event = isMobile ? "touchstart" : "click";
                scope.transitionDuration = 500;
                scope.pieLegendTip = {};
                scope.selectedsublegend = null;
                var ele = $(ele[0]).closest('.tile');
                var exceptionSlug = {
                    "performance": {},
                    "opportunities": {
                        "attach": true,
                        "renew": true
                    }
                };
                var exceptionClicks = ["SWSS Attach Aging"];
                scope.colors = {};

                $timeout(function() {
                    var svg = d3.select(ele[0]).append('svg');
                    var table = d3.select(ele[0]).append('table');
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

                    var groupWatch = scope.$watchGroup(['data', 'productfamily', 'columns', 'expanded', 'sidebar', 'viewtype', 'sldData'], function(newVals, oldVals) {

                        if (scope.sidebar) {
                            $timeout(function() {
                                // scope.colorsOpp = {};
                                scope.render(scope.data);
                            });
                        }
                    }, true);

                    var quarterWatch = scope.$watch('quarter', function(newVals, oldVals) {
                        if (scope.sidebar) {
                            $timeout(function() {
                                scope.render(scope.data);
                            });
                        }
                    }, true);

                    var areaWatch = scope.$watch('area', function(newVals, oldVals) {
                        if (scope.sidebar) {
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

                    scope.$on('$destroy', function() {
                        groupWatch();
                        quarterWatch();
                        areaWatch();
                        subLegendWatch();
                    });

                    function segColor(c) {
                        var constant = $window.ciscoConfig.colorsPalette[$rootScope.dashboard]['constant'][c];
                        if (typeof constant !== 'undefined') {
                            return constant;
                        }
                        var size = Object.keys(scope.colorsOpp).length;
                        if (!scope.colorsOpp[c]) {
                            scope.colorsOpp[c] = colors[size];
                            scope.colors[c] = colors[size];
                        }
                        return scope.colorsOpp[c];
                    }

                    scope.render = function(data2) {
                        scope.filteredproductfamily  = scope.productfamily;
                        svg.selectAll('*').remove();
                        table.selectAll('*').remove();
                        var data;
                        if (scope.slug === 'ciscoOne') {
                            data = [];
                            data.push(data2);
                        } else {
                            data = angular.copy(data2);
                        }
                        
                        if (!data || !data.length) {
                            scope.filtered = [];
                            return;
                        }

                        if (scope.slug==='ciscoOne') {
                            scope.hasSub = false;
                        }

                        function click(d) {
                            if (!scope.selectionenabled) {
                                return;
                            }
                            var type = d.data ? d.data.state : d;
                            if (scope.active.indexOf(type) > -1) {
                                if (d3.event.ctrlKey || d3.event.metaKey) {
                                    scope.active.splice(scope.active.indexOf(type), 1);
                                } else {
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

                            if ((type.slice(0, 1) === "1") || (type.slice(0, 1) === ">") || (type.slice(0, 1) === "<")) {
                                refreshAgingPCData();
                                //tip.show(d);
                            } else {
                                if($rootScope.dashboard === "services"){
                                    refreshServicePCData();
                                } else {
                                        refreshPCData();
                                }
                                //tip.show(d);
                            }
                            if(scope.slug === 'ciscoOne'){
                                 scope.selectedlegend = scope.active;
                            }
                           
                            scope.$apply();
                        }

                        //fix for changing tabs from aging to attach and vice versa .... setting key to null
                        $rootScope.$on('pie-tab-selection',function(event,keyData){
                            if(keyData === true){
                                 scope.active = [];
                            }
                        })

                        function legend_click(d, i) {
                            if(d.data) {
                                var d = d.data.state ? d.data.state : d;
                            }
                            /*tip.hide();*/
                            $('.tooltip').remove();
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
                            /*$(".d3-tip").hide();
                            $(".tooltip").hide();*/
                            $('.tooltip').remove();
                            if (scope.selectedsublegend && scope.selectedsublegend === s && !(d3.event.ctrlKey || d3.event.metaKey)) {
                                scope.selectedsublegend = null;
                                scope.render(data2);
                                scope.active.splice($.inArray(s, scope.active), 1);
                                sub_keys.forEach(function (sub) {
                                    scope.active.push(sub);
                                });
                            }
                            else if (d3.event.ctrlKey || d3.event.metaKey) {
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
                                scope.render(data2);
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

                        function pieChart(pD) {
                            var pieTotal = d3.sum(pD.map(function(t) {
                                return t.total;
                            }));

                            var w = windowWidth > 380 ? ele[0].offsetWidth : 200;
                            var pC = {},
                                pieDim = { w: w, h: 275 };
                            pieDim.r = Math.min(pieDim.w, pieDim.h) / 2.32;
                            var piesvg = svg
                                .attr("width", pieDim.w).attr("height", pieDim.h).append("g")
                                .attr("transform", "translate(" + pieDim.w / 2 + "," + pieDim.h / 2 + ")");
                            var arc = d3.arc().outerRadius(pieDim.r * 0.8).innerRadius(pieDim.r * 0.48);
                            var pie = d3.pie().sort(null).value(function(d) {
                                return d.total;
                            }).padAngle(0.02);

                            window.pieFilter = function(d) {
                                var d = decodeURI(d);

                                click(d);
                            };

                            window.pieSubFilter = function(d) {
                                var d = decodeURI(d);
                                $('.d3-tip').remove();
                                scope.pieactivedrill = d;
                            };

                            window.pieSubFilterLegend = function(d) {
                                scope.pieactivedrill = angular.copy(scope.hoveredLegend);

                            };

                            window.tip = d3.tip()
                                .attr('class', 'd3-tip')
                                .offset([0, 0])
                                .html(function(d) {
                                    var txt = scope.active.length && scope.active.indexOf(d.data.state) > -1 ? 'Unfilter' : "Filter Data";
                                    var h = '<div class="with-cancel1">';
                                    h += "<span style='color:" + segColor(d.data.state) + "'>" + d.data.state + ": $" + $filter('formatValue')(d.value) + "</span>";
                                    if (scope.keyinfo && scope.keyinfo[d.data.state]) {
                                        h += '<span class="keyinfo">' + scope.keyinfo[d.data.state] + '</span>';
                                    }

                                    if (scope.hasSub && !scope.pieactivedrill) {
                                        h += "<i class='tooltip-cancel' onclick='tip.hide()'></i><a href='javascript:void(0);' class='see-sub' onclick=pieSubFilter('" + encodeURI(d.data.state) + "')>" + scope.subarchlabel + "</a>";
                                    }
                                    h += '</div>';

                                    return h;
                                });

                            piesvg.call(tip);

                            var g = piesvg.selectAll(".arc")
                                .data(pie(pD))
                                .enter().append("g")
                                .attr("class", "arc");

                            g.append("path")
                                .attr("class", function(d, i) {
                                    return 'front front_' + i;
                                })
                                .attr("d", arc)
                                .style("fill", function(d) {
                                    if (scope.active.length && scope.active.indexOf(d.data.state) === -1) {
                                        d.data.disabled = true;
                                        return '#ccc';
                                    }
                                    d.data.disabled = false;
                                    return segColor(d.data.state);
                                })
                                .on('mouseover', pie_mouseover)
                                .on('mouseout', pie_mouseout)
                                .on(event, pie_click);
                            //please donot uncomment this function .on('click', pie_click);

                            if (typeof activeWatch !== 'undefined') {
                                activeWatch();
                            }

                            var activeWatch = scope.$watch('active', function(newVals, oldVals) {
                                if (newVals.length) {
                                    mouseover(newVals);
                                    $('.pieFilter').text('Unfilter');
                                } else {
                                    mouseout();
                                    $('.pieFilter').text('Filter Data');
                                }
                            }, true);

                            scope.$on('$destroy', function() {
                                activeWatch();
                            });

                            function mouseover(t) {
                                g.selectAll("path").transition().duration(scope.transitionDuration)
                                    .style("fill", function(e) {
                                        if (scope.active.length && scope.active.indexOf(e.data.state) === -1) {
                                            e.data.disabled = true;
                                            return '#ccc';
                                        }
                                        e.data.disabled = false;
                                        return segColor(e.data.state);
                                    });

                                table.selectAll("td").attr('class', function(e) {
                                    if (scope.active.length && scope.active.indexOf(e) === -1) {
                                        return 'disabled';
                                    }
                                    return '';
                                });
                            }

                            function mouseout() {
                                if(scope.selection === "SWSS Attach Aging"){
                                    scope.$apply(function () {
                                        g.selectAll("path").transition().duration(scope.transitionDuration)
                                        .style("fill", function (e) {
                                            e.data.disabled = false;
                                            return segColor(e.data.state);
                                        });

                                        table.selectAll("td").attr('class', function (e) {
                                            return '';
                                        });
                                    });
                                }else{
                                    g.selectAll("path").transition().duration(scope.transitionDuration)
                                    .style("fill", function (e) {
                                        e.data.disabled = false;
                                        return segColor(e.data.state);
                                    });

                                    table.selectAll("td").attr('class', function (e) {
                                        return '';
                                    }); 
                                }                                
                            }

                            function pie_mouseover(d, i) {
                                g.select("path.front.front_" + i)
                                    .style('fill', function(e) {
                                        if (e.data.disabled) {
                                            return segColor(e.data.state);
                                        }
                                        return $filter('darken')(segColor(e.data.state));
                                    });
                                if (typeof pieTipInterval !== 'undefined') {
                                    $interval.cancel(pieTipInterval);
                                }
                                //hide tooltip on zoom in/out
                                $(window).resize(function () {
                                    tip.hide(d);
                                });
                                tip.show(d);
                            }

                            function pie_mouseout(d, i) {
                                g.select("path.front.front_" + i)
                                    .style('fill', function(e) {
                                        if (e.data.disabled) {
                                            return '#ccc';
                                        }
                                        return segColor(e.data.state);
                                    });

                                    window.pieTipInterval = $interval(function() {
                                        if (!$(':hover').last().closest('.d3-tip').length) {
                                            tip.hide(d);
                                            $interval.cancel(pieTipInterval);
                                        }
                                    }, 500);


                                if (scope.slug !== 'refresh' && scope.slug !== "ciscoOne") {
                                    tip.hide(d);
                                }
                                //hide tooltip on zoom in/out
                                $(window).resize(function () {
                                    tip.hide(d);
                                });
                            }

                            function pie_click(d, i) {
                                legend_click(d, i);
                            }

                            g.append("text")
                                .text(function(d) {
                                    if (((d.value / pieTotal) * 100) < 2.5) {
                                        return '';
                                    }
                                    return $filter('formatValue')(d.value);
                                })
                                .attr("transform", function(d) {
                                    var c = arc.centroid(d),
                                        x = c[0],
                                        y = c[1],
                                        h = Math.sqrt(x * x + y * y);
                                    if (!h) {
                                        return "translate(0,0)";
                                    }
                                    return "translate(" + (x / h * (pieDim.r - 15)) + ',' +
                                        (y / h * (pieDim.r - 10)) + ")";
                                })
                                .attr("dy", function(d) {
                                    return 0.35 + "em";
                                })
                                .attr("text-anchor", function(d, i) {
                                    return ((d.endAngle + d.startAngle) / 2 > Math.PI) ?
                                        "end" : "start";
                                })
                                .style('font-size', '11px')
                                .on(event, doNothingFunc);

                            piesvg.append("text")
                                .attr("text-anchor", "middle")
                                .style('font-size', '18px')
                                .attr("dy", "0.4em")
                                .text('$' + $filter('formatValue')(pieTotal));

                            return pC;
                        }

                        function legend(lD, from) {
                            var len = lD.length;
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
                            if(from && from === 'sub'){
                                var td = tr.selectAll("td").data(lD).enter().append("td").append('div').on(event, sub_legend_click);
                            }else{
                                var td = tr.selectAll("td").data(lD).enter().append("td").append('div').on(event, legend_click);
                            }
                            td
                                .attr('class', function (e) {
                                    if (scope.active.length && scope.active.indexOf(e) === -1) {
                                        return 'disabled';
                                    }
                                    return '';
                                })
                                .attr('uib-tooltip-template', function(d) {
                                    if (scope.hasSub) {
                                        return "'templates/pop.html'";
                                    }
                                    return '';
                                })
                                .attr('uib-tooltip', function(d) {
                                    if (scope.hasSub) {
                                        return '';
                                    }
                                    return d;
                                })
                                .attr('tooltip-trigger', function() {
                                    if (scope.hasSub) {
                                        return 'none';
                                    } else {
                                        return 'mouseenter';
                                    }
                                })
                                .attr('tooltip-append-to-body', 'true')

                            .attr('tooltip-animation', 'false')
                                .attr('tooltip-placement', 'top')
                                .attr('tooltip-is-open', function(d) {
                                    return 'pieLegendTip["' + d + '"]';
                                })
                                .on('mouseover', function(d) {
                                    tip.hide();
                                    if (!scope.hasSub) {
                                        return;
                                    }
                                    if (typeof pieLegendInterval !== 'undefined') {
                                        $interval.cancel(pieLegendInterval);
                                    }
                                    scope.$apply(function() {
                                        scope.pieLegendTip = {};
                                        scope.hoveredLegend = d;
                                        scope.pieLegendTip[d] = true;
                                    });
                                })
                                .on('mouseout', function(d) {
                                    $('.tooltip').remove();
                                    if (!scope.hasSub) {
                                        return;
                                    }
                                    window.pieLegendInterval = $interval(function(x) {
                                        if (!$(':hover').last().closest('.tooltip').length) {
                                            scope.pieLegendTip[x] = false;
                                            $interval.cancel(pieLegendInterval);
                                        }
                                    }, 1000, 0, true, d);
                                });

                            td.append("svg").attr("width", '8').attr("height", '8').append("rect")
                                .attr("width", '8').attr("height", '8')
                                .attr("fill", function(d) {
                                    return segColor(d);
                                });
                            td.append('text')
                                .text(function(d) {
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

                        data.forEach(function(d) {
                            if (d === undefined) {
                                return;
                            }
                            if (scope.quarter.length && scope.quarter.indexOf(d.quarter) === -1) {
                                return;
                            }
                            var o = {};
                            o.state = d.quarter;
                            o.freq = {};
                            o.sub_freq = {};
                            var areas = d.areas;
                            areas.forEach(function(e) {
                                if (($rootScope.dashboard != "services") && (scope.area.length && (scope.area.indexOf(e.state) === -1 && activeSpcKey === "sales"))) {
                                    return;
                                }
                                var b = e.freq;
                                for (var prop in b) {
                                    if (typeof o.freq[prop] !== 'undefined') {
                                        o.freq[prop] += b[prop];
                                    } else {
                                        o.freq[prop] = b[prop];
                                    }
                                }
                                var y = e.sub_freq;
                                for (var subObj in y) {
                                    if(typeof o.sub_freq[subObj] === 'undefined'){
                                        o.sub_freq[subObj] = {};
                                        for(var sub in y[subObj]){
                                            if(typeof o.sub_freq[subObj][sub] === 'undefined'){
                                                o.sub_freq[subObj][sub] = {};
                                                o.sub_freq[subObj][sub] = y[subObj][sub];
                                            }
                                        }
                                    }else{
                                        for(var sub in y[subObj]){
                                            if(typeof o.sub_freq[subObj][sub] !== 'undefined'){
                                                o.sub_freq[subObj][sub] += y[subObj][sub];
                                            }
                                        }
                                    }
                                }
                            });
                            // areas.forEach(function (f) {
                            //     if (($rootScope.dashboard != "services") && (scope.area.length && (scope.area.indexOf(e.state) === -1 && activeSpcKey === "sales"))) {
                            //         return;
                            //     }
                            //     var c = f.sub_freq; 
                            //     for (var prop in c) {
                            //         var subObj = c[prop];
                            //         if (typeof o.sub_freq[prop] !== 'undefined') {
                            //             //do nothing
                            //         } else {
                            //             o.sub_freq[prop] = subObj;
                            //         }
                            //         for (var prop1 in subObj) {
                            //             if (typeof o.sub_freq[prop][prop1] !== 'undefined') {
                            //                 if (o.sub_freq[prop][prop1] === subObj[prop1]) {
                            //                     // do nothing
                            //                 } else {
                            //                     o.sub_freq[prop][prop1] += subObj[prop1];
                            //                 }
                            //             } 
                            //         }
                            //     }
                            // });
                            fData.push(o);
                        });

                        keys = ciscoUtilities.getUniqueKeys(fData, "freq");

                        sub_keys = ciscoUtilities.getUniqueKeys(fData, "sub_freq");

                        if (scope.customorder) {
                            var allCategories = scope.customorder;
                            keys.sort(function (a, b) {
                                return allCategories.indexOf(a) - allCategories.indexOf(b);
                             });
                        }
                        keys.sort();
                        sub_keys.sort();
                        scope.keys = keys;
                        var keys_length = keys.length;

                        // Reset colorsOpp for architecture / aging switch
                    //    if(scope.selection === "SWSS Attach by Architecture" || scope.selection === "SWSS Attach Aging"){
                    //        scope.colorsOpp = {};
                    //    }

                        var colors_p;
                        if (keys_length <= 3) {
                           if(scope.slug === 'ciscoOne'){
                                colors_p = 'colors_3_co';
                            }else{
                                colors_p = 'colors_3';
                            }
                        } else if (keys_length <= 6) {
                            if(scope.slug === 'ciscoOne'){
                                colors_p = 'colors_3_co';
                            }else{
                                colors_p = 'colors_6';
                            }
                        }else if (keys_length <= 13) {
                            colors_p = 'colors';
                        } else {
                            colors_p = 'colors_more';
                        } 


                        colors = colors_theme[colors_p];

                        var tF = keys.map(function (d) {
                            return {
                                state: d, freq: fData.map(function (t) {
                                    return { key: t.state, value: t.freq[d] };
                                }), total: d3.sum(fData.map(function (t) {
                                    return t.freq[d];
                                }))
                            };
                        });

                        //multi-selected sub legends
                        var subKeysForMultiSelect = [];
                        if(scope.active !== ""){
                            scope.active.forEach(function (k) {
                                if (keys.indexOf(k) < 0) {
                                    subKeysForMultiSelect.push(k);
                                }
                            })
                        }

                        if(scope.selectedsublegend){
                            var tF = keys.map(function (d) {
                                return {
                                    state: d, freq: fData.map(function (t) {
                                        if (t.sub_freq[scope.selectedsublegend]===undefined) {
                                            return;
                                        } else {
                                            var totalSubKeyValueForState = 0;
                                            for (var sk in subKeysForMultiSelect) {
                                                if(t.sub_freq[subKeysForMultiSelect[sk]] !== undefined){
                                                    totalSubKeyValueForState += t.sub_freq[subKeysForMultiSelect[sk]][d]
                                                }
                                            }
                                            return { 
                                            key: t.state,
                                            value: totalSubKeyValueForState
                                            };
                                        }
                                    }), total: d3.sum(fData.map(function (t) {
                                        if (t.sub_freq[scope.selectedsublegend]===undefined) {
                                            return;
                                        } else {
                                            var totalSubKeyValue = 0;
                                            for (var sk in subKeysForMultiSelect) {
                                                if(t.sub_freq[subKeysForMultiSelect[sk]] !== undefined){
                                                    totalSubKeyValue += t.sub_freq[subKeysForMultiSelect[sk]][d]
                                                }
                                            }
                                            return totalSubKeyValue;
                                        }
                                    }))
                                };
                            });
                        }

                        scope.filtered = tF;

                        pieChart(tF);
                        legend(keys);
                        if(scope.slug === 'ciscoOne'){
                            legend(sub_keys, 'sub');
                        }

                    };

                });

            }
        };
    }
]);