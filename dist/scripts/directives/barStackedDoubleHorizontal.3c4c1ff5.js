/*jshint sub:true*/
'use strict';
angular.module('ciscoExecDashApp').directive('barStackedDoubleHorizontalChart', [
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
                categories: '=',
                activecategory: '=',
                action: '=',
                isaccountmanagerlist: '=',
                drillaccountmanager: '&',
                expandeddata: '=',
                filteredexpandeddata: '=',
                customorder: '=',   // DE131335
                checkedstates: '=',
                allowreports: '=',
                linecount: '=',
                linecountselected: '=',
                 listamount: '=',
                listamountselected: '=',
                renderGraphForSelectAll: '=?'
            },
            link: function (scope, ele, attrs) {
                var refreshAllData = function () {
                    scope.$emit('refresh-all-data', {
                        'pcNodeName': scope.area
                    });
                };
                var refreshPCData = function() {
                    scope.$emit('refresh-spc-data', {
                        'activeKey': scope.active
                    });
                };
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

                var groupWatch = scope.$watchGroup(['data','expandeddata', 'columns', 'expanded', 'sidebar', 'viewtype', 'activecategory', 'isaccountmanagerlist'], function (newVals, oldVals) {
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
                                        var selectedArea = [];
                                        for (var selectedState of individualData['areas']) {
                                            if (scope.checkedstates.includes(selectedState['state']))
                                                selectedArea.push(selectedState)
                                        }
                                        data.push({"quarter": individualData['quarter'], "areas": selectedArea})
                                    }
                                    scope.render(data);
                                } else {
                                    scope.render(scope.data);
                                }
                            }
                            else
                                scope.render(scope.data);
                        },10);
                    }
                }, true);

                 var renderGraphForSelectAllWatch = scope.$watch('renderGraphForSelectAll', function (newVals, oldVals) {
                    if(newVals !== oldVals){
                            scope.render(scope.data);
                    
                    }
                }, true);

                scope.$on('$destroy', function () {
                    groupWatch();
                    colorsWatch();
                    quarterWatch();
                    renderGraphForSelectAllWatch();
                    domWatch();
                });

                function segColor(c) {
                    var constant = $window.ciscoConfig.colorsPalette[$rootScope.dashboard]['constant'][c];
                    if (typeof constant !== 'undefined') {
                        return constant;
                    };

                    if (scope.colors === undefined) {
                        scope.colors = {};
                    };
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
                    xContainerSvg.selectAll('*').remove();
                    table.selectAll('*').remove();
                    scope.colorsOpp={};

                    var data = angular.copy(data2);
                    if (!data || !data.length) {
                         scope.filtered = [];
                        return;
                    }

                    function click(d) {
                       // scope.linecountselected = 0;
                        var type = d.key ? d.key : d;
                        if (type === 'SFDC Pipeline') {
                            return;
                        }
                        if (scope.active.indexOf(type) > -1) {
                            if (d3.event.ctrlKey || d3.event.metaKey) {
                                scope.active.splice(scope.active.indexOf(type), 1);
                            } else {
                                if (scope.active.length === 1) {
                                    scope.active = [];
                                } else {
                                    scope.active = [];
                                    scope.active.push(type);
                                }
                            }
                        } else {
                            if (!d3.event.ctrlKey && !d3.event.metaKey) {
                                scope.active = [];
                            }
                            //disable multi-select for October release
                            scope.active = [];
                            scope.active.push(type);
                        }
                        refreshPCData();
                        scope.$apply();
                    }

                    function histoGram(fD, fD_2) {
                        var hG = {}, hGDim = { t: 20, r: 20, b: 0, l: 70 };
                        var elOffsetWidth = ele[0].offsetWidth;
                        if (elOffsetWidth === 0 && ele.hasClass('ng-hide')) {
                            elOffsetWidth = $(ele[0]).siblings('div.tile-head-area').width();
                        }
                        hGDim.w = (elOffsetWidth) - hGDim.r;
                        hGDim.h = 55 * fData.length - hGDim.t - hGDim.b;

                        var transX;
                        if (scope.action || scope.allowreports) {
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
                            .attr("height", hGDim.h > 240 ? hGDim.h : 240).append("g")
                            .attr("transform", "translate(" + transX + ",0)");
                        var x = d3.scaleLinear().range([0, hGDim.w - 100]);
                        var y = d3.scaleBand().range([0, hGDim.h])
                            .domain(scope.fD.map(function (d) {
                                return d.state;
                            }));

                        var max = 0;
                        var max_array = [];
                        var activeElements = scope.fD.filter(function (d) {
                            if (scope.active.length) {
                                return scope.active.indexOf(d.key) > -1;
                            }
                            return true;
                        });
                        var keys_count = scope.active.length ? scope.active.length : keys.length;
                        activeElements = activeElements.slice(0, (4 * keys_count));

                        if (scope.active.length) {
                            scope.active.forEach(function (k) {
                                if(scope.keys.indexOf(k) === -1) {
                                    return;
                                }
                                max_array.push(d3.max(activeElements.filter(function (d) {
                                    return d.key === k;
                                }), function (d) {
                                    return d.value;
                                }));
                            });
                            max_array.forEach(function (e) {
                                max += e;
                            });
                        }
                        else {
                            max = d3.max(activeElements, function (d) {
                                return d.total;
                            });
                        }

                        var max_2 = 0;
                        if (fD_2.length) {
                            max_2 = d3.max(fD_2.slice(0, (4 * scope.keys.length)), function (d) {
                                return d.total;
                            });
                        }

                        max = Math.max(max, max_2);

                        max += max * 0.20;

                        if (scope.active.length && false) {
                            x.domain([0, d3.max(sF.filter(function (d) {
                                return d.key == scope.active;
                            }), function (d) {
                                return Math.max(d.value + (d.value * 0.20), max_2);
                            })]);
                        } else {
                            x.domain([0, max]);
                        }

                        var xAxis = d3.axisBottom(x)
                            .tickFormat(function (d) {
                                return $filter('formatValue')(d);
                            }).ticks(4)
                            .tickSize(-240);

                        var yAxis = d3.axisLeft(y)
                            .tickFormat(function (d) {
                                return d;
                            });

                        angular.element(ele.find('.scrollContainer')).bind("scroll", function () {
                            $('.action_offset').hide();
                            var scrollTop = ele.find('.scrollContainer').scrollTop();
                            var element = Math.floor(scrollTop / 55);

                            var activeElements = scope.fD.filter(function (d) {
                                if (scope.active.length) {
                                    return scope.active.indexOf(d.key) > -1;
                                }
                                return true;
                            });
                            var keys_count = scope.active.length ? scope.active.length : keys.length;
                            activeElements = activeElements.slice(element * keys_count, (element * keys_count) + (5 * keys_count));

                            var max = 0;
                            var max_array = [];

                            if (scope.active.length) {
                                scope.active.forEach(function (k) {
                                    if(scope.keys.indexOf(k) === -1) {
                                        return;
                                    }
                                    max_array.push(d3.max(activeElements.filter(function (d) {
                                        return d.key === k;
                                    }), function (d) {
                                        return d.value;
                                    }));
                                });
                                max_array.forEach(function (e) {
                                    max += e;
                                });
                            }
                            else {
                                max = d3.max(activeElements, function (d) {
                                    return d.total;
                                });
                            }

                            var max_new_2 = 0;
                            if (fD_2.length) {
                                max_new_2 = d3.max(fD_2.slice(element * scope.keys.length, (element * scope.keys.length) + (4 * scope.keys.length)), function (d) {
                                    return d.total;
                                });
                            }

                            if(!max_new_2){
                                max_new_2 = 0;
                            }

                            max = Math.max(max, max_new_2);

                            max += max * 0.20;

                            x.domain([0, max]);
                            xContainerSvg.selectAll("g.x.axis").call(xAxis);

                            var bars = hGsvg.selectAll(".bar").data(sF);
                            var end = {};

                            bars.select("rect.front").transition().duration(scope.transitionDuration)
                                .attr("x", function (d) {
                                    if (scope.active.length && scope.active.indexOf(d.key) === -1) {
                                        return 0;
                                    }
                                    if (!end[d.state]) {
                                        end[d.state] = 0;
                                    }
                                    var ret = end[d.state];
                                    end[d.state] += d.value;
                                    return x(ret);
                                })
                                .attr("width", function (d) {
                                    if (scope.active.length && scope.active.indexOf(d.key) === -1) {
                                        return 0;
                                    }
                                    var m = (scope.active.indexOf(d.key) === 0 || !d.start) ? 2 : 2;
                                    var val = x(d.value) - m;
                                    return val > 0 ? val : 0;
                                });

                            bars.select("rect.back").transition().duration(scope.transitionDuration)
                                .attr("x", function (d) {
                                    if (scope.active.length) {
                                        if (scope.active.indexOf(d.key) === -1) {
                                            return 0;
                                        }
                                    }
                                    return x(end[d.state]);
                                })
                                .attr("width", function (d) {
                                    var val = x.range()[1] - x(d.total);
                                    if (scope.active.length) {
                                        if (scope.active.indexOf(d.key) === -1) {
                                            return 0;
                                        }
                                        val = x.range()[1] - x(end[d.state]);
                                    }
                                    return val > 0 ? val : 0;
                                });

                            var bars_2 = hGsvg.selectAll(".bar_2").data(sF_2);
                            bars_2.select("rect.back").transition().duration(scope.transitionDuration)
                                .attr("x", function (d) {
                                    return 0;
                                })
                                .attr("width", function (d) {
                                    return x.range()[1];
                                })
                            bars_2.select("rect.front").transition().duration(scope.transitionDuration)
                                .attr("x", function (d) {
                                    return 0;
                                })
                                .attr("width", function (d) {
                                    return x(d.total);
                                });

                        });

                        xContainerSvg.attr("width", hGDim.w)
                            .attr("height", 20);

                        var userAgent = $window.navigator.userAgent;
                        if(userAgent.indexOf('Firefox') > -1){
                            transX = transX-11;
                        }

                        xContainerSvg.append("g")
                            .attr("class", "x axis")
                            .attr("transform", "translate(" + (transX) + "," + (5) + ")")
                            .call(xAxis);

                        var translate = fD_2.length ? "translate(-15,-8)" : "translate(-15,-8)";

                        hGsvg.append("g").attr("class", "y axis")
                            /*  .attr("transform", translate) */
                            .call(yAxis);

                        hGsvg.selectAll('.y.axis .tick text')
                            .call(d3_wrap, y.bandwidth())
                            .on(event, open_dropdown)
                            .attr('uib-tooltip', function (d) {
                                return d;
                            })
                            .attr('tooltip-append-to-body', 'true');
                            // ux fix for checkboxes in patners
                       // if (scope.action || scope.allowreports) {
                            hGsvg.selectAll("image")
                                .data(d3.map(scope.fD, function (d) {
                                    return d.state;
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
                                    var state = d.split(">")[0];
                                    return y(state) + (y.bandwidth() + 7) / 2;
                                })
                                .attr('width', 16)
                                .attr('height', 16)
                                .attr("xlink:href", function(d){
                                    return (scope.checkedstates.indexOf(d) == -1)? "images/checkbox.svg" : "images/checkbox-enable.svg"
                                })
                                .on('click', clickCheckBox);
                      //  }

                        $compile(ele.find('.scrollContainer'))(scope);
                        $compile(ele.find('.y.axis .tick text'))(scope);

                        var tip = d3.tip()
                            .attr('class', 'd3-tip')
                            .offset([-10, 0])
                            .html(function (d) {
                                return "<strong>" + d.state + "</strong><strong class='sfdc'>" + (d.sfdc ? "SFDC Pipeline" : "Actionable Opportunity") + "</strong><span style='color:" + segColor(d.key) + "'>" + d.key + ": $" + (d.sfdc ? $filter('formatValue')(d.total) : $filter('formatValue')(d.value)) + "</span><span>Total: $" + $filter('formatValue')(d.total) + ' </span>';
                            });
                        hGsvg.call(tip);

                        var bars = hGsvg.selectAll(".bar").data(scope.fD).enter()
                            .append("g").attr("class", "bar");
                        var end = {};

                        bars.append("rect")
                            .attr("class", function (d, i) {
                                return 'front front_' + i;
                            })
                            .attr("x", function (d) {
                                if (scope.active.length && scope.active.indexOf(d.key) === -1) {
                                    return 0;
                                }
                                if (!end[d.state]) {
                                    end[d.state] = 0;
                                }
                                var ret = end[d.state];
                                end[d.state] += d.value;
                                return x(ret);
                            })
                            .attr("y", function (d) {
                                return y(d.state) + (y.bandwidth() - 15) / 2;
                            })
                            .attr("width", function (d) {
                                if (scope.active.length && scope.active.indexOf(d.key) === -1) {
                                    return 0;
                                }
                                var m = (scope.active.indexOf(d.key) === 0 || !d.start) ? 2 : 2;
                                var val = x(d.value) - m;
                                return val > 0 ? val : 0;
                            })
                            .attr("height", function (d) {
                                return 15;
                            })
                            .attr('fill', function (d) {
                                if ((scope.area.length && scope.area.indexOf(d.state) === -1) || (scope.active.length && scope.active.indexOf(d.key) === -1)) {
                                    return '#ccc';
                                }
                                return segColor(d.key);
                            })
                            .on(event, click)
                            .on('mouseover', bar_mouseover)
                            .on('mouseout', bar_mouseout);

                        bars.append("rect").attr('class', 'back')
                            .attr("x", function (d) {
                                if (scope.active.length) {
                                    if (scope.active.indexOf(d.key) === -1) {
                                        return 0;
                                    }
                                }
                                return x(end[d.state]);
                            })
                            .attr("y", function (d) {
                                return y(d.state) + (y.bandwidth() - 15) / 2;
                            })
                            .attr("width", function (d) {
                                var val = x.range()[1] - x(d.total);
                                if (scope.active.length) {
                                    if (scope.active.indexOf(d.key) === -1) {
                                        return 0;
                                    }
                                    val = x.range()[1] - x(end[d.state]);
                                }
                                return val > 0 ? val : 0;
                            })
                            .attr("height", function (d) {
                                return 15;
                            })
                            .attr('fill', function (d) {
                                return '#EDEEF1';
                            });

                        var bars_2 = hGsvg.selectAll(".bar_2").data(fD_2).enter()
                            .append("g").attr("class", "bar_2");
                        bars_2.append("rect").attr('class', 'back')
                            .attr("x", function (d) {
                                return 0;
                            })
                            .attr("y", function (d) {
                                return y(d.state) + (y.bandwidth() - 15) / 2 + 20;
                            })
                            .attr("width", function (d) {
                                return x.range()[1];
                            })
                            .attr("height", function (d) {
                                return 15;
                            })
                            .attr('fill', function (d) {
                                return '#EDEEF1';
                            });
                        bars_2.append("rect")
                            .attr("class", function (d, i) {
                                return 'front front_' + i;
                            })
                            .attr("x", function (d) {
                                return 0;
                            })
                            .attr("y", function (d) {
                                return y(d.state) + (y.bandwidth() - 15) / 2 + 20;
                            })
                            .attr("width", function (d) {
                                return x(d.total);
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
                            .on('mouseover', bar_mouseover)
                            .on('mouseout', bar_mouseout);

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
                            mouseover();
                        }, true);

                        scope.$on('$destroy', function () {
                            areaWatch();
                            activeWatch();
                        });

                        function mouseover() {
                            var max = 0;
                            var max_array = [];
                            if (scope.active.length) {
                                scope.active.forEach(function (k) {
                                    if(scope.keys.indexOf(k) === -1) {
                                        return;
                                    }
                                    max_array.push(d3.max(sF.filter(function (d) {
                                        return d.key === k;
                                    }), function (d) {
                                        return d.value;
                                    }));
                                });
                                max_array.forEach(function (e) {
                                    max += e;
                                });
                            } else {
                                max = d3.max(scope.fD, function (d) {
                                    return d.total;
                                });
                            }

                            max = Math.max(max, max_2);

                            max += max * 0.20;

                            x.domain([0, max]);

                            xContainerSvg.selectAll("g.x.axis")
                                .call(xAxis);

                            var bars = hGsvg.selectAll(".bar").data(sF);
                            var end = {};

                            bars.select("rect.front").transition().duration(scope.transitionDuration)
                                .attr("x", function (d) {
                                    if (scope.active.length && scope.active.indexOf(d.key) === -1) {
                                        return 0;
                                    }
                                    if (!end[d.state]) {
                                        end[d.state] = 0;
                                    }
                                    var ret = end[d.state];
                                    end[d.state] += d.value;
                                    return x(ret);
                                })
                                .attr("width", function (d) {
                                    if (scope.active.length && scope.active.indexOf(d.key) === -1) {
                                        return 0;
                                    }
                                    var m = (scope.active.indexOf(d.key) === 0 || !d.start) ? 2 : 2;
                                    var val = x(d.value) - m;
                                    return val > 0 ? val : 0;
                                })
                                .attr('fill', function (d) {
                                    if ((scope.area.length && scope.area.indexOf(d.state) === -1) || (scope.active.length && scope.active.indexOf(d.key) === -1)) {
                                        return '#ccc';
                                    }
                                    return segColor(d.key);
                                });

                            bars.select("rect.back").transition().duration(scope.transitionDuration)
                                .attr("x", function (d) {
                                    if (scope.active.length) {
                                        if (scope.active.indexOf(d.key) === -1) {
                                            return 0;
                                        }
                                    }
                                    return x(end[d.state]);
                                })
                                .attr("width", function (d) {
                                    var val = x.range()[1] - x(d.total);
                                    if (scope.active.length) {
                                        if (scope.active.indexOf(d.key) === -1) {
                                            return 0;
                                        }
                                        val = x.range()[1] - x(end[d.state]);
                                    }
                                    return val > 0 ? val : 0;
                                });

                            var bars_2 = hGsvg.selectAll(".bar_2").data(sF_2);
                            bars_2.select("rect.back").transition().duration(scope.transitionDuration)
                                .attr("width", function (d) {
                                    return x.range()[1];
                                })
                            bars_2.select("rect.front").transition().duration(scope.transitionDuration)
                                .attr("width", function (d) {
                                    return x(d.total);
                                });

                            table.selectAll("td").attr('class', function (e) {
                                if (scope.active.length && scope.active.indexOf(e) === -1 && e !== 'SFDC Pipeline') {
                                    return 'disabled';
                                }
                                return '';
                            });
                        }

                        function clickCheckBox(e) {
                              
                                        var state = e.split(">")[0];
                                         var a =[];
                                         var b = [];
                            var checkedStatus = ($(this).attr("href") == "images/checkbox.svg") ? true : false;
                                if(scope.activecategory === 0 || scope.activecategory === 2 || scope.activecategory === 3){                                
                                  angular.forEach(scope.filtered,function(val){
                                      if(val.state === state){  
                                         a.push({"title":state,"value":val.lineCount});
                                         b.push({"title":state,"value":val.listAmount});
                                      }
                                  })
                                }
                                else{                                     
                                    var a = $filter('filter')(scope.linecount, { title: state });
                                    var b = $filter('filter')(scope.listamount, { title: state }); 
                                }                              
                            if(checkedStatus) {
                                $(this).attr("href", "images/checkbox-enable.svg");
                                if(scope.checkedstates.length == 0 || scope.checkedstates.indexOf(state) == -1) {
                                    scope.checkedstates.push(state);
                                }
                                if (a.length) {
                                scope.linecountselected = parseInt(scope.linecountselected);
                                scope.linecountselected += a[0].value;
                                 scope.listamountselected = parseInt(scope.listamountselected);
                                 scope.listamountselected += b[0].value;
                            }
                                scope.$apply();
                            }
                            else {

                                $(this).attr("href", "images/checkbox.svg");
                                if(scope.checkedstates.length > 0 && scope.checkedstates.indexOf(state) != -1) {
                                    scope.checkedstates.splice(scope.checkedstates.indexOf(state), 1);
                            }
                            if (a.length && scope.linecountselected) {
                                scope.linecountselected = parseInt(scope.linecountselected);
                                scope.linecountselected -= a[0].value;
                                // scope.listamountselected += b[0].value;
                            }
                                scope.$apply();
                            }
                            //For case: To change the text between "Select All" or "Deselect All" based on the checkbox selections
                            if(scope.renderGraphForSelectAll && scope.checkedstates.length !== scope.filtered.length){
                                scope.renderGraphForSelectAll = false;
                            }else if(!scope.renderGraphForSelectAll && scope.checkedstates.length === scope.filtered.length){
                                scope.renderGraphForSelectAll = true;
                            }
                            scope.$apply();
                        }

                        function open_dropdown(e) {
                            var state;
                            var stateId
                            if (typeof e === "object") {
                                state = e.state;
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
                                if (typeof e === "object") {
                                    e = e.state;
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

                        function close_dropdown(e) {
                            window.actionInterval = $interval(function () {
                                if (!$(':hover').last().closest('.action_offset').length) {
                                    $('.action_offset').hide();
                                    $interval.cancel(actionInterval);
                                }
                            }, 300);
                        }

                        function click_area(d) {
                            if (scope.isaccountmanagerlist) {
                                scope.drillaccountmanager({ arg1: true, arg2: d });
                                scope.linecountselected = 0;
                                scope.listamountselected = 0;
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
                            refreshAllData();
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
                                    if ((scope.area.length && scope.area.indexOf(d.state) === -1) || (scope.active.length && scope.active.indexOf(d.key) === -1)) {
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
                                    if ((scope.area.length && scope.area.indexOf(d.state) === -1) || (scope.active.length && scope.active.indexOf(d.key) === -1)) {
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

                    function legend(keys, sfdc) {
                        var keys = angular.copy(keys);
                        if (sfdc) {
                            keys.push('SFDC Pipeline');
                        }
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
                        var td = tr.selectAll("td").data(keys).enter().append("td");
                        var div = td.append('div').on(event, click);
                        td
                            .attr('class', function (e) {
                                if (scope.active.length && scope.active.indexOf(e) === -1 && e !== 'SFDC Pipeline') {
                                    return 'disabled';
                                }
                                return '';
                            });
                        div
                            .attr('uib-tooltip', function (d) {
                                return d;
                            })
                            .attr('tooltip-append-to-body', 'true');
                        div.append("svg").attr("width", '8').attr("height", '8').append("rect")
                            .attr("width", '8').attr("height", '8')
                            .attr("fill", function (d) {
                                return segColor(d);
                            });
                        div.append('text')
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
                                var c = e.lineCount;
                                var c_2 = e.listAmount;
                                 fData[ifAdded].lineCount += c ;
                                 fData[ifAdded].listAmount += c_2;
                                // if(typeof fData[ifAdded].lineCount !== 'undefined'){
                                //     fData[ifAdded].linecount += c ;
                                // }else {
                                //      fData[ifAdded].linecount = c ;
                                // }
                                // if(typeof fData[ifAdded].listamount !== 'undefined'){
                                //     fData[ifAdded].listamount += c_2;
                                // }else {
                                //      fData[ifAdded].listamount = c_2;
                                // }

                                
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
   
                           }else {
                                fData.push(e);
                            }
                        });
                    });

                    if(!scope.checkedstates)
                    scope.checkedstates = [];
                    scope.filtered = fData;
                    //added scope variable for expanded view list and net :kd
                    scope.filteredexpandeddata = scope.expandeddata;

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

                    //Sorting based on only Architecture values
                    fData.sort(function (a, b) {
                        return (b.total) - (a.total);
                    });

                    var sF = [];
                    var yColumn = [];
                    fData.forEach(function (d) {
                        // DE131335
                        var freqKeys = Object.keys(d.freq).sort();
                        if (scope.customorder) {
                            var allCategories = scope.customorder;
                            freqKeys.sort(function (a, b) {
                                return allCategories.indexOf(a) - allCategories.indexOf(b);
                            });
                        }
                        for (var i = 0; i < freqKeys.length; i++) {
                            var prop = freqKeys[i];
                            if (!yColumn[d.state]) {
                                yColumn[d.state] = 0;
                            }
                            if (d.total > 0 || true) {
                                sF.push({
                                    state: d.state,
                                    stateId: d.stateId,
                                    linecount: d.lineCount,
                                    listamount:d.listAmount,
                                    total: d.total,
                                    key: prop,
                                    start: yColumn[d.state] ? (yColumn[d.state] + 0) : yColumn[d.state],
                                    end: yColumn[d.state] + d.freq[prop],
                                    value: d.freq[prop],
                                    sfdc: false
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
                                    state: d.state,
                                    stateId: d.stateId,
                                    total: d.total_2,
                                    key: 'SFDC Pipeline',
                                    start: yColumn_2[d.state] ? (yColumn_2[d.state] + 0) : yColumn_2[d.state],
                                    end: yColumn_2[d.state] + d.freq_2[prop],
                                    value: d.freq_2[prop],
                                    sfdc: true
                                });
                                yColumn_2[d.state] += d.freq_2[prop];
                            }
                        }
                    });

                    var activeC = scope.activecategory;
                    if (activeC) {
                        var title = scope.categories[activeC];
                        if (title.toLowerCase().indexOf("partner") > -1) {
                            sF_2 = [];
                        }
                    }
                    if (scope.viewtype === 'list') {
                        return;
                    }

                    keys = ciscoUtilities.getUniqueKeys(sF, "key");

                    // DE131335
                    if (scope.customorder) {
                        var allCategories = scope.customorder;
                        keys.sort(function (a, b) {
                            return allCategories.indexOf(a) - allCategories.indexOf(b);
                        });
                    }

                    scope.keys = keys;

                    var keys_length = keys.length;
                    var colors_p;
                    if (keys_length == 2) {
                        colors_p = 'colors_2';
                    } else if (keys_length <= 3) {
                        colors_p = 'colors_3';
                    } else if (keys_length <= 6) {
                        colors_p = 'colors_6';
                    } else {
                        colors_p = 'colors';
                    }

                    colors = colors_theme[colors_p];

                    var flags = [], states = [], l = sF.length, i;
                    for (i = 0; i < l; i++) {
                        if (flags[sF[i].state]) {
                            continue;
                        }
                        flags[sF[i].state] = true;
                        states.push({ state: sF[i].state, total: sF[i].total });
                    }

                    states.forEach(function (a, b) {
                        keys.forEach(function (c, d) {
                            var check = $filter('filter')(sF, { state: a.state, key: c });
                            if (!check.length) {
                                var ind = ciscoUtilities.findWithAttr(sF, 'state', a.state);
                                var obj = {
                                    state: a.state,
                                    total: a.total,
                                    key: c,
                                    start: 0,
                                    end: 0,
                                    value: 0,
                                    sfdc: false
                                };
                                sF.splice(ind, 0, obj);
                            }
                        });
                    });

                    scope.fD = sF;
                    histoGram(sF, sF_2);
                    legend(keys, sF_2.length);
                };
            }
        };
    }
]);