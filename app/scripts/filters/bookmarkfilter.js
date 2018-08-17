/*jshint sub:true*/
'use strict';
angular.module('ciscoExecDashApp').filter('bookmarkFilterForSearch', function () {
    return function (items, field, key1, key2) {
        if (field === undefined || field === null || field === '' || key1 === undefined || key1 === null || key2 === undefined || key2 === null) {
            return [];
        }
        if(items === undefined || items.length <=0){
            return [];
        }
        return items.filter(function (element) {
            return (element[key1].toLowerCase().includes(field.toLowerCase()) || (key2 !== null && element[key2].toLowerCase().includes(field.toLowerCase())) );
        });
    };
});

angular.module('ciscoExecDashApp').filter('PopupFilterShow', function () {
    return function (items, value) {
        if (value === undefined || value === null || value === '') {
            return [];
        }
        return items.filter(function (element) {
            return element["categoryId"] === value;
        });
    };
});



angular.module('ciscoExecDashApp').filter('ShareUserForSearch', function () {
    return function (items, users) {
        if (items === undefined || items.length <=0) {
            return [];
        }
        return items.filter(function (element, index) {
            index = -1;
            var filteredObj = users.find(function (user, i) {
                if (element.id === user.id) {
                    index = i;
                    return i;
                }
            });
            return index === -1?true:false;
        });
    };
});

angular.module('ciscoExecDashApp').filter('sharedUserFilterForSearch', function () {
    return function (items, field, key1, key2) {
        if (field === undefined || field === null || field === '' || key1 === undefined || key1 === null || key2 === undefined || key2 === null) {
            return [];
        }
        if(items === undefined || items.length <=0){
            return [];
        }
        return items.filter(function (element) {
            return (element[key1].toLowerCase().includes(field.toLowerCase()) || (key2 !== null && element[key2].toLowerCase().includes(field.toLowerCase())) );
        });
    };
});


angular.module('ciscoExecDashApp').filter('bookmarkFilter', ['Bookmark', function (Bookmark) {
    return function (items, searchArray, key) {
        if ((searchArray === undefined || searchArray.length <= 0) && (key === undefined || key === null)) {
            return items;
        }
        return items.filter(function (element) {
            var bookmark = new Bookmark(element);
            var index;
            var searchItem = bookmark.getShowStatusAccToRecentPrevious(key);
            var serachArrayExsist = searchArray !== undefined && searchArray.length >= 1;
            if (searchItem) {
                if (serachArrayExsist){
                      index = -1;
                    var filteredObj = searchArray.find(function (item, i) {
                        if (item.id === bookmark.id) {
                            index = i;
                            return i;
                        }
                    });
                    return index >= 0 ? true : false;
                } else {
                    return true;
                }
            } else {
                return false;
            }
        });
    };
}
]);



angular.module('ciscoExecDashApp').filter('customDate', ['Bookmark', function (Bookmark) {
    return function (items, date) {
        if ((date === undefined || date === null ||date==='' )) {
            return items;
        }
        return items.filter(function (element) {
            var bookmark = new Bookmark(element);
            if(date < new Date(bookmark.modifiedDate)){
                return true;
            }else{
                return false;
            }
        });
    };
}
]);
