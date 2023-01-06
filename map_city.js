var margin = {top: 20, right: 10, bottom: 40, left: 100},
    width = 1080 - margin.left - margin.right,
    height = 600 - margin.top - margin.bottom;

// The svg
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
let data = new Map()
const colorScale = d3.scaleSequential([30.8,-15.5], d3.interpolateRdYlBu)
const colorScale_noData = d3.scaleSequential([0,-200], d3.interpolateGreys)

var requestData = async function(x){
    // Load external data and boot
    Promise.all([
        d3.json("./world_map.geojson"),
        d3.csv("./city_template.csv"),
        d3.csv("./csv_cities_by_year/"+x+"_city.csv")
    ]).then(function(loadData){
        let cities = loadData[1];
        console.log(cities);
        let topo = loadData[0];
        // Draw the map
        var g = svg.append("g")

        // drawing the map
        g.selectAll("path")
            .data(topo.features)
            .join("path")
            // draw each country
            .attr("d", d3.geoPath()
                .projection(projection)
            )
            // set the color of each country
            .attr("fill", 'grey')
            .attr("stroke", 'black')
            .attr("opacity", 0.3)

        function draw_circle(element){

            latlong = projection([element.Longitude,element.Latitude])
            g.append("circle")
                .attr("cx", latlong[0])
                .attr("cy", latlong[1])
                .attr("r",1)
                .style("fill", "black")
                .on("mouseover", function(d){
                    console.log(d);
                    console.log(element);
                    d3.select("#city").text(element.City);
                })
                .on("mouseout", function(d){
                            d3.select("#hint").remove();
                })
        }
        cities.forEach(draw_circle);
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

requestData(2013);

// Time
var dataTime = d3.range(0, 272).map(function(d) {
    return new Date(1743 + d, 1, 1);
});



var sliderTime = d3
    .sliderBottom()
    .min(d3.min(dataTime))
    .max(d3.max(dataTime))
    .step(1000 * 60 * 60 * 24 * 365)
    .width(900)
    .tickFormat(d3.timeFormat('%Y'))
    .default(new Date(2013, 1, 1))
    .on('onchange', val => {
        svg.select("g").remove();
        requestData(1900+val.getYear());
        d3.select('p#value-time').text(d3.timeFormat('%Y')(val));

    });

var gTime = d3
    .select('div#slider-time')
    .append('svg')
    .attr('width', 1000)
    .attr('height', 100)
    .append('g')
    .attr('transform', 'translate(30,30)');

gTime.call(sliderTime);

d3.select('p#value-time').text(d3.timeFormat('%Y')(sliderTime.value()));