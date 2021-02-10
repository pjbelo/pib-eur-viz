// Pordata
// Produto Interno Bruto (Euro)																																	
// Que países criam mais e menos riqueza?																																	
// Euro - Milhões																													




export function showChartPibTodosAnos(data_pib) {

    var data = JSON.parse(JSON.stringify(data_pib))

    // transformar dados
    var dataT = []
    data.map(d => {
        var year = +d.Anos
        //delete d.Anos
        Object.entries(d).map(d => {
            if (d[0] != "Anos") {
                dataT.push({
                    year: year.toString(),
                    country: d[0],
                    value: +d[1]
                })
            }
        })
    })
    data = dataT



    // Definições de variáveis
    let svgWidth = 900
    let svgHeight = 600
    let margin = { left: 80, bottom: 40, right: 20, top: 20 }
    let chartWidth = svgWidth - margin.left - margin.right
    let chartHeight = svgHeight - margin.top - margin.bottom

    const colorScale = d3.scaleOrdinal(d3.schemeCategory10)


    var sumstat = []
    // group the data: I want to draw one line per group
    var data2 = d3.group(data, d => d.country) // nest function allows to group the calculation per level of a factor

    data2.forEach(d => {
        console.log(d)
        sumstat.push({
            key: d[0].country,
            values: d
        })
    })



    console.log("sumstat")
    console.log(sumstat)




    const container = d3.select("#container")

    const svg = d3.select("svg")

    svg.selectAll("*").remove()

    svg.attr("width", svgWidth)
        .attr("height", svgHeight)


    svg.append("g").attr("id", "body")

    const tooltip = container.append("div")
        .attr("id", "tooltip")
        .style("position", "fixed")
        .style("top", "10px")
        .style("left", "0px")
        .style("padding", "5px")
        .style("background-color", "rgba(255, 255, 255, 0.8)")
        .style("border", "solid 1px black")
        .style("display", "none")

    function numberFormatPT(num, numberOfDecimals = 0) {
        return (
            num
                .toFixed(numberOfDecimals)
                .toString()
                .replace('.', ',') // replace decimal point character with ,
                .replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.') // use . as a separator
        )
    }

    function lineEnter(event, data) {
        console.log(data)
        let coords = [event.clientX, event.clientY + 20]
        d3.select(this).style("stroke-width", 5)
        let top = `${coords[1]}px`
        let left = `${coords[0]}px`
        let countryName = countries.find(e => e.code == data.key).name
        let PIB1995 = data.values.find(e => e.year == "1995").value
        let PIB2019 = data.values.find(e => e.year == "2019").value
        let cresc = Math.round((PIB2019 / PIB1995 - 1) * 100)
        let htmlContent = `
        <h5>${data.key} > ${countryName}</h5>
        <p>1995: ${numberFormatPT(PIB1995)}<br>
        2019: ${numberFormatPT(PIB2019)}<br>
        Crescimento 1995/2019: ${cresc}% </p>`
        d3.select("#tooltip")
            .style("display", "block")
            .style("top", top)
            .style("left", left)
            .style("z-index", 9999)
            .html(htmlContent)
    }

    function lineExit(event, data) {
        d3.select(this).style("stroke-width", 1.5)
        d3.select("#tooltip")
            .style("display", "none")
    }




    var x = d3.scaleLinear()
        .domain(d3.extent(data, function (d) { return d.year; }))
        .range([0, chartWidth]);
    svg.append("g")
        .attr("transform", `translate(${margin.left}, ${chartHeight + margin.top})`)
        .call(d3.axisBottom(x).ticks(5));

    var y = d3.scaleLinear()
        .domain([0, d3.max(data, function (d) { return +d.value; })])
        .range([chartHeight, 0])

    var yAxis = svg.append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`)
        .call(d3.axisLeft(y)
            .tickSizeInner(-chartWidth))

    yAxis.selectAll("line").style("stroke", "lightgrey")



    // color palette
    var res = sumstat.map((d) => d.key)
    var color = d3.scaleOrdinal()
        .domain(res)
        .range(['#e41a1c', '#377eb8', '#4daf4a', '#984ea3', '#ff7f00', '#ffff33', '#a65628', '#f781bf', '#999999'])




    // Configurar etiqueta para o eixo Y

    var yLabelX = 0
    var yLabelY = chartHeight / 2 + margin.top
    svg.append("text")
        .attr("transform", `rotate(-90, ${yLabelX}, ${yLabelY})`)
        .attr("y", yLabelY)
        .attr("x", yLabelX)
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("Milhões de Euros")  





    console.log(sumstat)

    // Draw the line
    var path = svg.append("g")
        .selectAll(".line")
        .data(sumstat)
        .enter()
        .append("path")
        .on("mousemove", lineEnter)
        .on("mouseleave", lineExit)
        .attr("transform", `translate(${margin.left}, ${margin.top})`)
        .attr("fill", "none")
        .attr("stroke", function (d) { return color(d.key) })
        .attr("stroke-width", 1.5)
        .attr("d", function (d) {
            return d3.line()
                .x(function (d) { return x(d.year); })
                .y(function (d) { return y(+d.value); })
                (d.values)
        })






    /*
    
            svg.call(hover, path);
    
    
    
    
    
            function hover(svg, path) {
      
                if ("ontouchstart" in document) svg
                    .style("-webkit-tap-highlight-color", "transparent")
                    .on("touchmove", moved)
                    .on("touchstart", entered)
                    .on("touchend", left)
                else svg
                    .on("mousemove", moved)
                    .on("mouseenter", entered)
                    .on("mouseleave", left);
              
                const dot = svg.append("g")
                    .attr("display", "none");
              
                dot.append("circle")
                    .attr("r", 2.5);
              
                dot.append("text")
                    .attr("font-family", "sans-serif")
                    .attr("font-size", 10)
                    .attr("text-anchor", "middle")
                    .attr("y", -8);
              
                function moved(event) {
                  event.preventDefault();
                  const pointer = d3.pointer(event, this);
                  const xm = x.invert(pointer[0]);
                  const ym = y.invert(pointer[1]);
                  const i = d3.bisectCenter(data.dates, xm);
                  const s = d3.least(data.series, d => Math.abs(d.values[i] - ym));
                  path.attr("stroke", d => d === s ? null : "#ddd").filter(d => d === s).raise();
                  dot.attr("transform", `translate(${x(data.dates[i])},${y(s.values[i])})`);
                  dot.select("text").text(s.name);
                }
              
                function entered() {
                  path.style("mix-blend-mode", null).attr("stroke", "#ddd");
                  dot.attr("display", null);
                }
              
                function left() {
                  path.style("mix-blend-mode", "multiply").attr("stroke", null);
                  dot.attr("display", "none");
                }
              }
    
    
    
    
    */







    /*
    
    
        barChartBody = svg.append("g")
        .attr("transform", `translate(${margin.left},${margin.bottom})`)
        .selectAll("rect")
        .data(dadosSel)
        .join("rect")
        .on("mousemove", function (event, d) {
            console.log("d")
            console.log(d)
            d3.select(this).style("stroke", "black").style("stroke-width", 3)
            showTooltip(d, [event.clientX, event.clientY + 20])
        })
        .on("mouseleave", function (event, d) {
            d3.select(this).style("stroke-width", 0)
            hideToolTip()
        })
        .attr("fill", d => colorScale(d.country))
        .attr("width", xScale.bandwidth())
        .attr("height", d => chartHeight - yScale(d.value))
        .attr("y", d => yScale(d.value))
        .attr("x", d => xScale(d.country))
    
    
    
    
        function updateBarChart() {
    
            dadosSel = Array.from(data.find(e => e.year == anoSel).children)
            console.log("dadosSel")
            console.log(dadosSel)
    
            //dadosSel = dadosSel.sort((a,b)=>b.value-a.value)
            dadosSel.sort(function(a,b) {return b.value - a.value})
            console.log("dadosSel SORT")
            console.log(dadosSel)
    
            xScale
            .domain(dadosSel.map(d => d.country))
            
            xAxis 
            .transition()
            .delay((d, i) => i * 20)
            .call(d3.axisBottom(xScale))
    
    
            barChartBody
                .data(dadosSel)
                .enter()
                .append("rect")
                .merge(barChartBody)
                .order()
                .transition()
                .delay((d, i) => i * 20)
                .attr("fill", d => colorScale(d.country))
                .attr("width", xScale.bandwidth())
                .attr("height", d => chartHeight - yScale(d.value))
                .attr("y", d => yScale(d.value))
                .attr("x", d => xScale(d.country))
    
                //.call((d) => console.log("d:", d))
        
    
    
    
            }
    
       
            updateBarChart()
    
    
    */


    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    function updateTreeMap() {

        svg.selectAll("*").remove()
        dadosSel = data.find(e => e.year == anoSel)

        console.log("dadosSel")
        console.log(dadosSel)


        hierarchy = d3.hierarchy(dadosSel)
            .sum(d => +d.value)
            .sort((a, b) => b.value - a.value)

        treemap = d3.treemap()
            .size([chartWidth, chartHeight])
            .padding(2);


        root = treemap(hierarchy)



        cell = svg.selectAll("g")
            .data(root.leaves()) // use only the "leaves" as data
            .enter()
            .append("g")
            .attr("transform", d => `translate(${d.x0},${d.y0})`) // position each empty g at x0,y0 computed by treemap

        cell.append("rect")
            .attr("width", d => d.x1 - d.x0) // calculate final X minus origin X to get width
            .attr("height", d => d.y1 - d.y0)  // final Y minus origin Y is equal to height
            .attr("fill", d => colorScale(d.data.country)) // use the  name to select the color
            .on("mousemove", function (event, d) {
                showTooltip(d.data, [event.clientX, event.clientY + 20])
                d3.select(this).style("stroke", "black").style("stroke-width", 3)
            })
            .on("mouseleave", function (event, d) {
                d3.select(this).style("stroke-width", 0)
                hideToolTip()
            })

        cell.append("text")
            .text(d => d.data.country)
            .attr("alignment-baseline", "hanging")
            .attr("fill", "white")



        if (anoSel < 1996) botaoAnoAnterior.attr("disabled", "true")
        if (anoSel > 1995) botaoAnoAnterior.attr('disabled', null)
        if (anoSel > 2018) botaoAnoSeguinte.attr("disabled", "true")
        if (anoSel < 2019) botaoAnoSeguinte.attr('disabled', null)



    }

    //updateTreeMap()




}



const countries = [
    { code: "DE", name: "Alemanha" },
    { code: "AT", name: "Áustria" },
    { code: "BE", name: "Bélgica" },
    { code: "BG", name: "Bulgária" },
    { code: "CY", name: "Chipre" },
    { code: "HR", name: "Croácia" },
    { code: "DK", name: "Dinamarca" },
    { code: "SK", name: "Eslováquia" },
    { code: "SI", name: "Eslovénia" },
    { code: "ES", name: "Espanha" },
    { code: "EE", name: "Estónia" },
    { code: "FI", name: "Finlândia" },
    { code: "FR", name: "França" },
    { code: "GR", name: "Grécia" },
    { code: "HU", name: "Hungria" },
    { code: "IE", name: "Irlanda" },
    { code: "IT", name: "Itália" },
    { code: "LV", name: "Letónia" },
    { code: "LT", name: "Lituânia" },
    { code: "LU", name: "Luxemburgo" },
    { code: "MT", name: "Malta" },
    { code: "NL", name: "Países Baixos" },
    { code: "PL", name: "Polónia" },
    { code: "PT", name: "Portugal" },
    { code: "CZ", name: "República Checa" },
    { code: "RO", name: "Roménia" },
    { code: "SE", name: "Suécia" },
    { code: "IS", name: "Islândia" },
    { code: "NO", name: "Noruega" },
    { code: "UK", name: "Reino Unido" },
    { code: "CH", name: "Suíça" },
    { code: "UE27", name: "União Europeia 27 (desde 2020)" },
    { code: "UE28", name: "União Europeia (28 Países)" },
    { code: "ZE19", name: "Zona Euro (19 Países)" }
]













