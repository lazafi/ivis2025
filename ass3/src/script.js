
// Set the time format
const parseTime = d3.timeParse("%Y");

const width = 900, height = 600;  
// The svg
var svg = d3.select("#map")
    .append("svg")
    .attr("viewBox", [0, 0, width, height]);

console.log("Width:", width, "Height:", height);


   //  .scale(1500)                       // This is like the zoom
    //.translate([ width/2, height/2 ]);
                  //  .scale(150)
                  //  .translate([width / 2, height / 2]) 
                    
Promise.all([
  d3.json("./data/neighbourhoods.geojson"),
//  d3.json("./data/wien.geojson"),
  d3.csv("./data/listings.csv")
]).then(function([geojson, listings]) {
console.log(geojson.features)
console.log( d3.geoPath()
            .projection(projection)(geojson.features[0]))    

            console.log(listings[0]);

const hoods = d3.rollup(listings, v => Math.round(d3.mean(v, d => d.availability_365) / 365 * 100), d => d.neighbourhood);
console.log(hoods);
const values = Array.from(hoods.values());

const colors = d3.scaleSequential(d3.interpolateOranges)
  .domain(d3.extent(values).reverse());
     //     .range(d3.extent(Array.from(hoods.values())))
    // .range([0, 100])
    //.range(d3.quantize(d3.interpolateWarm, Array.from(hoods.values()).length));

    console.log( colors(hoods.get("Innere Stadt")))

    console.log(colors(160))
var projection = d3.geoMercator()
   // .center([16.39, 4.23])  
    .fitSize([width, height], geojson);

  svg.append("g")
      .selectAll("path")
      .data(geojson.features)
      .enter().append("path")
        .attr("fill", d => {
          console.log(d.properties.neighbourhood);
          console.log(hoods.get(d.properties.neighbourhood));
          console.log(colors(hoods.get(d.properties.neighbourhood)));
          return colors(hoods.get(d.properties.neighbourhood));
        })
        .attr("d", d3.geoPath()
            .projection(projection)
        )
        .attr("note", d => d.properties.neighbourhood)
        .style("stroke", "black")
        .append("title")
          .text(d => `${d.properties.neighbourhood}\n${hoods.get(d.properties.neighbourhood)}%`);



// Create a legend for the color scale
const legend = svg.append("g")
    .attr("transform", "translate(20, 30)");

const legendScale = d3.scaleLinear()
    .domain(d3.extent(values).reverse())
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

