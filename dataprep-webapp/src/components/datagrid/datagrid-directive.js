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
     * @name data-prep.datagrid.directive:Datagrid
     * @description This directive create the SlickGrid datagrid<br/>
     * Watchers :
     * <ul>
     *         <li>Grid header directive list : insert grid header in SlickGrid headers</li>
     *         <li>Grid Metadata : it means the loaded dataset has changed, the styles are reset</li>
     *         <li>Grid data : update grid headers and styles</li>
     *         <li>Filters : reset the styles</li>
     * </ul>
     *
     * @requires data-prep.state.service:state
     * @requires data-prep.datagrid.service:DatagridGridService
     * @requires data-prep.datagrid.service:DatagridColumnService
     * @requires data-prep.datagrid.service:DatagridStyleService
     * @requires data-prep.datagrid.service:DatagridSizeService
     * @requires data-prep.datagrid.service:DatagridTooltipService
     * @requires data-prep.datagrid.service:DatagridExternalService
     * @restrict E
     */
    function Datagrid(state, DatagridGridService, DatagridColumnService, DatagridStyleService, DatagridSizeService,
                      DatagridTooltipService, DatagridExternalService) {
        return {
            restrict: 'E',
            templateUrl: 'components/datagrid/datagrid.html',
            bindToController: true,
            controllerAs: 'datagridCtrl',
            controller: 'DatagridCtrl',
            link: function (scope, iElement) {
                var grid;
                var columnTimeout, columnStyleTimeout, cellHighlightTimeout, externalTimeout, focusTimeout;

                //------------------------------------------------------------------------------------------------------
                //--------------------------------------------------GETTERS---------------------------------------------
                //------------------------------------------------------------------------------------------------------
                /**
                 * @ngdoc method
                 * @name getMetadata
                 * @methodOf data-prep.datagrid.directive:Datagrid
                 * @description Get the loaded metadata
                 */
                function getMetadata() {
                    return state.playground.dataset;
                }

                /**
                 * @ngdoc method
                 * @name getSelectedColumn
                 * @methodOf data-prep.datagrid.directive:Datagrid
                 * @description Get the selected column
                 */
                function getSelectedColumn() {
                    return state.playground.grid.selectedColumn;
                }

                /**
                 * @ngdoc method
                 * @name getSelectedColumn
                 * @methodOf data-prep.datagrid.directive:Datagrid
                 * @description Get the selected column
                 */
                function getSelectedLine() {
                    return state.playground.grid.selectedLine;
                }

                /**
                 * @ngdoc method
                 * @name getData
                 * @methodOf data-prep.datagrid.directive:Datagrid
                 * @description Get the loaded data
                 */
                function getData() {
                    return state.playground.data;
                }

                /**
                 * @ngdoc method
                 * @name getFilters
                 * @methodOf data-prep.datagrid.directive:Datagrid
                 * @description Get the filter list
                 */
                function getFilters() {
                    return state.playground.filter.gridFilters;
                }

                /**
                 * @ngdoc method
                 * @name getResizeCondition
                 * @methodOf data-prep.datagrid.directive:Datagrid
                 * @description Return condition that trigger a grid resize
                 */
                function getResizeCondition() {
                    return state.playground.lookup.visibility;
                }

                //------------------------------------------------------------------------------------------------------
                //---------------------------------------------------UTILS----------------------------------------------
                //------------------------------------------------------------------------------------------------------
                /**
                 * @ngdoc method
                 * @name onMetadataChange
                 * @methodOf data-prep.datagrid.directive:Datagrid
                 * @description Reset cell styles, scroll to top and expect to recreate all columns on next update
                 */
                var onMetadataChange = function onMetadataChange() {
                    if (grid) {
                        grid.scrollRowToTop(0);
                        DatagridColumnService.renewAllColumns(true);
                    }
                };

                /**
                 * @ngdoc method
                 * @name onDataChange
                 * @methodOf data-prep.datagrid.directive:Datagrid
                 * @description Update and resize the columns with its headers, set grid styles
                 */
                var onDataChange = function onDataChange(data) {
                    if (data) {
                        initGridIfNeeded();

                        //create columns
                        clearTimeout(columnTimeout);
                        columnTimeout = setTimeout(function () {
                            var columns = DatagridColumnService.createColumns(data.metadata.columns, data.preview);
                            DatagridSizeService.autosizeColumns(columns); // IMPORTANT : this set columns in the grid
                            DatagridColumnService.renewAllColumns(false);

                            var selectedColumnId = getSelectedColumn() && getSelectedColumn().id;
                            DatagridStyleService.updateColumnClass(selectedColumnId);
                            grid.invalidate();
                        }, 0);

                        //focus specific column
                        clearTimeout(focusTimeout);
                        focusTimeout = setTimeout(DatagridGridService.navigateToFocusedColumn, 300);
                    }
                };

                /**
                 * @ngdoc method
                 * @name onFiltersChange
                 * @methodOf data-prep.datagrid.directive:Datagrid
                 * @description Refresh cell styles and scroll to top
                 */
                var onFiltersChange = function onFiltersChange() {
                    if (grid) {
                        DatagridStyleService.resetCellStyles();
                        grid.scrollRowToTop(0);
                    }
                };

                /**
                 * @ngdoc method
                 * @name onColumnSelectionChange
                 * @methodOf data-prep.datagrid.directive:Datagrid
                 * @description Refresh selected column grid styles
                 */
                var onColumnSelectionChange = function onColumnSelectionChange() {
                    if (grid) {
                        //Update column style
                        clearTimeout(columnStyleTimeout);
                        columnStyleTimeout = setTimeout(function() {
                            var selectedColumnId = getSelectedColumn() && getSelectedColumn().id;

                            if(getSelectedLine()) {
                                DatagridStyleService.updateColumnClass(selectedColumnId);
                            }
                            else {
                                DatagridStyleService.resetStyles(selectedColumnId);
                            }
                            grid.invalidate();
                        }, 0);

                        //manage column selection (external)
                        clearTimeout(externalTimeout);
                        if (getData() && !getData().preview) {
                            externalTimeout = setTimeout(DatagridExternalService.updateSuggestionPanel.bind(null, true), 300);
                        }
                    }
                };

                /**
                 * @ngdoc method
                 * @name onSelectionChange
                 * @methodOf data-prep.datagrid.directive:Datagrid
                 * @description Refresh the cell highlight
                 */
                var onSelectionChange = function onSelectionChange() {
                    if (grid) {
                        clearTimeout(cellHighlightTimeout);
                        var stateSelectedLine = getSelectedLine();
                        if (getData() && !getData().preview && stateSelectedLine) {
                            cellHighlightTimeout = setTimeout(function() {
                                var colId = getSelectedColumn() && getSelectedColumn().id;
                                DatagridStyleService.highlightCellsContaining(colId, stateSelectedLine[colId]);
                            }, 500);
                        }
                    }
                };

                /**
                 * @ngdoc method
                 * @name resize
                 * @methodOf data-prep.datagrid.directive:Datagrid
                 * @description Resize grid canvas
                 */
                function resize() {
                    if (grid) {
                        setTimeout(function () {
                            grid.resizeCanvas();
                        }, 250);
                    }
                }

                //------------------------------------------------------------------------------------------------------
                //---------------------------------------------------INIT-----------------------------------------------
                //------------------------------------------------------------------------------------------------------
                /**
                 * @ngdoc method
                 * @name initGridIfNeeded
                 * @methodOf data-prep.datagrid.directive:Datagrid
                 * @description Init Slick grid and init datagrid private services.
                 */
                var initGridIfNeeded = function () {
                    if (!grid) {
                        grid = DatagridGridService.initGrid('#datagrid');

                        // the tooltip ruler is used compute a cell text regardless of the font and zoom used.
                        // To do so, the text is put into an invisible span so that the span can be measured.
                        DatagridTooltipService.tooltipRuler = iElement.find('#tooltip-ruler').eq(0);
                    }
                };

                //------------------------------------------------------------------------------------------------------
                //-------------------------------------------------WATCHERS---------------------------------------------
                //------------------------------------------------------------------------------------------------------

                /**
                 * Scroll to top when loaded dataset change
                 */
                scope.$watch(getMetadata, onMetadataChange);

                /**
                 * Update grid columns and invalidate grid on data change
                 */
                scope.$watch(getData, onDataChange);

                /**
                 * When filter change, displayed values change, so we reset active cell and cell styles
                 */
                scope.$watch(getFilters, onFiltersChange);

                /**
                 * When lookup is displayed/hidden changes, the grid should be resized fit available space
                 */
                scope.$watch(getResizeCondition, resize);

                /**
                 * when a new column is selected
                 */
                scope.$watch(getSelectedColumn, onColumnSelectionChange);

                /**
                 * when the active cell change
                 */
                scope.$watchGroup([getSelectedLine, getSelectedColumn], onSelectionChange);

            }
        };
    }

    angular.module('data-prep.datagrid')
        .directive('datagrid', Datagrid);
})();

