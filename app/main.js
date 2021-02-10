
import { showChartPibPorAno } from './pib-por-ano.js'
import { showChartPibTodosAnos } from './pib-todos-anos.js'
import { showChartPpcPorAno } from './pib-per-capita-por-ano.js'
import { showChartPpcTodosAnos } from './pib-per-capita-todos-anos.js'
import { showChartPpcBase100 } from './pib-per-capita-base100.js'
import { showChartRpcPorAno } from './remuneracao-per-capita-por-ano.js'
import { showChartRpcTodosAnos } from './remuneracao-per-capita-todos-anos.js'
import { showChartRpcBase100 } from './remuneracao-per-capita-base100.js'
import { showChartRemuneracaoVsPibPerCapita } from './remuneracao-vs-pib-per-capita.js'

async function main() {

    // ler dados dos ficheiros
    
    const data_pib = await d3.csv("data/PIB-Euro.csv")
        .catch((e) => console.log(e))
    
    const data_ppc = await d3.csv("data/PIB-per-capita.csv")
        .catch((e) => console.log(e))
    
    const data_repc = await d3.csv("data/Remuneracao-dos-empregados-per-capita.csv")
        .catch((e) => console.log(e))
    
        console.log("data_ppc", data_ppc)
        console.log("data_repc", data_repc)

    // Abrir o Modal no início
    $('#myModal').modal('show')

    // Ativar o tooltip (Bootstrap)
    $(function () {
        $('[data-toggle="tooltip"]').tooltip()
      })


    var titulo1 = document.getElementById("titulo1")
    var titulo2 = document.getElementById("titulo2")
    var titulo3 = document.getElementById("titulo3")

    var botaoPib = document.getElementById("botao-pib")
    var botaoPpc = document.getElementById("botao-ppc")
    var botaoRpc = document.getElementById("botao-rpc")

    var cabecalho1 = document.getElementById("cabecalho1")
    var cabecalho2 = document.getElementById("cabecalho2")
    var cabecalho3 = document.getElementById("cabecalho3")

    var rodape1 = document.getElementById("rodape1")
    var rodape2 = document.getElementById("rodape2")
    var rodape3 = document.getElementById("rodape3")

    function hide(el) { el.style.display = "none"}
    function showBlock(el) { el.style.display = "block" }
    function showFlex(el) { el.style.display = "flex" }

    function ativarBotao(el) { 
        if (el == botaoPib) {
            botaoPib.classList.add("active")
            botaoPpc.classList.remove("active")
            botaoRpc.classList.remove("active")
        } else if (el == botaoPpc) {
            botaoPib.classList.remove("active")
            botaoPpc.classList.add("active")
            botaoRpc.classList.remove("active")
        } else if (el == botaoRpc) {
            botaoPib.classList.remove("active")
            botaoPpc.classList.remove("active")
            botaoRpc.classList.add("active")
        } 
    }

    function ativarCabecalho(el) { 
        if (el == cabecalho1) {
            cabecalho1.style.display = "flex" 
            cabecalho2.style.display = "none" 
            cabecalho3.style.display = "none" 
        } else if (el == cabecalho2) {
            cabecalho1.style.display = "none" 
            cabecalho2.style.display = "flex" 
            cabecalho3.style.display = "none" 
        } else if (el == cabecalho3) {
            cabecalho1.style.display = "none" 
            cabecalho2.style.display = "none" 
            cabecalho3.style.display = "flex" 
        } 
    }

    function definirTitulo1(titulo) { titulo1.innerHTML = titulo }
    function definirTitulo2(titulo) { titulo2.innerHTML = titulo }
    function definirTitulo3(titulo) { titulo3.innerHTML = titulo }

    botaoPib.addEventListener("click", clickedBotaoPib)
    function clickedBotaoPib() {
        ativarBotao(botaoPib)
        showFlex(rodape1)
        hide(rodape2)
        hide(rodape3)
    }

    botaoPpc.addEventListener("click", clickedBotaoPpc)
    function clickedBotaoPpc() {
        ativarBotao(botaoPpc)
        showFlex(rodape2)
        hide(rodape1)
        hide(rodape3)
    }

    botaoRpc.addEventListener("click", clickedBotaoRpc)
    function clickedBotaoRpc() {
        ativarBotao(botaoRpc)
        showFlex(rodape3)
        hide(rodape1)
        hide(rodape2)
    }

    document.getElementById("botao-pib-por-ano").addEventListener("click", clickedBotaoPibPa)
    function clickedBotaoPibPa() {
        ativarCabecalho(cabecalho2)
        definirTitulo2("Produto Interno Bruto por ano")
        showChartPibPorAno(data_pib)
    }

    clickedBotaoPib()
    clickedBotaoPibPa() // inicia com este grafico aberto

    document.getElementById("botao-pib-todos-anos").addEventListener("click", clickedBotaoPibTa)
    function clickedBotaoPibTa() {
        ativarCabecalho(cabecalho3)
        definirTitulo3("Produto Interno Bruto (1995-2019)")
        showChartPibTodosAnos(data_pib)
    }

    document.getElementById("botao-ppc-por-ano").addEventListener("click", clickedBotaoPpcPa)
    function clickedBotaoPpcPa() {
        ativarCabecalho(cabecalho2)
        definirTitulo2("PIB per capita (PPS)")
        showChartPpcPorAno(data_ppc)
    }

    document.getElementById("botao-ppc-todos-anos").addEventListener("click", clickedBotaoPpcTa)
    function clickedBotaoPpcTa() {
        ativarCabecalho(cabecalho3)
        definirTitulo3("PIB per capita (PPS) 1995-2019")
        showChartPpcTodosAnos(data_ppc)
    }

    document.getElementById("botao-ppc-crescimento").addEventListener("click", clickedBotaoPpcC)
    function clickedBotaoPpcC() {
        ativarCabecalho(cabecalho3)
        definirTitulo3("PIB per capita - Crescimento base 100")
        showChartPpcBase100(data_ppc)
    }



    document.getElementById("botao-rpc-por-ano").addEventListener("click", clickedBotaoRpcPa)
    function clickedBotaoRpcPa() {
        ativarCabecalho(cabecalho2)
        definirTitulo2("Remuneração Empregados per capita")
        showChartRpcPorAno(data_repc)

    }


    document.getElementById("botao-rpc-todos-anos").addEventListener("click", clickedBotaoRpcTa)
    function clickedBotaoRpcTa() {
        ativarCabecalho(cabecalho3)
        definirTitulo3("Remuneração per capita (1995-2019)")
        showChartRpcTodosAnos(data_repc)

    }


    document.getElementById("botao-rpc-crescimento").addEventListener("click", clickedBotaoRpcC)
    function clickedBotaoRpcC() {
        ativarCabecalho(cabecalho3)
        definirTitulo3("Remuneração - Crescimento base 100")
        showChartRpcBase100(data_repc)

    }


    document.getElementById("botao-rpc-rep").addEventListener("click", clickedBotaoRpcRep)
    function clickedBotaoRpcRep() {
        ativarCabecalho(cabecalho2)
        definirTitulo2("Remuneração e PIB per capita")
        showChartRemuneracaoVsPibPerCapita(data_ppc, data_repc)

    }
    
}
    
main()

