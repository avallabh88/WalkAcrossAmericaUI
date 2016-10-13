import AppCtrl from './app-controller'
import AdminCtrl from './admin'
import DashboardCtrl from './dashboard'
import ReportsCtrl from './reports'
import SearchCtrl from './search'
import ToolDetailsCtrl from './plant/tooldetails'
import CESToolDetailsCtrl from './ces/tooldetails'
import HomeCtrl from './home'
import RegisterCtrl from './registration'
import UserCtrl from './userdashboard'

export default ['$stateProvider', '$urlRouterProvider', ($stateProvider, $urlRouterProvider) => {
  $stateProvider

    .state('app', {
      cache: false,
      url: '/',
      template: require('./app.html'),
      controller: 'AppCtrl',
      controllerAs: 'app'
    })

    .state('app.admin', {
      url: 'admin',
      template: require('./admin/index.html'),
      controller: 'AdminCtrl',
      controllerAs: 'admin'
    })

    .state('app.home', {
      url: 'home',
      template: require('./home/index.html'),
      controller: 'HomeCtrl',
      controllerAs: 'home'
    })

    .state('app.register', {
      url: 'register',
      template: require('./registration/index.html'),
      controller: 'RegisterCtrl',
      controllerAs: 'register'
    })

    .state('app.userdashboard', {
      url: 'userdashboard',
      template: require('./userdashboard/index.html'),
      controller: 'UserCtrl',
      controllerAs: 'user'
    })

    .state('app.dashboard', {
      url: 'dashboard',
      template: require('./dashboard/index.html'),
      controller: 'DashboardCtrl',
      controllerAs: 'dashboard'
    })

    .state('app.reports', {
      url: 'reports',
      template: require('./reports/index.html'),
      controller: 'ReportsCtrl',
      controllerAs: 'reports'
    })

    .state('app.search', {
      url: 'search',
      template: require('./search/index.html'),
      controller: 'SearchCtrl',
      controllerAs: 'search'
    })

    .state('app.plant', {
      url: 'plant/dashboard',
      template: require('./plant/dashboard/index.html'),
      controller: 'ManufacturingPlantCtrl',
      controllerAs: 'manufacturingplant'
    })
    .state('app.tooldetails', {
      url: 'tooldetails/:toolID',
      template: require('./plant/tooldetails/index.html'),
      controller: 'ToolDetailsCtrl',
      controllerAs: 'tooldetails'
    })
    .state('app.ces', {
      url: 'ces/dashboard',
      template: require('./ces/dashboard/index.html'),
      controller: 'CESDashboardCtrl',
      controllerAs: 'cesdashboard'
    })
    .state('app.cestooldetails', {
      url: 'ces/tooldetails/:toolID',
      template: require('./ces/tooldetails/index.html'),
      controller: 'CESToolDetailsCtrl',
      controllerAs: 'cestooldetails'
    });




  $urlRouterProvider.otherwise('/');
}];