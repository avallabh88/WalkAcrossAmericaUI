/**
 * Created by avallabhaneni on 10/12/2016.
 */
import constants from '../constants'
import angular from 'angular';

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

        $http({
            method: 'GET',
            url: 'http://localhost:8081/hello/',
            headers: {
                'Content-Type': 'application/json'
            }

        }).then(
            function(response){
                console.log("The response from hello is:" + response);
            },
            function(response){
                console.log("The error response from hello is:" + response);
            }
        );

        $http.get(hostNameService.getHostName()+"/hello/")
            .then(function (response) {console.log("The response from hello is:" + response)});

        $scope.addNewTeam = function() {//function to add new team
            var    method = "PUT";
            var    url = hostNameService.getHostName() + "/team/";
            var data = {
                name: $scope.teamname,
                description: $scope.teamdescription
            };
            $http({
                method : method,
                url : url,
                data : data,
                headers : {
                    'Content-Type' : 'application/json'
                }
            }).then(
                function(response){
                    $scope.message= 'New team has been added successfully.'
                    $('#successmessageDiv').show();
                },
                function(response){
                    $scope.message= 'Error in creating a new team.'
                    $('#errorMessageDiv').show();
                }
            );

        }


        var cities = [
            {
                city : 'New York',
                desc : 'This city is aiiiiite!',
                lat : 40.6700,
                long : -73.9400,
                image : 'https://developers.google.com/maps/documentation/javascript/examples/full/images/beachflag.png'
            },
            {
                city : 'Chicago',
                desc : 'This is the second best city in the world!',
                lat : 41.8819,
                long : -87.6278,
                image : 'https://developers.google.com/maps/documentation/javascript/examples/full/images/beachflag.png'
            },
            {
                city : 'Los Angeles',
                desc : 'This city is live!',
                lat : 34.0500,
                long : -118.2500,
                image : 'https://developers.google.com/maps/documentation/javascript/examples/full/images/beachflag.png'
            },
            {
                city : 'Las Vegas',
                desc : 'Sin City...\'nuff said!',
                lat : 36.0800,
                long : -115.1522,
                image : 'https://developers.google.com/maps/documentation/javascript/examples/full/images/beachflag.png'
            }
        ];

        var mapOptions = {
            zoom: 5,
            center: new google.maps.LatLng(40.0000, -98.0000),
            mapTypeId: google.maps.MapTypeId.TERRAIN
        }

        $scope.map = new google.maps.Map(document.getElementById('usermap'), mapOptions);

        $scope.markers = [];

        var infoWindow = new google.maps.InfoWindow();
        var image = 'https://developers.google.com/maps/documentation/javascript/examples/full/images/beachflag.png';

        var createMarker = function (info){

            var marker = new google.maps.Marker({
                map: $scope.map,
                position: new google.maps.LatLng(info.lat, info.long),
                title: info.city,
                icon: info.image
            });
            marker.content = '<div class="infoWindowContent">' + info.desc + '</div>';

            google.maps.event.addListener(marker, 'click', function(){
                infoWindow.setContent('<h2>' + marker.title + '</h2>' + marker.content);
                infoWindow.open($scope.map, marker);
            });

            $scope.markers.push(marker);

        }

        for (var i = 0; i < cities.length; i++){
            createMarker(cities[i]);
        }

        $scope.openInfoWindow = function(e, selectedMarker){
            e.preventDefault();
            google.maps.event.trigger(selectedMarker, 'click');
        }

    }
}
UserCtrl.$inject = ['$scope', '$http', '$state','HostNameService'];