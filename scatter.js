

d3.csv('geant4.csv', function (data) {
    // Variables
    var body = d3.select('#scatter')
      var margin = { top: 40, right: 60, bottom: 60, left: 140 }
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

    d3.select("#XS[value=\"optionS4\"]").property("checked", true);
    d3.select("#YS[value=\"optionS8\"]").property("checked", true);

    var data1 = 'cycles';
    var data2 = 'instructions';
    var radius = 'cycles';
    var xdiv = 1;
    var ydiv = 1;
    var xslider = document.getElementById('XZ');
    var yslider = document.getElementById('YZ');
    var Xsigma = 0;
    var Ysigma = 0;
    
    // Setting the Default Plot
    // Scales
    var colorScale = d3.scaleOrdinal(d3.schemeCategory20);

    for (let i=0; i<14; i++) {

      strVal1 = 'c'+String(i+1)
      strVal2 = 'l'+String(i+1)

      document.getElementById(strVal1).style.backgroundColor = d3.schemeCategory20[i];
      document.getElementById(strVal2).innerHTML = libs[i];

    }

    console.log(d3.schemeCategory20)

    var xScale = d3.scaleLinear()
      .domain([
          0,
          nearMax(DataSet[data1])/xdiv
          ])
      .range([0,w]);
      
    var yScale = d3.scaleLinear()
      .domain([
          0,
          nearMax(DataSet[data2])/ydiv
          ])
      .range([h,0]);

      // SVG
      var svg = body.append('svg')
          .attr('height',h + margin.top + margin.bottom)
          .attr('width',w + margin.left + margin.right)
        .append('g')
          .attr('transform','translate(' + margin.left + ',' + margin.top + ')');

      // X-axis
      var xAxis = svg.append("g")
      .attr("transform", "translate(0," + h + ")")
      .call(d3.axisBottom(xScale).ticks(5));
      
      // Y-axis
      var yAxis = svg.append("g")
      .call(d3.axisLeft(yScale).ticks(7));

    // Add brushing
    var brush = d3.brushX()                 // Add the brush feature using the d3.brush function
    .extent( [ [0,0], [w,h] ] )
    .on("end", updateChart); // initialise the brush area: start at 0,0 and finishes at width,height: it means I select the whole graph area


    // Create the scatter variable: where both the circles and the brush take place
    var scatter = svg.append('g')
      .attr("clip-path", "url(#clip)");

    // Add the brushing
    scatter
    .append("g")
      .attr("class", "brush")
      .call(brush);

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


    // A function that set idleTimeOut to null
    var idleTimeout
    function idled() { idleTimeout = null; }

    var minVal 
    var maxVal 

    // A function that update the chart for given boundaries
    function updateChart() {

      extent = d3.event.selection

      if (extent != null) {
        minVal = xScale.invert(extent[0])
        maxVal = xScale.invert(extent[1])
      }

      // If no selection, back to initial coordinate. Otherwise, update X axis domain
      if(!extent){
        if (!idleTimeout) return idleTimeout = setTimeout(idled, 350); // This allows to wait a little bit
        xScale.domain([ 0, nearMax(DataSet[data1])/xdiv])
        svg
        .selectAll("circle")
        .transition().duration(1000)
        .attr('cx',function (d) { return xScale(d[data1]) })
        .attr('cy',function (d) { return yScale(d[data2]) })
        .attr('r',function (d) { return (d[radius]/(Math.max.apply(null,DataSet[radius])))*15 } ); // This remove the grey brush area as soon as the selection has been done
      }else{
        xScale.domain([ xScale.invert(extent[0]), xScale.invert(extent[1]) ])
        svg.select(".brush").call(brush.move, null)
        xAxis.transition().duration(1000).call(d3.axisBottom(xScale).ticks(5));
        svg
          .selectAll("circle")
          .transition().duration(1000)
          .attr('cx',function (d) { return xScale(d[data1]) })
          .attr('cy',function (d) { return yScale(d[data2]) })
          .attr('r',function (d) { if (d[data1]<=maxVal & d[data1]>=minVal) {return (d[radius]/(Math.max.apply(null,DataSet[radius])))*15} else {return 0} } ); // This remove the grey brush area as soon as the selection has been done
      }

      xAxis.transition().duration(1000).call(d3.axisBottom(xScale).ticks(5));
    
    }

    var xText = svg.append("text")             
      .attr("transform",
            "translate(" + (w/2) + " ," + 
                           (h + margin.top + 10) + ")")
      .style("text-anchor", "middle")
      .text(data1.charAt(0).toUpperCase() + data1.slice(1));

    var yText = svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left + 15)
      .attr("x",0 - (h / 2))
      .attr("dy", "1em")
      .style("text-anchor", "middle")
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
    var colorScale = d3.scaleOrdinal(d3.schemeCategory20);
    xScale = d3.scaleLinear()
      .domain([
          Xmin,
          Xmax
          ])
      .range([0,w]);
    
    yScale = d3.scaleLinear()
      .domain([
          Ymin,
          Ymax
          ])
      .range([h,0]);

    xAxis.transition().duration(1000).call(d3.axisBottom(xScale).ticks(5));

    yAxis.transition().duration(1000).call(d3.axisLeft(yScale).ticks(7));

    xText.transition().duration(1000).text().text(data1.charAt(0).toUpperCase() + data1.slice(1));

    yText.transition().duration(1000).text().text(data2.charAt(0).toUpperCase() + data2.slice(1));

      // Update circles
    svg.selectAll("circle")
      .data(data)  // Update with new data
      .transition()  // Transition from old to new
      .duration(1000)  // Length of animation
      .delay(500) // Dynamic delay (i.e. each item delays a little longer)
      .attr('cx',function (d) { return xScale(d[data1]) })
        .attr('cy',function (d) { return yScale(d[data2]) })
        .attr('r',function (d) { if (d[data1]<=Xmax & d[data1]>=Xmin & d[data2]<=Ymax & d[data2]>=Ymin ) {return (d[radius]/(Math.max.apply(null,DataSet[radius])))*15} else {return 0} } ) ;
}})
