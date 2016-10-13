import version from './version';

export default class AppCtrl {
  constructor($http) {
    this.versions = [
      {
        description: 'VueForge™ Demonstrator',
        version: version.version
      }
    ];
  }
}

AppCtrl.$inject = ['$http'];