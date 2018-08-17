/*jshint sub:true*/
'use strict';
angular.module('ciscoExecDashApp').directive('barStackedHorizontalVerticalChart', [
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
                        active: '=',
                        sidebar: '=',
                        keys: '=',
                        filtered: '=',
                        quarter: '=',
                        area: '=',
                        slug: '=',
                        view: '=',
                        currentquarter: '=',
                        currentmonth: '=',
			currentyear: '=',
                        selection: '=',
                        selectionTitle: '=',
                        percent: '=',
                        viewtype: '=',
                        campactivedrill: '=',
                        selectionenabled: '='
                    },
                    link: function (scope, ele, attrs) {
                        var d3 = $window.d3;
                        var event = isMobile ? "touchstart" : "click";

                        scope.transitionDuration = 500;

                        var ele = $(ele[0]).closest('.tile');

                        var text = d3.select(ele[0])
                                .append('text').attr('class', 'horizontal_text');

                        var svg_1 = d3.select(ele[0])
                                .append('svg').attr('class', 'horizontal_svg');

                        var svg = d3.select(ele[0])
                                .append('svg');

                        var table = d3.select(ele[0])
                                .append('table');

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

                        var groupWatch = scope.$watchGroup(['data', 'columns', 'expanded', 'sidebar', 'area', 'viewtype', 'campactivedrill'], function (newVals, oldVals) {
                            if (!scope.data) {
                                return;
                            }
                            if (scope.sidebar) {
                                $timeout(function () {
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
                                    scope.render(scope.data);
                                });
                            }
                        }, true);

                        scope.$on('$destroy', function () {
                            groupWatch();
                            colorsWatch();
                            areaWatch();
                        });

                        function segColor(c) {
                            var constant = $window.ciscoConfig.colorsPalette[$rootScope.dashboard]['constant'][c];
                            if (typeof constant !== 'undefined') {
                                return constant;
			    }
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
                            text.selectAll('*').remove();
                            svg_1.selectAll('*').remove();
                            svg.selectAll('*').remove();
                            table.selectAll('*').remove();
                            scope.colorsOpp = {};

                            var data = angular.copy(data2);
                            if (!data || !data.length) {
                                return;
                            }

                            function click(d) {
                                if (!scope.selectionenabled) {
                                    return;
                                }
                                var type = d.key ? d.key : d;
                                if (scope.active === type) {
                                    scope.active = null;
                                } else {
                                    scope.active = type;
                                }
                                scope.$apply();
                            }

                            function histoGram(fD) {
                                var width = ele[0].offsetWidth;
                                var height = 275;

                                var margin = {top: 20, right: 20, bottom: 30, left: 60};
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

                                var max = d3.max(fD, function (d) {
                                    return d.total;
                                });

                                if (scope.active) {
                                    y.domain([0, d3.max(sF.filter(function (d) {
                                            return d.key == scope.active;
                                        }), function (d) {
                                            return d.value + (d.value * 0.20);
                                        })]);
                                } else {
                                    y.domain([0, max + (max * 0.20)]);
                                }

                                var yAxis = d3.axisLeft(y)
                                        .tickFormat(function (d) {
                                            return $filter('formatValue')(d);
                                        }).ticks(6);

                                var tip = d3.tip()
                                        .attr('class', 'd3-tip')
                                        .offset([-10, 0])
                                        .html(function (d) {
                                            var a = "<strong>" + d.state + "</strong><span style='color:" + segColor(d.key) + "'>" + d.key + ": " + $filter('formatValue')(d.value, false, scope.percent) + "</span>";
                                            return a;
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

                                bars.append("rect").attr('class', 'back')
                                        .attr("x", function (d) {
                                            return x(d.state) + (x.bandwidth() - 20) / 2;
                                        })
                                        .attr("y", function (d) {
                                            return 0;
                                        })
                                        .attr("width", 20)
                                        .attr("height", function (d) {
                                            if (scope.active) {
                                                if (d.key != scope.active) {
                                                    return 0;
                                                }
                                                return y(d.value) > 0 ? y(d.value) : 0;
                                            }
                                            return y(d.total) > 0 ? y(d.total) : 0;
                                        })
                                        .attr('fill', function (d) {
                                            return '#EDEEF1';
                                        });

                                bars.append("rect")
                                        .attr("class", function (d, i) {
                                            return 'front front_' + i;
                                        })
                                        .attr("x", function (d) {
                                            return x(d.state) + (x.bandwidth() - 20) / 2;
                                        })
                                        .attr("y", function (d) {
                                            if (scope.active) {
                                                if (d.key != scope.active) {
                                                    return 0;
                                                }
                                                return y(d.value);
                                            }
                                            return y(d.end);
                                        })
                                        .attr("width", 20)
                                        .attr("height", function (d) {
                                            if (scope.active) {
                                                if (d.key !== scope.active) {
                                                    return 0;
                                                }
                                                return height - y(d.value);
                                            }
                                            var m = d.start ? 2 : 0;
                                            var val = y(d.start) - y(d.end) - m;
                                            return val > 0 ? val : 0;
                                        })
                                        .attr('fill', function (d) {
                                            if (!scope.quarter.length || scope.quarter.indexOf(d.state) > -1) {
                                                return segColor(d.key);
                                            }
                                            return '#ccc';
                                        })
                                        .on(event, click)
                                        .on('mouseover', bar_mouseover)
                                        .on('mouseout', bar_mouseout);

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
                                    if (newVals) {
                                        mouseover(newVals);
                                    } else {
                                        mouseout();
                                    }
                                }, true);

                                scope.$on('$destroy', function () {
                                    quarterWatch();
                                    activeWatch();
                                });

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

                                function mouseover(t) {
                                    var max = d3.max(sF.filter(function (d) {
                                        return d.key === t;
                                    }), function (d) {
                                        return d.value + (d.value * 0.20);
                                    });
                                    max = Math.max(max, 6);
                                    y.domain([0, max]);
                                    hGsvg.selectAll("g.y.axis")
                                            .call(yAxis);
                                    var bars = hGsvg.selectAll(".bar").data(sF);

                                    bars.select("rect.back").transition().duration(scope.transitionDuration)
                                            .attr("height", function (d) {
                                                if (d.key != t)
                                                    return 0;
                                                return y(d.value) > 0 ? y(d.value) : 0;
                                            });

                                    bars.select("rect.front").transition().duration(scope.transitionDuration)
                                            .attr("y", function (d) {
                                                if (d.key != t)
                                                    return 0;
                                                return y(d.value);
                                            })
                                            .attr("height", function (d) {
                                                if (d.key != t)
                                                    return 0;
                                                return height - y(d.value);
                                            })
                                            .attr('fill', function (d) {
                                                if (scope.quarter.length && scope.quarter.indexOf(d.state) === -1) {
                                                    return '#ccc';
                                                }
                                                return segColor(d.key);
                                            });

                                    table.selectAll("td").attr('class', function (e) {
                                        if (e !== t)
                                            return 'disabled';
                                        return '';
                                    });
                                }
                                function mouseout() {
                                    var max = d3.max(fD, function (d) {
                                        return d.total;
                                    });

                                    y.domain([0, max + (max * 0.20)]);
                                    hGsvg.selectAll("g.y.axis")
                                            .call(yAxis);
                                    var bars = hGsvg.selectAll(".bar").data(sF);

                                    bars.select("rect.back").transition().duration(scope.transitionDuration)
                                            .attr("height", function (d) {
                                                return y(d.total) > 0 ? y(d.total) : 0;
                                            });

                                    bars.select("rect.front").transition().duration(scope.transitionDuration)
                                            .attr("y", function (d) {
                                                return y(d.end);
                                            })
                                            .attr("height", function (d) {
                                                var m = d.start ? 2 : 0;
                                                var val = y(d.start) - y(d.end) - m;
                                                return val > 0 ? val : 0;
                                            })
                                            .attr('fill', function (d) {
                                                if (scope.quarter.length && scope.quarter.indexOf(d.state) === -1) {
                                                    return '#ccc';
                                                }
                                                return segColor(d.key);
                                            });

                                    table.selectAll("td").attr('class', function (e) {
                                        return '';
                                    });
                                }

                                function click_quarter(d, qId) {
                                    if (!scope.selectionenabled) {
                                        return;
                                    }
                                    var type = d.state ? d.state : d;
                                    if (scope.quarter.indexOf(type) > -1) {
                                        if (d3.event.ctrlKey || d3.event.metaKey) {
                                            scope.quarter.splice(scope.quarter.indexOf(type), 1);
                                        } else {
                                            if (scope.quarter.length === 1) {
                                                scope.quarter = [];
                                            } else {
                                                scope.quarter = [];
                                                scope.quarter.push(type);
                                            }
                                        }
                                    } else {
                                        if (!d3.event.ctrlKey && !d3.event.metaKey) {
                                            scope.quarter = [];
                                        }
                                        scope.quarter.push(type);
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
                                                if (!scope.quarter.length || scope.quarter.indexOf(d.state) > -1) {
                                                    return segColor(d.key);
                                                }
                                                return '#ccc';
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
                                                if (scope.quarter.length && scope.quarter.indexOf(d.state) === -1) {
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
                                                if (scope.quarter.length && scope.quarter.indexOf(d.state) === -1) {
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

//                                hGsvg.append("svg:image")
//                                        .attr("transform", "translate(0," + height + ")")
//                                        .attr('class', 'arrow-left')
//                                        .attr("x", function () {
//                                            return -20;
//                                        })
//                                        .attr("y", function () {
//                                            return 10;
//                                        })
//                                        .attr('width', 20)
//                                        .attr('height', 20)
//                                        .attr("xlink:href", "images/arrow-left.svg")
//                                        .on(event, moveLeft);
//
//                                hGsvg.append("svg:image")
//                                        .attr("transform", "translate(" + width + "," + height + ")")
//                                        .attr('class', 'arrow-right')
//                                        .attr("x", function () {
//                                            return -10;
//                                        })
//                                        .attr("y", function () {
//                                            return 10;
//                                        })
//                                        .attr('width', 20)
//                                        .attr('height', 20)
//                                        .attr("xlink:href", "images/arrow-right.svg")
//                                        .on(event, moveRight);

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

                            function createHorizontalChart(localTf) {
                                var hG = {}, hGDim = {t: 20, r: 20, b: 0, l: 70};
                                var elOffsetWidth = ele[0].offsetWidth;
                                if (elOffsetWidth === 0 && ele.hasClass('ng-hide')) {
                                    elOffsetWidth = $(ele[0]).siblings('div.tile-head-area').width();
                                }
                                hGDim.w = (elOffsetWidth);
                                hGDim.h = 50;

                                var hGsvg = svg_1
                                        .attr("width", hGDim.w > 0 ? hGDim.w : 0)
                                        .attr("height", 50).append("g")
                                        .attr("transform", "translate(0,0)");
                                var x = d3.scaleLinear().range([0, hGDim.w]);
                                var y = d3.scaleBand().range([0, hGDim.h])
                                        .domain(localTf.map(function (d) {
                                            return d.state;
                                        }));
                                var max = d3.max(localTf, function (d) {
                                    return d.total;
                                });
                                x.domain([0, max]);

                                var xAxis = d3.axisBottom(x)
                                        .tickFormat(function (d) {
                                            return $filter('formatValue')(d);
                                        }).ticks(3);
                                var yAxis = d3.axisLeft(y)
                                        .tickFormat(function (d) {
                                            return d;
                                        });

                                var tip = d3.tip()
                                        .attr('class', 'd3-tip')
                                        .offset([-10, 0])
                                        .html(function (d) {
                                            var a = "<span style='color:" + segColor(d.key) + "'>" + d.key + ": " + $filter('formatValue')(d.value, false, scope.percent) + "</span>";
                                            return a;
                                        });

                                hGsvg.call(tip);

                                hGsvg.attr("width", hGDim.w)
                                        .attr("height", 20);

                                text.append("text")
                                        .text(function () {
                                            return 'Total: ' + $filter('formatValue')(max);
                                        });

                                var bars = hGsvg.selectAll(".bar").data(localTf).enter()
                                        .append("g").attr("class", "bar");

                                bars.append("rect")
                                        .attr("class", function (d, i) {
                                            return 'front front_' + i;
                                        })
                                        .attr("x", function (d) {
                                            return x(d.start);
                                        })
                                        .attr("y", function (d) {
                                            return 0;
                                        })
                                        .attr("width", function (d) {
                                            var m = d.start ? 2 : 2;
                                            var val = x(d.end) - x(d.start) - m;
                                            return val > 0 ? val : 0;
                                        })
                                        .attr("height", function (d) {
                                            return 15;
                                        })
                                        .attr('fill', function (d) {
                                            return segColor(d.key);
                                        })
                                        .on('mouseover', bar_mouseover)
                                        .on('mouseout', bar_mouseout);


                                function bar_mouseover(d, i) {
                                    bars.select("rect.front.front_" + i)
                                            .attr('fill', function (d) {
                                                if (scope.area.length && scope.area.indexOf(d.state) === -1) {
                                                    return segColor(d.key);
                                                }
                                                return $filter('darken')(segColor(d.key));
                                            });
                                    tip.show(d);
                                }

                                function bar_mouseout(d, i) {
                                    bars.select("rect.front.front_" + i)
                                            .attr('fill', function (d) {
                                                if (scope.area.length && scope.area.indexOf(d.state) === -1) {
                                                    return '#ccc';
                                                }
                                                return segColor(d.key);
                                            });
                                    tip.hide(d);
                                }

                                return hG;

                            }

                            function legend(lD) {
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
                                var td = tr.selectAll("td").data(lD).enter().append("td").append('div').on(event, click);
                                td
                                        .attr('class', function (e) {
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

                            if (scope.campactivedrill) {
                                fullData.forEach(function (d) {
                                    var areas = d.areas;
                                    areas.forEach(function (e) {
                                        for (var a in e.freq) {
                                            if (a === scope.campactivedrill) {
                                                e.freq = e.freq[a].areas_drill;
                                                return false;
                                            }
                                        }
                                    });
                                });
                            }


                            var show = scope.columns < fullData.length ? scope.columns : fullData.length;
                            start_max = fullData.length - show;
                            var data = fullData.slice(start, start + show);

                            for (var prop in data[0].areas[0].freq) {
                                keys.push(prop);
                            }

                            keys.sort();

                            // keys = ciscoUtilities.getUniqueKeys(sF, "key");

                            var allCategories = ['Remaining', 'On Time', 'Late', 'Missed', 'Opportunity'];
                            keys.sort(function (a, b) {
                                return allCategories.indexOf(a) - allCategories.indexOf(b);
                            });

                            var keys_length = keys.length;
                            var colors_p;

                            if (keys_length <= 3) {
                                colors_p = 'colors_3';
                            } else if (keys_length <= 6) {
                                colors_p = 'colors_6';
                            } else if (keys_length <= 13) {
                                colors_p = 'colors';
                            } else {
                                colors_p = 'colors_more';
                            }

                            colors = colors_theme[colors_p];

                            data.forEach(function (d) {
                                var o = {};
                                o.state = d.quarter;
                                o.stateId = d.quarterId || d.quarter;
                                o.freq = {};
                                var areas = d.areas;
                                areas.forEach(function (e) {
                                    if (scope.area.length && scope.area.indexOf(e.state) === -1) {
                                        return;
                                    }
                                    var b = e.freq;
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
                                fData.push(o);
                            });

                            var cData = [];

                            fullData.forEach(function (d) {
                                var o = {};
                                o.state = d.quarter;
                                o.freq = {};
                                var areas = d.areas;
                                areas.forEach(function (e) {
                                    if (scope.area.length && scope.area.indexOf(e.state) === -1) {
                                        return;
                                    }
                                    var b = e.freq;
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

                    var tF = keys.map(function (d) {
                        return {
                            state: d, freq: cData.map(function (t) {
                                return { key: t.state, value: t.freq[d] };
                            }), total: d3.sum(cData.map(function (t) {
                                return t.freq[d];
                            }))
                        };
                    });

                            scope.filtered = tF;

                    var tF_2 = keys.map(function (d) {
                        return {
                            state: d, value: d3.sum(cData.map(function (t) {
                                if (d.toLowerCase() === 'opportunity') {
                                    return 0;
                                }
                                return t.freq[d];
                            }))
                        };
                    });

                            var tf2_total = d3.sum(tF_2.map(function (t) {
                                return t.value;
                            }));

                            fData.forEach(function (d) {
                                d.total = 0;
                                for (var prop in d.freq) {
                                    d.total += d.freq[prop];
                                }
                            });

                            var sF = [];
                            var yColumn = [];
                            fData.forEach(function (d) {
                                for (var prop in d.freq) {
                                    if (prop.toLowerCase() !== 'opportunity') {
                                        continue;
                                    }
                                    if (!yColumn[d.state]) {
                                        yColumn[d.state] = 0;
                                    }
                                    sF.push({
                                        state: d.state,
                                        stateId: d.stateId,
                                        total: d.freq[prop],
                                        key: prop,
                                        start: yColumn[d.state] ? (yColumn[d.state] + 0) : yColumn[d.state],
                                        end: yColumn[d.state] + d.freq[prop],
                                        value: d.freq[prop]
                                    });
                                    yColumn[d.state] += d.freq[prop];
                                }
                            });

                            var sF_2 = [];
                            var yColumn_2 = 0;
                            tF_2.forEach(function (d) {
                                if (d.state.toLowerCase() === 'opportunity') {
                                    return true;
                                }
                                sF_2.push({
                                    total: tf2_total,
                                    key: d.state,
                                    start: yColumn_2,
                                    end: yColumn_2 + d.value,
                                    value: d.value,
                                    state: 'Opportunity'
                                });
                                yColumn_2 += d.value;
                            });

                            if (scope.viewtype === 'list') {
                                return;
                            }

                            legend(keys);
                            histoGram(sF);
                            createHorizontalChart(sF_2);

                        };
                    }
                };
            }
]);