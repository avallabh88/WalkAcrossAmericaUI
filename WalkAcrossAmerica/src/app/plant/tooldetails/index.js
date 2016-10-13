/*
 * @file index
 * Controller for tool details
 *
 * @author avallabhaneni (avallabhaneni@foliage.com)
 * @version 0.01
 *
 * Copyright © 2016, Foliage, Inc., part of the Altran Group. All rights reserved.”
 */
import constants from '../../constants'
export default class ToolDetailsCtrl {
    constructor($scope, $http, $stateParams, hostNameService) {

        $scope.toolId = $stateParams.toolID;
        var self=this;
        var sensorLabel;
        var oldTime = '';
        $scope.itemSelected= 'NoSensor';
        $scope.sensorSelected = false;
        $scope.invalidOption = false;
        $scope.imageSrc = '../../../target/VFD/AssetLib/Tools/ToolImages/';
        $scope.refreshProgress = false;

        //web service to return the tool details
        var toolDetails = function () {
            $http.get(hostNameService.getHostName()+"/dashboard/tools/" + $scope.toolId)
                .then(function (response) {
                    $scope.toolDetails = response.data;
                    $scope.toolName = $scope.toolDetails.site.assets[0].assetName;
                    $scope.toolImage = "/img/" + $scope.toolDetails.site.assets[0].assetType.assetImagePath; //assigning tool image
                }); // Assigning the response from web service
        }

        //web service to return the total number of sensors associated with a asset
        $http.get(hostNameService.getHostName()+"/dashboard/getsensorsbyassetid/" + $scope.toolId)
            .then(function (response) {
                $scope.sensors = response.data.sensors;
            });

        //strip chart for the sensors
        $(function() {
            $('#sensorSelect').on('change', function(){
                var selected = $(this).find("option:selected").val();

                if(selected == "NoSensor"){
                    $scope.sensorSelected = false;
                    $scope.invalidOption = false;
                }
                else{
                    $scope.invalidOption = true;
                    $scope.sensorInfo = selected;
                    angular.forEach($scope.sensors, function(sensor, key) {
                        /* do something for all key: value pairs */

                        if(sensor.sensorId == $scope.sensorInfo){
                            console.log(sensor);
                            $scope.cadence = sensor.sensorCadence;
                            $scope.sensorLabel = sensor.valueLabel;
                            $scope.sensorUnits = sensor.valueUnits;
                            $scope.sensorSelected = true;
                        }
                    });
                    $http.get(hostNameService.getHostName()+"/dashboard/getcurrentsensorvalue?assetId=" + $scope.toolId + "&sensorId=" + $scope.sensorInfo)
                        .then(function (response) {
                            $scope.sensorValue = response.data;
                            var firstTime;
                            if($scope.sensorValue.value == null || $scope.sensorValue.timestamp ==  null){
                                firstTime = "00:00:00"
                            }
                            else{
                                var date = new Date($scope.sensorValue.timestamp);
                                $scope.date = date;
                                var hours = date.getHours();
                                var minutes = "0" + date.getMinutes();
                                var seconds = "0" + date.getSeconds();
                                var formattedTime = hours + ':' + minutes.substr(-2) + ':' + seconds.substr(-2);
                                firstTime = formattedTime;
                            }

                            var i = 0;

                            function generateChartData(){
                                var chartData = [];
                                var sensorChartValue = $scope.sensorValue.value;

                                chartData.push( {
                                    "senValue": sensorChartValue,
                                    "time": firstTime
                                } );
                                return chartData;
                            }



                            /**
                             * Create the chart
                             */
                            var chart = AmCharts.makeChart( "toolAvailability", {
                                "type": "serial",
                                "theme": "light",
                                "zoomOutButton": {
                                    "backgroundColor": '#000000',
                                    "backgroundAlpha": 0.15
                                },
                                "dataProvider": generateChartData(),
                                "categoryField": "time",
                                "graphs": [ {
                                    "id": "g1",
                                    "valueField": "senValue",
                                    "bullet": "round",
                                    "title": "test",
                                    "bulletBorderColor": "#FFFFFF",
                                    "bulletBorderThickness": 2,
                                    "lineThickness": 2,
                                    "lineColor": "#b5030d",
                                    "negativeLineColor": "#0352b5",
                                    "hideBulletsCount": 50
                                } ],
                                "chartCursor": {
                                    "cursorPosition": "mouse"
                                },
                                "categoryAxis": {
                                    "labelRotation": 45,
                                    "minHorizontalGap":'0'
                                }
                            } )


                            function pushNewData(){

                                var newSensorChartValue;
                                $http.get(hostNameService.getHostName()+"/dashboard/getcurrentsensorvalue?assetId=" + $scope.toolId + "&sensorId=" + $scope.sensorInfo)
                                    .then(function (response) {
                                        $scope.newSensorValue = response.data;
                                        newSensorChartValue = $scope.newSensorValue.value;
                                        var newFormattedTime;
                                        if($scope.sensorValue.value == null || $scope.sensorValue.timestamp ==  null){
                                            newFormattedTime = "00:00:00"
                                        }
                                        else{
                                            var newDate = new Date($scope.newSensorValue.timestamp);
                                            var newHours = newDate.getHours();
                                            var newMinutes = "0" + newDate.getMinutes();
                                            var newSeconds = "0" + newDate.getSeconds();
                                            newFormattedTime = newHours + ':' + newMinutes.substr(-2) + ':' + newSeconds.substr(-2);
                                        }

                                        //checking to see if the first time and newFormattedTime are the same or not
                                        if(firstTime == newFormattedTime && (firstTime != null && newFormattedTime != null)){
                                                if(i%30 == 0){
                                                    chart.dataProvider.push( {
                                                        "senValue": newSensorChartValue,
                                                        "time": newFormattedTime
                                                    } );
                                                }else{
                                                    chart.dataProvider.push( {
                                                        "senValue": newSensorChartValue,
                                                        "time": ''
                                                    } );
                                                }

                                        }else{
                                            firstTime = newFormattedTime;
                                            chart.dataProvider.push( {
                                                "senValue": newSensorChartValue,
                                                "time": newFormattedTime
                                            } );
                                        }

                                        chart.validateData();
                                        if( i > 30){
                                            chart.dataProvider.shift();
                                        }
                                    });
                            }
                            setInterval( function() {
                                pushNewData();//calling new values
                                i++;
                            }, $scope.cadence*1000 );
                        });
                }
            });
        });


        //web service to get the tool history
        var toolHistory = function () {
            $http.get(hostNameService.getHostName()+"/dashboard/history/" + $scope.toolId)
                .then(function (response) {
                    $scope.toolsHistory = response.data;}); // Assigning the response from web service
        }

        $scope.init = function() {
            toolDetails();
            toolHistory();
        };

        //refresh tool history
        $('#refreshHistory').click(function () {
            toolHistory();
        })

        //refresh tool details and datapoint snapshot
        $('#refreshSnapshot').click(function () {
            toolDetails();
        })

        $scope.checkToolId = function (asset) {
            if(asset.assetId == $scope.toolId){
                return true;
            }
        };

        //Label for the sensors associated with the assets
        $scope.checkSensorValues = function (curReading, asset) {
            angular.forEach(asset.sensors,function(value,index){
                if(value.sensorId == curReading.sensorId){
                    sensorLabel = true;
                    return sensorLabel;//returning the value label
                }
            })

        };



    }

    writeToolAvailability(data,chart){
        chart.dataProvider = data.tools;
        chart.write('toolAvailability');
        chart.validateData();
    }
    toolsResponse(response){
        this.writeToolAvailability(response.data,this.chart);
    }
}
ToolDetailsCtrl.$inject = ['$scope', '$http', '$stateParams', 'HostNameService'];