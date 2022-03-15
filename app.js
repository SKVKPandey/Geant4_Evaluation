d3.csv('geant4.csv', function (data) {
    // Variables
    var body = d3.select('body')
      var margin = { top: 20, right: 50, bottom: 30, left: 120 }
      var h = 650 - margin.top - margin.bottom
      var w = 760 - margin.left - margin.right
      var formatPercent = d3.format('')
      // Scales
    var colorScale = d3.scale.category20()
    var xScale = d3.scale.linear()
      .domain([
          0,
          1000000000000
          ])
      .range([0,w])
      
    var yScale = d3.scale.linear()
      .domain([
          0,
          1500000000000
          ])
      .range([h,0])

      // SVG
      var svg = body.append('svg')
          .attr('height',h + margin.top + margin.bottom)
          .attr('width',w + margin.left + margin.right)
        .append('g')
          .attr('transform','translate(' + margin.left + ',' + margin.top + ')')
      // X-axis
      var xAxis = d3.svg.axis()
        .scale(xScale)
        .ticks(5)
        .orient('bottom')
    // Y-axis
      var yAxis = d3.svg.axis()
        .scale(yScale)
        .orient('left')

    //Unique Value List of Libs
    function Unique(value, index, self) {
        return self.indexOf(value) === index;
    }

    var dso = [];

    for (let i = 0; i<data.length; i++) {
        dso.push(data[i]['dso']);
    };

    var libs = dso.filter(Unique)

    // Circles
    var circles = svg.selectAll('circle')
        .data(data)
        .enter()
      .append('circle')
        .attr('cx',function (d) { return xScale(d.cycles) })
        .attr('cy',function (d) { return yScale(d.instructions) })
        .attr('r',function (d) { return (xScale(d.cycles))/30 })
        .attr('stroke','black')
        .attr('stroke-width',1)
        .attr('fill',function (d) {  return colorScale(libs.indexOf(d.dso)) })
        .on('mouseover', function () {
          d3.select(this)
            .transition()
            .duration(500)
            .attr('r',function (d) { return ((xScale(d.cycles))/30) + 15 })
            .attr('stroke-width',3)
        })
        .on('mouseout', function () {
          d3.select(this)
            .transition()
            .duration(500)
            .attr('r',function (d) { return (xScale(d.cycles))/30 })
            .attr('stroke-width',1)
        })
      .append('title') // Tooltip
        .text(function (d) { return 'Library: ' + d.dso + '\nSymbols: ' + d.symbol + '\nCycles: ' + d.cycles + '\nInstructions: ' + d.instructions + '\nBranches: ' + d.branches + '\nBranch-Misses: ' + d.branchmiss})
    // X-axis
    svg.append('g')
        .attr('class','axis')
        .attr('transform', 'translate(0,' + h + ')')
        .call(xAxis)
      .append('text') // X-axis Label
        .attr('class','label')
        .attr('y',-10)
        .attr('x',w)
        .attr('dy','.71em')
        .style('text-anchor','end')
        .text('Cycles')
    // Y-axis
    svg.append('g')
        .attr('class', 'axis')
        .call(yAxis)
      .append('text') // y-axis Label
        .attr('class','label')
        .attr('transform','rotate(-90)')
        .attr('x',0)
        .attr('y',5)
        .attr('dy','.71em')
        .style('text-anchor','end')
        .text('Instructions')
  })