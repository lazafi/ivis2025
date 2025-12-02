/* Set the time format
  Ref: https://github.com/d3/d3-time-format */
const parseTime = d3.timeParse("%Y");

/* Load the dataset and formatting variables
  Ref: https://www.d3indepth.com/requests/ */
d3.csv("./data.csv", d => {
  return {
    geo:d.geo,
    country:d.country,
    date:parseTime(d.year),
    year:+d.year,
    value:+d.value
  }
}).then(data => {
  // Print out the data on the console
  console.log(data);

  

  /* Data Manipulation in D3 
    Ref: https://observablehq.com/@d3/d3-extent?collection=@d3/d3-array */

  // Get the minimum and maximum of the percent pay gap
  console.log(d3.min(data, d => d.value));
  console.log(d3.max(data, d => d.value));


  // Filter the data from the year 2020
  const data2020 = data.filter(d => d.year === 2020);
  console.log(data2020);


  // Sort the country by the percentage in the descending order
  
  console.log(data2020.sort((a, b) => d3.descending(a.value, b.value)));

  // Get the mean and median of gender gap percentage
  
  console.log(d3.mean(data2020, d => d.value));
  // Move the color scale here to share with both charts


  // Plot the bar chart
  createBarChart(data);

  // Plot the line chart
  //createLineChart(data, colors);
})

const createBarChart = (data) => {
  /* Set the dimensions and margins of the graph
    Ref: https://observablehq.com/@d3/margin-convention */
  const width = 900, height = 400;
  const margins = {top: 10, right: 30, bottom: 80, left: 20};

  /* Create the SVG container */
  //const svg = 
  d3.select("#bar")
  .append("svg")
  
  .attr("viewBox", [0, 0, width, height])

  /* Define x-axis, y-axis, and color scales
    Ref: https://observablehq.com/@d3/introduction-to-d3s-scales */

  /* xScale: scaleBand() https://observablehq.com/@d3/d3-scaleband */
  const xScale = d3.scaleBand()
  .domain(data.map(d => d.country))
  .range([margins.left, width - margins.right])

  console.log(xScale("Austria"));
  
  /* yScale: scaleLinear() https://observablehq.com/@d3/d3-scalelinear */
  
  const yScale = d3.scaleLinear()
  .domain([0, d3.max(data, d => d.value)])
  .range([height - margins.bottom, margins.top]);
  
  console.log(yScale(0));
  console.log(yScale(d3.max(data, d => d.value)));

  /* Working with Color: https://observablehq.com/@d3/working-with-color 
    D3 color schemes: https://observablehq.com/@d3/color-schemes 
    d3-scale-chromatic: https://github.com/d3/d3-scale-chromatic */
  const countries = data.map(d => d.country);
  const colors = d3.scaleOrdinal()
    .domain(countries)
    .range(d3.quantize(d3.interpolateRainbow, countries.length));
  
  console.log(colors("France"))

  /* Create the bar elements and append to the SVG group
    Ref: https://observablehq.com/@d3/bar-chart */
  

  /* Add the tooltip when hover on the bar */
  
  
  /* Create the x and y axes and append them to the chart
    Ref: https://www.d3indepth.com/axes/ and https://github.com/d3/d3-axis */
  

  /*xGroup.selectAll("text")
    .style("text-anchor", "end")
    .attr("dx", "-.8em")
    .attr("dy", ".15em")
    .attr("transform", "rotate(-65)");*/
}

const createLineChart = (data, colors) => {
  /* Set the dimensions and margins of the graph */
  const width = 900, height = 400;
  const margins = {top: 10, right: 100, bottom: 20, left: 20};

  /* Create the SVG container */
  

  /* Define x-axis, y-axis, and color scales */
  

  /* Construct a line generator
    Ref: https://observablehq.com/@d3/line-chart and https://github.com/d3/d3-shape */
  

  /* Group the data for each country
    Ref: https://observablehq.com/@d3/d3-group */
  

  /* Draw a line path for each country */
  

  /* Add the tooltip when hover on the line */
  

  /* Create the x and y axes and append them to the chart */
  

  /* Add text labels on the right of the chart */
  const data2020 = data.filter(data => data.year == 2020);
  svg.selectAll('text.label')
    .data(data2020)
    .join('text')
      .attr('x', width - margins.right + 5)
      .attr('y', d => yScale(d.value))
      .attr('dy', '0.35em')
      .style('font-family', 'sans-serif')
      .style('font-size', 12)
      .style('fill', d => colors(d.country))
    .text(d => d.country);
}