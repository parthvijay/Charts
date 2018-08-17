/*jshint sub:true*/
'use strict';
angular.module('ciscoExecDashApp').directive('barDoubleHorizontalChart', [
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
                selectedbars: '=?',
                copytodom: '=',
                colors: '=',
                columns: '=',
                expanded: '=',
                active: '=',
                sidebar: '=',
                keys: '=',
                filtered: '=',
                quarter: '=',
                area: '=',
                viewtype: '=',
                activecategory: '=',
                action: '=',
                isaccountmanagerlist: '=',
                drillaccountmanager: '&',
                selectionTitle: '=',
                activeOpp: '=',
                selectionenabled: '=',
                selectionenabledarea: '=',
                checkedstates: '=',
                allowreports: "=",
                linecount: '=',
                linecountselected: '=',
                listamount: '=',
                listamountselected: '='
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

                var refreshAllData = function () {
                    scope.$emit('refresh-all-data', {
                        'pcNodeName': JSON.stringify(scope.area)
                    });
                };

                var groupWatch = scope.$watchGroup(['data', 'columns', 'expanded', 'sidebar', 'viewtype', 'activecategory', 'isaccountmanagerlist'], function (newVals, oldVals) {
                    if (!scope.data) {
                        return;
                    }
                    if (scope.sidebar) {
                        $timeout(function () {
                            scope.render(scope.data);
                        });
                    }
                }, true);

                var quarterWatch = scope.$watch('quarter', function (newVals, oldVals) {
                    if (!scope.data) {
                        return;
                    }
                    if (scope.sidebar) {
                        $timeout(function () {
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
                                        if (scope.checkedstates.includes(individualData['quarter']))
                                            data.push(individualData)
                                    }
                                    scope.render(data)
                                } else {
                                    scope.render(scope.data);
                                }
                            }
                            else
                                scope.render(scope.data);
                        });
                    }
                }, true);

                scope.$on('$destroy', function () {
                    groupWatch();
                    quarterWatch();
                    domWatch();
                });

                function segColor(c) {
                    var constant = $window.ciscoConfig.colorsPalette[$rootScope.dashboard   ]['constant'][c];
                    if (typeof constant !== 'undefined') {
                        return constant;
                    }
                    var size = Object.keys(scope.colorsOpp).length;
                    if (!scope.colorsOpp[c]) {
                        scope.colorsOpp[c] = colors[size];
                    }
                    return scope.colorsOpp[c];
                }

                function healthColor(c) {
                    var a = c.freq['Actionable Opportunity'] ? c.freq['Actionable Opportunity'] : 0;
                    var b = c.freq['SFDC Pipeline'] ? c.freq['SFDC Pipeline'] : 0;
                    var colors = {"red": "#C82127", "yellow": "#F7972D", "green": "#259E47", "black": "#000"};
                    if (!a) {
                        return colors['black'];
                    }
                    if (!b) {
                        return colors['red'];
                    }
                    else if (a >= b) {
                        return colors['yellow'];
                    }
                    else if (b > a) {
                        return colors['green'];
                    }
                }

                scope.render = function (data2) {
                    svg.selectAll('*').remove();
                    xContainerSvg.selectAll('*').remove();
                    table.selectAll('*').remove();
                    scope.colorsOpp = {};

                    var data = angular.copy(data2);
                    if (!data || !data.length) {
                        return;
                    }

                    function histoGram(fD) {
                        if (!fD.length) {
                            return;
                        }
                        var hG = {}, hGDim = {t: 10, r: 40, b: 0, l: 30};
                        var elOffsetWidth = ele[0].offsetWidth;
                        if (elOffsetWidth === 0 && ele.hasClass('ng-hide')) {
                            elOffsetWidth = $(ele[0]).siblings('div.tile-head-area').width();
                        }
                        hGDim.w = (elOffsetWidth) - hGDim.r;
                        hGDim.h = 55 * fData.length - hGDim.t - hGDim.b;
                        var transX;
                        if (scope.action || scope.allowreports) {
                            transX = 120;
                        }
                        else {
                            transX = 60;
                        }

                        var hGsvg = svg
                                .attr("width", hGDim.w > 0 ? hGDim.w : 0)
                                .attr("height", (hGDim.h + 30) > 240 ? (hGDim.h + 30) : 240).append("g")
                                .attr("transform", "translate(" + transX + ",40)");
                        var x = d3.scaleLinear().range([0, hGDim.w - 100]);
                        var y = d3.scaleBand().range([0, hGDim.h])
                                .domain(fD.map(function (d) {
                                    return d.state;
                                }));
                        var max = d3.max(fD, function (d) {
                            return d.value;
                        });
                        if (scope.active) {
                            x.domain([0, d3.max(sF.filter(function (d) {
                                    return d.key == scope.active;
                                }), function (d) {
                                    return d.value + (d.value * 0.15);
                                })]);
                        }
                        else {
                            x.domain([0, max + (max * 0.15)]);
                        }

                        var xAxis = d3.axisBottom(x)
                                .tickFormat(function (d) {
                                    return $filter('formatValue')(d);
                                }).ticks(3);

                        var yAxis = d3.axisLeft(y)
                                .tickFormat(function (d) {
                                    return '';
                                });

                        angular.element(ele.find('.scrollContainer')).bind("scroll", function () {
                            $('.action_offset').hide();
                            var scrollTop = ele.find('.scrollContainer').scrollTop();
                            var element = Math.floor(scrollTop / 55);

                            var max_new = d3.max(fD.slice(element * keys.length, (element * keys.length) + (4 * keys.length)), function (d) {
                                return d.total;
                            });
                            x.domain([0, max_new + (max_new * 0.15)]);
                            xContainerSvg.selectAll("g.x.axis").call(xAxis);

                            var bars = hGsvg.selectAll(".bar").data(fD);

                            bars.select("rect.front").transition().duration(scope.transitionDuration)
                                .attr("width", function (d) {

                                var m = d.start ? 2 : 2;
                                var val = x(d.end) - x(d.start) - m;
                                return val > 0 ? val : 0;

                                });

                        });
                        if (hGDim.w > 0) {
                            xContainerSvg.attr("width", hGDim.w)
                            .attr("height", 20);
                        }

                        xContainerSvg.append("g")
                            .attr("class", "x axis")
                            .attr("transform", "translate(" + (transX) + "," + (5) + ")")
                            .call(xAxis);

                        // hGsvg.append("g").attr("class", "y axis")
                        //     .attr("transform", "translate(0,0)")
                        //     .call(yAxis);

                        // hGsvg.selectAll('.y.axis .tick')
                        //     .attr('transform', function (d) {
                        //         return "translate(" + (100) + "," + (y(d) + 10) + ")";
                        //     });

                        hGsvg.selectAll(".y-axis-label")
                            .data(fData)
                            .enter()
                            .append("text")
                            .attr("class", "y-axis-label")
                            .text(function (d) {
                                    if (d.state.length < 15) {
                                        return d.state;
                                    } else {
                                        return d.state.substr(0, 15) + '...';
                                    }
                            })
                            .attr("x", function (d) {
                                return 0;
                            })
                            .attr("y", function (d) {
                                return y(d.state) + (y.bandwidth() - 25) / 2;
                            })
                            .on(event, open_dropdown);
                        $compile(ele.find(".y-axis-label"))(scope);

                        hGsvg.selectAll(".y-axis-label")
                                .attr('uib-tooltip', function (d) {
                                    return d.state;
                                })
                                .attr('tooltip-append-to-body', 'true');

                        function click_area(d) {
                            if (scope.isaccountmanagerlist) {
                                scope.drillaccountmanager({arg1: true, arg2: d.state});
                                scope.listamountselected = 0;
                                scope.linecountselected = 0;
                                return;
                            }

                if (!scope.selectionenabledarea) {
                                return;
                            }
                            var type = d.state;

                            if (scope.area.indexOf(type) > -1) {
                                if (d3.event.ctrlKey || d3.event.metaKey) {
                                    scope.area.splice(scope.area.indexOf(type), 1);
                                }
                                else {
                                    if (scope.area.length === 1) {
                                        scope.area = [];
                                    }
                                    else {
                                        scope.area = [];
                                        scope.area.push(type);
                                    }
                                }
                            }
                            else {
                                if (!d3.event.ctrlKey && !d3.event.metaKey) {
                                    scope.area = [];
                                }
                                scope.area.push(type);
                            }
                            scope.$apply();
                            refreshAllData();
                        }

                        function select_area() {
                            var bars = hGsvg.selectAll(".bar").data(sF);

                            bars.select("rect.front").transition().duration(scope.transitionDuration)
                                .attr('fill', function (d) {
                                    if (scope.area.length && scope.area.indexOf(d.state) === -1) {
                                        return '#ccc';
                                    }
                                    return segColor(d.key);
                                });

                            hGsvg.selectAll(".y-axis-label")
                                .attr('class', function (d) {
                                    var c = 'y-axis-label';
                                    if (scope.area.length && scope.area.indexOf(d.state) > -1) {
                                        c += ' quarter_selected';
                                    }
                                    return c;
                                });

                            if (scope.activeOpp !== 'partner') {
                                hGsvg.selectAll(".y-axis-health")
                                        .style('fill', function (d) {
                                            if (scope.area.length && scope.area.indexOf(d.state) === -1) {
                                                return '#ccc';
                                            }
                                            return healthColor(d);
                                        });
                            }
                        }

                        function open_dropdown(e) {
                            var state;
                            var stateId
                            if (typeof e === "object") {
                                state = e.state;
                                stateId = e.stateId;
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
                        }

                        if (scope.activeOpp !== 'partner') {
                            hGsvg.selectAll(".y-axis-health")
                                .data(fData)
                                .enter()
                                .append("circle")
                                .attr("class", "y-axis-health")
                                .attr("r", 8)
                                .attr("cx", function (d) {
                                    return -50;
                                })
                                .attr("cy", function (d) {
                                    return (y(d.state) != undefined ? y(d.state) : 0 ) + (y.bandwidth() - 10) / 2;
                                })
                                .style('fill', function (d) {
                                    return healthColor(d);
                                }).style('display', function (d) {
                                    return (y(d.state) == undefined) ? 'none' : true;
                                });

                            hGsvg.append("text")
                                .attr("class", "y-axis-health-head")
                                .text(function (d) {
                                    return 'Health';
                                })
                                .attr("x", function (d) {
                                    return -70;
                                })
                                .attr("y", function (d) {
                                    return -20;
                                });

                        }

                        hGsvg.append("text")
                            .attr("class", "y-axis-label-head")
                            .text(function (d) {
                                return ciscoUtilities.getOppHeading(scope.selectionTitle);
                            })
                            .attr("x", function (d) {
                                return 0;
                            })
                            .attr("y", function (d) {
                                return -20;
                            });
                            // ux fix for checkboxes in patners
                      //  if (scope.action || scope.allowreports) {
                            /*
                            hGsvg
                                .append("text")
                                .attr("class", "y-axis-health-head")
                                .text(function (d) {
                                    return 'Actions';
                                })
                                .attr("x", function (d) {
                                    return -140;
                                })
                                .attr("y", function (d) {
                                    return -20;
                                });
                                */

                            hGsvg.selectAll("image")
                                .data(fData)
                                .enter()
                                .append("svg:image")
                                .attr('class', 'action-button')
                                .attr('id', function(d){
                                    return "checkbox-"+d.state;
                                })
                                .attr("x", function () {
                                    return -120;
                                })
                                .attr("y", function (d) {
                                   return ((y(d.state) != undefined) ? y(d.state) : 0) + (y.bandwidth() - 22) / 2;
                                })
                                .attr('width', 16)
                                .attr('height', 16)
                                .attr("xlink:href", function(d){
                                    return (scope.checkedstates.indexOf(d.state) == -1)? "images/checkbox.svg" : "images/checkbox-enable.svg"
                                })
                                .on('click', clickCheckBox)
                                .style('display', function (d) {
                                    return (y(d.state) == undefined) ? 'none' : true;
                                })
                      //  }

                        $compile(ele.find('.scrollContainer'))(scope);

                        var tip = d3.tip()
                                .attr('class', 'd3-tip')
                                .offset([-10, 0])
                                .html(function (d) {
                                    return "<strong>" + d.state + "</strong><span style='color:" + segColor(d.key) + "'>" + d.key + ": $" + $filter('formatValue')(d.value) + "</span>";
                                });

                        hGsvg.call(tip);

                        var bars = hGsvg.selectAll(".bar").data(fD).enter()
                                .append("g").attr("class", "bar");

                        bars.append("rect")
                            .attr("class", function (d, i) {
                                return 'front front_' + i;
                            })
                            .attr("x", function (d) {
                                return 0;
                            })
                            .attr("y", function (d) {
                                var m = d.start ? 10 : 0;
                                return (y(d.state) != undefined ? y(d.state) : 0) + (y.bandwidth() - 16) / 2 + m
                            })
                            .attr("width", function (d) {
                                // if (scope.active) {
                                //     if (d.key != scope.active) {
                                //         return 0;
                                //     }
                                //     return x(d.value);
                                // }
                                var m = d.start ? 2 : 2;
                                var val = x(d.end) - x(d.start) - m;
                                return val > 0 ? val : 0;
                            })
                            .attr("height", function (d) {
                                return 8;
                            })
                            .attr('fill', function (d) {
                                if (scope.area.length && scope.area.indexOf(d.state) === -1) {
                                    return '#ccc';
                                }
                                return segColor(d.key);
                            })
                            .on('mouseover', bar_mouseover)
                            .on('mouseout', bar_mouseout);

                        if (typeof areaWatch !== 'undefined') {
                            areaWatch();
                        }

                        var areaWatch = scope.$watch('area', function (newVals, oldVals) {
                            select_area();
                        }, true);

                        scope.$on('$destroy', function () {
                            areaWatch();
                        });

                        function bar_mouseover(d, i) {
                            bars.select("rect.front.front_" + i)
                                .attr('fill', function (d) {
                                    if (scope.area.length && scope.area.indexOf(d.state) === -1) {
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

                        function clickCheckBox(e) {
                            if (typeof e === "object") {
                                e = e.state;
                            }
                            var checkedStatus = ($(this).attr("href") == "images/checkbox.svg")? true : false;
                                  var a = $filter('filter')(scope.linecount, { title: e });
                                  var b = $filter('filter')(scope.listamount, { title: e });
                            if(checkedStatus) {
                                $(this).attr("href", "images/checkbox-enable.svg");
                                if(scope.checkedstates.length == 0 || scope.checkedstates.indexOf(e) == -1) {
                                    scope.checkedstates.push(e);
                                }
                                //ux code fix  -- srinath,akash
                                //if (a.length ) 
                                if( a!= undefined){
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
                            if (a.length) {
                                scope.linecountselected = parseInt(scope.linecountselected);
                                scope.linecountselected -= a[0].value;
                                scope.listamountselected += b[0].value;
                            }
                                scope.$apply();
                            }
                        }

                        function close_dropdown(e) {
                            window.actionInterval = $interval(function () {
                                if (!$(':hover').last().closest('.action_offset').length) {
                                    $('.action_offset').hide();
                                    $interval.cancel(actionInterval);
                                }
                            }, 300);
                        }



                    function legend(keys) {
                        var len = keys.length;
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
                        var td = tr.selectAll("td").data(keys).enter().append("td").append('div');
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

                    var keys = scope.keys;
                    var fData = [];
                    if(!scope.checkedstates)
                        scope.checkedstates = [];

                    data.forEach(function (d) {
                        var o = {};
                        o.state = d.quarter;
                        o.stateId = d.stateId;
                        o.health = d.health;
                        o.freq = {};
                        var areas = d.areas;
                        areas.forEach(function (e) {
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

                    var cData = angular.copy(scope.data);

                    cData.forEach(function (d) {
                        var o = {};
                        o.state = d.quarter;
                        o.stateId = d.stateId;
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

                    var sortedCData = [];
                    sortedCData = angular.copy(cData);
                    scope.filtered = sortedCData;

                    sortedCData.forEach(function (d) {
                        d.total = 0;
                        for (var prop in d.freq) {
                            d.total += d.freq[prop];
                        }
                    });

                    sortedCData.sort(function (a, b) {
                        return b.total - a.total;
                    });


                    fData.forEach(function (d) {
                        d.total = 0;
                        for (var prop in d.freq) {
                            d.total += d.freq[prop];
                        }
                    });

                    fData.sort(function (a, b) {
                        return b.total - a.total;
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
                                    value: d.freq[prop],
                                    stateId: d.stateId
                                });
                                yColumn[d.state] += d.freq[prop];
                            }
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

                    if (scope.viewtype === 'list') {
                        return;
                    }
                    histoGram(sF);
                    legend(keys);
                };
            }};
    }
]);
