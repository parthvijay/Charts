/*jshint sub:true*/
'use strict';
angular.module('ciscoExecDashApp').directive('barChart', [
    '$timeout',
     '$filter',
     '$window',
     'isMobile',
     '$compile',
     'CiscoUtilities',
     '$rootScope',
        function ($timeout, $filter, $window, isMobile, $compile, ciscoUtilities, $rootScope) {
        return {
            restrict: 'E',
            scope: {
                data: '=',
                colors: '=',
                columns: '=',
                expanded: '=',
                sidebar: '=',
                percent:"=",
                viewtype: '=',
                filtered: '=',
                keys: '=',
                slug: '=',
                view: '=',
                subslug: '=',
                currentquarter: '=',
                currentmonth: '=',
                currentyear: '=',
                hasSub: '=',
                pieactivedrill: '=',
                selectionTitle: '=',
                selectedquarter: '=',
                uniquekey: '=',
                activecategory: '=',
                rotateXaxisText: '=?',
                selectedCorporateMonth: '=?',
                reloadListViewData: '=?'
            },
            link: function (scope, ele, attrs) {
                var d3 = $window.d3;
                var event = isMobile ? "touchstart" : "click";
                var ele = $(ele[0]).closest('.tile');
                        ele.find('svg, table').remove();

                var svg = d3.select(ele[0])
                        .append('svg');

                var table = d3.select(ele[0])
                        .append('table');
                if ($rootScope.dashboard === "services") {
                    scope.slug = scope.slug + "_" + scope.subslug;
                }

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
                //US114004
              /*  function setDefaultView() {
                    show = scope.columns;
                    show = show < scope.data.length ? show : scope.data.length;
                    start = 0;
                    start_max = scope.data.length - show;
                    data = [];
                    start = ciscoUtilities.getStartingIndex(scope.data, scope.view, scope.slug, scope.selection || scope.selectionTitle, show);
                    data = scope.data.slice(start, show + start);
                }
*/
                $window.addEventListener('resize', function (event) {
                    $timeout(function () {
                        if ($(window).width() !== windowWidth) {
                            windowWidth = $(window).width();
                            //US114004
                            //setDefaultView();
                            scope.render(scope.data);
                        }
                    });
                });

                var groupWatch = scope.$watchGroup(['data', 'columns', 'expanded', 'sidebar', 'viewtype'], function (newVals, oldVals) {
                    if (newVals && scope.sidebar) {
                        if (!scope.data) {
                            return;
                        }
                        if (scope.sidebar) {
                            $timeout(function () {
                               /* start = 0;
                                start_max = 0; */
                                //US114004
                                //setDefaultView();
                                scope.render(scope.data);
                            });
                        }
                    }
                }, true);

                scope.$on('$destroy', function () {
                    groupWatch();
                });

                 var expandWatch = scope.$watch('expanded', function (newVals, oldVals) {
                   /* start = 0;
                    start_max = 0; */
                    $timeout(function () {
                        //US114004
                        //setDefaultView();
                        scope.render(scope.data);
                    }, 20);
                }, true);

                var selectedCorporateMonthWatch = scope.$watch('selectedCorporateMonth', function (newVals, oldVals) {
                    $timeout(function () {
                        scope.reloadListViewData;
                        scope.render(scope.data);
                    });
                }, true);

                scope.$on('$destroy', function () {
                    groupWatch();
                    expandWatch();
                    selectedCorporateMonthWatch();
                });

                function segColor(c) {
                    var constant = $window.ciscoConfig.colorsPalette[$rootScope.dashboard]['constant'][c];
                    if (typeof constant !== 'undefined') {
                        return constant;
                    }
                    var size = Object.keys(scope.colorsOpp).length;
                    if (!scope.colorsOpp[c]) {
                        scope.colorsOpp[c] = colors[size];
                    }
                    return scope.colorsOpp[c];
                }

                function moveLeft() {
                    if (start === 0)
                        return;
                    start--;                    
                    scope.render(scope.data);
                }

                function moveRight() {
                    if (start === start_max)
                        return;
                    start++;                    
                    scope.render(scope.data);
                }

                scope.render = function (data2) {
                    svg.selectAll('*').remove();
                    table.selectAll('*').remove();
                    scope.colorsOpp = {};

                    var data = angular.copy(data2);
                    if (!data || !data.length) {
                        scope.filtered = [];
                        return;
                    }                    

                    function histoGram(fD) {
                        var hG = {}, hGDim = {t: 10, r: 0, b: 30, l: 30};
                        hGDim.w = (ele[0].offsetWidth) - hGDim.l - hGDim.r,
                                hGDim.h = 275 - hGDim.t - hGDim.b;
                        var hGsvg = svg
                                .attr("width", hGDim.w + hGDim.l + hGDim.r)
                                .attr("height", hGDim.h + hGDim.t + hGDim.b).append("g")
                                .attr("transform", "translate(" + hGDim.l + "," + hGDim.t + ")");
                        var x = d3.scaleBand().range([0, hGDim.w])
                                .domain(fD.map(function (d) {
                                    return d.state;
                                }));
                        var xAxis = d3.axisBottom(x)
                                .tickPadding(8);

                        hGsvg.append("g").attr("class", "x axis")
                            .attr("transform", "translate(0," + hGDim.h + ")")
                            .call(xAxis);

                        if(scope.rotateXaxisText){
                            var tip_name = d3.tip()
                                .attr('class', 'd3-tip')
                                .offset([-20, 0])
                                .html(function (d) {
                                    return d;
                                });

                            hGsvg.call(tip_name);

                            hGsvg.selectAll(".x.axis .tick text")
                                .style("text-anchor", "end")
                                .attr("dx", "-.8em")
                                .attr("dy", ".15em")
                                .attr("y","6")
                                .attr("transform", "rotate(-45)" )
                                .call(d3_wrap, x.bandwidth(), scope.selectionTitle);

                            hGsvg.selectAll(".x.axis .tick text")
                                .style("cursor", "pointer")
                                .on('mouseover', tip_name.show)
                                .on('mouseout', tip_name.hide);
                        }else{
                            hGsvg.selectAll(".x.axis .tick text")
                                .call(d3_wrap, x.bandwidth(), scope.selectionTitle);
                        }

                        if(scope.selectionTitle === 'In Quarter Renewal Rate'){
                            hGsvg.selectAll(".x.axis .tick text")
                                .style("cursor", "pointer")
                                .on(event, function (d) {
                                    var from = 'q';
                                    bar_click(d, from);
                                });
                        }

                        var y = d3.scaleLinear().range([hGDim.h, 0]);

                        var max = d3.max(fD, function (d) {
                            return d.total;
                        });

                        var max_target = 0;
                        max_target = d3.max(fD, function (d) {
                            return d.target;
                        });

                        if(typeof max_target == 'undefined'){
                            max_target = max;
                        }
                        
                        max = Math.max(max, max_target);
                        max = Math.ceil(max / 10) * 10 + 10;

                        //getting min value
                        var min = d3.min(fD, function (d) {
                            return d.total;
                        });

                        var min_target = 0;
                        min_target = d3.min(fD, function (d) {
                            return d.target;
                        });

                        if (typeof min_target == 'undefined') {
                            min_target = min;
                        }

                        min = Math.min(min, min_target);

                        //getting the value of min nearest to tenth
                        min = parseInt(min / 10) * 10;

                        if (min >= 10) {
                            min = min - 10;
                        } else if (min < 0) {
                            min = 0;
                        }
                        //For charts with dollar values
                        if(scope.selectionTitle.indexOf("Rate") < 0){
                            min = 0;
                        }

                        y.domain([min, max]).nice();
                      
                        var yAxis = d3.axisLeft(y)
                                .tickFormat(function (d) {
                                return $filter('formatValue')(d, false, scope.percent);
                            }).ticks(8)
                                        .tickSize(-hGDim.w);

                        var tip = d3.tip()
                            .attr('class', 'd3-tip')
                            .offset([-10, 0])
                            .html(function (d) {
                                if (scope.uniquekey == 'corporate_attach_rate' && scope.activecategory === 0) {
                                    var color = !d.growth ? 'transparent' : (d.growth < 0 ? '#c82439' : '#4aa44c');
                                    if (typeof (d.target) === 'undefined') {
                                        return "<strong>" + d.state + "</strong><span style='color:" + segColor(d.key) + "'>" + d.key + ": " + $filter('formatValue')(d.value, true, true) + "</span>" + "<span style='color:" + color + "'>YOY: " + Math.abs(d.growth).toFixed(2) + '%' + "</span>";
                                    } else {
                                        return "<strong>" + d.state + "</strong><span style='color:" + segColor(d.key) + "'>" + d.key + ": " + $filter('formatValue')(d.value, true, true) + "</span><span>Target: " + $filter('formatValue')(d.target, true, true) + "</span>" + "<span style='color:" + color + "'>YOY: " + Math.abs(d.growth).toFixed(2) + '%' + "</span>";
                                    }
                                } else if (scope.selectionTitle === 'In Quarter Renewal Rate') {
                                    var color = !d.growth ? 'transparent' : (d.growth < 0 ? '#c82439' : '#4aa44c');
                                    return "<strong>" + d.state + "</strong><span style='color:" + segColor(d.key) + "'>" + "Current Year RR" + ": " + $filter('formatValue')(d.value, true, true) + "</span><span>Previous Year RR: " + $filter('formatValue')(d.previousRR['Renewal Rate'], true, true) + "</span><span style='color:" + color + "'>YOY: " + Math.abs(d.growth).toFixed(2) + '%' + "</span>";
                                } else if(d.growth){
                                    var color = !d.growth ? 'transparent' : (d.growth < 0 ? '#c82439' : '#4aa44c');
                                    return "<strong>" + d.state + "</strong><span style='color:" + segColor(d.key) + "'>" + d.key + ": " + $filter('formatValue')(d.value,true, true) + "</span>" + "<span style='color:" + color + "'>YOY: " + Math.abs(d.growth).toFixed(2) + '%' + "</span>";
                                }
                                else {
                                    return "<strong>" + d.state + "</strong><span style='color:" + segColor(d.key) + "'>" + d.key + ": $" + $filter('formatValue')(d.value) + "</span>";
                                }
                            });

                        var tip_growth = d3.tip()
                            .attr('class', 'd3-tip')
                            .offset([-20, 0])
                            .html(function (d) {
                                var color = !d.growth ? 'transparent' : (d.growth < 0 ? '#c82439' : '#4aa44c');
                                var text = "<span style='color:" + color + "'>" + Math.abs(d.growth).toFixed(2) + '%' + "</span>";
                                return text;
                            });

                        hGsvg.call(tip);
                        hGsvg.call(tip_growth);

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

                        // bars.append("rect").attr('class', 'back')
                        //     .attr("x", function (d) {
                        //         return x(d.state) + (x.bandwidth() - 20) / 2;
                        //     })
                        //     .attr("y", function (d) {
                        //         return 0;
                        //     })
                        //     .attr("width", 20)
                        //     .attr("height", function (d) {
                        //         return y(d.total) > 0 ? y(d.total) : 0;
                        //     })
                        //     .attr('fill', function (d) {
                        //         return '#EDEEF1';
                        //     });

                        bars.append("rect")
                            .attr("class", function (d, i) {
                                return 'front front_' + i;
                            })
                            .attr("x", function (d) {
                                return x(d.state) + (x.bandwidth() - 20) / 2;
                            })
                            .attr("y", function (d) {
                                return y(d.end);
                            })
                            .attr("height", function (d) {
                                //For removing the gap between the bar and x axis
                                var val = y(d.start) - y(d.end);
                                return val > 0 ? val : 0;
                            })
                            .attr("width", 20)
                            .attr('fill', function (d) {
                                return segColor(d.key);
                            })
                            .on('mouseover', bar_mouseover)
                            .on('mouseout', bar_mouseout)
                            .on(event, bar_click);

                        bars.append("line")
                            .attr("x1", function (d) {
                                if (d.target == null)
                                    return x(null);
                                return x(d.state) + (x.bandwidth() - 20) / 2 - 5;
                            })
                            .attr("y1", function (d) {
                                if (d.target == null)
                                    return y(null);
                                return y(d.target);
                            })
                            .attr("x2", function (d) {
                                if (d.target == null)
                                    return x(null);
                                return x(d.state) + (x.bandwidth() - 20) / 2 + 25;
                            })
                            .attr("y2", function (d) {
                                if (d.target == null)
                                    return y(null);
                                return y(d.target);
                            })
                            .attr("stroke-width", 2)
                            .attr('stroke', function (d) {
                                return segColor("Target");
                            })


                        function bar_mouseover(d, i) {
                            bars.select("rect.front.front_" + i)
                                .attr('fill', function (d) {
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
                                    return segColor(d.key);
                                });
                            //hide tooltip on zoom in/out
                            $(window).resize(function () {
                                tip.hide(d);
                            });
                            tip.hide(d);
                        }

                        function bar_click(d, from) {
                            if (scope.hasSub) {
                                scope.pieactivedrill = scope.selectionTitle;
                                scope.$emit('drill-quarter-rate', {});
                                from === 'q' ? scope.selectedquarter = d : scope.selectedquarter = d.state;
                            }
                        }

                        if (start !== 0) {
                            hGsvg.append("svg:image")
                                .attr("transform", "translate(0," + hGDim.h + ")")
                                .attr('class', 'arrow-left')
                                .attr("x", function () {
                                    return -25;
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
                                .attr("transform", "translate(" + hGDim.w + "," + hGDim.h + ")")
                                .attr('class', 'arrow-right')
                                .attr("x", function () {
                                    return 0;
                                })
                                .attr("y", function () {
                                    return 10;
                                })
                                .attr('width', 20)
                                .attr('height', 20)
                                .attr("xlink:href", "images/arrow-right.svg")
                                .on(event, moveRight);
                        }

                        //                    bars.select("rect.front").transition().duration(500)
                        //                            .attr("height", function (d) {
                        //                                var m = d.start ? 2 : 0;
                        //                                var val = y(d.start) - y(d.end) - m;
                        //                                return val > 0 ? val : 0;
                        //                            });

                        // bars.append("text")
                        //     .text(function (d) {
                        //         if (!d.growth) {
                        //             return '';
                        //         }
                        //         return Math.abs(d.growth) + '%';
                        //     })
                        //     .style("fill", function (d) {
                        //         var color = !d.growth ? 'transparent' : (d.growth < 0 ? '#c82439' : '#4aa44c');
                        //         return color;
                        //     })
                        //     .attr("x", function (d) {
                        //         return x(d.state) + (x.bandwidth() - 10) / 2;
                        //     })
                        //     .attr("y", function (d) {
                        //         return y(d.value) - 15;
                        //     });

                        var triangle = d3.symbol()
                            .type(d3.symbolTriangle)
                            .size(25);

                        bars.append("path")
                            .attr("d", triangle)
                            .attr("stroke", function (d) {
                                var color = !d.growth ? 'transparent' : (d.growth < 0 ? '#c82439' : '#4aa44c');
                                return color;
                            })
                            .attr("fill", function (d) {
                                var color = !d.growth ? 'transparent' : (d.growth < 0 ? '#c82439' : '#4aa44c');
                                return color;
                            })
                            .attr("transform", function (d) {
                                var m = x(d.state) + (x.bandwidth()) / 2
                                var rotate = d.growth < 0 ? 'rotate(180)' : '';
                                return "translate(" + (m) + "," + (y(d.value) - 8) + ") " + rotate;
                            })
                            .on('mouseover', tip_growth.show)
                            .on('mouseout', tip_growth.hide);

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

                        if (scope.selectionTitle != 'Corporate 15/12 Attach Rate' && scope.currentquarter && typeof x(scope.currentquarter) !== 'undefined') {
                            showCurrent(scope.currentquarter);
                        }

                        if (scope.selectionTitle != 'Corporate 15/12 Attach Rate' && scope.currentmonth && typeof x(scope.currentmonth) !== 'undefined') {
                            showCurrent(scope.currentmonth);
                        }

                        if (scope.selectionTitle != 'Corporate 15/12 Attach Rate' && scope.currentyear && typeof x(scope.currentyear) !== 'undefined') {
                            showCurrent(scope.currentyear);
                        }

                        return hG;
                    }

                    function legend(lD) {
                        var len = lD.length;
                        var legendClass = '';
                        if (len > 3) {
                            legendClass = 'threePlus';
                        }
                        else if (len === 3) {
                            legendClass = 'three';
                        }
                        else if (len === 2) {
                            legendClass = 'two';
                        }
                        else if (len === 1) {
                            legendClass = 'one';
                        }
                        var legend = table.attr('class', 'legend ' + legendClass);
                        var tr = legend.append("tbody").append('tr');
                        var td = tr.selectAll("td").data(lD).enter().append("td").append('div');
                        td.attr('class', function (e) {
                            if (scope.active && e !== scope.active) {
                                return 'disabled';
                            }
                            return '';
                        })
                        .attr('uib-tooltip', function (d) {
                            return d;
                        })
                        .attr('tooltip-append-to-body', 'true');

                        td.append("svg").attr("width", '8').attr("height", '8').append("rect")
                            .attr("width", '8').attr("height", '8')
                            .attr("fill", function (d) {
                                return segColor(d);
                            });
                        td.append('text')
                            .text(function (d) {
                                return d;
                            });

                        $compile(ele.children('table'))(scope);
                    }

                    var fData = [];
                    var keys = [];
                    var fullData = angular.copy(scope.data);
                    //filter data for selected corporate month
                    fullData.forEach(function (a, b) {
                        if(!a.quarter){
                            fData = angular.copy(scope.data);
                        } else if(a.quarter.indexOf(scope.selectedCorporateMonth) > -1){
                            fData = a.areas;
                        }
                    });
                    var show = scope.columns < fData.length ? scope.columns : fData.length;
                    show <= scope.columns ? start = 0 : start;
                    start_max = fData.length - show;
                    fData = fData.slice(start, start + show);
                    var cData = fData;

                    fData.forEach(function (d) {
                        d.total = 0;
                        if (scope.uniquekey != 'corporate_attach_rate') {
                            for (var prop in d.freq) {
                                d.total += d.freq[prop];
                            }
                        }
                    });

                    cData.forEach(function (d) {
                        d.total = 0;
                        for (var prop in d.freq) {
                            d.total += d.freq[prop];
                        }
                    });

                    if (fData.length) {
                        for (var prop in fData[0].freq) {
                            keys.push(prop);
                        }
                    }

                    keys.sort();

                    scope.keys = keys;

                    var keys_length = keys.length;
                    var colors_p;
                    if (scope.uniquekey == 'corporate_attach_rate' && scope.activecategory === 0) {
                        colors_p = 'colors_corporate_target';
                    } else if (keys_length <= 3) {
                        colors_p = 'colors_3';
                    }
                    else if (keys_length <= 6) {
                        colors_p = 'colors_6';
                    }
                    else if (keys_length <= 13) {
                        colors_p = 'colors';
                    } else {
                        colors_p = 'colors_more';
                    }

                    colors = colors_theme[colors_p];

                    var tF = keys.map(function (d) {
                        return {
                            state: d, freq: cData.map(function (t) {
                                if(t.freq && t.freq[d]){
                                    return{
                                        key: t.state, 
                                        value: t.freq[d] 
                                       };
                                }
                          }), total: d3.sum(cData.map(function (t) {
                              if(t.freq && t.freq[d]){
                                   return t.freq[d];
                              }
                            }))
                        };
                    });

                    scope.filtered = cData;
                    //getting min value
                    var min = d3.min(fData, function (d) {
                        return d.total;
                    });

                    var min_target = 0;
                    min_target = d3.min(fData, function (d) {
                        return d.target;
                    });

                    if (typeof min_target == 'undefined') {
                        min_target = min;
                    }

                    min = Math.min(min, min_target);

                    //getting the value of min nearest to tenth
                    min = parseInt(min / 10) * 10;

                    if (min >= 10) {
                        min = min - 10;
                    } else if (min < 0) {
                        min = 0;
                    }

                    //For charts with dollar values
                    if(scope.selectionTitle.indexOf("Rate") < 0){
                        min = 0;
                    }
                    var newarray = [];
                    var yColumn = [];

                    fData.forEach(function (d) {
                        for (var prop in  d.freq) {
                            if (!yColumn[d.state]) {
                                yColumn[d.state] = min;
                            }
                            var target;
                            if (d.target>0) {
                                target = d.target;
                            }
                            newarray.push({
                                state: d.state,
                                total: d.total,
                                key: prop,
                                start: yColumn[d.state] ? (yColumn[d.state] + 0) : yColumn[d.state],
                                end:  d.freq[prop],
                                value: d.freq[prop],
                                growth: (scope.uniquekey == 'corporate_attach_rate') ? (d.growth ? d.growth : d.growthRate) : (d.growth ? d.growth[prop] : 0),
                                previousRR: (scope.selectionTitle === 'In Quarter Renewal Rate') ? d.previousYear : (d.previousYear ? d.previousYear[prop] : 0),
                                target: (scope.uniquekey !== 'corporate_attach_rate')? d.target : null
                            });
                            yColumn[d.state] += d.freq[prop];
                        }

                    });              

                    keys = ciscoUtilities.getUniqueKeys(newarray, "key");
                    keys.sort();
                    histoGram(newarray);
                    var legendKeys = angular.copy(keys);
                    if (scope.uniquekey == 'corporate_attach_rate' && scope.activecategory === 0)
                        legendKeys.push("Target");
                    legend(legendKeys);
                };
            }
        };
    }
]);