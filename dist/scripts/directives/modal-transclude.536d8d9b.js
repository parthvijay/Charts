/*jshint sub:true*/
'use strict';
angular.module('ciscoExecDashApp').directive('modal', function() {
    return {
        restrict: 'E',
        scope: {
            show: '=',
            bookmark:'='
        },
        replace: true,
        transclude: false,
        controller:['$scope','BookMarkData','$http','Bookmark',function($scope,BookmarkData,$http,Bookmark){
            $scope.activeBookamrkType = BookmarkData.getActiveBookmark();
            $scope.book = new Bookmark($scope.bookmark);
            $scope.addUser = false;
            $scope.addShareUsers = [];
            $scope.showAddFriends = function(){
                $scope.addUser = !$scope.addUser;
                if($scope.addUser){
                    $http.get('data/ShareUserList.json').then(function(res){
                            $scope.newUsers = res.data;
                        },
                        function(err){
                            $scope.newUsers = [];
                        });
                }
            }
            $scope.hide = function() {
                //console.log("That's the good one!");
                $scope.show = false;
                $scope.addUser = false;
                $scope.addShareUsers = [];
                document.body.classList.remove('noScroll');
            };
            $scope.addUsersToList = function(user){
                var index = getIndexOfUser($scope.addShareUsers,user);
                if(index ==-1) {
                    $scope.addShareUsers.push(angular.copy(user));
                }
                $scope.searchname = '';
            }

            $scope.deleteAllUserList = function(){
                $scope.addShareUsers = [];
            }

            $scope.removeUsersFromList = function(user){
                var index = getIndexOfUser($scope.addShareUsers,user);
                if(index >=0) {
                    $scope.addShareUsers.splice(user, 1);
                }
            }

            var getIndexOfUser = function(arr,user){
                var index = -1;
                var filteredObj = arr.find(function (item, i) {
                    if (item.id === user.id) {
                        index = i;
                        return i;
                    }
                });
                return index;
            }

            $scope.addShareUsersToBookmark=function(){
                $scope.book.addShareUsers($scope.addShareUsers);
                BookmarkData.updateBookmark($scope.book,$scope.activeBookamrkType);
                $scope.hide();
            }

            $scope.toggleSearch = function(){
                if ($scope.book.sharePopup) {
                    $scope.$window.onclick = function (event) {
                        $scope.book.sharePopup = false;
                    };
                }
            }

            
        }],
        templateUrl: 'views/show-share-users.html'
    }
});


angular.module('ciscoExecDashApp').directive('checkOutside', function ($document) {
    return {
        restrict: 'A',
        scope: {
            value: "=myValue",
            index: "@index"
        },
        link: function (scope, element, attrs) {

            function elementClick(e) {
                e.stopPropagation();
                if(e.target.offsetParent){
                    var id = e.target.offsetParent.id ;
                    if(id === scope.index){
                        scope.value = !scope.value;
                        scope.$apply();
                    }
                }
            }

            function documentClick(e) {
                //console.log("outside");
                scope.value = false;
                scope.$apply();
            }

            element.on('click', elementClick);
            $document.on('click', documentClick);

            // remove event handlers when directive is destroyed
            scope.$on('$destroy', function () {
                element.off('click', elementClick);
                $document.off('click', documentClick);
            });
        }
    };
});