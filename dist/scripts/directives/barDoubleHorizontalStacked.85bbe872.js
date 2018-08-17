/*jshint sub:true*/
'use strict';
angular.module('ciscoExecDashApp').directive('barDoubleHorizontalStackedChart', [
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
                keys: '=',
                filtered: '=',
                viewtype: '=',
                categories: '=',
                activecategory: '=',
                action: '=',
                isaccountmanagerlist: '=',
                drillaccountmanager: '&',
                years: '='
            },
            link: function (scope, ele, attrs) {
                var d3 = $window.d3;
                var event = isMobile ? "touchstart" : "click";
                scope.transitionDuration = 500;
                var ele = $(ele[0]).closest('.tile');
                var svgContainer = d3.select(ele[0]).append('div').attr('class', 'scrollContainer').attr('ng-nicescroll', 'true');
                var svg = svgContainer.append('svg');
                var xContainer = d3.select(ele[0]).append('div').attr('class', 'xContainerFixed');
                var xContainerSvg = xContainer.append('svg');
                var table = d3.select(ele[0])
                    .append('table');
                var show = scope.columns;

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
                    xContainerSvg.selectAll('*').remove();
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
                        var hG = {}, hGDim = { t: 10, r: 20, b: 0, l: 30 };
                        var elOffsetWidth = ele[0].offsetWidth;
                        if (elOffsetWidth === 0 && ele.hasClass('ng-hide')) {
                            elOffsetWidth = $(ele[0]).siblings('div.tile-head-area').width();
                        }
                        hGDim.w = (elOffsetWidth) - hGDim.r;
                        hGDim.h = 55 * fData.length - hGDim.t - hGDim.b;

                        var transX;
                        if (scope.action) {
                            transX = 120;
                            hGDim.w -= 15;
                        } else {
                            transX = 95;
                        }

                        if (hGDim.w < 0) {
                            return;
                        }

                        var hGsvg = svg
                            .attr("width", hGDim.w > 0 ? hGDim.w : 0)
                            .attr("height", hGDim.h > 240 ? hGDim.h +15 : 240).append("g")
                            .attr("transform", "translate(" + transX + ",0)");
                        var x = d3.scaleLinear().range([0, hGDim.w - 150]);
                        var y = d3.scaleBand().range([0, hGDim.h])
                            .domain(fD.map(function (d) {
                                return d.state;
                            }));

                        var max = d3.max(fD, function (d) {
                            return d.total;
                        });
                        var max_2 = 0;
                        if (fD_2.length) {
                            max_2 = d3.max(fD_2, function (d) {
                                return d.total;
                            });
                        }
                        max = Math.max(max, max_2);

                        if (scope.active) {
                            x.domain([0, d3.max(sF.filter(function (d) {
                                return d.key == scope.active;
                            }), function (d) {
                                return Math.max(d.value + (d.value * 0.20), max_2);
                            })]);
                        } else {
                            x.domain([0, max + (max * 0.20)]);
                        }

                        var xAxis = d3.axisBottom(x)
                            .tickFormat(function (d) {
                                return $filter('formatValue')(d);
                            }).ticks(3).tickSize(-250);

                        var yAxis = d3.axisLeft(y)
                            .tickFormat(function (d) {
                                return d;
                            });

                        angular.element(ele.find('.scrollContainer')).bind("scroll", function () {
                            var scrollTop = ele.find('.scrollContainer').scrollTop();
                            var element = Math.floor(scrollTop / 55);

                            var activeElements = fD.filter(function (d) {
                                if (scope.active) {
                                    return d.key == scope.active;
                                }
                                    return true;
                            });

                            var keys_count = scope.active ? 1 : keys.length;

                            var max_new = d3.max(activeElements.slice(element * keys_count, (element * keys_count) + (5 * keys_count)), function (d) {
                                if (scope.active) {
                                    return d.value;
                                }
                                    return d.total;
                            });

                            var activeElements_2 = fD_2.filter(function (d) {
                                if (scope.active) {
                                    return d.key == scope.active;
                                }
                                    return true;
                            });
                            
                            var max_new_2 = 0;
                            if (fD_2.length) {
                                max_new_2 = d3.max(activeElements_2.slice(element * keys_count, (element * keys_count) + (5 * keys_count)), function (d) {
                                    if (scope.active) {
                                        return d.value;
                                    }
                                        return d.total;
                                });
                            }

                            max_new = Math.max(max_new, max_new_2);

                            x.domain([0, max_new + (max_new * 0.20)]);
                            xContainerSvg.selectAll("g.x.axis").call(xAxis);

                            var bars = hGsvg.selectAll(".bar").data(sF);

                            bars.select("rect.front").transition().duration(scope.transitionDuration)
                                .attr("x", function (d) {
                                    if (scope.active) {
                                        return 0;
                                    }
                                    return x(d.start);
                                })
                                .attr("width", function (d) {
                                    if (scope.active) {
                                        if (d.key != scope.active) {
                                            return 0;
                                        }
                                        return x(d.value);
                                    }
                                    var m = d.start ? 2 : 2;
                                    var val = x(d.end) - x(d.start) - m;
                                    return val > 0 ? val : 0;
                                });

                            
                            var bars_2 = hGsvg.selectAll(".bar_2").data(sF_2);

                            bars_2.select("rect.front").transition().duration(scope.transitionDuration)
                            .attr("x", function (d) {
                                if (scope.active) {
                                    return 0;
                                }
                                return x(d.start);
                            })
                            .attr("width", function (d) {
                                if (scope.active) {
                                    if (d.key !== scope.active) {
                                        return 0;
                                    }
                                    return x(d.value);
                                }
                                var m = d.start ? 2 : 2;
                                var val = x(d.end) - x(d.start) - m;
                                return val > 0 ? val : 0;
                            });

                        });

                        xContainerSvg.attr("width", hGDim.w)
                            .attr("height", 20);

                        xContainerSvg.append("g")
                            .attr("class", "x axis")
                            .attr("transform", "translate(" + (transX) + "," + (5) + ")")
                            .call(xAxis);

                        var translate = fD_2.length ? "translate(-15,-8)" : "translate(-15,-8)";

                        hGsvg.append("g").attr("class", "y axis")
                            //.attr("transform", translate)
                            .call(yAxis);

                        hGsvg.selectAll('.y.axis .tick text')
                            .call(d3_wrap, y.bandwidth())
                            .on(event, click_area)
                            .attr('uib-tooltip', function (d) {
                                return d;
                            })
                            .attr('tooltip-append-to-body', 'true');

                        if (scope.action) {
                            hGsvg.selectAll("image")
                                .data(d3.map(fD, function (d) {
                                    return d.state;
                                }).keys())
                                .enter()
                                .append("svg:image")
                                .attr('class', 'action-button')
                                .attr("x", function () {
                                    return -120;
                                })
                                .attr("y", function (d) {
                                    return y(d) + (y.bandwidth() + 7) / 2;
                                })
                                .attr('width', 5)
                                .attr('height', 14)
                                .attr("xlink:href", "images/more.svg")
                                .on('mouseover', actionMouseover)
                                .on('mouseout', actionMouseout);
                        }

                        $compile(ele.find('.scrollContainer'))(scope);
                        $compile(ele.find('.y.axis .tick text'))(scope);

                        var tip = d3.tip()
                            .attr('class', 'd3-tip')
                            .offset([-10, 0])
                            .html(function (d) {
                                return "<strong>" + d.state + "</strong><span style='color:" + segColor(d.key) + "'>" + d.key + ": " + (d.sfdc ? $filter('formatValue')(d.total) : $filter('formatValue')(d.value)) + "</span><span>Total: " + $filter('formatValue')(d.total) + ' </span>';
                            });
                        hGsvg.call(tip);

                        var bars = hGsvg.selectAll(".bar").data(fD).enter()
                            .append("g").attr("class", "bar");

                        bars.append("rect")
                            .attr("class", function (d, i) {
                                return 'front front_' + i;
                            })
                            .attr("x", function (d) {
                                if (scope.active) {
                                    return 0;
                                }
                                return x(d.start);
                            })
                            .attr("y", function (d) {
                                return y(d.state) + (y.bandwidth() - 15) / 2;
                            })
                            .attr("width", function (d) {
                                if (scope.active) {
                                    if (d.key != scope.active) {
                                        return 0;
                                    }
                                    return x(d.value);
                                }
                                var m = d.start ? 2 : 2;
                                var val = x(d.end) - x(d.start) - m;
                                return val > 0 ? val : 0;
                            })
                            .attr("height", function (d) {
                                return 15;
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
                                return scope.years[0];
                            })
                            .style("fill", function (d) {
                                return '#777';
                            })
                            .attr("x", function (d) {
                                return hGDim.w - 130;
                            })
                            .attr("y", function (d) {
                                return y(d.state) + 30;
                            });


                        var bars_2 = hGsvg.selectAll(".bar_2").data(fD_2).enter()
                            .append("g").attr("class", "bar_2");

                        bars_2.append("rect")
                            .attr("class", function (d, i) {
                                return 'front front_' + i;
                            })
                            .attr("x", function (d) {
                                if (scope.active) {
                                    return 0;
                                }
                                return x(d.start);
                            })
                            .attr("y", function (d) {
                                return y(d.state) + (y.bandwidth() - 15) / 2 + 18;
                            })
                            .attr("width", function (d) {
                                if (scope.active) {
                                    if (d.key !== scope.active) {
                                        return 0;
                                    }
                                    return x(d.value);
                                }
                                var m = d.start ? 2 : 2;
                                var val = x(d.end) - x(d.start) - m;
                                return val > 0 ? val : 0;
                            })
                            .attr("height", function (d) {
                                return 15;
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
                                return scope.years[1];
                            })
                            .style("fill", function (d) {
                                return '#777';
                            })
                            .attr("x", function (d) {
                                return hGDim.w - 130;
                            })
                            .attr("y", function (d) {
                                return y(d.state) + 30 + 20;
                            });

                        if (typeof areaWatch !== 'undefined') {
                            areaWatch();
                        }

                        var areaWatch = scope.$watch('area', function (newVals, oldVals) {
                            select_area();
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
                            areaWatch();
                            activeWatch();
                        });

                        function mouseover(t) {

                            var max_1 = d3.max(sF.filter(function (d) {
                                return d.key == t;
                            }), function (d) {
                                return d.value;
                            });

                            var max_2 = d3.max(sF_2.filter(function (d) {
                                return d.key == t;
                            }), function (d) {
                                return d.value;
                            });

                            max_1 = Math.max(max_1, max_2);

                            x.domain([0, max_1 + (max_1 * 0.20)]);

                            xContainerSvg.selectAll("g.x.axis")
                                .call(xAxis);

                            var bars = hGsvg.selectAll(".bar").data(sF);
                            bars.select("rect.back").transition().duration(scope.transitionDuration)
                                .attr("x", function (d) {
                                    if (d.key != t)
                                        return 0;
                                    return x(d.value);
                                })
                                .attr("width", function (d) {
                                    if (d.key != t)
                                        return 0;
                                    return ((x.range()[1]) - x(d.value)) > 0 ? ((x.range()[1]) - x(d.value)) : 0;
                                });
                            bars.select("rect.front").transition().duration(scope.transitionDuration)
                                .attr("x", function (d) {
                                    return 0;
                                })
                                .attr("width", function (d) {
                                    if (d.key !== t)
                                        return 0;
                                    return x(d.value);
                                })
                                .attr('fill', function (d) {
                                    if (scope.area.length && scope.area.indexOf(d.state) === -1) {
                                        return '#ccc';
                                    }
                                    return segColor(d.key);
                                });

                            var bars_2 = hGsvg.selectAll(".bar_2").data(sF_2);

                            bars_2.select("rect.back").transition().duration(scope.transitionDuration)
                                .attr("x", function (d) {
                                    if (d.key !== t)
                                        return 0;
                                    return x(d.value);
                                })
                                .attr("width", function (d) {
                                    if (d.key !== t)
                                        return 0;
                                    return ((x.range()[1]) - x(d.value)) > 0 ? ((x.range()[1]) - x(d.value)) : 0;
                                });

                            bars_2.select("rect.front").transition().duration(scope.transitionDuration)
                                .attr("x", function (d) {
                                    return 0;
                                })
                                .attr("width", function (d) {
                                    if (d.key !== t)
                                        return 0;
                                    return x(d.value);
                                })
                                .attr('fill', function (d) {
                                    if (scope.area.length && scope.area.indexOf(d.state) === -1) {
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

                        function actionMouseover(e) {
                            if (typeof actionInterval !== 'undefined') {
                                $interval.cancel(actionInterval);
                            }
                            if (typeof e === "object") {
                                e = e.state;
                            }
                            $('.action_offset a').attr("state-id", e);
                            $('.action_offset').show().css({
                                'top': ($(this).offset().top + 30),
                                'left': $(this).offset().left,
                            })
                        }

                        function actionMouseout(e) {
                            window.actionInterval = $interval(function () {
                                if (!$(':hover').last().closest('.action_offset').length) {
                                    $('.action_offset').hide();
                                    $interval.cancel(actionInterval);
                                }
                            }, 300);
                        }

                        function mouseout() {
                            x.domain([0, max + (max * 0.20)]);

                            xContainerSvg.selectAll("g.x.axis")
                                .call(xAxis);

                            var bars = hGsvg.selectAll(".bar").data(sF);
                            bars.select("rect.back").transition().duration(scope.transitionDuration)
                                .attr("x", function (d) {
                                    return x(d.end);
                                })
                                .attr("width", function (d) {
                                    return (x.range()[1]) - x(d.total) > 0 ? (x.range()[1]) - x(d.total) : 0;
                                });
                            bars.select("rect.front").transition().duration(scope.transitionDuration)
                                .attr("x", function (d) {
                                    return x(d.start);
                                })
                                .attr("width", function (d) {
                                    var m = d.start ? 2 : 2;
                                    var val = x(d.end) - x(d.start) - m;
                                    return val > 0 ? val : 0;
                                })
                                .attr('fill', function (d) {
                                    if (scope.area.length && scope.area.indexOf(d.state) === -1) {
                                        return '#ccc';
                                    }
                                    return segColor(d.key);
                                });

                            var bars_2 = hGsvg.selectAll(".bar_2").data(sF_2);
                            bars_2.select("rect.back").transition().duration(scope.transitionDuration)
                                .attr("x", function (d) {
                                    return x(d.end);
                                })
                                .attr("width", function (d) {
                                    return (x.range()[1]) - x(d.total) > 0 ? (x.range()[1]) - x(d.total) : 0;
                                });
                            bars_2.select("rect.front").transition().duration(scope.transitionDuration)
                                .attr("x", function (d) {
                                    return x(d.start);
                                })
                                .attr("width", function (d) {
                                    var m = d.start ? 2 : 2;
                                    var val = x(d.end) - x(d.start) - m;
                                    return val > 0 ? val : 0;
                                })
                                .attr('fill', function (d) {
                                    if (scope.area.length && scope.area.indexOf(d.state) === -1) {
                                        return '#ccc';
                                    }
                                    return segColor(d.key);
                                });
                            table.selectAll("td").attr('class', function (e) {
                                return '';
                            });
                        }

                        function click_area(d) {
                            if (scope.isaccountmanagerlist) {
                                scope.drillaccountmanager({ arg1: true, arg2: d });
                                scope.listamountselected = 0;
                                scope.linecountselected = 0;
                                return;
                            }

                            var type = d;
                            if (scope.area.indexOf(type) > -1) {
                                if (d3.event.ctrlKey || d3.event.metaKey) {
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
                                if (!d3.event.ctrlKey && !d3.event.metaKey) {
                                    scope.area = [];
                                }
                                scope.area.push(type);
                            }
                            scope.$apply();
                            $('.tooltip').remove();
                        }

                        function select_area() {
                            var bars = hGsvg.selectAll(".bar").data(sF);

                            bars.attr('class', function (d) {
                                var c = 'bar';
                                if (scope.area.indexOf(d.state) > -1) {
                                    c += ' quarter_selected';
                                }
                                return c;
                            });

                            bars.select("rect.front").transition().duration(scope.transitionDuration)
                                .attr('fill', function (d) {
                                    if (scope.area.length && scope.area.indexOf(d.state) === -1) {
                                        return '#ccc';
                                    }
                                    return segColor(d.key);

                                });

                            var bars_2 = hGsvg.selectAll(".bar_2").data(sF_2);

                            bars_2.attr('class', function (d) {
                                var c = 'bar_2';
                                if (scope.area.indexOf(d.state) > -1) {
                                    c += ' quarter_selected';
                                }
                                return c;
                            });

                            bars_2.select("rect.front").transition().duration(scope.transitionDuration)
                                .attr('fill', function (d) {
                                    if (scope.area.length && scope.area.indexOf(d.state) === -1) {
                                        return '#ccc';
                                    }
                                    return segColor(d.key);
                                });

                            hGsvg.selectAll(".y.axis .tick text")
                                .attr('class', function (d) {
                                    var c = '';
                                    if (scope.area.indexOf(d) > -1) {
                                        c = 'quarter_selected';
                                    }
                                    return c;
                                });
                        }

                        function unselect_area() {
                            var bars = hGsvg.selectAll(".bar").data(sF);

                            bars.attr('class', function (d) {
                                var c = 'bar';
                                return c;
                            });

                            bars.select("rect.front").transition().duration(scope.transitionDuration)
                                .attr('fill', function (d) {
                                    return segColor(d.key);
                                });

                            hGsvg.selectAll(".y.axis .tick text")
                                .attr('class', function (d) {
                                    var c = '';
                                    return c;
                                });
                        }

                        function bar_mouseover(e, i) {
                            bars.select("rect.front.front_" + i)
                                .attr('fill', function (d) {
                                    if ((scope.area.length && scope.area.indexOf(d.state) === -1) || d.key !== e.key) {
                                        return segColor(d.key);
                                    }
                                    return $filter('darken')(segColor(d.key));
                                });
                            bars_2.select("rect.front.front_" + i)
                                .attr('fill', function (d) {
                                    if ((scope.area.length && scope.area.indexOf(d.state) === -1) || d.key !== e.key) {
                                        return segColor(d.key);
                                    }
                                    return $filter('darken')(segColor(d.key));
                                });
                            //hide tooltip on zoom in/out
                            $(window).resize(function () {
                                tip.hide(e);
                            });
                            tip.show(e);
                        }

                        function bar_mouseout(d, i) {
                            bars.select("rect.front.front_" + i)
                                .attr('fill', function (d) {
                                    if (scope.area.length && scope.area.indexOf(d.state) === -1) {
                                        return '#ccc';
                                    }
                                    return segColor(d.key);
                                });
                            bars_2.select("rect.front.front_" + i)
                                .attr('fill', function (d) {
                                    if (scope.area.length && scope.area.indexOf(d.state) === -1) {
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

                    data.forEach(function (d) {
                        if (d.quarter !== "DUMMY" && (scope.quarter.length && scope.quarter.indexOf(d.quarter) === -1)) {
                            return;
                        }
                        var areas = d.areas;
                        areas.forEach(function (e) {
                            var ifAdded = $filter('keyValueInArray')(fData, e.state);
                            if (ifAdded !== -1) {
                                var b = e.freq;
                                var b_2 = e.freq_2;
                                for (var prop in b) {
                                    if (typeof fData[ifAdded].freq[prop] !== 'undefined') {
                                        fData[ifAdded].freq[prop] += b[prop];
                                    } else {
                                        fData[ifAdded].freq[prop] = b[prop];
                                    }
                                }
                                for (var prop in b_2) {
                                    if (typeof fData[ifAdded].freq_2[prop] !== 'undefined') {
                                        fData[ifAdded].freq_2[prop] += b_2[prop];
                                    } else {
                                        fData[ifAdded].freq_2[prop] = b_2[prop];
                                    }
                                }
                            } else {
                                fData.push(e);
                            }
                        });
                    });


                    scope.filtered = fData;

                    fData.forEach(function (d) {
                        d.total = 0;
                        for (var prop in d.freq) {
                            d.total += d.freq[prop];
                        }
                    });

                    fData.forEach(function (d) {
                        d.total_2 = 0;
                        for (var prop in d.freq_2) {
                            d.total_2 += d.freq_2[prop];
                        }
                    });

                    fData.sort(function (a, b) {
                        return (b.total + b.total_2) - (a.total + a.total_2);
                    });

                    var sF = [];
                    var yColumn = [];
                    fData.forEach(function (d) {
                        for (var prop in d.freq) {
                            if (!yColumn[d.state]) {
                                yColumn[d.state] = 0;
                            }
                            if (d.total >= 0) {
                                sF.push({
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
                            if (d.total_2 >= 0) {
                                sF_2.push({
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

                    keys = ciscoUtilities.getUniqueKeys(sF, "key");

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