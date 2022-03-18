var width = 960,
    height = 1060;

var format = d3.format(",d");

var color = d3.scaleOrdinal()
    .range(d3.schemeCategory10
        .map(function(c) { c = d3.rgb(c); c.opacity = 0.6; return c; }));

var stratify = d3.stratify()
    .parentId(function(d) { return d.dso.substring(0, d.dso.lastIndexOf(".")); });

var treemap = d3.treemap()
    .size([width, height])
    .padding(1)
    .round(true);

d3.csv("geant4.csv", type, function(error, data) {
  if (error) throw error;

    var nested_data = d3.nest()
            // Create a root node by nesting all data under the single value "root":
            .key(function () { return "root"; })
            // Nest by other fields of interest:
            .key(function (d) { return d.dso; })
            .entries(data);

    var root = d3.hierarchy(nested_data[0], function (d) { return d.values; })
            .sum(function (d) { return d.cycles; });

    console.log(root)

  treemap(root);

  d3.select("body")
    .selectAll(".node")
    .data(root.leaves())
    .enter().append("div")
      .attr("class", "node")
      .attr("title", function(d) { return "Library: " + d.data.dso + "\n" + "Symbol: " + d.data.symbol + "\n" + "Cycles: " + format(d.data.cycles) + "\n" + "Instructions: " + format(d.data.instructions) + "\n" + "Branches: " + format(d.data.branches) + "\n" + "Branch-Misses: " + format(d.data.branchmisses); })
      .style("left", function(d) { return d.x0 + "px"; })
      .style("top", function(d) { return d.y0 + "px"; })
      .style("width", function(d) { return d.x1 - d.x0 + "px"; })
      .style("height", function(d) { return d.y1 - d.y0 + "px"; })
      .style("background", function(d) { while (d.depth > 1) d = d.parent; return color(d.data.key); })
    .append("div")
      .attr("class", "node-label")
      .text(function(d) { return d.data.symbol; })
    .append("div")
      .attr("class", "node-value")
      .text(function(d) { return format(d.data.cycles); });
});

function type(d) {
  d.cycles = +d.cycles;
  return d;
}