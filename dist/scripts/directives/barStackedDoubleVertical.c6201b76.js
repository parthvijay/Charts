'use strict';
angular.module('ciscoExecDashApp').directive('barStackedDoubleVerticalChart', [
    '$timeout'
    , '$filter'
    , '$window'
    , '$compile'
    , 'isMobile'
    , 'CiscoUtilities'
    , '$interval'
    , '$rootScope'
    , function ($timeout, $filter, $window, $compile, isMobile, ciscoUtilities, $interval, $rootScope) {
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
                keys: '=',
                filtered: '=',
                viewtype: '=',
                categories: '=',
                activecategory: '=',
                currentquarter: '=',
                years: '='
            },
            link: function (scope, ele, attrs) {
                var d3 = $window.d3;
                var event = isMobile ? "touchstart" : "click";
                scope.transitionDuration = 500;
                var ele = $(ele[0]).closest('.tile');
                var svgContainer = d3.select(ele[0]);
                var svg = svgContainer.append('svg');
                var table = d3.select(ele[0]).append('table');
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
                $window.addEventListener('resize', function (event) {
                    $timeout(function () {
                        if ($(window).width() !== windowWidth) {
                            windowWidth = $(window).width();
                            scope.render(scope.data);
                        }
                    });
                });

                var groupWatch = scope.$watchGroup(['data', 'columns', 'viewtype', 'activecategory', 'isaccountmanagerlist'], function (newVals, oldVals) {
                    $timeout(function () {
                        scope.render(scope.data);
                    });
                }, true);


                var expandWatch = scope.$watch('expanded', function (newVals, oldVals) {
                    $timeout(function () {
                        scope.render(scope.data);
                    }, 20);
                }, true);

                var colorsWatch = scope.$watch('colors', function (newVals, oldVals) {
                    $timeout(function () {
                        scope.render(scope.data);
                    });
                }, true);

                var quarterWatch = scope.$watch('quarter', function (newVals, oldVals) {
                    $timeout(function () {
                        scope.render(scope.data);
                    });
                }, true);

                scope.$on('$destroy', function () {
                    groupWatch();
                    expandWatch();
                    colorsWatch();
                    quarterWatch();
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

                scope.render = function (data2) {
                    svg.selectAll('*').remove();
                    table.selectAll('*').remove();
                    scope.colorsOpp = {};
                    scope.area = [];
                    scope.quarter = [];
                    scope.active;

                    var data = angular.copy(data2);
                    if (!data || !data.length) {
                        return;
                    }

                    function click(d) {
                        var type = d.key ? d.key : d;
                        if (scope.active === type) {
                            scope.active = null;
                        } else {
                            scope.active = type;
                        }
                        scope.$apply();
                    }

                    function histoGram(fD, fD_2) {
                        var hG = {}, hGDim = {t: 10, r: 20, b: 30, l: 30};
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

                        var width = (ele[0].offsetWidth) - hGDim.l - hGDim.r;
                        var height = 275 - hGDim.t - hGDim.b;
                        var ticks = [];
                        for (var i = 0; i < fD.length; i += 2) {
                            ticks.push(fD[i].state.substr(0, 2));
                        }
                        var xAxis = d3.axisBottom(x)
                            .tickFormat(function (d, i) {
                                return ticks[i]
                            });

                        hGsvg.append("g").attr("class", "x axis")
                            .attr("transform", "translate(0," + hGDim.h + ")")
                            .call(xAxis);

                        hGsvg.selectAll('.x.axis .tick text')
                            .call(d3_wrap, x.bandwidth())

                        hGsvg.selectAll('.x.axis .tick text tspan')
                            .attr("y", function (d, i) {
                                return 40;
                            })

                        var y = d3.scaleLinear().range([hGDim.h, 0]);

                        var max_1 = d3.max(fD, function (d) {
                            return d.total;
                        });

                        var max_2 = 0;
                        if (fD_2.length) {
                            max_2 = d3.max(fD_2, function (d) {
                                return d.total;
                            });
                        }
                        var max = Math.max(max_1, max_2);

                        y.domain([0, max+ (max * 0.20)]);

                        var yAxis = d3.axisLeft(y)
                            .tickFormat(function (d) {
                                return $filter('formatValue')(d);
                            }).ticks(6)
                            .tickSize(-hGDim.w);

                        var tip = d3.tip()
                            .attr('class', 'd3-tip')
                            .offset([-10, 0])
                            .html(function (d) {
                                return "<strong>" + d.state.substr(0, 2) + " " + d.year + "</strong><span style='color:" + segColor(d.key) + "'>" + d.key + ": " + $filter('formatValue')(d.value) + "</span><span>Total: " + $filter('formatValue')(d.total) + "</span>";
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

                        bars.append("rect")
                            .attr("class", function (d, i) {
                                return 'front front_' + i;
                            })
                            .attr("x", function (d) {
                                return x(d.state) + (x.bandwidth()) / 2;
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
                            .attr("width", 15)
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
                                if (scope.area.length && scope.area.indexOf(d.state) === -1) {
                                    return '#ccc';
                                }
                                return segColor(d.key);
                            })
                            .on(event, click)
                            .on('mouseover', bar_mouseover)
                            .on('mouseout', bar_mouseout);

                        bars.append("text")
                            .text(function (d) {
                                return d.year;
                            })
                            .style("font-size", "10px")
                            .attr("transform", function (d) {
                                var tmpX = x(d.state) + (x.bandwidth()) / 2;
                                var tmpY = y(hGDim.h) + 30;
                                return ("rotate(-45, " + tmpX + ", " + tmpY + ")");
                            })
                            .attr("x", function (d) {
                                return x(d.state) + (x.bandwidth()) / 2;
                            })
                            .attr("y", function (d) {
                                return y(hGDim.h) + 30;
                            });

                        var bars_2 = hGsvg.selectAll(".bar_2").data(fD_2).enter()
                            .append("g").attr("class", "bar_2");

                        bars_2.append("rect")
                            .attr("class", function (d, i) {
                                return 'front front_' + i;
                            })
                            .attr("x", function (d) {
                                return x(d.state) + (x.bandwidth()) / 2 - 17;
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
                            .attr("width", function (d) {
                                return 15;
                            })
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
                                if (scope.area.length && scope.area.indexOf(d.state) === -1) {
                                    return '#ccc';
                                }
                                return segColor(d.key);
                            })
                            .attr('fill-opacity', function () {
                                return 0.45;
                            })
                            .on(event, click)
                            .on('mouseover', bar_mouseover)
                            .on('mouseout', bar_mouseout);

                        bars_2.append("text")
                            .text(function (d) {
                                return d.year;
                            })
                            .style("font-size", "10px")
                            .attr("transform", function (d) {
                                var tmpX = x(d.state) + (x.bandwidth()) / 2 - 17;
                                var tmpY = y(hGDim.h) + 30;
                                return ("rotate(-45, " + tmpX + ", " + tmpY + ")");
                            })
                            .attr("x", function (d) {
                                return x(d.state) + (x.bandwidth()) / 2 - 17;
                            })
                            .attr("y", function (d) {
                                return y(hGDim.h) + 30;
                            });

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
                            activeWatch();
                        });

                        function bar_mouseover(d, i) {
                            bars.select("rect.front.front_" + i)
                                .attr('fill', function (d) {
                                    if (scope.quarter.length && scope.quarter.indexOf(d.state) === -1) {
                                        return segColor(d.key);
                                    }
                                    return $filter('darken')(segColor(d.key));
                                });
                            bars_2.select("rect.front.front_" + i)
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
                            bars_2.select("rect.front.front_" + i)
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

                        if (start !== 0) {
                            hGsvg.append("svg:image")
                                .attr("transform", "translate(-5," + height + ")")
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
                                .attr("transform", "translate(" + (width + 5) + "," + height + ")")
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

                        function mouseover(t) {
                            var max_1 = d3.max(fD.filter(function (d) {
                                return d.key === t;
                            }), function (d) {
                                return d.value + (d.value * 0.20);
                            });

                            var max_2 = d3.max(fD_2.filter(function (d) {
                                return d.key === t;
                            }), function (d) {
                                return d.value + (d.value * 0.20);
                            });

                            max = Math.max(max_1, max_2);
                            y.domain([0, max + (max * 0.20)]);

                            hGsvg.selectAll("g.y.axis")
                                .call(yAxis);
                            var bars = hGsvg.selectAll(".bar").data(fD);

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

                            var bars_2 = hGsvg.selectAll(".bar_2").data(fD_2);

                            bars_2.select("rect.back").transition().duration(scope.transitionDuration)
                                .attr("height", function (d) {
                                    if (d.key != t)
                                        return 0;
                                    return y(d.value) > 0 ? y(d.value) : 0;
                                });

                            bars_2.select("rect.front").transition().duration(scope.transitionDuration)
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
                            var max_1 = d3.max(fD, function (d) {
                                return d.total;
                            });

                            var max_2 = d3.max(fD_2, function (d) {
                                return d.total;
                            });

                            var max = Math.max(max_1, max_2);

                            y.domain([0, max + (max * 0.20)]);
                            hGsvg.selectAll("g.y.axis")
                                .call(yAxis);
                            var bars = hGsvg.selectAll(".bar").data(fD);

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

                            var bars_2 = hGsvg.selectAll(".bar_2").data(fD_2);

                            bars_2.select("rect.back").transition().duration(scope.transitionDuration)
                                .attr("height", function (d) {
                                    return y(d.total) > 0 ? y(d.total) : 0;
                                });

                            bars_2.select("rect.front").transition().duration(scope.transitionDuration)
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

                        return hG;
                    }

                    function legend(keys) {
                        var keys = angular.copy(keys);
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
                        var legend = table.attr('class', 'legend ' + legendClass);
                        var tr = legend.append("tbody").append('tr');
                        var td = tr.selectAll("td").data(keys).enter().append("td").append('div').on(event, click);
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

                    var keys = [];
                    var fData = [];

                    var fullData = angular.copy(scope.data);

                    var show = scope.columns < fullData.length ? scope.columns : fullData.length;
                    start_max = fullData.length - show;
                    var data = fullData.slice(start, start + show);

                    data.forEach(function (d) {
                        var properties = angular.copy(d.areas[0]);
                        var quarterObj = {
                            "state": d.quarter,
                            "freq": angular.copy(properties["freq"]),
                            "freq_2": angular.copy(properties["freq2"]),
                            "total": properties["freq"]["Multi-Year"] + properties["freq"]["Annual"],
                            "total_2": properties["freq2"]["Multi-Year"] + properties["freq2"]["Annual"],
                        };
                        fData.push(quarterObj);
                    });

                    scope.filtered = fData;

                    var sF = [];
                    var yColumn = [];
                    fData.forEach(function (d) {
                        for (var prop in d.freq) {
                            if (!yColumn[d.state]) {
                                yColumn[d.state] = 0;
                            }
                            if (d.total > 0) {
                                sF.push({
                                    year: d.state.substr(d.state.length - 4, 4),
                                    state: d.state,
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

                    var sF_2 = [];
                    var yColumn_2 = [];
                    fData.forEach(function (d) {
                        for (var prop in d.freq_2) {
                            if (!yColumn_2[d.state]) {
                                yColumn_2[d.state] = 0;
                            }
                            if (d.total_2 > 0) {
                                sF_2.push({
                                    year: d.state.substr(d.state.length - 4, 2) + (parseInt(d.state.substr(d.state.length - 2, 2)) - 1),
                                    state: d.state,
                                    total: d.total_2,
                                    key: prop,
                                    start: yColumn_2[d.state] ? (yColumn_2[d.state] + 0) : yColumn_2[d.state],
                                    end: yColumn_2[d.state] + d.freq_2[prop],
                                    value: d.freq_2[prop]
                                });
                                yColumn_2[d.state] += d.freq_2[prop];
                            }
                        }
                    });

                    if (scope.viewtype === 'list') {
                        return;
                    }

                    for (var j = 0; j < fullData.length; j++) {
                        for (var prop in fullData[j].areas[0].freq) {
                            if (keys.indexOf(prop) === -1)
                                keys.push(prop);
                        }
                    }

                    keys.sort();
                    //keys = ciscoUtilities.getUniqueKeys(sF, "key");

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

                    histoGram(sF, sF_2);
                    legend(keys, sF_2.length);
                };
            }
        };
    }
]);