/*  ============================================================================

  Copyright (C) 2006-2016 Talend Inc. - www.talend.com

  This source code is available under agreement available at
  https://github.com/Talend/data-prep/blob/master/LICENSE

  You should have received a copy of the agreement
  along with this program; if not, write to Talend SA
  9 rue Pages 92150 Suresnes, France

  ============================================================================*/

(function () {
    'use strict';

    /**
     * @ngdoc service
     * @name data-prep.services.utils.filter:MessageService
     * @description Display message toasts
     */
    function TDPMoment() {
        return function (dateString, format) {
            return moment(dateString, format ? format : 'x').fromNow();
        };
    }

    angular.module('data-prep.services.utils')
        .filter('TDPMoment', TDPMoment);
})();