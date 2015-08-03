(function () {
	'use strict';

	/**
	 * @ngdoc directive
	 * @name data-prep.boxplotChart.directive:boxplotChart
	 * @description This directive renders the boxplot chart.
	 * @restrict E
	 * @usage
	 *     <boxplot-chart-chart id="boxplotId"
	 *			 width="250"
	 *			 height="400"
	 *			 boxplot-data="statsDetailsCtrl.boxplotData"
	 *		 ></boxplot-chart-chart>
	 * */

	function BoxplotChart () {
		return {
			restrict: 'E',
			scope:{
				boxplotData:'='
			},
			link: function (scope, element, attrs) {
				var boxData = scope.boxplotData;
				var container = attrs.id;

				function renderBoxplotchart(boxValues){
					//To be deleted after boxplot UI discussions (just for proof)
					/*boxValues = {
						min:0,
						max:10000,
						mean:9975,
						q1:9870,
						q2:9980,
						median:9979
					};*/

					var margin = {top: 30, right: 80, bottom: 70, left: 80};
					var  width = 330 - margin.left - margin.right;
					var height = 400 - margin.top - margin.bottom;

					var duration = 1000;

					var svg = d3.select('#'+container).append('svg')
						.attr('width', width + margin.left + margin.right)
						.attr('height', height + margin.top + margin.bottom)
						.attr('class', 'box')
						.append('g')
						.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

					var quartileData = [boxValues.q1, boxValues.median, boxValues.q2];

					// Compute the new vertical-scale.
					var vScale = d3.scale.linear()
						.domain([boxValues.min, boxValues.max])
						.range([height, 0]);

					//central vertical Axis
					var center = svg.append('g');
					center.append('line')
						.attr('class', 'center')
						.attr('x1', width / 2)
						.attr('y1', function() { return vScale(boxValues.min); })
						.attr('x2', width / 2)
						.attr('y2', function() { return vScale(boxValues.max); })
						.style('opacity', 1e-6)
						.transition()
						.duration(duration)
						.style('opacity', 1);

					//box plot
					var boxPlot = svg.append('g');

					//top box
					var boxTop = boxPlot.append('g').selectAll('rect')
						.data([quartileData]);

					boxTop.enter().append('rect')
						.attr('x', 0)
						.attr('y', function(d) {return vScale(d[2]);})
						.attr('width', width)
						.attr('height', function() { return vScale(boxValues.q2); })
						.on('click', function(d){
							console.log([d[1],d[2]]);
						});

					boxTop.transition()
						.duration(duration)
						.attr('height', function(d) { return vScale(d[1]) - vScale(d[2]); });

						//bottom box.
					var boxBottom = boxPlot.append('g').selectAll('rect')
						.data([quartileData]);

					boxBottom.enter().append('rect')
						.attr('x', 0)
						.attr('y', function() { return vScale(boxValues.q2); })
						.attr('width', width)
						.attr('height', function(d) { return vScale(d[0]) - vScale(d[2]); })
						.on('click', function(d){
							console.log([d[0],d[1]]);
						});

					boxBottom.transition()
						.duration(duration*1.5)
						.ease('bounce')
						.attr('y', function(d) { return vScale(d[1]); })
						.attr('height', function(d) { return vScale(d[0]) - vScale(d[1]); });

					//whiskers
					var topWhiskerPolyg = function(max){
						return 0+','+vScale(max)+ ' '+
							width+','+vScale(max)+ ' '+
							(width-20)+','+(vScale(max)-20)+ ' '+
							(vScale(max)+20)+','+(vScale(max)-20);
					};

					var bottomWhiskerPolyg = function(min){
						return 0+','+vScale(min)+ ' '+
							width+','+vScale(min)+ ' '+
							(width-20)+','+(vScale(min)+20)+ ' '+
							20+','+(vScale(min)+20);
					};

					var gWhisker = svg.append('g');

					var gWhiskerTop = gWhisker.append('g');

					gWhiskerTop.append('polygon')
						.attr('class','whiskerPolyg')
						.attr('points',topWhiskerPolyg(boxValues.max));

					gWhiskerTop.append('text')
						.attr('class', 'max-min-labels')
						.attr('x', width/2)
						.attr('y', vScale(boxValues.max)/2)
						.text('Maximum')
						.style('opacity', 1)
						.attr('text-anchor','middle')
						.transition()
						.duration(duration)
						.attr('y', -22)
						.style('opacity', 1);

					var gWhiskerBottom = gWhisker.append('g');

					gWhiskerBottom.append('polygon')
						.attr('class','whiskerPolyg')
						.attr('points',bottomWhiskerPolyg(boxValues.min));

					gWhiskerBottom.append('text')
						.attr('class', 'max-min-labels')
						.attr('x', width/2)
						.attr('y', vScale(boxValues.min)/2)
						.text('Minimum')
						.style('opacity', 1)
						.attr('text-anchor','middle')
						.transition()
						.duration(duration)
						.attr('y', vScale(boxValues.min)+30);

					//mean circle
					var gMean = svg.insert('g');
					gMean.append('circle')
						.attr('class', 'mean')
						.attr('r', 17)
						.attr('cx', width / 2)
						.attr('cy', function() { return vScale(boxValues.mean); })
						.style('opacity', 1)
						.transition()
						.duration(duration*2)
						.attr('r', 7)
						.style('opacity', 1)
					;

					gMean.append('circle')
						.attr('r', 1.5)
						.attr('cx', width / 2)
						.attr('cy', function() { return vScale(boxValues.mean); })
						.style('opacity', 1e-6)
						.transition()
						.duration(duration*2)
						.style('opacity', 1);

					//text values
					var gTexts = svg.append('g');
					//max
					gTexts.append('text')
						.attr('class', 'max-min-labels')
						.attr('x', width/2)
						.attr('y', vScale(boxValues.min)/2)
						.text(boxValues.max)
						.style('opacity', 1)
						.attr('text-anchor','middle')
						.transition()
						.duration(duration)
						.attr('y', vScale(boxValues.max) - 10);

					//min
					gTexts.append('text')
						.attr('class', 'max-min-labels')
						.attr('x', width/2)
						.attr('y', vScale(boxValues.min)/2)
						.text(boxValues.min)
						.style('opacity', 1)
						.attr('text-anchor','middle')
						.transition()
						.duration(duration)
						.attr('y', vScale(boxValues.min)+17);

					gTexts.append('text')
						.attr('class', 'mean-labels')
						.attr('x', width/2)
						.attr('y', function(){
							if(height - vScale(boxValues.mean - boxValues.min)<15){
								return vScale(boxValues.mean) - 10;
							}
							else if(height - vScale(boxValues.max - boxValues.mean)<15){
								return vScale(boxValues.mean) + 15;
							}
							else {
								return vScale(boxValues.mean) - 10;
							}
						})
						.text('Mean : '+boxValues.mean)
						.style('opacity', 1e-6)
						.attr('text-anchor','middle')
						.transition()
						.duration(duration*2)
						.style('opacity', 1);

					//lower quantile value
					gTexts.append('text')
						.attr('class', 'low-quantile-labels')
						.attr('x', width + 5)
						.attr('y', vScale(boxValues.min)/2)
						.text(boxValues.q1)
						.style('opacity', 1)
						.attr('text-anchor','start')
						.transition()
						.duration(duration)
						.attr('y', vScale(boxValues.q1)+10);

					//lower quantile text
					gTexts.append('text')
						.attr('class', 'low-quantile-labels')
						.attr('x', -5)
						.attr('y', vScale(boxValues.min)/2)
						.text('Lower Quantile')
						.style('opacity', 1)
						.attr('text-anchor','end')
						.transition()
						.duration(duration)
						.attr('y', vScale(boxValues.q1)+10);

					//upper quantile value
					gTexts.append('text')
						.attr('class', 'up-quantile-labels')
						.attr('x', -5)
						.attr('y', vScale(boxValues.min)/2)
						.text('Upper Quantile')
						.style('opacity', 1)
						.attr('text-anchor','end')
						.transition()
						.duration(duration)
						.attr('y', vScale(boxValues.q2));

					//upper quantile text
					gTexts.append('text')
						.attr('class', 'up-quantile-labels')
						.attr('x', width+5)
						.attr('y', vScale(boxValues.min)/2)
						.text(boxValues.q2)
						.style('opacity', 1)
						.attr('text-anchor','start')
						.transition()
						.duration(duration)
						.attr('y', vScale(boxValues.q2));

					//median value
					gTexts.append('text')
						.attr('x', width - 5)
						.text(boxValues.median)
						.style('opacity', 1e-6)
						.attr('text-anchor','end')
						.attr('y', function(){
							return boxValues.median >= boxValues.mean? vScale(boxValues.median) + 15 : vScale(boxValues.median) - 5;
						})
						.transition()
						.duration(duration*3)
						.style('opacity', 1);

					//median text
					gTexts.append('text')
						.attr('x', 5)
						.text('Median')
						.style('opacity', 1e-6)
						.attr('text-anchor','start')
						.attr('y', function(){
							return boxValues.median >= boxValues.mean? vScale(boxValues.median) + 15 : vScale(boxValues.median) - 5;
						})
						.transition()
						.duration(duration*3)
						.style('opacity', 1);
				}

				if(boxData){
					renderBoxplotchart(boxData);
				}

				scope.$watch('boxplotData',
					function(newData){
						element.empty();
						boxData = newData;
						if(boxData){
							renderBoxplotchart(boxData);
						}
					});
			}
		};
	}

	angular.module('data-prep.boxplotChart')
		.directive('boxplotChart', BoxplotChart);
})();