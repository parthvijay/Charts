'use strict';
angular.module('ciscoExecDashApp').controller('SaveBookmarkController', [
    '$uibModalInstance'
    , '$scope'
    , 'BookmarkResolve'
    , 'BookMarkData'
    , 'Bookmark'
    , '$rootScope'
    , 'UserServ'

    , function ($uibModalInstance,$scope,BookmarkResolve,BookMarkData,Bookmark,$rootScope, UserServ) {

        $scope.ok = function () {
            $uibModalInstance.dismiss('cancel');
        };

        $scope.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        };

        $scope.clear = function() {
            $scope.bookmark.endDate = null;
        };

        $scope.userInfo = UserServ.data;
        $scope.bookmark = BookmarkResolve.Bookmark;
        
        //checking the globalBookmarkPerm 
        if (!$scope.userInfo.globalBookmarkPerm) {
            $scope.bookmark.isGlobalDisabled=true;
        }
        if ($scope.bookmark.endDate === '9999-12-31') {
                $scope.bookmark.endDate = null;
        }
        if ($scope.bookmark.fromEdit) {
            $scope.bookmark.startDate = new Date($scope.bookmark.startDate+'T00:00:00');
            /*if ($scope.bookmark.endDate === '9999-12-31') {
                $scope.bookmark.endDate = null;
            }*/
        } else {
            $scope.bookmark.startDate = new Date($scope.bookmark.startDate);
        }

        $scope.appliedFilter = $scope.bookmark.filterData;
        $scope.form = {};
        $scope.error = null;
        $scope.showSaveAs = BookmarkResolve.showSaveAs;
        $scope.disableSaveAsNew = true;
        $scope.defaultView = $scope.bookmark.currentDashboardView ? true : false;
        $scope.activeSlider = $scope.bookmark.isPublic ? true : false;
        if ($scope.userInfo.user.fullName === $scope.bookmark.createdBy) {
            $scope.isEditModal = true;
        } else {
            $scope.isEditModal = false;
        }
        //$scope.isEditModal = (BookmarkResolve.isEditModal)? true : false;
        $scope.urlPattern = '(https|http|www|WWW)(:\\/\\/|\\.)([a-zA-Z0-9])+\\.([a-zA-Z0-9]{2}).*';
        $scope.namePattern = '[a-zA-Z0-9-_ ]+';

        $scope.bookmark.endDate = ($scope.bookmark.endDate == null)? null : new Date($scope.bookmark.endDate+'T00:00:00');

        $scope.updateBookmarkFrom = function() {
            if(!$scope.defaultView) {
                $scope.bookmark.from = "/" + $rootScope.dashboard + '/' + $rootScope.analysis + '/' + 'all/';
                $scope.bookmark.fromSubTabTitle = 'Asset';
                $scope.opportunity = '';
            }
        }

        $scope.isprivate =function () {
            if($scope.activeSlider){
                $scope.bookmark.isPublic = true;
            }else{
                $scope.bookmark.isPublic = false;
                if($scope.bookmark.isGlobal){
                    $scope.activeSlider = true;
                    $scope.bookmark.isPublic = true;
                }
            }
        }

        $scope.setBookmarkToSearchable = function () {
            if($scope.bookmark.isGlobal || $scope.bookmark.isRegional) {
                $scope.activeSlider = true;
                $scope.bookmark.isPublic = true;
                $scope.bookmark.urlDetails.salesHub = "";
                $scope.bookmark.salesCollateralLink = "";
                $scope.bookmark.urlDetails.additionalInfo = "";
                $scope.form.saveBookmark.salesColLink.$touched = false;
            }else{
                $scope.activeSlider = false;
                $scope.bookmark.isPublic = false;
            }
        }

        $scope.setDefaultView = function () {
            if($scope.defaultView){
                $scope.bookmark.currentDashboardView = true;
            }else{
                $scope.bookmark.currentDashboardView = false;
            }
        }

        $scope.enableSaveAsNew = function(){
            if($scope.bookmark.id) {
                $scope.disableSaveAsNew = false;
            }
        };

        $scope.saveBookmark = function (isValid, isUpdate) {
            if (!isValid) {
                $scope.$broadcast('show-errors-check-validity', 'form.saveBookmark');
                return false;
            }
            if (isUpdate === undefined) {
               // $scope.updateBookmarkFrom();
            }
            $scope.addingHttp();
            if($scope.bookmark.id){
                //$scope.bookmark.setFilterData($scope.appliedFilter);
                var newOrUpdatebook = BookMarkData.updateBookmark($scope.bookmark,BookmarkResolve.activeBookamrkType).then(function(){
                    $uibModalInstance.close({newBookmark:false,bookmark:newOrUpdatebook});
                   // BookMarkData.getbookmarkCount();
                })

            }else{
                // if (!$scope.userInfo.globalBookmarkPerm) {
                //     $scope.bookmark.isGlobal = false;
                // }
                var newOrUpdatebook=BookMarkData.addNewBookmark($scope.bookmark, $scope.userInfo.user.fullName).then(function(response){
                    if (response.status !== 'Failure') {
                        $rootScope.newBookmarkCount++;
                        $rootScope.currentBookmark = null;
                        $uibModalInstance.close({newBookmark:true,bookmark:newOrUpdatebook});
                    }
                });

            }
        };

        $scope.saveAsNewBookmark = function(isValid){
            $scope.bookmark.id =null;

            $scope.saveBookmark(isValid);
        };


        //Date picker starts from here

        $scope.dateOptionsStartDate = {
            formatYear: 'yy',
            maxDate: new Date(2020, 5, 22),
            minDate: new Date(),
            startingDay: 1,
            initDate: new Date($scope.bookmark.startDate)
        };

        //selecting prev Expiration date than Start Date is not disabled
        //adding minDate to fix DE194748
        $scope.dateOptionsEndDate = {
            formatYear: 'yy',
            minDate: new Date(),
            maxDate: new Date(2020, 5, 22),
            startingDay: 1,
            initDate: ($scope.bookmark.endDate == null )? new Date() : new Date($scope.bookmark.endDate)
        };

        //selecting prev Expiration date than Start Date is not disabled
        $scope.updateDate = function() {
            var date = new Date($scope.bookmark.startDate);
            date.setDate(date.getDate() + 1);
            $scope.dateOptionsEndDate.minDate = new Date(date);
        }

        $scope.addingHttp = function(){
            /*
            *We need to add http:// in front of every url if user forgets to add it
            *without "http://", when we will click on the url it will not open the web page
            * Added change for DE146693
            */

            if($scope.bookmark && $scope.bookmark.urlDetails){
                if($scope.bookmark.urlDetails.salesHub
                    && (($scope.bookmark.urlDetails.salesHub.substring(0,4)).toLowerCase()) !== "http") {
                        $scope.bookmark.urlDetails.salesHub = "http://"+$scope.bookmark.urlDetails.salesHub;
                }
                if($scope.bookmark.urlDetails.additionalInfo
                    && (($scope.bookmark.urlDetails.additionalInfo.substring(0,4)).toLowerCase()) !== "http"){
                        $scope.bookmark.urlDetails.additionalInfo = "http://"+$scope.bookmark.urlDetails.additionalInfo;
                }
            }
        }

        // While editing the bookmark, System was accepting past dates in expiration date field
        // $scope.updateDate();

        //selecting prev Expiration date than Start Date is not disabled
        $scope.updateStartDate = function () {
            $scope.bookmark.endDate = '';
        };

        // Disable weekend selection
        function disabled(data) {
            var date = data.date,
                mode = data.mode;
            return mode === 'day' && (date.getDay() === 0 || date.getDay() === 6);
        }

        //$scope.inlineOptions.minDate = $scope.inlineOptions.minDate ? null : new Date();
        // $scope.dateOptions.minDate = $scope.inlineOptions.minDate;

        $scope.open2 = function () {
            $scope.popup2.opened = true;
        };
        $scope.open3 = function () {
            $scope.popup3.opened = true;
        };

        $scope.popup2 = {
            opened: false
        };
        $scope.popup3 = {
            opened: false
        };

    }
]);
