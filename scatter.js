

d3.csv('geant4.csv', function (data) {
    // Variables
    var body = d3.select('body')
      var margin = { top: 30, right: 60, bottom: 30, left: 120 }
      var h = 550 - margin.top - margin.bottom
      var w = 750 - margin.left - margin.right
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
    var cpi = [];
    var bmf = [];

    for (let i = 0; i<data.length; i++) {
        cyc.push(data[i]['cycles']);
        inst.push(data[i]['instructions']);
        branch.push(data[i]['branches']);
        miss.push(data[i]['branchmisses']);
        cpi.push(data[i]['cpi']);
        bmf.push(data[i]['bmf']);
    };  

    var DataSet = { 'cycles': cyc, 'instructions': inst, 'branches': branch, 'branchmisses': miss, 'cpi': cpi, 'bmf': bmf};

    // Function for Determining Max Values

    function nearMax(arr) {
      maxval = Math.max.apply(null,arr).toString();
      if (parseFloat(maxval) < 10) {
        return parseFloat(maxval)+1
      }
      else {
        return ((parseFloat(maxval.slice(0,2))+1)*(10**(maxval.length-2)))
      }
    }

    // Function to Find Mean and Standard Deviation

    function mean (array) {
      const n = array.length
      const mean = array.reduce((a, b) => parseFloat(a) + parseFloat(b)) / n
      return mean
    }
    function getStd (array) {
      const n = array.length
      const mean = array.reduce((a, b) => parseFloat(a) + parseFloat(b)) / n
      return Math.sqrt(array.map(x => Math.pow(parseFloat(x) - mean, 2)).reduce((a, b) => a + b) / n)
    }

    // Default X-Axis, Y-Axis and Radius
    d3.select("#X[value=\"option1\"]").property("checked", true);
    d3.select("#Y[value=\"option8\"]").property("checked", true);
    d3.select("#R[value=\"optionA\"]").property("checked", true);
    d3.select("#XZ[value=\"optionX\"]").property("value", 1);
    d3.select("#YZ[value=\"optionY\"]").property("value", 1);
    d3.select("#XS[value=\"optionS4\"]").property("checked", true);
    d3.select("#YS[value=\"optionS8\"]").property("checked", true);

    var data1 = 'cycles';
    var data2 = 'instructions';
    var radius = 'cycles';
    var xdiv = document.getElementById('XZ').value;
    var ydiv = document.getElementById('YZ').value;
    var xslider = document.getElementById('XZ');
    var yslider = document.getElementById('YZ');
    var Xsigma = 0;
    var Ysigma = 0;
    
    // Setting the Default Plot
    // Scales
    var colorScale = d3.scale.category20()
    var xScale = d3.scale.linear()
      .domain([
          0,
          nearMax(DataSet[data1])/xdiv
          ])
      .range([0,w])
      
    var yScale = d3.scale.linear()
      .domain([
          0,
          nearMax(DataSet[data2])/ydiv
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
        .ticks(7)
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
        .style('opacity', 0.9)
        .attr('stroke-width',1)
        .attr('fill',function (d) {  return colorScale(libs.indexOf(d.dso)) })
        .on('mouseover', function () {
          d3.select(this)
            .transition()
            .duration(500)
            .attr('r',function (d) { if ((d[radius]/(Math.max.apply(null,DataSet[radius])))*15<20){return 20} else {return (d[radius]/(Math.max.apply(null,DataSet[radius])))*15*((0.5*xdiv)+(0.5*ydiv))} })
            .attr('stroke-width',2)
            .style('opacity', 0.8)
        })
        .on('mouseout', function () {
          d3.select(this)
            .transition()
            .duration(500)
            .attr('r',function (d) { return (d[radius]/(Math.max.apply(null,DataSet[radius])))*15 })
            .attr('stroke-width',1)
            .style('opacity', 0.9)
        })
        .append('title') // Tooltip
        .text(function (d) { return 'Library: ' + d.dso + '\nSymbols: ' + d.symbol + '\nCycles: ' + d.cycles + '\nInstructions: ' + d.instructions + '\nBranches: ' + d.branches + '\nBranch-Misses: ' + d.branchmisses + '\nCPI: ' + d.cpi + '\nBranch-Miss Factor: ' + d.bmf});

        

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
		    change(data1, data2, xdiv, ydiv, Xsigma, Ysigma);
	    }
	    else if (value == "option2")
	    {
		    data1 = 'instructions';
		    change(data1, data2, xdiv, ydiv, Xsigma, Ysigma);
	    }
        else if (value == "option3")
	    {
		    data1 = 'branches';
		    change(data1, data2, xdiv, ydiv, Xsigma, Ysigma);
	    }
      else if (value == "option4")
	    {
		    data1 = 'branchmisses';
		    change(data1, data2, xdiv, ydiv, Xsigma, Ysigma);
	    }
      else if (value == "option5")
	    {
		    data1 = 'cpi';
		    change(data1, data2, xdiv, ydiv, Xsigma, Ysigma);
	    }
      else if (value == "option6")
	    {
		    data1 = 'bmf';
		    change(data1, data2, xdiv, ydiv, Xsigma, Ysigma);
	    }
      else if (value == "option7")
	    {
		    data2 = 'cycles';
		    change(data1, data2, xdiv, ydiv, Xsigma, Ysigma);
	    }
      else if (value == "option8")
	    {
		    data2 = 'instructions';
		    change(data1, data2, xdiv, ydiv, Xsigma, Ysigma);
	    }
      else if (value == "option9")
	    {
		    data2 = 'branches';
		    change(data1, data2, xdiv, ydiv, Xsigma, Ysigma);
	    }
      else if (value == "option10")
	    {
		    data2 = 'branchmisses';
		    change(data1, data2, xdiv, ydiv, Xsigma, Ysigma);
	    }
      else if (value == "option11")
	    {
		    data2 = 'cpi';
		    change(data1, data2, xdiv, ydiv, Xsigma, Ysigma);
	    }
      else if (value == "option12")
	    {
		    data2 = 'bmf';
		    change(data1, data2, xdiv, ydiv, Xsigma, Ysigma);
	    }
      else if (value == "optionA")
	    {
		    radius = 'cycles';
		    change(data1, data2, xdiv, ydiv, Xsigma, Ysigma);
	    }
      else if (value == "optionB")
	    {
		    radius = 'instructions';
		    change(data1, data2, xdiv, ydiv, Xsigma, Ysigma);
	    }
      else if (value == "optionC")
	    {
		    radius = 'branches';
		    change(data1, data2, xdiv, ydiv, Xsigma, Ysigma);
	    }
      else if (value == "optionD")
	    {
		    radius = 'branchmisses';
		    change(data1, data2, xdiv, ydiv, Xsigma, Ysigma);
	    }
      else if (value == "optionE")
	    {
		    radius = 'cpi';
		    change(data1, data2, xdiv, ydiv, Xsigma, Ysigma);
	    }
      else if (value == "optionF")
	    {
		    radius = 'bmf';
		    change(data1, data2, xdiv, ydiv, Xsigma, Ysigma);
	    }
      else if (xslider.value!=xdiv)
	    {
        xdiv = xslider.value;
		    change(data1, data2, xdiv, ydiv, Xsigma, Ysigma);
	    }
      else if (yslider.value!=ydiv)
	    {
        ydiv = yslider.value;
		    change(data1, data2, xdiv, ydiv, Xsigma, Ysigma);
	    }
      else if (value == "optionS1")
	    {
        if (Xsigma!=1){
          Xsigma = 1;
          change(data1, data2, xdiv, ydiv, Xsigma, Ysigma);
        }
	    }
      else if (value == "optionS2")
	    {
        if (Xsigma!=2){
          Xsigma = 2;
          change(data1, data2, xdiv, ydiv, Xsigma, Ysigma);
        }
	    }
      else if (value == "optionS3")
	    {
        if (Xsigma!=3){
          Xsigma = 3;
          change(data1, data2, xdiv, ydiv, Xsigma, Ysigma);
        }
	    }
      else if (value == "optionS4")
	    {
        if (Xsigma != 4){
          Xsigma = 4;
          change(data1, data2, xdiv, ydiv, Xsigma, Ysigma);
        }
	    }
      else if (value == "optionS5")
	    {
        Ysigma = 1;
        change(data1, data2, xdiv, ydiv, Xsigma, Ysigma);
	    }
      else if (value == "optionS6")
	    {
        Ysigma = 2;
        change(data1, data2, xdiv, ydiv, Xsigma, Ysigma);
	    }
      else if (value == "optionS7")
	    {
        Ysigma = 3;
        change(data1, data2, xdiv, ydiv, Xsigma, Ysigma);
	    }
      else if (value == "optionS8")
	    {
        Ysigma = 4;
        change(data1, data2, xdiv, ydiv, Xsigma, Ysigma);
	    }
    }


function change(data1, data2, xdiv, ydiv, Xsigma, Ysigma) {

    // For Standard Deviation
    var Xmax = nearMax(DataSet[data1]);
    var Xmin = 0;
    var Ymax = nearMax(DataSet[data2]);
    var Ymin = 0;

    if (Xsigma == 1){
      Xmax = mean(DataSet[data1]) + getStd(DataSet[data1]);
      Xmin = mean(DataSet[data1]) - getStd(DataSet[data1]);
      
    }
    else if (Xsigma == 2){
      Xmax = mean(DataSet[data1]) + (2*getStd(DataSet[data1]));
      Xmin = mean(DataSet[data1]) - (2*getStd(DataSet[data1]));
    }
    else if (Xsigma == 3){
      Xmax = mean(DataSet[data1]) + (3*getStd(DataSet[data1]));
      Xmin = mean(DataSet[data1]) - (3*getStd(DataSet[data1]));
    }
    else if (Xsigma == 0){
      Xmax = nearMax(DataSet[data1]);
      Xmin = 0;
    }
    
    if (Ysigma == 1){
      Ymax = mean(DataSet[data2]) + getStd(DataSet[data2]);
      Ymin = mean(DataSet[data2]) - getStd(DataSet[data2]);
    }
    else if (Ysigma == 2){
      Ymax = mean(DataSet[data2]) + (2*getStd(DataSet[data2]));
      Ymin = mean(DataSet[data2]) - (2*getStd(DataSet[data2]));
    }
    else if (Ysigma == 3){
      Ymax = mean(DataSet[data2]) + (3*getStd(DataSet[data2]));
      Ymin = mean(DataSet[data2]) - (3*getStd(DataSet[data2]));
    }
    else if (Ysigma == 0){
      Ymax = nearMax(DataSet[data2]);
      Ymin = 0;
    }

    // Redefining the values

    Xmax = Xmax/xdiv;
    Ymax = Ymax/ydiv;

    if (Xmin<0) {
      Xmin = 0;
    }

    if (Ymin<0) {
      Ymin = 0;
    }

    // Update scale domains
    var colorScale = d3.scale.category20()
    var xScale = d3.scale.linear()
      .domain([
          Xmin,
          Xmax
          ])
      .range([0,w]);
    
    var yScale = d3.scale.linear()
      .domain([
          Ymin,
          Ymax
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
    .ticks(7)
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
              .attr("r", 1);  // Change size
      })
      .delay(500) // Dynamic delay (i.e. each item delays a little longer)
      //.ease("linear")  // Transition easing - default 'variable' (i.e. has acceleration), also: 'circle', 'elastic', 'bounce', 'linear'
      .attr('cx',function (d) { return xScale(d[data1]) })
        .attr('cy',function (d) { return yScale(d[data2]) })
        .attr('r',function (d) { if (d[data1]<=Xmax & d[data1]>=Xmin & d[data2]<=Ymax & d[data2]>=Ymin ) {return (d[radius]/(Math.max.apply(null,DataSet[radius])))*15} else {return 0} }) // Circle's Y
      .each("end", function() {  // End animation
          d3.select(this)  // 'this' means the current element
              .transition()
              .duration(500)
    });
}})
