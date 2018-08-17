'use strict';
angular.module('ciscoExecDashApp').controller('PresentationController', ['$uibModalInstance', '$uibModal', '$scope', '$rootScope','presentationProposalData', 'nodeName','GlobalBookmarkServ','CollaborationRefreshServ', function ($uibModalInstance, $uibModal, $scope, $rootScope, presentationProposalData, nodeName, GlobalBookmarkServ,CollaborationRefreshServ) {

    var allLanguages = [{ 'name': 'US English (en)' }, { 'name': 'Brazilian Portuguese (pt)' }, { 'name': 'Latin American Spanish (es)' }, { 'name': 'German (de)' }, { 'name': 'Japanese (jp)' }, { 'name': 'Chinese (cn)' }, { 'name': 'Arabic (ar)' }, { 'name': 'Russian (ru)' }, { 'name': 'Polish (pl)' }, { 'name': 'Czech (cz)' }, { 'name': 'French (fr)' }
    ];
    var UcLanguages = [{ 'name': 'US English (en)' }, { 'name': 'Brazilian Portuguese (pt)' }, { 'name': 'Latin American Spanish (es)' }, { 'name': 'German (de)' }, { 'name': 'Japanese (jp)' }, { 'name': 'Chinese (cn)' }, { 'name': 'Arabic (ar)' }, { 'name': 'Russian (ru)' }, { 'name': 'French (fr)' }
    ];

    var VideoLanguages =[{ 'name': 'US English (en)' }, { 'name': 'Brazilian Portuguese (pt)' }, { 'name': 'Latin American Spanish (es)' }, { 'name': 'German (de)' }, { 'name': 'Japanese (jp)' }, { 'name': 'Chinese (cn)' }, { 'name': 'Arabic (ar)' },  { 'name': 'French (fr)' }
    ];
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };


    $scope.click = function (){
        if($scope.collateral) {

         if($scope.collateral.selected === "UC" ){
           $scope.languages = UcLanguages ;
            } else if($scope.collateral.selected === "Video" ){
             $scope.languages = VideoLanguages ;
            } 

 
}

    };
    

    if(GlobalBookmarkServ.bookmark){
        $scope.languages = [];
        var bookmarkName = GlobalBookmarkServ.bookmark.name;
        angular.forEach(allLanguages, function(languageName){
            if(bookmarkName === "Collab-UC-LDOS" && (languageName.name === 'Polish (pl)' || languageName.name ===  'Czech (cz)')) {
                //do nothing
            } else if(bookmarkName === "Collab-Video-LDOS" && (languageName.name === 'Polish (pl)' || languageName.name ===  'Czech (cz)' || languageName.name ===  'Russian (ru)')){
                //do nothing
            } else {
                $scope.languages.push(languageName);
            }
        });
    }


 
    $scope.collateral = presentationProposalData;
    $scope.nodeName = nodeName;

    $scope.requireCheckbox = function () {
        if (($scope.collateral.requestProposalCheckbox && $scope.collateral.proposalLanguage) || ($scope.collateral.presentationLanguage && $scope.collateral.requestPresentationCheckbox)) {
            if($scope.collateral.requestProposalCheckbox && !$scope.collateral.proposalLanguage){
                return true;
            } else if($scope.collateral.requestPresentationCheckbox && !$scope.collateral.presentationLanguage){
                return true;
            } else {
                return false;
            }
        }
            return true;
    };

    

    $scope.requestCollateral = function (c) {
        $rootScope.$broadcast('create-collab-proposal', $scope.collateral, $scope.nodeName);
        $uibModalInstance.dismiss('cancel');
    };

    $scope.open = function () {
        $scope.popup.opened = true;
    };

    $scope.popup = {
        opened: false
    };

    $scope.dateOptionsProposalDate = {
        formatYear: 'yy',
        startingDay: 1,
        initDate: new Date()
    };

    $scope.resetDropdown = function(c) {
        $scope.collateral[c] = '';
    };
}
]);