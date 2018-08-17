'use strict';
angular.module('ciscoExecDashApp').controller('SalesKitController', ['$uibModalInstance', '$scope', '$http', function ($uibModalInstance, $scope, $http) {

        $scope.ok = function () {
            $uibModalInstance.dismiss('cancel');
        };

        $scope.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        };

        $http.get('config/sales_kit.json').then(function (d) {
            $scope.salesKit = d.data;
        });

        $scope.getRatingPerc = function (c) {
            var r = c.ratings;
            var total = 0;
            for (var i in r) {
                total += r[i];
            }
            var avg = total / r.length;
            return avg * 20;
        };

    }
]);