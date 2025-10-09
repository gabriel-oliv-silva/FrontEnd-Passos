function escolha(num) {
  document.getElementById("escolha").classList.add("fadeout");
  document.getElementById("escolha").style.display = "none";
  if (num == 1) {
    document.getElementById("escolha").classList.remove("fadeout");
    document.getElementsByClassName("wrap")[0].style.display = "flex";
    document.getElementsByClassName("wrap")[0].classList.add("fadein");
    document.getElementsByClassName("wrap")[0].classList.remove("fadein");
    log("Protótipo pronto — PvP local ativo");
    render();
  } else {
    getAIMove();
    console.log("Protótipo IA em construção... \n STATUS: 1%");
    alert(
      "Protótipo IA em produção... \n STATUS: 1%; \nA página será recarregada em 5 segundos;"
    );
    setTimeout(() => {
      let s = 5;
      setInterval(() => {
        console.log(`Reiniciando em ${s} segundos;`);
        s--;
        if (s == 0) window.location.reload(true);
      }, 1000);
    }, 3000);
    return;
  }
}
