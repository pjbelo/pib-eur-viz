// PIB per capita (PPS)
//Que países criam mais e menos riqueza por pessoa, em paridades de poder de compra?
//Fontes de Dados: Eurostat | NU | Institutos Nacionais de Estatística - Recolha de Dados Rapid, Joint, Nowcast
//Eurostat | Institutos Nacionais de Estatística - Contas Nacionais Anuais
//Fonte: PORDATA



export function showChartPpcBase100(data_ppc) {

    var data = JSON.parse(JSON.stringify(data_ppc))


    // transformar dados em base 100 (1995)
    var base = Object.entries(
        data.find(d => d.Anos == 1995))
        .map(d => {
            return {
                country: d[0],
                value: +d[1]
            }
        })

    var dataT = []
    data.map(d => {
        var year = +d.Anos
        Object.entries(d).map(d => {
            var country = d[0]
            var value = d[1]
            if (country != "Anos") {
                var baseValue = base.find(b => b.country == country).value
                var yearValue = Math.round(value / baseValue * 100)
                dataT.push({
                    year: year.toString(),
                    country: country,
                    value: yearValue
                })
            }
        })
    })
    data = dataT


    // Definições de variáveis
    let svgWidth = 900
    let svgHeight = 600
    let margin = { left: 50, bottom: 60, right: 20, top: 20 }
    let chartWidth = svgWidth - margin.left - margin.right
    let chartHeight = svgHeight - margin.top - margin.bottom

    const colorScale = d3.scaleOrdinal(d3.schemeCategory10)


    var sumstat = []
    // group the data: I want to draw one line per group
    var data2 = d3.group(data, d => d.country)

    data2.forEach(d => {
        sumstat.push({
            key: d[0].country,
            values: d
        })
    })



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
        .style("background-color", "rgba(255, 255, 255, 0.9)")
        .style("border", "solid 1px black")
        .style("z-index", 9999)
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
        let coords = [event.clientX, event.clientY + 20]
        d3.selectAll("path.line").style("opacity", 0.2)
        d3.select(this).style("stroke-width", 5).style("opacity", 1)
        let top = `${coords[1]}px`
        let left = `${coords[0]}px`
        let countryName = countries.find(e => e.code == data.key).name
        let PIB1995 = data.values.find(e => e.year == "1995").value
        let PIB2019 = data.values.find(e => e.year == "2019").value
        let cresc = Math.round((PIB2019 / PIB1995 - 1) * 100)
        let htmlContent = `
        <h5>${data.key} > ${countryName}</h5>
        <p>Crescimento do PIB per capita (PPS)</p>
        <p>1995: ${numberFormatPT(PIB1995)}<br>
        2019: ${numberFormatPT(PIB2019)}<br>
        Crescimento 1995/2019: ${cresc}% </p>`
        d3.select("#tooltip")
            .style("display", "block")
            .style("top", top)
            .style("left", left)
            .html(htmlContent)
    }

    function lineExit(event, data) {
        d3.selectAll("path.line")
            .style("stroke-width", 1.5)
            .style("opacity", 1)
        d3.select("#tooltip")
            .style("display", "none")
    }


    function legendEnter(event, data) {
        let coords = [event.clientX, event.clientY + 20]
        d3.select(this)
            .style("stroke", "black")
            .style("stroke-width", 2)
        d3.selectAll("path.line").style("opacity", 0.2)
        let line = d3.select("path#" + data.key)
        line.style("stroke-width", 5).style("opacity", 1)

        let top = `${coords[1]}px`
        let left = `${coords[0]}px`
        let countryName = countries.find(e => e.code == data.key).name
        let PIB1995 = data.values.find(e => e.year == "1995").value
        let PIB2019 = data.values.find(e => e.year == "2019").value
        let cresc = Math.round((PIB2019 / PIB1995 - 1) * 100)

        let htmlContent = `
        <h5>${data.key} > ${countryName}</h5>
        <p>Crescimento do PIB per capita (PPS)</p>
        <p>1995: ${numberFormatPT(PIB1995)}<br>
        2019: ${numberFormatPT(PIB2019)}<br>
        Crescimento 1995/2019: ${cresc}% </p>`

        d3.select("#tooltip")
            .style("display", "block")
            .style("top", top)
            .style("left", left)
            .html(htmlContent)
    }

    function legendExit(event, data) {
        d3.selectAll("path.line")
            .style("stroke-width", 1.5)
            .style("opacity", 1)
        d3.select(this).style("stroke-width", 0)
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


    // Draw the line
    var path = svg.append("g")
        .attr("id", "path")
        .selectAll(".line")
        .data(sumstat)
        .enter()
        .append("path")
        .on("mousemove", lineEnter)
        .on("mouseleave", lineExit)
        .attr("transform", `translate(${margin.left}, ${margin.top})`)
        .attr("class", "line")
        .attr("fill", "none")
        .attr("stroke", function (d) { return color(d.key) })
        .attr("stroke-width", 1.5)
        .attr("id", d => d.key)
        .attr("d", function (d) {
            return d3.line()
                .defined(d => !!d.value)
                .x(function (d) { return x(d.year); })
                .y(function (d) { return y(+d.value); })
                (d.values)

        })

    var legendRectSize = 18
    var legendSpacing = 24
    var legendLeftMargin = 120
    var legendTopMArgin = 30 + chartHeight + margin.top

    var legend = svg.append("g")
        .selectAll('.legend')
        .data(sumstat.sort((a, b) => d3.ascending(a.key, b.key)))
        .enter()
        .append('g')
        .attr('class', 'legend')
        .attr('transform', function (d, i) {
            var horz = legendLeftMargin + i * legendSpacing;
            return 'translate(' + horz + ',' + legendTopMArgin + ')';
        });

    legend.append('rect')
        .on("mousemove", legendEnter)
        .on("mouseleave", legendExit)
        .attr('width', legendRectSize)
        .attr('height', legendRectSize)
        .style('fill', d => color(d.key))

    legend.append('text')
        .attr('x', legendRectSize / 2)
        .attr('y', 30)
        .text(d => d.key)
        .style("font-size", 10)
        .style("text-anchor", "middle")





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













