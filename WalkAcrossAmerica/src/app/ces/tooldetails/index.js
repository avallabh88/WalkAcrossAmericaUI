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
export default class CESToolDetailsCtrl {
    constructor($scope, $http, $stateParams, hostNameService) {

        $scope.toolId = $stateParams.toolID;


        //web service to get the details of the tol based on Id
        var toolDetails = function () {
            $http.get(hostNameService.getHostName()+"/dashboard/tools/" + $scope.toolId)
                .then(function (response) {
                    $scope.toolDetails = response.data;
                    $scope.toolName = $scope.toolDetails.site.assets[0].assetName;
                    $scope.toolImage = "/img/" + $scope.toolDetails.site.assets[0].assetType.assetImagePath; //assigning tool image
                }); // Assigning the response from web service
        }


        //web service for the tool history
        var toolHistory = function () {
            $http.get(hostNameService.getHostName()+"/dashboard/history/" + $scope.toolId)
                .then(function (response) {
                    $scope.toolsHistory = response.data;}); // Assigning the response from web service
        }

        $scope.init = function() {
            toolDetails();
            toolHistory();
        };

        $scope.checkToolId = function (asset) {
            if(asset.assetId == $scope.toolId){
                return true;
            }
        };

        $scope.checkSensorValues = function (curReading, asset) {
            angular.forEach(asset.sensors,function(value,index){
                if(value.sensorId == curReading.sensorId){
                    sensorLabel = true;
                    return sensorLabel;//returning the value label
                }
            })

        };

        //refresh the tool history
        $('#refreshHistory').click(function () {
            toolHistory();
        })

        //refresh the tool details and data point snapshot
        $('#refreshSnapshot').click(function () {
            toolDetails();
        })

    }
}
CESToolDetailsCtrl.$inject = ['$scope', '$http', '$stateParams', 'HostNameService'];