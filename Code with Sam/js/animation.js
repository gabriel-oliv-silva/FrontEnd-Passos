const transition = document.getElementById("page-transition");

// Função para revelar a página
function revealPage() {
    requestAnimationFrame(() => {
        transition.classList.add("loaded");
    });
}

document.addEventListener("DOMContentLoaded", revealPage);

const fallbackTimeout = setTimeout(revealPage, 2000);

window.addEventListener("load", () => {
    clearTimeout(fallbackTimeout); // Cancela o Plano B se carregar rápido
    revealPage();
});

window.addEventListener("pageshow", (event) => {
    if (event.persisted) {
        // Se a página veio do cache, garante que a transição seja removida
        revealPage();
    }
});

document.querySelectorAll("a[href]").forEach(link => {
    const url = link.getAttribute("href");

    if (url && !url.startsWith("#") && !url.startsWith("http") && link.target !== "_blank") {
        
        link.addEventListener("click", e => {
            if (e.ctrlKey || e.metaKey || e.shiftKey) return;

            e.preventDefault();
            transition.classList.remove("loaded");

            setTimeout(() => {
                window.location.href = url;
            }, 600); 
        });
    }
});