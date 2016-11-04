// HACKS
(function() {
    Date.prototype.toYMD = Date_toYMD;
    function Date_toYMD() {
        var year, month, day;
        year = String(this.getFullYear());
        month = String(this.getMonth() + 1);
        if (month.length == 1) {
            month = "0" + month;
        }
        day = String(this.getDate());
        if (day.length == 1) {
            day = "0" + day;
        }
        return year + "-" + month + "-" + day;
    }

    Date.createFromMysql = function (mysql_string) {
        var t, result = null;

        if (typeof mysql_string === 'string') {
            t = mysql_string.split(/[- T:]/);

            //when t[3], t[4] and t[5] are missing they defaults to zero
            result = new Date(t[0], t[1] - 1, t[2], t[3] || 0, t[4] || 0, t[5] || 0);
        }

        return result;
    }
})();


function dateDiff(d1, d2) {
    //in days, d1 must be before d2, month = 30 days, year = 365 days
    minusOne = false
    if (d2[2] - d1[2] >= 0) {
        daysDiff = d2[2] - d1[2];
        minusOne = false;
    }
    else {
        daysDiff = 30 - d1[2] - (-d2[2]);
        minusOne = true;
    }
    if (d2[1] - d1[1] >= 0) {
        monthsDiff = d2[1] - d1[1];
        if (minusOne) monthsDiff -= 1;
        minusOne = false;
    }
    else {
        monthsDiff = 12 - d1[1] - (-d2[1]);
        if (minusOne) monthsDiff -= 1;
        minusOne = true;
    }
    yearsDiff = d2[0] - d1[0];
    if (minusOne) yearsDiff -= 1;
    diff = 365 * yearsDiff - (-30 * monthsDiff - daysDiff);
    if (diff < 0) {
        console.log("ERROR date diff not supposed to be < 0.");
    }
    return diff;
}


/**
 * Object with Node/Sensor configuration.
 */
function SystemNodes() {
    this.sensorTable = [];
    
    var sn = this;
    
    this.init = function(callback) {        
        $.ajax({
            url: '/api/get-nodes',
            success: this.loadedNodes,            
			error: function (x, y, z) {alert(y);},
            complete: callback
        });
    }
    
    this.loadedNodes = function(data) {
        data = JSON.parse(data);
        // make inverse sensor table
        $.each(data, function(did, node) {
            $.each(node["Sensors"], function(sid, sensor) {
                var sensorData = {};
                sensorData = sensor;
                sensorData["UoM"] = sensorData["UoM"].replace("deg+C", "&deg;C");
                sn.sensorTable[sensor.Name] = sensorData;
            });
        })
    }
}


/**
 * Predefined visualization object; visualizes predefined timeseries or numeric data
 */

/**
 * Predefined visualization object; visualizes predefined timeseries or numeric data
 */

function PredefinedVisualization(systemNodes) {
    this.config;
    this.chartNumber = 0;
    this.infoBoxNumber = 0;
    this.profileNumber = 0;
    this.charts = [];
    this.infoBoxes = [];
    this.profiles = [];
    this.systemNodes = systemNodes;
    
    var pv = this;
    
    /**
     * Add new chart
     *
     * @param columnid {string} HTML id of the column, where we are adding the chart to.
     * @param chartTitle {string} HTML DIV id for the container of the highchart
     */
    this.addNewChart = function(columnid, chartTitle) {   
    
        this.chartNumber = this.charts.length + 1;
        $("#" + columnid).append(            
            '<div class="panel panel-inverse"> ' +
                '<div class="panel-heading ui-sortable"> ' +
                    '<div class="panel-heading-btn"> ' +
                        '<a href="javascript:;" class="btn btn-xs btn-icon btn-circle btn-default" data-click="panel-expand"> <i class="fa fa-expand"> </i></a> ' +
                        '<a href="javascript:;" class="btn btn-xs btn-icon btn-circle btn-success" data-click="panel-reload"> <i class="fa fa-repeat"> </i> </a> ' +
                        '<a href="javascript:;" class="btn btn-xs btn-icon btn-circle btn-warning" data-click="panel-collapse"> <i class="fa fa-minus"> </i> </a> ' +
                        '<!-- ??? Catch remove and update counter/chart list. -->' +
                        '<a href="javascript:;" class="btn btn-xs btn-icon btn-circle btn-danger" data-click="panel-remove"><i class="fa fa-times"></i></a> ' +
                    '</div> ' +
                    '<h4 class="panel-title" id="loadingChart"' + this.chartNumber + ' class=>' + chartTitle + '</h4>' +
                '</div> ' +
                '<div class="panel-body"> ' +
                    '<form class="form-horizontal form-bordered"> ' +
                        '<div id="container'+ this.chartNumber + '" class="panel-body chart-container"> </div> ' +
                    '</form> ' +
                '</div> ' +                
            '</div>'
        );
        
        $('#ucontainer' + this.chartNumber).trigger('create');
        this.charts[this.chartNumber - 1] = new HighChart("container" + this.chartNumber, this.chartNumber, this.systemNodes);
        // $('#ucontainer' + this.chartNumber).render();
    };
    
    /**
     * Add new profile
     *
     * @param columnid {string} HTML id of the column, where we are adding the chart to.
     * @param chartTitle {string} HTML DIV id for the container of the highchart
     */
    this.addNewProfile = function(columnid, profileTitle, profileConfig) {   
    
        this.profileNumber = this.profiles.length + 1;
        $("#" + columnid).append(            
            '<div class="panel panel-inverse"> ' +
                '<div class="panel-heading ui-sortable"> ' +
                    '<div class="panel-heading-btn"> ' +
                        '<a href="javascript:;" class="btn btn-xs btn-icon btn-circle btn-default" data-click="panel-expand"> <i class="fa fa-expand"> </i></a> ' +
                        '<a href="javascript:;" class="btn btn-xs btn-icon btn-circle btn-success" data-click="panel-reload"> <i class="fa fa-repeat"> </i> </a> ' +
                        '<a href="javascript:;" class="btn btn-xs btn-icon btn-circle btn-warning" data-click="panel-collapse"> <i class="fa fa-minus"> </i> </a> ' +
                        '<!-- ??? Catch remove and update counter/chart list. -->' +
                        '<a href="javascript:;" class="btn btn-xs btn-icon btn-circle btn-danger" data-click="panel-remove"><i class="fa fa-times"></i></a> ' +
                    '</div> ' +
                    '<h4 class="panel-title" id="loadingChart"' + this.profileNumber + ' class=>' + profileTitle + '</h4>' +
                '</div> ' +
                '<div class="panel-body"> ' +
                    '<form class="form-horizontal form-bordered"> ' +
                        '<div id="pcontainer'+ this.profileNumber + '" class="panel-body chart-container"> </div> ' +
                    '</form> ' +
                '</div> ' +                
            '</div>'
        );
        
        $('#ucontainer' + this.profileNumber).trigger('create');
        this.profiles[this.profileNumber - 1] = new Profile("pcontainer" + this.profileNumber, this.systemNodes, profileConfig);
        // $('#ucontainer' + this.chartNumber).render();
    };
    
    this.addNewInfobox = function(columnid, title, color, icon, value, status, link, infoBoxConfig) {
        this.infoBoxNumber = this.infoBoxes.length + 1;        
        
        if (infoBoxConfig.style == "small") {
            
            $("#" +  columnid).append(
                '<div class="widget widget-stats widget-stats-small bg-' + color + '" id="widget-' + this.infoBoxNumber + '">' +                    
                    '<div class="stats-info">' +
                        '<h4>' + title + '</h4>' +                        
                        '<div class="stats-link">' +
                            '<a href="' +  link + '">' + status + "</a>" +
                            '<span class="percentage"></span>' +
                        '</div>' +
                        '<p>' + value + '</p>' +                    
                    '</div>' +
                '</div>'
            );
        } else {        
            $("#" +  columnid).append(
                '<div class="widget widget-stats bg-' + color + '" id="widget-' + this.infoBoxNumber + '">' +
                    '<div class="stats-icon"><i class="' + icon + '"></i></div>' +
                    '<div class="stats-info">' +
                        '<h4>' + title + '</h4>' +
                        '<p>' + value + '</p>' +
                        '<span class="percentage"></span>' +
                    '</div>' +
                    '<div class="stats-link">' +
                        '<a href="' +  link + '">' + status + "</a>" +
                    '</div>' +
                '</div>'
            );
        };
        
        this.infoBoxes[this.infoBoxNumber - 1] = new InfoBox("widget-" + this.infoBoxNumber, this.systemNodes, infoBoxConfig);
    };
    
    /**
     * Initialize predefined visualization widgets
     *
     * @param config {model:predefined~Config} Configuration data for the predefined visualization page
     */
    this.init = function(config) {
        this.config = config;        
        console.log("Config"); console.log(this.config);
        
        // traverse config structure, create rows, columns, charts and load the data to the appropriate chart
        $.each(this.config, function(rid, row) {
            // create row
            $("#content").append('<div class="row" id="row-' + rid + '"></div>');            
            
            // traverse over columns
            $.each(row["columns"], function (cid, col) {
                // create column
                $("#row-" + rid).append('<div class="' + col["class"] + '" id="col-' + rid + '-' + cid + '"></div>');
                
                // traverse over charts
                if (col["charts"]) {
                    $.each(col["charts"], function(chid, chart) {
                        // create chart
                        pv.addNewChart("col-" + rid + "-" + cid, chart["title"]);
                        // set chart dates                        
                        if (chart["endDate"] == "now") //var endDate = new Date();
                            var endDate = new Date(2016, 7, 17);                        
                        else if (chart["endDate"] == "last") /* TODO */;
                        else {
                            var endDate = Date.createFromMysql(chart["endDate"]);
                        }
                        // correct date for QMiner limits
                        endDate.setDate(endDate.getDate() +  1);
                        var startDate = new Date(endDate.getTime());
                        startDate.setDate(endDate.getDate() - chart["timeSpan"]);                    

                        // load time series
                        $.each(chart["series"], function(seriesid, series) {
                            console.log(series);
                            var lineConf = null;
                            if (series.line != "") lineConf = series.line;                            
                            pv.charts[pv.chartNumber - 1].addSeries(series["sensorId"], startDate.toYMD(), endDate.toYMD(), series["aggregate"], series["window"], lineConf);
                        });
                    });
                }
                // traverse profiles
                if (col["profiles"]) {
                    $.each(col["profiles"], function(prid, profile) {
                        pv.addNewProfile("col-" + rid + "-" + cid, profile["title"], profile);
                        // set histogram dates
                        if (profile["endDate"] == "now") // var endDate = new Date();
                            var endDate = new Date(2016, 7, 17);
                        else if (profile["endDate"] == "last") /* TODO */;
                        else if (profile["endDate"] == "offset") {
                            // now
                            var endDate = new Date();
                            // add/substract
                            switch (profile["endDateOffsetType"]) {
                                case "year":
                                    endDate.setFullYear(endDate.getFullYear() + profile["endDateOffset"]);
                                    break;
                                case "month":
                                    endDate.setMonth(endDate.getMonth() + profile["endDateOffset"]);
                                    break;
                                case "day":
                                    endDate.setDate(endDate.getDate() + profile["endDateOffset"]);
                                    break;                                                                
                            }
                        }
                        else {
                            var endDate = Date.createFromMysql(profile["endDate"]);
                        };
                        
                                            
                        // correct date for QMiner limits
                        endDate.setDate(endDate.getDate() +  1);
                        var startDate = new Date(endDate.getTime());
                        startDate.setDate(endDate.getDate() - profile["timeSpan"]); 
                        
                        
                        // load time series
                        $.each(profile["series"], function(seriesid, series) {
                            console.log(series);
                            pv.profiles[pv.profileNumber - 1].addSeries(series["sensorId"], startDate.toYMD(), endDate.toYMD(), series["aggregate"], series["window"]);
                        });
                    });
                }
                // traverse over infoboxes
                else if (col["infoboxes"]) {
                    $.each(col["infoboxes"], function (iid, infobox) {
                        title = infobox["title"];
                        color = infobox["color"];
                        icon = infobox["icon"];                        
                        status = infobox["status"].value;                        
                        link = infobox["status"].link;
                        value = "N/A";
                                                
                        
                        // can value be determined directly?
                        if (infobox["value"]["type"] == "lastValue") {
                            value = pv.systemNodes.sensorTable[infobox["value"]["sensorId"]]["Val"] + " " +
                                    pv.systemNodes.sensorTable[infobox["value"]["sensorId"]]["UoM"];
                            // adding new infoBox
                            pv.addNewInfobox("col-" + rid + "-" + cid, title, color, icon, value, status, link, infobox);
                        } 
                        // else we will need to load additional data
                        else { 
                            // adding new infoBox
                            pv.addNewInfobox("col-" + rid + "-" + cid, title, color, icon, value, status, link, infobox);
                            
                            if (infobox["value"]["endDate"] == "now") // var endDate = new Date();
                                var endDate = new Date(2016, 7, 17);
                            // correct date for QMiner limits
                            endDate.setDate(endDate.getDate() + 1);
                            // var startDate = new Date();
                            var startDate = new Date(2016, 7, 17);
                            startDate.setDate(endDate.getDate() - infobox["value"]["timeSpan"]);      
                            
                            $.each(infobox["value"]["series"], function(isid, series) {                                
                                pv.infoBoxes[pv.infoBoxNumber - 1].addSeries(series["sensorId"], startDate.toYMD(), endDate.toYMD(), series["aggregate"], series["window"]);    
                            });                            
                        }                                                
                    });
                };
            });
        });        
    };        
};


/**
 * Profile object - graph and data management
 */

function Profile(containerId, systemNodes, profileConfig) {
    this.systemNodes = systemNodes;
    this.config = profileConfig;
    this.series = [];
    this.seriesN = [];
    this.containerId = containerId;
    
    pf = this;
    
    console.log("\n\n\n");
    console.log(profileConfig);
    console.log("\n\n\n");
    
    /**
     * Starting new series load for infobox
     */
    this.addSeries = function (dataType, dateStart, dateEnd, aggregateType, timeInterval) {
        // collecting data        
        this.dataType = dataType;
        this.dateStart = dateStart;
        this.dateEnd = dateEnd;
        this.aggregateType = aggregateType;
        this.timeInterval = timeInterval;     
        
        // setting object
        var ib = this;
        
        
        if (this.timeInterval == "raw") {            
            this.raw = "Yes";
        } else {            
            this.raw = "No";
        }
        
        var myUrl;
		
		if (this.aggregateType == "prediction") {
			/*
            if (typeof this[this.dataType] == 'undefined') {
				alert("Prediction not available for this sensor.");
			}
			else {
				myUrl = "/proxy.php?cmd=/AggregateService/services/prediction-api/get-predictions?p=" + this.dataType + ":" + this[this.dataType] + ":"+ this.dateStart + ":" + this.dateEnd;
			}
            */
            myUrl = "/api/get-predictions?p=" + this.dataType + ":ma:"+ this.dateStart + ":" + this.dateEnd;
		}
        else if (this.raw == "No") {
            myUrl = '/api/get-aggregates?p=' + escape(this.dataType) + ':' + this.aggregateType + ':' + this.timeInterval + ':' + this.dateStart + ':' + this.dateEnd;
        }
        else if (this.raw == "Yes") {
            myUrl = '/api/get-measurements?p=' + escape(this.dataType) + ':' + this.dateStart + ':' + this.dateEnd;			
        }
        else {
            console.log("ERROR in checking equality!")
        }
		console.log(myUrl);
        // making a copy of this object, so that we preserve data within multiple async calls
        var contextThis = jQuery.extend({}, this);
        console.log(contextThis);
        $.ajax({
            url: myUrl,
            success: ib.loadedSeries,
            context: contextThis,
			error: function (x, y, z) {console.log(y);}
        });
    };
    
    /**
     * Starting new series load for infobox
     */
    this.loadedSeries = function(data) {
        data = JSON.parse(data);
        this.series[this.series.length] = data;
        
        // TODO: vrstni red seriesov je pomemben - včasih se prej naloada drugi, kakor prvi (!)                
        // find out series #
        for (var i = 0; i < this.config.series.length; i++) {
            if (this.config.series[i].sensorId == this.dataType) 
                this.seriesN[this.series.length - 1] = i;
        }
        
        // is all the data loaded?
        if (this.series.length == this.config.series.length) {
            // sort out order
            // primary = value
            // secondary = mapping
            
            // secondary seriesN = 0, primary seriesN = 1
            // default
            var secondaryN = 1;                    
            var primaryN = 0; // index in primary timeseries

            // reverse load
            if (this.seriesN[0] == 1) {
                secondaryN = 0;
                primaryN = 1;
            }
            
            var primary = this.series[primaryN];
            var secondary = this.series[secondaryN];
            
            var seriesHC = [];
            
            $.each(this.config.secValues, function (sid, secValObj) {
                
                var secValue = secValObj.value;

                // daily profile
                var buckets = new Array(24).fill(0);
                var bucketN = new Array(24).fill(0);
                var secN = 0;

                $.each(primary, function(mid, point) {
                    // sync primary and secondary
                    while ((secN < secondary.length -  1) && (secondary[secN].Timestamp < point.Timestamp)) {
                        secN++;
                    }

                    if ((secN < secondary.length) && (secondary[secN].Val == secValue)) {                    
                        if (secondary[secN].Timestamp == point.Timestamp) {
                            var nowDate = new Date();
                            nowDate = Date.createFromMysql(point.Timestamp);                                        
                            var bN = nowDate.getHours();

                            buckets[bN] += point.Val;
                            bucketN[bN] += 1;                    
                        } 
                    }
                });
           
                // calculate profile
                for (var i = 0; i < 24; i++) buckets[i] = buckets[i] / bucketN[i];

                console.log(buckets);

                    seriesHC.push({ name: secValObj.name, data: buckets});
                });
            
           
            
            $('#' + pf.containerId).highcharts({
                chart: {
                    type: 'column'
                },
                title: {
                    text: ''
                },
                xAxis: {
                    categories: [0, 1]
                },
                credits: {
                    enabled: false
                },
                series: seriesHC
            });

            
        }
    }
}

/**
 * Infobox object - value 
 */
function InfoBox(containerId, systemNodes, infoBoxConfig) {
    this.systemNodes = systemNodes;
    this.config = infoBoxConfig;
    this.series = [];
    this.seriesN = [];
    this.containerId = containerId;
    
    ib = this;
    
    /**
     * Transforming value according to the config
     */
    this.transform = function(value, unit, config) {
        /*
         * config parameters
         *   formula - formula for transformation (value = x)
         *   UoM - string for overriding unit value
         *   decimals - number of decimal places (usitn toFixed(decimals))
         */
        
        console.log(config);
        
        // transform value
        if (config["formula"]) {
            var formula = config["formula"];
            formula = formula.replace("x", value);
            value = eval(formula);
        }
        
        // round value
        if (config["decimals"]) {
            var n = config["decimals"];
            value = value.toFixed(n);
        }
        
        // make correct unit of measurement
        if (config["uom"]) unit = config["uom"];
        
        // return results
        return value + " " + unit;        
    }
    
    /**
     * Starting new series load for infobox
     */
    this.addSeries = function (dataType, dateStart, dateEnd, aggregateType, timeInterval) {
        // collecting data        
        this.dataType = dataType;
        this.dateStart = dateStart;
        this.dateEnd = dateEnd;
        this.aggregateType = aggregateType;
        this.timeInterval = timeInterval;     
        
        // setting object
        var ib = this;
        
        
        if (this.timeInterval == "raw") {            
            this.raw = "Yes";
        } else {            
            this.raw = "No";
        }
        
        var myUrl;
		
		if (this.aggregateType == "prediction") {
			/*
            if (typeof this[this.dataType] == 'undefined') {
				alert("Prediction not available for this sensor.");
			}
			else {
				myUrl = "/proxy.php?cmd=/AggregateService/services/prediction-api/get-predictions?p=" + this.dataType + ":" + this[this.dataType] + ":"+ this.dateStart + ":" + this.dateEnd;
			}
            */
            myUrl = "/api/get-predictions?p=" + this.dataType + ":ma:"+ this.dateStart + ":" + this.dateEnd;
		}
        else if (this.raw == "No") {
            myUrl = '/api/get-aggregates?p=' + escape(this.dataType) + ':' + this.aggregateType + ':' + this.timeInterval + ':' + this.dateStart + ':' + this.dateEnd;
        }
        else if (this.raw == "Yes") {
            myUrl = '/api/get-measurements?p=' + escape(this.dataType) + ':' + this.dateStart + ':' + this.dateEnd;			
        }
        else {
            console.log("ERROR in checking equality!")
        }
		console.log(myUrl);
        // making a copy of this object, so that we preserve data within multiple async calls
        var contextThis = jQuery.extend({}, this);
        console.log(contextThis);
        $.ajax({
            url: myUrl,
            success: ib.loadedSeries,
            context: contextThis,
			error: function (x, y, z) {console.log(y);}
        });
    };
    
    /**
     * Starting new series load for infobox
     */
    this.loadedSeries = function(data) {
        data = JSON.parse(data);
        this.series[this.series.length] = data;
        
        // TODO: vrstni red seriesov je pomemben - včasih se prej naloada drugi, kakor prvi (!)                
        // find out series #
        for (var i = 0; i < this.config.value.series.length; i++) {
            if (this.config.value.series[i].sensorId == this.dataType) 
                this.seriesN[this.series.length - 1] = i;
        }
        
        // is all the data loaded?
        if (this.series.length == this.config.value.series.length) {
            switch (this.config.value.type) {
                case "metricsAbsolute":
                    // set indexes of primary and secondary timeseries
                    // secondary seriesN = 0, primary seriesN = 1
                    // default
                    var secondaryN = 0;                    
                    var primaryN = 1; // index in primary timeseries
                    
                    // reverse load
                    if (this.seriesN[0] == 1) {
                        secondaryN = 1;
                        primaryN = 0;
                    }
                    
                    var secondary = this.series[secondaryN];
                    
                    console.log(this.series);
                    
                    // primary series must be prediction, secondary series is measurements
                    secN = 0;
                    N = 0;
                    sum = 0;
                    sum2 = 0;
                    realSum = 0;
                    
                    $.each(this.series[primaryN], function(mid, point) {                        
                        while ((secondary[secN].Timestamp < point.Timestamp) && (secN < secondary.length -  1)) {
                            secN++;
                        }
                        
                        if (secondary[secN].Timestamp == point.Timestamp) {
                            N++;
                            sum += Math.abs(point.Val - secondary[secN].Val);
                            realSum += Math.abs(point.Val);
                            sum2 += (point.Val - secondary[secN].Val) * (point.Val - secondary[secN].Val);
                        }                                                
                    })
                    
                    var mae = sum/N;
                    var rmse = Math.sqrt(sum2/N);
                    var mapez = (sum/N) / (realSum/N);
                                        
                    maeOK = this.transform(mae, this.systemNodes.sensorTable[this.config["value"]["series"][0]["sensorId"]]["UoM"], this.config.value );
                    rmseOK = this.transform(rmse, this.systemNodes.sensorTable[this.config["value"]["series"][0]["sensorId"]]["UoM"], this.config.value );
                    mapezOK = this.transform(mapez, this.systemNodes.sensorTable[this.config["value"]["series"][0]["sensorId"]]["UoM"], this.config.value );
                                        
                    $("#" + containerId + " > .stats-info p").html(maeOK + " / " + rmseOK /* + " / " + mapezOK */);
                    
                    break;
                case "metricsRelative":
                    // set indexes of primary and secondary timeseries
                    // secondary seriesN = 0, primary seriesN = 1
                    // default
                    var secondaryN = 0;                    
                    var primaryN = 1; // index in primary timeseries
                    
                    // reverse load
                    if (this.seriesN[0] == 1) {
                        secondaryN = 1;
                        primaryN = 0;
                    }
                    
                    var secondary = this.series[secondaryN];
                    
                    console.log(this.series);
                    
                    // primary series must be prediction, secondary series is measurements
                    secN = 0;
                    N = 0;
                    sum = 0;    
                    
                    // R2
                    sst = 0;
                    sse = 0;
                    mean = 0;
                    sumTrue = 0;
                    sumTrue2 = 0;
                    
                    $.each(this.series[primaryN], function(mid, point) {                        
                        while ((secondary[secN].Timestamp < point.Timestamp) && (secN < secondary.length -  1)) {
                            secN++;
                        }
                        
                        if (secondary[secN].Timestamp == point.Timestamp) {
                            N++;
                            sum += Math.abs((point.Val - secondary[secN].Val) / point.Val);                            
                            
                            // R2 metrics
                            sumTrue += point.Val;
                            sumTrue2 += point.Val * point.Val;
                            mean = sumTrue/N;
                            
                            sse += (point.Val - secondary[secN].Val) * (point.Val - secondary[secN].Val);
                            sst = sumTrue2 - N * mean * mean;                            
                        }                                                
                    })
                    
                    var mape = sum/N;                    
                    if (sst == 0.0) {
                        if (sse == 0) r2 = 1.0;
                        else r2 = 0.0;
                    } else {
                        r2 = 1 - sse/sst;
                    }
                                        
                    mapeOK = this.transform(mape, this.systemNodes.sensorTable[this.config["value"]["series"][0]["sensorId"]]["UoM"], this.config.value );
                    r2OK = this.transform(r2, this.systemNodes.sensorTable[this.config["value"]["series"][0]["sensorId"]]["UoM"], this.config.value );
                    
                                        
                    $("#" + containerId + " > .stats-info p").html(mapeOK + " / " + r2OK);
                    
                    break;
                case "tsValue":
                    // default is now
                    var ts = new Date();
                    var bestValue = 0;
                    var bestDist = Infinity;
                    
                    // simple linear search for best match
                    $.each(this.series[0], function(sid, point) {
                        pTs = new Date(point.Timestamp);
                        var dist = Math.abs((pTs - ts)/1000/60/60);
                        if (dist < bestDist) {
                            bestDist = dist;
                            bestValue = point.Val;
                        }
                    });
                    
                    bestValue = this.transform(bestValue, this.systemNodes.sensorTable[this.config["value"]["series"][0]["sensorId"]]["UoM"], this.config.value )
                                        
                    $("#" + containerId + " > .stats-info p").html(bestValue);
                    break;
                case "sumMembers":
                    this.hookSum(containerId);
                    break;
                case "sumMembersPercent":
                    this.hookPercent(containerId, this.config.value.denominator);
                    this.hookSum(containerId);                    
                    break;
                case "cumulativeThreshold":                    
                    var pTsOld = 0;
                    var threshold = this.config.value.threshold;                    
                    var cumulative = 0.0;
                                                            
                    // follow master series
                    $.each(this.series[0], function(sid, point) {
                        pTs = new Date(point.Timestamp);
                        if (pTsOld != 0) {                            
                            var interval = (pTs - pTsOld) / 1000 / 60 / 60;
                            var value = point.Val;
                            
                            if (value > threshold) {
                                cumulative += interval * value;                                                        
                            }
                        }
                        pTsOld = pTs;
                    });
                    ctValue = this.transform(cumulative, this.systemNodes.sensorTable[this.config["value"]["series"][0]["sensorId"]]["UoM"], this.config.value);
                    $("#" + containerId + " > .stats-info p").html(ctValue);
                    
                    // manage status
                    if (this.config.status.value == "") {
                        statusValue = this.transform(cumulative, "", this.config.status);
                        $("#" + containerId + " .stats-link a").html(statusValue);
                    }                   
                    break;
                case "cumulativeThresholdSec":                    
                    var pTsOld = 0;
                    var threshold = this.config.value.threshold;                    
                    var cumulative = 0.0;
                    
                    var secondaryIndex = 0; // index in secondary timeseries
                    
                    // set indexes of primary and secondary timeseries
                    // secondary seriesN = 0, primary seriesN = 1
                    // default
                    var secondaryN = 0;                    
                    var primaryN = 1; // index in primary timeseries
                    
                    // reverse load
                    if (this.seriesN[0] == 1) {
                        secondaryN = 1;
                        primaryN = 0;
                    }
                    
                    // secondary series
                    var secondary = this.series[secondaryN];
                    // follow master series
                    $.each(this.series[primaryN], function(sid, point) {
                        pTs = new Date(point.Timestamp);
                        if (pTsOld != 0) {
                            var interval = (pTs - pTsOld) / 1000 / 60 / 60;
                            var value = point.Val;
                            
                            if (value > threshold) {
                                // threshold is on (ie. lights are on), let's check secondary value (ie. presence)
                                // traverse secondary timeseries until timestamp >= of the current, then use the point
                                // closest to current timestamp
                                while ((secondaryIndex < (secondary.length - 1)) && (new Date(secondary[secondaryIndex].Timestamp) < pTs)) {
                                    secondaryIndex++;
                                }
                                var date1 = new Date(secondary[secondaryIndex].Timestamp);
                                if (secondaryIndex > 0 ) var date2 = new Date(secondary[secondaryIndex - 1].Timestamp);
                                    else var date2 = date1;
                                
                                if (Math.abs(date1 - pTs) < Math.abs(date2 - pTs)) theIndex = secondaryIndex; else theIndex = secondaryIndex - 1;
                                if (theIndex < 0) theIndex = 0;
                                
                                if (secondary[theIndex].Val == 0) cumulative += interval * value;                                                        
                            }
                        }
                        pTsOld = pTs;
                    });
                    ctValue = this.transform(cumulative, this.systemNodes.sensorTable[this.config["value"]["series"][0]["sensorId"]]["UoM"], this.config.value);
                    $("#" + containerId + " > .stats-info p").html(ctValue);
                    
                    // manage status
                    if (this.config.status.value == "") {
                        statusValue = this.transform(cumulative, "", this.config.status);
                        $("#" + containerId + " .stats-link a").html(statusValue);
                    }                   
                    break;
                case "cumulativeThresholdOther":                    
                    var pTsOld = 0;
                    var threshold = this.config.value.threshold;
                    var mapValue = this.config.value.value; 
                    var cumulative = 0.0;
                    $.each(this.series[0], function(sid, point) {
                        pTs = new Date(point.Timestamp);
                        if (pTsOld != 0) {
                            var interval = (pTs - pTsOld) / 1000 / 60 / 60;
                            var value = point.Val;
                            
                            if (value > threshold) cumulative += interval * mapValue;                                                        
                        }
                        pTsOld = pTs;
                    });
                    ctValue = this.transform(cumulative, this.systemNodes.sensorTable[this.config["value"]["series"][0]["sensorId"]]["UoM"], this.config.value);
                    $("#" + containerId + " > .stats-info p").html(ctValue);
                    
                    // manage status
                    if (this.config.status.value == "") {
                        statusValue = this.transform(cumulative, "", this.config.status);
                        $("#" + containerId + " .stats-link a").html(statusValue);
                    }                    
                    break;
                case "cumulativeThresholdOtherSec":                    
                    var pTsOld = 0;
                    var threshold = this.config.value.threshold;
                    var mapValue = this.config.value.value; 
                    var cumulative = 0.0;
                    var secondaryIndex = 0; // index in secondary timeseries
                    
                    // set indexes of primary and secondary timeseries
                    // secondary seriesN = 0, primary seriesN = 1
                    // default
                    var secondaryN = 0;                    
                    var primaryN = 1; // index in primary timeseries
                    
                    // reverse load
                    if (this.seriesN[0] == 1) {
                        secondaryN = 1;
                        primaryN = 0;
                    }
                    
                    // secondary series
                    var secondary = this.series[secondaryN];
                    // follow master series
                    $.each(this.series[primaryN], function(sid, point) {
                        pTs = new Date(point.Timestamp);
                        if (pTsOld != 0) {
                            var interval = (pTs - pTsOld) / 1000 / 60 / 60;
                            var value = point.Val;
                            
                            if (value > threshold) {
                                // threshold is on (ie. lights are on), let's check secondary value (ie. presence)
                                // traverse secondary timeseries until timestamp >= of the current, then use the point
                                // closest to current timestamp
                                while ((secondaryIndex < (secondary.length - 1)) && (new Date(secondary[secondaryIndex].Timestamp) < pTs)) {
                                    secondaryIndex++;
                                }
                                var date1 = new Date(secondary[secondaryIndex].Timestamp);
                                if (secondaryIndex > 0 ) var date2 = new Date(secondary[secondaryIndex - 1].Timestamp);
                                    else var date2 = date1;
                                
                                if (Math.abs(date1 - pTs) < Math.abs(date2 - pTs)) theIndex = secondaryIndex; else theIndex = secondaryIndex - 1;
                                if (theIndex < 0) theIndex = 0;
                                
                                if (secondary[theIndex].Val == 0) cumulative += interval * mapValue;                                                        
                            }
                        }
                        pTsOld = pTs;
                    });
                    ctValue = this.transform(cumulative, this.systemNodes.sensorTable[this.config["value"]["series"][0]["sensorId"]]["UoM"], this.config.value);
                    $("#" + containerId + " > .stats-info p").html(ctValue);
                    
                    // manage status
                    if (this.config.status.value == "") {
                        statusValue = this.transform(cumulative, "", this.config.status);
                        $("#" + containerId + " .stats-link a").html(statusValue);
                    }                    
                    break;
                default: console.log("No method for extracting infobox value!");
            }
            
        };
    }
    
    
    
    this.hookSum = function(cId) {        
        var _this = this;
        setTimeout(function() { _this.computeSum(); }, 200);
        console.log("SUM TIMEOUT: " + cId);
    }
    
    this.computeSum = function() {        
        // console.log("YES: " + containerId);
        var sum = 0;
        $("#" + containerId).parent().find(".widget-stats-small").each(function () {            
            var valText = $(this).find("p")[0].innerHTML;
            var val = parseFloat(valText);
            sum += val;
        });
        
        sumValue = this.transform(sum, this.systemNodes.sensorTable[this.config["value"]["series"][0]["sensorId"]]["UoM"], this.config.value);
        
        $("#" + containerId + " > .stats-info p").html(sumValue);
                    
        // manage status
        if (this.config.status.value == "") {
            statusValue = this.transform(sum, "", this.config.status);
            $("#" + containerId + " .stats-link a").html(statusValue);
        }         
        
        // manage pecentages
        $("#" + containerId).parent().find(".widget-stats-small").each(function () {            
            var valText = $(this).find("p")[0].innerHTML;
            var val = parseFloat(valText);
            var percentage = Math.round(val / sum * 10000) / 100 + "%";
            $(this).find(".stats-link .percentage")[0].innerHTML = percentage;
        });
        
        // setTimeout(this.computeSum(cId), 1000);
        var _this = this;
        setTimeout(function() { _this.computeSum(); }, 1000);
    }
    
  
    this.hookPercent = function(cId, denominator) {
        this.denominator = denominator;
        var _thisP = this;
        setTimeout(function() { _thisP.computePercent(denominator); }, 200);  
        console.log("PERCENT TIMEOUT: " + cId);
    }
    
    this.computePercent = function(denominator) {                
        var _this = this;
        var dValue = parseFloat($(denominator).html());
        var myValue = parseFloat($("#" + containerId + " > .stats-info p").html());
        
        var percent = Math.round(myValue/dValue * 10000)/100;
        $("#" + containerId + " > .stats-info > .percentage").html("(" + percent + "%)")
        
        setTimeout(function() { _this.computePercent(denominator); }, 1000);
    }
        
  
    
    
}

/**
 * Highchart object - graph and data management
 */
function HighChart(container, chartNumber, systemNodes) {
    //chart class, draws charts
    this.data = [];
    this.timeInterval;
    this.dateStart;
    this.dateEnd;
    this.aggregateType;
    this.dataType;
    this.raw;    
    this.chartNumber = chartNumber;
    this.systemNodes = systemNodes;        

    this.newChart = function(container) {
        //inits an empty highchart
        return new Highcharts.Chart({
            chart: {
                zoomType: 'x',
                renderTo: container,
                height: '500'
            },
            title: {
                text: ''
            },
            subtitle: {
                text: document.ontouchstart === undefined ?
                        'Click and drag in the plot area to zoom in' :
                        'Pinch the chart to zoom in'
            },
            xAxis: {
                type: 'datetime',
            },
            legend: {
                enabled: true
            },
            plotOptions: {
                area: {
                    fillColor: {
                        linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
                        stops: [
                            [0, Highcharts.getOptions().colors[0]],
                            [1, Highcharts.Color(Highcharts.getOptions().colors[0]).setOpacity(0).get('rgba')]
                        ]
                    },
                    marker: {
                        radius: 2
                    },
                    lineWidth: 1,
                    states: {
                        hover: {
                            lineWidth: 1
                        }
                    },
                    threshold: null
                }
            },
        });
    }
    
    this.chart = this.newChart(container);
    this.chart.yAxis[0].remove();
    
    this.deleteLastSeries = function () {
        $('#loadingChart' + this.chartNumber).text('Removing last added series ...');
        var titl;
        var titl1;
        //removing series
        if (this.chart.series.length > 0) {
            titl = this.chart.series[this.chart.series.length - 1].options.yAxis;
            titl1 = this.chart.series[this.chart.series.length - 1].options.name;
            this.chart.series[this.chart.series.length - 1].remove();
            console.log("Removed last added series: "+titl1+".");
        }
        else {
            console.log("No series left to remove.");
            alert("ERROR no series left to remove.");
        }
        //removing y axis if no longer needed
        found = false;
        counter = 0;
        while (!found && counter < this.chart.series.length) {
            if (this.chart.series[counter].options.yAxis == titl) {
                found = true;
            }
            counter++;
        }
        if (!found) {
            console.log("Removing unnecessary y axis: "+titl+".");
            found = false;
            counter = 1;
            while (!found && counter < this.chart.yAxis.length) {
                if (this.chart.options.yAxis[counter].id == titl) {
                    found = true;
                    this.chart.yAxis[counter].remove()
                }
                counter++;
            }
        }
        if (this.chart.series.length == 0 && this.chart.yAxis.length != 0) {
            this.chart.yAxis[0].remove();
        }
        $('#loadingChart' + this.chartNumber).text('Rendering chart ...');
        this.chart.redraw();
        $('#loadingChart' + this.chartNumber).text('Chart');
    };
    
    
    this.addSeries = function (dataType, dateStart, dateEnd, aggregateType, timeInterval) {
        // collecting data from form
        $('#loadingChart' + this.chartNumber).text('Adding new series ...');
        this.dataType = dataType;
        this.dateStart = dateStart;
        this.dateEnd = dateEnd;
        this.aggregateType = aggregateType;
        this.timeInterval = timeInterval;        
        
        if (this.timeInterval == "raw") {
            if (dateDiff(this.dateStart.split("-"), this.dateEnd.split("-")) > 500) {
                alert("Too much data. Please select a smaller interval.");
                return;
            }
            this.raw = "Yes";
        }
        else {
            if (this.timeInterval == "1h") {
                if (dateDiff(this.dateStart.split("-"), this.dateEnd.split("-")) > 62) {
                    alert("Too much data. Please select a smaller interval (less than 2 months), or a bigger sampling interval.");
                    $('#loadingChart' + this.chartNumber).text('Chart');
                    return;
                }
            }
            else if (this.timeInterval == "6h") {
                if (dateDiff(this.dateStart.split("-"), this.dateEnd.split("-")) > 300) {
                    alert("Too much data. Please select a smaller interval (less than 7 months), or a bigger sampling interval.");
                    $('#loadingChart' + this.chartNumber).text('Chart');
                    return;
                }
            }
            else if (this.timeInterval == "1d") {
                if (dateDiff(this.dateStart.split("-"), this.dateEnd.split("-")) > 1000) {
                    alert("Too much data. Please select a smaller interval (less than 2.5 years), or a bigger sampling interval.");
                    $('#loadingChart' + this.chartNumber).text('Chart');
                    return;
                }
            }
            else if (this.timeInterval == "1w") {
                if (dateDiff(this.dateStart.split("-"), this.dateEnd.split("-")) > 4000) {
                    alert("Too much data. Please select a smaller interval (less than 10 years), or a bigger sampling interval.");
                    $('#loadingChart' + this.chartNumber).text('Chart');
                    return;
                }
            }
            else if (this.timeInterval == "1m") {
                if (dateDiff(this.dateStart.split("-"), this.dateEnd.split("-")) > 13000) {
                    alert("Too much data. Please select a smaller interval (less than 30 years), or a bigger sampling interval.");
                    $('#loadingChart' + this.chartNumber).text('Chart');
                    return;
                }
            }
            else if (this.timeInterval == "1y") {
                if (dateDiff(this.dateStart.split("-"), this.dateEnd.split("-")) > 100000) {
                    alert("Too much data. Please select a smaller interval (less than 200 years), or a bigger sampling interval.");
                    $('#loadingChart' + this.chartNumber).text('Chart');
                    return;
                }
            }
            this.raw = "No";
        }
        var myUrl;
        /* define prediction models */
        this["000137187-Consumed real power-pc1"] = "ma";
		
		if (this.aggregateType == "prediction") {
			/*
            if (typeof this[this.dataType] == 'undefined') {
				alert("Prediction not available for this sensor.");
			}
			else {
				myUrl = "/api/get-predictions?p=" + this.dataType + ":" + this[this.dataType] + ":"+ this.dateStart + ":" + this.dateEnd;
			}*/
            myUrl = "/api/get-predictions?p=" + escape(this.dataType) + ":ma:"+ this.dateStart + ":" + this.dateEnd;
		}
        else if (this.raw == "No") {
            myUrl = '/api/get-aggregates?p=' + escape(this.dataType) + ':' + this.aggregateType + ':' + this.timeInterval + ':' + this.dateStart + ':' + this.dateEnd;
        }
        else if (this.raw == "Yes") {
            myUrl = '/api/get-measurements?p=' + escape(this.dataType) + ':' + this.dateStart + ':' + this.dateEnd;			
        }
        else {
            console.log("ERROR in checking equality!")
        }
		console.log(myUrl);
        // making a copy of this object, so that we preserve data within multiple async calls
        var contextThis = jQuery.extend({}, this);
        $.ajax({
            url: myUrl,
            success: function (data1) { this.loadedAggregates(data1, this.dataType, this.aggregateType, this.timeInterval) },
            context: contextThis,
			error: function (x, y, z) {alert(y);}
        });
    };
    
    this.loadedAggregates = function (data1, dataType, aggregateType, timeInterval) {
        
        //extracting info about data
		data1 = JSON.parse(data1);
		if (!(typeof data1[0] == 'undefined') && typeof data1[0]["Val"] == 'undefined') {
			var data2 = [];
			for (var i = 0; i < data1.length; i++) {
				data2.push({"Val" : data1[i]["value"], "Timestamp" : data1[i]["timestamp"]});
			}
			// console.log(data2);
		}
		else {
			data2 = data1;
		}
		//console.log("TUTU: ", data2);
        datayDescription = "N/A";
        datayUnit = "N/A";
        
        console.log(this.systemNodes);
        
        if (this.systemNodes.sensorTable[dataType]) {
            found = true;
            /*
            counter = namesToLocations[dataType].fst;
            counter2 = namesToLocations[dataType].snd;
            datayDescription = myNodes[counter].Sensors[counter2].Phenomenon;
            datayUnit = myNodes[counter].Sensors[counter2].UoM;
            */
            datayDescription = this.systemNodes.sensorTable[dataType].Phenomenon;
            datayUnit = unescape(this.systemNodes.sensorTable[dataType].UoM);
        }
        else {
            found = false;
        }

        if (found == false) {
            console.log("ERROR: Data info not found in nodes.");
        }
        if (datayDescription == "" || datayDescription == "-") datayDescription = "N/A";
        if (datayUnit == "" || datayUnit == "-") datayUnit = "N/A";

        //checking if additional y axis needed because unit does not exist yet or scales are too different
        //find all y axis with same unit
        var axisData = [];
        for (i = 0; i < this.chart.yAxis.length; i++) {
            if (this.chart.options.yAxis[i].title.text == datayUnit) {
                axisData[axisData.length] = {
                    "index": i,
                    "min": this.chart.options.yAxis[i].min,
                    "max": this.chart.options.yAxis[i].max
                };
            }
        }
        //outputing collected data (& after finding min/max deciding if adding new axis)

        console.log("Added data length: " + data2.length);
        this.data[this.data.length] = data2;
        
        var data1 = [];
        var date;
        var timedate;
        var min = Infinity;
        var max = -Infinity;
        for (j = 0; j < data2.length; j++) {
            timedate = data2[j].Timestamp.split("T");
            date = timedate[0].split("-");
            time = timedate[1].split(":");
			if (typeof time[2] == 'undefined') { time[2] = 0; }
            data1[data1.length] = [Date.UTC(date[0], date[1] - 1, date[2], time[0], time[1], time[2]), data2[j].Val]
            if (data2[j].Val < min) {
                min = data2[j].Val;
            }
            else if (data2[j].Val > max) {
                max = data2[j].Val;
            }
        }
		
        //adding y axis if needed
        addedNumber = ""; //number added to axis id so we can seperate axis with same unit
        i = 0;
        axisIndex = -1;
        addAxis = true;
        while (addAxis && i < axisData.length) {
            // /3 gives us effectively maximum 6x the scale size (but only maximum 3x up and 3x down)
            if (axisData[i].max - axisData[i].min > Math.abs(axisData[i].max - max) / 3 &&
                axisData[i].max - axisData[i].min > Math.abs(axisData[i].min - min) / 3  ) {
                //in this case we already have an appropriate axis
                addAxis = false;
                axisIndex = axisData[i].index;
            }
            i++;
        }
        newMin = min - (max - min) * 0.1;
        newMax = max + (max - min) * 0.1;
        if (addAxis) {
            console.log("Adding new axis: " + datayUnit + addedNumber + ".")
            if (axisData.length != 0) {
                addedNumber = axisData.length;
            }
            this.chart.addAxis({
                id: datayUnit + addedNumber,
                title: {
                    text: datayUnit + addedNumber
                },
                min: newMin,
                max: newMax
            });
        }
        else {
            if (i - 1 != 0) {
                addedNumber = i - 1; //i-1 is where we found the right axis to add data on
            }
        }
        //adding data
        $('#loadingChart' + chartNumber).text('Rendering chart ...');
        this.chart.addSeries({
            type: 'line',
            data: data1,
            name: dataType + "(" + timeInterval + "-" + aggregateType + ")" + ": " + datayDescription + " - " + datayUnit + addedNumber,
            yAxis: datayUnit + addedNumber
        });
        if (axisIndex != -1) {
            this.chart.options.yAxis[axisIndex].min = Math.min(newMin, this.chart.options.yAxis[axisIndex].min);
            this.chart.options.yAxis[axisIndex].max = Math.max(newMax, this.chart.options.yAxis[axisIndex].max);
            this.chart.yAxis[axisIndex].min = Math.min(newMin, this.chart.options.yAxis[axisIndex].min);
            this.chart.yAxis[axisIndex].max = Math.max(newMax, this.chart.options.yAxis[axisIndex].max);
            this.chart.yAxis[axisIndex].options.startOnTick = true;
            this.chart.yAxis[axisIndex].options.endOnTick = true;
            this.chart.yAxis[axisIndex].setExtremes(this.chart.options.yAxis[axisIndex].min, this.chart.options.yAxis[axisIndex].max);
        }
        
        this.chart.redraw();
        $('#loadingChart' + chartNumber).text('Chart');
        console.log("Added series: " + dataType + "(" + timeInterval + "-" + aggregateType + ")" + ": " + datayDescription + " - " + datayUnit + addedNumber + ".");
    };
};

