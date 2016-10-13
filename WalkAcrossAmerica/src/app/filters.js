import angular from 'angular';
import constants from './constants'

export default function() {
  var app = angular.module(`${constants.MODULE_NAME}.filters`, []);

  app.filter("toArray", function() {
    return function(input) {
      if(!input) return;

      if (input instanceof Array) {
        return input;
      }

      return $.map(input, function(val) {
        return val;
      });
    };
  });

  app.filter('myFilter', function () {
    return function (items, search) {
      var result = [];
      angular.forEach(items, function (value, key) {
        angular.forEach(value, function (value2, key2) {
          if (value2 === search) {
            result.push(value2);
          }
        })
      });
      return result;

    }
  });
  app.filter('offset', function() {
    return function(input, start) {
      start = parseInt(start, 10);
      console.log("called here");
      console.log(input);
      return input.slice(start);
    };
  });

}