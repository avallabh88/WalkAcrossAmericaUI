import angular from 'angular';
import AdminCtrl from './admin'
import DashboardCtrl from './dashboard'
import ReportsCtrl from './reports'
import SearchCtrl from './search'
import ManufacturingPlantCtrl from './plant/dashboard'
import CESDashboardCtrl from './ces/dashboard'
import CESToolDetailsCtrl from'./ces/tooldetails'
import ToolDetailsCtrl from './plant/tooldetails'
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
  app.controller('ReportsCtrl', ReportsCtrl);
  app.controller('SearchCtrl', SearchCtrl);
  app.controller('ManufacturingPlantCtrl', ManufacturingPlantCtrl);
  app.controller('ToolDetailsCtrl', ToolDetailsCtrl);
  app.controller('CESDashboardCtrl', CESDashboardCtrl);
  app.controller('CESToolDetailsCtrl', CESToolDetailsCtrl);
  app.controller('HomeCtrl', HomeCtrl);
  app.controller('RegisterCtrl', RegisterCtrl);
  app.controller('UserCtrl', UserCtrl);
}