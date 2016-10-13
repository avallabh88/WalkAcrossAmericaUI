/*
 * @file index.js
 * Controller for manufacturing plant page.
 *
 * @author Avinash Vallabhaneni (avallabhaneni@foliage.com)
 * @version 0.01
 *
 * Copyright © 2016, Foliage, Inc., part of the Altran Group. All rights reserved.”
 */

import constants from '../../constants'

export default class ManufacturingPlantCtrl {
    constructor($scope, $http, $state, dashboardService, $timeout, $document, $window, hostNameService,$stomp,$interval,$log, contextService, $anchorScroll, $location) {
        var self=this;
        $log.debug('Constructor for ManufacturingPlantCtrl called.');
        $scope.isTools = true;
        $scope.selectedRow = null;
        $('#actionDanger').hide();
        $scope.params = {};
        $scope.filterCriteria = "";
        $scope.filterAlarmCriteria = "";
        $scope.isSummary = true;
        $scope.isDetail = false;
        $scope.currentPage = 1;
        $scope.pageSize = 10;
        $scope.xValue = 0;
        $scope.yValue = 0;
        $scope.orderByAlarmField = 'timestamp';
        $scope.reverseAlarmSort = true;
        $('.glyphicon-oil').removeClass("toolImage");
        var img_width, img_height, div_width, div_height,new_xValue, labelWidth, rowTitle, toolNameWidth;
        $scope.sortType     = 'assetId'; // set the default sort type
        $scope.sortReverse  = false;

        $scope.sorterFunc = function(tool){
            return parseInt(tool.assetId);
        };

        contextService.getDashboardContext().then(function(data) {//redirect the user if the context is CES
            $scope.context = data;
            if($scope.context.toLowerCase() == "ces"){
                $state.go("app.ces");
            }
        });

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

        
        //get the width and height of the tool map in the dashboard
        var GetImageSize = function () {
            var elem = $document.find('#toolMap');
            div_width = elem.width();
            div_height = elem.height();
        }

        //getting the top and left co-ordinates of the plant layout image
        var GetCoordinates = function () {
            var img_left = $("#plantMap").position().left;
            var img_top = $("#plantMap").position().top;
            GetImageSize();
            var y = img_height + img_top;
            $scope.xValue = img_left;//calculating the value from left
            $scope.yValue = y -14;
        }

        //loading the image of the plant
        $("#plantMap").load(function() {
            img_width = this.width;
            img_height = this.height;
            GetCoordinates();
        });

        //function called when the table is filtered based on the input
        $scope.search = function (row) {
            if(row.alarms.length > 0){
                return !!((row.assetId.indexOf($scope.query || '') !== -1 || row.toolState.toLowerCase().indexOf($scope.query || '') !== -1 || row.toolState.indexOf($scope.query || '') !== -1 ||
                row.alarms[0].alarmNumber.indexOf($scope.query || '') !== -1 || row.alarms[0].message.toLowerCase().indexOf($scope.query || '') !== -1));//filter condition based on input
            }
            else{
                return !!((row.assetId.indexOf($scope.query || '') !== -1 || row.toolState.toLowerCase().indexOf($scope.query || '') !== -1 || row.toolState.indexOf($scope.query || '') !== -1));
            }
        };

        //function to modify the timestamp of the alarm time in the alarrms tab
        $scope.searchAlarms = function (row) {
                var date = new Date(row.timestamp);
                var hours = date.getHours();
                var minutes = "0" + date.getMinutes();
                var seconds = "0" + date.getSeconds();
                var formattedTime = hours + ':' + minutes.substr(-2) + ':' + seconds.substr(-2);
                return !!((row.message.indexOf($scope.queryAlarm || '') !== -1 || row.alarmNumber.indexOf($scope.queryAlarm || '') !== -1
                           || row.assetId.indexOf($scope.queryAlarm || '') !== -1 || formattedTime.toString().indexOf($scope.queryAlarm || '') !== -1));//filter condition based on input

        };


        //function called when the window is resized
        $(window).bind('resize', function(e){
            GetCoordinates();
            $http.get(hostNameService.getHostName()+"/dashboard/tools")
                .then(function (response) {$scope.tools = response.data.tools;});

            $timeout($scope.setToolColor, 800);//calling the timeout to set the color of the tool
        });


        dashboardService.getSiteImage().then(function(data) {//service to return the image location
            $scope.siteImage = "img/" + data[0].siteImage;
            $scope.toolColors = data[0].stateToColorMapping;
        });

        //called when the tool is selected from the Tools tab
        $scope.toolInfo = function (event) {
            $state.go("app.tooldetails", { toolID: event.target.id });
        }


        $scope.toolInformation = function (event, tool) {//called on double clicking on a row in the tools tab
            $state.go("app.tooldetails", { toolID: tool.assetId });
        }

        $scope.toolDisplay = function(tool){
            //to display tool in the table
            //called when the tool is clicked on the map
            var id = tool.assetId;
            $('.glyphicon-oil').removeClass("toolImage");
            $('#' + id).removeClass("toolImage");
            $('#toolsTable tr').eq(1).removeClass('selected');
            $scope.isTools = true;
            $('#tool').addClass("active");
            $('#alarm').removeClass("active");
            $scope.showToolMap(null, tool.assetId);
            var scrollToRow = 'row' + tool.assetId;
            $location.hash(scrollToRow);
            $anchorScroll();
        }

        $scope.showToolsList = function (toolId) {//function called from sites tab to filter the tools tab
            $scope.showTools();
            $('#toolsTable tr').eq(1).removeClass('selected');
            $scope.selectedRow = toolId;
            $('.glyphicon-oil').removeClass("toolImage");
            $('#' + toolId).addClass("toolImage");
        }
                
        $scope.setToolColor= function() {
            angular.forEach($scope.tools, function(tool, key) {
                /* do something for all key: value pairs */
                angular.forEach($scope.toolColors, function(value, key) {
                    /* do something for all key: value pairs */
                    if(tool.toolState == key){
                        $('#' + tool.assetId).css("color", value);//assigning color based on status
                    }
                });
            });
        };

        //function called to display the alarm type in the tools list based on the severity of the alarm
        $scope.getAlarmStatus = function (tool) {
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

        //assigning information to the tool tip for each row in the tab when the user
        $scope.showRowTitle = function (event, tool) {
            if(tool.alarms.length > 0){
                rowTitle = tool.assetId +',' + tool.toolState + ',' + tool.alarms[0].alarmNumber + ',' + tool.alarms[0].message + ',' + tool.cycleCount;
                $document.find('#' + 'row' +tool.assetId).attr("title", rowTitle);
            }
            else{
                rowTitle = tool.assetId +',' + tool.toolState + ',' + tool.cycleCount;
                $document.find('#' + 'row' +tool.assetId).attr("title", rowTitle);
            }
        }

        //getting the color based on tool status
        $scope.getToolStatusColor = function (tool) {
            angular.forEach($scope.toolColors, function(value, key) {
                /* do something for all key: value pairs */                
                if(tool.toolState == key){
                    return value;
                }
            });
        };

        //tool tip when user mouse overs the tool on the plant layout
        $scope.showToolTitleMap = function (event, tool) {
            if(tool.alarms.length > 0){
                rowTitle = tool.assetId +',' + tool.assetName + ',' + tool.toolState + ',' + tool.alarms[0].alarmNumber + ',' + tool.alarms[0].message + ',' + tool.cycleCount;
                $document.find('#' +tool.assetId).attr("title", rowTitle);
            }
            else{
                rowTitle = tool.assetId +',' + tool.assetName + ',' + tool.toolState + ',' + tool.cycleCount;
                $document.find('#' +tool.assetId).attr("title", rowTitle);
            }
        }


        $scope.showToolMap = function(event, toolId) { //adding style to the tool on the plant map
            $('#toolsTable tr').eq(1).removeClass('selected');
            $scope.selectedRow = toolId;
            $('.glyphicon-oil').removeClass("toolImage");
            $('#' + toolId).addClass("toolImage");
        };

        $scope.showAlarmsToolMap = function(event, toolId) { //adding style to the tool on the plant map
            $(event.currentTarget).closest("tr").siblings().removeClass('selected');
            $(event.currentTarget).addClass('selected');
            $('.glyphicon-oil').removeClass("toolImage");
            $('#' + toolId).addClass("toolImage");
        };

        //Charts
        let toolAvailabilityChart;
        let toolAvailabilityBarGraph;

        this.stomp = $stomp;
        this.scope = $scope;
        this.log = $log;
        
        function handleClick(event){
            $state.go("app.tooldetails", { toolID: event.item.category });
        }

        AmCharts.handleLoad();

        var configChart = function () {
            toolAvailabilityChart = new AmCharts.AmSerialChart();
            toolAvailabilityChart.precision = 2;
            toolAvailabilityChart.categoryField = "assetId";

            //add click listener
            toolAvailabilityChart.addListener("clickGraphItem", handleClick);

            var yAxis = new AmCharts.ValueAxis();
            yAxis.position = "left";
            yAxis.minimum = 0;
            yAxis.maximum = 100;
            yAxis.unit = "%";
            yAxis.unitPosition = "right";
            toolAvailabilityChart.addValueAxis(yAxis);

            toolAvailabilityBarGraph = new AmCharts.AmGraph();
            toolAvailabilityBarGraph.valueField = "assetAvailability";
            toolAvailabilityBarGraph.type = "column";
            toolAvailabilityBarGraph.fillAlphas = 1;
            toolAvailabilityBarGraph.lineColor = "#f0ab00";
            toolAvailabilityBarGraph.valueAxis = yAxis;
            toolAvailabilityChart.addGraph(toolAvailabilityBarGraph);

            var categoryAxis = toolAvailabilityChart.categoryAxis;
            categoryAxis.addListener( "rollOverItem", function( event ) {
                event.target.setAttr( "cursor", "default" );
                event.chart.balloon.borderColor = event.serialDataItem.dataContext.color;
                event.chart.balloon.followCursor( true );
                event.chart.balloon.changeColor( event.serialDataItem.dataContext.color );
                event.chart.balloon.showBalloon( event.serialDataItem.dataContext.assetName + '-' + event.serialDataItem.dataContext.assetId );
            } );

            categoryAxis.addListener( "rollOutItem", function( event ) {
                event.chart.balloon.hide();
            } );
            categoryAxis.gridPosition = "start";
            categoryAxis.axisAlpha = 0;
            categoryAxis.tickLength = 0;

            toolAvailabilityChart.write('toolAvailability');

            self.chart = toolAvailabilityChart;        
            $http.get(hostNameService.getHostName()+"/dashboard/tools")
                .then(self.toolsResponse.bind(self));
        }

        if(AmCharts.isReady) {
            configChart();
        }
        else {
            AmCharts.ready(configChart);
        }

        $('#refreshHistory').click(function () {
            configChart();
        });



        $http.get(hostNameService.getHostName()+"/dashboard/tools")
            .then(function (response) {
                $scope.tools = response.data.tools;
                // define the tool to select after receiving tool data 
                if($scope.tools.length>0){                    
                    $scope.selectedRow = $scope.tools[0].assetId;
                    $log.debug('Setted selected row from call to WebService with value ' + $scope.selectedRow );
                }
                $scope.totalItems = $scope.tools.length;
                $scope.numberOfPages = Math.ceil($scope.tools.length/$scope.pageSize);
            })
            .catch(function(response) {
                $log.error('Tools List error', response.status);
                $scope.ErrorMessage = "Error:Internal Error Occurred.";
                $('#actionDanger').show();
            }); // Assigning the response from web service to the tools tab


        //when the user clicks on the Tools tab
        $scope.showTools = function() {
            $scope.isTools = true;
            $('#tool').addClass("active");
            $('#alarm').removeClass("active");
        };

        //when the user clicks on the Alarms tab
        $scope.showAlarms = function() {
            $scope.isTools = false;
            $('#tool').removeClass("active");
            $('#alarm').addClass("active");
            $scope.loadAlarms();
        };

        //when the clear data button is clicked
        $scope.clearFilter = function() {
            $scope.query = "";
        }

        //clearing the text in alarms tab filter input box
        $scope.clearAlarmFilter = function() {
            $scope.queryAlarm = "";
        }

        $scope.closeTable = function () {//closing the table
            $scope.isSummary = true;
            $scope.isDetail = false;
        }

        $scope.closeError = function () {
            $scope.isError = false;
        }

        //navigating from alarms tab to alarms summary based on severity
        $scope.alarmsSummary = function (alarm, count) {
            $scope.alarmType = alarm;
            $http.get(hostNameService.getHostName()+"/dashboard/alarms/summary/" +alarm)
                .then(function (response) {
                    $scope.alarmsCategory = response.data.list;
                    $scope.numberOfAlarms = count;
                });
                $scope.isSummary = false;
                $scope.isDetail = true;
        }

        //web service which gets the current number of alarms
        $http.get(hostNameService.getHostName()+"/dashboard/alarms/current/summary/")
                .then(function (response) {
                    $scope.alarmsCount = response.data.list;
                    console.log("Current alarms:" +$scope.alarmsCount)
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


        $timeout($scope.setToolColor, 1000);
        $log.debug('Registered new interval for showSelectedRow. ');
        this.intervalPromise = $interval( this.showSelectedRow.bind(this) ,1500);
        this.interval = $interval;
        $scope.$on('$destroy', this.onDestroy.bind(this) );
        $timeout($scope.setToolColor, 1000);
        $timeout($scope.setToolColor, 3000);// this is called in case the tools are not colored on the layout initially when the page loads
        
        //calling the alarms endpoint
        $scope.loadAlarms = function () {
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


        //function called to get the actual location of the tool on the layout
        $scope.getTransformedXValues = function(tool) {
            if(div_width == undefined) {
                div_width = ($window.innerWidth*0.55);
            }
            new_xValue = (div_width*tool.location.xcoordinate)/860;
            return new_xValue;
        };

        //function called to get the actual location of the tool based on y co-ordinate
        $scope.getTransformedYValues = function(tool) {
            return tool.location.ycoordinate;
        };

        //
        $scope.getToolLabelSize = function(tool) {
            toolNameWidth = tool.assetName.length;
            return (toolNameWidth*6)/2;

        };

        $stomp.connect(hostNameService.getHostName()+'/dashboard').then(this.stompConnected.bind(this));            
    }
    
    stompConnected(){
        // called when is connected to stomp
        this.stomp.subscribe('/topic/tools', this.toolsSubscriber.bind(this) );
        this.stomp.subscribe('/topic/alarmsSummary', this.alarmsSummarySubscriber.bind(this) ); 
        this.stomp.subscribe('/topic/currentAlarmsSummary', this.currentAlarmsSummarySubscriber.bind(this) ); 
    }
    
    /* Receive current alarms updates via stomp */     
    currentAlarmsSummarySubscriber(data){       
        var scope=this.scope;    
        scope.alarmsCount = data.list;
        this.log.debug("Current alarms:" + JSON.stringify(scope.alarmsCount) )
        
        scope.warningCount = 0;
        scope.criticalCount = 0;
        scope.maintCount = 0;
        scope.infoCount = 0;

        angular.forEach(scope.alarmsCount, function(value, key) {
            if(value.severity == 'WARNING'){
                scope.warningCount = value.count;
            }else if(value.severity == 'CRITICAL'){
                scope.criticalCount = value.count;
            }else if(value.severity == 'MAINTENANCE'){
                scope.maintCount = value.count;
            }else{
                scope.infoCount = value.count;
            }
        });
        scope.$apply();            
    }
    
    // receive alarms updates via stomp     
    alarmsSummarySubscriber(data){
        var scope=this.scope;
        scope.alarms = data.list;
        this.log.debug("Current Total alarms:" + JSON.stringify(scope.alarms) )
        scope.totalWarningCount = 0;
        scope.totalCriticalCount = 0;
        scope.totalMaintCount = 0;
        scope.totalInfoCount = 0;

        angular.forEach(scope.alarms, function(value, key) {
            if(value.severity == 'WARNING'){
                scope.totalWarningCount = value.count;
            }else if(value.severity == 'CRITICAL'){
                scope.totalCriticalCount = value.count;
            }else if(value.severity == 'MAINTENANCE'){
                scope.totalMaintCount = value.count;
            }else{
                scope.totalInfoCount = value.count;
            }
        });
        scope.$apply();
    }   

    // receive tools updates via stomp
    toolsSubscriber(data){
        this.scope.tools = data.tools;
        /* in the normalizer we do not have 14 tools so we must check the amount of available tools to use the following console.log */
        if(this.scope.tools.length>14){
            console.log("the tools are:"+this.scope.tools[14].toolState);        
        }
        this.scope.$apply();
        this.scope.setToolColor();
        this.writeToolAvailability(data,this.chart);    
        this.scope.showToolMap(null , this.scope.selectedRow );
        this.showSelectedRow();
    }
    
    writeToolAvailability(data,chart){
        chart.dataProvider = data.tools;
        chart.write('toolAvailability');
        chart.validateData();            
    }    
    
    toolsResponse(response){
        this.writeToolAvailability(response.data,this.chart);        
    }
    
    showSelectedRow(){
        $('#toolsTable tr').removeClass('selected');
        $('#row' + this.scope.selectedRow).addClass('selected');
    }
    
    onDestroy(){
        this.log.debug('OnDestroy for ManufacturingPlantCtrl called.');
        this.log.debug('Cancelling interval and stomp handler.');
        this.interval.cancel(this.intervalPromise);
        this.stomp.disconnect();
    }
}
ManufacturingPlantCtrl.$inject = ['$scope', '$http', '$state', 'DashboardService', '$timeout', '$document', '$window', 'HostNameService','$stomp','$interval','$log', 'ContextService', '$anchorScroll', '$location'];