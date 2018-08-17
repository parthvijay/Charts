'use strict';

/**
 * @ngdoc overview
 * @name ciscoExecDashApp
 * @description
 * # ciscoExecDashApp
 *
 * Main module of the application.
 */
agGrid.LicenseManager.setLicenseKey("Intelligaia_Connected_Experience_1Devs10_November_2018__MTU0MTgwODAwMDAwMA==e1cd9ada2bc7a3572f5eac11c3a7bd09");
agGrid.initialiseAgGridWithAngular1(angular);
angular.module('ciscoExecDashApp', [
    'ngResource',
    'ngRoute',
    'ngAnimate',
    'ngSanitize',
    'ngTouch',
    'ui.bootstrap',
    'nya.bootstrap.select',
    'pascalprecht.translate',
    'angular-nicescroll',
    'angular-click-outside',
    'ngCookies',
    'ngSessionStorage',
    'rzModule',
    'ngFileUpload',
    'agGrid'
]);

angular.element(document).ready(function () {
    $.get('config/version.json', function (versionData) {
        if (typeof versionData === 'string') {
            var versionData;
            versionData = JSON.parse(versionData);
        }
        window.ciscoRewardsAppVersion = versionData.version;
        $.get('config/config.json', function (configData) {
            if (typeof configData === 'string') {
                var configData;
                configData = JSON.parse(configData);
            }
            window.ciscoConfig = configData;

            angular.module('ciscoExecDashApp').config([
                '$routeProvider',
                '$uibTooltipProvider',
                 '$translateProvider',
                 '$httpProvider',
                 '$compileProvider',
                function ($routeProvider, $uibTooltipProvider, $translateProvider, $httpProvider, $compileProvider) {
                    var $cookies;
                    angular.injector(['ngCookies']).invoke(['$cookies', function (_$cookies_) {
                        $cookies = _$cookies_;
                    }]);
                    $compileProvider.debugInfoEnabled(false);
                    var signInCookie = $cookies.get('ObSSOCookie');
                    if (signInCookie === "loggedoutcontinue" || signInCookie === undefined) {
                        window.location.reload();
                    }
                    $httpProvider.defaults.withCredentials = false;
                    // In terms of logoudcontinue , which means ObssoCookie hss been deleted, need to set with credentials header so that cookie is
                    //being set in the header and passed to REST as a header. - kD
                    if (configData.env === 4 || configData.env === 5 || configData.env === 6 || configData.env === 7 || configData.env === 8) {
                        $httpProvider.defaults.withCredentials = true;
                        if (configData.env === 4) {
                            (function () {
                                var walkme = document.createElement('script');
                                walkme.type = 'text/javascript';
                                walkme.async = true;
                                walkme.src = 'https://cdn.walkme.com/users/48b7950668df48868543ae1092766f49/test/walkme_48b7950668df48868543ae1092766f49_https.js';
                                var s = document.getElementsByTagName('script')[0];
                                s.parentNode.insertBefore(walkme, s);
                                window._walkmeConfig = { smartLoad: true };
                            })();
                        }
                        if (configData.env === 5) {
                            (function () {
                                var walkme = document.createElement('script');
                                walkme.type = 'text/javascript';
                                walkme.async = true;
                                walkme.src = 'https://cdn.walkme.com/users/48b7950668df48868543ae1092766f49/walkme_48b7950668df48868543ae1092766f49_https.js';
                                var s = document.getElementsByTagName('script')[0];
                                s.parentNode.insertBefore(walkme, s);
                                window._walkmeConfig = { smartLoad: true };
                            })();
                        }
                    }


                    var redirectCookie = $cookies.get('anchorvalue');
                    if (redirectCookie === '' || redirectCookie === undefined) {
                        redirectCookie = '/sales/analysis/asset';
                    }
                    else {
                        redirectCookie = redirectCookie.slice(1);
                        var stringPosition = redirectCookie.indexOf("?");

                        if (angular.isDefined(stringPosition)) {
                            var replaceString = redirectCookie.slice(stringPosition + 1);
                            var b;
                            if (replaceString === "bookmark=A0A080F42E6F13B3A2DF133F073095DD") {
                                b = "/122?";
                                replaceString = "bkmark=A0A080F42E6F13B3A2DF133F073095DD";
                                redirectCookie = [redirectCookie.slice(0, stringPosition), b, replaceString].join('');

                            }
                            if (replaceString === "bookmark=202CB962AC59075B964B07152D234B70") {
                                replaceString = "bkmark=202CB962AC59075B964B07152D234B70";
                                b = "/123?";
                                redirectCookie = [redirectCookie.slice(0, stringPosition), b, replaceString].join('');

                            }
                        }

                    }


                    $routeProvider
                        //the below block is to route to correct url when the bookmark created under performance tab - anilk
                        .when('/sales/analysis/:opportunity/:subopportunity/:performance*', {
                            controller: 'OpportunitiesController',
                            templateUrl: 'views/opportunities.html',
                            resolve: {
                                opportunities: ['OpportunitiesServ', function (OpportunitiesServ) {
                                    var r = OpportunitiesServ.getOverviewData({}, 'sales');
                                    return r;
                                }],
                                user: ['UserServ', function (UserServ) {
                                    return UserServ.getUserData();
                                }],
                                factory: function ($location) {
                                    if ($location.$$path.indexOf('/all') !== -1 && ($location.$$path.indexOf('/all') - $location.$$path.indexOf('analysis/') === 8)) {
                                        var temp = $location.$$path.replace('/all', '/asset');
                                        $location.path(temp);
                                    }
                                }
                            }
                        })

                        .when('/sales/analysis/:opportunity/:subopportunity?/:performance?', {
                            controller: 'OpportunitiesController',
                            templateUrl: 'views/opportunities.html',
                            resolve: {
                                opportunities: ['OpportunitiesServ', function (OpportunitiesServ) {
                                    var r = OpportunitiesServ.getOverviewData({}, 'sales');
                                    return r;
                                }],
                                user: ['UserServ', function (UserServ) {
                                    return UserServ.getUserData();
                                }],
                                factory: function ($location) {
                                    if ($location.$$path.indexOf('/all') !== -1 && ($location.$$path.indexOf('/all') - $location.$$path.indexOf('analysis/') === 8)) {
                                        var temp = $location.$$path.replace('/all', '/asset');
                                        $location.path(temp);
                                    }
                                }
                            }
                        })
                        .when('/sales/campaign/:opportunity', {
                            controller: 'CampaignController',
                            templateUrl: 'views/opportunities.html',
                            resolve: {
                                opportunities: ['OpportunitiesServ', function (OpportunitiesServ) {
                                    var r = OpportunitiesServ.getOverviewData({}, 'sales');
                                    return r;
                                }],
                                user: ['UserServ', function (UserServ) {
                                    return UserServ.getUserData();
                                }]
                            }
                        })
                        .when('/campaigns/securityRefresh', {
                            controller: 'SecurityRefreshController',
                            templateUrl: 'views/securityRefresh.html',
                            resolve: {
                                user: ['UserServ', function (UserServ) {
                                    return UserServ.getUserData();
                                }]
                            }
                        })
                        .when('/campaigns/collaborationRefresh', {
                            controller: 'CollaborationRefreshController',
                            templateUrl: 'views/collaborationRefresh.html',
                            resolve: {
                                user: ['UserServ', function (UserServ) {
                                    return UserServ.getUserData();
                                }]
                            }
                        })
                        .when('/campaigns/secondChance', {
                            controller: 'SecondChanceController',
                            templateUrl: 'views/secondChance.html',
                            resolve: {
                                user: ['UserServ', function (UserServ) {
                                    return UserServ.getUserData();
                                }]
                            }
                        })
                        .when('/services/analysis/:opportunity/:subopportunity?/:performance?', {
                            controller: 'ServicesController',
                            templateUrl: 'views/services.html',
                            resolve: {
                                opportunities: ['OpportunitiesServ', function (OpportunitiesServ) {
                                    var r = OpportunitiesServ.getOverviewData({}, 'services');
                                    return r;
                                }],
                                user: ['UserServ', function (UserServ) {
                                    return UserServ.getUserData();
                                }]
                            }
                        })
                        .when('/proxy', {
                            templateUrl: 'views/proxy.html'
                        })
                        .when('/proxy-user', {
                            controller: 'ProxyUserController',
                            templateUrl: 'views/proxy-user.html'
                        })
                        .when('/view-account/:opportunity', {
                            controller: 'ProgressViewController',
                            templateUrl: 'views/view-account.html'
                        })
                        .when('/view-progress', {
                            templateUrl: 'views/view-progress.html'
                        })
                        .when('/view-oppor-step1/:opportunity', {
                            controller: 'ConvertOpportunityStepOneController',
                            templateUrl: 'views/view-oppor-step1.html'
                        })
                        .when('/view-oppor-step2/:opportunity', {
                            controller: 'ConvertOpportunityStepTwoController',
                            templateUrl: 'views/view-oppor-step2.html'
                        })
                        .when('/view-oppor-step3/:opportunity', {
                            controller: 'ConvertOpportunityStepThreeController',
                            templateUrl: 'views/view-oppor-step3.html'
                        })
                        .when('/create-pipeline/:opportunity', {
                            controller: 'CreatePipelineController',
                            templateUrl: 'views/create-pipeline.html'
                        })
                        .when('/bookmarks', {
                            templateUrl: 'views/bookmarks.html',
                            resolve: {
                                user: ['UserServ', function (UserServ) {
                                    return UserServ.getUserData();
                                }]
                            }
                        })
                        .when('/global-bookmarks', {
                            controller: 'BookmarksController',
                            templateUrl: 'views/global-bookmarks.html'
                        })
                        .when('/campaigns', {
                            templateUrl: 'views/campaigns.html'
                        })
                        .when('/error-create/:opportunity', {
                            templateUrl: 'views/failed-error.html'
                        })
                        .otherwise({
                            redirectTo: redirectCookie
                        });

                    $uibTooltipProvider.options({
                        trigger: 'mouseenter',
                        appendToBody: true,
                        placement: 'auto'
                    });

                    $translateProvider.useSanitizeValueStrategy('escapeParameters');
                    $translateProvider.preferredLanguage('en-us');
                    $translateProvider.useStaticFilesLoader({
                        prefix: 'resources/messages_',
                        suffix: '.json'
                    });
                    $httpProvider.interceptors.push('RequestInterceptor');
                }
            ]);
            angular.module('ciscoExecDashApp').value('isMobile', /Mobi/.test(navigator.userAgent));

            angular.bootstrap(document, ['ciscoExecDashApp']);

        });
    });
});

angular.module('ciscoExecDashApp').run(['$route', '$rootScope', '$location',function ($route, $rootScope, $location) {
    var original = $location.path;
    $location.path = function (path, reload) {
        if (reload === false) {
            var lastRoute = $route.current;
            var un = $rootScope.$on('$locationChangeSuccess', function () {
                $route.current = lastRoute;
                un();
            });
        }
        return original.apply($location, [path]);
    };
}]);
