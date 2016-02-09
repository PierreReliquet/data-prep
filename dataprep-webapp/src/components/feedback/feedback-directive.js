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
     * @ngdoc directive
     * @name data-prep.datagrid.directive:Feedback
     * @description This directive create a feedback form
     * @restrict E
     * @usage <feedback></feedback>
     */
    function Feedback() {
        return {
            templateUrl: 'components/feedback/feedback.html',
            restrict: 'E',
            bindToController: true,
            controllerAs: 'feedbackCtrl',
            controller: 'FeedbackCtrl'
        };
    }

    angular.module('data-prep.feedback')
        .directive('feedback', Feedback);
})();