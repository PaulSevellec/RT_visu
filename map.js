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
    .scale(100)
    .center([0,20])
    .translate([width / 2, height / 2]);

// Data and color scale
let data = new Map()
const colorScale = d3.scaleSequential([23,-15], d3.interpolateRdYlBu)
const colorScale_noData = d3.scaleSequential([0,-200], d3.interpolateGreys)

var requestData = async function(x){
    // Load external data and boot
    Promise.all([
        d3.json("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson"),
        d3.csv("./csv_countries_by_year/"+x+"estimate.csv", function(d) {
            data.set(d.code, +d.diffTemp)
        })
    ]).then(function(loadData){
        let topo = loadData[0]
        console.log(x);
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
                d.total = data.get(d.id) || -100;
                console.log(d.total);
                if (d.total == -100) {
                    console.log(d.total);
                    return colorScale_noData(d.total);
                }
                return colorScale(d.total);
            })
            .on("mouseover", function(d){
                d3.select(this).style("stroke", "black");
            })
            .on("mouseout", function(d){
                d3.select(this).style("stroke", "none");
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