define(["qlik", "jquery", "./d3.min", "css!./UHMB_SPC_annotations.css"],
    function (qlik, $, d3) {
        'use strict';
        return {

            initialProperties: {
                qHyperCubeDef: {
                    qDimensions: [],
                    qMeasures: [],
                    qInitialDataFetch: [{
                        qWidth: 4,
                        qHeight: 4
                    }
                    ]
                }
            },
            definition: {
                type: "items",
                component: "accordion",
                items: {
                    dimensions: {
                        uses: "dimensions",
                        min: 1,
                        max: 1
                    },
                    measures: {
                        uses: "measures",
                        min: 1,
                        max: 2
                    },
                    sorting: {
                        uses: "sorting"
                    },
                    addons: {
                        uses: "addons",
                        items: {
                            dataHandling: {
                                uses: "dataHandling"
                            }
                        }
                    },
                    customSection: {
                        component: "expandable-items",
                        label: "SPC Controls",
                        items: {
                            Targets: {
                                type: "items",
                                label: "Targets",
                                items: {
                                    IsTarget: {
                                        ref: "ShowTarget",
                                        type: "integer",
                                        label: "Display Target(0 or 1)?",
                                        expression: "optional",
                                        defaultValue: "0"
                                    },
                                    TargetValue: {
                                        ref: "TargetValue",
                                        type: "string",
                                        label: "Target",
                                        expression: "optional"
                                    }

                                }

                            },
                            Header1: {
                                type: "items",
                                label: "Settings",
                                items: {
                                    IsHigherBetter: {
                                        ref: "HigherBetter",
                                        type: "integer",
                                        label: "Is Higher Better (0 =No 1 = Yes 2=Neither(Purple))?",
                                        expression: "optional",
                                        defaultValue: "1"
                                    },
                                    BaselineFlag: {
                                        type: "boolean",
                                        label: "Use Baseline",
                                        ref: "BaseLineFlag",
                                        defaultValue: true
                                    },
                                    CalculationPoints: {
                                        ref: "CalcPoints",
                                        type: "string",
                                        label: "Num Points for Baseline",
                                        expression: "optional",
                                        defaultValue: "20",
                                        show: function (data) {
                                            return data.BaseLineFlag;
                                        }

                                    },
                                    // CLType: {
                                    //     type: "string",
                                    //     component: "dropdown",
                                    //     label: "Control Limit Type",
                                    //     ref: "CLType",
                                    //     options: [{
                                    //             value: "MR",
                                    //             label: "Moving Range"
                                    //         }, {
                                    //             value: "SD",
                                    //             label: "Standard Deviation"
                                    //         }
                                    //     ],
                                    //     defaultValue: "MR"
                                    // },
                                    CLUnder0: {
                                        ref: "ClUnderZero",
                                        type: "integer",
                                        label: "Allow Limit under Zero (0 or 1)?",
                                        expression: "optional",
                                        defaultValue: "1"
                                    },
                                    // StndDev: {
                                    //     ref: "CLStDev",
                                    //     type: "string",
                                    //     label: "Control Limit multiple",
                                    //     expression: "optional",
                                    //     defaultValue: "3"

                                    // },
                                    RunLength: {
                                        ref: "runLength",
                                        type: "integer",
                                        label: "Run above or below the mean",
                                        expression: "optional",
                                        defaultValue: 7

                                    },
                                    TrendLength: {
                                        ref: "trendLength",
                                        type: "integer",
                                        label: "Increasing or decreasing trends",
                                        expression: "optional",
                                        defaultValue: 7

                                    },
                                    CloseToMean: {
                                        ref: "runclosetomean",
                                        type: "integer",
                                        label: "Consecutive run within 1 sigma",
                                        expression: "optional",
                                        defaultValue: 15

                                    }

                                }
                            },
                            Header2: {
                                type: "items",
                                label: "Format",
                                items: {
                                    ForcedZero: {
                                        ref: "forcedZero",
                                        type: "boolean",
                                        label: "Forced Zero",
                                        expression: "optional",
                                        defaultValue: true
                                    },
                                    ShowLabels: {
                                        ref: "showLabels",
                                        type: "boolean",
                                        label: "Show Labels",
                                        expression: "optional",
                                        defaultValue: true
                                    },
                                    HideXAxis: {
                                        ref: "HideXAxis",
                                        type: "integer",
                                        label: "Hide X Axis (0 or 1)",
                                        expression: "optional",
                                        defaultValue: 0
                                    },
                                    DateFormat: {
                                        ref: "dateFormat",
                                        type: "string",
                                        label: "Format for X axis",
                                        expression: "optional",
                                        defaultValue: "%d-%b-%Y"
                                    },
                                    ShowRecal: {
                                        ref: "showRecalc",
                                        type: "integer",
                                        label: "Show recalculation periods (0 or 1)?",
                                        expression: "optional",
                                        defaultValue: "0"
                                    },
                                    RecalColours: {
                                        ref: "recalColours",
                                        type: "string",
                                        label: "Colour array for recalc periods e.g #00FFFF;red;violet",
                                        expression: "optional",
                                        defaultValue: ""
                                    },
                                    TableWidth: {
                                        ref: "tableWidth",
                                        type: "integer",
                                        label: "Width of Definition table ( 0 to disable)",
                                        expression: "optional",
                                        defaultValue: 150
                                    }

                                }

                            }
                        }
                    },
                    appearance: {
                        uses: "settings"
                    },
                    abouttxt: {
                        label: "About",
                        type: "items",
                        items: {
                            abouttxt2: {
                                label: "About",
                                type: "items",
                                items: {
                                    aboutt: {
                                        component: "text",
                                        label: "UHMB SPC Extension with recalculation of Control Limits developed by Dale Wright"
                                    }
                                }
                            }
                        }
                    }
                }

            },
            support: {
                snapshot: true,
                export: true,
                exportData: true
            },
            paint: function ($element, layout) {

                var fullData;
                var numMeasure = layout.qHyperCube.qMeasureInfo.length;

                var requestPage = [{
                    qTop: 0,
                    qLeft: 0,
                    qWidth: 10, //should be # of columns
                    qHeight: this.backendApi.getRowCount()
                }
                ];
                this.backendApi.getData(requestPage).then(function (dataPages) {
                    fullData = $.map(dataPages, function (obj) {
                        return $.extend(true, {}, obj);
                    });

                    var width = $element.width();
                    var height = $element.height();
                    var id = "container_" + layout.qInfo.qId;
                    if (document.getElementById(id)) {
                        $("#" + id).empty();
                    } else {

                        try {
                            $element.append($('<div />;').css('display', 'inline-block').attr("id", id).width(width).height(height));
                        } catch (err) {
                            console.log(err);
                        }

                    }

                    var qMatrix = fullData[0].qMatrix;
                    var fdata = qMatrix
                        .filter(function (f) {
                            return f[1].qNum != 'NaN' && f[0].qNum != 'NaN';
                        });
                    if (numMeasure == 1) {
                        var data = fdata.map(function (d) {

                            return {

                                "dim": d[0].qNum,
                                "dimText": d[0].qText,
                                "value": d[1].qNum,
                                "valText": d[1].qText,
                                "reCalcID": ''

                            }

                        });
                    } else if (numMeasure == 2) {
                        var data = fdata.map(function (d) {

                            return {

                                "dim": d[0].qNum,
                                "dimText": d[0].qText,
                                "value": d[1].qNum,
                                "valText": d[1].qText,
                                "reCalcID": d[2].qText

                            }

                        });

                    }

                    var measureLabel = layout.qHyperCube.qMeasureInfo[0].qFallbackTitle;
                    var dimLabel = layout.qHyperCube.qDimensionInfo[0].qFallbackTitle;

                    var options = {
                        measurelabel: measureLabel,
                        dimlabel: dimLabel,
                        // stdev: layout.CLStDev,
                        runlength: layout.runLength,
                        trendlength: layout.trendLength,
                        forcedzero: layout.forcedZero,
                        useBaseline: layout.BaseLineFlag,
                        calcpoints: layout.CalcPoints,
                        // cltype: layout.CLType,
                        showtarget: layout.ShowTarget,
                        targetvalue: layout.TargetValue,
                        higherbetter: layout.HigherBetter,
                        showlabels: layout.showLabels,
                        within1sigma: layout.runclosetomean,
                        clunderzero: layout.ClUnderZero,
                        dateformat: layout.dateFormat,
                        tablewidth: layout.tableWidth,
                        numMeasures: numMeasure,
                        showRecalc: layout.showRecalc,
                        HideXAxis: layout.HideXAxis,
                        recalColours: layout.recalColours

                    };

                    DrawChart(data, layout, width, height, id, options);

                    //needed for export
                    this.$scope.selections = [];
                    return qlik.Promise.resolve();
                });
            }
            //End of Paint function

        };
        // End of Master Function

        function DrawChart(data, layout, w, h, id, opt) {

            //Use this to create the correct path for the images
            var extName = "UHMB_SPC_annotations";

            //Create trimmed dataset for calculation of mean and CL's on initial points (if selected)
            var initData = JSON.parse(JSON.stringify(data));
            if (data.length >= opt.calcpoints && opt.calcpoints > 0) {
                initData.length = opt.calcpoints;
            }

            var optSD = 3; //number of Sigma for CL's
            var runlength = opt.runlength;
            var trendlength = opt.trendlength;
            var showtarget = ((opt.showtarget == 1) ? true : false);
            var targetvalue = parseFloat(opt.targetvalue);
            var higherbetter = ((opt.higherbetter == 1) ? true : false);
            var showlabels = opt.showlabels;
            var clunderzero = ((opt.clunderzero == 1) ? true : false);
            var showRecalc = opt.showRecalc;
            var higherbetternum = opt.higherbetter;
            var numMeasures = opt.numMeasures;
            var HideXAxis = opt.HideXAxis;

            var unique = [...new Set(data.map(item => item.reCalcID))];
            var Holding = [];
            unique.forEach((ID) => {
                var temp = data.filter(x => x.reCalcID == ID);
                Holding.push(temp);
                temp = null;
            });

            Holding.forEach((group) => {
                var trimmed = JSON.parse(JSON.stringify(group));
                if (trimmed.length >= opt.calcpoints && opt.calcpoints > 0 && opt.useBaseline == true) {
                    trimmed.length = opt.calcpoints;
                }

                trimmed.forEach(function (d, i) {
                    //d.dim = dateFromQlikNumber(d.dim);
                    //d.value = d.value;
                    if (i > 0) {
                        d.MR = Math.abs(d.value - trimmed[i - 1].value);
                    }
                });
                var xAvg = d3.mean(getFields(trimmed, "value"));
                var xMR = d3.mean(getFields(trimmed, "MR"));
                var xUCL = (xMR / 1.128 * optSD) + xAvg;
                var xLCL = xAvg - (xMR / 1.128 * optSD);
                if (clunderzero == false) {
                    if (xLCL < 0) {
                        xLCL = 0;
                    }
                }
                var xSigma = xMR / 1.128;

                group.forEach((row) => {
                    row.currAvg = xAvg;
                    row.currUCL = xUCL;
                    row.currLCL = xLCL;
                    row.currSigma = xSigma;
                });

            });

            //change margins if labels are being shown

            if (showlabels == true) {
                var margin = {
                    top: 30,
                    right: 70,
                    bottom: 90,
                    left: 70
                };
            } else {
                var margin = {
                    top: 30,
                    right: 70,
                    bottom: 70,
                    left: 50
                };
            }
            if (HideXAxis == 1) {
                margin.bottom = 10;
            }
            var width = w - margin.left - margin.right - opt.tablewidth,
                height = h - margin.top - margin.bottom;

            var prevValue;

            // parse the date / time
            try {
                var parseTime = d3.timeParse("%d-%b-%y");
            } catch (err) {
                console.log(err);
            }

            // set the ranges
            var x = d3.scaleTime().range([0, width]);
            var y = d3.scaleLinear().range([height, 0]);

            // define the value line on the data
            var valueline = d3.line()
                .x(function (d) {
                    return x(d.dim);
                })
                .y(function (d) {
                    return y(d.value);
                });

            // append the svg obgect to the body of the page
            // appends a 'group' element to 'svg'
            // moves the 'group' element to the top left margin
            var svg = d3.select("#" + id).append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
                .append("g")
                .attr("transform",
                    "translate(" + margin.left + "," + margin.top + ")");

            data.forEach(function (d, i) {
                d.dim = dateFromQlikNumber(d.dim);
                d.value = d.value;
                if (i > 0) {
                    d.MR = d.value - data[i - 1].value;
                }
                var meansum = meanSumCheck(data, i, runlength);
                var revmeansum = revMeanSumCheck(data, i, runlength);
                var trendsum = trendSumCheck(data, i, trendlength - 1);
                var closetomean = closeToMean(data, i, opt.within1sigma);
                if (meansum == runlength || revmeansum == runlength || ((i > 0) && (data[i - 1].check == 1 && d.value > d.currAvg))) {
                    d.check = 1;
                } else if (meansum == -runlength || revmeansum == -runlength || ((i > 0) && (data[i - 1].check == -1 && d.value < d.currAvg))) {
                    d.check = -1;
                } else {
                    d.check = 0;
                }
                if (trendsum >= (trendlength - 1) || ((i > 0) && (data[i - 1].asctrendcheck == 1 && d.value > data[i - 1].value))) {
                    d.asctrendcheck = 1;
                } else {
                    d.asctrendcheck = 0;
                }
                if (trendsum <= -1 * (trendlength - 1) || ((i > 0) && (data[i - 1].desctrendcheck == 1 && d.value < data[i - 1].value))) {
                    d.desctrendcheck = 1;
                } else {
                    d.desctrendcheck = 0;
                }
                if (closetomean == opt.within1sigma || ((i > 0) && (data[i - 1].closetomean == 1 && data[i - 1].currSigma > Math.abs(data[i - 1].currAvg - d.value)))) {
                    d.closetomean = 1;
                } else {
                    d.closetomean = 0;
                }

                prevValue = d.value;

            });

            //var startdash = d3.max(getFields(initData,"dim"));

            //define the lines for target, mean and Control Limits
            var targetline = d3.line()
                .x(function (d) {
                    return x(d.dim);
                })
                .y(function (d) {
                    return y(targetvalue);
                });
            var avgline = d3.line()
                .x(function (d) {
                    return x(d.dim);
                })
                .y(function (d) {
                    return y(d.currAvg);
                });
            var UCLline = d3.line()
                .x(function (d) {
                    return x(d.dim);
                })
                .y(function (d) {
                    return y(d.currUCL);
                });
            var LCLline = d3.line()
                .x(function (d) {
                    return x(d.dim);
                })
                .y(function (d) {
                    return y(d.currLCL);
                });

            var limitpadding = (d3.max(data, function (d) {
                return d.currUCL;
            }) - d3.min(data, function (d) {
                return d.currAvg;
            })) * 0.1; // figure to pad the limits of the y-axis

            var uppery = Math.max(d3.max(data, function (d) {
                return d.currUCL;
            }), d3.max(data, function (d) {
                return d.value;
            })) + limitpadding;
            var lowery = Math.min(d3.min(data, function (d) {
                return d.currLCL;
            }), d3.min(data, function (d) {
                return d.value;
            })) - limitpadding;
            // variable for calculating the axis limits for y-axis
            if (opt.forcedzero == true) {
                lowery = 0;

            } else if (showtarget == true) {
                lowery = Math.min(lowery, targetvalue - limitpadding);
                uppery = Math.max(uppery, targetvalue + limitpadding);
            }
            //		else{
            //		var lowery = d3.min(data, function(d) { return d.currLCL; })-limitpadding;
            //		}

            if (showtarget == true) {
                uppery = Math.max(uppery, targetvalue + limitpadding);
            }

            // Scale the range of the data
            x.domain(d3.extent(data, function (d) {
                return d.dim;
            }));
            y.domain([Math.min(lowery, d3.min(data, function (d) {
                return d.value;
            })), Math.max(d3.max(data, function (d) {
                return d.value;
            }), uppery)]);

            //div for tooltip
            var TTWidth = Math.min(240, width / 2);
            var div = d3.select("#" + id).append("div")
                .attr('id', 'valuetooltip')
                .attr("class", "tooltip")
                .style("opacity", 0)
                .style("width", TTWidth + "px");

            //recalculation windows
            if (showRecalc == 1) {
                if (opt.recalColours == '') {
                    var colours = ['lightcoral', 'lightblue', 'gold', 'lightgreen', 'palevioletred', 'lavenderblush', 'lightgrey', 'mediumturquoise'];
                } else {
                    var colours = opt.recalColours.split(';');
                }
                Holding.forEach((region, i) => {
                    var MinX = x(d3.min(region, function (d) {
                        return d.dim;
                    }));
                    var MaxX = x(d3.max(region, function (d) {
                        return d.dim;
                    }));

                    svg.append('rect')
                        .attr('x', MinX)
                        .attr('y', 2)
                        //				.attr('rx',5)
                        //				.attr('ry',5)
                        .attr('width', MaxX - MinX)
                        .attr('height', height - 2)
                        //			.attr('stroke', 'black')
                        .attr('fill', colours[i % (colours.length)])
                        .style("opacity", 0.25);

                    svg.append("text")
                        .attr("transform", "translate(" + (MaxX - ((MaxX - MinX) / 2)) + "," + 0 + ")")
                        .attr("dy", "0em")
                        .attr("text-anchor", "middle")
                        .style("fill", 'black')
                        .style("font-size", "10px")

                        .text(region[0].reCalcID);
                });
            }

            // Add the valueline path.
            svg.append("path")
                .data([data])
                .attr("class", "line")
                .attr("d", valueline);
            //add mean
            svg.append("path")
                .data([data])
                .attr("class", "avgline")
                .attr("d", avgline);
            //add UCL
            svg.append("path")
                .data([data])
                .attr("class", "CLline")
                .attr("d", UCLline);
            //add LCL
            svg.append("path")
                .data([data])
                .attr("class", "CLline")
                .attr("d", LCLline);
            //add target (if selected)
            if (showtarget == true) {
                svg.append("path")
                    .data([data])
                    .attr("class", "targetline")
                    .attr("d", targetline);
            }

            try {
                svg.selectAll(".dot")
                    .data(data)
                    .enter()
                    .append("circle")
                    .attr("class", "dot")
                    .classed("positive", function (d) {
                        if (posiCheck(higherbetter, d) == "Positive" && higherbetternum < 2) {
                            return true;
                        }
                        return false;
                    })
                    .classed("negative", function (d) {
                        if (posiCheck(higherbetter, d) == "Negative" && higherbetternum < 2) {
                            return true;
                        }
                        return false;
                    })
                    .classed("purple", function (d) {
                        if (posiCheck(higherbetternum, d) == "Purple" && higherbetternum > 1) {
                            return true;
                        }
                        return false;
                    })
                    .attr("cx", valueline.x())
                    .attr("cy", valueline.y())
                    .attr("r", 3.5)

                    .on("mouseover", function (d) {

                        var TTValue = d.valText;
                        var TTLeft = Math.min((margin.left + width - TTWidth), d3.select(this).attr("cx"));

                        div.transition()
                            .duration(200)
                            .style("opacity", .9);
                        div.html(opt.dimlabel + ": " + d.dim.getFullYear() + "-" + (d.dim.getMonth() + 1) + "-" + d.dim.getDate() + "<br/>" +
                            opt.measurelabel + ": " + TTValue + "<br/>"
                            + tooltipbuilder(d))
                            .style("left", (TTLeft) + "px");

                        var tooltipoffset;
                        if (parseInt(d3.select(this).attr("cy")) < height / 2) {
                            tooltipoffset = (parseInt(d3.select(this).attr("cy")) + 30 + "px");
                        } else {
                            tooltipoffset = (y(d.value) + 30 - document.getElementById('valuetooltip').clientHeight + "px");
                        }
                        div.style("top", tooltipoffset);
                        d3.select(this).classed("highlight", true);
                    })
                    .on("mouseout", function (d) {
                        div.transition()
                            .duration(500)
                            .style("opacity", 0);
                        d3.select(this).classed("highlight", false);
                    });
            } catch (err) {
                console.log(err);
            }

            var xAxis = d3.axisBottom(x).tickFormat(d3.timeFormat(opt.dateformat));
            // Add the X Axis
            svg.append("g")
                .attr("transform", "translate(0," + height + ")")
                .call(xAxis)
                .selectAll("text")
                .style("text-anchor", "end")
                .attr("dx", "-.8em")
                .attr("dy", ".15em")
                .attr("transform", "rotate(-65)");

            if (showlabels == true && HideXAxis == 0) {
                // Add the x Axis label

                svg.append("text")
                    .attr("transform",
                        "translate(" + (width / 2) + " ," +
                        (height + margin.top + margin.bottom - 40) + ")")
                    .style("text-anchor", "middle")
                    .text(opt.dimlabel);
            }
            // Add the Y Axis

            var formatTest = data[data.length - 1].valText;

            if (formatTest.charAt(formatTest.length - 1) == '%') {

                var yAxis = d3.axisLeft(y).tickFormat(d3.format('~%'));

            } else {
                var yAxis = d3.axisLeft(y);
            }
            svg.append("g")
                .call(yAxis);
            if (showlabels == true) {
                //Add the Y axis label
                svg.append("text")
                    .attr("transform", "rotate(-90)")
                    .attr("y", 0 - margin.left)
                    .attr("x", 0 - (height / 2))
                    .attr("dy", "1em")
                    .style("text-anchor", "middle")
                    .text(opt.measurelabel);
            }
            //Title Text
            var highertext = "lower is better";
            if (higherbetter == true) {
                highertext = "higher is better";
            }
            if (higherbetternum > 1) {
                highertext = "neither higher or lower is better";
            }

            var titletext = "*Mean and Control Limits calculated on full dataset within recalculation window, " + highertext;
            if (data.length >= opt.calcpoints && opt.calcpoints > 0) {
                titletext = "*Mean and Control Limits (re)calculated on first " + opt.calcpoints + " points of data, " + highertext;
            }
            svg.append("text")
                .attr("transform", "translate(" + (2 - margin.left) + "," + (5 - margin.top) + ")")
                .attr("dy", ".35em")
                .attr("text-anchor", "start")
                .style("fill", "grey")
                .attr("font-size", "10px")
                .text(titletext);
            if (formatTest.charAt(formatTest.length - 1) == '%') {

                //UCL text
                svg.append("text")
                    .attr("transform", "translate(" + (width + 3) + "," + y(data[data.length - 1].currUCL) + ")")
                    .attr("dy", ".35em")
                    .attr("text-anchor", "start")
                    .style("fill", "grey")
                    .text("(" + d3.format('.0%')(data[data.length - 1].currUCL) + ")");

                //LCL text
                svg.append("text")
                    .attr("transform", "translate(" + (width + 3) + "," + y(data[data.length - 1].currLCL) + ")")
                    .attr("dy", ".35em")
                    .attr("text-anchor", "start")
                    .style("fill", "grey")
                    .text("(" + d3.format('.0%')(data[data.length - 1].currLCL) + ")");

                //Mean text
                svg.append("text")
                    .attr("transform", "translate(" + (width + 3) + "," + y(data[data.length - 1].currAvg) + ")")
                    .attr("dy", ".35em")
                    .attr("text-anchor", "start")
                    .style("fill", "black")
                    .text("(" + d3.format('.0%')(data[data.length - 1].currAvg) + ")");

                //Target Text
                if (showtarget == true) {
                    svg.append("text")
                        .attr("transform", "translate(" + (30) + "," + y(targetvalue) + ")")
                        .attr("dy", "1em")
                        .attr("text-anchor", "start")
                        .style("fill", "red")
                        .text("target:(" + d3.format('.0%')(targetvalue) + ")");
                }
            } else {

                //UCL text
                svg.append("text")
                    .attr("transform", "translate(" + (width + 3) + "," + y(data[data.length - 1].currUCL) + ")")
                    .attr("dy", ".35em")
                    .attr("text-anchor", "start")
                    .style("fill", "grey")
                    .text("(" + data[data.length - 1].currUCL.toFixed(2) + ")");

                //LCL text
                svg.append("text")
                    .attr("transform", "translate(" + (width + 3) + "," + y(data[data.length - 1].currLCL) + ")")
                    .attr("dy", ".35em")
                    .attr("text-anchor", "start")
                    .style("fill", "grey")
                    .text("(" + data[data.length - 1].currLCL.toFixed(2) + ")");

                //Mean text
                svg.append("text")
                    .attr("transform", "translate(" + (width + 3) + "," + y(data[data.length - 1].currAvg) + ")")
                    .attr("dy", ".35em")
                    .attr("text-anchor", "start")
                    .style("fill", "black")
                    .text("(" + data[data.length - 1].currAvg.toFixed(2) + ")");

                //Target Text
                if (showtarget == true) {
                    svg.append("text")
                        .attr("transform", "translate(" + (30) + "," + y(targetvalue) + ")")
                        .attr("dy", "1em")
                        .attr("text-anchor", "start")
                        .style("fill", "red")
                        .text("target:(" + targetvalue + ")");
                }
            }

            //key setup
            var key = d3.select("#" + id).append("div")
                .attr('id', 'SPCKey')
                .attr("class", "key")
                .style("opacity", 0)
                .style("top", margin.top + "px")
                .style("left", margin.left + "px");
            var keysvg = key.append("svg")
                .attr("width", width)
                .attr("height", height);

            //	  var triangles = [];
            //	  triangles.push({
            //  		x: width/4,
            //		y: height/2 +45
            //	  });

            //	  var arc = d3.symbol().type(d3.symbolTriangle);

            //	  var TriLine = keysvg.selectAll('path')
            //  		.data(triangles)
            //  		.enter()
            //  		.append('path')
            //  		.attr('d', arc)
            //  		.attr('fill', 'red')
            //  		.attr('stroke', 'red')
            //  		.attr('stroke-width', 1)
            //  		.attr('transform', function(d) {
            //    		return "translate(" + d.x + "," +d.y +")";
            //  		});

            if (higherbetternum > 1) {
                keysvg.append("circle").attr("cx", width / 4).attr("cy", height / 2 - 15).attr("r", 6).attr("class", "dot").attr("class", "purple");
                keysvg.append("circle").attr("cx", width / 4).attr("cy", height / 2 + 15).attr("r", 6).attr("class", "dot");
                keysvg.append("text").attr("x", 20 + width / 4).attr("y", height / 2 - 15).text("Special Cause - Neither").style("font-size", "15px").attr("alignment-baseline", "middle").attr("class", "keytext");
                keysvg.append("text").attr("x", 20 + width / 4).attr("y", height / 2 + 15).text("Normal Variation").style("font-size", "15px").attr("alignment-baseline", "middle").attr("class", "keytext");

            } else {

                keysvg.append("circle").attr("cx", width / 4).attr("cy", height / 2 - 45).attr("r", 6).attr("class", "dot").attr("class", "negative");
                keysvg.append("circle").attr("cx", width / 4).attr("cy", height / 2 - 15).attr("r", 6).attr("class", "dot").attr("class", "positive");
                keysvg.append("circle").attr("cx", width / 4).attr("cy", height / 2 + 15).attr("r", 6).attr("class", "dot");

                keysvg.append("text").attr("x", 20 + width / 4).attr("y", height / 2 - 45).text("Special Cause - Concern").style("font-size", "15px").attr("alignment-baseline", "middle").attr("class", "keytext");
                keysvg.append("text").attr("x", 20 + width / 4).attr("y", height / 2 - 15).text("Special Cause - Improvement").style("font-size", "15px").attr("alignment-baseline", "middle").attr("class", "keytext");
                keysvg.append("text").attr("x", 20 + width / 4).attr("y", height / 2 + 15).text("Normal Variation").style("font-size", "15px").attr("alignment-baseline", "middle").attr("class", "keytext");
            }
            //	  keysvg.append("text").attr("x", 20 + width/4).attr("y", height/2 +45).text("Outside of Control Limits").style("font-size", "15px").attr("alignment-baseline","middle").attr("class", "keytext");

            var showkey = 0;
            var keyimage = svg.append('image')
                .attr('xlink:href', '/extensions/' + extName + '/' + 'KeySmall.png')
                .attr('width', 20)
                .attr('height', 20)
                .attr('x', width + margin.right - 40)
                .attr('y', height + margin.top)
                .on("click", function (d) {
                    if (showkey == 0) {
                        key.transition()
                            .duration(500)
                            .style("opacity", 0.75);
                        showkey = 1;
                    } else {
                        key.transition()
                            .duration(500)
                            .style("opacity", 0);
                        showkey = 0;

                    }
                });

            var specvaricon = [{
                filename: "speccausehighimp.png",
                description: "Special cause variation - improvement  (indicator where high is good)"
            }, {
                filename: "speccausehighconc.png",
                description: "Special cause variation - cause for concern (indicator where high is a concern)"
            }, {
                filename: "speccauselowconc.png",
                description: "Special cause variation - cause for concern (indicator where low is a concern)"
            }, {
                filename: "speccauselowimp.png",
                description: "Special cause variation - improvement  (indicator where low is good)"
            }, {
                filename: "comcause.png",
                description: "Common cause variation"
            }, {
                filename: "V-Purple Up.png",
                description: "Common cause variation"
            }, {
                filename: "V-Purple Down.png",
                description: "Common cause variation"
            }
            ];

            var specindex;

            if ((data[data.length - 1].check == 1 && higherbetternum > 1) || (data[data.length - 1].value > data[data.length - 1].currUCL && higherbetternum > 1)) {
                specindex = 5;
            } else if ((data[data.length - 1].check == -1 && higherbetternum > 1) || (data[data.length - 1].value < data[data.length - 1].currLCL && higherbetternum > 1)) {
                specindex = 6;

            } else if ((data[data.length - 1].asctrendcheck == 1 && higherbetternum > 1)) {
                specindex = 5;
            } else if ((data[data.length - 1].asctrendcheck == 1 && higherbetternum > 1)) {
                specindex = 6;
            } else if ((data[data.length - 1].check == 1 && higherbetter == true) || (data[data.length - 1].value > data[data.length - 1].currUCL && higherbetter == true)) {
                specindex = 0;
            } else if ((data[data.length - 1].check == -1 && higherbetter == false) || (data[data.length - 1].value < data[data.length - 1].currLCL && higherbetter == false)) {
                specindex = 3;
            } else if ((data[data.length - 1].check == 1 && higherbetter == false) || (data[data.length - 1].value > data[data.length - 1].currUCL && higherbetter == false)) {
                specindex = 1;
            } else if ((data[data.length - 1].check == -1 && higherbetter == true) || (data[data.length - 1].value < data[data.length - 1].currLCL && higherbetter == true)) {
                specindex = 2;
            } else if (data[data.length - 1].asctrendcheck == 1 && higherbetter == true) {
                specindex = 0;
            } else if (data[data.length - 1].asctrendcheck == -1 && higherbetter == false) {
                specindex = 3;
            } else if (data[data.length - 1].asctrendcheck == 1 && higherbetter == false) {
                specindex = 1;
            } else if (data[data.length - 1].asctrendcheck == -1 && higherbetter == true) {
                specindex = 2;
            } else {
                specindex = 4;
            }

            var targeticon = [{
                filename: "consfail.png",
                description: "The system is expected to consistently fail the target"
            }, {
                filename: "conspass.png",
                description: "The system is expected to consistently pass the target"
            }, {
                filename: "randvar.png",
                description: "The system may achieve or fail the target subject to random variation"
            }
            ];

            var targetindex;
            if ((higherbetter == true && data[data.length - 1].currLCL > targetvalue) || (higherbetter == false && data[data.length - 1].currUCL < targetvalue)) {
                targetindex = 1;
            } else if ((higherbetter == true && data[data.length - 1].currUCL < targetvalue) || (higherbetter == false && data[data.length - 1].currLCL > targetvalue)) {
                targetindex = 0;
            } else {
                targetindex = 2;
            }

            //append icon for targets
            if (showtarget == true) {
                var targetimage = svg.append('image')
                    .attr('xlink:href', '/extensions/' + extName + '/' + targeticon[targetindex].filename)
                    .attr('width', margin.top)
                    .attr('height', margin.top)
                    .attr('x', width + margin.right - 40)
                    .attr('y', 0 - margin.top)
                    .append('svg:title')
                    .text(targeticon[targetindex].description);
            }
            var causeimage = svg.append('image')
                .attr('xlink:href', '/extensions/' + extName + '/' + specvaricon[specindex].filename)
                .attr('width', margin.top)
                .attr('height', margin.top)
                .attr('x', width + margin.right - 80)
                .attr('y', 0 - margin.top)
                .append('svg:title')
                .text(specvaricon[specindex].description);

            if (showtarget == true) {
                if (formatTest.charAt(formatTest.length - 1) == '%') {
                    var targetText = d3.format('.0%')(targetvalue);
                } else {
                    targetText = targetvalue;
                }
                var targetAch = targeticon[targetindex].description;
            } else {
                var targetText = 'N/A';
                var targetAch = 'N/A';
            }

            if (opt.tablewidth > 0) {
                var defTable = d3.select("#" + id).append("table")
                    .style("width", (opt.tablewidth - 10) + 'px')
                    .style("height", h & 'px')
                    .style("position", 'absolute')
                    .style("top", '5px')
                    .style("right", '5px')
                    .attr("class", 'defList');
                defTable.append("tr").append("th").text('Latest');
                defTable.append("tr").append("td").text(data[data.length - 1].valText);
                defTable.append("tr").append("th").text('Variance Type');
                defTable.append("tr").append("td").text(specvaricon[specindex].description);
                defTable.append("tr").append("th").text('Target');
                defTable.append("tr").append("td").text(targetText);
                defTable.append("tr").append("th").text('Target Achievement');
                defTable.append("tr").append("td").text(targetAch);
            }

        }
        //**********************************************************************************************************************
        //End DrawChart Function

        function tooltipbuilder(d) {
            var output = "<ul>";
            if (d.check == 1) {
                output = output + "<li>run above mean</li>";
            }
            if (d.check == -1) {
                output = output + "<li>run below mean</li>";
            }
            if (d.asctrendcheck == 1) {
                output = output + "<li>asc. trend</li>";
            }
            if (d.desctrendcheck == 1) {
                output = output + "<li>desc. trend</li>";
            }
            if (d.value > d.currUCL) {
                output = output + "<li>above upper ctrl</li>";
            }
            if (d.value < d.currLCL) {
                output = output + "<li>below lower ctl</li>";
            }
            if (d.closetomean == 1) {
                output = output + "<li>run close to mean</li>";
            }
            if (d.nearUCLCheck == 1) {
                output = output + "<li>2/3 close to UCL</li>";
            }
            return output + "</ul>";
        }
        //End tooltipbuilder function

        function meanSumCheck(arr, start, num) {
            var output = 0;
            if (start + num <= arr.length) {
                for (var i = 0; i < num; i++) {
                    output = output + ((arr[start + i].value > arr[start + i].currAvg) ? 1 : -1);
                }
            }
            return output;
        }
        function revMeanSumCheck(arr, start, num) {
            var output = 0;
            if (start - num >= 0) {
                for (var i = 0; i < num; i++) {
                    output = output + ((arr[start - i].value > arr[start - i].currAvg) ? 1 : -1);
                }
            }
            return output;
        }
        function trendSumCheck(arr, start, num) {
            var output = 0;
            if (start + num < arr.length) {
                for (var i = 0; i < num; i++) {
                    var curr = arr[start + i].value;
                    var next = arr[start + i + 1].value;
                    var signal = ((curr <= next) ? 1 : -1);
                    output = output + signal;
                }
            }
            return output;
        }
        function revTrendSumCheck(arr, start, num) {
            var output = 0;
            if (start + num < arr.length) {
                for (var i = 0; i < num; i++) {
                    output = output + ((arr[start - i].value <= arr[start - i - 1].value) ? 1 : -1);
                }
            }
            return output;
        }

        function closeToMean(arr, start, num) {
            var output = 0;
            if (start + num < arr.length) {
                for (var i = 0; i < num; i++) {
                    output = output + ((Math.abs(arr[start + i].value - arr[start + i].currAvg) <= arr[start + i].currSigma) ? 1 : -1);
                }
            }
            return output;

        }
        function nearUCLCheck(arr,start,num)
        {
            var output = 0
            if (start + num < arr.length) {
                for (var i = 0; i < num; i++) {
                    output = output + ((arr[start + i].value  >= 2*arr[start + i].currSigma + arr[start + i].currAvg ) ? 1 : -1);
                }
                if(output>=2){
                    for (var i = 0; i < num; i++) {
                        arr[start + i].nearUCLCheck = 1;
                    }  
                }
            
            }
        }

        

        //from Brian Boden's d3 stacked area
        function dateFromQlikNumber(n) {
            var d = new Date((n - 25569) * 86400 * 1000);
            // since date was created in UTC shift it to the local timezone
            d.setTime(d.getTime() + d.getTimezoneOffset() * 60 * 1000);
            return d;
        }

        function getFields(input, field) {
            var output = [];
            for (var i = 0; i < input.length; ++i)
                output.push(input[i][field]);
            return output;
        }
        function posiCheck(higherbetter, d) {
            if ((d.check == 1 && higherbetter == true) || (d.check == -1 && higherbetter == false) || (d.value > d.currUCL && higherbetter == true) || (d.value < d.currLCL && higherbetter == false)) {
                return "Positive";

            }
            if ((d.check == 1 && higherbetter == false) || (d.check == -1 && higherbetter == true) || (d.value > d.currUCL && higherbetter == false) || (d.value < d.currLCL && higherbetter == true)) {
                return "Negative";

            }
            if ((d.asctrendcheck == 1 && higherbetter == true) || (d.desctrendcheck == 1 && higherbetter == false)) {
                return "Positive";

            }
            if ((d.asctrendcheck == 1 && higherbetter == false) || (d.desctrendcheck == 1 && higherbetter == true)) {
                return "Negative";

            }
            if ((d.check == 1 && higherbetter == 2) || (d.check == -1 && higherbetter == 2) || (d.value > d.currUCL && higherbetter == 2) || (d.value < d.currLCL && higherbetter == 2) || (d.asctrendcheck == 1 && higherbetter == 2) || (d.desctrendcheck == 1 && higherbetter == 2)) {
                return "Purple";

            }

            return "None";

        }

    });
