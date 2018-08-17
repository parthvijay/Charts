'use strict';
angular.module('ciscoExecDashApp').controller('CreatePipelineController', ['$scope','ShareDataServ','ConfigServ',  '$window',function ($scope, ShareDataServ, ConfigServ ,$window) {

        $scope.error = false;
         var accountDetails = ShareDataServ.getAccountDetails();
         var currDetail = accountDetails.length - 1;
         var sfdcId;
         sfdcId = accountDetails[currDetail].oppCreationData.sfdcRefId;
         ConfigServ.sdfc_env_details[ConfigServ.sfdcEnvKey].token_url
      $scope.editPipeline = function(){
     
  $window.open(ConfigServ.sdfc_env_details[ConfigServ.sfdcEnvKey].edit_link + sfdcId);

      }
    }
]);