'use strict';
angular.module('ciscoExecDashApp').controller('OpportunityRangeController', ['$uibModalInstance', '$scope', '$filter', '$http', 'RangeLimit', '$timeout', function ($uibModalInstance, $scope, $filter, $http, RangeLimit, $timeout) {

    // to resolve slider width and horizontal scroll issue
    $timeout(function () {
        $scope.$broadcast('rzSliderForceRender');
    });

    $scope.ok = function () {
        $uibModalInstance.dismiss('cancel');
    };

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };

    $scope.close = function () {
        // $uibModalInstance.close({lowestValue: $scope.lowestValue, highestValue: $scope.highestValue, rangeList: $scope.rangeList});
        $uibModalInstance.close({ lowestValue: $scope.lowestValue, highestValue: $scope.highestValue });
    };

    $scope.optionsTsAttach = {
        minValue: 0,
        maxValue: 500,
        options: {
            floor: 0,
            ceil: 500,
            showTicksValues: true,
            step: 100,
            translate: function (value) {
                return value + 'k';
            },
            onChange: function () {
                $scope.lowestValue[0] = $scope.optionsTsAttach.minValue;
                $scope.highestValue[0] = $scope.optionsTsAttach.maxValue;
                return $scope.optionsTsAttach.options.translate($scope.optionsTsAttach.minValue) + " - " + $scope.optionsTsAttach.options.translate($scope.optionsTsAttach.maxValue);
            }
        }
    };

    $scope.optionsTsRenew = {
        minValue: 0,
        maxValue: 500,
        options: {
            floor: 0,
            ceil: 500,
            showTicksValues: true,
            step: 100,
            translate: function (value) {
                return value + 'k';
            },
            onChange: function () {
                $scope.lowestValue[1] = $scope.optionsTsRenew.minValue;
                $scope.highestValue[1] = $scope.optionsTsRenew.maxValue;
                return $scope.optionsTsRenew.options.translate($scope.optionsTsRenew.minValue) + " - " + $scope.optionsTsRenew.options.translate($scope.optionsTsRenew.maxValue);
            }
        }
    };

    $scope.optionsSwssAttach = {
        minValue: 0,
        maxValue: 500,
        options: {
            floor: 0,
            ceil: 500,
            showTicksValues: true,
            step: 100,
            translate: function (value) {
                return value + 'k';
            },
            onChange: function () {
                $scope.lowestValue[2] = $scope.optionsSwssAttach.minValue;
                $scope.highestValue[2] = $scope.optionsSwssAttach.maxValue;
                return $scope.optionsSwssAttach.options.translate($scope.optionsSwssAttach.minValue) + " - " + $scope.optionsSwssAttach.options.translate($scope.optionsSwssAttach.maxValue);
            }
        }
    };

    $scope.optionsSwssRenew = {
        minValue: 0,
        maxValue: 500,
        options: {
            floor: 0,
            ceil: 500,
            showTicksValues: true,
            step: 100,
            translate: function (value) {
                return value + 'k';
            },
            onChange: function () {
                $scope.lowestValue[3] = $scope.optionsSwssRenew.minValue;
                $scope.highestValue[3] = $scope.optionsSwssRenew.maxValue;
                return $scope.optionsSwssRenew.options.translate($scope.optionsSwssRenew.minValue) + " - " + $scope.optionsSwssRenew.options.translate($scope.optionsSwssRenew.maxValue);
            }
        }
    };

    // display range filter in Opportunity Range modal
    $scope.opportunityRangeFilter = function () {
        var range = RangeLimit.getResult();
        if (RangeLimit.getResult() == undefined) {
            // $http.get("data/opportunityRange.json", {}).then(function (d) {
            //     $scope.rangeList = d.data;
            // });
            $scope.lowestValue = [0, 0, 0, 0];
            $scope.highestValue = [500, 500, 500, 500];
        }
        else {
            $scope.lowestValue = range.lowestValue;
            $scope.highestValue = range.highestValue;
            // $scope.rangeList = range.rangeList;
            $scope.optionsTsAttach.minValue = range.lowestValue[0];
            $scope.optionsTsAttach.maxValue = range.highestValue[0];

            $scope.optionsTsRenew.minValue = range.lowestValue[1];
            $scope.optionsTsRenew.maxValue = range.highestValue[1];

            $scope.optionsSwssAttach.minValue = range.lowestValue[2];
            $scope.optionsSwssAttach.maxValue = range.highestValue[2];

            $scope.optionsSwssRenew.minValue = range.lowestValue[3];
            $scope.optionsSwssRenew.maxValue = range.highestValue[3];

        }
    };
    $scope.opportunityRangeFilter();

    // $scope.rangeOptions = function (rangeList, min, max, i) {
    //     $scope.options = {
    //         floor: 0,
    //         ceil: 500,
    //         showTicksValues: true,
    //         step: 100,
    //         translate: function (value) {
    //             return value + 'k';
    //         },
    //         // translate: function (value) {
    //         //     return rangeList[i]["valueTag"][value - 1];
    //         // },
    //         onChange: function (sliderId, modelValue, highValue, pointerType) {
    //             $scope.lowestValue[i] = modelValue;
    //             $scope.highestValue[i] = highValue;
    //             return $scope.options.translate(modelValue) + " - " + $scope.options.translate(highValue);
    //         }
    //     };
    //     return $scope.options;
    // };

    // $scope.validateNumber = function (val) {
    //     var c = parseInt(val.value);
    //     var reg = new RegExp('^[0-9]*$');
    //     if (!reg.test(val.value) || isNaN(c) || c < 0) {
    //         val.value = 0;
    //     }
    // };
}
]);