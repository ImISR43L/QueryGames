
const firebaseConfig = {
  apiKey: "AIzaSyCT0diQ2VcWszq7a3LXnZ67m5D3zLt55B8",
  authDomain: "qgames-d662e.firebaseapp.com",
  projectId: "qgames-d662e",
  databaseURL: "https://qgames-d662e-default-rtdb.firebaseio.com/",
  storageBucket: "qgames-d662e.firebasestorage.app",
  messagingSenderId: "233265353345",
  appId: "1:233265353345:web:97b40a5c696b8045adb380",
};
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}
const database = firebase.database();
const auth = firebase.auth();

$(document).ready(function () {
  const $body = $("body");
  const $menuVisitante = $("#menu-visitante"),
    $menuLogado = $("#menu-logado"),
    $userNickname = $("#user-nickname"),
    $btnLogout = $("#btn-logout"),
    $minhaContaLink = $("#nav-minha-conta"),
    $dropdownMenu = $(".dropdown-menu"),
    $cartCount = $("#cart-count");
  let userCart = {};

  auth.onAuthStateChanged(function (user) {
    $("#nav-add-game-item").remove();
    if (user) {
      $menuVisitante.hide();
      $menuLogado.show();
      database
        .ref("users/" + user.uid)
        .once("value")
        .then(function (snapshot) {
          const userData = snapshot.val(),
            nickname = userData?.nickname || "User";
          $userNickname.html(
            `<i class="bi bi-person-circle me-1"></i> ${nickname}`
          );
          if (userData?.isPublisher) {
            $dropdownMenu.prepend(
              `<li id="nav-add-game-item"><a class="dropdown-item" href="/publisher/add-game.html">Adicionar Jogo</a></li>`
            );
          }
        });
      $minhaContaLink
        .attr("href", `/user/account.html?user=${user.uid}`)
        .removeClass("disabled-link");
      const cartRef = database.ref("users/" + user.uid + "/cart");
      cartRef.on("value", (snapshot) => {
        userCart = snapshot.val() || {};
        const count = Object.keys(userCart).length;
        $cartCount.text(count).toggle(count > 0);
      });
    } else {
      $menuVisitante.show();
      $menuLogado.hide();
      $cartCount.hide();
    }
  });

  $btnLogout.on("click", (e) => {
    e.preventDefault();
    auth.signOut().then(() => {
      alert("You have been logged out.");
      window.location.href = "/index.html";
    });
  });

  function showCart() {
    closeCart();
    const gameIds = Object.keys(userCart || {});
    let itemsHtml = "";
    if (gameIds.length === 0) {
      itemsHtml = "<p>Seu carrinho está vazio.</p>";
    } else {
      gameIds.forEach((gameId) => {
        database
          .ref("games/" + gameId)
          .once("value")
          .then((snapshot) => {
            const gameDetails = snapshot.val();
            if (gameDetails) {
              $(`.cart-item-placeholder-${gameId}`).html(
                `<span>${gameDetails.title}</span><span>${gameDetails.price}</span>`
              );
            }
          });
        itemsHtml += `<div class="cart-item d-flex justify-content-between align-items-center mb-2 cart-item-placeholder-${gameId}">Carregando...</div>`;
      });
    }

    const modalHtml = `
      <div id="cart-backdrop" style="position: fixed; top: 0; left: 0; z-index: 1050; width: 100vw; height: 100vh; background-color: #000; opacity: 0.5;"></div>
      <div id="cart-modal-dynamic" class="modal show" style="display: block; z-index: 1055;">
        <div class="modal-dialog">
          <div class="modal-content bg-dark text-white">
            <div class="modal-header">
              <h5 class="modal-title">Seu Carrinho de Compras</h5>
              <button type="button" class="btn-close btn-close-white" id="cart-close-btn-dynamic"></button>
            </div>
            <div class="modal-body">${itemsHtml}</div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" id="cart-continue-shopping-btn-dynamic">Continuar Comprando</button>
              <button type="button" class="btn btn-primary" id="finalize-purchase-btn-dynamic">Finalizar Compra</button>
            </div>
          </div>
        </div>
      </div>
    `;
    $body.append(modalHtml);
  }

  function closeCart() {
    $("#cart-backdrop, #cart-modal-dynamic").remove();
  }

  $(document).on("click", "#cart-icon", (e) => {
    e.preventDefault();
    showCart();
  });
  $(document).on(
    "click",
    "#cart-close-btn-dynamic, #cart-continue-shopping-btn-dynamic, #cart-backdrop",
    closeCart
  );

  $(document).on("click", "#finalize-purchase-btn-dynamic", () => {
    const currentUser = auth.currentUser;
    if (!currentUser) return alert("Você precisa estar logado.");
    const gameIds = Object.keys(userCart);
    if (gameIds.length === 0) return alert("Seu carrinho está vazio!");
    const updates = {};
    gameIds.forEach((gameId) => {
      updates[`users/${currentUser.uid}/owned_games/${gameId}`] = true;
      updates[`users/${currentUser.uid}/cart/${gameId}`] = null;
    });
    database
      .ref()
      .update(updates)
      .then(() => {
        alert("Compra realizada com sucesso!");
        closeCart();
      })
      .catch(() => alert("Houve um erro."));
  });
});
