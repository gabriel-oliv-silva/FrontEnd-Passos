function animarTroca(el, novoValor) {
  if (el.textContent === novoValor) return;

  const antigo = el;
  const novo = document.createElement("span");
  novo.textContent = novoValor;
  novo.classList.add("entrar");

  el.parentNode.appendChild(novo); // adiciona novo span ao container

  requestAnimationFrame(() => {
    antigo.classList.add("sair");
    novo.classList.remove("entrar");
  });

  setTimeout(() => {
    antigo.remove();
    novo.id = el.id; // mantém o id para a próxima atualização
  }, 400);
}

setInterval(() => {
  const agora = new Date();
  const h = String(agora.getHours()).padStart(2, "0");
  const m = String(agora.getMinutes()).padStart(2, "0");
  const s = String(agora.getSeconds()).padStart(2, "0");

  animarTroca(document.getElementById("horas"), h);
  animarTroca(document.getElementById("minutos"), m);
  animarTroca(document.getElementById("segundos"), s);

  document.getElementById("data").textContent = agora.toLocaleDateString();

  // saudação e tema
  const horaNum = parseInt(h);
  const saudacao = document.getElementById("saudacao");
  if (horaNum >= 18 || horaNum <= 4) {
    document.body.style.backgroundColor = "black";
    saudacao.style.color = "white";
    saudacao.textContent = "Boa noite";
    document.getElementById("data").style.color = "white";
  } else if (horaNum >= 5 && horaNum <= 11) {
    document.body.style.backgroundColor = "white";
    saudacao.style.color = "black";
    saudacao.textContent = "Bom dia";
    document.getElementById("data").style.color = "black";
  } else {
    document.body.style.backgroundColor = "white";
    saudacao.style.color = "black";
    saudacao.textContent = "Boa tarde";
    document.getElementById("data").style.color = "black";
  }
}, 1000);

function mudarTema() {
  var rel = document.getElementsByClassName("relogio")[0];

  if (document.body.style.backgroundColor == "black") {
    document.body.style.backgroundColor = "white";
    data.style.color = "black";
    rel.style.color = "black";
    document.getElementById("saudacao").style.color = "black";
    for (var i = 0; i < 3; i++) {
      document.getElementsByClassName("valores")[i].style.color = "gray";
    }
  } else {
    rel.style.color = "white";
    document.getElementById("saudacao").style.color = "white";
    document.body.style.backgroundColor = "black";
    data.style.color = "white";
    for (var i = 0; i < 3; i++) {
      document.getElementsByClassName("valores")[i].style.color = "white";
    }
  }
}
