/*jshint camelcase: false */

describe('Transform menu controller', function () {
    'use strict';

    var createController, scope, $httpBackend;

    var metadata = {
        'id': '44f5e4ef-96e9-4041-b86a-0bee3d50b18b',
        'name': 'customers_jso_light',
        'author': 'anonymousUser',
        'records': 15,
        'nbLinesHeader': 1,
        'nbLinesFooter': 0,
        'created': '02-16-2015 08:52'
    };
    var column = {
        'id': 'MostPopulousCity',
        'quality': {
            'empty': 5,
            'invalid': 10,
            'valid': 72
        },
        'type': 'string'
    };

    var types = {};

    beforeEach(module('data-prep.transformation-menu'));

    beforeEach(inject(function ($rootScope, $controller, $q, PlaygroundService, TransformationService, $injector) {

        $httpBackend = $injector.get('$httpBackend');

        scope = $rootScope.$new();

        createController = function () {
            var ctrl = $controller('TransformMenuCtrl', {
                $scope: scope
            });
            ctrl.metadata = metadata;
            ctrl.column = column;
            return ctrl;
        };

        spyOn(PlaygroundService, 'appendStep').and.returnValue($q.when(true));
        spyOn(TransformationService, 'initDynamicParameters').and.returnValue($q.when(true));

    }));

    it('should open modal on select if item has parameters', inject(function (PlaygroundService) {
        //given
        var ctrl = createController();
        var menu = {parameters: [{name: 'param1', type: 'text', default: '.'}]};
        var scope = 'column';

        //when
        ctrl.select(menu, scope);

        //then
        expect(ctrl.showModal).toBeTruthy();
        expect(ctrl.selectedMenu).toBe(menu);
        expect(ctrl.selectedScope).toBe(scope);
        expect(PlaygroundService.appendStep).not.toHaveBeenCalled();
    }));

    it('should open modal on select if item has choice', inject(function (PlaygroundService) {
        //given
        var ctrl = createController();
        var menu = {items: [{name: 'choice', values: [{name: 'choice1'}, {name: 'choice2'}]}]};
        var scope = 'column';

        //when
        ctrl.select(menu, scope);

        //then
        expect(ctrl.showModal).toBeTruthy();
        expect(ctrl.selectedMenu).toBe(menu);
        expect(ctrl.selectedScope).toBe(scope);
        expect(PlaygroundService.appendStep).not.toHaveBeenCalled();
    }));

    it('should call transform on simple menu select', inject(function (PlaygroundService) {
        //given
        var ctrl = createController();
        var menu = {name: 'uppercase', category: 'case'};
        var scope = 'column';

        //when
        ctrl.select(menu, scope);

        //then
        expect(ctrl.showModal).toBeFalsy();
        expect(PlaygroundService.appendStep).toHaveBeenCalledWith('uppercase', column, {scope: scope});
    }));

    it('should fetch dynamic parameters', inject(function ($rootScope, PlaygroundService, PreparationService, TransformationService, RestURLs) {

        $httpBackend
            .expectGET(RestURLs.serverUrl + '/api/types')
            .respond(200, {});

        //given
        var ctrl = createController();
        var menu = {name: 'textclustering', category: 'quickfix', dynamic: true};

        PlaygroundService.currentMetadata = {id: '78bae6345aef9965e22b54'};
        PreparationService.currentPreparationId = '721cd4455fb69e89543d4';

        //when
        ctrl.select(menu);
        $rootScope.$digest();

        //then
        expect(TransformationService.initDynamicParameters).toHaveBeenCalledWith(
            {name: 'textclustering', category: 'quickfix', dynamic: true},
            {
                columnId: 'MostPopulousCity',
                datasetId:  '78bae6345aef9965e22b54',
                preparationId:  '721cd4455fb69e89543d4'
            }
        );
    }));

    it('should display modal and set flags on dynamic params fetch', inject(function ($rootScope, PlaygroundService, PreparationService, RestURLs) {

        $httpBackend
            .expectGET(RestURLs.serverUrl + '/api/types')
            .respond(200, {});

        //given
        var ctrl = createController();
        var menu = {name: 'textclustering', category: 'quickfix', dynamic: true};

        PlaygroundService.currentMetadata = {id: '78bae6345aef9965e22b54'};
        PreparationService.currentPreparationId = '721cd4455fb69e89543d4';

        //when
        expect(ctrl.showModal).toBeFalsy();
        ctrl.select(menu);
        expect(ctrl.showModal).toBeTruthy();
        expect(ctrl.dynamicFetchInProgress).toBeTruthy();
        $rootScope.$digest();

        //then
        expect(ctrl.showModal).toBeTruthy();
        expect(ctrl.dynamicFetchInProgress).toBeFalsy();
    }));

    it('should call playground service to append step and hide modal', inject(function ($rootScope, PlaygroundService, RestURLs) {

        $httpBackend
            .expectGET(RestURLs.serverUrl + '/api/types')
            .respond(200, {});

        //given
        var ctrl = createController();
        ctrl.showModal = true;
        var menu = {
            name: 'uppercase',
            category: 'case',
            parameters: [
                {name: 'param1', type: 'text', default: '', value: 'param1Value'},
                {name: 'param2', type: 'int', default: '5', value: 4}
            ]
        };

        //when
        ctrl.transform(menu, {param1: 'param1Value', param2: 4 });
        expect(ctrl.showModal).toBeTruthy();
        $rootScope.$digest();

        //then
        expect(PlaygroundService.appendStep).toHaveBeenCalledWith(
            'uppercase',
            column,
            {param1: 'param1Value', param2: 4});
        expect(ctrl.showModal).toBeFalsy();
    }));

    it('should create transform function closure from menu', inject(function ($rootScope, PlaygroundService) {
        //given
        var ctrl = createController();
        var menu = {name: 'transfo_name', category: 'case', parameters: [{name: 'param1', type: 'text', default: '.'}]};
        var params = {param1: 'value'};
        var scope = 'column';

        //when
        var closure = ctrl.transformClosure(menu, scope);
        expect(PlaygroundService.appendStep).not.toHaveBeenCalled();
        closure(params);

        //then
        expect(PlaygroundService.appendStep).toHaveBeenCalledWith('transfo_name', column, {param1: 'value', scope: scope});
    }));
});