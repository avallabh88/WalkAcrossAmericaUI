/*
 * @file index.js
 * Controller for CES dashboard page.
 *
 * @author Avinash Vallabhaneni (avallabhaneni@foliage.com)
 * @version 0.01
 *
 * Copyright © 2016, Foliage, Inc., part of the Altran Group. All rights reserved.”
 */

import constants from '../../constants'
export default class CESDashboardCtrl {
    constructor($scope, $http , $stomp, $timeout, contextService, dashboardService, hostNameService, $document, siteService, $state) {

        $scope.isTools = true;
        $('#actionDanger').hide();
        $scope.isSites = false;
        $scope.isAlarms = false;
        $scope.isSummary = true;
        $scope.isDetail = false;
        $('#refreshDiv').hide();   
        $('#refreshMcbfDiv').hide();
        $scope.params = {};
        $scope.selectedRow = null;
        $scope.orderByAlarmField = 'timestamp';
        $scope.reverseAlarmSort = true;
        $scope.filterCriteria = "search";
        $scope.filterAlarmCriteria = "";
        $scope.filterSiteCriteria = "";
        $scope.fromSites = false;
        $scope.toolsTabTitle = "All Tools";
        $scope.severityLevel = 'All';
        $scope.severityDays = 7;
        var rowTitle;


        //service to return the context and redirect it if the context is Plant
        contextService.getDashboardContext().then(function(data) {
            $scope.context = data;
            if($scope.context.toLowerCase() == "plant"){
                $state.go("app.plant");
            }
        });


        //sorter function for Tool Id
        $scope.sorterFunc = function(tool){
            return parseInt(tool.assetId);
        };

        //sorter function for Site Id
        $scope.sorterSiteFunc = function(site){
            return parseInt(site.siteId);
        };

        //service to return the image location
        dashboardService.getSiteImage().then(function(data) {
            console.log("getSiteImage >>> " + JSON.stringify( data ) );
            $scope.siteAliasName = data[0].aliasName;
            $scope.toolColors = data[0].stateToColorMapping;
        });

        //function called from sites tab to filter the tools tab
        $scope.showToolsFromAlarms = function (event, toolId) {
            $scope.showTools();
            $('#toolsTable tr').removeClass('selected');
            $scope.selectedToolRow = toolId;
        }


        $scope.showToolsList = function (siteId) {//function called from sites tab to filter the tools tab
            $scope.showTools();
            $scope.toolsTabTitle = "Tool list for Site:" + siteId;
            $scope.selectedSiteId = siteId;
            $scope.fromSites = true;
        }

        $scope.showSitesList = function (siteId) {//function called from sites tab to filter the tools tab
            $scope.showSites();
            $scope.selectedRow = siteId;
        }

        $scope.resetToolsTab = function () {//function called to reset tools tab
            $scope.toolsTabTitle = "All Tools";
            $scope.fromSites = false;
        }

        $scope.search = function (row) {//filter condition based on input
            if(row.alarms.length > 0){
                return !!((row.assetId.indexOf($scope.query || '') !== -1 || row.toolState.toLowerCase().indexOf($scope.query || '') !== -1 || row.toolState.indexOf($scope.query || '') !== -1 ||
                row.alarms[0].alarmNumber.indexOf($scope.query || '') !== -1 || row.alarms[0].message.toLowerCase().indexOf($scope.query || '') !== -1 || row.siteId.indexOf($scope.query || '') !== -1));
            }
            else{
                return !!((row.assetId.indexOf($scope.query || '') !== -1 || row.toolState.toLowerCase().indexOf($scope.query || '') !== -1
                           || row.toolState.indexOf($scope.query || '') !== -1 || row.siteId.indexOf($scope.query || '') !== -1));
            }

        };

        $scope.searchAlarms = function (row) {//search alrms based on time
            var date = new Date(row.timestamp);
            var hours = date.getHours();
            var minutes = "0" + date.getMinutes();
            var seconds = "0" + date.getSeconds();
            var formattedTime = hours + ':' + minutes.substr(-2) + ':' + seconds.substr(-2);
            return !!((row.message.indexOf($scope.queryAlarm || '') !== -1 || row.alarmNumber.indexOf($scope.queryAlarm || '') !== -1
                       || row.assetId.indexOf($scope.queryAlarm || '') !== -1 || formattedTime.toString().indexOf($scope.queryAlarm || '') !== -1));//filter condition based on input

        };

        $scope.searchSites = function (row) {//function called for the filter on sites table
            return !!((row.siteId.indexOf($scope.querySites || '') !== -1 || row.siteState.toLowerCase().indexOf($scope.querySites || '') !== -1
                       || row.location.city.toLowerCase().indexOf($scope.querySites || '') !== -1 || row.location.state.toLowerCase().indexOf($scope.querySites || '') !== -1));

        };

        $scope.toolInformation = function (tool) {//navigate to tool details based on tool Id
            $state.go("app.cestooldetails", { toolID: tool.assetId });
        }

        $scope.getAlarmStatus = function (tool) {//display alarm type based on status of alarm
            if(tool.alarms.length > 0){
                if(tool.alarms[0].severity == 'CRITICAL'){
                    $('#status' + tool.assetId).addClass("fa fa-times-circle fa-2x");
                    $('#status' + tool.assetId).css("color", "#a94442");
                    return true;
                }else if(tool.alarms[0].severity == 'MAINTENANCE'){
                    $('#status' + tool.assetId).addClass("fa fa-clock-o fa-2x");
                    $('#status' + tool.assetId).css("color", "#31708f");
                    return true;
                }else if(tool.alarms[0].severity == 'WARNING'){
                    $('#status' + tool.assetId).addClass("fa fa-exclamation-triangle fa-2x");
                    $('#status' + tool.assetId).css("color", "#8a6d3b");
                    return true;
                }else{
                    return false;
                }
            }else{
                return false;
            }
        }

        //code for ordering tools based on status, will be added based on requirement
        $scope.customOrder = function (item) {
            var toolStatus = item.toolState;
            switch (toolStatus) {
                case 'UNSCHEDULED_DOWN':
                    return 1;

                case 'SCHEDULED_DOWN':
                    return 2;

                case 'PRODUCTIVE':
                    return 4;

                case 'STANDBY':
                    return 3;
            }
        };

        let paretoChart;
        let paretoBarGraph;
        let mcbfChart;
        let mcbfBarGraph;

        const writeAlarmPareto = data => {
            const {
                total,
                list
            } = data;


            paretoChart.dataProvider = list;
            paretoChart.write('alarmsPareto');
            paretoChart.validateData();
        };

        const writeMCBF = data => {
            const {
                total,
                tools
            } = data;

            mcbfChart.dataProvider = tools;
            mcbfChart.write('mcbf');
            mcbfChart.validateData();
        };

        AmCharts.handleLoad();

        var configChart = function () {

            paretoChart = new AmCharts.AmSerialChart();
            paretoChart.categoryField = "alarmNumber";
            paretoChart.labelRotation = 90;
            paretoChart.toggleLegend = false;

            var yAxis = new AmCharts.ValueAxis();
            yAxis.position = "left";
            paretoChart.addValueAxis(yAxis);


            paretoBarGraph = new AmCharts.AmGraph();
            paretoBarGraph.valueField = "count";
            paretoBarGraph.type = "column";
            paretoBarGraph.fillAlphas = 1;
            paretoBarGraph.lineColor = "#f0ab00";
            paretoBarGraph.valueAxis = yAxis;
            paretoChart.addGraph(paretoBarGraph);

            var legend = new AmCharts.AmLegend();
            legend.enabled = false;

            var categoryAlarmAxis = paretoChart.categoryAxis;
            categoryAlarmAxis.labelRotation = 45 ;
            categoryAlarmAxis.gridPosition = 'start';
            categoryAlarmAxis.autoWrap = false;
            categoryAlarmAxis.minHorizontalGap = '0';
            categoryAlarmAxis.addListener( "rollOverItem", function( event ) {
                event.target.setAttr( "cursor", "default" );
                event.chart.balloon.borderColor = event.serialDataItem.dataContext.color;
                event.chart.balloon.followCursor( true );
                event.chart.balloon.changeColor( event.serialDataItem.dataContext.color );
                event.chart.balloon.showBalloon( event.serialDataItem.dataContext.alarmNumber + ':' + event.serialDataItem.dataContext.message + '-' + event.serialDataItem.dataContext.count );
            } );

            categoryAlarmAxis.addListener( "rollOutItem", function( event ) {
                event.chart.balloon.hide();
            } );

            paretoChart.addLegend(legend);
            paretoChart.write('alarmsPareto');

            if($scope.severityLevel == 'All'){
                $http.get(hostNameService.getHostName()+"/dashboard/alarms/constrainedcount?alarmTypes[]=CRITICAL,WARNING,MAINTENANCE,INFO&priorDays=" +$scope.severityDays)
                    .then(response => writeAlarmPareto(response.data));
            }else{
                $http.get(hostNameService.getHostName()+"/dashboard/alarms/constrainedcount?alarmTypes[]=" + $scope.severityLevel + "&priorDays=" +$scope.severityDays)
                    .then(response => writeAlarmPareto(response.data));
            }
        }
        
        var configMCBFChart = function () {
            mcbfChart = new AmCharts.AmSerialChart();
            mcbfChart.categoryField = "assetId";

            var yAxis = new AmCharts.ValueAxis();
            yAxis.position = "left";
            mcbfChart.addValueAxis(yAxis);

            mcbfBarGraph = new AmCharts.AmGraph();
            mcbfBarGraph.valueField = "meanCycleBetweenFailure";
            mcbfBarGraph.type = "column";
            mcbfBarGraph.fillAlphas = 1;
            mcbfBarGraph.lineColor = "#f0ab00";
            mcbfBarGraph.valueAxis = yAxis;
            mcbfChart.addGraph(mcbfBarGraph);

            var categoryAxis = mcbfChart.categoryAxis;
            categoryAxis.addListener( "rollOverItem", function( event ) {
                event.target.setAttr( "cursor", "default" );
                event.chart.balloon.borderColor = event.serialDataItem.dataContext.color;
                event.chart.balloon.followCursor( true );
                event.chart.balloon.changeColor( event.serialDataItem.dataContext.color );
                console.log(event.serialDataItem.dataContext);
                event.chart.balloon.showBalloon( event.serialDataItem.dataContext.siteAlias + '-' + event.serialDataItem.dataContext.assetId );
            } );

            categoryAxis.addListener( "rollOutItem", function( event ) {
                event.chart.balloon.hide();
            } );
            categoryAxis.gridPosition = "start";
            categoryAxis.axisAlpha = 0;
            categoryAxis.tickLength = 0;

            mcbfChart.write('mcbf');

            $http.get(hostNameService.getHostName()+"/dashboard/tools")
                .then(response => writeMCBF(response.data));
        }



        if(AmCharts.isReady) {
            configChart();
            configMCBFChart();//
        }
        else {
            AmCharts.ready(configChart);
        }

        $('#refreshAlarms').click(function () {
            configChart();
        })

        $('#refreshMcbf').click(function () {
            configMCBFChart();
        })

        $(function() {
            $('#severitySelect').on('change', function(){
                var selected = $(this).find("option:selected").val();
                $scope.severityLevel = selected;
                configChart();
            });
        });

        $(function() {
            $('#severityDays').on('change', function(){
                var selected = $(this).find("option:selected").val();
                $scope.severityDays = selected;
                configChart();
            });

        });


        $http.get(hostNameService.getHostName()+"/dashboard/tools")
            .then(function (response) {$scope.tools = response.data.tools;})
            .catch(function(response) {
                console.error('Tools List error', response.status);
                $scope.ErrorMessage = "Error:Internal Error Occurred.";
                $('#actionDanger').show();
            }); // Assigning the response from tools web service

        $http.get(hostNameService.getHostName()+"/dashboard/sites/?context=Plant")
            .then(function (response) {
                $scope.sites = response.data.list;
            })
            .catch(function(response) {
                console.error('Sites List error', response.status);
                $scope.ErrorMessage = "Error:Internal Error Occurred.";
                $('#actionDanger').show();
            }); // Assigning the response from web service to the Sites tab

        $scope.showRowTitle = function (event, tool) {//assiging information to the tool tip in tools tab
            if(tool.alarms.length > 0){
                rowTitle = tool.assetId +',' + tool.toolState + ',' + tool.alarms[0].alarmNumber + ',' + tool.alarms[0].message + ',' + tool.cycleCount;
                $document.find('#' + 'row' +tool.assetId).attr("title", rowTitle);
            }
            else{
                rowTitle = tool.assetId +',' + tool.toolState + ',' + tool.cycleCount;
                $document.find('#' + 'row' +tool.assetId).attr("title", rowTitle);
            }
        }

        $scope.showTools = function() {//called when the tools tab is clicked
            $scope.toolsTabTitle = "All Tools";
            $scope.fromSites = false;
            $scope.isTools = true;
            $scope.isSites = false;
            $scope.isAlarms = false;
            $('#tool').addClass("active");
            $('#alarm').removeClass("active");
            $('#sites').removeClass("active");
        };

        $scope.showAlarms = function() {//called when the alarms tab is clicked
            $scope.isAlarms = true;
            $scope.isTools = false;
            $scope.isSites = false;
            $('#tool').removeClass("active");
            $('#alarm').addClass("active");
            $('#sites').removeClass("active");
            $scope.loadAlarms();
        };

        $scope.showSites = function() {//called when the sites tab is clicked
            $scope.isSites = true;
            $scope.isTools = false;
            $scope.isAlarms = false;
            $('#sites').addClass("active");
            $('#tool').removeClass("active");
            $('#alarm').removeClass("active");
        };

        $scope.clearFilter = function() {//function to clear the data entered in the text box
            $scope.query = "";
        }

        $scope.clearAlarmFilter = function() {//function to clear the data entered in the alarms text box
            $scope.queryAlarm = "";
        }

        $scope.clearSiteFilter = function() {//function to clear the data entered in the sites text box
            $scope.querySites = "";
        }

        $scope.expandDiv = function () {//expanding the alarm pareto charts div shown on the dashboard
            $('#mcbfDiv').hide();
            $('#dateDiv').hide();
            $('#alarmsDiv').removeClass("col-xs-6");
            $('#alarmsDiv').addClass("col-xs-12");
            $('#refreshDiv').show();

        }

        $scope.expandMcbfDiv = function () {//expanding the mcbf chart div shown on the dashboard
            $('#dateMcbfDiv').hide();
            $('#alarmsDiv').hide();
            $('#mcbfDiv').removeClass("col-xs-6");
            $('#mcbfDiv').addClass("col-xs-12");
            $('#refreshMcbfDiv').show();

        }

        $scope.closeDiv = function () {//closing the alarm pareto exapnded chart
            $('#mcbfDiv').show();
            $('#dateDiv').show();
            $('#alarmsDiv').removeClass("col-xs-12");
            $('#alarmsDiv').addClass("col-xs-6");
            $('#refreshDiv').hide();

        }

        $scope.closeMcbfDiv = function () {//closing the mcbf expanded chart
            $('#dateMcbfDiv').show();
            $('#alarmsDiv').show();
            $('#mcbfDiv').removeClass("col-xs-12");
            $('#mcbfDiv').addClass("col-xs-6");
            $('#refreshMcbfDiv').hide();

        }

        $scope.closeTable = function () {
            $scope.isSummary = true;
            $scope.isDetail = false;
        }


        $scope.loadAlarms = function () {//loading the alarms in the alarms tab
            $http.get(hostNameService.getHostName()+"/dashboard/alarms/summary")
                .then(function (response) {
                    $scope.alarms = response.data.list;
                    $scope.totalWarningCount = 0;
                    $scope.totalCriticalCount = 0;
                    $scope.totalMaintCount = 0;
                    $scope.totalInfoCount = 0;

                    angular.forEach($scope.alarms, function(value, key) {
                        if(value.severity == 'WARNING'){
                            $scope.totalWarningCount = value.count;
                        }else if(value.severity == 'CRITICAL'){
                            $scope.totalCriticalCount = value.count;
                        }else if(value.severity == 'MAINTENANCE'){
                            $scope.totalMaintCount = value.count;
                        }else{
                            $scope.totalInfoCount = value.count;
                        }
                    });
                });
        }

        $scope.loadAlarms();

        $scope.alarmsSummary = function (alarm, count) {//loading the alarms based on summary
            $scope.alarmType = alarm;
            $http.get(hostNameService.getHostName()+"/dashboard/alarms/summary/" +alarm)
                .then(function (response) {
                    $scope.alarmsCategory = response.data.list;
                    $scope.numberOfAlarms = count;
                });
            $scope.isSummary = false;
            $scope.isDetail = true;
        }

        $http.get(hostNameService.getHostName()+"/dashboard/alarms/current/summary/")
            .then(function (response) { //calling the web service to get the current alarm number
                $scope.alarmsCount = response.data.list;
                console.log("Current alarms:" +$scope.alarmsCount);
                $scope.warningCount = 0;
                $scope.criticalCount = 0;
                $scope.maintCount = 0;
                $scope.infoCount = 0;                     
                
                angular.forEach($scope.alarmsCount, function(value, key) {
                    if(value.severity == 'WARNING'){
                        $scope.warningCount = value.count;
                    }else if(value.severity == 'CRITICAL'){
                        $scope.criticalCount = value.count;
                    }else if(value.severity == 'MAINTENANCE'){
                        $scope.maintCount = value.count;
                    }else{
                        $scope.infoCount = value.count;
                    }
                });
            });

        $('.panel-body.criticalAlarm').click(function () {
            $scope.$apply(function(){
                $scope.isSummary = false;
                $scope.isDetail = true;
            });

        })


        var showToolMap = function(tool) { //adding style to the tool on the plant map
            $scope.selectedRow = tool.assetId;
            $('.glyphicon-oil').removeClass("toolImage");
            $('#' + tool.assetId).addClass("toolImage");
        };


        //setting timeout to call the configchart() function
        $timeout(configChart, 1);

        // Map
        var map = AmCharts.makeChart( "map", {
            /**
             * this tells amCharts it's a map
             */
            "type": "map",

            /**
             * create data provider object
             * map property is usually the same as the name of the map file.
             * getAreasFromMap indicates that amMap should read all the areas available
             * in the map data and treat them as they are included in your data provider.
             * in case you don't set it to true, all the areas except listed in data
             * provider will be treated as unlisted.
             */
            "dataProvider": {
                "map": "worldHigh",
                "getAreasFromMap": true
            },

            /**
             * create areas settings
             * autoZoom set to true means that the map will zoom-in when clicked on the area
             * selectedColor indicates color of the clicked area.
             */
            "areasSettings": {
                "autoZoom": true,
                "selectedColor": "#3095b4",
                "color": "#5c7f92",
                "rollOverOutlineColor": "#8e258d"
            },

            /**
             * let's say we want a small map to be displayed, so let's create it
             */
            "smallMap": {
                "backgroundColor": "#8b8178",
                "mapColor": "#d5d2ca"
            },

            "zoomControl": {
                "buttonRollOverColor": "#d5d2ca"
            },

            "imagesSettings": {
                "labelColor": "#8b8178",
                "labelRollOverColor": "#8e258d"
            }
        } );

        /*this.alarms = {
            urgent: 1,
            warning: 10,
            information: 100,
            maintenance: 1000
        };*/
        
        // Color array to correspond with the MapPoint.state property
        var colorState={
            "PRODUCTIVE":"#8b8178", 
            "STANDBY":"#a0d200", 
            "SCHEDULED_DOWN":"#cb0044",
            "UNSCHEDULED_DOWN":"#f0ab00"            
        };

        // get current CES data 
        $http.get(hostNameService.getHostName()+"/dashboard/sites/?context=CES")
            .then(response => {
                response.data.list.map(cespoint => {
                    // gets site state colors
                    colorState = cespoint.stateToColorMapping;
                    console.log('CES data: '+ JSON.stringify(cespoint) );
                    console.log(JSON.stringify(colorState) );
                    console.log('Setted colors with colors from site ' + cespoint.name + ' ' + cespoint.context);
                    
                    //----
                // receives initial sites states
                $http.get(hostNameService.getHostName()+"/dashboard/sites/?context=Plant")
                    .then(response => {
                        /*
                        Create two circles for each map point.
                        The top image has a thick white outline.
                        The bottom image is larger with no outline.
                        The effect is like a "bull's eye", so there's a circle with a colored ring, white ring, and colored center.
                        This is easier to stop on the map than a solid circle.
                        */
                 
                        const images = response.data.list.map(point => {
                            // gets site state colors
                            //colorState = point.stateToColorMapping;
                            //console.log('Setted colors with colors from site ' + point.name );
                            //console.log('Colors ' + JSON.stringify(colorState) );
                            var title = point.name +',' + point.location.city + ',' + point.location.country;
                            var color = colorState[point.siteState];

                            return {
                                latitude: point.location.latitude,
                                longitude: point.location.longitude,
                                title: title,
                                color: color,
                                idBase: point.siteId,
                                id: `${point.siteId}.1`,
                                selectable: true
                            }
                        });

                        images.forEach(image => {
                            image.type = "circle";
                            image.scale = 1.125;
                            image.outlineColor = "#FFFFFF";
                            image.outlineThickness = 3;
                        });

                        // Place the larger circle under the smaller one by inserting at the beginning of the array.
                        images.unshift(...images.map(image => {
                            return {
                                latitude: image.latitude,
                                longitude: image.longitude,
                                type: image.type,
                                //color: image.color,
                                title: image.title,
                                scale: 1.75,
                                bringForwardOnHover: false,
                                id: `${image.idBase}.2`
                            }
                        }));

                        map.clickedObject = false;
                        map.clickedObjectTimeout = false;
                        map.addListener("clickMapObject", function (event) {//on click event for the site displayed on the global map
                                $scope.showSites();
                                $scope.$apply(function(){
                                    $scope.colorPoints();
                                    $scope.selectedRow = event.mapObject.idBase;
                                    $('#tool').css("background-color","white");
                                });
                        }); 


                        map.dataProvider.images = images;
                        map.validateData();
                    });                    
                    //----
                });
        });
        

        $scope.showSiteMap = function(event, site) { //adding style to the tool on the global  map
            $scope.selectedRow = site.siteId;
            $scope.colorPoints();
            map.dataProvider.images.forEach(image => {
                if(image.idBase == site.siteId){
                    image.scale = '1.75';
                    image.outlineColor = 'black';
                    image.validate();
                }
            });
        };

        $scope.showToolsOrAlarmsSiteMap = function(event, toolId) {//function to show the site on the map when clicked on a row in the tools/Alarms tab
            $(event.currentTarget).closest("tr").siblings().removeClass('selected');
            $(event.currentTarget).addClass('selected');
            siteService.getSiteIdByToolId(toolId).then(function(data) {//service to return the site Id of the toool
                $scope.siteIDReturned = data;
                $scope.colorPoints();
                map.dataProvider.images.forEach(image => {
                    if(image.idBase == $scope.siteIDReturned){
                        image.scale = '1.75';
                        image.outlineColor = 'black';
                        image.validate();
                    }
                });
            });
        }

        $scope.colorPoints = function () {
            map.dataProvider.images.forEach(image => {
                    image.type = "circle";
                    image.scale = 1.125;
                    image.outlineColor = "#FFFFFF";
                    image.outlineThickness = 3;
                    image.validate();
            });

        }
        
        console.log('Before stomp connect ...');
        
        $stomp.connect(hostNameService.getHostName()+'/dashboard')
            .then(() => {
                // receive messages sent to /topic/map to update sites states
                console.log('Before subscribe map');
                $stomp.subscribe('/topic/map', points => {
                    console.log('Received map points ' + JSON.stringify(points) );
                    
                    points.forEach(point => {
                        // Change the color for each map point. Re-render the #2 circle first to preserve the z-order.
                        
                        for (let i = 2; i >= 1; i--) {
                            const image = map.getObjectById(`${point.id}.${i}`);
                            var color = colorState[point.state];
                            console.log('ColorState:' + JSON.stringify(colorState) );
                            console.log('Color ' + color );
                            image.color = color;
                            image.validate();
                        }
                    })
                });

                // receive alarms summary updates via stomp
                console.log('Before subscribe alarmsSummary');
                $stomp.subscribe('/topic/alarmsSummary', alarmSummary => {                    
                    console.log('Received alarmsSummary message');
                    $scope.alarms = alarmSummary.list;
                    $scope.totalWarningCount = 0;
                    $scope.totalCriticalCount = 0;
                    $scope.totalMaintCount = 0;
                    $scope.totalInfoCount = 0;

                    angular.forEach($scope.alarms, function(value, key) {
                        if(value.severity == 'WARNING'){
                            $scope.totalWarningCount = value.count;
                        }else if(value.severity == 'CRITICAL'){
                            $scope.totalCriticalCount = value.count;
                        }else if(value.severity == 'MAINTENANCE'){
                            $scope.totalMaintCount = value.count;
                        }else{
                            $scope.totalInfoCount = value.count;
                        }
                    });
                    // notifies AngularJS to update the ng-repeat with $scope.alarms
                    $scope.$apply();
                });
                
                // receive sites updates via stomp
                console.log('Before subscribe sites');
                $stomp.subscribe('/topic/sites', (sites) => {
                    console.log('Received sites message');                 
                    $scope.sites = sites.list;
                    $scope.$apply();
                });                
                
                // receive tools updates via stomp
                console.log('Before subscribe tools');
                $stomp.subscribe('/topic/tools', (data) => {                    
                    console.log('Received tools message');
                    $scope.tools = data.tools;
                    writeMCBF(data);
                    $scope.$apply();
                });
                
                /* Receive current alarms updates via stomp */     
                console.log('Before current alarms updates');
                $stomp.subscribe('/topic/currentAlarmsSummary', (data) => {                    
                    console.log('Received current alarms updates');
                    $scope.alarmsCount = data.list;
                    
                    $scope.warningCount = 0;
                    $scope.criticalCount = 0;
                    $scope.maintCount = 0;
                    $scope.infoCount = 0;                    
                    console.log("Current alarms:" + JSON.stringify($scope.alarmsCount) );
                    
                    angular.forEach($scope.alarmsCount, function(value, key) {
                        if(value.severity == 'WARNING'){
                            $scope.warningCount = value.count;
                        }else if(value.severity == 'CRITICAL'){
                            $scope.criticalCount = value.count;
                        }else if(value.severity == 'MAINTENANCE'){
                            $scope.maintCount = value.count;
                        }else{
                            $scope.infoCount = value.count;
                        }
                    });      
                    
                    $scope.$apply();
                });                
            });
    }
}
CESDashboardCtrl.$inject = ['$scope', '$http', '$stomp', '$timeout', 'ContextService', 'DashboardService', 'HostNameService', '$document', 'SiteService', '$state'];