import angular from 'angular';
import AdminCtrl from './admin'
import DashboardCtrl from './dashboard'
import AppCtrl from './app-controller'
import HomeCtrl from './home'
import UserCtrl from './userdashboard'
import RegisterCtrl from './registration'
import constants from './constants'


export default function() {
  var app = angular.module(`${constants.MODULE_NAME}.controllers`, []);

  app.controller('AppCtrl', AppCtrl);
  app.controller('AdminCtrl', AdminCtrl);
  app.controller('DashboardCtrl', DashboardCtrl);
  app.controller('HomeCtrl', HomeCtrl);
  app.controller('RegisterCtrl', RegisterCtrl);
  app.controller('UserCtrl', UserCtrl);
}