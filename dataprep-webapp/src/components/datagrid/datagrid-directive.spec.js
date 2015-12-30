describe('Datagrid directive', function () {
    'use strict';

    var stateMock, dataViewMock, scope, createElement, element, grid, createdColumns = [{id: 'tdpId'}, {
        id: '0000',
        tdpColMetadata: {id: '0000'}
    }, {id: '0001', tdpColMetadata: {id: '0001'}}, {id: '0002', tdpColMetadata: {id: '0002'}}];

    beforeEach(function () {
        dataViewMock = new DataViewMock();
        spyOn(dataViewMock.onRowCountChanged, 'subscribe').and.returnValue();
        spyOn(dataViewMock.onRowsChanged, 'subscribe').and.returnValue();
    });

    beforeEach(module('data-prep.datagrid', function ($provide) {
        stateMock = {
            playground: {
                filter: {gridFilters: []},
                grid: {dataView: dataViewMock, selectedColumn : {id: '0001'}, selectedLine : {'0001': '1'}},
                lookup: {visibility: false}
            }
        };
        $provide.constant('state', stateMock);
    }));

    beforeEach(module('htmlTemplates'));

    beforeEach(inject(function ($rootScope, $compile, DatagridGridService, DatagridColumnService, DatagridSizeService, DatagridStyleService, DatagridExternalService, StateService) {
        scope = $rootScope.$new();
        createElement = function () {
            element = angular.element('<datagrid></datagrid>');
            $compile(element)(scope);
            scope.$digest();

            angular.element('body').append(element);
            return element;
        };

        // decorate grid creation to keep the resulting grid ref and attach spy on its functions
        var realInitGrid = DatagridGridService.initGrid;
        DatagridGridService.initGrid = function (parentId) {
            grid = realInitGrid(parentId);
            spyOn(grid, 'invalidate').and.returnValue();
            spyOn(grid, 'scrollRowToTop').and.returnValue();
            spyOn(grid, 'resizeCanvas').and.returnValue();

            return grid;
        };

        spyOn(DatagridGridService, 'initGrid').and.callThrough();
        spyOn(DatagridGridService, 'navigateToFocusedColumn').and.returnValue();
        spyOn(DatagridColumnService, 'createColumns').and.returnValue(createdColumns);
        spyOn(DatagridColumnService, 'renewAllColumns').and.returnValue();
        spyOn(DatagridSizeService, 'autosizeColumns').and.returnValue();
        spyOn(DatagridStyleService, 'updateColumnClass').and.returnValue();
        spyOn(DatagridStyleService, 'resetCellStyles').and.returnValue();
        spyOn(DatagridStyleService, 'scheduleHighlightCellsContaining').and.returnValue();
        spyOn(DatagridExternalService, 'updateSuggestionPanel').and.returnValue();
        spyOn(StateService, 'setGridSelection').and.returnValue();
    }));

    beforeEach(function () {
        jasmine.clock().install();
    });

    afterEach(function () {
        jasmine.clock().uninstall();

        scope.$destroy();
        element.remove();
    });

    describe('on data change', function () {
        var data;

        beforeEach(inject(function () {
            //given
            createElement();
            data = {metadata: {columns: [{id: '0000'}, {id: '0001', tdpColMetadata: {id: '0001'}}]}, preview: false};

            //when
            stateMock.playground.data = data;
            scope.$digest();
            jasmine.clock().tick(1);
        }));

        describe('init', function () {
            it('should init grid', inject(function (DatagridGridService) {
                //then
                expect(DatagridGridService.initGrid).toHaveBeenCalledWith('#datagrid');
            }));

            it('should init grid only once', inject(function (DatagridService, DatagridGridService) {
                //given
                expect(DatagridGridService.initGrid.calls.count()).toBe(1);

                //when
                stateMock.playground.data = {};
                scope.$digest();

                //then
                expect(DatagridGridService.initGrid.calls.count()).toBe(1);
            }));

            it('should init tooltip ruler', inject(function (DatagridTooltipService) {
                //then
                expect(DatagridTooltipService.tooltipRuler).toBeDefined();
            }));
        });

        describe('grid update', function () {

            describe('column creation', function () {
                it('should create new columns', inject(function (DatagridColumnService) {
                    //then
                    expect(DatagridColumnService.createColumns).toHaveBeenCalledWith(data.metadata.columns, data.preview);
                }));

                it('should reset renew all columns flag', inject(function (DatagridColumnService) {
                    //then
                    expect(DatagridColumnService.renewAllColumns).toHaveBeenCalledWith(false);
                }));
            });

            describe('column style', function () {
                it('should reset cell styles when there is a selected cell onDataChange', inject(function (DatagridStyleService) {
                    //when
                    stateMock.playground.data = {metadata:{}};
                    scope.$digest();
                    //then
                    expect(DatagridStyleService.scheduleHighlightCellsContaining).toHaveBeenCalledWith('0001', '1');
                }));

                it('should reset cell styles when there is a selected cell onSelectChange', inject(function (DatagridStyleService) {
                    //when
                    stateMock.playground.grid.selectedLine = {'0001': '2'};
                    scope.$digest();
                    //then
                    expect(DatagridStyleService.scheduleHighlightCellsContaining).toHaveBeenCalledWith('0001', '2');
                }));

                it('should update selected column style onDataChange', inject(function (DatagridService, DatagridStyleService) {
                    //when
                    stateMock.playground.data = {metadata:{}};
                    scope.$digest();

                    //then
                    expect(DatagridStyleService.updateColumnClass).toHaveBeenCalledWith(createdColumns, data.metadata.columns[1]);
                }));

                it('should update selected column style onSelectChange', inject(function (DatagridService, DatagridStyleService) {
                    //when
                    stateMock.playground.grid.selectedColumn = {id: '0000'};
                    scope.$digest();

                    //then
                    expect(DatagridStyleService.updateColumnClass).toHaveBeenCalled();
                }));
            });

            describe('column size', function () {
                it('should auto size created columns (and set them in grid, done by autosize() function)', inject(function (DatagridSizeService) {
                    //then
                    expect(DatagridSizeService.autosizeColumns).toHaveBeenCalledWith(createdColumns);
                }));
            });

            it('should execute the grid update only once when the second call is triggered before the first timeout', inject(function (DatagridService, DatagridGridService, DatagridColumnService, DatagridExternalService) {
                //given
                expect(DatagridColumnService.createColumns.calls.count()).toBe(1);
                expect(DatagridExternalService.updateSuggestionPanel.calls.count()).toBe(1);
                expect(DatagridGridService.navigateToFocusedColumn.calls.count()).toBe(0);

                //when
                stateMock.playground.data = {};
                scope.$digest();

                expect(DatagridColumnService.createColumns.calls.count()).toBe(1);
                expect(DatagridExternalService.updateSuggestionPanel.calls.count()).toBe(1);
                expect(DatagridGridService.navigateToFocusedColumn.calls.count()).toBe(0);

                stateMock.playground.data = {metadata:{}};
                scope.$digest();
                jasmine.clock().tick(300);

                //then
                expect(DatagridColumnService.createColumns.calls.count()).toBe(2);
                expect(DatagridExternalService.updateSuggestionPanel.calls.count()).toBe(2);
                expect(DatagridGridService.navigateToFocusedColumn.calls.count()).toBe(1);
            }));
        });

        describe('column focus', function () {
            it('should navigate in the grid to show the interesting column after a 300ms delay', inject(function (DatagridGridService) {
                //given
                expect(DatagridGridService.navigateToFocusedColumn).not.toHaveBeenCalled();

                //when
                jasmine.clock().tick(300);

                //then
                expect(DatagridGridService.navigateToFocusedColumn).toHaveBeenCalled();
            }));
        });

        describe('external trigger', function () {

            it('should update suggestion panel when there is a selected column', inject(function (DatagridService, DatagridStyleService, DatagridExternalService) {
                //given
                stateMock.playground.grid.selectedColumn = {id: '0001'};
                stateMock.playground.grid.selectedLine = {tdpId: 1};

                //when
                stateMock.playground.data = {metadata:{}};
                scope.$digest();
                jasmine.clock().tick(1);

                //then
                expect(DatagridExternalService.updateSuggestionPanel).toHaveBeenCalledWith(null, true);
            }));

            it('should NOT update suggestion panel when in preview mode', inject(function (DatagridService, DatagridStyleService, DatagridExternalService) {
                //given
                expect(DatagridExternalService.updateSuggestionPanel.calls.count()).toBe(1);

                //when
                stateMock.playground.data = {metadata:{}, preview: true};
                scope.$digest();
                jasmine.clock().tick(1);

                //then
                expect(DatagridExternalService.updateSuggestionPanel.calls.count()).toBe(1);
            }));
        });
    });

    describe('on metadata change', function () {
        beforeEach(function () {
            //given
            createElement();
            stateMock.playground.data = {metadata: {columns: [{id: '0000'}, {id: '0001'}]}, preview: false};
            scope.$digest();

            //when
            stateMock.playground.dataset = {};
            scope.$digest();
        });

        it('should reset cell styles', inject(function (DatagridStyleService) {
            //then
            expect(DatagridStyleService.resetCellStyles).toHaveBeenCalled();
        }));

        it('should scroll to top', function () {
            //then
            expect(grid.scrollRowToTop).toHaveBeenCalledWith(0);
        });

        it('should force column recreation (no reuse)', inject(function (DatagridColumnService) {
            //then
            expect(DatagridColumnService.renewAllColumns).toHaveBeenCalledWith(true);
        }));
    });

    describe('on lookup visibility change', function () {
        it('should resize grid canvas', inject(function () {
            //given
            createElement();
            stateMock.playground.data = {metadata: {columns: [{id: '0000'}, {id: '0001'}]}, preview: false};
            scope.$digest();

            jasmine.clock().tick(250);
            expect(grid.resizeCanvas).not.toHaveBeenCalled();

            //when
            stateMock.playground.lookup.visibility = true;
            scope.$digest();
            jasmine.clock().tick(250);

            //then
            expect(grid.resizeCanvas).toHaveBeenCalled();
        }));
    });

    describe('on filter change', function () {
        beforeEach(function () {
            //given
            createElement();
            stateMock.playground.data = {metadata: {columns: [{id: '0000'}, {id: '0001'}]}, preview: false};
            scope.$digest();

            //when
            stateMock.playground.filter.gridFilters = [{}];
            scope.$digest();
        });

        it('should reset cell styles', inject(function (DatagridStyleService) {
            //then
            expect(DatagridStyleService.resetCellStyles).toHaveBeenCalled();
        }));

        it('should scroll to top', function () {
            //then
            expect(grid.scrollRowToTop).toHaveBeenCalledWith(0);
        });
    });
});
