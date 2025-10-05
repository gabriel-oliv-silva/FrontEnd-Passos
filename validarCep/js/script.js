const rua = document.getElementById('rua');
const bairro = document.getElementById('bairro');
const estado = document.getElementById('estado');
const regiao = document.getElementById('regiao');
const cep = document.getElementById('cep');
const uf = document.getElementById('uf');
const num = document.getElementById('num');
const msg = document.getElementById('mensagem');
var tipoMsg;

function verificar(){
    if(cep.value.length != 8){
        document.getElementById('busca').style.display = "none";
    }
    else{
        document.getElementById('busca').style.display = "block";
    }
}
function enviar(){
    if(rua.value == "" || bairro.value == "" || estado.value == "" || regiao.value == "" || cep.value == "" || uf.value == "" || num.value == "" || nome.value == ""){
        msg.style.color = "red";
        msg.innerText = "Preencha todos os campos antes de enviar!";

        if(rua.value == "")
            rua.focus();
        else if(bairro.value == "")
            bairro.focus();
        else if(estado.value == "")
            estado.focus();
        else if(regiao.value == "")
            regiao.focus();
        else if(cep.value == "")
            cep.focus();
        else if(uf.value == "")
            uf.focus();
        else if(num.value == "")
            num.focus();
        else if(nome.value == "")
            nome.focus();

    }
    else{
        msg.style.color = "green";
        msg.innerText = "Endereço cadastrado com sucesso!";
    }                                             
}
function buscaCep() {
    console.log(cep.value);
        
        const ajax = new XMLHttpRequest();
        ajax.open("GET", `https://viacep.com.br/ws/${cep.value}/json/`);
        ajax.send();
        ajax.onload = function () {
            let resul = JSON.parse(this.responseText);

            if (resul.erro == "true") {
                tipoMsg = "erro";
                rua.value = "";
                bairro.value = "";
                estado.value = "";
                regiao.value = "";
                uf.value = "";
            }
            else {
                rua.value = resul.logradouro;
                bairro.value = resul.bairro;
                estado.value = resul.estado;
                regiao.value = resul.regiao;
                uf.value = resul.uf;
                tipoMsg = "sucesso";
            }

            if (tipoMsg == "erro") {
                msg.style.color = "red";
                msg.innerText = "CEP não encontrado! Tente novamente.";
            }
            else if (tipoMsg == "sucesso") {
                msg.style.color = "green";
                msg.innerText = "CEP encontrado com sucesso!";
            }
        }
}
