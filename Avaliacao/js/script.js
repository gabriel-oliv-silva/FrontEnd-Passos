const show = document.getElementById('show');

function validar() {
    const form = {
        nome: document.getElementById('nome').value,
        email: document.getElementById('email').value,
        msg: document.getElementById('mensagem').value
    }


    show.style.margin = 20;
 if(form.nome && !form.msg || form.nome && !form.email){
    show.style.color = "red";
    show.textContent = `${form.nome}, preencha todos os campos!`
}
else if(!form.nome && !form.msg && !form.email){
    show.style.color = "black";
    show.textContent = `Preencha todos os campos!`
}
else{
    show.style.color = "green";
    show.textContent = `Sua mensagem foi enviada com sucesso!`

}
show.style.display = "block";
}

function mudarBkg(){
    if(document.body.style.backgroundColor == 'white')
        document.body.style.backgroundColor = "#cecece"
    
    else
        document.body.style.backgroundColor = "white"
    
}