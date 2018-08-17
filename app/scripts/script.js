/*jshint sub:true*/
'use strict';

var showShadow = function () {
    var $this = $('.sidebar-nav');
    var s_top = $this.scrollTop();
    $this.find('.dropdown-menu.inner').css('margin-top', 0 - s_top);
    if (s_top === 0) {
        $('.sidebar-brand').removeClass('shadow');
        $('.fixed-bottom').addClass('shadow');
    } else if ($this.scrollTop() + $this.innerHeight() >= $this[0].scrollHeight) {
        $('.fixed-bottom').removeClass('shadow');
        $('.sidebar-brand').addClass('shadow');
    } else {
        $('.sidebar-brand').addClass('shadow');
        $('.fixed-bottom').addClass('shadow');
    }
};

var matchTilesHeight = function (t) {
    setTimeout(function () {
        var max_height = 0;
        $('.opportunity-tile:not(.error-tile)').each(function () {
            $(this).css("height", "");
            var h = $(this).innerHeight();
            max_height = h > max_height ? h : max_height;
        });
        if (max_height > 560) {
            $('.opportunity-tile').css("height", "auto");
            $('.opportunity-tile').css("min-height", "468px");
        } else {
        $('.opportunity-tile').innerHeight(max_height);
        //commenting to fix the defect DE192104
        // $('.opportunity-tile').find('.product-family-table > ul.product-family, .table-responsive, .table-scroll tbody').css('max-height', max_height - 170);
        $('.kpi').css('visibility', 'visible');
        //$('.kpi').fadeIn('slow');
   }
    }, t);
};

var drsTable = function (numColumn) {
    setTimeout(function () {
        $('.drs-table > tbody , .annual-table > tbody, .freezfirstcolumn > tbody').unbind('scroll').scroll(function () {
            var shadowValue = numColumn;
            var left = $(this).scrollLeft();
            var newScrollLeft = $(this).scrollLeft();
            var divWidth = $(this).outerWidth();
            var scrollwidth = $(this).get(0).scrollWidth;
            if ((screen.width > 1024)) {
                shadowValue;
            } else {
                shadowValue = 2;
            }
            if (left == 0) {
                $(this).find("> tr > td:last-child").addClass('shadow-right');
                $(this).prev().find("tr > th:last-child").addClass('shadow-right');
                $(this).find("> tr > td:nth-child(-n+ " + shadowValue + ")").removeClass('shadow-left');
                $(this).prev().find("tr > th:nth-child(-n+ " + shadowValue + ")").removeClass('shadow-left');
            } else if (newScrollLeft === (scrollwidth + 17) - divWidth) {
                $(this).find("> tr > td:last-child").removeClass('shadow-right');
                $(this).prev().find("tr > th:last-child").removeClass('shadow-right');
                $(this).find("> tr > td:nth-child(-n+ " + shadowValue + ")").addClass('shadow-left');
                $(this).prev().find("tr > th:nth-child(-n+ " + shadowValue + ")").addClass('shadow-left');
            } else {
                $(this).find("> tr > td:last-child").addClass('shadow-right');
                $(this).prev().find("tr > th:last-child").addClass('shadow-right');
                $(this).find("> tr > td:nth-child(-n+ " + shadowValue + ")").addClass('shadow-left');
                $(this).prev().find("tr > th:nth-child(-n+ " + shadowValue + ")").addClass('shadow-left');
            }
            $(this).prev().css("left", -$(this).scrollLeft());
            $(this).prev().find("tr > th:nth-child(-n+" + shadowValue + ")").css("left", $(this).scrollLeft());
            $(this).find("td:nth-child(-n+" + shadowValue + ")").css("left", $(this).scrollLeft());
        }
        );
    }, 50);
};

var realizationTableScroll = function () {
    setTimeout(function () {
        $('.table-scroll tbody').unbind('scroll').scroll(function (e) {
            var left = $(this).scrollLeft();
            var newScrollLeft = $(this).scrollLeft();
            var divWidth = $(this).outerWidth();
            var scrollwidth = $(this).get(0).scrollWidth;
            if (left == 0) {
                $(this).find('tr td:last-child').addClass('shadow-right');
                $(this).prev().find('tr th:last-child').addClass('shadow-right');
                $(this).find('tr td:first-child').removeClass('shadow-left');
                $(this).prev().find('tr th:first-child').removeClass('shadow-left');
            } else if (newScrollLeft === (scrollwidth + 17) - divWidth) {
                $(this).find('tr td:last-child').removeClass('shadow-right');
                $(this).prev().find('tr th:last-child').removeClass('shadow-right');
                $(this).find('tr td:first-child').addClass('shadow-left');
                $(this).prev().find('tr th:first-child').addClass('shadow-left');
            } else {
                $(this).find('tr td:last-child').addClass('shadow-right');
                $(this).prev().find('tr th:last-child').addClass('shadow-right');
                $(this).find('tr td:first-child').addClass('shadow-left');
                $(this).prev().find('tr th:first-child').addClass('shadow-left');
            }
            $(this).prev().css("left", -$(this).scrollLeft());
            $(this).prev().find('tr th:nth-child(1)').css("left", $(this).scrollLeft());
            $(this).find('td:nth-child(1)').css("left", $(this).scrollLeft());
        });
    }, 50);
};

var realizationTableColumnScroll = function (type) {
    //setTimeout(function() {
       $("#fixTable").tableHeadFixer({"left" : 2});
       $('.chart_' + type ).find('.product-family-table ul.product-family').unbind('scroll').scroll(function (e) {
        shadows(this);    
        }); 
    //}, 1)
    };
var shadows = function (chart) {
    if(!$(chart).length) {
        return;
    }
    var left = $(chart).scrollLeft();
    var shadowEffect = $(chart).closest('div.kpi').hasClass("chart_bar_double_horizontal_drs") ? 1 : 2;
    var newScrollLeft = $(chart).scrollLeft();
    var divWidth = $(chart).outerWidth();
    var scrollwidth = $(chart).get(0).scrollWidth;
    if (left <= 1) {
        $(chart).find("li .tbl-row .tbl-col:last-child").addClass('shadow-right');
        $(chart).prev().find(".col-head:last-child").addClass('shadow-right');
        $(chart).find("li .tbl-row .tbl-col:nth-child( " + shadowEffect + " )").removeClass('shadow-left');
        $(chart).prev().find(".col-head:nth-child( " + shadowEffect + " )").removeClass('shadow-left');
    } else if (newScrollLeft === (scrollwidth + 17) - divWidth) {
        $(chart).find("li .tbl-row .tbl-col:last-child").removeClass('shadow-right');
        $(chart).prev().find(".col-head:last-child").removeClass('shadow-right');
        $(chart).find("li .tbl-row .tbl-col:nth-child( " + shadowEffect + " )").addClass('shadow-left');
        $(chart).prev().find(".col-head:nth-child( " + shadowEffect + " )").addClass('shadow-left');
    } else {
        $(chart).find("li .tbl-row .tbl-col:last-child").addClass('shadow-right');
        $(chart).prev().find(".col-head:last-child").addClass('shadow-right');
        $(chart).find("li .tbl-row .tbl-col:nth-child( " + shadowEffect + " )").addClass('shadow-left');
        $(chart).prev().find(".col-head:nth-child( " + shadowEffect + " )").addClass('shadow-left');
    }
    $(chart).prev().css("left", -$(chart).scrollLeft());
    $(chart).prev().find(".col-head:nth-child(-n+  " + shadowEffect + " )").css("left", $(chart).scrollLeft());
    $(chart).find("li .tbl-row .tbl-col:nth-child(-n+  " + shadowEffect + " )").css("left", $(chart).scrollLeft());
};

var showShadowResponsive = function () {
    $(".filter-opt").off('scroll').on("scroll", function () {
        var $img1 = $(this).parent().find('img:eq(0)');
        var $img2 = $(this).parent().find('img:eq(1)');
        var s = $(this).scrollLeft();
        $img1.addClass('left-shad');
        if (s === 0) {
            $img1.hide();
            $img2.show();
        } else if (s + $(this).innerWidth() >= $(this)[0].scrollWidth) {
            $img1.show();
            $img2.hide();
        } else {
            $img1.show();
            $img2.show();
        }
    });
};

var resetScrollPosition = function (i, t) {
    //setTimeout(function (j, u) {
        $('.kpi.chart_' + t).find('.scrollContainer, .table-responsive, tbody, .product-family').scrollTop(0);
        $('.kpi.chart_' + t).find('.scrollContainer, .table-responsive, tbody,.product-family').scrollLeft(0);
       setTimeout(function() {
        //shadows($('.chart_bar_double_horizontal_drs').find('.product-family-table ul.product-family').get(0));
        $('.chart_bar_double_horizontal_drs').find('.product-family-table ul.product-family').scrollLeft(1);
       }, 50);
          
        //}, 50, i, t);
};

var initSlick = function () {
    $('.slick-carousel').slick({
        dots: false,
        infinite: false,
        slidesToShow: 5,
        slidesToScroll: 5,
        responsive: [
            {
                breakpoint: 1200,
                settings: {
                    slidesToShow: 4,
                    slidesToScroll: 4
                }
            },
            {
                breakpoint: 1024,
                settings: {
                    slidesToShow: 3,
                    slidesToScroll: 3
                }
            },
            {
                breakpoint: 900,
                settings: {
                    slidesToShow: 2,
                    slidesToScroll: 2
                }
            },
            {
                breakpoint: 768,
                settings: "unslick"
            }
        ]
    });
};

var d3_wrap = function (text, width, title) {
    var width = 70;

   if (title === 'Corporate 15/12 Attach Rate by Warranty Types') {
        return;
    }
    text.each(function () {

        var breakChars = ['/', '&', '-'],
            text = d3.select(this),
            textContent = text.text(),
            quarter = false,
            spanContent,
            words, ind, count = 0;

        breakChars.forEach(function (char) {
            // Add a space after each break char for the function to use to determine line breaks
            textContent = textContent.replace(char, char + ' ');
        });

        ind = textContent.indexOf("FY");
        if (ind === -1) {
            ind = textContent.indexOf("yrs");
        }

        if (ind > 0) {
            words = [textContent.substring(0, ind).trim(), textContent.substring(ind, textContent.length).trim()];
            quarter = true;
        } else {
            words = textContent.split(" ");
            for (var i = 0; i < words.length; i++) {
        // Removing code for fixing "Long node names flow out of frame when chart is expanded"
                    textContent = textContent.substr(0, 10) + '...';
            }
            words = textContent.split(/\s+/);
        }

        words.reverse();

        var word,
            line = [],
            lineNumber = 0,
            lineHeight = 1.1, // ems
            x = text.attr('x'),
            y = text.attr('y'),
            dy = parseFloat(text.attr('dy') || 0),
            tspan = text.text(null).append('tspan').attr('x', x).attr('y', y).attr('dy', dy + 'em');
        while (word = words.pop()) {
            
            line.push(word);
            tspan.text(line.join(' '));
            if (tspan.node().getComputedTextLength() > width || (quarter && count > 0)) {
                if (title === 'Corporate 15/12 Attach Rate by Sales Levels' || title === 'SWSS Attach Rate by Sales Levels') {
                    return;
                }
                line.pop();
                spanContent = line.join(' ');
                breakChars.forEach(function (char) {
                    // Remove spaces trailing breakChars that were added above
                    spanContent = spanContent.replace(char + ' ', char);
                })
                tspan.text(spanContent);
                line = [word];
                tspan = text.append('tspan').attr('x', x).attr('y', y).attr('dy', ++lineNumber * lineHeight + dy + 'em').text(word);
            }
            count++;
        }
    });
};


var JSONToCSVConvertor = function (JSONData, ReportTitle, ShowLabel) {
    var arrData = typeof JSONData !== 'object' ? JSON.parse(JSONData) : JSONData;
    var CSV = '';


    CSV += ReportTitle + '\r\n\n';

    if (ShowLabel) {
      var row = "";
        for (var index in arrData[0]) {
            row += index + ',';
        }
        row = row.slice(0, -1);
        CSV += row + '\r\n';
    }
    for (var i = 0; i < arrData.length; i++) {
              var row = "";
        for (var index in arrData[i]) {
            row += '"' + arrData[i][index] + '",';
        }
        row.slice(0, row.length - 1);
        CSV += row + '\r\n';
    }

    if (CSV === '') {
        //alert("Invalid data");
        return;
    }

    var fileName = "";
    fileName += ReportTitle.replace(/ /g, "_");
    var uri = 'data:text/csv;charset=utf-8,' + escape(CSV);
    var link = document.createElement("a");
    link.href = uri;
    link.style = "visibility:hidden";
    link.download = fileName + ".csv";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

var downloadCSV = function (x,c) {
    //if($(x).attr('id') != 'Renewal by Customers' && $(x).attr('id') != 'SWSS  Renewal by Customers') {
        var kpi = $(x).closest('.kpi');
        if (!kpi.length) {
            kpi = $(x).closest('.modal-body');
        }
        if(!kpi.length) {
            kpi =  $(x).closest('.modal-content');
        }

        var title = kpi.find('.dropdown-toggle').text();

        if (kpi.find('.dropdown-menu.categories:not(.rr)').length) {
            title = kpi.find('.dropdown-menu.categories a.active').text();
        }

        title = title.replace('Add Quarters', '');

        // Add '-' to YOY column values which are less then 0.
        var YOYTable = kpi.find('table:not(.legend):eq(0)');
        if (YOYTable[0] && YOYTable[0].className === "") {
            YOYTable = kpi.find('table:not(.legend):eq(1)');
        }
        var YOYColumnNum = -1;
        var negativeYOYColumnsArray = [];
        var spanChildArray = [];
        YOYTable.find('th').each(function (index) {
            if ($(this).text().trim().toLowerCase().indexOf("yoy") != -1) {
                YOYColumnNum = index;
            }
            var negativeYOYColumns;
            var spanChild = [];
            if (YOYColumnNum != -1) {
                YOYColumnNum++;
                negativeYOYColumns = YOYTable.find('tr td:nth-child(' + YOYColumnNum + ').text-right.red');
                spanChild = [];
                $(negativeYOYColumns).each(function () {
                    var val = $(this).text().trim();
                    spanChild.push($(this).html());
                    $(this).text("-" + val);
                });
                spanChildArray.push(spanChild);
                negativeYOYColumnsArray.push(negativeYOYColumns);
            }
            YOYColumnNum = -1;
        });


        var json = kpi.find('table:not(.legend):eq(0)').tableToJSON();
        if (json.length === 0) {
            json = kpi.find('table:not(.legend):eq(1)').tableToJSON();
        }
        negativeYOYColumnsArray.forEach(function (a) {
            spanChildArray.forEach(function (b) {
                if (a.length === b.length) {
                    $(a).each(function (index) {
                        $(this).html(b[index]);
                    });
                }
            })
        });

        //DE131090
        if (kpi.find('table.route-to-market').length >= 1) {
            json = [];
            var json2 = angular.copy(kpi.find('table.route-to-market:eq(0)'));
            var firstRowHeader = [];
            json2.find('> thead > tr:eq(0) > th').each(function (a, b) {
                var colspanVal = $(b).attr("colspan");
                if (typeof (colspanVal) == "undefined") {
                    colspanVal = 1;
                }
                else {
                    colspanVal = parseInt(colspanVal);
                }
                firstRowHeader.push({ "name": $(b).text().trim(), "cols": colspanVal });
            });
            json2.find('> thead > tr:eq(0)').remove();
            // flattening top header
            var temp = [];
            $(firstRowHeader).each(function (a, b) {
                for (var i = 0; i < b["cols"]; i++) {
                    if (b["name"] == "")
                        temp.push(b["name"]);
                    else
                        temp.push(b["name"] + " - ");

                }
            });
            firstRowHeader = angular.copy(temp);
            json2.find('> thead > tr:eq(0) > th').each(function (a, b) {
                firstRowHeader[a] = firstRowHeader[a] + $(b).text();
            });
            json2.find('> tbody > tr').each(function (a, b) {
                var tmp = {};
                for (var i = 0; i < firstRowHeader.length; i++) {
                    tmp[firstRowHeader[i]] = $(b).find('> td:eq(' + i + ')').text();
                }
                json.push(tmp);
            });
        }
        else if (kpi.hasClass('chart_bar_double_horizontal')) {
            json = [];
            var arr = [];
            var table = kpi.find('table:not(.legend):eq(0)');
            var isPartner = title.toLowerCase().indexOf('partner') > -1;
            table.find('thead > tr:eq(1) th').each(function (a, b) {
                $(b).find('table td').each(function (e, f) {
                    var one = table.find('thead > tr:eq(0) th:eq(' + (a) + ')').text();
                    var two = $(f).text();
                    one = one.trim();
                    one = one.replace(/,/g, "+");
                    two = two.trim();
                    two = two.replace(/,/g, "+");
                    if (a === 1) {
                        arr.push(one);
                    } else if (a === 2) {
                        arr.push(one + ' - ' + 'Opportunity');
                        if (!isPartner) {
                            arr.push(one + ' - ' + 'Pipeline');
                            arr.push(one + ' - ' + 'Gap in Pipeline');
                        }
                    } else {
                        arr.push(one + ' - ' + two + ' - ' + 'Opportunity');
                        if (!isPartner) {
                            arr.push(one + ' - ' + two + ' - ' + 'Pipeline');
                        }
                    }
                });
            });

            table.find('tbody > tr').each(function (a, b) {
                var sr = 1;
                var obj = {};
                obj[arr[0]] = $(b).find('.fix-long-word').text().replace(/ +/g, " ").trim();
                $(b).find('> td').each(function (e, f) {
                    if ($(f).find('table:eq(0) td').length) {
                        $(f).find('table:eq(0) td').each(function (g, h) {
                            obj[arr[sr]] = $(h).text();
                            sr++;
                        });

                    }
                });
                if (Object.keys(obj).length > 1) {
                    json.push(obj);
                }
            });
        } else if (kpi.find('table.scrolling-col').length) {
            var json_2 = kpi.find('table.scrolling-col').tableToJSON();
            json.forEach(function (c, i) {
                angular.extend(c, json_2[i]);
            });
        } else if (kpi.find('.product-table').length) {
            json = [];
            var table = kpi.find('.product-table').find('.product-family-table');
            var isDrilled = table.find('.sub-arch-list').length > 0;
            var label_1 = isDrilled ? 'Sub-Architectures' : 'Architectures';
            var label_2 = isDrilled ? 'Product Family' : 'Sub-Architectures';
            var isSubDrilled = table.find('.inner-product-family:not(.inner-product-arch-list)').length > 0;
            var label_3 = isSubDrilled ? 'Product Family' : '';
            var head_cells = table.find('> .tbl-head .col-head:gt(1)');
            var head_array = head_cells.map(function (a, b) {
                return $(b).text().trim();
            });

            var ul = table.find('> ul');
            ul.find('> li').each(function (c, d) {
                var obj = {};
                obj[label_1] = $(d).find('.tbl-col').eq(0).text().trim();
                obj[label_2] = '';
                obj[label_3] = '';
                obj['Total Value'] = $(d).find('.tbl-col').eq(1).text().trim();
                head_array.each(function (x, y) {
                    obj[y] = $(d).find('.tbl-col').eq(x + 2).text().trim();
                });
                json.push(obj);

                var ul_2 = $(d).find('> ul');
                ul_2.find('> li').each(function (e, f) {
                    var obj_2 = {};
                    obj_2[label_1] = '';
                    obj_2[label_2] = $(f).find('.tbl-col').eq(0).text().trim();
                    obj_2[label_3] = '';
                    obj_2['Total Value'] = $(f).find('.tbl-col').eq(1).text().trim();
                    head_array.each(function (x, y) {
                        obj_2[y] = $(f).find('.tbl-col').eq(x + 2).text().trim();
                    });
                    if (!isDrilled) {
                        json.push(obj_2);
                    }

                    var ul_3 = $(f).find('> ul');
                    ul_3.find('> li').each(function (g, h) {
                        var obj_3 = {};
                        obj_3[label_1] = '';
                        obj_3[label_2] = '';
                        obj_3[label_3] = $(h).find('.tbl-col').eq(0).text().trim();
                        obj_3['Total Value'] = $(h).find('.tbl-col').eq(1).text().trim();
                        head_array.each(function (x, y) {
                            obj_3[y] = $(h).find('.tbl-col').eq(x + 2).text().trim();
                        });
                        json.push(obj_3);
                    });

                });
            });
            //DE132293
        } else if (kpi.find('table.merge-cell').length >= 1) {
            json = [];
            var tableHeader = []
            kpi.find('table.merge-cell:eq(0) > thead:eq(0) > tr > th').each(function (index, col) {
                tableHeader.push($(col).text());
            });
            kpi.find('table.merge-cell:eq(0) > tbody > tr').each(function (index, row) {
                var tmpObj = {};
                for (var i = 0; i < tableHeader.length; i++) {
                    if (index % 2 == 1) {
                        if (i == 0)
                            tmpObj[tableHeader[i]] = "";
                        else {
                            var tmp = i - 1;
                            tmpObj[tableHeader[i]] = $(row).find('> td:eq(' + tmp + ')').text();
                        }
                    }
                    else {
                        tmpObj[tableHeader[i]] = $(row).find('> td:eq(' + i + ')').text();
                    }
                }
                json.push(tmpObj);
            });
        }
        else if (kpi.find('.doubleHead-table').length) {
            var table = kpi.find('table:not(.legend):eq(0)');
            var headings = [];
            table.find('thead > tr:eq(1) th').each(function (a, b) {
                var text = $(b).text();
                if (a > 1) {
                    var b = parseInt(a / 2);
                    b += 1;
                    text = table.find('thead > tr:eq(0) th').eq(b).text() + ' - ' + text;
                }
                headings.push(text);
            });
            json = table.tableToJSON({
                headings: headings
            });
            json.splice(0, 2);
        }
        else if (kpi.find('.modal-header').length && kpi.find('.modal-body').length){
            title = kpi.find('.modal-header').text().replace('Export As CSV', '');
            var body = kpi.find('.modal-body');
            json = body.find('table:not(.legend)').tableToJSON();
        }
        if (!title) {
            title = 'Contracts';
        }
        //DE148242 removing actions dropdown from customer names
        json.forEach(function (c) {
            if (c.Customers && c.Customers.indexOf('\n') > -1) {
                var i = c.Customers.indexOf('\n');
                c.Customers = c.Customers.substring(0, i);
            }
        });
        if(c.data_excel && c.viewType === 'list'){
            json = c.data_excel;
        }
        JSONToCSVConvertor(json, title.trim().replace(/,/g, "_"), true);
    //}
};

var getUniqueArch = function (data, keyName) {
    var keysHashmap = {};
    for (var i = 0; i < data.length; i++) {
        if (data[i].hasOwnProperty(keyName)) {
            if (typeof data[i][keyName] === "object") {
                for (var fKey in data[i][keyName]) {
                    keysHashmap[fKey] = 0;
                }
            } else {
                keysHashmap[data[i][keyName]] = 0;
            }
        }
    }
    return Object.keys(keysHashmap).sort();
};

var objectSum = function (obj) {
    var sum = 0;
    for (var el in obj) {
        if (obj.hasOwnProperty(el)) {
            sum += parseFloat(obj[el]);
        }
    }
    return sum;
};
var fillPCWithAccMng = function (response, name) {
    response[2].categories = [];
    response[2].categories[1] = name + "'s Partners";
    response[2].categories[2] = name + "'s Customers";
    return response;
};

var fillPCCategories = function (response) {
    response[2].categories = [];
    response[2].categories[1] = angular.copy(response[2]["categories-main"][1]);
    response[2].categories[2] = angular.copy(response[2]["categories-main"][2]);
    return response;
};
var bindTableScroll = function () {
    $(".tbl-wrapper").off('scroll').on("scroll", function () {
        var $this = $(this);
        var s = $this.scrollLeft();
              if ($this[0].scrollWidth === $this.innerWidth()) { /* Return if no scroll present */
            return;
        }
        if (s === 0) {
            $this.removeClass('table-left-shadow').addClass('table-right-shadow');
        } else if (s + $this.innerWidth() >= $this[0].scrollWidth) {
            $this.removeClass('table-right-shadow').addClass('table-left-shadow');
        } else {
            $this.addClass('table-left-shadow table-right-shadow');
        }
    });
    $(".tbl-wrapper").trigger('scroll'); /* Scroll function trigger to add class by default */
};

//changes for DE131184
var appendPartnerDiv = function () {
   // $(this).parent().parent().addClass('open');
     $('.bs-searchbox-partner').each(function() {
        var dropdown = $(this).closest('div.dropdown-menu');
        dropdown.find('> .bs-searchbox-partner').remove();
        $(this).detach().prependTo(dropdown);
        dropdown.find('> .bs-searchbox-partner').removeClass('bs-searchbox-partner');
    });
};

var getSecurityRefreshGridHeight = function () {
    var element = document.getElementById('ag-grid');
    var winHeight = window.innerHeight;
    var header = document.getElementById('header').offsetHeight;
    var breadcrumb = document.getElementById('breadcrumb').offsetHeight;
    var subheader = document.getElementById('subheader').offsetHeight;
    var filterAndActionsSection = document.getElementById('actions').offsetHeight;
    var paginationHeight = document.getElementById('paginationHeight').offsetHeight;
    var margin = 15;
    var tableHeight = winHeight  - (header + breadcrumb + subheader + paginationHeight + filterAndActionsSection + margin);
    element.style.height = tableHeight + 'px';
}

var getCollaborationRefreshGridHeight = function () {
    var element = document.getElementById('ag-grid');
    var winHeight = window.innerHeight;
    var header = document.getElementById('header').offsetHeight;
    var breadcrumb = document.getElementById('breadcrumb').offsetHeight;
    var subheader = document.getElementById('subheader').offsetHeight;
    var filterAndActionsSection = document.getElementById('actions').offsetHeight;
    var paginationHeight = document.getElementById('paginationHeight').offsetHeight;
    var margin = 15;
    var tableHeight = winHeight  - (header + breadcrumb + subheader + paginationHeight + filterAndActionsSection + margin);
    element.style.height = tableHeight + 'px';
}

var getSecondChanceGridHeight = function () {
    var element = document.getElementById('ag-grid');
    var winHeight = window.innerHeight;
    var header = document.getElementById('header').offsetHeight;
    var breadcrumb = document.getElementById('breadcrumb').offsetHeight;
    var subheader = document.getElementById('subheader').offsetHeight;
    var filterAndActionsSection = document.getElementById('actions').offsetHeight;
    var paginationHeight = document.getElementById('paginationHeight').offsetHeight;
    var margin = 15;
    var tableHeight = winHeight  - (header + breadcrumb + subheader + paginationHeight + filterAndActionsSection + margin);
    element.style.height = tableHeight + 'px';
}

$(function () {
    var isInIframe = window.location !== window.parent.location;

    if (isInIframe) {
        $('body').addClass('sfdc-header');
    }
    $('body').on('click', 'a.disabled', function (e) {
        e.preventDefault();
        e.stopPropagation();
    });

    $(document).on('mouseenter', 'li.sales-subfilter .ico-close', function () {
        var li = $(this).closest('li');
        var cat = li.attr('data-category');
        li.nextAll('li.sales-subfilter').filter('[data-category="' + cat + '"]').addClass('delete-line');
    });

    $(document).on('mouseleave', 'li.sales-subfilter .ico-close', function () {
        var li = $(this).closest('li');
        var cat = li.attr('data-category');
        li.nextAll('li.sales-subfilter').filter('[data-category="' + cat + '"]').removeClass('delete-line');
    });

    $(window).resize(function () {
        $('.slick-carousel').slick('resize');
        //hide tool-tip on zoom in/out
        /*$(".d3-tip").hide();
        $(".tooltip").hide();*/
        $('.action_offset').hide();
        $('.tooltip').remove();
    });

    $(window).on('orientationchange', function () {
        $('.slick-carousel').slick('resize');
    });

    $(document).mouseup(function (e) {
        var container = $(".action_offset,.action-button");
        if (!container.is(e.target) && container.has(e.target).length === 0) {
            $(".action_offset").hide();
        }
        container = $('svg, .d3-tip');
        if (!container.is(e.target) && container.has(e.target).length === 0) {
            //$(".d3-tip").hide();
        }
    });
    $(document).on('mouseover', '.dropdown.export', function () {
        var pos = $(this).offset();
        pos.top += 31;
        pos.left += 0;
        $(this).find('.dropdown-menu').offset(pos);
    });
    $(document).on('click', '.service-dropdown .dropdown-toggle', function () {
        var pos = $(this).offset();
        pos.top += 25;
        pos.left -= 1;
        var width = $(this).closest('.nya-bs-select').width() + 1;
        $(this).next('.dropdown-menu').width(width).offset(pos);
    });

    $(window).scroll(function () {
        $('.nya-bs-select.open').removeClass('open');
    });
});
