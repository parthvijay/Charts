'use strict';
angular.module('ciscoExecDashApp').controller('ShareBookmarkController', [
    '$uibModalInstance'
    , '$scope'
    , 'BookMarkData'
    , '$filter'
    , '$location'
    , '$uibModal'
    , 'UserServ'
    , function ($uibModalInstance, $scope, BookMarkData, $filter, $location, $uibModal, UserServ) {

        $scope.users = [];
        $scope.selectedSharedUsers = [];
        $scope.searchUsers = [];
        $scope.viewOptions = [10, 20];
        $scope.pageSize = $scope.viewOptions[0];
        $scope.pageNo = 1;
        $scope.totalPages = 1;
        $scope.displaySearchUsers = [];
        $scope.startIndex = 0;
        $scope.endIndex = 0;
        $scope.userInfo = UserServ.data;

        $scope.flattenDisplaySearchUsers = function () {
            var allUsers = [];
            for (var i = 0; i < $scope.displaySearchUsers.length; i++) {
                if($scope.displaySearchUsers[i].id.split("-").length > 1)
                    continue;
                allUsers = allUsers.concat($scope.getAllUsers($scope.displaySearchUsers[i]));
            }
            $scope.displaySearchUsers = allUsers;
        }

        $scope.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        };

        $scope.deleteBookmark = function () {
            $uibModalInstance.close();
        };

        $scope.shareBookmark = function () {
            var bookmark = BookMarkData.getCurrentBookmark();
            var sharingData = {};
            var recepeints = [];
            
            $scope.selectedSharedUsers.forEach(function(userName) {
                recepeints.push(userName);
            });

            sharingData.userName = $scope.userInfo.user.fullName;
            sharingData.msg = $scope.message;
            sharingData.recepeints = recepeints;
            sharingData.url = $location.protocol()+'://'+$location.host()+'/#'+bookmark.urlDetails.appUrl+'/'+bookmark.id+'?bkmark='+bookmark.hashId;
            
            BookMarkData.shareBookmarkWithOthers(bookmark, sharingData).then(function(res) {
                if (res.status === 'Success') {
                    $uibModalInstance.close();
                    $uibModal.open({
                        templateUrl: 'views/modal/success-message.html',
                        controller: 'SuccessMessageController',
                        size: 'xs',
                        resolve:{
                            bookmark: bookmark
                        }
                    });
                } else {
    		        $uibModal.open({
                        templateUrl: 'views/modal/error-message.html',
                        controller: 'ErrorMessageController',
                        size: 'xs',
    					resolve: {
                        	fromShare: true
    					}
                    });
		        }
            });
        };        

        $scope.setDisplaySearchUsers = function() {
        	$scope.startIndex = ($scope.pageNo-1)*$scope.pageSize;
        	if($scope.startIndex > $scope.searchUsers.length) {
        		$scope.pageNo = 1;
        		$scope.startIndex = 0;
        	}

        	if($scope.searchUsers.length == 0) {
        		$scope.displaySearchUsers = [];
        		$scope.endIndex = 0;
        	}
        	else {
        		$scope.endIndex = $scope.startIndex + Math.min($scope.pageSize, $scope.searchUsers.length - $scope.startIndex);
        		$scope.displaySearchUsers = $scope.searchUsers.slice($scope.startIndex, $scope.endIndex);
                $scope.flattenDisplaySearchUsers();
        	}
        }

        $scope.setPageSize = function(size) {
        	$scope.pageSize = size;
        	$scope.totalPages = Math.ceil($scope.searchUsers.length/$scope.pageSize);
        	if($scope.pageNo > $scope.totalPages)
        		$scope.pageNo = 1;
        	$scope.setDisplaySearchUsers();
        };

        $scope.setPageNo = function(pageno) {
        	if(pageno == 0 || pageno == $scope.totalPages+1)
        		return;
        	$scope.pageNo = pageno;
        	$scope.setDisplaySearchUsers();
        }

        $scope.searhTextUpdated = function(keySearchText) {
            if (keySearchText.length<=2) {
                if ($scope.displaySearchUsers.length > 0) {
                    $scope.displaySearchUsers = [];
                }
            }
            if (keySearchText.length>2) {
                BookMarkData.getNewShareUsers(keySearchText).then(function(data){
                    $scope.users = data.userDetails;
                    for(var i=0;i<$scope.users.length;i++) {
                        $scope.users[i].show = true;
                        $scope.users[i].expanded = false;

                    }
                    $scope.displaySearchUsers = data.userDetails;
                    $scope.pageNo = 1;
                    $scope.searchUsers = data.userDetails;
                    $scope.totalPages = Math.ceil($scope.searchUsers.length/$scope.pageSize);
                    $scope.setDisplaySearchUsers();
                });
            }        	
        };

        $scope.findIndex = function(arr, item) {
        	var index = -1;
            arr.forEach(function(element, i){
                if(element.emailId === item.emailId)
                    index = i;
            });
            return index;
        };

        $scope.range = function(n) {
        	var iteratorArr = [];
        	for(var i=1;i<=n;i++)
	        	iteratorArr.push(i);
	        return iteratorArr;
	    };

        $scope.setToDefault = function (user) {
            user.expanded = false;
            user.show = false;
            if (user.list) {
                for (var i = 0; i < user.list.length; i++) {
                    $scope.setToDefault(user.list[i]);
                }
            }
        }

        $scope.toggleLogic = function(user) {
            var expanded = !user.expanded;
            $scope.setToDefault(user);
            user.show = true;
            user.expanded = expanded;
            if (user.expanded) {
                for (var i = 0; user.list && i < user.list.length; i++) {
                    user.list[i].show = user.expanded;
                }
            }
            $scope.findObject($scope.users, user).data = user;
            $scope.flattenDisplaySearchUsers();
        }

        $scope.toggle = function (user) {
            if(user.list) {
                $scope.toggleLogic(user);
            }
            else {
                BookMarkData.getMailer(user).then(function(data){
                    user.list = angular.copy(data.userDetails);
                    $scope.checkUser(user, user.isCheck);
                    $scope.toggleLogic(user);
                });
            }

        }

        $scope.checkUser = function (user, check) {
            user.isCheck = check;
            var allUsers = $scope.getAllUsers(user);
            for (var i = 0; i < allUsers.length; i++) {
                allUsers[i].isCheck = check;
            }
        }

        $scope.deleteAllDescendants = function (user) {
            var allUsers = $scope.getAllUsers(user);
            for (var i = 0; i < allUsers.length; i++) {
                $scope.deleteSelectedSharedUser(allUsers[i]);
            }
        }

        $scope.propagate = function (user) {
            if (user.isCheck == false) {
                var ids = user.id.split("-");
                if (ids.length != 1) {
                    var obj = $scope.findObject($scope.users, {"id": ids.slice(0, ids.length - 1).join("-")});
                    if (obj.data.isCheck == true) {
                        $scope.deleteSelectedSharedUser(obj.data);
                        for (var i = 0; i < obj.data.list.length; i++) {
                            if (obj.data.list[i].isCheck) {
                                $scope.updateSharedUserLogic(obj.data.list[i]);
                            }
                        }
                        $scope.propagate(obj.data);
                    }
                }
            }
            else {
                var ids = user.id.split("-");
                if (ids.length != 1) {
                    var obj = $scope.findObject($scope.users, {"id": ids.slice(0, ids.length - 1).join("-")});
                    var checkFlag = true;
                    for (var i = 0; i < obj.data.list.length; i++) {
                        if (!obj.data.list[i].isCheck) {
                            checkFlag = false;
                            break;
                        }
                    }
                    if (checkFlag == true) {
                        $scope.deleteAllDescendants(obj.data);
                        obj.data.isCheck = true;
                        $scope.updateSharedUserLogic(obj.data);
                        $scope.propagate(obj.data);
                    }
                }
            }
        }

        $scope.updateSharedUserLogic = function (user) {
            var checkStatus = user.isCheck;
            if (user.list) {
                $scope.checkUser($scope.findObject($scope.users, user).data, checkStatus);
                $scope.checkUser($scope.findObject($scope.displaySearchUsers, user).data, checkStatus);
                if (checkStatus) {
                    $scope.selectedSharedUsers.push(user);
                }
                else {
                    $scope.deleteSelectedSharedUser(user);
                }
            }
            else {
                $scope.checkUser($scope.findObject($scope.users, user).data, checkStatus);
                $scope.checkUser($scope.findObject($scope.displaySearchUsers, user).data, checkStatus);
                if (!checkStatus) {
                    $scope.deleteSelectedSharedUser(user);
                }
                else {
                    $scope.selectedSharedUsers.push(user);
                }
            }
        }
        $scope.updateSharedUserMailer = function (user) {
            var checkStatus = user.isCheck;
            if (user.list) {
                $scope.deleteAllDescendants(user);
                user.isCheck = checkStatus;
            }
            $scope.updateSharedUserLogic(user);
            $scope.propagate(user);
        }
        $scope.updateSharedUser = function(user) {
            if (user.list || user.level > 1) {
                $scope.updateSharedUserMailer(user);
                return;
            }
        	var index = -1;
        	$scope.users.forEach(function(userElement, i){
        		if(userElement.id == user.id) {
        			index = i;
        		}
        	});
            $scope.users[index].isCheck = user.isCheck;
            if (user.isCheck == null)
        		$scope.users[index].isCheck = true;
            if (user.isCheck) {
                $scope.users[index].isCheck
        		$scope.selectedSharedUsers.push($scope.users[index]);
        	}
        	else {
        		$scope.deleteSelectedSharedUser($scope.users[index]);
        	}
        }

        $scope.getSelectedSharedUsers = function() {
        	var selectedSharedUsers = [];
        	$scope.users.forEach(function(user) {
        		if(user.isCheck != null && user.isCheck == true)
        			selectedSharedUsers.push(user);
        	});
        	return selectedSharedUsers;
        }

        $scope.findObject = function (searchList, item) {
            for (var i = 0; i < searchList.length; i++) {
                if (searchList[i].id == item.id)
                    return {"found": true, "data": searchList[i]};
                if (searchList[i].list) {
                    var finder = $scope.findObject(searchList[i].list, item);
                    if (finder.found == true)
                        return finder;
                }
            }
            return {"found": false, "data": searchList[i]};
        }
        $scope.markSharedUser = function(user, check) {
            if (user.level > 1) {
                $scope.findObject($scope.users, user).data.isCheck = check;
            }
            else {
        	$scope.users[$scope.findIndex($scope.users, user)].isCheck = check;
            }
            var index = $scope.findIndex($scope.displaySearchUsers, user);
            if (index != -1)
                $scope.displaySearchUsers[index].isCheck = check;
        }

        $scope.getAllUsers = function (user) {
            var allUsers = [];
            allUsers.push(user);
            if (user.list) {
                for (var i = 0; i < user.list.length; i++) {
                    allUsers = allUsers.concat($scope.getAllUsers(user.list[i]));
                }
            }
            return allUsers;
        }
        $scope.deleteSelectedSharedUser = function(user) {
        	$scope.markSharedUser(user, false);
            var index = $scope.findIndex($scope.selectedSharedUsers, user);
            if (index != -1)
                $scope.selectedSharedUsers.splice(index, 1);
        }
        
        $scope.clearAllSelectedSharedUsers = function () {
        	var selectedSharedusers = $scope.getSelectedSharedUsers();
            var allUsers = [];
            selectedSharedusers.forEach(function (user) {
                allUsers = allUsers.concat($scope.getAllUsers(user));
            });
            selectedSharedusers = angular.copy(allUsers);
        	selectedSharedusers.forEach(function (user) {
				$scope.markSharedUser(user, false);
            });
        	$scope.selectedSharedUsers = [];
        }

        $scope.clearSearchResults = function () {
			$scope.searchText = null;
            $scope.displaySearchUsers = [];
            $scope.searchUsers = [];
            $scope.startIndex = 0;
            $scope.endIndex = 0;
            $scope.pageNo = 1;
            $scope.totalPages = 1;
        }

		$scope.APIError = true;

		$scope.shareValidation = function (bookmark) {
			if($scope.APIError){
				//console.log("call api error modal");
                //open error message modal
			}else{
                $uibModalInstance.close();
                $uibModal.open({
                    templateUrl: 'views/modal/success-message.html',
                    controller: 'SuccessMessageController',
                    size: 'xs',
					resolve:{
                    	bookmark: bookmark
					}
                });
			}
		}
    }
]);