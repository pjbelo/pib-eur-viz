// Remuneração dos empregados per capita (PPS)
// Fontes de Dados: Eurostat | NU | Institutos Nacionais de Estatística - Recolha de Dados Rapid, Joint, Nowcast
// Eurostat | Institutos Nacionais de Estatística - Contas Nacionais Anuais
// Fonte: PORDATA


export function showChartRpcPorAno(data_repc) {

    var data = JSON.parse(JSON.stringify(data_repc))

    console.log("data")
    console.log(data)

    // transformar dados
    data = data.map(d => {
        var year = +d.Anos
        delete d.Anos
        var pibPerCountry = Object.entries(d).map(d => {
            return {
                country: d[0],
                value: +d[1]
            }
        })

        return {
            year: year,
            children: pibPerCountry
        }
    })


    console.log("data transformada")
    console.log(data)

    // valor maximo de todos os anos
    var yearsMax = []
    data.forEach(d => {
        let yearValues = (d.children.map(v => v.value))
        let yearMax = Math.max(...yearValues)
        yearsMax.push(yearMax)
    })
    const globalMax = Math.max(...yearsMax)


    console.log(globalMax)

    var anoSel = 1995

    const anoElem = d3.select("#ano")
        .style("font-size", "40px")
        .style("width", "95px")

    anoElem.text(anoSel)


    // Botoes ano seguinte e ano anterior
    var botaoAnoAnterior = d3.select("#botaoAnoAnterior")
    botaoAnoAnterior.on("click", () => {
        anoSel -= 1
        anoElem.text(anoSel)
        atualizarEstadoBotoes()
        updateBarChart()
    })

    var botaoAnoSeguinte = d3.select("#botaoAnoSeguinte")
    botaoAnoSeguinte.on("click", () => {
        anoSel += 1
        anoElem.text(anoSel)
        atualizarEstadoBotoes()
        updateBarChart()
    })

    // verifica quando estiver no primeiro ou ultimo ano para destivar os respetivos botoes
    function atualizarEstadoBotoes() {
        if (anoSel < 1996) botaoAnoAnterior.attr("disabled", "true")
        if (anoSel > 1995) botaoAnoAnterior.attr('disabled', null)
        if (anoSel > 2018) botaoAnoSeguinte.attr("disabled", "true")
        if (anoSel < 2019) botaoAnoSeguinte.attr('disabled', null)
    }

    atualizarEstadoBotoes() // atualiza pela primeira vez

    // Dados selecionados para aparecer no gráfico
    var dadosSel = Array.from(data.find(e => e.year == anoSel).children)
    dadosSel.sort(function (a, b) { return b.value - a.value })

    console.log("dadosSel")
    console.log(dadosSel)


    // Definições de variáveis
    let svgWidth = 900
    let svgHeight = 600
    let margin = { left: 50, bottom: 20, right: 20, top: 20 }
    let chartWidth = svgWidth - margin.left - margin.right
    let chartHeight = svgHeight - margin.top - margin.bottom

    const colorScale = d3.scaleOrdinal(d3.schemeCategory10)

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




    function showTooltip(data, coords) {
        let top = `${coords[1]}px`
        let left = `${coords[0]}px`
        let countryName = countries.find(e => e.code == data.country).name
        let value = numberFormatPT(data.value)
        let htmlContent = `
            <h5>${data.country} > ${countryName}</h5>
            <p>Remuneracao dos empregados per capita (PPS): ${value}</p>
            `
        d3.select("#tooltip")
            .style("display", "block")
            .style("top", top)
            .style("left", left)
            .html(htmlContent)
    }

    function hideToolTip() {
        d3.select("#tooltip")
            .style("display", "none")
    }


    // Configurar escalas
    let xScale = d3.scaleBand()
        .range([0, chartWidth])
        .domain(dadosSel.map(d => d.country))
        .padding(0.2)

    let yScale = d3.scaleLinear()
        .range([chartHeight, 0])
        .domain([0, globalMax])
    //.domain([0, d3.max(dadosSel, d => d.value)])



    // Configurar eixos


    // X axis
    var xAxis = svg.append("g")
        .attr("transform", `translate(${margin.left}, ${chartHeight + margin.top})`)
        .call(d3.axisBottom(xScale))






    // Add Y axis
    var yAxis = svg.append("g")
        .attr("class", "myYaxis")
        .attr("transform", `translate(${margin.left}, ${margin.top})`)
        .call(d3.axisLeft(yScale)
            .tickSizeInner(-chartWidth))

    yAxis.selectAll("line").style("stroke", "lightgrey")






    var barChartBody = svg.append("g")
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
        dadosSel.sort(function (a, b) { return b.value - a.value })
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














