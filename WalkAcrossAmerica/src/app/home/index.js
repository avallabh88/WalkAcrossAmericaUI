/**
 * Created by avallabhaneni on 10/11/2016.
 */
import constants from '../constants'
import angular from 'angular';

export default class HomeCtrl {

    constructor($scope, $http, $state, hostNameService) {

        $('#successmessageDiv').hide();
        $('#errorMessageDiv').hide();
        $scope.team = [];
        $scope.members = [];
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
        
        var memberTeams = function () {
            $http({
                method : 'GET',
                url : hostNameService.getHostName() + "/team/",
                headers : {
                    'Content-Type' : 'application/json',
                }
            }).then(
                function(response){
                    $scope.teams = response.data;
                },
                function(response){

                }
            );
        }


        //initializing the values on the form
        $scope.init = function() {
            memberTeams();
        };


        //web service call to add a new team
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
                    $scope.teamname = '';
                    $scope.teamdescription = '';
                },
                function(response){
                    $scope.message= 'Error in creating a new team.'
                    $('#errorMessageDiv').show();
                }
            );

        }

        $('#teamMemberSelect').on('change', function() {
            var teamId= $(this).find("option:selected").val();
            $scope.teamIdSelected = teamId;
        });

        $('#teamMemberStepsSelect').on('change', function() {
            var memberID= $(this).find("option:selected").val();
            $scope.memberIDSelected = memberID;
        });


        $('#teamStepsSelect').on('change', function() {
            var teamId= $(this).find("option:selected").val();
            $scope.teamIdSelected = teamId;
            var    method = "GET";
            var    url = hostNameService.getHostName() + "/team/" + $scope.teamIdSelected + "/members";
            $http({
                method : method,
                url : url,
                headers : {
                    'Content-Type' : 'application/json',
                }
            }).then(
                function(response){
                    $scope.members = response.data;
                    console.log("The team members are:" +$scope.members);
                },
                function(response){

                }
            );
        });

        //web service to add new member to the Team
        $scope.addNewTeamMember = function() {//function to add new team
            var    method = "PUT";
            var    url = hostNameService.getHostName() + "/team/" + $scope.teamIdSelected + "/member";
            var data = {
                firstName: $scope.firstname,
                lastName: $scope.lastname,
                birthDate: '1986-10-12',
                phone: '8888888888',
                emailId: $scope.emailaddress,
                isActive: true,
                role: 'TEAM_MEMBER'

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
                    $scope.message= 'New team member has been added successfully.'
                    $('#successmessageDiv').show();
                    $scope.firstname = '';
                    $scope.lastname = '';
                    $scope.emailaddress = '';

                },
                function(response){
                    $scope.message= 'Error in creating a new team member.'
                    $('#errorMessageDiv').show();
                }
            );

        }

        //web service to add steps to the team
        $scope.addTeamSteps = function() {//function to add new team
            var    method = "PUT";
            var    url = hostNameService.getHostName() + "/member/" + $scope.memberIDSelected + "/step";
            var data = {
                stepCount: $scope.steps,
                startDateTime: '1986-10-12T12:12:12',
                endDateTime: '1986-10-12T12:12:12'
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
                    $scope.message= 'Steps have been added to the member'
                    $('#successmessageDiv').show();
                },
                function(response){
                    $scope.message= 'Error in adding steps.'
                    $('#errorMessageDiv').show();
                }
            );

        }

        //refreshing the teams in the add members panel
        //refresh tool history
        $('#refreshTeams').click(function () {
            memberTeams();
        })


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

        $scope.map = new google.maps.Map(document.getElementById('map'), mapOptions);

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
HomeCtrl.$inject = ['$scope', '$http', '$state','HostNameService'];