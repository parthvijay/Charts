'use strict';
angular.module('ciscoExecDashApp').service('SecurityServ', ['UserServ', function (UserServ) {

        var securityServObj = {};
        var user = {};

        user = UserServ.data;
        

        securityServObj.canAccessTab = function (application, module, tab, subTab, oppPerformance) {
            return true;
            var canAccess = false;
            var tabPerms = user.tab;
            var currentPerm = [application, module, tab, oppPerformance].join('.').toUpperCase();
            if (tabPerms && tabPerms.indexOf(currentPerm) > -1) {
                canAccess = true;
            }
            return canAccess;
        };

        securityServObj.canCreatePipeline = function () {
            var canAccess = false;
            var actionPerms = user.action;
            var currentPerm = 'CREATE_PIPELINE';
            if (actionPerms && actionPerms.indexOf(currentPerm) > -1) {
                canAccess = true;
            }
            return canAccess;
        };

        return securityServObj;
    }
]);