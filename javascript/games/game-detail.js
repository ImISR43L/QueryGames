$(document).ready(function () {
  const auth = firebase.auth();
  const database = firebase.database();

  const gameId = sessionStorage.getItem("selectedGameId");

  if (!gameId) {
    $("body").html("<h1>Erro: Jogo não encontrado (Nenhum ID na sessão).</h1>");
    return;
  }

  const gameRef = database.ref("games/" + gameId);
  gameRef
    .once("value")
    .then((snapshot) => {
      const gameData = snapshot.val();

      if (gameData) {
        $("#game-title").text(gameData.title);
        $("#game-description").text(gameData.description);
        $("#game-cover-image").attr("src", gameData.coverImage);
        $("#game-age-rating").text(`Classificação: ${gameData.ageRating} anos`);
        $("#game-price").text(`R$${gameData.price}`);
        $("#add-to-cart-btn").attr("data-game-id", gameId);

        const $galleryCarousel = $("#game-gallery-carousel");
        if (gameData.galleryImages && gameData.galleryImages.length > 0) {
          gameData.galleryImages.forEach((imageUrl) => {
            $galleryCarousel.append(
              `<div><img src="${imageUrl}" style="width: 100%;" alt="Galeria do jogo"></div>`
            );
          });
        } else {
          $galleryCarousel.append(
            `<div><img src="${gameData.coverImage}" style="width: 100%;" alt="Capa do jogo"></div>`
          );
        }

        $galleryCarousel.slick({
          dots: true,
          infinite: true,
          speed: 500,
          fade: true,
          cssEase: "linear",
          autoplay: true,
          autoplaySpeed: 4000,
        });

        $("#game-detail-container").show();
      } else {
        $("body").html("<h1>Erro: Jogo não encontrado no banco de dados.</h1>");
      }
    })
    .catch((error) => {
      console.error("Erro ao buscar dados do jogo:", error);
      $("body").html("<h1>Ocorreu um erro ao carregar o jogo.</h1>");
    });

  $("#add-to-cart-btn").on("click", function () {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      alert("Você precisa estar logado para adicionar itens ao carrinho.");
      window.location.href = "../user/login.html";
      return;
    }
    const gameIdToAdd = $(this).data("game-id");
    const cartRef = database.ref(
      `users/${currentUser.uid}/cart/${gameIdToAdd}`
    );
    cartRef
      .set(true)
      .then(() => {
        alert("Jogo adicionado ao carrinho com sucesso!");
      })
      .catch((error) => {
        alert("Houve um erro ao adicionar o jogo ao carrinho.");
      });
  });
});
