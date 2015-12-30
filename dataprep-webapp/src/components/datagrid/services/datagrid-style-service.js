(function () {
    'use strict';

    /**
     * @ngdoc service
     * @name data-prep.datagrid.service:DatagridStyleService
     * @description Datagrid private service that manage the grid style
     * @requires data-prep.services.playground.service:DatagridService
     * @requires data-prep.services.utils.service:ConverterService
     * @requires data-prep.services.utils.service:TextFormatService
     */
    function DatagridStyleService(DatagridService, state, ConverterService, TextFormatService) {
        var grid;
        var highlightCellTimeout;

        return {
            init: init,
            resetCellStyles: resetCellStyles,
            updateColumnClass: updateColumnClass,
            columnFormatter: columnFormatter,
            getColumnPreviewStyle: getColumnPreviewStyle,
            scheduleHighlightCellsContaining: scheduleHighlightCellsContaining,
            updateSelectedColumnStyle: updateSelectedColumnStyle
        };

        //--------------------------------------------------------------------------------------------------------------

        /**
         * @ngdoc method
         * @name resetCellStyles
         * @methodOf data-prep.datagrid.service:DatagridStyleService
         * @description Reset the cells css
         */
        function resetCellStyles() {
            grid.resetActiveCell();
            grid.setCellCssStyles('highlight', {});
        }

        /**
         * @ngdoc method
         * @name addClass
         * @methodOf data-prep.datagrid.service:DatagridStyleService
         * @description Add a css class to a column
         * @param {object} column The target column
         * @param {string} newClass The class to add
         */
        function addClass(column, newClass) {
            column.cssClass = (column.cssClass || '') + ' ' + newClass;
        }

        /**
         * @ngdoc method
         * @name updateSelectionClass
         * @methodOf data-prep.datagrid.service:DatagridStyleService
         * @description Add 'selected' class if the column is the selected one
         * @param {object} column The target column
         * @param {object} selectedCol The selected column
         */
        function updateSelectionClass(column, selectedCol) {
            if (column === selectedCol) {
                addClass(column, 'selected');
            }
        }

        /**
         * @ngdoc method
         * @name updateNumbersClass
         * @methodOf data-prep.datagrid.service:DatagridStyleService
         * @description Add the 'number' class to the column if its type is a number type
         * @param {object} column the target column
         */
        function updateNumbersClass(column) {
            var simplifiedType = ConverterService.simplifyType(column.tdpColMetadata.type);
            if (simplifiedType === 'integer' || simplifiedType === 'decimal') {
                addClass(column, 'numbers');
            }
        }

        /**
         * @ngdoc method
         * @name updateColumnClass
         * @methodOf data-prep.datagrid.service:DatagridStyleService
         * @description Set style classes on columns depending on its state (type, selection, ...)
         * @param {object} columns The columns array
         * @param {object} selectedCol The grid selected column
         */
        function updateColumnClass(columns, selectedCol) {
            _.forEach(columns, function (column) {
                if (column.id === 'tdpId') {
                    column.cssClass = 'index-column';
                }
                else {
                    column.cssClass = null;
                    updateSelectionClass(column, selectedCol);
                    updateNumbersClass(column);
                }
            });
        }

        /**
         * @ngdoc method
         * @name columnFormatter
         * @methodOf data-prep.datagrid.service:DatagridStyleService
         * @description Value formatter used in SlickGrid column definition. This is called to get a cell formatted value
         * @param {object} col The column to format
         */
        function columnFormatter(col) {

            var invalidValues = col.quality.invalidValues;
            var isInvalid = function isInvalid(value) {
                return invalidValues.indexOf(value) >= 0;
            };

            return function formatter(row, cell, value, columnDef, dataContext) {
                //hidden characters need to be shown
                var returnStr = TextFormatService.adaptToGridConstraints(value);

                //entire row modification preview
                switch (dataContext.__tdpRowDiff) {
                    case 'delete':
                        return '<div class="cellDeletedValue">' + (returnStr ? returnStr : ' ') + '</div>';
                    case 'new':
                        return '<div class="cellNewValue">' + (returnStr ? returnStr : ' ') + '</div>';
                }

                //cell modification preview
                if (dataContext.__tdpDiff && dataContext.__tdpDiff[columnDef.id]) {
                    switch (dataContext.__tdpDiff[columnDef.id]) {
                        case 'update':
                            return '<div class="cellUpdateValue">' + returnStr + '</div>';
                        case 'new':
                            return '<div class="cellNewValue">' + returnStr + '</div>';
                        case 'delete':
                            return '<div class="cellDeletedValue">' + (returnStr ? returnStr : ' ') + '</div>';
                    }
                }

                return returnStr + (isInvalid(value) ? '<div title="Invalid Value" class="red-rect"></div>' : '<div class="invisible-rect"></div>');
            };
        }

        /**
         * @ngdoc method
         * @name getColumnPreviewStyle
         * @methodOf data-prep.datagrid.service:DatagridStyleService
         * @description Get the column header preview style
         * @param {object} col The column metadata
         */
        function getColumnPreviewStyle(col) {
            switch (col.__tdpColumnDiff) {
                case 'new':
                    return 'newColumn';
                case 'delete':
                    return 'deletedColumn';
                case 'update':
                    return 'updatedColumn';
                default:
                    return '';
            }
        }

        /**
         * @ngdoc method
         * @name attachColumnHeaderCallback
         * @methodOf data-prep.datagrid.service:DatagridStyleService
         * @description attachColumnHeaderListeners callback
         */
        function updateSelectedColumnStyle() {
            resetCellStyles();
            updateColumnClass(grid.getColumns(),  _.find(grid.getColumns(), {id: state.playground.grid.selectedColumn.id}));
            grid.invalidate();
        }

        /**
         * @ngdoc method
         * @name scheduleHighlightCellsContaining
         * @methodOf data-prep.datagrid.service:DatagridStyleService
         * @param {String} colId The column id
         * @param {String} content The value to highlight
         * @description Cancel the previous scheduled task and schedule a new one to highlight the cells that contains the same value as the (rowIndex, colIndex) cell
         */
        function scheduleHighlightCellsContaining(colId, content) {
            clearTimeout(highlightCellTimeout);

            highlightCellTimeout = setTimeout(function() {
                var sameContentConfig = DatagridService.getSameContentConfig(colId, content, 'highlight');
                grid.setCellCssStyles('highlight', sameContentConfig);
            }, 200);
        }

        /**
         * @ngdoc method
         * @name init
         * @methodOf data-prep.datagrid.service:DatagridStyleService
         * @param {object} newGrid The new grid
         * @description Initialize the grid and attach the style listeners
         */
        function init(newGrid) {
            grid = newGrid;
        }
    }

    angular.module('data-prep.datagrid')
        .service('DatagridStyleService', DatagridStyleService);
})();