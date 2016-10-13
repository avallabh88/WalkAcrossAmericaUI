export default class SearchCtrl {
  constructor($scope) {
      $scope.x = 50;
      $scope.y = 60;

      var jq = $('#kv_mark');
      var position = jq.offset();
      $scope.pos = jq.offset();
      alert('x: ' + position.left + ', y: ' + position.top);

      $scope.mainColor = 'red';

      $("#kv_mark").append('<span class="glyphicon glyphicon-oil" id="'+(position.left+100)+'_'+(position.top+100)+'" style="position:absolute;color:green;left:'+(position.left+100)+'px; top:'+(position.top+100)+'px; z-index:2;">');

    $scope.myObj = {
      "position" : "absolute",
      "z-index" : "2",
      "left" : "60px",
      "top" : "250px"
    }

  }


}