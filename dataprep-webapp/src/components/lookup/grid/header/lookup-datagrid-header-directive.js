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
     * @name data-prep.lookup-datagrid-header.directive:DatagridHeader
     * @description This directive creates the lookup datagrid column header
     * @restrict E
     * @usage
     <lookup-datagrid-header
     added="added"
     column="column">
     </lookup-datagrid-header>
     * @param {object} column The column metadata
     * @param {object} added checkbox ng-model
     */
    function LookupDatagridHeader() {
        return {
            restrict: 'E',
            templateUrl: 'components/lookup/grid/header/lookup-datagrid-header.html',
            scope: {
                column: '=',
                added: '='
            },
            bindToController: true,
            controllerAs: 'lookupDatagridHeaderCtrl',
            controller: 'LookupDatagridHeaderCtrl',
            link: function (scope, iElement) {
                var addToLookupDiv, addToLookupCheckbox;
                setTimeout(function () {
                    addToLookupDiv = iElement.find('.add-to-lookup');
                    addToLookupDiv.on('click', function(e){
                        e.stopPropagation();
                        addToLookupCheckbox = addToLookupDiv.find('input[type=checkbox]');
                        if(addToLookupCheckbox){
                            addToLookupCheckbox.click();
                        }
                    });
                }, 250);
            }
        };
    }

    angular.module('data-prep.lookup-datagrid-header')
        .directive('lookupDatagridHeader', LookupDatagridHeader);
})();
