import AppCtrl from './app-controller'
import AdminCtrl from './admin'
import DashboardCtrl from './dashboard'
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
    });




  $urlRouterProvider.otherwise('/');
}];