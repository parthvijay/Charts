'use strict';
angular.module('ciscoExecDashApp').service('UserServ', [
    'RestUri',
    '$q',
    'ApiDispatcher',
    '$window',
    'GlobalBookmarkServ',
    'OpportunitiesServ',
    'CiscoUtilities',
     function (restUri, $q, apiDispatcher, $window, GlobalBookmarkServ, opportunitiesServ,CiscoUtilities) {
    	var userServObj = {};
        userServObj.proxyUser = false;

    	var getApiPath = function (key) {
            if (!key) {
                key = 'user';
            }
            var apiPath = restUri.getUri(key);
            if (!apiPath) {
                apiPath = '/user';
            }
            return apiPath;
        };

    	userServObj.getUserData = function () {
            var hasProxy = window.localStorage.getItem('proxy');
            if (hasProxy !== null) {
                userServObj.proxyUser = true;
                userServObj.admin = JSON.parse(window.localStorage.getItem('proxy-admin'));
            }
            if (userServObj.proxyUser) {
                var deferred = $q.defer();
                GlobalBookmarkServ.changeBookmarkActiveFalse();
                apiDispatcher.get(getApiPath('user')).then(function (response) {
                    deferred.resolve(response);
                    userServObj.data = response;
                    opportunitiesServ.getBookmark('favorite').then( function (d) {
                        GlobalBookmarkServ.globalBookmarks = d;
                    });
                }, function (reason) {
                    deferred.reject(reason);
                });
                return deferred.promise;
            }
            if (userServObj.data === undefined) {
                var deferred = $q.defer();
                apiDispatcher.get(getApiPath('user')).then(function (response) {
                    deferred.resolve(response);
                    userServObj.data = response;
                    userServObj.admin = response.user;
                    opportunitiesServ.getBookmark('favorite').then( function (d) {
                        GlobalBookmarkServ.globalBookmarks = d;
                    });
                }, function (reason) {
                    deferred.reject(reason);
                });
                return deferred.promise;
            }
        		
    	};


        userServObj.setProxyUser = function(u) {
            var deferred = $q.defer();
            apiDispatcher.get(getApiPath('search-proxy-user')+'/'+u).then(function (response) {
                deferred.resolve(response);
            }, function (reason) {
                deferred.reject(reason);
            });
            return deferred.promise;
            //userServObj.proxyUser = u;
        };
    	return userServObj;
    }
]);