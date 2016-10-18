/**
 * Created by avallabhaneni on 10/12/2016.
 */
import constants from '../constants'

export default class UserCtrl {

    constructor($scope, $http, $state, hostNameService) {

        $('#successmessageDiv').hide();
        $('#errorMessageDiv').hide();
        $scope.team = [];
        $scope.form = {
            name : "",
            description : ""
        };

        $('#closeSuccessMessage').click(function () {
            $('#successmessageDiv').hide();
        });

        $('#closeErrorMessage').click(function () {
            $('#errorMessageDiv').hide();
        });


        //initializing the values on the form
        $scope.init = function() {
            teamLocations();
        };


        //function to plot the teams on the map based on the number of steps ccovered
        var teamLocations = function () {
            $http({
                method : 'GET',
                url : hostNameService.getHostName() + "/team/locations",
                headers : {
                    'Content-Type' : 'application/json',
                }
            }).then(
                function(response){
                    $scope.teamLocations = response.data;

                    var mapOptions = {
                        zoom: 5,
                        center: new google.maps.LatLng(40.0000, -98.0000),
                        mapTypeId: google.maps.MapTypeId.TERRAIN
                    }

                    $scope.map = new google.maps.Map(document.getElementById('map'), mapOptions);

                    $scope.markers = [];

                    var pointA = new google.maps.LatLng(42.491796, -71.2282649),
                        pointB = new google.maps.LatLng(37.7749295, -122.4194155),
                    // Instantiate a directions service.
                        directionsService = new google.maps.DirectionsService,
                        directionsDisplay = new google.maps.DirectionsRenderer({
                            map: $scope.map
                        }),
                        markerA = new google.maps.Marker({
                            position: pointA,
                            title: "point A",
                            label: "A",
                            map: $scope.map
                        }),
                        markerB = new google.maps.Marker({
                            position: pointB,
                            title: "point B",
                            label: "B",
                            map: $scope.map
                        });

                    //calculateAndDisplayRoute(directionsService, directionsDisplay, pointA, pointB);

                    var infoWindow = new google.maps.InfoWindow();
                    var image = 'https://developers.google.com/maps/documentation/javascript/examples/full/images/beachflag.png';

                    var createMarker = function (info){
                        var marker = new google.maps.Marker({
                            map: $scope.map,
                            position: new google.maps.LatLng(info.latitude, info.longitude),
                            title: info.teamName,
                            icon: {
                                path: google.maps.SymbolPath.CIRCLE,
                                strokeColor: info.teamColor,
                                scale: 6
                            },
                        });
                        marker.content = '<div class="infoWindowContent">' + "Total Steps:" +info.totalStepCount + '</div>';

                        google.maps.event.addListener(marker, 'click', function(){
                            infoWindow.setContent('<h2>' + marker.title + '</h2>' + marker.content);
                            infoWindow.open($scope.map, marker);
                        });
                        infoWindow.setContent('<h2>' + marker.title + '</h2>' + marker.content);
                        infoWindow.open($scope.map, marker);

                        $scope.markers.push(marker);
                    }


                    var createMilestone = function (info){
                        var milestone = new google.maps.Marker({
                            map: $scope.map,
                            position: new google.maps.LatLng(info.latitude, info.longitude),
                            title: 'Milestone',
                            icon: {
                                path: google.maps.SymbolPath.BACKWARD_CLOSED_ARROW,
                                scale: 1
                            },
                        });
                        google.maps.event.addListener(milestone, 'click', function(){
                            infoWindow.setContent('<h2>' + marker.title);
                            infoWindow.open($scope.map, milestone);
                        });

                        $scope.markers.push(milestone);
                    }

                    for (var i = 0; i < $scope.teamLocations.length; i++){
                        createMarker($scope.teamLocations[i]);
                    }

                    //web service returning milestones
                    $http({
                        method : 'GET',
                        url : hostNameService.getHostName() + "/team/tracks",
                        headers : {
                            'Content-Type' : 'application/json',
                        }
                    }).then(
                        function(response) {
                            $scope.teamTracks = response.data;
                            for (var i = 0; i < $scope.teamTracks.length; i++){
                                createMilestone($scope.teamTracks[i]);
                            }
                        },
                        function(response) {

                        }
                    );


                    $scope.openInfoWindow = function(e, selectedMarker){
                        e.preventDefault();
                        google.maps.event.trigger(selectedMarker, 'click');
                    }

                    //the following function can be called when we want to show the direction from start to end point
                    // function calculateAndDisplayRoute(directionsService, directionsDisplay, pointA, pointB) {
                    //     directionsService.route({
                    //         origin: pointA,
                    //         destination: pointB,
                    //         travelMode: google.maps.TravelMode.BICYCLING
                    //     }, function(response, status) {
                    //         if (status == google.maps.DirectionsStatus.OK) {
                    //             directionsDisplay.setDirections(response);
                    //         } else {
                    //             window.alert('Directions request failed due to ' + status);
                    //         }
                    //     });
                    // }

                },
                function(response){

                }
            );
        }









    }
}
UserCtrl.$inject = ['$scope', '$http', '$state','HostNameService'];