describe('verticalBarchart directive', function () {
	'use strict';

	var createElement, element, scope, statsData, isolateScope;
	var flushAllD3Transitions = function () {
		var now = Date.now;
		Date.now = function () {
			return Infinity;
		};
		d3.timer.flush();
		Date.now = now;
	};

	beforeEach(module('talend.widget'));
	beforeEach(inject(function ($rootScope, $compile) {
		statsData = [
			{'data': [0, 5], 'occurrences': 9},
			{'data': [5, 10], 'occurrences': 8},
			{'data': [10, 15], 'occurrences': 6},
			{'data': [15, 20], 'occurrences': 5}
		];

		createElement = function () {

			scope = $rootScope.$new();
			scope.visData = null;
			scope.existingFilter = null;
			scope.onclck = function(obj){
				console.log(obj);
			};//jasmine.createSpy('spy');

			element = angular.element('<vertical-barchart id="barChart" width="250" height="400"' +
				'on-click="onclck"' +
				'visu-data="visData"' +
				'key-field="data"' +
				'existing-filter="existingFilter"'+
				'value-field="occurrences"' +
				'></vertical-barchart>');

			angular.element('body').append(element);
			$compile(element)(scope);
			scope.$digest();

			isolateScope = element.isolateScope();
		};
	}));

	beforeEach(function () {
		jasmine.clock().install();
	});
	afterEach(function () {
		jasmine.clock().uninstall();

		scope.$destroy();
		element.remove();
	});

	it('should render all bars after a 100ms delay', function () {
		//given
		createElement();

		//when
		scope.visData = statsData;
		scope.$digest();
		jasmine.clock().tick(100);

		//then
		expect(element.find('rect').length).toBe(statsData.length * 2);
		expect(element.find('.bg-rect').length).toBe(statsData.length);
		expect(element.find('.bar').length).toBe(statsData.length);
		expect(element.find('.grid').length).toBe(1);
	});

	it('should check the initial bars opacity', function () {
		//given
		createElement();

		//when
		scope.visData = statsData;
		scope.$digest();
		jasmine.clock().tick(100);

		//then
		_.each(isolateScope.buckets[0], function(bucket){
			expect(d3.select(bucket).style('opacity')).toBe('1');
		});
	});

	it('should update the bars opacity after applying a filter outside the bars ranges', function () {
		//given
		createElement();

		scope.visData = statsData;
		scope.$digest();
		jasmine.clock().tick(100);
		flushAllD3Transitions();

		//when
		scope.existingFilter = [105, 200];
		scope.$digest();
		jasmine.clock().tick(600);

		flushAllD3Transitions();

		//then
		_.each(isolateScope.buckets[0], function(bucket){
			var opac = +(d3.select(bucket).style('opacity'));
			expect(opac.toFixed(1)).toBe('0.4');
		});
	});

	it('should update the bars opacity after applying a filter intersecting with 1 bar range', function () {
		//given
		createElement();

		scope.visData = statsData;
		scope.$digest();
		jasmine.clock().tick(100);
		flushAllD3Transitions();

		//when
		scope.existingFilter = [15, 20];
		scope.$digest();
		jasmine.clock().tick(600);

		flushAllD3Transitions();

		//then
		var opacities = [0.4, 0.4, 0.4, 1];

		_.each(isolateScope.buckets[0], function(bucket, index){
			var opac = +(d3.select(bucket).style('opacity'));
			opac = +opac.toFixed(1);
			expect(opac).toBe(opacities[index]);
		});
	});

	it('should update the bars opacity after applying a filter intersecting with to 2 bar range', function () {
		//given
		createElement();

		scope.visData = statsData;
		scope.$digest();
		jasmine.clock().tick(100);
		flushAllD3Transitions();

		//when
		scope.existingFilter = [13, 20];
		scope.$digest();
		jasmine.clock().tick(600);

		flushAllD3Transitions();

		//then
		var opacities = [0.4, 0.4, 1, 1];

		_.each(isolateScope.buckets[0], function(bucket, index){
			var opac = +(d3.select(bucket).style('opacity'));
			opac = +opac.toFixed(1);
			expect(opac).toBe(opacities[index]);
		});
	});

	//it('should trigger filter propagation', function () {
	//	//given
	//	createElement();

	//	scope.visData = statsData;
	//	scope.$digest();
	//	jasmine.clock().tick(100);
	//	flushAllD3Transitions();

	//	spyOn(scope, 'onclck').and.returnValue();

	//	var bgBar2 = $(d3.selectAll('.bg-rect')[0][2]);
	//	//var event = angular.element.Event('click');
	//	bgBar2.click();
	//	//then
	//	//bgBar2.trigger(event);
	//	expect(scope.onclck).toHaveBeenCalledWith({'data': [10, 15], 'occurrences': 6});
	//});
});