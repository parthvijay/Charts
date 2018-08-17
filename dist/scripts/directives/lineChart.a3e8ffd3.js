/*jshint sub:true*/
'use strict';
angular.module('ciscoExecDashApp').directive('lineChart', [
    '$timeout',
     '$filter',
     '$window',
     '$compile',
     'isMobile',
     'CiscoUtilities',
      '$rootScope',
            function ($timeout, $filter, $window, $compile, isMobile, ciscoUtilities, $rootScope) {
        return {
            restrict: 'E',
            scope: {
                data: '=',
                colors: '=',
                columns: '=',
                expanded: '=',
                sidebar: '=',
                slug: '=',
                view: '=',
                selection: '=',
                selectionTitle: '=',
                percent: '=',
                currentquarter: '=',
                currentmonth: '=',
                currentyear: '=',
                viewtype: '=',
                filtered: '=',
                keys: '=',
                selectedCorporateMonth: '=?',
                showyoy: '=?',
                subslug: '='
            },
            link: function (scope, ele, attrs) {
                var d3 = $window.d3;
                var event = isMobile ? "touchstart" : "click";
                var ele = $(ele[0]).closest('.tile');
                ele.find('svg, table').remove();

                var svg = d3.select(ele[0]).append('svg');
                var table = d3.select(ele[0]).append('table');

                if (scope.data === undefined) {
                    return;
                }
                if ($rootScope.dashboard === "services") {
                    scope.slug = scope.slug + "_" + scope.subslug;
                }
                var start = 0;
                var start_max = 0;
                var data = [];
                var show = scope.columns;
                show = show < scope.data.length ? show : scope.data.length;
                start = ciscoUtilities.getStartingIndex(scope.data, scope.view, scope.slug, scope.selection || scope.selectionTitle, show);
                if ((scope.subslug === 'ts')|| (scope.subslug ==='swss')){
                data = scope.data.slice(start, show + start);
                }
                var colors_theme = $window.ciscoConfig.colorsPalette[$rootScope.dashboard];
                var colors;
                var windowWidth = $(window).width();
                
                scope.activeLegend = [];
                $window.addEventListener('resize', function (event) {
                    $timeout(function () {
                        if ($(window).width() !== windowWidth) {
                            windowWidth = $(window).width();
                            scope.render(scope.data);
                        }
                    });
                });

                /*var groupWatch = scope.$watchGroup(['data', 'columns', 'expanded', 'sidebar', 'viewtype'], function (newVals, oldVals) {
                    if (newVals && scope.sidebar) {
                        if (!scope.data) {
                            return;
                        }
                        start = 0;
                        start_max = 0;
                        if (scope.sidebar) {
                            $timeout(function () {
                                start = 0;
                                show = scope.columns;
                                show = show < scope.data.length ? show : scope.data.length;
                                start = 0;
                                start_max = scope.data.length - show;
                                start = ciscoUtilities.getStartingIndex(scope.data, scope.view, scope.slug, scope.selection || scope.selectionTitle, show);
                                scope.render(scope.data);
                            });
                        }
                    }
                }, true);*/
               /* function setDefaultView() {
                    show = scope.columns;
                    show = show < scope.data.length ? show : scope.data.length;
                    start = 0;
                    start_max = scope.data.length - show;
                    data = [];
                    start = ciscoUtilities.getStartingIndex(scope.data, scope.view, scope.slug, scope.selection || scope.selectionTitle, show);
                    data = scope.data.slice(start, show + start);
                }
*/
                var groupWatch = scope.$watchGroup(['data', 'columns', 'viewtype'], function (newVals, oldVals) {
                    if (newVals && scope.sidebar) {
                        if (!scope.data) {
                            return;
                        }
                        //start = 0;
                        //start_max = 0;
                        if (scope.sidebar) {
                        $timeout(function () {
                            //US114004
                            //setDefaultView();
                            scope.render(scope.data);
                        });
                    }
                }
                }, true);

                var expandWatch = scope.$watch('expanded', function (newVals, oldVals) {
                    //start = 0;
                    //start_max = 0;
                    $timeout(function () {
                        //US114004
                       // setDefaultView();
                        scope.render(scope.data);
                    }, 20);
                }, true);

                var selectedCorporateMonthWatch = scope.$watch('selectedCorporateMonth', function (newVals, oldVals) {
                    $timeout(function () {
                        scope.reloadCorporateData = true;
                        scope.render(scope.data);
                    });
                }, true);

                var selectionChanged = scope.$watch('selection', function (newVals, oldVals){
                        $timeout(function () {
                            scope.activeLegend = [];
                            scope.activeLegend.push(Object.keys(scope.data[0]['freq'])[0]);
                            scope.$apply();
                        });
                },true)

                scope.$on('$destroy', function () {
                    groupWatch();
                    expandWatch();
                    selectedCorporateMonthWatch();
                    selectionChanged();
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
                    
                    if (!data2 || !data2.length) {
                        return;
                    }

                    function click_legend(d, from) {
                        var type = d.key ? d.key : d;
                        if (!scope.selectionenabled && false) {
                            return;
                        }
                        if (scope.activeLegend.indexOf(type) > -1) {
                            if (d3.event.ctrlKey || d3.event.metaKey) {
                                scope.activeLegend.splice(scope.activeLegend.indexOf(type), 1);
                            } else {
                                if (scope.activeLegend.length === 1) {
                                    scope.activeLegend = [];
                                } else {
                                    scope.activeLegend = [];
                                    scope.activeLegend.push(type);
                                }
                            }
                        } else {
                            if (from === 'onPageLoad') {
                                scope.activeLegend = [];
                            } else if (!d3.event.ctrlKey && !d3.event.metaKey) {
                                scope.activeLegend = [];
                            }
                            scope.activeLegend.push(type);
                        }
                        scope.$apply();
                    }


                    function histoGram(fD, mF) {
                        var hG = {},
                            hGDim = {
                                t: 10,
                                r: 0,
                                b: 30,
                                l: 30
                            };
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
                            .tickSizeInner(-5)
                            .tickSizeOuter(-10)
                            .tickPadding(-20);

                        hGsvg.append("g").attr("class", "x axis")
                            .attr("transform", "translate(0," + (hGDim.h + 30) + ")")
                            .call(xAxis);
                        /*
                                hGsvg.append("text")      // text label for the x axis
                                        .attr("class", "line_chart_x_text")
                                        .attr("x", -20)
                                        .attr("y", (hGDim.h + 40))
                                        .style("text-anchor", "middle")
                                        .text("(Early)");

                                hGsvg.append("text")      // text label for the x axis
                                        .attr("class", "line_chart_x_text")
                                        .attr("x", hGDim.w + 20)
                                        .attr("y", (hGDim.h + 40))
                                        .style("text-anchor", "middle")
                                        .text("(Late)");
                        */
                        hGsvg.selectAll(".x.axis .tick text")
                            .call(d3_wrap, x.bandwidth());
                        
                        if(scope.showyoy){
                            hGsvg.selectAll(".x.axis .tick text")
                                .style("cursor", "pointer")
                                .on(event, function (d) {
                                    bar_click(d);
                                });

                            hGsvg.selectAll(".x.axis .tick text")
                                .each(function(d,i){
                                    if(d === scope.selectedCorporateMonth){
                                        var s = ".x.axis .tick:nth-child("+ (i+2) + ") text"
                                        hGsvg.select(s)
                                            .style("font-weight", "800")
                                            .style("fill", "#049FD9");
                                    }
                                });

                            function bar_click(d) {
                                scope.selectedCorporateMonth = d;
                                hGsvg.selectAll(".x.axis .tick text")
                                    .each(function(d,i){
                                        if(d === scope.selectedCorporateMonth){
                                            var s = ".x.axis .tick:nth-child("+ (i+2) + ") text"
                                            hGsvg.select(s)
                                                .style("font-weight", "800");
                                        }else{
                                            var s = ".x.axis .tick:nth-child("+ (i+2) + ") text"
                                            hGsvg.select(s)
                                                .style("font-weight", "400");
                                        }
                                    });
                            }
                        }

                        hGsvg.selectAll(".x.axis .tick line").remove();

                        var y = d3.scaleLinear().range([hGDim.h, 0]);

var deviation = d3.deviation(scope.fullDataForScaling, function (d) {
                            return d.value;
                        });

                        if(deviation >= 10){
                            deviation = 10;
                        }

                        var max = d3.max(scope.fullDataForScaling, function (d) {
                            return d.value;
                        });

                        max = parseInt(max) + parseInt(deviation);

                        //DE131565
                        var min = d3.min(scope.fullDataForScaling, function (d) {
                            return d.value;
                        });

                        min = parseInt(min) - parseInt(deviation);

                        if (min < 0) {
                            min = 0;
                        }


                        y.domain([min, max]).nice();

                        var yAxis = d3.axisLeft(y)
                            .tickSizeInner(-hGDim.w)
                            .tickSizeOuter(0)
                            .tickPadding(2)
                            .tickFormat(function (d) {
                               if (scope.selection != 'Renewal Rate by Architecture'){
                                    return $filter('formatValue')(d, false, scope.percent);
                                    }
                                else{
                                    return $filter('formatValue')(d, false);
                                    }
                            }).ticks(10);

                        var tip = d3.tip()
                            .attr('class', 'd3-tip')
                            .offset([-10, 0])
                            .html(function (d) {
                                if (scope.percent === true) {
                                    if (d.growth) {
                                        var color = !d.growth ? 'transparent' : (d.growth < 0 ? '#c82439' : '#4aa44c');
                                        return "<strong>" + d.state + "</strong><span style='color:" + segColor(d.key) + "'>" + d.key + ": " + $filter('formatValue')(d.value, true, scope.percent) + "</span>" + "<span style='color:" + color + "'>YOY: " + Math.abs(d.growth).toFixed(2) + '%' + "</span>";
                                    }
                                    return "<strong>" + d.state + "</strong><span style='color:" + segColor(d.key) + "'>" + d.key + ": " + $filter('formatValue')(d.value, false, scope.percent) + "</span>";
                                } else {
                                    // added change for DE69394
                                    return "<strong>" + d.state + "</strong><span style='color:" + segColor(d.key) + "'>" + d.key + ": $" + $filter('formatValue')(d.value, false, scope.percent) + "</span><span>Total: $" + $filter('formatValue')(d.total, false, scope.percent) + '</span>';
                                }
                            });

                        hGsvg.call(tip);

                        // yAxis.scale().ticks(yAxis.ticks()[0]);

                        hGsvg.append("g")
                            .attr("class", "y axis")
                            .call(yAxis)
                            .append("text")
                            .attr("transform", "rotate(-90)")
                            .attr("y", 6)
                            .attr("dy", ".71em")
                            .style("text-anchor", "end")
                            .text("");

                        var lineFunc = d3.line()
                            .x(function (d) {
                                return x(d.state) + (x.bandwidth()) / 2;
                            })
                            .y(function (d) {
                                return y(d.value);
                            });

                        var bars = hGsvg.selectAll(".line")
                            .data(mF)
                            .enter().append("g")
                            .attr("class", "line");

                        bars.append("path")
                            .attr("class", "line")
                            .attr("d", function (d) {
                                var tmpObj = [];
                                for (var i = 0; i < d.values.length; i++) {
                                    if (d.values[i].value)
                                        tmpObj.push(d.values[i]);
                                }
                                return lineFunc(tmpObj);
                            })
                            .style("stroke", function (d) {
                                return segColor(d.type);
                            })
                            .attr('stroke-width', function (d) {
                                if(typeof d["values"][0].growth !== "undefined"){
                                    return 3;
                                }
                                return 1;
                            })
                            .attr('fill', 'none')
                            .style("stroke-opacity", function (d) {
                                if (!scope.activeLegend.length || scope.activeLegend.indexOf(d.type) > -1) {
                                    return 1;
                                }
                                return 0.1;
                            });

                        bars.selectAll(".dot")
                            .data(fD)
                            .enter().append("circle")
                            .attr("class", function (d, i) {
                                return 'front front_' + i;
                            })
                            .attr("r", 4)
                            .attr("cx", function (d) {
                                return x(d.state) + (x.bandwidth()) / 2;
                            })
                            .attr("cy", function (d) {
                                return y(d.value);
                            })
                            .style('fill', function (d) {
                                if (!d.value) {
                                    return 'transparent';
                                }
                                if(d.growth){
                                    var color = !d.growth ? 'transparent' : (d.growth < 0 ? '#c82439' : '#4aa44c');
                                    return color;
                                }
                                return segColor(d.key);
                            })
                            .style('fill-opacity', function (d) {
                                if (!scope.activeLegend.length || scope.activeLegend.indexOf(d.key) > -1) {
                                    return 1;
                                }
                                return 0.1;
                            })
                            .on('mouseover', bar_mouseover)
                            .on('mouseout', bar_mouseout);

                        function bar_mouseover(d, i) {
                            //hide tooltip on zoom in/out
                            $(window).resize(function () {
                                tip.hide(d);
                            });
                            tip.show(d);
                            return;
                            bars.select("circle.front.front_" + i).transition().duration(250)
                                .attr("r", 7)
                                .style('fill', function (d) {
                                    return $filter('darken')(segColor(d.type));
                                });
                        }

                        function bar_mouseout(d, i) {
                            //hide tooltip on zoom in/out
                            $(window).resize(function () {
                                tip.hide(d);
                            });
                            tip.hide(d);
                            return;
                            bars.select("circle.front.front_" + i).transition().duration(250)
                                .attr("r", 3.5)
                                .style('fill', function (d) {
                                    return segColor(d.type);
                                });
                        }

                        if (start !== 0) {
                            hGsvg.append("svg:image")
                                .attr("transform", "translate(0," + hGDim.h + ")")
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

                        if (scope.currentquarter && typeof x(scope.currentquarter) !== 'undefined' && !scope.showyoy) {
                            showCurrent(scope.currentquarter);
                        }

                        if (scope.currentmonth && typeof x(scope.currentmonth) !== 'undefined' && !scope.showyoy) {
                            showCurrent(scope.currentmonth);
                        }

                        if (scope.currentyear && typeof x(scope.currentyear) !== 'undefined' && !scope.showyoy) {
                            showCurrent(scope.currentyear);
                        }

                        if (typeof legendWatch !== 'undefined') {
                            legendWatch();
                        }

                        var legendWatch = scope.$watch('activeLegend', function (newVals, oldVals) {
                            if (newVals) {
                                select_legend();
                            }
                        }, true);

                        scope.$on('$destroy', function () {
                            legendWatch();
                        });

                        function select_legend() {

                            var bars = hGsvg.selectAll("g.line").data(mF);

                            bars.select("path.line").transition().duration(scope.transitionDuration)
                                .style("stroke-opacity", function (d) {
                                    if (!scope.activeLegend.length || scope.activeLegend.indexOf(d.type) > -1) {
                                        return 1;
                                    }
                                    return 0.1;
                                });

                            bars.selectAll("circle")
                                .data(fD)
                                .style('fill-opacity', function (d) {
                                    if (!scope.activeLegend.length || scope.activeLegend.indexOf(d.key) > -1) {
                                        return 1;
                                    }
                                    return 0.05;
                                });

                            table.selectAll("td").attr('class', function (e) {
                                if (!scope.activeLegend.length || scope.activeLegend.indexOf(e) > -1) {
                                    return '';
                                }
                                return 'disabled';
                            });

                            return;
                        }
                    }

                    function legend(lD) {
                        var moreThanSix = lD.length > 6 && !scope.expanded && !scope.expanded;
                        moreThanSix = false;
                        if (moreThanSix) {
                            var lD = lD.slice(0, 5);
                        }
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
                        var legend = table.attr('class', 'legend ' + legendClass);
                        var tr = legend.append("tbody").append('tr');
                        var td = tr.selectAll("td").data(lD).enter().append("td").append('div').on(event, click_legend);
                        td
                            .attr('class', function (e) {
                                if (!scope.activeLegend.length || scope.activeLegend.indexOf(e) > -1) {
                                    return '';
                                }
                                return 'disabled';
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

                        if (moreThanSix) {
                            tr.append('td')
                                .text(function () {
                                    return 'More';
                                });
                        }
                    }

                    var fData = [];
                    var keys = [];
                    var fullData = angular.copy(scope.data);
                    var show = scope.columns < fullData.length ? scope.columns : fullData.length;
                    start_max = fullData.length - show;
                    fData = fullData.slice(start, start + show);
                    var cData = fullData;

                    fData.forEach(function (d) {
                        d.total = 0;
                        for (var prop in d.freq) {
                            d.total += d.freq[prop];
                        }
                    });

                    cData.forEach(function (d) {
                        d.total = 0;
                        for (var prop in d.freq) {
                            d.total += d.freq[prop];
                        }
                    });

                    keys = ciscoUtilities.getUniqueKeys(fullData, "freq");
                    var global_index = keys.indexOf(Object.keys(data2[0]['freq'])[0]);

                    if (global_index > -1) {
                        var element = keys[global_index];
                        keys.splice(global_index, 1);
                        keys.splice(0, 0, element);
                    }

                    var keys_length = keys.length;
                    var colors_p;
                    scope.keys = keys;

                    if (keys_length <= 2 && scope.showyoy) {
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

                    scope.filtered = cData;

                    var mF = keys.map(function (d) {
                        return {
                            type: d,
                            values: fData.map(function (t) {
                                return {
                                    state: t.state,
                                    growth: t.growth,
                                    value: t.freq[d] || 0
                                };
                            })
                        };
                    });

                     var dataForScaling = [];
                    fullData.forEach(function (d) {
                        for (var prop in d.freq) {
                            dataForScaling.push({
                                value: d.freq[prop]
                            })
                        }
                    });
                    scope.fullDataForScaling = angular.copy(dataForScaling);

                    var min = d3.min(scope.fullDataForScaling, function (d) {
                        return d.value;
                    });

                    var deviation = d3.deviation(scope.fullDataForScaling, function (d) {
                        return d.value;
                    });

                    if(deviation >= 10){
                        deviation = 10;
                    }

                    min = parseInt(min) - parseInt(deviation);

                    if (min < 0) {
                        min = 0;
                    }

                    var newarray = [];
                    var yColumn = [];
                    fData.forEach(function (d) {
                        for (var prop in d.freq) {
                            if (!yColumn[d.state]) {
                                yColumn[d.state] = min;
                            }
                            newarray.push({
                                state: d.state,
                                total: d.total,
                                key: prop,
                                start: yColumn[d.state] ? (yColumn[d.state] + 0) : yColumn[d.state],
                                end:  d.freq[prop],
                                value: d.freq[prop],
                                growth: d.growth ? d.growth[prop] : 0
                            });
                            yColumn[d.state] += d.freq[prop];
                        }

                    });

                    histoGram(newarray, mF);
                    legend(keys);

                    if (typeof (scope.selection) !== 'undefined' && (scope.selection).indexOf('Rate by Sales') > -1 && !scope.activeLegend.length) {
                        click_legend(Object.keys(data2[0]['freq'])[0], 'onPageLoad');
                    }

                };

            }
        };
    }
]);