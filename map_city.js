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
let city_mean = new Map()
let city_deviation = new Map()
const colorScale = d3.scaleSequential([30.8,-15.5], d3.interpolateRdYlBu)
const colorScale_deviation = d3.scaleSequential([4.0,-2.0], d3.interpolateRdYlBu)
const colorScale_noData = d3.scaleSequential([0,-200], d3.interpolateGreys)

var requestData = async function(year, boolean){
    // Load external data and boot
    Promise.all([
        d3.json("./world_map.geojson"),
        d3.csv("./city_template.csv"),
        d3.csv("./csv_cities_by_year/"+year+"_city.csv", function (d) {
            city_mean.set(d.name, +d.Temp);
            city_deviation.set(d.name, +d.Mean_deviation)
        })
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
                        color = colorScale_noData(temp);
                    }
                    return color
                })
                .on("mouseover", function(d){
                    console.log(city_deviation.get(element.City))
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


var currentYear = 2013;
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
        if (check === 'Mean'){
            requestData(1900+val.getYear(), true);
        }else{
            requestData(1900+val.getYear(), false);
        }
        d3.select('p#value-time').text(d3.timeFormat('%Y')(val));

    });

function change_radio(){
    svg.select("g").remove();
    const buttons =d3.selectAll('input');
    let check = d3.select('input[name="mode"]:checked').property("value");
    console.log(currentYear);
    if (check === 'Mean'){
        requestData(currentYear, true);
    }else{
        requestData(currentYear, false);
    }
}

var gTime = d3
    .select('div#slider-time')
    .append('svg')
    .attr('width', 1000)
    .attr('height', 100)
    .append('g')
    .attr('transform', 'translate(30,30)');

gTime.call(sliderTime);

d3.select('p#value-time').text(d3.timeFormat('%Y')(sliderTime.value()));