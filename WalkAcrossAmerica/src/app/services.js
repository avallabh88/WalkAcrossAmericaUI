import angular from 'angular';
import constants from './constants'
import DashboardService from './dashboard/dashboardservice'
import ContextService from './dashboard/contextservice'
import HostNameService from './dashboard/hostname'
import SiteService from './dashboard/siteservice'

export default function() {
  var app = angular.module(`${constants.MODULE_NAME}.services`, []);

  app.service('DashboardService', DashboardService);
  app.service('ContextService', ContextService);
  app.service('HostNameService', HostNameService);
  app.service('SiteService', SiteService);
}