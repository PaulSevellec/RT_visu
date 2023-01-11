var margin = {top: 20, right: 10, bottom: 40, left: 100},
    width = 1080 - margin.left - margin.right,
    height = 600 - margin.top - margin.bottom;

// The svg definition
var svg = d3.select("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");

// Map and projection
const path = d3.geoPath();
const projection = d3.geoMercator()
    .scale(130)
    .center([10,20])
    .translate([width / 2-20, height / 2+100]);

// Data and color scale
let city_mean = new Map()
let city_deviation = new Map()
const colorScale = d3.scaleSequential([30.8,-15.5], d3.interpolateRdYlBu)
const colorScale_deviation = d3.scaleSequential([4.0,-2.0], d3.interpolateRdYlBu)
const colorScale_noData = d3.scaleSequential([0,-200], d3.interpolateGreys)

// Main function to draw the map
var requestData = async function(year, boolean){
    // Data loading
    Promise.all([
        d3.json("../world_map.geojson"),
        d3.csv("../city_template.csv"),
        d3.csv("../csv_cities_by_year/"+year+"_city.csv", function (d) {
            city_mean.set(d.name, +d.Temp);
            city_deviation.set(d.name, +d.Mean_deviation)
        })
    ]).then(function(loadData){
        svg.selectAll("g").remove();
        let cities = loadData[1];
        let topo = loadData[0];

        var g = svg.append("g")

        // drawing the countries
        g.selectAll("path")
            .data(topo.features)
            .join("path")
            // draw each country
            .attr("d", d3.geoPath()
                .projection(projection)
            )
            .attr("fill", 'grey')
            .attr("stroke", 'black')
            .attr("opacity", 0.3)

        // Place a circle for each city in the data with appropriate color
        function draw_circle(element){

            latlong = projection([element.Longitude,element.Latitude])
            g.append("circle")
                .attr("cx", latlong[0])
                .attr("cy", latlong[1])
                .attr("r",1)
                .style("fill", function () {
                    let color;
                    let temp;
                    if (boolean) {
                        temp = city_mean.get(element.City) || -100;
                        color = colorScale(temp);
                    }else{
                        temp = city_deviation.get(element.City) || -100;
                        color = colorScale_deviation(temp);
                    }

                    if (temp == -100) {
                        // In case a city has no value for this time period
                        color = colorScale_noData(temp);
                    }
                    return color
                })
                .on("mouseover", function(d){
                    d3.select("#city").text(element.City);
                    if (boolean){
                        d3.select("#hint")
                            .text(city_mean.get(element.City).toFixed(2)+"°C" || "no data");
                    }else{
                        d3.select("#hint")
                            .text(city_deviation.get(element.City).toFixed(2)+"°C" || "no data");
                    }
                })
                .on("mouseout", function(d){
                })
        }
        cities.forEach(draw_circle);

        // Zooming and paning enabled
        var zoom = d3.zoom()
            .scaleExtent([1, 8])
            .on('zoom', function() {
                g.selectAll('path')
                    .attr('transform', d3.event.transform);
                g.selectAll('circle')
                    .attr('transform', d3.event.transform);
            });
        svg.call(zoom);
    })
}

// Base call at the launch of the html
requestData(2013);


// Time range
var dataTime = d3.range(0, 272).map(function(d) {
    return new Date(1743 + d, 1, 1);
});


var currentYear = 2013;
// Slider definiton
var sliderTime = d3
    .sliderBottom()
    .min(d3.min(dataTime))
    .max(d3.max(dataTime))
    .step(1000 * 60 * 60 * 24 * 365)
    .width(900)
    .tickFormat(d3.timeFormat('%Y'))
    .default(new Date(2013, 1, 1))
    .on('onchange', val => {
        svg.selectAll("g").remove();
        const buttons =d3.selectAll('input');
        let check = d3.select('input[name="mode"]:checked').property("value");
        currentYear = 1900+val.getYear();
        // Check if we want the range average or the standard deviation
        if (check === 'Mean'){
            requestData(1900+val.getYear(), true);
        }else{
            requestData(1900+val.getYear(), false);
        }
        d3.select('p#value-time').text("Year : "+d3.timeFormat('%Y')(val));

    });

// Function call when the radio button is clicked
function change_radio(){
    svg.selectAll("g").remove();
    const buttons =d3.selectAll('input');
    let check = d3.select('input[name="mode"]:checked').property("value");
    if (check === 'Mean'){
        requestData(currentYear, true);
    }else{
        requestData(currentYear, false);
    }
    // The legend has to be changed when select button clicked
    continuous("#legend1")
}

var gTime = d3
    .select('div#slider-time')
    .append('svg')
    .attr('width', 1000)
    .attr('height', 100)
    .append('g')
    .attr('transform', 'translate(30,30)');

// Display the slider on the html
gTime.call(sliderTime);

// Default year to display when loading the map
d3.select('p#value-time').text("Year : "+d3.timeFormat('%Y')(sliderTime.value()));

// Default call for the legend
continuous("#legend1");

// create continuous color legend
function continuous(selector_id) {
    // Default color scale
    let colorscale = colorScale;
    // Don't forget to remove the old legend
    d3.select(selector_id).selectAll("g").remove()

    let check = d3.select('input[name="mode"]:checked').property("value");

    // color scale selection
    if (check === 'Mean'){
        colorscale = colorScale;

    }else{
        colorscale = colorScale_deviation;
    }

    var legendheight = 400,
        legendwidth = 80,
        margin = {top: 10, right: 60, bottom: 10, left: 2};

    var canvas = d3.select(selector_id)
        .style("height", legendheight + "px")
        .style("width", legendwidth + "px")
        .style("position", "relative")
        .append("canvas")
        .attr("height", legendheight - margin.top - margin.bottom)
        .attr("width", 1)
        .style("height", (legendheight - margin.top - margin.bottom) + "px")
        .style("width", (legendwidth - margin.left - margin.right) + "px")
        .style("border", "1px solid #000")
        .style("position", "absolute")
        .style("top", (margin.top) + "px")
        .style("left", (margin.left) + "px")
        .node();

    var ctx = canvas.getContext("2d");

    var legendscale = d3.scaleLinear()
        .range([1, legendheight - margin.top - margin.bottom])
        .domain(colorscale.domain());

    var image = ctx.createImageData(1, legendheight);
    d3.range(legendheight).forEach(function(i) {
        var c = d3.rgb(colorscale(legendscale.invert(i)));
        image.data[4*i] = c.r;
        image.data[4*i + 1] = c.g;
        image.data[4*i + 2] = c.b;
        image.data[4*i + 3] = 255;
    });
    ctx.putImageData(image, 0, 0);

    var legendaxis = d3.axisRight()
        .scale(legendscale)
        .tickSize(6)
        .ticks(8);

    var svg = d3.select(selector_id)
        .append("svg")
        .attr("height", (legendheight) + "px")
        .attr("width", (legendwidth) + "px")
        .style("position", "absolute")
        .style("left", "0px")
        .style("top", "0px")

    svg
        .append("g")
        .attr("class", "axis")
        .attr("transform", "translate(" + (legendwidth - margin.left - margin.right + 3) + "," + (margin.top) + ")")
        .call(legendaxis);
};