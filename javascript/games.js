$(document).ready(function () {
  const auth = firebase.auth();
  const database = firebase.database();
  const $addToCartBtn = $("#add-to-cart-btn");

  $addToCartBtn.on("click", function () {
    const currentUser = auth.currentUser;
    const gameId = $(this).data("game-id");

    if (!currentUser) {
      alert("Você precisa estar logado para adicionar itens ao carrinho.");
      window.location.href = "../user/login.html";
      return;
    }

    if (!gameId) {
      console.error("ID do jogo não encontrado!");
      return;
    }

    const cartRef = database.ref(`users/${currentUser.uid}/cart/${gameId}`);
    cartRef
      .set(true)
      .then(() => {
        alert("Jogo adicionado ao carrinho com sucesso!");
      })
      .catch((error) => {
        console.error("Erro ao adicionar ao carrinho:", error);
        alert("Houve um erro ao adicionar o jogo ao carrinho.");
      });
  });
});
