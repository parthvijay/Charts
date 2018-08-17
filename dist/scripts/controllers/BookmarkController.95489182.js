'use strict';
angular.module('ciscoExecDashApp').controller('BookmarkController', [
      '$scope'
    , 'BookMarkData'
    , 'Bookmark'
    , '$uibModal'
    , '$rootScope'
    , '$location'
    , '$window'
    , 'GlobalBookmarkServ'
    , 'UserServ'
    , '$timeout'
    , function ($scope,BookMarkData,Bookmark,$uibModal,$rootScope,$location,$window,GlobalBookmarkServ,UserServ,$timeout) {
    $scope.isListView = BookMarkData.getBookmarkView();
    $scope.activeBookamrkType = 1;
    $scope.bookmarkTypes = BookMarkData.getDefaultBookmarkTypes();

    var changeCiscoOneViewTpe = function(bookmarks){ // Chnages for DE164142
        for(var a=0 ; a<bookmarks.bookmarks.length; a++){
            if(bookmarks.bookmarks[a].urlDetails.appUrl.search('ciscoOne') > 0){
                bookmarks.bookmarks[a].urlDetails.view = "CisoOne";
            }
        }
        return bookmarks;
    }

    BookMarkData.getBookMarkData($scope.activeBookamrkType).then(function (result){
        $scope.bookmarks = result;
        $scope.bookmarks = changeCiscoOneViewTpe($scope.bookmarks); // Chnages for DE164142
    });
    $scope.divideRow = ["Recent","Previous"];
    $scope.LableForAllBookmarks = BookMarkData.getLabelForAllBookmarks();
    $scope.currentLabel = $scope.LableForAllBookmarks[$scope.activeBookamrkType];
    $scope.searchByName = [];
    $scope.searchView = false;
    $scope.showMenus = false;
    $rootScope.newBookmarkCount = 0;
    $scope.showMenuForWeb = true;
    $scope.isMenuShown = false;
    $scope.viewByOptions = ['Name','Date Created','Date Last Updated','Start Date','Expiration Date'];
    $scope.activeViewByText = 'Name';
    $scope.sortByNameOrDate = false;
    $rootScope.bHideFilterStrip = true;
    BookMarkData.getBookMarkData(5).then(function (result){
        $scope.recentBookmarks = result.bookmarks;
    });
    $scope.userData = UserServ.data;
    $rootScope.dashboard = 'sales';//fix for DE145943
    $rootScope.$emit('user-info-updated', UserServ.data);//fix for DE145943


    $scope.setActiveViewBy = function (view) {
        $scope.activeViewByText = view;
        if($scope.activeViewByText == "Name"){
            $scope.sortByNameOrDate = false;
        }else{
            $scope.sortByNameOrDate = true;
        }
    }

    $scope.clearSearchText = function() {
        $scope.searchText = null;
    }

    $scope.sortDate = function(bookmark){
        switch ($scope.activeViewByText){
            case "Name":
                 return bookmark.name;
                 break;
            case "Date Created":
                var date = new Date(bookmark.createDate);
                return date;
                break;
            case "Date Last Updated":
                var date = new Date(bookmark.modifiedDate);
                return date;
                break;
            case "Start Date":
                var date = new Date(bookmark.startDate);
                return date;
                break;
            case "Expiration Date":
                if(bookmark.endDate === null){
                   var date = new Date(bookmark.createdDate);
                }else{
                    var date = new Date(bookmark.endDate);
                }
                return date;
                break;
        }
    }


    $scope.bookmarkTabs = [
        {
            name: 'All Bookmarks',
            value: 'AllBookmark'
        },
        {
            name: 'My Bookmarks',
            value: 'MyBookmark'
        },
        {
            name: 'Favorite Bookmarks',
            value: 'FavoriteBookmark'
        },
        {
            name: 'Shared with Me',
            value: 'SharedBookmark'
        },
        {
            name: 'Global Bookmarks',
            value: 'GlobalBookmark'
        },
    ];

    $scope.bookmarkType = {
        "AllBookmark": null,
        "MyBookmark": 1,
        "FavoriteBookmark": 2,
        "SharedBookmark": 3,
        "GlobalBookmark": 4
    };

    $scope.searchTab = $scope.bookmarkTabs[0].name;
    $scope.selectedBookmarkTab = $scope.bookmarkTabs[0];

    $scope.setActiveTabBy = function (bookmarkTab) {
        $scope.selectedBookmarkTab = bookmarkTab;
        $scope.bookmarkSelected = $scope.bookmarkType[bookmarkTab.value];
    }

    getResultOfAllBookmarks();
    
    //Added this condition stop call for click of already active bookmark type - shankar
    $scope.ClickedbookmarkType = 1;
    $scope.setBookmarkType = function(bookmarkType,Toggle){
        if($scope.isMenuShown || $scope.showMenuForWeb) {
            if($scope.ClickedbookmarkType === bookmarkType){
                return;
            }
            $scope.ClickedbookmarkType = bookmarkType;
            BookMarkData.setActiveBookmark(bookmarkType).then(function (res) {
                $scope.activeBookamrkType = res;
                BookMarkData.getBookMarkData($scope.activeBookamrkType).then(function (result){
                    $scope.bookmarks = result;
                    $scope.bookmarks = changeCiscoOneViewTpe($scope.bookmarks); // Changes for DE164142
                    getResultOfAllBookmarks();
                });
                $scope.currentLabel = $scope.LableForAllBookmarks[$scope.activeBookamrkType];
                if ($scope.searchView) {
                    $scope.searchView = false;
                    $scope.searchTab = $scope.bookmarkTabs[0].name;
                    $scope.selectedBookmarkTab = $scope.bookmarkTabs[0];
                    $scope.searchByName = [];
                }
                if(Toggle){
                    $scope.isMenuShown = false;
                }
            });
        }else{
            $scope.isMenuShown = true;
        }
    }

    $scope.searhBookmark = function(searchText){
        BookMarkData.getSearchedBookmark(searchText, $scope.bookmarkSelected).then(function(data){
            $scope.bookmarkSearchData = data.bookmarks;
        });

    }

    $scope.searchByNameAndBy = function (search) {
        return search === 'name' || search === 'by';
    }

    $scope.openViewAppliedFromBookmark = function (bookmark) {
        $uibModal.open({
            templateUrl: 'views/modal/view-applied-filter.html',
            controller: 'ViewAppliedController',
            size: 'lg',
            resolve: {
                filters: function () {
                    return bookmark.filter;
                },
                bookmark: bookmark
            }
        });
    };

    $scope.isValidByDate = function(bookmark) {
        var todaysDate = new Date();
        if(new Date(bookmark.startDate) <= todaysDate && (bookmark.endDate == null || new Date(bookmark.endDate) >= todaysDate))
            return false;
        return true;
    }


    var w = angular.element($window);
    $scope.getWindowDimensions = function () {
        return {
            'h': w.height(),
            'w': w.width()
        };
    };

    $scope.$watch($scope.getWindowDimensions, function (newValue, oldValue) {
        $scope.windowHeight = newValue.h;
        $scope.windowWidth = newValue.w;

        if($scope.windowWidth <= 767){
            $scope.showMenuForWeb = false;
        }else{
            $scope.showMenuForWeb = true;
        }
    }, true);

    w.bind('resize', function () {
        $scope.$apply();
    });


    $scope.getDataForType = function(type){
       return BookMarkData.getBookMarkData(type);
    }


    $scope.addInSearchByName = function(bookmark){
        BookMarkData.getBookmarkById(bookmark).then(function(res) {
            bookmark = res.bookmarks[0];
            $scope.searchText = "";
            $scope.searchView=true;
            var flag = false;
            $scope.searchByName.find(function (item, i) {
                    if (item.id === bookmark.id) {
                        flag = true;
                        return;
                    }
            });
            if(!flag)
                $scope.searchByName.push(bookmark);
        });

    }

    $scope.deleteInSearchByName = function(bookmark){
            var index = -1;
            var filteredObj = $scope.searchByName.find(function (item, i) {
                if (item.id === bookmark.id) {
                    index = i;
                    return i;
                }
            });
            if(index>=0){
                $scope.searchByName.splice(index,1);
            }
        if($scope.searchByName.length == -1){
            $scope.searchView=false;
        }
    }

    $scope.deleteBookmark = function(bookmark,subType){
        var deletemodalInstance = $uibModal.open({
            templateUrl: 'views/modal/delete-bookmark.html',
            controller: 'DeleteBookmarkController',
            size: 'xs'
        });
        deletemodalInstance.result.then(function () {
            var bookmarkId = bookmark.id;
            BookMarkData.deleteBookmark(bookmark.id,$scope.activeBookamrkType).then(function (result){
                if (result.status === "Success") {
                    BookMarkData.getBookMarkData($scope.activeBookamrkType).then(function (result){
                        $scope.bookmarks = result;
                        $scope.bookmarks = changeCiscoOneViewTpe($scope.bookmarks); //Changes for DE164142
                        BookMarkData.getbookmarkCount().then(function(res){
                            $scope.allTotalBookmarkTypeObj = GlobalBookmarkServ.count;
                        });
                        BookMarkData.getBookMarkData(5).then(function (result){
                            $scope.recentBookmarks = result.bookmarks;
                        }); 
                    });
                    BookMarkData.setCurrentBookmark(null);
                    $scope.isDeleted = true;
                    $timeout(function () {
                        $scope.isDeleted = false;
                    }, 3000);
                    if(bookmarkId === GlobalBookmarkServ.bookmark.id){
                    //fix for DE132843
                        GlobalBookmarkServ.clearBookmark();
                    }
                }

            });

        })
    }

    $scope.shareBookmark = function(bookmark,subType){
        BookMarkData.setCurrentBookmark(bookmark);
        var sharemodalInstance = $uibModal.open({
            templateUrl: 'views/modal/share-bookmark.html',
            controller: 'ShareBookmarkController',
            size: 'md'
        });
        sharemodalInstance.result.then(function (response) {
            //do nothing
        })
    }

    $scope.removeBookmark = function(bookmark) {
        if ($scope.activeBookamrkType === 3) {
            BookMarkData.removeShare(bookmark.id).then(function(res){
                if(res.status === 'Success'){
                    getResultOfAllBookmarks();
                    BookMarkData.getBookMarkData($scope.activeBookamrkType).then(function (result){
                        $scope.bookmarks = result;
                        $scope.bookmarks = changeCiscoOneViewTpe($scope.bookmarks); // Changes for DE164142
                    });
                }
            })
        }

        if($scope.activeBookamrkType === 2) {
            var callFav = new Bookmark();
            callFav.setFavouriteBookmark(bookmark).then(function (response){
                if (response.status === "Success") {
                    getResultOfAllBookmarks();
                    bookmark.isFavourite = false;
                    BookMarkData.getBookMarkData($scope.activeBookamrkType).then(function (result){
                        $scope.bookmarks = result;
                        $scope.bookmarks = changeCiscoOneViewTpe($scope.bookmarks); //Changes for DE164142
                    });
                }
            });
        }
    }

    $scope.getTotalOfType = function(type){
       return  BookMarkData.getTotalBookmarkOfType(type);
    }

    $scope.changeToListView = function(value){
        BookMarkData.setBookmarkView(value).then(function(res){
            $scope.isListView  = res;
        });
    }

    $scope.toggleFavirouteBookmark = function(bookmark){
        var callFav = new Bookmark(bookmark);
        callFav.setFavouriteBookmark(bookmark).then(function (response){
            if (response.status === "Success") {
                getResultOfAllBookmarks();
                bookmark.isFavourite = !bookmark.isFavourite;
                BookMarkData.getBookMarkData($scope.activeBookamrkType).then(function (result){
                    $scope.bookmarks = result;
                    $scope.bookmarks = changeCiscoOneViewTpe($scope.bookmarks); //Changes for DE164142
                });
            }
        });
    }

    $scope.toggleMoreOption = function(bookmark){
        bookmark.showMoreOption = !bookmark.showMoreOption;
    }

    $scope.editBookmark = function(bookmark,subType){
       bookmark.fromEdit = true;
       var editModalInstance =  $uibModal.open({
                templateUrl: 'views/modal/save-bookmark.html',
                controller: 'SaveBookmarkController',
                size: 'sm',
                resolve:{
                   BookmarkResolve:['BookMarkData','Bookmark',function(BookMarkData,Bookmark){
                            return {Bookmark : new Bookmark(BookMarkData.getBookMark(bookmark,$scope.activeBookamrkType,subType)),activeBookamrkType:$scope.activeBookamrkType,subType:subType,isEditModal: true,showSaveAs:false};
                    }]
                }
            });
        editModalInstance.result.then(function (result) {
            $scope.setBookmarkType($scope.activeBookamrkType);
            $scope.bookmarkUpdated = true;
            BookMarkData.getBookMarkData($scope.activeBookamrkType).then(function (result){
                $scope.bookmarks = result;
                $scope.bookmarks = changeCiscoOneViewTpe($scope.bookmarks); //Changes for DE164142
                getResultOfAllBookmarks();
                BookMarkData.getBookMarkData(5).then(function (result){
                    $scope.recentBookmarks = result.bookmarks;
                });
            });

        });
    }


    $scope.isExpired = function(bookmark) {
        if(bookmark.endDate == '' || bookmark.endDate == null || typeof(bookmark.endDate) == "undefined")
            return false;
        var todaysDate = new Date();
        var endDate = new Date(bookmark.endDate);
        if(endDate <= todaysDate)
            return true;
        return false;
    }

    $scope.isStarted = function (bookmarkStartDate) {
        var todaysDate = new Date();
        var startDate = new Date(bookmarkStartDate);
        if(startDate >= todaysDate)
            return false;
        return true;
    }

    $scope.convertDate = function(date){
        //return new NewDate(date);
        return new Date(date);
    }

    $scope.convertStartDate = function(date){
       //if ()
       return new Date(date + 'T00:00:00');
    }


    $scope.setBookmarkAsCurrent=function(bookmark,subType){
        BookMarkData.setCurrentBookmark({bookmark:bookmark,activeBookamrkType:$scope.activeBookamrkType,subType:subType});
        // filtersServ.isSalesLevelLoaded = false;
        // $location.path(bookmark.from);
        GlobalBookmarkServ.selectBookmark(bookmark);
    }

    function getResultOfAllBookmarks(){
        //$scope.allTotalBookmarkTypeObj = GlobalBookmarkServ.count;
        BookMarkData.getbookmarkCount().then(function(res){
            $scope.allTotalBookmarkTypeObj = GlobalBookmarkServ.count;
        });
    }

    $scope.copyMessage = false;
    $scope.copyBookmarkURLToClipboard = function (bookmark) {
        //get bookmark URL from backend
        var bookmarkURL = $location.protocol()+'://'+$location.host()+'/#'+bookmark.urlDetails.appUrl+'/'+bookmark.id+'?bkmark='+bookmark.hashId;
        var $temp = $("<input>");
        $("body").append($temp);
        $temp.val(bookmarkURL).select();
        document.execCommand("copy");
        $scope.copyMessage = true;
        $temp.remove();
        $timeout(function () {
            $scope.copyMessage = false;
        }, 30000);
    };
 }
]);