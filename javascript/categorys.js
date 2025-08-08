$(document).ready(function () {
  $(".category-link").on("click", function (event) {
    event.preventDefault();
    const category = $(this).data("category");

    if (category) {
      sessionStorage.setItem("selectedCategory", category);


      window.location.href = $(this).attr("href");
    } else {
      console.error("Atributo data-category não encontrado no link clicado.");
    }
  });
});
