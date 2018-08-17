'use strict';
angular.module('ciscoExecDashApp').controller('ActionMetricsController', ['$uibModalInstance','$rootScope','OpportunitiesServ', '$scope', '$http',function ($uibModalInstance,$rootScope,opportunitiesServ,$scope, $http) {
        $scope.ok = function () {
            $uibModalInstance.dismiss('cancel');
        };
        $scope.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        };
        $scope.rows = [];
        var maxRows = 0;
        $scope.getLink = function (title) {
            var linkStr;
            angular.forEach($scope.links, function(value){
                if(value.title === title){
                    linkStr = value.link;
                }
            });
            //This piece of code was giving error so replaced it with above code -G
            // var obj = $filter('filters')($scope.links, {title: title});
            // if (obj.length) {
            //     return obj[0].link;
            // }
            return linkStr;
        };
       $http.get('config/action_metrics_links.json').then(function (c) {
            $scope.links = c.data;
            $scope.actionMetrics = opportunitiesServ.getActionData();
            $scope.metrics = $scope.actionMetrics.metrics;
            $scope.metrics.forEach(function (e) {
                maxRows = e.rows.length > maxRows ? e.rows.length : maxRows;
            });
            for (var i = 0; i < maxRows; i++) {
                $scope.rows.push(i);
            }
    });
        }
]);
