'use strict';
angular.module('ciscoExecDashApp').controller('BookmarksController', [
	'$rootScope',
	'$scope',
	'GlobalBookmarkServ',
	'OpportunitiesServ', function ($rootScope, $scope, GlobalBookmarkServ, opportunitiesServ) {
        $rootScope.bHideFilterStrip = true;
        $scope.globalBookmarkServ = GlobalBookmarkServ;
        $scope.allBookmarks = GlobalBookmarkServ.allBookmarks;
    }
]);