// PIB per capita (PPS)
//Que países criam mais e menos riqueza por pessoa, em paridades de poder de compra?
//Fontes de Dados: Eurostat | NU | Institutos Nacionais de Estatística - Recolha de Dados Rapid, Joint, Nowcast
//Eurostat | Institutos Nacionais de Estatística - Contas Nacionais Anuais
//Fonte: PORDATA

// Remuneração dos empregados per capita (PPS)
// Fontes de Dados: Eurostat | NU | Institutos Nacionais de Estatística - Recolha de Dados Rapid, Joint, Nowcast
// Eurostat | Institutos Nacionais de Estatística - Contas Nacionais Anuais
// Fonte: PORDATA



export function showChartRemuneracaoVsPibPerCapita(ppc, repc) {

    var data_ppc = JSON.parse(JSON.stringify(ppc))
    var data_repc = JSON.parse(JSON.stringify(repc))


    // transformar dados
    // PIB per capita
    data_ppc = data_ppc.map(d => {
        let year = +d.Anos
        delete d.Anos
        let children = Object.entries(d).map(d => {
            return {
                country: d[0],
                value_ppc: +d[1]
            }
        })
        return {
            year: year,
            children: children
        }
    })

    // Remuneração dos Empregados per Capita
    data_repc = data_repc.map(d => {
        let year = +d.Anos
        delete d.Anos
        let children = Object.entries(d).map(d => {
            return {
                country: d[0],
                value_repc: +d[1]
            }
        })
        return {
            year: year,
            children: children
        }
    })

    // Fazer a fusão dos conjuntos de dados
    var data_rvppc = [] 
    data_ppc.forEach(el => {
        let year = el.year
        let year_ppc_data = el.children
        let year_repc_data = data_repc.find(a => a.year == year).children
        let year_rvppc_data = []
        year_ppc_data.forEach(d => {
                let value_repc = year_repc_data.find(b => b.country == d.country).value_repc
                year_rvppc_data.push({
                    country: d.country,
                    value_ppc: +d.value_ppc,
                    value_repc: +value_repc
                })
        })
        data_rvppc.push({
            year: year,
            children: year_rvppc_data
        })
    })


    // valor maximo de todos os anos de ppc e repc
    var ppcYearsMax = []
    var repcYearsMax = []
    data_rvppc.forEach(d => {
        let ppcYearValues = (d.children.map(v => v.value_ppc))
        let ppcYearMax = Math.max(...ppcYearValues)
        ppcYearsMax.push(ppcYearMax)
        let repcYearValues = (d.children.map(v => v.value_repc))
        let repcYearMax = Math.max(...repcYearValues)
        repcYearsMax.push(repcYearMax)
    })
    const ppcGlobalMax = Math.max(...ppcYearsMax)
    const repcGlobalMax = Math.max(...repcYearsMax)




    // Definir o Ano selecionado

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
        updateChart()
    })

    var botaoAnoSeguinte = d3.select("#botaoAnoSeguinte")
    botaoAnoSeguinte.on("click", () => {
        anoSel += 1
        anoElem.text(anoSel)
        atualizarEstadoBotoes()
        updateChart()
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
    var dadosSel = Array.from(data_rvppc.find(e => e.year == anoSel).children)
    dadosSel.sort(function(a,b) {return b.value - a.value})


    // Definições de variáveis
    let svgWidth = 900
    let svgHeight = 600
    let margin = {left: 60, bottom: 100, right: 20, top: 20 }
    let chartWidth = svgWidth - margin.left - margin.right
    let chartHeight = svgHeight - margin.top - margin.bottom

    const colorScale = d3.scaleOrdinal(d3.schemeCategory10)

    const container = d3.select("#container")

    const svg = d3.select("svg")

    svg.selectAll("*").remove()

    svg.attr("width", svgWidth)
        .attr("height", svgHeight)

    svg.append("g").attr("id", "body")


    function numberFormatPT(num, numberOfDecimals = 0) {
        return (
            num
                .toFixed(numberOfDecimals)
                .toString()
                .replace('.', ',') // replace decimal point character with ,
                .replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.') // use . as a separator
        )
    }


    // Configurar ToolTip

    var tooltip = container.append("div")
        .attr("id", "tooltip")
        .style("position", "fixed")
        .style("top", "10px")
        .style("left", "0px")
        .style("padding", "5px")
        .style("background-color", "white")
        .style("border", "solid 1px black")
        .style("z-index", 9999)
        .style("display", "none")

    function showTooltip(event, data) {
        let coords = [event.clientX, event.clientY + 20]
        let top = `${coords[1]}px`
        let left = `${coords[0]}px`
        d3.selectAll("circle").attr("opacity", 0.5) 
        d3.select(this).style("stroke", "black").style("stroke-width", 3).attr("opacity", 1)
        let countryName = countries.find(e => e.code == data.country).name
        let value_ppc = numberFormatPT(data.value_ppc)
        let value_repc = numberFormatPT(data.value_repc)
        let proporcao = Math.round(value_repc / value_ppc * 100)
        let htmlContent = `
            <h5>${data.country} > ${countryName}</h5>
            <p>Remuneracao dos empregados per capita (PPS): ${value_repc}<br>
            PIB per capita (PPS): ${value_ppc}<br>
            Proporção: ${proporcao}%</p>
            `
        tooltip
            .style("display", "block")
            .style("top", top)
            .style("left", left)
            .html(htmlContent)
    }

    function hideToolTip() {
        d3.select(this).style("stroke-width", 0)
        d3.selectAll("circle").attr("opacity", 1)
        tooltip.style("display", "none")
    }


    function legendEnter(event, data) {
        let coords = [event.clientX, event.clientY + 20]
        let top = `${coords[1]}px`
        let left = `${coords[0]}px`
        d3.select(this)
            .style("stroke", "black")
            .style("stroke-width", 2)
        d3.selectAll("circle").attr("r", 5)           
        let point = d3.select("circle#"+data.country)
        point.attr("r", 10).style("stroke", "black").style("stroke-width", 3) 
        let countryName = countries.find(e => e.code == data.country).name
        let value_ppc = numberFormatPT(data.value_ppc)
        let value_repc = numberFormatPT(data.value_repc)
        let proporcao = Math.round(value_repc / value_ppc * 100)
        let htmlContent = `
            <h5>${data.country} > ${countryName}</h5>
            <p>Remuneracao dos empregados per capita (PPS): ${value_repc}<br>
            PIB per capita (PPS): ${value_ppc}<br>
            Proporção: ${proporcao}%</p>
            `
        tooltip
            .style("display", "block")
            .style("top", top)
            .style("left", left)
            .html(htmlContent)
    }

    function legendExit(event, data) {
        d3.selectAll("circle").attr("r", 8).style("stroke-width", 0)    
        d3.select(this).style("stroke-width", 0)
        tooltip.style("display", "none")
    }


    // Configurar escalas

    let xScale =  d3.scaleLinear()
        .range([0, chartWidth])
        .domain([0, ppcGlobalMax])

    let yScale = d3.scaleLinear()
        .range([chartHeight, 0])
        .domain([0, repcGlobalMax])


    // Configurar eixos

    var xAxis = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${chartHeight+margin.top})`)
    .call(d3.axisBottom(xScale).tickSizeInner(-chartHeight))

    xAxis.selectAll("line").style("stroke","lightgrey")

    var yAxis = svg.append("g")
    .attr("class", "myYaxis")
    .attr("transform", `translate(${margin.left}, ${margin.top})`)
    .call(d3.axisLeft(yScale)
        .tickSizeInner(-chartWidth))

    yAxis.selectAll("line").style("stroke","lightgrey")


    // Configurar etiquetas para os eixos

    svg.append("text")             
        .attr("transform",`translate(${chartWidth/2}, ${chartHeight + margin.top + 40})`)
        .style("text-anchor", "middle")
        .text("PIB per Capita (PPS)");

    var yLabelX = 0
    var yLabelY = chartHeight / 2 + margin.top
    svg.append("text")
        .attr("transform", `rotate(-90, ${yLabelX}, ${yLabelY})`)
        .attr("y", yLabelY)
        .attr("x", yLabelX)
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("Remuneração dos empregados per capita (PPS)")    


    // Configurar legenda

    var legendRectSize = 18                             
    var legendSpacing = 24
    var legendLeftMargin = 120
    var legendTopMArgin = 50 + chartHeight + margin.top

    var legend = svg.append("g")
        .selectAll('.legend')                
        .data(dadosSel.sort((a, b) => d3.ascending(a.key, b.key)))                              
        .enter()
        .append('g')                                       
        .attr('class', 'legend')                           
        .attr('transform', function(d, i) {                
          var horz =  legendLeftMargin + i * legendSpacing ;                  
          return 'translate(' + horz + ',' + legendTopMArgin + ')';   
        });                                                

    legend
        .append('rect')
        .on("mousemove", legendEnter)
        .on("mouseleave", legendExit)
        .attr('width', legendRectSize)                     
        .attr('height', legendRectSize)                    
        .style('fill', d=>colorScale(d.country))                              
    
    legend
        .append('text')                                
        .attr('x', legendRectSize/2 )         
        .attr('y', 30)         
        .text(d=>d.country)
        .style("font-size", 10)
        .style("text-anchor", "middle")







    // Adicionar corpo do gráfico
    var chartBody = svg.append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`)
        .selectAll("circle")
        .data(dadosSel)
        .join("circle")
        .on("mousemove", showTooltip)
        .on("mouseleave", hideToolTip)
        .attr("id",d=>d.country)



    function updateChart() {

        dadosSel = Array.from(data_rvppc.find(e => e.year == anoSel).children)
        dadosSel.sort(function(a,b) {return b.value - a.value})

        chartBody
            .data(dadosSel)
            .enter()
            .append("circle")
            .merge(chartBody)
            .order()
            .transition()
            .delay((d, i) => i * 20)
            .attr("fill", d => colorScale(d.country))
            .attr("r", 8)
            .attr("cx", d => xScale(d.value_ppc))
            .attr("cy", d => yScale(d.value_repc))

    }
   
    updateChart()


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














