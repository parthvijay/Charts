/*jshint sub:true*/
'use strict';
angular.module('ciscoExecDashApp').directive('pieChartCustomerDetail', [
             '$timeout',
             '$filter',
             '$window',
             '$compile',
             'isMobile',
             'CiscoUtilities',
             '$sce',
             '$interval',
             '$rootScope',
             function ($timeout, $filter, $window, $compile, isMobile, ciscoUtilities, $sce, $interval, $rootScope) {
                return {
                    restrict: 'E',
                    scope: {
                        data: '='
                    },
                    link: function (scope, ele, attrs) {
                        var doNothingFunc = function () {
                            d3.event.stopPropagation();
                            return;
                        };
                        var refreshPCData = function () {
                            scope.$emit('refresh-spc-data', {
                                'activeKey': scope.active
                            });
                        };

                        $rootScope.dashboard = "sales";                        
                        var activeSpcKey = 'sales';
                        scope.$on('active-spc-key-selection', function (event, data) {
                            activeSpcKey = data;
                        });
                        var d3 = $window.d3;
                        var event = isMobile ? "touchstart" : "click";
                        scope.transitionDuration = 500;
                        scope.pieLegendTip = {};
                        var ele = $(ele[0]);
                        var exceptionSlug = {
                            "performance": {},
                            "opportunities": {
                                "attach": true
                            }
                        };
                        var exceptionClicks = ["SWSS Attach Aging"];

                        scope.colors = {};

                        $timeout(function () {
                            var svg = d3.select(ele[0]).append('svg');
                            var table = d3.select(ele[0]).append('table');

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

                    var groupWatch = scope.$watchGroup(['data'], function (newVals, oldVals) {
                        $timeout(function () {
                            scope.render(scope.data);
                        });
                    }, true);

                    var quarterWatch = scope.$watch('quarter', function (newVals, oldVals) {
                        $timeout(function () {
                            scope.render(scope.data);
                        });
                    }, true);

                    var areaWatch = scope.$watch('area', function (newVals, oldVals) {
                        $timeout(function () {
                            scope.render(scope.data);
                        });
                    }, true);

                            scope.$on('$destroy', function () {
                                groupWatch();
                                quarterWatch();
                                areaWatch();
                            });

                            function segColor(c) {
                                var constant = $window.ciscoConfig.colorsPalette[$rootScope.dashboard]['constant'][c];
                                if (typeof constant !== 'undefined') {
                                    return constant;
                                }
                                var size = Object.keys(scope.colors).length;
                                if (!scope.colors[c]) {
                                    scope.colors[c] = colors[size];
                                }
                                return scope.colors[c];
                            }

                            scope.render = function (data2) {
                                svg.selectAll('*').remove();
                                table.selectAll('*').remove();

                                var data = angular.copy(data2);
                                if (!data ) {
                                    return;
                                }

                                function click(d) {
                                    if (!scope.selectionenabled) {
                                        return;
                                    }
                                    var type = d.data ? d.data.state : d;
                                    if (scope.active === type) {
                                        scope.$apply(function () {
                                            scope.active = null;
                                        });
                                    } else {
                                        scope.$apply(function () {
                                            scope.active = type;
                                        });
                                    }
                                }

                                function legend_click(d, i) {
                                    tip.hide(d);
                                    click(d);
                                }

                                function pieChart(pD) {
                                    var pieTotal = d3.sum(pD.map(function (t) {
                                        return t.total;
                                    }));
                                    var w = windowWidth > 380 ? ele[0].offsetWidth : 200;
                                    var pC = {}, pieDim = {w: w, h: 275};
                                    pieDim.r = Math.min(pieDim.w, pieDim.h) / 2;
                                    var piesvg = svg
                                            .attr("width", pieDim.w).attr("height", pieDim.h).append("g")
                                            .attr("transform", "translate(" + pieDim.w / 2 + "," + pieDim.h / 2 + ")");
                                    var arc = d3.arc().outerRadius(pieDim.r * 0.8).innerRadius(pieDim.r * 0.48);
                                    var pie = d3.pie().sort(null).value(function (d) {
                                        return d.total;
                                    }).padAngle(0.02);

                                    window.pieFilter = function (d) {
                                        var d = decodeURI(d);
                                        click(d);
                                    };

                                    window.pieSubFilter = function (d) {
                                        var d = decodeURI(d);
                                        $('.d3-tip').remove();
                                        scope.pieactivedrill = d;
                                    };

                                    window.pieSubFilterLegend = function (d) {
                                        scope.pieactivedrill = angular.copy(scope.hoveredLegend);
                                    };

                                    window.tip = d3.tip()
                                            .attr('class', 'd3-tip')
                                            .offset([0, 0])
                                            .html(function (d) {
                                                var txt = scope.active && scope.active === d.data.state ? 'Unfilter' : "Filter Data";
                                                var h = '<div class="with-cancel1">';
                                                h += "<span style='color:" + segColor(d.data.state) + "'>" + d.data.state + ": " + $filter('formatValue')(d.value) + "</span>";
                                                if (scope.keyinfo && scope.keyinfo[d.data.state]) {
                                                    h += '<span class="keyinfo">' + scope.keyinfo[d.data.state] + '</span>';
                                                }
                                                if (scope.hasSub) {
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
                                            .attr("class", function (d, i) {
                                                return 'front front_' + i;
                                            })
                                            .attr("d", arc)
                                            .style("fill", function (d) {
                                                if (scope.active && d.data.state !== scope.active) {
                                                    d.data.disabled = true;
                                                    return '#ccc';
                                                }
                                                d.data.disabled = false;
                                                return segColor(d.data.state);
                                            })
                                            .on('mouseover', pie_mouseover)
                                            .on('mouseout', pie_mouseout)
                                            .on(event, pie_click);

                                    if (typeof activeWatch !== 'undefined') {
                                        activeWatch();
                                    }

                                    var activeWatch = scope.$watch('active', function (newVals, oldVals) {
                                        if (newVals) {
                                            mouseover(newVals);
                                            $('.pieFilter').text('Unfilter');
                                        } else {
                                            mouseout();
                                            $('.pieFilter').text('Filter Data');
                                        }
                                    }, true);

                                    scope.$on('$destroy', function () {
                                        activeWatch();
                                    });

                                    function mouseover(t) {
                                        g.selectAll("path").transition().duration(scope.transitionDuration)
                                                .style("fill", function (e) {
                                                    if (e.data.state !== t) {
                                                        e.data.disabled = true;
                                                        return '#ccc';
                                                    }
                                                    e.data.disabled = false;
                                                    return segColor(e.data.state);
                                                });

                                        table.selectAll("td").attr('class', function (e) {
                                            if (e !== t) {
                                                return 'disabled';
                                            }
                                            return '';
                                        });
                                    }

                                    function mouseout() {
                                        g.selectAll("path").transition().duration(scope.transitionDuration)
                                                .style("fill", function (e) {
                                                    e.data.disabled = false;
                                                    return segColor(e.data.state);
                                                });

                                        table.selectAll("td").attr('class', function (e) {
                                            return '';
                                        });
                                    }

                                    function pie_mouseover(d, i) {
                                        g.select("path.front.front_" + i)
                                                .style('fill', function (e) {
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
                                                .style('fill', function (e) {
                                                    if (e.data.disabled) {
                                                        return '#ccc';
                                                    }
                                                    return segColor(e.data.state);
                                                });
                                        //hide tooltip on zoom in/out
                                        $(window).resize(function () {
                                            tip.hide(d);
                                        });
                                        if (!scope.hasSub) {
                                            tip.hide(d);
                                        } else {
                                            window.pieTipInterval = $interval(function () {
                                                if (!$(':hover').last().closest('.d3-tip').length) {
                                                    tip.hide(d);
                                                    $interval.cancel(pieTipInterval);
                                                }
                                            }, 1000);
                                        }
                                    }

                                    function pie_click(d, i) {
                                        click(d);
                                    }

                                    g.append("text")
                                            .text(function (d) {
                                                if (((d.value / pieTotal) * 100) < 2.5) {
                                                    return '';
                                                }
                                                return $filter('formatValue')(d.value);
                                            })
                                            .attr("transform", function (d) {
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
                                            .attr("dy", function (d) {
                                                return 0.35 + "em";
                                            })
                                            .attr("text-anchor", function (d, i) {
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
                                    var td = tr.selectAll("td").data(lD).enter().append("td").append('div').on(event, legend_click);
                                    td
                                            .attr('class', function (e) {
                                                if (scope.active && e !== scope.active) {
                                                    return 'disabled';
                                                }
                                                return '';
                                            })
                                            .attr('uib-tooltip-template', function (d) {
                                                if (scope.hasSub) {
                                                    return "'templates/pop.html'";
                                                }
                                                return '';
                                            })
                                            .attr('uib-tooltip', function (d) {
                                                if (scope.hasSub) {
                                                    return '';
                                                }
                                                return d;
                                            })
                                            .attr('tooltip-trigger', function () {
                                                if (scope.hasSub) {
                                                    return 'none';
                                                } else {
                                                    return 'mouseenter';
                                                }
                                            })
                                            .attr('tooltip-append-to-body', 'true')
                                            .attr('tooltip-animation', 'false')
                                            .attr('tooltip-placement', 'top')
                                            .attr('tooltip-is-open', function (d) {
                                                return 'pieLegendTip["' + d + '"]';
                                            })
                                            .on('mouseover', function (d) {
                                                tip.hide(d);
                                                if (!scope.hasSub) {
                                                    return;
                                                }
                                                if (typeof pieLegendInterval !== 'undefined') {
                                                    $interval.cancel(pieLegendInterval);
                                                }
                                                scope.$apply(function () {
                                                    scope.pieLegendTip = {};
                                                    scope.hoveredLegend = d;
                                                    scope.pieLegendTip[d] = true;
                                                });
                                            })
                                            .on('mouseout', function (d) {
                                                if (!scope.hasSub) {
                                                    return;
                                                }
                                                window.pieLegendInterval = $interval(function (x) {
                                                    if (!$(':hover').last().closest('.tooltip').length) {
                                                        scope.pieLegendTip[x] = false;
                                                        $interval.cancel(pieLegendInterval);
                                                    }
                                                }, 1000, 0, true, d);
                                            });

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

                                var keys = ["Not In Pipeline", "In Pipeline"];
                                var keys_length = keys.length;
                                var colors_p;

                                if (keys_length <= 3) {
                                    colors_p = 'colors_3';
                                } else if (keys_length <= 6) {
                                    colors_p = 'colors_6';
                                }else if (keys_length <= 13) {
                                     colors_p = 'colors';
                                } else {
                                    colors_p = 'colors_more';
                                }

                                colors = colors_theme[colors_p];

                                var tF = keys.map(function (d) {
                                  
				   return {state: d, freq: [], total: scope.data[d]};
                                });

                                scope.filtered = tF;

//                                tF.sort(function (a, b) {
//                                    return (b.freq) - (a.freq);
//                                });

                                pieChart(tF);
                                legend(keys);
                            };

                        });

                    }};
            }
]);