const transition = document.getElementById("page-transition");

/* quando tudo carregar */
window.addEventListener("load", () => {
    requestAnimationFrame(() => {
        transition.classList.add("loaded");
    });
});

/* animação ao sair */
document.querySelectorAll("a[href]").forEach(link => {

    const url = link.getAttribute("href");

    if (!url.startsWith("#") && !url.startsWith("http")) {

        link.addEventListener("click", e => {
            e.preventDefault();

            transition.classList.remove("loaded");

            setTimeout(() => {
                window.location.href = url;
            }, 500);
        });
    }
});

