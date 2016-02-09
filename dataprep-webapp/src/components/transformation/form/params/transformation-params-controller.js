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
     * @ngdoc controller
     * @name data-prep.transformation-form.controller:TransformParamsCtrl
     * @description Transformation parameters controller.
     */
    function TransformParamsCtrl() {
        var vm = this;

        /**
         * @ngdoc method
         * @name getParameterType
         * @methodOf data-prep.transformation-form.controller:TransformParamsCtrl
         * @description Return the parameter type to display
         * @param {object} parameter The parameter
         */
        vm.getParameterType = function(parameter) {
            var type = parameter.type.toLowerCase();
            switch (type) {
                case 'select':
                case 'cluster':
                case 'date':
                case 'column':
                case 'regex':
                    return type;
                default:
                    return 'simple';
            }
        };

    }

    angular.module('data-prep.transformation-form')
        .controller('TransformParamsCtrl', TransformParamsCtrl);
})();