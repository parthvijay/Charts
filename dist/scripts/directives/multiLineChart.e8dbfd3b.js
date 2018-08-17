/*jshint sub:true*/
'use strict';
angular.module('ciscoExecDashApp').directive('multiLineChart', [
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
                        quartersColors: '=',
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
                        colorConfig: '='
                    },
                    link: function (scope, ele, attrs) {
                        var d3 = $window.d3;
                        var event = isMobile ? "touchstart" : "click";

                        var ele = $(ele[0]).closest('.tile');

                        var svg = d3.select(ele[0])
                                .append('svg');

                        var table = d3.select(ele[0])
                                .append('table');

                        var start = 0;
                        var start_max = 0;

                        var colors_theme = $window.ciscoConfig.colorsPalette[$rootScope.dashboard];
                        var colors = colors_theme["quartersColors"];

                        var windowWidth = $(window).width();

                        $window.addEventListener('resize', function (event) {
                            $timeout(function () {
                                if ($(window).width() !== windowWidth) {
                                    windowWidth = $(window).width();
                                    scope.render(scope.data);
                                }
                            });
                        });

                        var groupWatch = scope.$watchGroup(['data', 'columns', 'expanded', 'sidebar', 'viewtype'], function (newVals, oldVals) {
                            if (newVals && scope.sidebar) {
                                if (!scope.data) {
                                    return;
                                }
                                start = 0;
                                start_max = 0;
                                if (scope.sidebar) {
                                    $timeout(function () {
                                        scope.render(scope.data);
                                    });
                                }
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


                            function histoGram(fD, mF) {
                                var hG = {}, hGDim = {t: 0, r: 20, b: 30, l: 75};
                                hGDim.w = (ele[0].offsetWidth) - hGDim.l - hGDim.r,
                                        hGDim.h = 275 - hGDim.t - hGDim.b;
                                var hGsvg = svg
                                        .attr("width", hGDim.w + hGDim.l + hGDim.r)
                                        .attr("height", hGDim.h + hGDim.t + hGDim.b).append("g")
                                        .attr("transform", "translate(" + hGDim.l + "," + hGDim.t + ")");
                                var x = d3.scaleBand().range([0 + 50, hGDim.w - 50])
                                         //.domain(fD.map(function (d) {
                                          //   return d.state;
                                         //}));
                                       .domain(["2 Quarters", "1 Quarter", "In Quarter", "1 Quarter ", "2 Quarters ", "3 Quarters ", "4 Quarters "]);
                                var xAxis = d3.axisBottom(x)
                                    .tickSizeInner(-5)
                                    .tickSizeOuter(-10)
                                    .tickPadding(-20);

                                hGsvg.append("g").attr("class", "xaxis axis")
                                        .attr("transform", "translate(0," + (hGDim.h + 40) + ")")
                                        .call(xAxis);

                                hGsvg.append("text")      // text label for the x axis
                                .attr("x", 30 )
                                .attr("y", (hGDim.h + 40))
                                .style("text-anchor", "middle")
                                .text("(Early)");

                                hGsvg.append("text")      // text label for the x axis
                                .attr("x", hGDim.w - 50 + 20 )
                                .attr("y", (hGDim.h + 40))
                                .style("text-anchor", "middle")
                                .text("(Late)");

                                //hGsvg.select(".xaxis .tick:nth-child(2) text").attr("fill", "red");

                                hGsvg.selectAll(".x.axis .tick text")
                                        .call(d3_wrap, x.bandwidth());

                                var y = d3.scaleLinear().range([hGDim.h, 0]);

                                var max = d3.max(fD, function (d) {
                                    return d.value;
                                });

                                y.domain([0, max + (max * 0.25)]);

                                var yAxis = d3.axisLeft(y)
                                        .tickSizeInner(-hGDim.w)
                                        .tickSizeOuter(0)
                                        .tickPadding(20)
                                        .tickFormat(function(d) { return d + "%"; }).ticks(6);

                                var tip = d3.tip()
                                        .attr('class', 'd3-tip')
                                        .offset([-10, 0])
                                        .html(function (d) {
                                            for(var i=0;i<scope.data.length;i++) {
                                                if(scope.data[i].state == d.state) {
                                                    return "<strong>" + d.key + " at " + scope.data[i].freq[d.key].state + "</strong>Services Renewed: " + toUSD(scope.data[i].freq[d.key].values[0])  + "<br/>Total Renewal Opportunity: " + toUSD(scope.data[i].freq[d.key].values[1]);

                                                }
                                            }
                                        });

                                function toUSD(number) {
                                    var number = number.toString(),
                                        dollars = number.split('.')[0];
                                        dollars = dollars.split('').reverse().join('')
                                        .replace(/(\d{3}(?!$))/g, '$1,')
                                        .split('').reverse().join('');
                                    return '$' + dollars;
                                }

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
                                            for(var i=0;i<d.values.length;i++) {
                                                if(d.values[i].value != null)
                                                    tmpObj.push(d.values[i]);
                                            }
                                            return lineFunc(tmpObj);
                                        })
                                        .style("stroke", function (d) {
                                            return segColor(d.type);
                                        })
                                        .attr('stroke-width', 1)
                                        .attr('fill', 'none');

                                bars.selectAll(".dot")
                                        .data(fD)
                                        .enter().append("circle")
                                        .attr("class", function (d, i) {
                                            return 'front front_' + i;
                                        })
                                        .attr("r", 3)
                                        .attr("cx", function (d) {
                                            return x(d.state) + (x.bandwidth()) / 2;
                                        })
                                        .attr("cy", function (d) {
                                            return y(d.value);
                                        })
                                        .style('fill', function (d) {
                                            scope.colorConfig[d.key] = segColor(d.key);
                                            return scope.colorConfig[d.key];
                                        })
                                        .on('mouseover', bar_mouseover)
                                        .on('mouseout', bar_mouseout);

                                function bar_mouseover(d, i) {
                                    tip.show(d);
                                    return;
                                    bars.select("circle.front.front_" + i).transition().duration(250)
                                            .attr("r", 7)
                                            .style('fill', function (d) {
                                                return $filter('darken')(segColor(d.type));
                                            });
                                }

                                function bar_mouseout(d, i) {
                                    tip.hide(d);
                                    return;
                                    bars.select("circle.front.front_" + i).transition().duration(250)
                                            .attr("r", 3.5)
                                            .style('fill', function (d) {
                                                return segColor(d.type);
                                            });
                                }
                                /*
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
                                  */
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
                                var td = tr.selectAll("td").data(lD).enter().append("td").append('div');
                                td
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

                            keys = ciscoUtilities.getUniqueKeys(fullData, "freq");
                            var keys_length = keys.length;
                            var colors_p;

                             /*
                             var tF = keys.map(function (d) {
                             return {state: d, freq: cData.map(function (t) {
                             return {key: t.state, value: t.freq[d]};
                             }), total: d3.sum(cData.map(function (t) {
                             return t.freq[d];
                             }))};
                             });
                             */

                            scope.filtered = cData;

                            var mF = keys.map(function (d) {
                                return {
                                    type: d,
                                    values: fData.map(function (t) {
                                        return {state: t.state, value: (t.freq[d])? parseFloat(t.freq[d].rr) : null};
                                    })
                                };
                            });

                            // var mF = keys.map(function (d) {
                            //     return {
                            //         type: d,
                            //         values: (() => {
                            //             var tmpValues = [];
                            //             for(var i=0;i<fData.length;i++) {
                            //                 if(typeof(fData[i].freq[d]) != "undefined") {
                            //                     tmpValues.push({state: fData[i].state, value: parseFloat(fData[i].freq[d].rr)});
                            //                 }
                            //             }
                            //         })()
                            //     };
                            // });

                            var newarray = [];
                            var yColumn = [];
                            fData.forEach(function (d) {
                                for (var prop in  d.freq) {
                                    if (!yColumn[d.state]) {
                                        yColumn[d.state] = 0;
                                    }
                                    newarray.push({
                                        state: d.state,
                                        key: prop,
                                        start: yColumn[d.state] ? (yColumn[d.state] + 0) : yColumn[d.state],
                                        end: yColumn[d.state] + parseFloat(d.freq[prop].rr),
                                        value: (d.freq[prop])? parseFloat(d.freq[prop].rr) : 0
                                    });
                                    yColumn[d.state] += parseFloat(d.freq[prop].rr);
                                }

                            });

                            histoGram(newarray, mF);
                            legend(keys);

                        };

                    }};
            }
]);