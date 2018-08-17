'use strict';
angular.module('ciscoExecDashApp').service('RangeLimit', function RangeLimit() {
    var result;
  
    var service = {       
     getResult: function() { return result; },
     setResult: function(value) { result = value; }
    };
    return service;
  });