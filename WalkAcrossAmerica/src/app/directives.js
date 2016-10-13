import angular from 'angular';
import constants from './constants'
import NotImplemented from './directives/not-implemented'

export default function() {
  var app = angular.module(`${constants.MODULE_NAME}.directives`, []);
  app.directive('folNotImplemented', () => new NotImplemented);


  app.directive('toggle', function(){
    return {
      restrict: 'A',
      link: function(scope, element, attrs){
        if (attrs.toggle=="tooltip"){
          $(element).tooltip();
        }
        if (attrs.toggle=="popover"){
          $(element).popover();
        }
      }
    };
  })
}