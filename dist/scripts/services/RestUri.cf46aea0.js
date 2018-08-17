'use strict';
angular.module('ciscoExecDashApp').service('RestUri', ['ConfigServ', function ($config) {
        var uriObj = {
                'filters'                       : '/filters',
                'sales-filter'                  : '/filters/sales',
                'sales-account-filter'          : '/filters/managers',
                'sales-filter-selected'         : '/filters/sales/select',
                'overview'                      : '/overview',
                'opportunities'                 : '/opportunities/',
                'user'                          : '/user',
                'search-proxy-user'             : '/proxyusersearch',
                'performance'                   : '/performance/',
                'campaign'                      : '/campaign/',
                'sld'                           : '/sld/',
                'smart-ib-report'               : '/reportCenter/customerView/smartIBReport/',
                'customer-report'               : '/reportCenter/customerView/customerDetailReport/',
                'action-metrics-report'         : '/opportunities/actionmetricsreport/',
                'sales-customer-report'         : '/reportCenter/salesView/iBInventoryReport/',
                'am-customer-report'            : '/reportCenter/amView/iBInventoryReport/',
                'expanded-customer-view'        : '/opportunities/expandedView/' ,
                'customer-detail'               : '/opportunities/customerDetails/',
                'expanded-customer-view-campaign' : '/campaign/expandedView/' ,
                'customer-detail-campaign'      : '/campaign/customerDetails/',
                'total-contracts'               : '/opportunities/contractDetails/',
                'technology-ib'                 : '/opportunities/technologiesByIB/',
                'ref-creation'                  : '/opportunities/refId/',
                'sfdc-accounts-api'             : '/pipeline/accounts',
                'sfdc-products-api'             : '/opportunity/products',
                'create-opp'                    : '/opportunities/createOpp/',
                'bookmark'                      : '/bookmarks?bookmarkType=',
                'count'                         : '/bookmarks/count',
                'sales-advanced-filters'        : '/filters/sales',
                'sales-advanced-am-filters'     : '/filters/accountManager',
                'sales-advanced-savm-filters'   : '/filters/savm',
                'account-install-filters'       : '/filters/sites',
                'saveBookmark'                  : '/bookmarks/create',
                'delete-bookmark'               : '/bookmarks/delete/',
                'favorite-bookmark'             : '/bookmarks/update/fav/',
                'setRecent-bookmark'            : '/bookmarks/update/recent/',
                'update-bookmark'               : '/bookmarks/update/',
                'search-user'                   : '/userDetails?searchType=',
                'search-mailer'                 : '/mailerDetails',
                'share-bookmark'                : '/bookmarks/share',
                'remove-share'                  : '/bookmarks/unshare/',
                'search-bookmark'               : '/bookmarks/search',
                'bookmark-by-id'                : '/bookmarks/',
                'period'                        : '/period',
                'total-rate-progression'        : '/performance/totalRenew/rateProgression',
                'total-rate-by-sales'           : '/performance/totalRenew/rateBySales',
                'total-in-quarter-renewal-rate'  : '/performance/totalRenew/inQuarterRenewalRate',
                'rate-progression'              : '/performance/tsRenew/rateProgression',
                'rate-by-sales'                 : '/performance/tsRenew/rateBySales',
                'ts-in-quarter-renewal-rate'    : '/performance/tsRenew/inQuarterRenewalRate',
                'swss-rate-progression'         : '/performance/swssRenew/rateProgression',
                'swss-rate-by-sales'            : '/performance/swssRenew/rateBySales',
                'swss-rate-by-arch'             : '/performance/swssRenew/architecture',
                'swss-in-quarter-renewal-rate'  : '/performance/swssRenew/inQuarterRenewalRate',
                'attach-performance'            : '/performance/tsAttach/updated',
                'in-quarter-totalattach-rate'    : '/performance/totalAttach/inQuarterAttachRate',
                'in-quarter-attach-rate'        : '/performance/tsAttach/inQuarterAttachRate',
                'in-quarter-swssattach-rate'    : '/performance/swssAttach/inQuarterAttachRate',
                'attach-rate-sales'             : '/performance/tsAttach/attachRateBySalesLevel',
                'attach-rate-warranty'          : '/performance/tsAttach/warranty',
                'renew-chart-interaction'       : '/performance/tsRenew/bookingsByQuarter',
                'attach-customer'               : '/performance/tsAttach/bookingsByCustomers',
                'attach-customer-selection'     : '/performance/tsAttach/serviceSoldByMonth',
                'average-days-to-attach-sales'  : '/performance/tsAttach/averageRate/sales',
                'average-days-to-attach-customer': '/performance/tsAttach/averageRate/customer',
                'average-days-to-swssAttach-sales'   : '/performance/swssAttach/averageRate/sales',
                'average-days-to-swssAttach-customer': '/performance/swssAttach/averageRate/customer',
                'security-refresh-Sales'        : '/campaigns/SRSalesPlaysBySalesLevel',
                'security-refresh-Customer'     : '/campaigns/SRSalesPlaysByCustomer',
                'collab-refresh-Sales'        : '/campaigns/CRSalesPlaysBySalesLevel',
                'collab-refresh-Customer'     : '/campaigns/CRSalesPlaysByCustomer',
                'logout-url'                     : '/logout' ,
                'ciscoOne-mcr'                   : '/campaign/ciscoOne/mcr',
                'uploadPid'                     :  '/upload/pids',
                'collab-bookmark-autofill'       : '/collabProposal',
                'collab-report'                 : '/reportCenter/customerView/createCollabProposal/',
                'Suite'                         : '/filters/suite',
                'Vertical Market'               : '/filters/verticalMarket',
                'GU Name'                       : '/filters/savm',
                'second-chance-sales'           : '/secondChance/sales',
                'second-chance-customer'        : '/secondChance/customer',
                'second-chance-partner'         : '/secondChance/partner',
        };

        var serviceObj = {};

        serviceObj.getUri = function (apiKey) {
                if ($config.env === 0) {
                        return null;
                }
                var uri = uriObj[apiKey];
                if (uri) {
                        return $config.apiDomain[$config.env] + uri;
                } else {
                        return null;
                }
        };

        serviceObj.getSFDCUri = function (apiKey) {
                if ($config.sfdcEnvKey === 0) {
                        return null;
                }
                var uri = uriObj[apiKey];
                if (uri) {
                        return $config.sdfc_env_details[$config.sfdcEnvKey].url + uri;
                } else {
                        return null;
                }
        };

        return serviceObj;
}]);