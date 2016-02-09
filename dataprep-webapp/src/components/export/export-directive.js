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
     * @name data-prep.datagrid.directive:Export
     * @description This directive create the Export<br/>
     * @restrict E
     * @usage <export></export>
     */
    function Export() {
        return {
            templateUrl: 'components/export/export.html',
            restrict: 'E',
            bindToController: true,
            controllerAs: 'exportCtrl',
            controller: 'ExportCtrl',
            link: function(scope, iElement, iAttrs, ctrl) {
                ctrl.form = iElement.find('#exportForm').eq(0)[0];
            }
        };
    }

    angular.module('data-prep.export')
        .directive('export', Export);
})();