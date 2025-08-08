

if (!firebase.apps.length) {
  const firebaseConfig = {
    apiKey: "AIzaSyCT0diQ2VcWszq7a3LXnZ67m5D3zLt55B8",
    authDomain: "qgames-d662e.firebaseapp.com",
    projectId: "qgames-d662e",
    databaseURL: "https://qgames-d662e-default-rtdb.firebaseio.com/",
    storageBucket: "qgames-d662e.firebasestorage.app",
    messagingSenderId: "233265353345",
    appId: "1:233265353345:web:97b40a5c696b8045adb380",
  };
  firebase.initializeApp(firebaseConfig);
}

const auth = firebase.auth();
const database = firebase.database();

$(document).ready(function () {
  const availableCategories = {
    Ação: "action",
    Aventura: "adventure",
    Estratégia: "strategy",
    RPG: "rpg",
    Esporte: "sport",
    Corrida: "race",
    Indie: "indie",
    Luta: "fight",
    Exploração: "exploration",
    Fantasia: "fantasy",
  };
  const $categoriesContainer = $("#categories-checkboxes");
  const $submitButton = $("#submit-button");
  const $buttonText = $("#button-text");
  const $loadingSpinner = $("#loading-spinner");
  const $feedbackAlert = $("#feedback-alert");

  Object.keys(availableCategories).forEach((displayName) => {
    const identifier = availableCategories[displayName];
    const checkboxHtml = `
          <div class="form-check">
              <input class="form-check-input" type="checkbox" value="${identifier}" id="cat-${identifier}">
              <label class="form-check-label" for="cat-${identifier}">
                  ${displayName}
              </label>
          </div>`;
    $categoriesContainer.append(checkboxHtml);
  });

  auth.onAuthStateChanged((user) => {
    if (user) {
      database
        .ref("users/" + user.uid)
        .once("value")
        .then((snapshot) => {
          if (snapshot.val()?.isPublisher) {
            $("#page-content").show();
          } else {
            $("body").html("<h1>Acesso Negado</h1>");
          }
        });
    } else {
      window.location.href = "../user/login.html";
    }
  });

  $("#add-game-form").on("submit", async function (e) {
    e.preventDefault();
    setLoading(true);

    try {
      const gameData = getGameDataFromForm();
      gameData.publisherId = auth.currentUser.uid;

      const coverFile = $("#game-cover-image-file")[0].files[0];
      const coverUrl = $("#game-cover-image-url").val().trim();
      if (coverFile) {
        gameData.coverImage = await fileToBase64(coverFile);
      } else if (coverUrl) {
        gameData.coverImage = coverUrl;
      } else {
        throw new Error("Forneça uma imagem de capa (arquivo ou URL).");
      }

      const galleryFiles = $("#game-gallery-images-files")[0].files;
      const galleryUrlsText = $("#game-gallery-images-urls").val().trim();
      let galleryImages = [];

      if (galleryFiles.length > 0) {
        const base64Promises = Array.from(galleryFiles).map((file) =>
          fileToBase64(file)
        );
        galleryImages = await Promise.all(base64Promises);
      } else if (galleryUrlsText) {
        galleryImages = galleryUrlsText
          .split("\n")
          .filter((url) => url.trim() !== "");
      }
      gameData.galleryImages = galleryImages;

      await database.ref("games").push(gameData);

      showFeedback("Jogo adicionado com sucesso!", "success");
      $("#add-game-form")[0].reset();
    } catch (error) {
      console.error("Erro ao adicionar jogo:", error);
      showFeedback(error.message, "danger");
    } finally {
      setLoading(false);
    }
  });

  function fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  }

  function getGameDataFromForm() {
    const selectedCategories = {};
    $("#categories-checkboxes input:checked").each(function () {
      selectedCategories[$(this).val()] = true;
    });

    return {
      title: $("#game-title").val(),
      description: $("#game-description").val(),
      price: $("#game-price").val(),
      ageRating: $("#game-age-rating").val(),
      categories: selectedCategories,
    };
  }

  function setLoading(isLoading) {
    $submitButton.prop("disabled", isLoading);
    $buttonText.toggle(!isLoading);
    $loadingSpinner.toggle(isLoading);
  }

  function showFeedback(message, type) {
    $feedbackAlert
      .removeClass("alert-success alert-danger")
      .addClass(`alert-${type}`)
      .text(message)
      .show();
  }
});
