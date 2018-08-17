'use strict';
angular.module('ciscoExecDashApp').controller('ProxyUserController', ['$scope', 'UserServ', '$window', '$sessionStorage', '$cookies', 'CiscoUtilities','FiltersServ', function ($scope, UserServ, $window, $sessionStorage, $cookies, CiscoUtilities, filtersServ) {

    $scope.useProxy = function () {
        if (!$scope.userId) {
            return;
        }
        UserServ.setProxyUser($scope.userId).then(function (res) {
            $scope.proxyUser = res;
        }, 
        function (err) {
            $scope.proxyUser = false;
        });
    };

    var resetFilters = function () {
        var i = sessionStorage.length;
        while(i--) {
            var key = sessionStorage.key(i);
            sessionStorage.removeItem(key);
        }
    }

    if (UserServ.admin === undefined) {
        UserServ.getUserData();
    }


    $scope.proxyLogin = function () {
        resetFilters();
        CiscoUtilities.setGlobalParam(false);
        // filtersServ.globalView =  false;
        UserServ.proxyUser = true;
        // $window.isProxy = $scope.proxyUser;
        window.localStorage.setItem('proxy', $scope.proxyUser.userid);
        window.localStorage.setItem('proxy-admin', JSON.stringify(UserServ.admin));
    };
}
]);