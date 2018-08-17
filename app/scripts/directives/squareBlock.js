'use strict';
angular.module('ciscoExecDashApp').directive('squareBlockChart', [
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
                copytodom: '=',
                colors: '=',
                columns: '=',
                expanded: '=',
                active: '=',
                sidebar: '=',
                quarter: '=',
                filtered: '=',
                action: '=',
                area: '=',
                slug: '=',
                view: '=',
                currentmonth: '=',
                selection: '=',
                selectionTitle: '=',
                viewtype: '=',
                checkedstates: '=',
                allowreports: '='
            },
            link: function (scope, ele, attrs) {
                var d3 = $window.d3;
                var event = isMobile ? "touchstart" : "click";

                scope.transitionDuration = 500;
                var ele = $(ele[0]).closest('.tile');
                //remove previous graph
                ele.find('svg, table, .scrollContainer, .xContainerFixed').remove();
                var svgContainer = d3.select(ele[0]).append('div').attr('class', 'scrollContainer').attr('ng-nicescroll', 'true');
                var svg = svgContainer.append('svg');
                var xContainer = d3.select(ele[0]).append('div').attr('class', 'xContainerFixed');
                var xContainerSvg = xContainer.append('svg');

                var table = d3.select(ele[0])
                    .append('table');

                var show = scope.columns;
                var start = 0;
                var start_max = 0;
                var data = [];
                scope.currentweek;

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
                var groupWatch = scope.$watchGroup(['data', 'columns', 'viewtype'], function (newVals, oldVals) {
                    if (!scope.data) {
                        return;
                    }
                   // start = 0;
                    //start_max = 0;
                    $timeout(function () {
                      //  setDefaultView();
                        scope.render(scope.data);
                    });
                }, true);

                var expandWatch = scope.$watch('expanded', function (newVals, oldVals) {
                    start = 0;
                    start_max = 0;
                    $timeout(function () {
                        if (!scope.data) {
                            return;
                        }
                        scope.render(scope.data);
                    }, 20);
                }, true);

                var colorsWatch = scope.$watch('colors', function (newVals, oldVals) {
                    $timeout(function () {
                        if (!scope.data) {
                            return;
                        }
                        scope.render(scope.data);
                    });
                }, true);

                var domWatch = scope.$watch('copytodom', function (newVals, oldVals) {
                    if (newVals !== oldVals) {
                        $timeout(function () {
                            if (scope.checkedstates.length > 0) {
                                if (scope.copytodom) {
                                    var originalData = [];
                                    for (var individualData of scope.data) {
                                        var selectedArea = [];
                                        var allAreas = [];
                                        for (var selectedState of individualData['areas']) {
                                            if (scope.checkedstates.includes(selectedState['state']))
                                                selectedArea.push(selectedState)
                                            allAreas.push(selectedState)
                                        }
                                        individualData['areas'] = selectedArea;
                                        originalData.push({"quarter": individualData['quarter'], "areas": allAreas})
                                    }
                                    scope.render(scope.data)
                                    for (var i = 0; i < originalData.length; i++) {
                                        scope.data[i] = originalData[i];
                                    }
                                } else {
                                    scope.render(scope.data);
                                }
                            }
                            else
                                scope.render(scope.data);
                        });
                    }
                }, true);
                var areaWatch = scope.$watch('area', function (newVals, oldVals) {
                    $timeout(function () {
                        if (!scope.data) {
                            return;
                        }
                        //setDefaultView();
                        scope.render(scope.data);
                    });
                }, true);

                scope.$on('$destroy', function () {
                    groupWatch();
                    expandWatch();
                    colorsWatch();
                    areaWatch();
                    domWatch();
                });

                function segColor(c) {
                    var constant = $window.ciscoConfig.colorsPalette[$rootScope.dashboard]['constant'][c];
                    if (typeof constant !== 'undefined') {
                        return constant;
                    }
                    if (scope.colors===undefined) {
                        scope.colors = {};
                    }
                    var size = Object.keys(scope.colors).length;
                    if (!size || !scope.colors[c]) {
                        size = Object.keys(scope.colorsOpp).length;
                        if (!scope.colorsOpp[c]) {
                            scope.colorsOpp[c] = colors[size];
                        }
                        return scope.colorsOpp[c];
                    }
                    return scope.colors[c];
                }

                scope.render = function (data2) {
                    svg.selectAll('*').remove();
                    xContainerSvg.selectAll("*").remove();
                    table.selectAll('*').remove();
                    scope.colorsOpp = {};

                    var data = angular.copy(data2);
                    if (!data || !data.length) {
                        return;
                    }

                    function histoGram(fD, mF) {

                        var margin = {top: 20, bottom: 20, left: 70, right: 20};
                        margin.width = ele[0].offsetWidth - margin.right;
                        margin.height = 55 * totalY.length - margin.top - margin.bottom;
                        var width = ele[0].offsetWidth;
                        var height = 55 * totalY.length;
                        var transX;
                        if (scope.action || scope.allowreports) {
                            transX = 105;
                            margin.width -= 15;
                        } else {
                            transX = 105;
                        }
                        var userAgent = $window.navigator.userAgent;
                       if(userAgent.indexOf('Firefox') > -1){
                            transX = transX + 8;
                        }

                        if (margin.width < 0) {
                            return;
                        }
                        var hGsvg = svg
                            .attr("width", margin.width > 0 ? margin.width : 0)
                            .attr("height", (margin.height - 15) > 240 ? (margin.height - 15) : 240)
                            .append("g")
                            .attr("transform", "translate(" + transX + "," + 0 + ")");


                        var x = d3.scaleBand().rangeRound([0, margin.width - 100])
                            .padding(0.1)
                            .align(0.1)
                            .domain(fD.map(function (d) {
                                return d.state;
                            }));
                        var xAxis = d3.axisBottom(x)
                            .tickSize(-250)
                            .tickPadding(5);

                        xContainerSvg.attr("width", margin.width)
                            .attr("height", 20);

                        xContainerSvg.append("g")
                            .attr("class", "x axis")
                            .attr("transform", "translate(" + (104) + "," + 2 + ")")
                            .call(xAxis);

                        xContainerSvg.selectAll(".x.axis .tick text")
                            .call(d3_wrap, x.bandwidth());

                        xContainerSvg.selectAll(".x.axis .tick text")
                            .attr("state-id", function (d, i) {
                                for (var j = 0; j < fD.length; j++) {
                                    if (fD[j].state === d) {
                                        return fD[j].stateId;
                                    }
                                }
                                return -1;
                            });

                        var y = d3.scaleBand().rangeRound([0, margin.height])
                            .domain(fD.map(function (d) {
                                return d.tag;
                            }));

                        var yAxis = d3.axisLeft(y);

                       //DE141897 - Arun Dada
                        hGsvg.append("g").attr("class", "y axis")
                            //DE151312- Customer name not seen fully and is chopped off in TS attach performance, customer chart
                            .attr("transform", "translate(0,0)")
                            .call(yAxis);

                        hGsvg.selectAll('.y.axis .tick text')
                            .call(d3_wrap, y.bandwidth())
                           // .on(event, open_dropdown)
                            .attr('uib-tooltip', function (d) {
                                return d;
                            })
                            .attr('tooltip-append-to-body', 'true');
                            // ux fix for checkboxes in patners
                       // if (scope.action || scope.allowreports) {
                            hGsvg.selectAll(".action-button")
                                .data(d3.map(fD, function (d) {
                                    return d.tag;
                                }).keys())
                                .enter()
                                .append("svg:image")
                                .attr('class', 'action-button')
                                .attr('id', function(d){
                                    return "checkbox-"+d;
                                })
                                .attr("x", function () {
                                    return -105;
                                })
                                .attr("y", function (d) {
                                    return y(d) + (y.bandwidth() - 10) / 2;
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

                        var tip = d3.tip()
                            .attr('class', 'd3-tip')
                            .offset([-10, 0])
                            .html(function (d) {
                                return "<strong>" + d.state + "</strong>" + d.tag + "<span style='color:" + segColor(d.key) + "'>Days: " + d.value + "</span>";
                            });

                        hGsvg.call(tip);

                        var bars = hGsvg.selectAll(".bar").data(fD).enter()
                            .append("g").attr("class", "bar");

                        bars.append("rect")
                            .attr("class", function (d, i) {
                                return 'front front_' + i;
                            })
                            .attr("x", function (d) {
                                return x(d.state) + (x.bandwidth() / 2 - 7.5);
                            })
                            .attr("y", function (d) {
                                return y(d.tag) + (y.bandwidth() - 15) / 2;
                            })
                            .attr("width", 15)
                            .attr("height", 15)
                            .attr('fill', function (d) {
                                return segColor(d.key);
                            })
                            .on('mouseover', bar_mouseover)
                            .on('mouseout', bar_mouseout);

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

                        function clickCheckBox(e) {
                            var checkedStatus = ($(this).attr("href") == "images/checkbox.svg")? true : false;
                            if(checkedStatus) {
                                $(this).attr("href", "images/checkbox-enable.svg");
                                if(scope.checkedstates.length == 0 || scope.checkedstates.indexOf(e) == -1) {
                                    scope.checkedstates.push(e);
                                }
                            }
                            else {

                                $(this).attr("href", "images/checkbox.svg");
                                if(scope.checkedstates.length > 0 && scope.checkedstates.indexOf(e) != -1) {
                                    scope.checkedstates.splice(scope.checkedstates.indexOf(e), 1);
                                }
                            }
                        }

                        function open_dropdown(e) {
                            if (typeof actionInterval !== 'undefined') {
                                $interval.cancel(actionInterval);
                            }
                            if (typeof e === "object") {
                                e = e.state;
                            }
                            $('.action_offset a').attr("state-id", e);
                            if(scope.area == undefined || scope.area.indexOf(e) == -1)
                                $('.action_offset a#click_area_text').html("Filter to this Customer");
                            else
                                $('.action_offset a#click_area_text').html("Remove this Customer");
                            $('.action_offset').show().css({
                                'top': ($(this).offset().top + 30),
                                'left': $(this).offset().left,
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

                        function bar_mouseover(d, i) {
                            bars.select("rect.front.front_" + i)
                                .attr('fill', function (d) {
                                    return segColor(d.key);
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

                        if (start !== 0) {
                            xContainerSvg.append("svg:image")
                                .attr("transform", "translate(" + margin.left + "," + -5 + ")")
                                .attr('class', 'arrow-left')
                                .attr("x", function () {
                                    return -5;
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
                            xContainerSvg.append("svg:image")
                                .attr("transform", "translate(" + margin.width + "," + -5 + ")")
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
                        var td = tr.selectAll("td").data(lD).enter().append("td").append('div');
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

                    var keys = ["< 30 days", "30 - 90 days", "> 90 days"];
                    var fdata = [];
                    var cdata = [];
                    var totalY = [];
                    var mF = [];
                    if(!scope.checkedstates)
                        scope.checkedstates = [];

                    var fullData = angular.copy(scope.data);
                    var show = scope.columns < fullData.length ? scope.columns : fullData.length;
                    start_max = fullData.length - show;
                    var data = fullData.slice(start, start + show);

                    function addY(paramObj) {
                        if (totalY.indexOf(paramObj) === -1)
                            totalY.push(paramObj);
                    }

                    function findKey(paramValue) {
                        return (paramValue < 30) ? keys[0] : (paramValue < 90) ? keys[1] : keys[2];
                    }

                    data.forEach(function (d) {
                        for (var i = 0; i < d.areas.length; i++) {
                            addY(d.areas[i].state);
                            fdata.push({
                                state: d.quarter,
                                tag: d.areas[i].state,
                                key: findKey(d.areas[i].days),
                                value: d.areas[i].days
                            });
                        }
                    });

                    var keys_length = keys.length;
                    var colors_p;

                    if (keys_length == 2) {
                        colors_p = 'colors_2';
                    } else if (keys_length <= 3) {
                        colors_p = 'colors_3';
                    } else if (keys_length <= 6) {
                        colors_p = 'colors_6';
                    }else if (keys_length <= 13) {
                        colors_p = 'colors';
                    } else {
                        colors_p = 'colors_more';
                    }
                    //setting colors for square block
                    colors_p = 'square_block'
                    colors = colors_theme[colors_p];

                    legend(keys);
                    histoGram(fdata, mF);

                };
            }
        };
    }
]);