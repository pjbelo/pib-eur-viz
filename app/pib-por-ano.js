// Pordata
// Produto Interno Bruto (Euro)																																	
// Que países criam mais e menos riqueza?																																	
// Euro - Milhões																													


export function showChartPibPorAno(data_pib) {

    var data = JSON.parse(JSON.stringify(data_pib))

    // transformar dados
    data = data.map(d => {
        var myYear = +d.Anos
        delete d.Anos
        var pibPerCountry = Object.entries(d).map(d => {
            return {
                country: d[0],
                value: +d[1]
            }
        })

        return {
            year: myYear,
            children: pibPerCountry
        }
    })


    var anoSel = 1995 // Ano selecionado

    var anoElem = d3.select("#ano")
        .style("font-size", "40px")
        .style("width", "95px")

    anoElem.text(anoSel)

    var botaoAnoAnterior = d3.select("#botaoAnoAnterior")
    console.log(botaoAnoAnterior)

    botaoAnoAnterior.on("click", () => {
        anoSel -= 1
        anoElem.text(anoSel)
        updateTreeMap()
    })

    var botaoAnoSeguinte = d3.select("#botaoAnoSeguinte")

    botaoAnoSeguinte.on("click", () => {
        anoSel += 1
        anoElem.text(anoSel)
        updateTreeMap()
    })

    var dadosSel = data.find(e => e.year == anoSel)

    console.log("dadosSel")
    console.log(dadosSel)

    const svgWidth = 900
    const svgHeight = 600

    const colorScale = d3.scaleOrdinal(d3.schemeCategory10)

    const container = d3.select("#container")

    const svg = d3.select("svg")

    svg.selectAll("*").remove()

    svg.attr("width", svgWidth)
        .attr("height", svgHeight)


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


    function showTooltip(data, coords) {
        let top = `${coords[1]}px`
        let left = `${coords[0]}px`
        let countryName = countries.find(e => e.code == data.country).name
        let value = numberFormatPT(data.value / 1000)  // converte para mil milhões
        let htmlContent = `
            <h5>${data.country} > ${countryName}</h5>            
            <p>PIB total: ${value} <br>
            mil milhões de Euros</p>
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



    function updateTreeMap() {
        var hierarchy, treemap, root, cell

        svg.selectAll("*").remove()
        dadosSel = data.find(e => e.year == anoSel)

        hierarchy = d3.hierarchy(dadosSel)
            .sum(d => +d.value)
            .sort((a, b) => b.value - a.value)

        treemap = d3.treemap()
            .size([svgWidth, svgHeight])
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
                d3.select(this).style("stroke", "black").style("stroke-width", 3)
                showTooltip(d.data, [event.clientX, event.clientY + 20])
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

    updateTreeMap()



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
        { code: "CH", name: "Suíça" }
    ]


}



