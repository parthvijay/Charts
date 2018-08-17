'use strict';
angular.module('ciscoExecDashApp').controller('UploadPIDController', ['$uibModalInstance', '$scope', '$rootScope', 'Upload', '$timeout', 'uploadedPIDData', 'RestUri', 'ApiDispatcher', function ($uibModalInstance, $scope, $rootScope, Upload, $timeout, uploadedPIDData, restUri, apiDispatcher) {

    $scope.files;
    $scope.isLoading = false;
    $scope.progress = 0;
    $scope.filename = "";
    $scope.fileNameWithOutExtension = "";
    $scope.uploadedPIDData = uploadedPIDData;
    $scope.errorUploading = false;
    $scope.errorUploadingEmpty = false; //Changes for DE149509 - Sindhu
    $scope.readUploadedPIDDataFlag = false;
    $scope.uploadFlag = false;
    $scope.maxPIDsUploaded = false;
    $scope.duplicateCount = 0; // Changes for DE148747 - Sindhu
    var getApiPath = function(key) { //Changes for US131394
        var apiPath = restUri.getUri(key);
        return apiPath;
    };

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };

    $scope.ok = function () {
        // CHanges for US131394 - Sindhu
        $rootScope.$emit('filtersAfterPidUpload', {
            'pidFiltersData': $scope.pidData
        })
        $uibModalInstance.close($scope.matchedData);
    };

    $scope.$watch('files', function () {
        $scope.readPIDs($scope.files);
    });

    $scope.clearFile = function () {
        $scope.errorUploading = false;
        //Changes for DE149509 - Sindhu
        $scope.errorUploadingEmpty = false;
        $scope.readUploadedPIDDataFlag = false;
        $scope.uploadFlag = false;
        $scope.maxPIDsUploaded = false;
        $scope.isLoading = false;
        $scope.progress = 0;
        $scope.fileName = "";
        $scope.fileNameWithOutExtension = "";
        $scope.matchedData = [];
        $scope.unMatchedData = [];
        $scope.duplicateCount = 0;// Changes for DE148747 - Sindhu
    }

    $scope.readPIDs = function (files) {
        $scope.uploadFlag = false;
        $scope.readUploadedPIDDataFlag = false;
        var file = files;
        if (file) {
            $scope.fileName = file.name;
            var lastIndex = $scope.fileName.lastIndexOf(".");
            $scope.fileNameWithOutExtension = $scope.fileName.substring(0, lastIndex);
            var reader = new FileReader();
            reader.onload = function (event) {
                var data = event.target.result;
                var arr = String.fromCharCode.apply(null, new Uint8Array(data));
                var wb = XLSX.read(btoa(arr), {type: 'base64'});
                wb.SheetNames.forEach(function (sheetName) {
                    var csv = XLSX.utils.sheet_to_csv(wb.Sheets[sheetName]);
                    var data = [];

                    data = csv.split("\n").map(function (e) {
                        return e.split(",")[0].trim();
                    }).filter(function (e) {
                        return e != "PID" && e != "" && e != "Product ID"; // Change for DE148671 - Sindhu
                    });

                    $scope.removeDuplicates(data);
                    $scope.duplicateCount = data.length - $scope.uploadedPIDData.length; // Changes for DE148747 - Sindhu
                    $scope.uploadedPIDData.length > 2000 ? $scope.errorUploading = true : $scope.errorUploading = false;
                    //Changes for DE149509 - Sindhu 
                    $scope.uploadedPIDData.length === 0 ? $scope.errorUploadingEmpty = true : $scope.errorUploadingEmpty = false;
                });
                $scope.isLoading = false;
                $scope.$apply();
            }

            reader.onprogress = function (data) {
                if (data.lengthComputable) {
                    $scope.progress = parseInt(((data.loaded / data.total) * 100), 10);
                    $scope.$apply();
                }
            }

            $scope.isLoading = true;
            $scope.readUploadedPIDDataFlag = true;
            reader.readAsArrayBuffer(file);
        }
    }

    $scope.removeDuplicates = function (data) {
        $scope.uploadedPIDData = data.filter(function (item, pos) {
            return data.indexOf(item) == pos;
        })
    }

    $scope.uploadPID = function () {
        //Add API call here to validate uploaded PID data.
        var responsePid = [];
        var apiPath = getApiPath('uploadPid');
        apiDispatcher.post(apiPath,{
                 "productName": $scope.uploadedPIDData
                }
            ).then(function(response) {
                $scope.pidData = response;
                angular.forEach($scope.pidData.pids, function(keys, val){
                    if(keys.length === 1){
                        responsePid.push(keys[0]);
                    }else if(keys.length > 1){
                        for(var c=0; c<keys.length; c++){
                            responsePid.push(keys[c]);
                        }
                    }
                })
                /*for(var a=0;a<$scope.pidData.pids.length;a++){
                    for(var b=0;b<$scope.pidData.pids[a].length;b++){
                        response.push($scope.pidData.pids[a][b]);
                    }
                }*/
                $scope.uploadFlag = true;
                $scope.matchedData = [];
                $scope.unMatchedData = [];

                for (var i = 0; i < $scope.uploadedPIDData.length; i++) {
                    if (responsePid.indexOf($scope.uploadedPIDData[i]) > -1) {
                        $scope.matchedData.push($scope.uploadedPIDData[i]);
                    } else {
                        $scope.unMatchedData.push($scope.uploadedPIDData[i]);
                    }
                }
            });
    }

    $scope.download = function () {
        var tbl = document.getElementById("pid-table");
        var wb = XLSX.utils.table_to_book(tbl);
        wb = XLSX.utils.sheet_to_csv(wb.Sheets[wb.SheetNames[0]]);
        var fileName = $scope.fileNameWithOutExtension + ".csv";
        var uri = 'data:text/csv;charset=utf-8,' + escape(wb);
        var link = document.createElement("a");
        link.href = uri;
        link.style = "visibility:hidden";
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

}
]);