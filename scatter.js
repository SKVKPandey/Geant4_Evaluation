

d3.csv('geant4.csv', function (data) {
    // Variables
    var body = d3.select('body')
      var margin = { top: 30, right: 120, bottom: 30, left: 120 }
      var h = 650 - margin.top - margin.bottom
      var w = 760 - margin.left - margin.right
      var formatPercent = d3.format('')

    //Unique Value List of Libs
    function Unique(value, index, self) {
      return self.indexOf(value) === index;
    }

    var dso = [];

    for (let i = 0; i<data.length; i++) {
        dso.push(data[i]['dso']);
    };

    var libs = dso.filter(Unique)

    // Data Coloumns
    var cyc = [];
    var inst = [];
    var branch = [];
    var miss = [];

    for (let i = 0; i<data.length; i++) {
        cyc.push(data[i]['cycles']);
        inst.push(data[i]['instructions']);
        branch.push(data[i]['branches']);
        miss.push(data[i]['branchmisses']);
    };  

    var DataSet = { 'cycles': cyc, 'instructions': inst, 'branches': branch, 'branchmisses': miss};

    // Function for Determining Max Values
    function roundtoMax(arr1, arr2) {
        num = Math.max.apply(null,arr1);
        leastNum = Math.min(Math.max.apply(null,arr1), Math.max.apply(null,arr2));
        return (Math.ceil(num/(10**leastNum.toString().length))*(10**leastNum.toString().length))
    };

    // Default X-Axis, Y-Axis and Radius
    d3.select("#X[value=\"option1\"]").property("checked", true);
    d3.select("#Y[value=\"option6\"]").property("checked", true);
    d3.select("#R[value=\"optionA\"]").property("checked", true);

    var data1 = 'cycles';
    var data2 = 'instructions';
    var radius = 'cycles';
    
    // Setting the Default Plot
    // Scales
    var colorScale = d3.scale.category20()
    var xScale = d3.scale.linear()
      .domain([
          0,
          roundtoMax(DataSet[data1], DataSet[data2])
          ])
      .range([0,w])
      
    var yScale = d3.scale.linear()
      .domain([
          0,
          roundtoMax(DataSet[data2], DataSet[data1])
          ])
      .range([h,0])

      // SVG
      var svg = body.append('svg')
          .attr('height',h + margin.top + margin.bottom)
          .attr('width',w + margin.left + margin.right)
        .append('g')
          .attr('transform','translate(' + margin.left + ',' + margin.top + ')');
      // X-axis
      var xAxis = d3.svg.axis()
        .scale(xScale)
        .ticks(5)
        .orient('bottom');
    // Y-axis
      var yAxis = d3.svg.axis()
        .scale(yScale)
        .orient('left');

    // Circles
    var circles = svg.selectAll('circle')
        .data(data)
        .enter()
      .append('circle')
        .attr('cx',function (d) { return xScale(d[data1]) })
        .attr('cy',function (d) { return yScale(d[data2]) })
        .attr('r',function (d) { return (d[radius]/(Math.max.apply(null,DataSet[radius])))*15 })
        .attr('stroke','black')
        .attr('stroke-width',1)
        .attr('fill',function (d) {  return colorScale(libs.indexOf(d.dso)) })
        .on('mouseover', function () {
          d3.select(this)
            .transition()
            .duration(500)
            .attr('r',function (d) { return 20 })
            .attr('stroke-width',3)
        })
        .on('mouseout', function () {
          d3.select(this)
            .transition()
            .duration(500)
            .attr('r',function (d) { return (d[radius]/(Math.max.apply(null,DataSet[radius])))*15 })
            .attr('stroke-width',1)
        })
        .append('title') // Tooltip
        .text(function (d) { return 'Library: ' + d.dso + '\nSymbols: ' + d.symbol + '\nCycles: ' + d.cycles + '\nInstructions: ' + d.instructions + '\nBranches: ' + d.branches + '\nBranch-Misses: ' + d.branchmisses});

        

    // X-axis
    svg.append('g')
        .attr('class','axis')
        .attr('transform', 'translate(0,' + h + ')')
        .attr("id", "x-axis")
        .call(xAxis)
      .append('text') // X-axis Label
        .attr('id','x-label')
        .attr('y',-10)
        .attr('x',w)
        .attr('dy','.71em')
        .style('text-anchor','end')
        .text(data1.charAt(0).toUpperCase() + data1.slice(1));
        
    // Y-axis
    svg.append('g')
        .attr('class', 'axis')
        .attr("id", "y-axis")
        .call(yAxis)
      .append('text') // y-axis Label
        .attr('id','y-label')
        .attr('transform','rotate(-90)')
        .attr('x',0)
        .attr('y',5)
        .attr('dy','.71em')
        .style('text-anchor','end')
        .text(data2.charAt(0).toUpperCase() + data2.slice(1));


    d3.selectAll("input")
	    .on("change", selectDataset);
	
    function selectDataset()
    {
	    var value = this.value;
	    if (value == "option1")
	    {
        data1 = 'cycles';
		    change(data1, data2);
	    }
	    else if (value == "option2")
	    {
		    data1 = 'instructions';
		    change(data1, data2);
	    }
        else if (value == "option3")
	    {
		    data1 = 'branches';
		    change(data1, data2);
	    }
      else if (value == "option4")
	    {
		    data1 = 'branchmisses';
		    change(data1, data2);
	    }
      else if (value == "option5")
	    {
		    data2 = 'cycles';
		    change(data1, data2);
	    }
      else if (value == "option6")
	    {
		    data2 = 'instructions';
		    change(data1, data2);
	    }
      else if (value == "option7")
	    {
		    data2 = 'branches';
		    change(data1, data2);
	    }
      else if (value == "option8")
	    {
		    data2 = 'branchmisses';
		    change(data1, data2);
	    }
      else if (value == "optionA")
	    {
		    radius = 'cycles';
		    change(data1, data2);
	    }
      else if (value == "optionB")
	    {
		    radius = 'instructions';
		    change(data1, data2);
	    }
      else if (value == "optionC")
	    {
		    radius = 'branches';
		    change(data1, data2);
	    }
      else if (value == "optionD")
	    {
		    radius = 'branchmisses';
		    change(data1, data2);
	    }
    }


function change(data1, data2) {

    // Update scale domains
    var colorScale = d3.scale.category20()
    var xScale = d3.scale.linear()
      .domain([
          0,
          roundtoMax(DataSet[data1], DataSet[data2])
          ])
      .range([0,w]);
    
    var yScale = d3.scale.linear()
      .domain([
          0,
          roundtoMax(DataSet[data2], DataSet[data1])
          ])
      .range([h,0]);

    // X-axis
    var xAxis = d3.svg.axis()
    .scale(xScale)
    .ticks(5)
    .orient('bottom')
  // Y-axis
    var yAxis = d3.svg.axis()
    .scale(yScale)
    .orient('left')

      svg.select("#x-axis")
        .transition()
        .duration(1000)
        .call(xAxis);

      svg.select('#x-label')
        .transition()
        .duration(1000)
        .attr('y',-10)
        .attr('x',w)
        .attr('dy','.71em')
        .style('text-anchor','end')
        .text(data1.charAt(0).toUpperCase() + data1.slice(1));

      svg.select("#y-axis")
        .transition()
        .duration(1000)
        .call(yAxis)

      svg.select('#y-label')
        .attr('transform','rotate(-90)')
        .attr('x',0)
        .attr('y',5)
        .attr('dy','.71em')
        .style('text-anchor','end')
        .text(data2.charAt(0).toUpperCase() + data2.slice(1));

      // Update circles
      svg.selectAll("circle")
      .data(data)  // Update with new data
      .transition()  // Transition from old to new
      .duration(1000)  // Length of animation
      .each("start", function() {  // Start animation
          d3.select(this)  // 'this' means the current element
              .attr("r", 5);  // Change size
      })
      .delay(500) // Dynamic delay (i.e. each item delays a little longer)
      //.ease("linear")  // Transition easing - default 'variable' (i.e. has acceleration), also: 'circle', 'elastic', 'bounce', 'linear'
      .attr('cx',function (d) { return xScale(d[data1]) })
        .attr('cy',function (d) { return yScale(d[data2]) })
        .attr('r',function (d) { return (d[radius]/(Math.max.apply(null,DataSet[radius])))*15 }) // Circle's Y
      .each("end", function() {  // End animation
          d3.select(this)  // 'this' means the current element
              .transition()
              .duration(500)
    });
}})
