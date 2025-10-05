const n1 = document.getElementById("n1");
const n2 = document.getElementById("n2");
const nomeCandidato = document.getElementById("NomeCandidato");
const partido = document.getElementById("PartidoCandidato");
const foto = document.getElementById("foto");
const btnAvanca = document.getElementById("avanca");
const upBox = document.getElementById("up");
const resultadoEl = document.getElementById("resultado");
const display = document.getElementsByClassName("tela")[0];
const displayAcao = document.getElementsByClassName("telaAcao")[0];

display.classList.add("fadein");
displayAcao.classList.add("fadein");

let tela = false; // false = presidente, true = governador

const brancos = { presidente: 0, governador: 0 };

let nulos = 0;

const candidatosPresidente = {
  11: { nome: "São paulo", partido: "DDD", foto: "./img/sp.png", votos: 0 },
  12: {
    nome: "Bored Ape",
    partido: "NFT",
    foto: "./img/bored-ape-coroa.jpg",
    votos: 0,
  },
  22: {
    nome: "Azathoth",
    partido: "Misticismo",
    foto: "./img/Azathoth.webp",
    votos: 0,
  },
  90: {
    nome: "Hogyoku",
    partido: "Magia",
    foto: "./img/Hogyoku.webp",
    votos: 0,
  },
  99: {
    nome: "Cthulhu",
    partido: "Misticismo",
    foto: "./img/cthulhu.jpg",
    votos: 0,
  },
  71: {
    nome: "Camaçari",
    partido: "DDD",
    foto: "./img/camacari.png",
    votos: 0,
  },
  75: {
    nome: "Alagoinhas",
    partido: "DDD",
    foto: "./img/alagoinhas.png",
    votos: 0,
  },
};

const candidatosGovernador = {
  13: {
    nome: "Taxadd",
    partido: "Trabalhador",
    foto: "./img/taxadd.jpg",
    votos: 0,
  },
  22: { nome: "ChatGPT", partido: "IA", foto: "./img/chat.png", votos: 0 },
  33: { nome: "Gemini", partido: "IA", foto: "./img/gemini.webp", votos: 0 },
  44: {
    nome: "DeepSeek",
    partido: "IA",
    foto: "./img/deepseek.webp",
    votos: 0,
  },
  55: {
    nome: "Tiringa",
    partido: "Nordeste",
    foto: "./img/tiringa.jpg",
    votos: 0,
  },
  66: {
    nome: "Assaí atacadista",
    partido: "Mercado",
    foto: "./img/assai.webp",
    votos: 0,
  },
  77: {
    nome: "Atacadao",
    partido: "Mercado",
    foto: "./img/atacadao.jpg",
    votos: 0,
  },
};

if (n1.value.length === 0) n1.classList.add("piscar");

function clique(n) {
  if (n1.value.length === 0) {
    n1.value = String(n);
    n1.classList.remove("piscar");
    n2.classList.add("piscar");
  } else if (n2.value.length === 0) {
    n2.value = String(n);
    n2.classList.remove("piscar");

    const numero = n1.value + n2.value;
    if (!tela) mostrarCandidatoP(numero);
    else mostrarCandidatoG(numero);
  }
}

function mostrarCandidatoP(numero) {
  const cand = candidatosPresidente[numero];
  if (cand) {
    nomeCandidato.innerText = cand.nome;
    partido.innerText = cand.partido;
    foto.src = cand.foto;
  } else {
    // candidato inexistente => voto nulo visualmente
    nomeCandidato.innerText = "Número inválido — Voto Nulo";
    partido.innerText = "";
    foto.src = "";
  }
}

// exibe candidato governador
function mostrarCandidatoG(numero) {
  const cand = candidatosGovernador[numero];
  if (cand) {
    nomeCandidato.innerText = cand.nome;
    partido.innerText = cand.partido;
    foto.src = cand.foto;
  } else {
    nomeCandidato.innerText = "Número inválido — Voto Nulo";
    partido.innerText = "";
    foto.src = "";
  }
}

// confirmar voto (o HTML deve chamar confirmarVoto())
function confirmarVoto() {
  const numero = n1.value + n2.value;
  const mostra = nomeCandidato.innerText;

  // voto branco
  if (mostra === "Voto em Branco") {
    if (!tela) {
      brancos.presidente++;
      btnAvanca.style.display = "block";
    } else {
      brancos.governador++;
      btnAvanca.style.display = "none";

      if (resultadoEl.style.display === "none") {
        upBox.style.display = "block";
        upBox.classList.add("fadein");
      } else mostrarResultado();
    }
    alert("Branco confirmado!");
    resetarCampos();
    return;
  }

  // se ambos dígitos preenchidos
  if (n1.value && n2.value) {
    if (!tela) {
      if (candidatosPresidente[numero]) {
        candidatosPresidente[numero].votos++;
      } else {
        nulos++;
      }
      btnAvanca.style.display = "block";
    } else {
      if (candidatosGovernador[numero]) {
        candidatosGovernador[numero].votos++;
      } else {
        nulos++;
      }
      btnAvanca.style.display = "none";
      upBox.classList.add("fadein");
      upBox.style.display = "block";
    }
    alert("Voto confirmado!");
    resetarCampos();
  } else {
    // campos incompletos
    if (!n1.value) {
      alert("Voto incompleto — digite os dois números ou escolha BRANCO.");
    } else {
      alert("Preencha todos os campos!");
    }
  }
}

function branco() {
  nomeCandidato.innerText = "Voto em Branco";
  partido.innerText = "";
  foto.src = "";
}

function cancela() {
  resetarCampos();
}

function resetarCampos() {
  n1.value = "";
  n2.value = "";
  n1.classList.add("piscar");
  n2.classList.remove("piscar");
  nomeCandidato.innerText = "";
  partido.innerText = "";
  foto.src = "";
}

function avanca() {
  tela = true;
  document.getElementsByTagName("h3")[0].innerText = tela
    ? "Governador"
    : "Presidente";
  btnAvanca.style.display = "none";
  resetarCampos();
}

function up() {
  if (upBox) {
    upBox.classList.remove("fadein");
    setTimeout(function () {
      upBox.classList.add("fadeout");
    }, 400);

    upBox.classList.add("fadeout");
  }
  mostrarResultado();
}

function mostrarResultado() {
  upBox.style.display = "none";
  var reset = document.getElementById("reset");
  reset.style.display = "block";
  display.classList.remove("fadein");
  displayAcao.classList.remove("fadein");
  display.classList.add("fadeout");
  displayAcao.classList.add("fadeout");
  display.style.display = "none";
  displayAcao.style.display = "none";
  document.getElementsByClassName("container")[0].style.backgroundColor =
    "rgb(26 89 179 / 25%)";
  resultadoEl.style.display = "block";
  resultadoEl.classList.add("fadein");

  // soma votos
  const somaPresidente = Object.values(candidatosPresidente).reduce(
    (acc, c) => acc + (c.votos || 0),
    0
  );
  const somaGovernador = Object.values(candidatosGovernador).reduce(
    (acc, c) => acc + (c.votos || 0),
    0
  );

  // montar html com detalhes
  const detalhesPres = Object.entries(candidatosPresidente)
    .sort((a, b) => b[1].votos - a[1].votos)
    .map(
      ([num, c]) =>
        `<li>${num} - ${c.nome} (${c.partido}): ${c.votos} votos</li>`
    )
    .join("");

  const detalhesGov = Object.entries(candidatosGovernador)
    .sort((a, b) => b[1].votos - a[1].votos)
    .map(
      ([num, c]) =>
        `<li>${num} - ${c.nome} (${c.partido}): ${c.votos} votos</li>`
    )
    .join("");
  resultadoEl.innerHTML = `
              <h4>Resultado</h4>   
                         
              <p class="candidatos" style="font-size: large;">Presidente<p> \n
              <p class="candidatos"> — Válidos: ${somaPresidente} | Brancos: ${brancos.presidente} — </p>
              <ul>${detalhesPres}</ul>
              <br>
              <p class="candidatos" style="font-size: large;">Governador</p> \n 
              <p class="candidatos"> — Válidos: ${somaGovernador} | Brancos: ${brancos.governador} — </p>
              <ul>${detalhesGov}</ul>
              <p class="votosNulos">Votos Nulos: ${nulos}</p>
            `;
}

function resetar() {
  document.getElementsByClassName("container")[0].classList.add("fadeout"); // aplica animação
  document.getElementById("reset").classList.add("fadeout"); // aplica animação
  console.log("Intervalo interrompido.");

  setTimeout(function () {
    location.reload(); // só recarrega depois da animação
  }, 400); // tempo igual ao da animação CSS
}
