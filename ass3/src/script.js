
const width = 900, height = 600;
var projection;
var points;
var hoods;
var colors;
var zoomin, zoomout;

// The svg
var svg = d3.select("#map")
  .append("svg")
  .attr("viewBox", [0, 0, width, height]);


 
Promise.all([
  d3.json("./data/neighbourhoods.geojson"),
  d3.csv("./data/listings.csv")
]).then(function ([geojson, listings]) {

  // prepare data
  hoods = d3.rollup(listings, v => Math.round(d3.mean(v, d => d.availability_365) / 365 * 100), d => d.neighbourhood);
  
  colors = d3.scaleSequential(d3.interpolateOranges)
    .domain(d3.extent(Array.from(hoods.values())).reverse())
    //     .range(d3.extent(Array.from(hoods.values())))
    //.range([100, 0])
    //.range(d3.quantize(d3.interpolateWarm, Array.from(hoods.values()).length));
    ;

  projection = d3.geoMercator()


   // Zoom  out area
  svg.append("rect")
    .attr("class", "back")
    .attr("width", 50)
    .attr("height", 30)
    .attr("x", width-100)
    .attr("y", height - 50)
    .on("click",  e => {
      console.log("Zoomout");
           const t = d3.transition()
      .duration(300)
      .ease(d3.easeLinear);
      e.stopPropagation();
      svg.selectAll(".neighbourhood").transition(t).remove();
    
       projection.fitSize([width, height], geojson);
       d3.selectAll("path")
       .data(geojson.features)
        .enter().append("path")
        .attr("fill", d => colors(hoods.get(d.properties.neighbourhood)))
        .attr("d", d3.geoPath().projection(projection))
        .attr("class", "neighbourhood")
        .attr("note", d => d.properties.neighbourhood)
        .style("stroke", "black")
        .on("click", zoomin)
        .append("title")
        .text(d => `${d.properties.neighbourhood}\n${hoods.get(d.properties.neighbourhood)}%`);
    drawCity(geojson)
    });

   function drawCity(geojson) {
      projection.fitSize([width, height], geojson);
  

      return svg.append("g")
        .selectAll("path")
        .data(geojson.features)
        .enter().append("path")
        .attr("fill", d => colors(hoods.get(d.properties.neighbourhood)))
        //.attr("fill", "white")
        .attr("d", d3.geoPath().projection(projection))
        .attr("class", "neighbourhood")
        .attr("note", d => d.properties.neighbourhood)
        .style("stroke", "black")
        .on("click", zoomin)
        .append("title")
        .text(d => `${d.properties.neighbourhood}\n${hoods.get(d.properties.neighbourhood)}%`);
    }


    drawCity(geojson);


//  display_overview();

    points = listings.map(d => {
      return {
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [ +d.longitude, +d.latitude ]
        },
        properties: {
          name: d.name,
          neighbourhood: d.neighbourhood,
          availability_365: +d.availability_365,
          price: +d.price
        }
      };
    });
    
    console.log("Points:", points);

    // create empty group for points (fill in at zoom)
     var g2 = svg.append("g")
      .attr("class", "points-group")
      .selectAll("circle")
      .data({})
      .enter().append("circle")



  // Zoom function
  function zoomin(event, d) {
    event.stopPropagation();


      console.log("Zoomin on ", d);
      //const [[x0, y0], [x1, y1]] = d3.geoPath().projection(projection).bounds(d);
      //console.log(x0, y0, x1, y1);
      projection.fitSize([width, height], d);

      const t = d3.transition()
      .duration(300)
      .ease(d3.easeLinear);

     d3.selectAll(".neighbourhood")
        .transition(t)
        .attr("d", d3.geoPath().projection(projection))
        .attr("stroke-width", 1)
      .transition(t)
        .filter(dd => dd === d)
        .transition(t)
        .attr("stroke-width", 3);
    
      /*  d3.selectAll("circle")
        .attr("cx", dd => projection(dd.geometry.coordinates)[0])
        .attr("cy", dd => projection(dd.geometry.coordinates)[1])
        .attr("visibility", "hidden")
        .filter(dd => dd.properties.neighbourhood === d.properties.neighbourhood)
        .transition(t)
       .attr("visibility", "visible")*/
 
       console.log("Adding circles for neighbourhood:", d.properties.neighbourhood);
   
        // revome previous points
       d3.selectAll("circle").remove();
        // show new points group
      // append points for this neighbourhood
       var addpoints =  points.filter(dd => dd.properties.neighbourhood === d.properties.neighbourhood)
        console.log("Points to add:", addpoints);
      
       d3.selectAll(".points-group")
        .selectAll("circle")
        .data(addpoints)
      .enter()
     .append("circle")
      .attr("cx", d => projection(d.geometry.coordinates)[0])
      .attr("cy", d => projection(d.geometry.coordinates)[1])
      .attr("r", 2)
      .attr("fill", d => colors(Math.round(d.properties.availability_365 / 365 * 100)))
      .attr("opacity", 0.1)
    .attr("visibility", "hidden")
   /*   .append("image")
    .attr('width', 20)
    .attr('height', 20)
    .attr("x", d => projection(d.geometry.coordinates)[0]-10)
    .attr("y", d => projection(d.geometry.coordinates)[1]-10)
    .attr("xlink:href", 'https://cdn3.iconfinder.com/data/icons/softwaredemo/PNG/24x24/DrawingPin1_Blue.png')
    */

       d3.selectAll(".points-group")
       .selectAll("circle")
       .transition(t)
       .attr("visibility", "visible") 
       .attr("opacity", 0.1)
       .transition(t)
       .attr("opacity", 0.5);

    }

  // Create a legend for the color scale
  const legend = svg.append("g")
    .attr("transform", "translate(20, 30)");

  const legendScale = d3.scaleLinear()
    .domain(d3.extent(Array.from(hoods.values())).reverse())
    .range([0, 100]);

  const legendAxis = d3.axisBottom(legendScale)
    .ticks(5)
    .tickFormat(d => Math.round(d));

  legend.append("g")
    .attr("class", "axis")
    .attr("transform", "translate(10, 30)")
    .call(legendAxis);

  legend.selectAll("rect")
    .data(colors.ticks(5))
    .enter().append("rect")
    .attr("x", (d, i) => i * 20)
    .attr("y", 10)
    .attr("width", 20)
    .attr("height", 20)
    .attr("fill", d => colors(d));

  legend.append("text")
    .attr("x", 0)
    .attr("y", -10)
    .text("Availability (%)");




});

