$(document).ready(function () {
  const database = firebase.database();
  const gamesRef = database.ref("games");
  const $carouselContainer = $("#carousel-container");
  const $gamesGridContainer = $("#games-grid-container");

  function createGameCard(gameId, gameData) {
    return `<div class="col-auto"><a href="games/game-detail.html" data-game-id="${gameId}" class="game-link"><div class="card game-grid-card"><img src="${gameData.coverImage}" class="card-img-top" alt="${gameData.title}"><div class="card-body"><p class="card-text">${gameData.title}</p></div></div></a></div>`;
  }

  function createCarouselItem(gameId, gameData, isActive) {
    return `<div class="carousel-item ${
      isActive ? "active" : ""
    }"><a href="games/game-detail.html" data-game-id="${gameId}" class="game-link"><div class="card-img-custom" style="height: 400px; background-image: url('${gameData.coverImage}')"></div><div class="carousel-caption d-none d-md-block"><h5>${gameData.title}</h5></div></a></div>`;
  }

  gamesRef.on("value", (snapshot) => {
    $carouselContainer.empty();
    $gamesGridContainer.empty();
    const games = snapshot.val();
    if (games) {
      let isFirstItem = true;
      Object.keys(games).forEach((gameId) => {
        const gameData = games[gameId];
        $carouselContainer.append(
          createCarouselItem(gameId, gameData, isFirstItem)
        );
        isFirstItem = false;
        $gamesGridContainer.append(createGameCard(gameId, gameData));
      });
    } else {
      $gamesGridContainer.html(
        '<p class="text-white">Nenhum jogo encontrado.</p>'
      );
    }
  });

  $(document).on("click", ".game-link", function (event) {
    event.preventDefault();
    const gameId = $(this).data("game-id");
    if (gameId) {
      sessionStorage.setItem("selectedGameId", gameId);
      window.location.href = $(this).attr("href");
    }
  });
});
