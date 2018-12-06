app.directive("graphDir", ['mySVC',function(mySVC) {
    return {
        restrict: 'AE',
        scope: {
            chartData: '='
        },
        link: function(scope,el,attrs) {

            /////////////////////////////////////////
            // Graph
            /////////////////////////////////////////
            
            var chartData = scope.chartData,
                chartID   = el['0'].id;
            
            scope.$watch('chartData',function(newVals,oldVals)
            {
                var formattedData = scope.formatData(newVals);               
                scope.redrawChart('#'+chartID,formattedData);
            },true);
            
            scope.chartSetup = function(targetID)
            {
                //Set size of svg element and chart
                var margin = {top: 0, right: 50, bottom: 0, left: 50},
                    width = 600 - margin.left - margin.right,
                    height = 200 - margin.top - margin.bottom,
                    categoryIndent = 4*15 + 5,
                    defaultBarWidth = 50;
            
                //Set up scales
                var x = d3.scale.linear()
                  .domain([0,defaultBarWidth])
                  .range([0,width]);
                var y = d3.scale.ordinal()
                  .rangeRoundBands([0, height], 0.1, 0);
            
                //Create SVG element
                d3.select(targetID).selectAll("svg").remove();
                
                var svg = d3.select(targetID).append("svg")
                    .attr("width", width + margin.left + margin.right)
                    .attr("height", height + margin.top + margin.bottom)
                  .append("g")
                    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
                
                //Package and export settings
                scope.settings = {
                  margin:margin, width:width, height:height, categoryIndent:categoryIndent,
                  svg:svg, x:x, y:y
                };
                
                return scope.settings;
            };
            
            scope.redrawChart = function(targetID, newdata)
            {
                console.log("NewData:",newdata);
                //Import settings
                var margin          = scope.settings.margin,
                    width           = scope.settings.width,
                    height          = scope.settings.height,
                    categoryIndent  = scope.settings.categoryIndent, 
                    svg             = scope.settings.svg,
                    x               = scope.settings.x,
                    y               = scope.settings.y;
            
                //Reset domains
                y.domain(newdata.sort(function(a,b){
                  return b.value - a.value;
                })
                  .map(function(d) { return d.key; }));
                var barmax = d3.max(newdata, function(e) {
                  return e.value;
                });
                x.domain([0,barmax]);
            
                /////////
                //ENTER//
                /////////
            
                //Bind new data to chart rows 
            
                //Create chart row and move to below the bottom of the chart
                var chartRow = svg.selectAll("g.chartRow").data(newdata, function(d){ return d.key;});
                var newRow = chartRow
                  .enter()
                  .append("g")
                  .attr("class", "chartRow")
                  .attr("transform", "translate(0," + height + margin.top + margin.bottom + ")");
            
                //Add rectangles
                newRow.insert("rect")
                  .attr("class","bar")
                  .attr("x", 0)
                  .attr("opacity",0)
                  .attr("height", y.rangeBand())
                  .attr("width", function(d) { return x(d.value);}); 
            
                //Add value labels
                newRow.append("text")
                  .attr("class","label")
                  .attr("y", y.rangeBand()/2)
                  .attr("x",0)
                  .attr("opacity",0)
                  .attr("dy",".35em")
                  .attr("dx","0.5em")
                  .text(function(d){return d.value;}); 
                
                //Add Headlines
                newRow.append("text")
                  .attr("class","category")
                  .attr("text-overflow","ellipsis")
                  .attr("y", y.rangeBand()/2)
                  .attr("x",categoryIndent)
                  .attr("opacity",0)
                  .attr("dy",".35em")
                  .attr("dx","0.5em")
                  .text(function(d){return d.key;});
            
            
                //////////
                //UPDATE//
                //////////
                
                //Update bar widths
                chartRow.select(".bar").transition()
                  .duration(300)
                  .attr("width", function(d) { return x(d.value);})
                  .attr("opacity",1);
            
                //Update data labels
                chartRow.select(".label").transition()
                  .duration(300)
                  .attr("opacity",1)
                  .tween("text", function(d) {
                    var node = this; //fix for D3 v4
                    var i = d3.interpolate(+node.textContent.replace(/\,/g,''), +d.value);
                    return function(t) {
                      node.textContent = Math.round(i(t));
                    };
                  });
            
                //Fade in categories
                chartRow.select(".category").transition()
                  .duration(300)
                  .attr("opacity",1);
            
                ////////
                //EXIT//
                ////////
            
                //Fade out and remove exit elements
                chartRow.exit().transition()
                  .style("opacity","0")
                  .attr("transform", "translate(0," + (height + margin.top + margin.bottom) + ")")
                  .remove();
            
                ////////////////
                //REORDER ROWS//
                ////////////////
            
                var delay = function(d, i) { return 200 + i * 30; };
            
                chartRow.transition()
                    .delay(delay)
                    .duration(900)
                    .attr("transform", function(d){ return "translate(0," + y(d.key) + ")"; });
            };
                        
            //Sort data in descending order and take the top 10 values
            scope.formatData = function(dataObj)
            {
                var data = Object.keys(dataObj).map(function(key) {
                        return {"key":key, "value":dataObj[key]};
                });
                
                return data.sort(function (a, b) {
                    return b.value - a.value;
                  })
                  .slice(0, 10);
            };
            
            //setup (includes first draw)
            scope.settings = scope.chartSetup('#'+chartID);            
        }
    };
}]);


//////////////////////////////////////////////////
// Gauge
//////////////////////////////////////////////////


app.directive("gaugeDir", ['mySVC',function(mySVC) {
    return {
        restrict: 'AE',
        scope: {
            happyData: '='
        },
        link: function(scope,el,attrs) {

            var happyData = scope.happyData,
                chartID   = el['0'].id;
                        
            /////////////////////////////////////////
            // Gauge
            /////////////////////////////////////////
            
            var gauge = function(container, configuration) {
                var that = {};
                var config = {
                    size						: 710,
                    clipWidth					: 200,
                    clipHeight					: 110,
                    ringInset					: 20,
                    ringWidth					: 20,
                    
                    pointerWidth				: 10,
                    pointerTailLength			: 5,
                    pointerHeadLengthPercent	: 0.9,
                    
                    minValue					: 0,
                    maxValue					: 10,
                    
                    minAngle					: -90,
                    maxAngle					: 90,
                    
                    transitionMs				: 750,
                    
                    majorTicks					: 5,
                    labelFormat					: d3.format('d'),
                    labelInset					: 10,
                    
                    arcColorFn					: d3.interpolateHsl(d3.rgb('#e8e2ca'), d3.rgb('#3e6c0a'))
                },
                range,
                r,
                pointerHeadLength,
                value = 0,
                svg,
                arc,
                scale,
                ticks,
                tickData,
                pointer,
                donut = d3.pie();
                
                function deg2rad(deg)
                {
                    return deg * Math.PI / 180;
                }
                
                function newAngle(d)
                {
                    var ratio = scale(d);
                    var newAngle = config.minAngle + (ratio * range);
                    return newAngle;
                }
                
                function configure(configuration)
                {
                    var prop;
                    for ( prop in configuration )
                    {
                        config[prop] = configuration[prop];
                    }
                    
                    range = config.maxAngle - config.minAngle;
                    r = config.size / 2;
                    pointerHeadLength = Math.round(r * config.pointerHeadLengthPercent);
            
                    // a linear scale that maps domain values to a percent from 0..1
                    scale = d3.scaleLinear()
                        .range([0,1])
                        .domain([config.minValue, config.maxValue]);
                        
                    ticks = scale.ticks(config.majorTicks);
                    tickData = d3.range(config.majorTicks).map(function() {return 1/config.majorTicks;});
                    
                    arc = d3.arc()
                        .innerRadius(r - config.ringWidth - config.ringInset)
                        .outerRadius(r - config.ringInset)
                        .startAngle(function(d, i) {
                            var ratio = d * i;
                            return deg2rad(config.minAngle + (ratio * range));
                        })
                        .endAngle(function(d, i) {
                            var ratio = d * (i+1);
                            return deg2rad(config.minAngle + (ratio * range));
                        });
                }
                
                that.configure = configure;
                
                function centerTranslation()
                {
                    return 'translate('+r +','+ r +')';
                }
                
                function isRendered()
                {
                    return (svg !== undefined);
                }
                
                that.isRendered = isRendered;
                
                function render(newValue)
                {
                    svg = d3.select(container)
                        .append('svg:svg')
                            .attr('class', 'gauge')
                            .attr('width', config.clipWidth)
                            .attr('height', config.clipHeight);
                    
                    var centerTx = centerTranslation();
                    
                    var arcs = svg.append('g')
                            .attr('class', 'arc')
                            .attr('transform', centerTx);
                    
                    arcs.selectAll('path')
                            .data(tickData)
                        .enter().append('path')
                            .attr('fill', function(d, i) {
                                return config.arcColorFn(d * i);
                            })
                            .attr('d', arc);
                    
                    var lg = svg.append('g')
                            .attr('class', 'label')
                            .attr('transform', centerTx);
                    lg.selectAll('text')
                            .data(ticks)
                        .enter().append('text')
                            .attr('transform', function(d) {
                                var ratio = scale(d);
                                var newAngle = config.minAngle + (ratio * range);
                                return 'rotate(' +newAngle +') translate(0,' +(config.labelInset - r) +')';
                            })
                            .text(config.labelFormat);
            
                    var lineData = [ [config.pointerWidth / 2, 0], 
                                    [0, -pointerHeadLength],
                                    [-(config.pointerWidth / 2), 0],
                                    [0, config.pointerTailLength],
                                    [config.pointerWidth / 2, 0] ];
                    var pointerLine = d3.line().curve(d3.curveLinear);
                    var pg = svg.append('g').data([lineData])
                            .attr('class', 'pointer')
                            .attr('transform', centerTx);
                            
                    pointer = pg.append('path')
                        .attr('d', pointerLine/*function(d) { return pointerLine(d) +'Z';}*/ )
                        .attr('transform', 'rotate(' +config.minAngle +')');
                        
                    update(newValue === undefined ? 0 : newValue);
                }
                
                that.render = render;
                
                function update(newValue, newConfiguration)
                {
                    if ( newConfiguration  !== undefined)
                    {
                        configure(newConfiguration);
                    }
                    var ratio = scale(newValue);
                    var newAngle = config.minAngle + (ratio * range);
                    pointer.transition()
                        .duration(config.transitionMs)
                        .ease(d3.easeElastic)
                        .attr('transform', 'rotate(' +newAngle +')');
                }
                
                that.update = update;
            
                configure(configuration);
                
                return that;
            };
            
            var powerGauge = gauge('#'+chartID, {
                size: 300,
                clipWidth: 300,
                clipHeight: 300,
                ringWidth: 60,
                maxValue: 10,
                transitionMs: 4000
            });
            powerGauge.render();
            
            scope.$watch('happyData',function(newVals,oldVals)
            {
                //console.log("new happy data:",newVals);
                powerGauge.update(newVals,'#'+chartID);
            },true);           
            
        }
    };
}]);