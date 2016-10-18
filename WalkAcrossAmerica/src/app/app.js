/*
 * @file app.js
 * the controller for main page.
 *
 * @author Jonathan Burk (jburk@foliage.com)
 * @version 0.01
 *
 * Copyright © 2016, Foliage, Inc., part of the Altran Group. All rights reserved.”
 */

// Import SASS file
import '../style/app.scss';
import 'font-awesome/css/font-awesome.css';
import '../../ammap/ammap.css';

// Import JS libraries
import angular from 'angular';
import 'angular-ui-bootstrap/dist/ui-bootstrap-tpls';
import uiRouter from 'angular-ui-router/release/angular-ui-router';
import '../../ammap/ammap.js';
import '../../amcharts/amcharts.js';
import '../../amcharts/serial.js';
import ngStomp from 'ng-stomp/dist/ng-stomp.standalone.min';
import ngMockE2E from 'angular-mocks/ngMockE2E';

// Import app helpers
import routerConfig from './router';
import filters from './filters';
import services from './services';
import directives from './directives';
import controllers from './controllers';

// Import constants, etc.
import constants from './constants'

angular.module(constants.MODULE_NAME, [
  'ui.bootstrap',
  'ui.router',
  'ngStomp',
  'ngMockE2E',
  `${constants.MODULE_NAME}.controllers`,
  `${constants.MODULE_NAME}.filters`,
  `${constants.MODULE_NAME}.services`,
  `${constants.MODULE_NAME}.directives`
]);

angular.module(constants.MODULE_NAME).config(routerConfig);


angular.module(constants.MODULE_NAME).run(['$httpBackend', function($httpBackend) {
    $httpBackend.whenPUT(/\/team/).passThrough();
    $httpBackend.whenGET(/\/team/).passThrough();
    $httpBackend.whenPUT(/\/member/).passThrough();
    $httpBackend.whenGET(/\/member/).passThrough();

}]);

angular.module(constants.MODULE_NAME).controller('AppCtrl', ['$scope', '$state', '$log', '$http', 'HostNameService', 'ContextService', function ($scope, $state, $log, $http, hostNameService, contextService) {

       
        if ($state.current.name == 'app'){
                $state.go("app.admin");
        }else{
            $state.go("app.home");
        }


}]);


controllers();
filters();
directives();
services();
