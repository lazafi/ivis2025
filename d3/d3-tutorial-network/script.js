// Set 21-color scheme https://www.r-bloggers.com/2013/02/the-paul-tol-21-color-salute/
const color = d3.scaleOrdinal([
  "#771155", "#AA4488", "#CC99BB", "#114477", "#4477AA", "#77AADD", "#117777", 
  "#44AAAA", "#77CCCC", "#117744", "#44AA77", "#88CCAA", "#777711", "#AAAA44", 
  "#DDDD77", "#774411", "#AA7744", "#DDAA77", "#771122", "#AA4455", "#DD7788"])

d3.json("./data.json").then(graph => {
  const {nodes, links} = graph;
 
  // I have already implemented the color legend.
  createColorLegend(nodes);

  // In this tutorial, we will implement node-link diagram ...
  plotNodeLink(nodes, links);

  // and tree map.
  plotTreeMap(nodes);
});

const createColorLegend = function(nodes) {
  let sections = d3.nest()
    .key(d => d['Section ID'])
    .rollup(d => d[0]['Section'])
  .entries(nodes);

  sections = sections.sort((a, b) => d3.ascending(+a.key, +b.key))

  const legend = d3.select("#legend")
    .style("font-family", "sans-serif")
    .style("font-size", "10px");

  legend.selectAll("div")
    .data(sections)
    .join("div")
      .attr('class', 'swatches-item')
      .html(d => `<div class="swatches-swatch" style="background: ${color(+d.key - 1)};"></div>
        <div class="swatches-label">${d.value}</div>`);
}

const plotNodeLink = function(nodes, links) {
  const width = 1600, height = 800;

  const svg = d3.select("#network")
    .append("svg")
    .attr("viewBox", [-width / 2, -height / 2, width, height])
    .attr("style", "max-width: 100%; height: auto; height: intrinsic;");

  // 1. Construct the forces and simulate for node positions
  // Ref: https://d3js.org/d3-force and https://www.d3indepth.com/force-layout/
  const simulation = d3.forceSimulation(nodes)
  
    // forceManyBody causes nodes to repel each other with the maximum distance
    .force("node", d3.forceManyBody().distanceMax(150))
    // forceLink pushes linked elements to be a fixed distance apart
    .force("link", d3.forceLink(links).id(d => d.id))
    // forceCenter helps keep the nodes in the center of the container
    .force("center", d3.forceCenter())
    // use on ticked to update the chart in every simulated step
    .on("tick", ticked);

  console.log(simulation);

  // 2. Add links to the SVG canvas
  const link = svg.append("g")
    .selectAll("line")
    .data(links)
    .join("line")
      .attr("stroke", "black")
      .attr("stroke-width", d => d.strength / 2)
      .attr("stroke-opacity", 0.3)
   ;

  // 3. Add nodes to the SVG canvas
  const node = svg.selectAll("circle")
  .selectAll("circle")
  .data(nodes)
  .join("circle")
    .attr("r", d => 2 + d['Trade Value'])
    .attr("fill", d => color(d['Section ID'] - 1))
    .attr("stroke", "#fff")
    .attr("stroke-width", 1.5)
    .attr("stroke-opacity", 1)
    //.call(drag(simulation));

  // 4. Add a tooltip for each node
  node.append("title").text(d => `${d.HS4}\n` + 
    `${d3.format("$,")(d['Trade Value'])} | ` +
    `RCA: ${d3.format(".2f")(d['Trade Value RCA'])}`);

  // 5. Update the position of nodes and edges during the simulation
  function ticked() {
    // Update link paths
    link.attr("x1", d => d.source.x)
        .attr("y1", d => d.source.y)
        .attr("x2", d => d.target.x)
        .attr("y2", d => d.target.y);

    // Update node positions
    node.attr("cx", d => d.x)
        .attr("cy", d => d.y);  


  }

  // 6. Adjust the position when users drag a node
  // Ref: https://d3js.org/d3-drag and https://observablehq.com/collection/@d3/d3-drag
  function drag(simulation) {    
    // Reheat the simulation when drag starts, and fix the subject position.
    

    // Update the subject (dragged node) position during drag.
    

    // Restore the target alpha so the simulation cools after dragging ends.
    // Unfix the subject position now that it’s no longer being dragged.
    
    
    // Return the drag behavior


  }
}

const plotTreeMap = function(nodes) {
  const width = 1500, height = 800;

  const svg = d3.select("#treemap")
    .append("svg")
    .attr("viewBox", [0, 0, width, height])
    .attr("width", width)
    .attr("height", height)
    .attr("style", "max-width: 100%; height: auto; height: intrinsic;")
    .attr("font-family", "sans-serif")
    .attr("font-size", "10px");

  // 1. Transform the node data to hierarcical format
  // Ref: https://d3js.org/d3-array/group and https://observablehq.com/@d3/d3-group
  

  // 2. Create the hierarchical layout with d3.hierarchy
  // Ref: https://d3js.org/d3-hierarchy/hierarchy
  
  
  // 3. Compute the treemap layout
  // Ref: https://d3js.org/d3-hierarchy/treemap
  
  
  // 4. Add leave nodes to the SVG element
  

  // 5. Add the tooltip to each node
  //node.append("title").text(d => `${d.data.HS4}\n${d3.format("$,")(d.value)}`);

  // 6. Add text to each node
  /*node.append("clipPath")
        .attr("id", (d, i) => `clip-${i}`)
      .append("rect")
       .attr("width", d => d.x1 - d.x0)
       .attr("height", d => d.y1 - d.y0)

  node.append("text")
       .attr("clip-path", (d, i) => `url(#clip-${i})`)
       .html(d => d.value >= 500000000 ? `<tspan x=5 y=15 font-weight="bold">${d.data.HS4}</tspan>
                   <tspan x=5 y=30 fill-opacity=0.7>${d3.format("$.3s")(d.value)}</tspan>` : ``)*/
}
