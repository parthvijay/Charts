/*jshint sub:true*/
'use strict';
angular.module('ciscoExecDashApp').directive('barDoubleChart', [
             '$timeout',
             '$filter',
             '$window',
             '$compile',
             'isMobile',
             'CiscoUtilities',
             '$interval',
             '$rootScope',
             function ($timeout, $filter, $window, $compile, isMobile, ciscoUtilities, $interval, $rootScope) {
                return {
                    restrict: 'E',
                    scope: {
                        data: '=',
                        colors: '=',
                        columns: '=',
                        expanded: '=',
                        sidebar: '=',
                        filtered: '=',
                        viewtype: '=',
                        campactivedrill: '=',
                        updated: "=",
                        area: "="
                    },
                    link: function (scope, ele, attrs) {
                        var d3 = $window.d3;
                        var event = isMobile ? "touchstart" : "click";

                        var ele = $(ele[0]).closest('.tile');

                        var svg = d3.select(ele[0])
                                .append('svg');

                        var table = d3.select(ele[0])
                                .append('table');

                        var show = scope.columns;

                        var start = 0;
                        var start_max = 0;

                        var colors_theme = $window.ciscoConfig.colorsPalette[$rootScope.dashboard];
                        var colors;

                        var windowWidth = $(window).width();

                $window.addEventListener('resize', function (event) {
                    $timeout(function () {
                        if ($(window).width() !== windowWidth) {
                            windowWidth = $(window).width();
                            scope.render(scope.data);
                        }
                    });
                });

                var groupWatch = scope.$watchGroup(['data', 'columns', 'expanded', 'sidebar', 'viewtype', 'updated'], function (newVals, oldVals) {
                    if (!scope.data) {
                        return;
                    }
                    start = 0;
                    start_max = 0;
                    if (scope.campactivedrill) {
                        var e = scope.data.filter(function (el) {
                            return el.quarter === scope.campactivedrill;
                        });
                        if (e[0].areas_drill) {
                            var areas_drilled = e[0].areas_drill;
                            $timeout(function () {
                                 /*show = scope.columns;
                                 show = show < areas_drilled.length ? areas_drilled.length : show;
                                start = 0;
                                start_max = areas_drilled.length - show;
                                areas_drilled = areas_drilled.slice(start, show);*/
                                scope.render(areas_drilled);
                            });
                            $('.tooltip').remove();
                        }
                        return;
                    }

                    if (newVals && scope.sidebar) {
                        $timeout(function () {                            
                            scope.render(scope.data);
                        });
                    }
                }, true);

                scope.$on('$destroy', function () {
                    groupWatch();
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
                    var d = scope.data;
                    if (scope.campactivedrill) {
                        var e = scope.data.filter(function (el) {
                            return el.quarter === scope.campactivedrill;
                        });
                        if (e[0].areas_drill) {
                            d = e[0].areas_drill;
                        }
                    }
                    if (start === 0) {
                    	return;
                    }

                    start--;
                   // start = start >= 0 ? start : 0;
                    //data = scope.data.slice(start, start + show);
                    scope.render(d);
                }

                function moveRight() {
                    var d = scope.data;
                    if (scope.campactivedrill) {
                        var e = scope.data.filter(function (el) {
                            return el.quarter === scope.campactivedrill;
                        });
                        if (e[0].areas_drill) {
                            d = e[0].areas_drill;
                        }
                    }
                    if (start === start_max) {
                        return;
                    }

                    start++;
                    //start = start <= start_max ? start : start_max;
                    //data = scope.data.slice(start, start + show);
                    scope.render(d);
                }


                scope.render = function (data2) {
                    svg.selectAll('*').remove();
                    table.selectAll('*').remove();
                    scope.colorsOpp = {};
                    
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

                        var xAxis = d3.axisBottom(x);

                        function drill_x(d) {
                            var e = data.filter(function (el) {
                                return el.quarter === d;
                            });
                            if (e[0].areas_drill) {
                                scope.campactivedrill = d;
                                var areas_drilled = e[0].areas_drill;
                                scope.render(areas_drilled);
                                $('.tooltip').remove();
				matchTilesHeight(50);
                            }
                        }

                                function xMouseover(d) {
                                    var o = $(this).offset();
                                    o.top -= 150;
                                    o.left += 60;
                                    if (typeof tooltipInterval !== 'undefined') {
                                        $interval.cancel(tooltipInterval);
                                    }
				    var a = scope.campactivedrill ? (scope.campactivedrill + ' - ') : '';
                                    $('.entire-network').hide();
                                    $('.entire-network[data-cat="' + a.toLowerCase() + d.toLowerCase() + '"]').show().offset(o);
                                }

                                function xMouseout() {
                                    window.tooltipInterval = $interval(function () {
                                        if (!$(':hover').last().closest('.entire-network').length) {
                                            $('.entire-network').hide();
                                            $interval.cancel(tooltipInterval);
                                        }
                                    }, 1000);
                                }

                                hGsvg.append("g").attr("class", "x axis")
                                        .attr("transform", "translate(0," + hGDim.h + ")")
                                        .call(xAxis);

                                hGsvg.selectAll('.x.axis .tick text')
                                        .call(d3_wrap, x.bandwidth())
                                        .on(event, drill_x)
                                        .on('mouseover', xMouseover)
                                        .on('mouseout', xMouseout);

                        var y = d3.scaleLinear().range([hGDim.h, 0]);

                        var max = d3.max(fD, function (d) {
                            return d.value;
                        });

                        y.domain([0, max + (max * 0.25)]).nice();

                        var yAxis = d3.axisLeft(y)
                                .tickFormat(function (d) {
                                    return $filter('formatValue')(d);
                                        }).ticks(6)
                                        .tickSize(-hGDim.w);

                        var tip = d3.tip()
                                .attr('class', 'd3-tip')
                                .offset([-10, 0])
                                .html(function (d) {
                                    return "<strong>" + d.state + "</strong><span style='color:" + segColor(d.key) + "'>" + d.key + ": " + $filter('formatValue')(d.value) + "</span>";
                                });

                        var tip_growth = d3.tip()
                            .attr('class', 'd3-tip')
                            .offset([-20, 0])
                            .html(function (d) {
                                var color = !d.growth ? 'transparent' : (d.growth < 0 ? '#c82439' : '#4aa44c');
                                var text = "<span style='color:" + color + "'>" + (d.growth).toFixed(2) + '%' + "</span>";
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

                        bars.append("rect")
                            .attr("class", function (d, i) {
                                return 'front front_' + i;
                            })
                            .attr("x", function (d) {
                                var m = d.start ? 12 : 0;
                                return x(d.state) + (x.bandwidth() - 20) / 2 + m
                            })
                            .attr("y", function (d) {
                                return y(d.value);
                            })
                            .attr("width", 10)
                            .attr("height", function (d) {
                                var val = hGDim.h - y(d.value);
                                return val > 0 ? val : 0;
                            })
                            .attr('fill', function (d) {
                                return segColor(d.key);
                            })
                            .on('mouseover', bar_mouseover)
                            .on('mouseout', bar_mouseout);

                        /*bars.append("text")
                            .text(function (d) {
                                if (!d.growth) {
                                    return '';
                                }
                                return Math.abs(d.growth) + '%';
                            })
                            .style("fill", function (d) {
                                var color = !d.growth ? 'transparent' : (d.growth < 0 ? '#c82439' : '#4aa44c');
                                return color;
                            })
                            .attr("x", function (d) {
                                var m = d.start ? 12 : 0;
                                var xval = x(d.state) + (x.bandwidth() - 3) / 2 + m;
                                return xval;
                            })
                            .attr("y", function (d) {
                                var yval = y(d.value) - 15;
                                return yval;
                            })
                            .attr("transform", function (d) {
                                var m = d.start ? 12 : 0;
                                var xval = x(d.state) + (x.bandwidth() - 3) / 2 + m;
                                var yval = y(d.value) - 15;
                                return "rotate(-90," + xval + "," + yval + ")";
                            });
                            */

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
                                            var m = d.start ? 12 : 0;
                                            m = x(d.state) + (x.bandwidth() - 10) / 2 + m
                                            var rotate = d.growth < 0 ? 'rotate(180)' : '';
                                            return "translate(" + (m) + "," + (y(d.value) - 8) + ") " + rotate;
                            })
                            .on('mouseover', tip_growth.show)
                            .on('mouseout', tip_growth.hide);
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

//                        hGsvg.selectAll(".quarter")
//                                .data(fD)
//                                .enter()
//                                .append("text")
//                                .attr("class", "quarter")
//                                .attr("transform", "translate(0," + hGDim.h + ")")
//                                .text(function (d) {
//                                    return getXLabel_2(d.state);
//                                })
//                                .attr("x", function (d) {
//                                    return x(d.state) + (x.bandwidth() - 30) / 2;
//                                })
//                                .attr("y", function (d) {
//                                    return 30;
//                                });

                        if (start !== 0) {
                            hGsvg.append("svg:image")
                                .attr("transform", "translate(0," + hGDim.h + ")")
                                .attr('class', 'arrow-left')
                                .attr("x", function () {
                                    return -30;
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
                                    return 10;
                                })
                                .attr("y", function () {
                                    return 10;
                                })
                                .attr('width', 20)
                                .attr('height', 20)
                                .attr("xlink:href", "images/arrow-right.svg")
                                .on(event, moveRight);
                        }
                        return hG;
                    }

                    function legend(lD) {
                        var moreThanSix = lD.length > 6 && !scope.expanded;
                        moreThanSix = false;
                        if (moreThanSix) {
                            var lD = lD.slice(0, 5);
                        }
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
                        td.attr('uib-tooltip', function (d) {
                            if (typeof d === "string")
                                return d;
                            return d.type;
                        })
                        .attr('tooltip-append-to-body', 'true');
                        
                        td.append("svg").attr("width", '8').attr("height", '8').append("rect")
                            .attr("width", '8').attr("height", '8')
                            .attr("fill", function (d) {
                                if (typeof d === "string")
                                    return segColor(d);
                                return segColor(d.type);
                            });
                        td.append('text')
                            .text(function (d) {
                                if (typeof d === "string")
                                    return d;
                                return d.type;
                            });

                        $compile(ele.children('table'))(scope);

                        if (moreThanSix) {
                            tr.append('td')
                            .text(function () {
                                return 'More';
                            });
                        }
                    }

                    var fullData = angular.copy(data2);
                    if (!fullData || !fullData.length) {
                        return;
                    }

                    fullData.forEach(function (d) {
                        d.total = 0;
                        for (var prop in d.freq) {
                            d.total += d.freq[prop];
                        }
                    });

                    fullData.forEach(function (d) {
                        d.actopp_total = 0;
                        d.areas.forEach(function (e) {
                            d.actopp_total += e.freq['Actionable Opportunity'];
                        });
                    });

                    // fullData.sort(function(a, b) {
            //     return b.actopp_total - a.actopp_total;
            // });


                    var fData = [];
                    var keys = [];

                    var show = scope.columns < fullData.length ? scope.columns : fullData.length;
                    start_max = fullData.length - show;
                    var data = fullData.slice(start, start + show);

//                            for (var prop in data[0].areas[0].freq) {
//                                keys.push(prop);
//                            }
                    data.forEach(function (d) {
                        var o = {};
                        o.state = d.quarter;
                        o.freq = {};
                        var areas = d.areas;
                        areas.forEach(function (e) {
                                    o.growth = e.growth;
                            var b = e.freq;
                            for (var prop in b) {
                                if (typeof o.freq[prop] !== 'undefined') {
                                    o.freq[prop] += b[prop];
                                }
                                else {
                                    o.freq[prop] = b[prop];
                                }
                            }
                        });
                        fData.push(o);
                    });

                    if (scope.campactivedrill) {
                        var cData = angular.copy(data);
                    }
                    else {
                        var cData = angular.copy(scope.data);
                    }

                    cData.forEach(function (d) {
                        var o = {};
                        o.state = d.quarter;
                        d.freq = {};
                        var areas = d.areas;
                        areas.forEach(function (e) {
                            var b = e.freq;
                            for (var prop in b) {
                                if (typeof d.freq[prop] !== 'undefined') {
                                    d.freq[prop] += b[prop];
                                }
                                else {
                                    d.freq[prop] = b[prop];
                                }
                            }
                        });
                    });

                    scope.filtered = cData;

                    var sF = [];
                    var yColumn = [];
                    fData.forEach(function (d) {
                        for (var prop in  d.freq) {
                            if (!yColumn[d.state]) {
                                yColumn[d.state] = 0;
                            }
                            sF.push({
                                state: d.state,
                                total: d.total,
                                key: prop,
                                start: yColumn[d.state] ? (yColumn[d.state] + 0) : yColumn[d.state],
                                end: yColumn[d.state] + d.freq[prop],
                                        value: d.freq[prop],
                                        growth: d.growth ? d.growth[prop] : 0
                            });
                            yColumn[d.state] += d.freq[prop];
                        }

                    });
                    
	            keys = ciscoUtilities.getUniqueKeys(sF, "key");
		        
                var keys_length = keys.length;
                var colors_p;

                if (keys_length <= 3) {
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
                var sortedArr = [];
                if (sF[0].key === "SFDC Pipeline") {
                    for (var i = 0; i < sF.length; i++) {
                        if (i % 2 === 0) {
                            sortedArr.push(sF[i+1]);
                            sortedArr.push(sF[i]);
                        }
                    }
                    histoGram(sortedArr);
                } else {
                    histoGram(sF);
                }
                
                legend(keys);
            };

        }};
    }
]);
