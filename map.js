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
let mean_map = new Map()
const colorScale = d3.scaleSequential([30.8,-15.5], d3.interpolateRdYlBu)
const colorScale_deviation = d3.scaleSequential([4.0,-2.0], d3.interpolateRdYlBu)
const colorScale_noData = d3.scaleSequential([0,-200], d3.interpolateGreys)

async function requestData(x, boolean){
    // Load external data and boot
    Promise.all([
        d3.json("./world_map.geojson"),
        d3.csv("./csv_countries_by_year/"+x+"_country.csv", function(d) {
            data.set(d.code, +d.Temp);
            mean_map.set(d.code, +d.Mean_deviation)
        })
    ]).then(function(loadData){
        let topo = loadData[0];
        // Draw the map
        var g = svg.append("g")
        g.selectAll("path")
            .data(topo.features)
            .join("path")
            // draw each country
            .attr("d", d3.geoPath()
                .projection(projection)
            )
            // set the color of each country
            .attr("fill", function (d) {
                let color;
                if (boolean) {
                    d.total = data.get(d.id) || -100;
                    color = colorScale(d.total);
                }else{
                    d.total = mean_map.get(d.id) || -100;
                    color = colorScale_deviation(d.total);
                }

                if (d.total == -100) {
                    color = colorScale_noData(d.total);
                }
                return color
            })
            .on("mouseover", function(d){
                d3.select(this).style("stroke", "black");
                if (boolean){
                    d3.select("#hint")
                        .append("text")
                        .attr("id", d.id.replace(/ /,""))
                        .text(data.get(d.id).toFixed(2)+"°C" || "no data");
                }else{
                    d3.select("#hint")
                        .append("text")
                        .attr("id", d.id.replace(/ /,""))
                        .text(mean_map.get(d.id).toFixed(2)+"°C" || "no data");
                }



                d3.select("#country")
                    .append("text")
                    .attr("id", d.id.replace(/ /,""))
                    .text(d.properties.name);
            })
            .on("mouseout", function(d){
                d3.select(this).style("stroke", "none");
                d3.select("#" + d.id.replace(/ /, "")).remove();
                d3.select("#" + d.id.replace(/ /, "")).remove();
            })

        var zoom = d3.zoom()
            .scaleExtent([1, 8])
            .on('zoom', function() {
                g.selectAll('path')
                    .attr('transform', d3.event.transform);
            });
        svg.call(zoom);
    })
}

requestData(2013, false);

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