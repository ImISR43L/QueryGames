$(document).ready(function () {
  const database = firebase.database();

  const category = sessionStorage.getItem("selectedCategory");

  if (!category) {
    $("#category-title").text("Categoria não encontrada");
    return;
  }

  const categoryTitle = category.charAt(0).toUpperCase() + category.slice(1);
  $("#category-title").text(categoryTitle);


  const gamesRef = database
    .ref("games")
    .orderByChild("categories/" + category)
    .equalTo(true);
  const $gamesGridContainer = $("#games-grid-container");

  gamesRef.on("value", (snapshot) => {
    $gamesGridContainer.empty();
    const games = snapshot.val();

    if (games) {
      Object.keys(games).forEach((gameId) => {
        const gameData = games[gameId];
        const cardHtml = `
          <div class="col-auto">
            <a href="../games/game-detail.html" data-game-id="${gameId}" class="game-link">
              <div class="card game-grid-card">
                <img src="${gameData.coverImage}" class="card-img-top" alt="${gameData.title}">
                <div class="card-body"><p class="card-text">${gameData.title}</p></div>
              </div>
            </a>
          </div>
        `;
        $gamesGridContainer.append(cardHtml);
      });
    } else {
      $gamesGridContainer.html(
        '<p class="text-white">Nenhum jogo encontrado nesta categoria.</p>'
      );
    }
  });

  $(document).on("click", ".game-link", function (event) {
    event.preventDefault();
    const gameId = $(this).data("game-id");
    if (gameId) {
      sessionStorage.setItem("selectedGameId", gameId);
      window.location.href = `../games/game-detail.html`;
    }
  });
});
