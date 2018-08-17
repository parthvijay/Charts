'use strict';
angular.module('ciscoExecDashApp').service('GlobalBookmarkServ', [
    '$location',
    'RestUri',
    'ApiDispatcher',
    '$routeParams',
    '$route',
    '$rootScope',
    'FiltersServ',
    'CiscoUtilities',
    '$q',
    '$sessionStorage', function ($location, restUri, apiDispatcher, $routeParams, $route, $rootScope, filtersServ, CiscoUtilities, $q, $sessionStorage) {

        var GlobalBookmarkServ = {};
        var bookmarkActive = false;

        GlobalBookmarkServ.activeBookmark="";
        GlobalBookmarkServ.bookmark = null;

        GlobalBookmarkServ.isBookmarkActive = function () {
            return bookmarkActive;
        };

        GlobalBookmarkServ.changeBookmarkActiveFalse = function (type) {
            if(type !== 'ciscoOne'){
                bookmarkActive = false;
            }
            return bookmarkActive;
        };

        GlobalBookmarkServ.changeBookmarkActive = function () {
            bookmarkActive = true;
            return bookmarkActive;
        };

        GlobalBookmarkServ.isCollabBookmarkActive = function(){
            if(GlobalBookmarkServ.isBookmarkActive()
                && GlobalBookmarkServ.bookmark
                && GlobalBookmarkServ.bookmark != null
                && GlobalBookmarkServ.bookmark.urlDetails
                && GlobalBookmarkServ.bookmark.urlDetails.isCollab){
                return true;
            }
        };

        var getApiPath = function(key) {
            if (!key) {
                key = 'opportunities';
            }
            var apiPath = restUri.getUri(key);
            return apiPath;
        };

        GlobalBookmarkServ.setRecentBookmark = function(bookmark) {
            var defered = $q.defer();
            apiDispatcher.get(getApiPath('setRecent-bookmark') + bookmark.id).then(function(res){
                defered.resolve(res);
            },
            function(err){
                defered.reject(err);
            });
            return defered.promise;
        };


        GlobalBookmarkServ.selectBookmark = function (bookmark, load) {
            GlobalBookmarkServ.bookmark = bookmark;
            GlobalBookmarkServ.addingHttp(bookmark);
            if(bookmark.urlDetails && bookmark.urlDetails.appUrl && bookmark.urlDetails.appUrl === "/sales/analysis/all"){
                bookmark.urlDetails.appUrl = "/sales/analysis/refresh/ldos";
            }
            if(isValidByDate(bookmark) !== true){   //Changes for DE133044
            if (load === 'redirect' || (($location.url() === '/bookmarks') || ($location.url() === '/view-account/refresh') || ($location.url() ==='/view-account/renew') || ($location.url() ==='/view-account/attach'))) {
                //$location.path(bookmark.urlDetails.appUrl+'/'+bookmark.id+'?bkmark='+bookmark.hashId);
                $location.path(bookmark.urlDetails.appUrl);
            }
            bookmarkActive = true;
            GlobalBookmarkServ.activeBookmark = bookmark.name;
            GlobalBookmarkServ.setRecentBookmark(bookmark);
            $sessionStorage.put('bookmarkSelected',JSON.stringify(GlobalBookmarkServ));//store selected bookmark in session

            if (load !== 'redirect') {
                if (window.location.hash === '#/bookmarks') {
                    return;
                } else {
                    if ($location.path() === bookmark.urlDetails.appUrl) {
                        $rootScope.$broadcast('apply-bookmark');
                    } else if($location.path().includes(bookmark.urlDetails.appUrl)){
                        return;
                   } else {
                        $location.path(bookmark.urlDetails.appUrl);
                    }
                }
            }
            }
        };
        //adding http:// incase older URl doesn't have http:// for redirecting.
        //Note:- Link won't rediect to exact page if http:// is missing -G
        GlobalBookmarkServ.addingHttp = function(bookmark){
            if(bookmark && bookmark.urlDetails){
                if(bookmark.urlDetails.salesHub
                    && ((bookmark.urlDetails.salesHub.substring(0,4)).toLowerCase()) !== "http") {
                        bookmark.urlDetails.salesHub = "http://"+bookmark.urlDetails.salesHub;
                }
                if(bookmark.urlDetails.additionalInfo
                    && ((bookmark.urlDetails.additionalInfo.substring(0,4)).toLowerCase()) !== "http"){
                        bookmark.urlDetails.additionalInfo = "http://"+bookmark.urlDetails.additionalInfo;
                }
            }
        }

        //Changes for DE133044
        var isValidByDate = function (bookmark) {
            var todaysDate = new Date();
            if (new Date(bookmark.startDate) <= todaysDate && (bookmark.endDate === null || new Date(bookmark.endDate) >= todaysDate))
                return false;
            return true;
        };

        GlobalBookmarkServ.clearBookmark = function (d) {
            if (d === 'otherTab') {
                //do nothing
            } else {
                $sessionStorage.remove("appliedFilters");
                $sessionStorage.remove("advancedFilters");
                $sessionStorage.remove("bookmarkSelected");
                if(!filtersServ.toggleInBookmark){
                    filtersServ.globalView = false;
                    CiscoUtilities.setGlobalParam(false);
                }
                GlobalBookmarkServ.bookmark = null;
                var queryParameter = $location.path().split('?');
                if (queryParameter.length > 1) {
                    $location.url(queryParameter[0]);
                } else {
                    if ($location.$$search.bkmark !== undefined) {
                        $location.url($location.path());
                    } else {
                        $route.reload();
                    }
                }

            }
            bookmarkActive = false;
        };

        GlobalBookmarkServ.getBookmarkName = function(){
            if(GlobalBookmarkServ.isBookmarkActive()){
                return GlobalBookmarkServ.bookmark.name;
            } else {
                return;
            }
        };

        GlobalBookmarkServ.checkSelectedBookMark = function(){
            GlobalBookmarkServ.activeBookmark = JSON.parse($sessionStorage.get('bookmarkSelected')).activeBookmark;
            GlobalBookmarkServ.bookmark = JSON.parse($sessionStorage.get('bookmarkSelected')).bookmark;
            GlobalBookmarkServ.changeBookmarkActive();
            return GlobalBookmarkServ;
        };

        return GlobalBookmarkServ;
    }
]);
