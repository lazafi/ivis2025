

(() => {
  // define main elements
  const width = 900, height = 600;
  const svg = d3.select("#map")
    .append("svg")
    .attr("viewBox", [0, 0, width, height]);
  const mapGroup = svg.append("g").attr("id", "map-group");
  const pointsGroup = svg.append("g").attr("id", "points-group");

  // used for all animations
  const getTransition = () => d3.transition()
    .duration(300)
    .ease(d3.easeLinear);

  // convert listing data to geojson points and merge with existing city map geojson
  // param listings: the listing data from the CSV
  // param geo: the geojson data for the neighbourhoods
 const listing2geo = (listings, geo) => {
  geo.features = geo.features.concat(listings.map(d => ({
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [+d.longitude, +d.latitude]
      },
      properties: {
        name: d.name,
        neighbourhood: d.neighbourhood,
        availability_365: +d.availability_365,
        price: +d.price
      }
    })));
    return geo;
  }

  // Legend as a separate svg group
  // param svg: the svg element to append the legend to
  // param colorScale: the color scale used for the map
  // param extent: the extent of the data values
  const createLegend = (svg, colorScale, extent) => {
    const legend = svg.append("g").attr("transform", "translate(20, 30)");
    const legendScale = d3.scaleLinear()
      .domain(extent)
      .range([0, 100]);
    const legendAxis = d3.axisBottom(legendScale)
      .ticks(5)
      .tickFormat(d => Math.round(d));
    legend.append("g")
      .attr("class", "axis")
      .attr("transform", "translate(10, 30)")
      .call(legendAxis);
    legend.selectAll("rect")
      .data(colorScale.ticks(5))
      .enter().append("rect")
      .attr("x", (d, i) => i * 20)
      .attr("y", 10)
      .attr("width", 20)
      .attr("height", 20)
      .attr("fill", d => colorScale(d));
    legend.append("text")
      .attr("x", 0)
      .attr("y", -10)
      .text("Availability (%)");
  };

  // draws city overview map
  // param geojson: the geojson data for the city map and listings
  // param hoods: a map of aggregated values grouped by neighbourhood
  // param colorScale: the color scale used for the map
  // param projection: the d3 projection used for the map
  // param drawDistrict: zoom event handler function to draw a district when clicked
  const drawCity = (geojson, hoods, colorScale, projection, drawDistrict) => {

    projection.fitSize([width, height], geojson);
    
    // clear previous elements
    d3.selectAll("#back").remove();
    d3.selectAll("circle").remove();
    mapGroup.selectAll("path").remove();
    
    // draw city map
    mapGroup.selectAll("path")
      .data(geojson.features.filter(d => d.geometry.type === "Polygon" || d.geometry.type === "MultiPolygon"))
      .enter()
      .append("path")
      .attr("fill", d => colorScale(hoods.get(d.properties.neighbourhood)))
      .attr("d", d3.geoPath().projection(projection))
      .attr("class", "neighbourhood")
      .attr("note", d => d.properties.neighbourhood)
      .style("stroke", "black")
      .on("click", (event, d) => drawDistrict(event, d, geojson, hoods, colorScale, projection))
      .append("title")
      .text(d => `${d.properties.neighbourhood}\n${hoods.get(d.properties.neighbourhood)}%`);
  };

  // Event handler to draw a district
  // param event: the click event
  // param district: the geojson data for the clicked district
  // param geojson: the geojson data for the neighbourhoods
  // param points: the geojson data for the listings
  // param hoods: a map of aggregated values grouped by neighbourhood
  // param colorScale: the color scale used for the map
  // param projection: the d3 projection used for the map
  const drawDistrict = (event, district, geojson, hoods, colorScale, projection) => {
    event.stopPropagation();
    projection.fitSize([width, height], district);
    const t = getTransition();
    
    // draw zoomed in district map
    d3.selectAll(".neighbourhood")
      .transition(t)
      .attr("d", d3.geoPath().projection(projection))
      .attr("stroke-width", 1)
      .transition(t)
      .filter(dd => dd === district)
      .transition(t)
      .attr("stroke-width", 3);

    // clear other listings
    d3.selectAll("circle").remove();
    
    // Draw listings for this neighbourhood
    pointsGroup.selectAll("circle")
      .data(geojson.features
              .filter(d => d.geometry.type === "Point")
              .filter(dd => dd.properties.neighbourhood === district.properties.neighbourhood))
      .enter()
      .append("circle")
      .attr("cx", d => projection(d.geometry.coordinates)[0])
      .attr("cy", d => projection(d.geometry.coordinates)[1])
      .attr("r", 2)
      .attr("fill", d => colorScale(Math.round(d.properties.availability_365 / 365 * 100)))
      .attr("opacity", 0.1)
      .attr("visibility", "hidden");

    // animate points appearance
    pointsGroup.selectAll("circle")
      .transition(t)
      .attr("visibility", "visible")
      .attr("opacity", 0.1)
      .transition(t)
      .attr("opacity", 0.5);

    // add back button
    svg.append("text")
      .attr("id", "back")
      .attr("class", "back")
      .attr("width", 50)
      .attr("height", 30)
      .attr("x", width - 100)
      .attr("y", height - 50)
      .append("tspan")
      .text("[ BACK ]")
      .on("click", e => {
        e.stopPropagation();
        drawCity(geojson, hoods, colorScale, projection, drawDistrict);
      });
  };

  // load data
  Promise.all([
    d3.json("./data/neighbourhoods.geojson"),        // GeoJSON data
    d3.dsv(",", "./data/listings.csv", d => ({       // CSV data
      id: d.id,
      name: d.name,
      neighbourhood: d.neighbourhood,
      latitude: +d.latitude,
      longitude: +d.longitude,
      availability_365: +d.availability_365,
      price: +d.price
    }))
  ]).then(([geojson, listings]) => {
    // print listing data
    console.log(listings);

    const geo = listing2geo(listings, geojson)
    //console.log(geo);

    // aggregate availability data grouped by neighbourhood
    const hoods = d3.rollup(listings, v => Math.round(d3.mean(v, d => d.availability_365) / 365 * 100), d => d.neighbourhood);
    
    const colorScale = d3.scaleSequential(d3.interpolateOranges)
      .domain(d3.extent(Array.from(hoods.values())).reverse());
    const projection = d3.geoMercator();
 
    // call city draw function with the combined geojson data and aggregated availability data
    drawCity(geo, hoods, colorScale, projection, drawDistrict);
    createLegend(svg, colorScale, d3.extent(Array.from(hoods.values())).reverse());
  });
})();

