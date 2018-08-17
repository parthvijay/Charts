/*jshint sub:true*/
'use strict';
angular.module('ciscoExecDashApp').factory('BookMarkData', [
    'ApiDispatcher',
     '$rootScope',
     '$q',
     '$http',
     'RestUri',
     'UserServ',
     'GlobalBookmarkServ',
     function (apiDispatcher, $rootScope, $q, $http, restUri, UserServ, GlobalBookmarkServ) {

    var data = {};
    // var currentId = 4;
    var ActiveBookmark = 1;
    var isListView = false;
    var currentBookmark = null;

    var type = {
        "MyBookmark": 1,
        "FavouriteBookmark": 2,
        "SharedBookmark": 3,
         //DE134056- Arun
        "GlobalBookmark": 4,
        "RecentBookmark": 5
    };

    var typeLabel={
        "1": "My Bookmarks",
        "2": "Favorite Bookmarks",
        "3": "Shared with Me",

        "4": "Global Bookmarks"
    };

    var getApiPath = function(key) {
        if (!key) {
            key = 'opportunities';
        }
        var apiPath = restUri.getUri(key);
        return apiPath;
    };

    return {
        setCurrentBookmark:function(bookmark){
            currentBookmark = bookmark;
        },
        getCurrentBookmark:function(){
            return currentBookmark;
        },
        typesOfBookmark:function(){
            return type;
        },
        getLabelForAllBookmarks:function(){
            return typeLabel;
        },
        getBookmarkView: function () {
            return isListView;
        },
        getMergeData:function(){
            var mergerData = [];
            //mergerData = this.getBookMarkData(type.AllBookmark).concat(this.getBookMarkData(type.SharedBookmark));
            return mergerData;
        },
        getSearchedBookmark: function(searchText, searchIn){
            var bookmarkType;
            switch(searchIn){
                case type.MyBookmark:
                    bookmarkType = "mybookmarks";
                    break;
                case type.FavouriteBookmark:
                    bookmarkType = "favorite";
                    break;
                case type.SharedBookmark:
                    bookmarkType = "shared";
                    break;
                case type.GlobalBookmark:
                    bookmarkType = "global";
                    break;
            }
            if (searchIn === undefined) {
                bookmarkType = null;
            }
            var typeSearch = 'starts';
            if(searchText.length > 2) {
                typeSearch = 'contains';
            }
            var defered = $q.defer();
            apiDispatcher.post(getApiPath('search-bookmark'), {
                name: searchText,
                searchType: typeSearch,
                bookmarkType: bookmarkType
            }).then(function(res){
                defered.resolve(res);
            },
            function(err){
                defered.reject(err);
            });
            return defered.promise;
        },
        setBookmarkView: function (value) {
            var defered = $q.defer();
            isListView = value;
            defered.resolve(isListView);
            return defered.promise;
        },
        getBookMarkData: function (typeOfBookmark) {
            var bookmarkType;
            switch(typeOfBookmark){
                case type.MyBookmark:
                    bookmarkType = "mybookmarks";
                    break;
                case type.SharedBookmark:
                    bookmarkType = "shared";
                    break;
                case type.FavouriteBookmark:
                    bookmarkType = "favorite";
                    break;
                case type.GlobalBookmark:
                    bookmarkType = "global";
                    break;
                case type.RecentBookmark:
                    bookmarkType = "recent";
                    break;
            }
            var deferred = $q.defer();
            var url = getApiPath('bookmark');
            apiDispatcher.get(url+bookmarkType).then(function(response) {
                deferred.resolve(response);
            }, function(reason) {
                deferred.reject(reason);
            });
            return deferred.promise;
        },
        getActiveBookmark: function () {
            return ActiveBookmark;
        },
        getDefaultBookmarkTypes: function () {
            return type;
        },
        setActiveBookmark: function (bookmarkType) {
            var defered = $q.defer();
            ActiveBookmark = bookmarkType;
            defered.resolve(ActiveBookmark);
            return defered.promise;
        },
        getBookmarkById: function(bookmark) {
            var defered = $q.defer();
            apiDispatcher.get(getApiPath('bookmark-by-id')+bookmark.id+'?hashId='+bookmark.hashId).then(function(res){
                defered.resolve(res);
            },
            function(err){
                defered.reject(err);
            });
            return defered.promise;
        },
        setBookMarkData: function () {
            var url = getApiPath('bookmark');
            $q.all([
                apiDispatcher.get(url+'mybookmarks'),
                apiDispatcher.get(getApiPath('count')),
            ]).then(function(responses) {
                data["allBookmarks"]=responses[0].bookmarks;
                GlobalBookmarkServ.allBookmarks = responses[0];
                GlobalBookmarkServ.count = responses[1];
                ActiveBookmark = type["MyBookmark"];
                $rootScope.$broadcast("bookmarkAdded");
            });
        },
        getbookmarkCount: function() {
            var defered = $q.defer();
            apiDispatcher.get(getApiPath('count')).then(function(res){
                GlobalBookmarkServ.count = res;
                defered.resolve(GlobalBookmarkServ.count);
            },
            function(err){
                defered.reject(err);
            });
            return defered.promise;
        },
        removeShare: function(bookmarkId) {
            var defered = $q.defer();
            apiDispatcher.get(getApiPath('remove-share')+bookmarkId).then(function(res){
                defered.resolve(res);
            },
            function(err){
                defered.reject(err);
            });
            return defered.promise;
        },
        getMailer: function(user){
            var defered = $q.defer();
            apiDispatcher.post(getApiPath('search-mailer'), {
                mailerName: user.userName,
                level: user.level,
                id: user.id
            }).then(function(res){
                defered.resolve(res);
            },
            function(err){
                defered.reject(err);
            });
            return defered.promise;
        },
        getNewShareUsers:function(key){
            var typeSearch = 'starts';
            if(key.length > 2) {
                typeSearch = 'contains';
            }
            var defered = $q.defer();
            apiDispatcher.get(getApiPath('search-user')+typeSearch+'&searchName='+key).then(function(res){
                defered.resolve(res);
            },
            function(err){
                defered.reject(err);
            });
            return defered.promise;
        },
        getBookMark: function (bookmark) {
            return bookmark;
        },
        shareBookmarkWithOthers: function(bookmark, sharingData){
            var defered = $q.defer();
            apiDispatcher.post(getApiPath('share-bookmark'), {
                bookmarkName: bookmark.name ? bookmark.name : null,
                bookmarkId: bookmark.id ? bookmark.id : null,
                recepeints: sharingData.recepeints,
                msg: sharingData.msg,
                url: sharingData.url,
                userName: sharingData.userName
            }).then(function(res){
                defered.resolve(res);
            },
            function(err){
                defered.reject(err);
            });
            return defered.promise;
        },
        addNewBookmark: function (bookmark, userName){
            var urlToSend = {
                    appUrl : bookmark.from,
                    additionalInfo : bookmark.urlDetails.additionalInfo,
                    currentDashboardView: bookmark.currentDashboardView,
                    view : bookmark.fromSubTabTitle,
                    salesHub : bookmark.urlDetails.salesHub ? bookmark.urlDetails.salesHub : null
                };
            urlToSend = JSON.stringify(urlToSend);
            // Change for DE145414
            if(bookmark.filterData !== undefined){
                bookmark.filterData[1][2].disabled = [];
                var collabDateEdit = bookmark.filterData[1][4];
                collabDateEdit.categories[1].isRangeFrom = false;
                collabDateEdit.categories[1].isRangeTo = false;
                collabDateEdit.categories[1].isPeriod = false;
                collabDateEdit.categories[1].isDirection = false;
                bookmark.filterData[1][4] = collabDateEdit;
            }
            bookmark.filterData = JSON.stringify(bookmark.filterData);
            var defered = $q.defer();
            var url = getApiPath('saveBookmark');
            var isGlobalBookmark;
            var isPublicBookmark;
            var isRegional;
            //for global
            if(bookmark.isGlobal && bookmark.isGlobal === true){
                isGlobalBookmark = "Y";
            } else{
                isGlobalBookmark = "N";
            }
            //for public
            if(bookmark.isPublic && bookmark.isPublic === true){
                isPublicBookmark = "Y";
            } else{
                isPublicBookmark = "N";
            }
            //for regional
            if (bookmark.isRegional && bookmark.isRegional === true) {
                isRegional = 'Y';
            } else {
                isRegional = 'N';
            }
            var d1 = bookmark.startDate.getDate();
            var m1 = bookmark.startDate.getMonth() + 1;
            var y1 = bookmark.startDate.getFullYear();
            var endDate;
            if (bookmark.endDate !== null) {
                var d2 = bookmark.endDate.getDate();
                var m2 = bookmark.endDate.getMonth() + 1;
                var y2 = bookmark.endDate.getFullYear();
                endDate = y2 + '-' + (m2<=9 ? '0' + m2 : m2) + '-' + (d2 <= 9 ? '0' + d2 : d2);
            } else {
                endDate = null;
            }
            var d = new Date();
            // var timestamp = d.getHours()+":"+d.getMinutes()+":"+d.getSeconds()+"."+d.getMilliseconds();
            apiDispatcher.post(url, {
                userName : userName,
                bookmarkName : bookmark.name ? bookmark.name : null,
                description : bookmark.description ? bookmark.description : null,
                filter : bookmark.filterData ? bookmark.filterData : null,
                urlDetails : urlToSend,
                isGlobal : isGlobalBookmark,
                isRegional: isRegional,
                isPublic : isPublicBookmark,
                startDate : y1 + '-' + (m1<=9 ? '0' + m1 : m1) + '-' + (d1 <= 9 ? '0' + d1 : d1),
                endDate : endDate
            }).then(function(response) {
                defered.resolve(response);
            }, function(reason) {
                defered.reject(reason);
            });
            return defered.promise;
        },
        deleteBookmark: function (bookmarkId,activetype) {
            var defered = $q.defer();
            var isShared;
            if (activetype === 2) {
                isShared = 'Y';
            } else {
                isShared = 'N';
            }
            var url = getApiPath('delete-bookmark');
            apiDispatcher.delete(url + bookmarkId + '?shared=' + isShared).then(function(response) {
                defered.resolve(response);
            }, function(reason) {
                defered.reject(reason);
            });
            return defered.promise;
        },
        getBookMarkAtIndex: function (arr,index) {
            var bookmark = arr[index];
            return bookmark || {};
        },
        updateBookmark: function(bookmark){
            var urlToSend = {
                    appUrl : bookmark.urlDetails.appUrl,
                    additionalInfo : bookmark.urlDetails.additionalInfo,
                    currentDashboardView: bookmark.urlDetails.currentDashboardView,
                    view : bookmark.urlDetails.view,
                    salesHub : bookmark.urlDetails.salesHub ? bookmark.urlDetails.salesHub : null
                };
            urlToSend = JSON.stringify(urlToSend);
            bookmark.filterData = JSON.stringify(bookmark.filterData);
            var defered = $q.defer();
            var url = getApiPath('update-bookmark');
            var isGlobalBookmark;
            var isPublicBookmark;
            var isRegional;
            if(bookmark.isGlobal && bookmark.isGlobal === true){
                isGlobalBookmark = "Y";
            } else{
                isGlobalBookmark = "N";
            }
            //for public
            if(bookmark.isPublic && bookmark.isPublic === true){
                isPublicBookmark = "Y";
            } else{
                isPublicBookmark = "N";
            }
            //for regional
            if (bookmark.isRegional && bookmark.isRegional === true) {
                isRegional = 'Y';
            } else {
                isRegional = 'N';
            }
            var d1 = bookmark.startDate.getDate();
            var m1 = bookmark.startDate.getMonth() + 1;
            var y1 = bookmark.startDate.getFullYear();
            var endDate;
            if (bookmark.endDate !== null) {
               var d2 = bookmark.endDate.getDate();
                var m2 = bookmark.endDate.getMonth() + 1;
                var y2 = bookmark.endDate.getFullYear();
                endDate = y2 + '-' + (m2<=9 ? '0' + m2 : m2) + '-' + (d2 <= 9 ? '0' + d2 : d2);
            } else {
                endDate = null;
            }
            var d = new Date();
            // var timestamp = d.getHours()+":"+d.getMinutes()+":"+d.getSeconds()+"."+d.getMilliseconds();
            apiDispatcher.post(url+bookmark.id, {
                userName : bookmark.createdBy,
                bookmarkName : bookmark.name ? bookmark.name : null,
                description : bookmark.description ? bookmark.description : null,
                filter : bookmark.filterData ? bookmark.filterData : null,
                urlDetails : urlToSend,
                isGlobal : isGlobalBookmark,
                isRegional: isRegional,
                isPublic : isPublicBookmark,
                startDate : y1 + '-' + (m1<=9 ? '0' + m1 : m1) + '-' + (d1 <= 9 ? '0' + d1 : d1),
                endDate : endDate
            }).then(function(response) {
                defered.resolve(response);
            }, function(reason) {
                defered.reject(reason);
            });
            return defered.promise;
        }
    };
}
]);




angular.module('ciscoExecDashApp').factory('Bookmark',[
    'BookMarkData',
     '$rootScope',
     'UserServ',
     '$q',
     'ApiDispatcher',
     'RestUri',
    function (BookMarkData, $rootScope, UserServ, $q, apiDispatcher, restUri) {

    function Bookmark(bookmarkData) {
        if (bookmarkData) {
            this.setData(bookmarkData);
        } else {
            this.setDefaultData();
        }
    }

    var getApiPath = function(key) {
        if (!key) {
            key = 'opportunities';
        }
        var apiPath = restUri.getUri(key);
        return apiPath;
    };

    Bookmark.prototype = {
        setData: function (bookmarkData) {
            angular.extend(this, bookmarkData);
        },
        setDefaultData: function () {
            this.urlDetails = {};
            this.createdBy = '';
            this.startDate = new Date();
            this.endDate = null;
            this.urlDetails.salesHub = "";
            this.urlDetails.definition = "";
            this.urlDetails.additionalInfo = "";
            this.from = 'sales/analysis/asset';
            this.isPublic = false;
            this.isRegional = false;
            this.currentDashboardView = true;
            this.fromSubTabTitle = "";
            this.fromMainTabTitle = "";
        },
        getShareUser: function () {
            return this.shareFriendsData || [];
        },
        addShareUsers: function (shareUsers) {
            this.shareFriendsData = this.shareFriendsData.concat(shareUsers);
        },
        deleteShareUser: function (shareUserID) {
            if (this.shareFriendsData !== undefined && this.shareFriendsData.length >= 1) {
                var index = this.getIndexFromArray(shareUserID, "id", this.shareFriendsData);
                if (index !== -1) {
                    this.shareFriendsData.splice(index, 0);
                }
            }
            return true;
        },
        getFiltersData: function () {
            return this.filterData || [];
        },
        setFilterData: function (filterdata) {
            this.filterData = filterdata;
        },
        setFavouriteBookmark: function (bookmark) {
            //bookmark.isFavourite = !bookmark.isFavourite;
            var favYorn = 'Y';
            if (bookmark.isFavourite) {
                favYorn = 'N';
            }
            var defered = $q.defer();
            apiDispatcher.get(getApiPath('favorite-bookmark') + bookmark.id + '?favYorn=' + favYorn).then(function(res){
                defered.resolve(res);
            },
            function(err){
                defered.reject(err);
            });
            return defered.promise;
        },
        getShowStatusAccToRecentPrevious:function(key){
            return key==='Recent'?this.isRecent:!this.isRecent;
        },
        getIndexFromArray: function (value, key, arr) {
            var index = -1;
            var filteredObj = arr.find(function (item, i) {
                if (item[key] === value) {
                    index = i;
                    return i;
                }
            });
            return index;
        },
        checkBookmarkAction:function(actionType){
            var bookmarkActionType = BookMarkData.typesOfBookmark();
            var flag = false;
            switch (actionType) {
                    case bookmarkActionType.AllBookmark:
                        flag = true;
                        break;
                    case bookmarkActionType.SharedBookmark:
                        flag = this.shared?true:false;
                        break;
                    case bookmarkActionType.FavouriteBookmark:
                        flag = this.isFavourite?true:false;
                        break;
                }
             return flag;
        }
    };
    return Bookmark;
}
]);
