var margin = {top: 20, right: 20, bottom: 30, left: 50},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;



var svg = d3.select("#graph")
    .append("svg")
     .attr("width", width + margin.left + margin.right)
     .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")")

// List of groups (here I have one group per column)
var allCountries = ["Antigua And Barbuda" ,"Algeria" ,"Azerbaijan" ,"Albania" ,"Armenia" ,"Angola" ,"American Samoa" ,"Argentina" ,"Australia" ,"Bahrain" ,"Barbados" ,"Bermuda" ,"Bahamas" ,"Bangladesh" ,"Belize" ,"Bosnia And Herzegovina" ,"Bolivia" ,"Burma" ,"Benin" ,"Solomon Islands" ,"Brazil" ,"Bulgaria" ,"Brunei Darussalam" ,"Canada" ,"Cambodia" ,"Sri Lanka" ,"Congo" ,"Congo (Democratic Republic Of The)" ,"Burundi" ,"China" ,"Afghanistan" ,"Bhutan" ,"Chile" ,"Cayman Islands" ,"Cameroon" ,"Chad" ,"Comoros" ,"Colombia" ,"Costa Rica" ,"Central African Republic" ,"Cuba" ,"Cape Verde" ,"Cook Islands" ,"Cyprus" ,"Denmark (Europe)" ,"Djibouti" ,"Dominica" ,"Dominican Republic" ,"Ecuador" ,"Egypt" ,"Ireland" ,"Equatorial Guinea" ,"Estonia" ,"Eritrea" ,"El Salvador" ,"Ethiopia" ,"Austria" ,"Czech Republic" ,"French Guiana" ,"Finland" ,"Fiji" ,"Falkland Islands (Islas Malvinas)"  ,"French Polynesia" ,"France" ,"Gambia" ,"Gabon" ,"Georgia" ,"Ghana" ,"Grenada" ,"Greenland" ,"Germany" ,"Guam" ,"Greece" ,"Guatemala" ,"Guinea" ,"Guyana" ,"Haiti" ,"Honduras" ,"Croatia" ,"Hungary" ,"Iceland" ,"India" ,"Iran" ,"Israel" ,"Italy" ,"Côte D'Ivoire" ,"Iraq" ,"Japan" ,"Jamaica" ,"Jordan" ,"Kenya" ,"Kyrgyzstan" ,"North Korea" ,"Kiribati" ,"South Korea" ,"Kuwait" ,"Kazakhstan" ,"Laos" ,"Lebanon" ,"Latvia" ,"Belarus" ,"Lithuania" ,"Liberia" ,"Slovakia" ,"Liechtenstein" ,"Libya" ,"Madagascar" ,"Martinique" ,"Mongolia" ,"Montserrat" ,"Macedonia" ,"Mali" ,"Morocco" ,"Mauritius" ,"Mauritania" ,"Malta" ,"Oman" ,"Maldives" ,"Mexico" ,"Malaysia" ,"Mozambique" ,"Malawi" ,"New Caledonia" ,"Niue" ,"Niger" ,"Aruba" ,"Anguilla" ,"Belgium" ,"Hong Kong" ,"Northern Mariana Islands" ,"Faroe Islands" ,"Andorra" ,"Gibraltar" ,"Isle Of Man" ,"Luxembourg" ,"Macau" ,"Monaco" ,"Palestina" ,"Montenegro" ,"Mayotte" ,"Åland" ,"Norfolk Island" ,"Cocos (Keeling) Islands" ,"Antarctica" ,"Bouvet Island" ,"French Southern And Antarctic Lands" ,"Heard Island And Mcdonald Islands" ,"British Indian Ocean Territory" ,"Christmas Island" ,"United States Minor Outlying Islands" ,"Vanuatu" ,"Nigeria" ,"Netherlands" ,"Norway" ,"Nepal" ,"Nauru" ,"Suriname" ,"Nicaragua" ,"New Zealand" ,"Paraguay" ,"Peru" ,"Pakistan" ,"Poland" ,"Panama" ,"Portugal" ,"Papua New Guinea" ,"Guinea Bissau" ,"Qatar" ,"Reunion" ,"Romania" ,"Moldova" ,"Philippines" ,"Puerto Rico" ,"Russia" ,"Rwanda" ,"Saudi Arabia" ,"Saint Kitts And Nevis" ,"Seychelles" ,"South Africa" ,"Lesotho" ,"Botswana" ,"Senegal" ,"Slovenia" ,"Sierra Leone" ,"Singapore" ,"Somalia" ,"Spain" ,"Saint Lucia" ,"Sudan" ,"Sweden" ,"Syria" ,"Switzerland" ,"Trinidad And Tobago" ,"Thailand" ,"Tajikistan" ,"Tokelau" ,"Tonga" ,"Togo" ,"Sao Tome And Principe" ,"Tunisia" ,"Turkey" ,"Tuvalu" ,"Turkmenistan" ,"Tanzania" ,"Uganda" ,"United Kingdom" ,"Ukraine" ,"United States" ,"Burkina Faso" ,"Uruguay" ,"Uzbekistan" ,"Saint Vincent And The Grenadines" ,"Venezuela" ,"British Virgin Islands" ,"Vietnam" ,"Virgin Islands" ,"Namibia" ,"Samoa" ,"Swaziland" ,"Yemen" ,"Zambia" ,"Zimbabwe" ,"Indonesia" ,"Guadeloupe" ,"Sint Maarten" ,"United Arab Emirates" ,"Timor Leste" ,"Pitcairn Islands" ,"Palau" ,"Marshall Islands" ,"Saint Pierre and Miquelon" ,"Saint Helena" ,"San Marino" ,"Turks And Caicas Islands" ,"Western Sahara" ,"Serbia" ,"Holy See (Vatican City)" ,"Svalbard And Jan Mayen" ,"Saint Martin" ,"Saint Barthélemy" ,"Guernsey" ,"Jersey" ,"South Georgia And The South Sandwich Isla" ,"Taiwan"]

// add the options to the button
d3.select("#selectButton")
    .selectAll('myOptions')
    .data(allCountries)
    .enter()
    .append('option')
    .text(function (d) {
        return d; }) // text showed in the menu
    .attr("value", function (d) { return d; })

var currentCountry = "Antigua And Barbuda";

d3.select("#selectButton")
    .on("change", function(d) {
        svg.selectAll("g").remove();
        // recover the option that has been chosen
        var selectedOption = d3.select(this).property("value")
        // run the updateChart function with this selected option
        currentCountry = selectedOption;
        const buttons =d3.selectAll('input');
        let check = d3.select('input[name="mode"]:checked').property("value");
        if (check === 'Mean'){
            requestData(selectedOption, true);
        }else{
            requestData(selectedOption, false);
        }

    })

var requestData = async function(country, boolean){
    // Load external data and boot
    d3.csv("./csv_country_for_graph/"+country+"_graph.csv")
    .then(function(loadData){
        console.log(country)
        // When reading the csv, I must format variables:
        function date(d){
            return { date : d3.timeParse("%Y")(d.Year), value : d.Temp }
        }

        var x = d3.scaleLinear()
            .domain([1743, 2013])
            .range([ 0, width ]);
        svg.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x));

        var y;
        if (boolean){
            // Add Y axis
            y = d3.scaleLinear()
                .domain( [-15.5,38.8])
                .range([ height, 0 ]);
            svg.append("g")
                .call(d3.axisLeft(y));
        }else{
            // Add Y axis
            y = d3.scaleLinear()
                .domain( [-5,5])
                .range([ height, 0 ]);
            svg.append("g")
                .call(d3.axisLeft(y));
        }

        // create a tooltip
        var Tooltip = d3.select("#graph")
            .append("div")
            .style("opacity", 0)
            .attr("class", "tooltip")
            .style("background-color", "white")
            .style("border", "solid")
            .style("border-width", "2px")
            .style("border-radius", "5px")
            .style("padding", "5px")

        // Three function that change the tooltip when user hover / move / leave a cell
        var mouseover = function(d) {
            Tooltip
                .style("opacity", 1)
        }
        var mousemove = function(d) {
            Tooltip
                .html("Year : " + d.Year+" || Average temperature: " + d.Temp +" || Deviation : "+d.Mean_deviation )
                .style("left", (d3.mouse(this)[0]+70) + "px")
                .style("top", (d3.mouse(this)[1]) + "px")
        }
        var mouseleave = function(d) {
            Tooltip
                .style("opacity", 0)
        }

        // Initialize line with group a
        if (boolean){
            var line = svg
                .append('g')
                .append("path")
                .datum(loadData)
                .attr("d", d3.line()
                    .curve(d3.curveBasis)
                    .x(function(d) {
                        if (d.Temp !== ""){
                            return x(+Number(d.Year))
                        }
                        return x(+Number(d.Year))
                    })
                    .y(function(d) {
                        if (d.Temp !== ""){
                            return y(+d.Temp)
                        }
                        return y(+d.Temp)
                    })
                )
                .attr("stroke", "black")
                .style("stroke-width", 4)
                .style("fill", "none")

            // Add the points
            svg
                .append("g")
                .selectAll("dot")
                .data(loadData)
                .enter()
                .append("circle")
                .attr("class", "myCircle")
                .attr("cx", function(d) {
                    if (d.Temp !== ""){
                        return x(+Number(d.Year))
                    } } )
                .attr("cy", function(d) {
                    if (d.Temp !== ""){
                        return y(+d.Temp)
                    } } )
                .attr("r", 3)
                .attr("stroke", "#69b3a2")
                .attr("stroke-width", 3)
                .attr("fill", "white")
                .on("mouseover", mouseover)
                .on("mousemove", mousemove)
                .on("mouseleave", mouseleave)
        }else{
            var line = svg
                .append('g')
                .append("path")
                .datum(loadData)
                .attr("d", d3.line()
                    .curve(d3.curveBasis)
                    .x(function(d) {
                        if (d.Mean_deviation !== ""){
                            return x(+Number(d.Year))
                        }
                        return x(+Number(d.Year))
                    })
                    .y(function(d) {
                        if (d.Mean_deviation !== ""){
                            return y(+d.Mean_deviation)
                        }
                        return y(+d.Mean_deviation)
                    })
                )
                .attr("stroke", "black")
                .style("stroke-width", 4)
                .style("fill", "none")

            // Add the points
            svg
                .append("g")
                .selectAll("dot")
                .data(loadData)
                .enter()
                .append("circle")
                .attr("class", "myCircle")
                .attr("cx", function(d) {
                    if (d.Mean_deviation !== ""){
                        return x(+Number(d.Year))
                    } } )
                .attr("cy", function(d) {
                    if (d.Mean_deviation !== ""){
                        return y(+d.Mean_deviation)
                    } } )
                .attr("r", 3)
                .attr("stroke", "#69b3a2")
                .attr("stroke-width", 3)
                .attr("fill", "white")
                .on("mouseover", mouseover)
                .on("mousemove", mousemove)
                .on("mouseleave", mouseleave)
        }
    })


}

requestData("Antigua And Barbuda", false);

function change_radio(){
    svg.selectAll("g").remove();
    const buttons =d3.selectAll('input');
    let check = d3.select('input[name="mode"]:checked').property("value");
    if (check === 'Mean'){
        requestData(currentCountry, true);
    }else{
        requestData(currentCountry, false);
    }
}