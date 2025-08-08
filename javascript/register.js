
$("#registro-form").on("submit", function (e) {
  e.preventDefault();

  const email = $("#email").val();
  const senha = $("#senha").val();
  const nick = $("#nickname").val();
  const isPublisher = $("#is-publisher").is(":checked");

  auth
    .createUserWithEmailAndPassword(email, senha)
    .then((userCredential) => {
      const createdUser = userCredential.user;
      const profilePromise = createdUser.updateProfile({ displayName: nick });
      const newUserInDb = {
        nickname: nick,
        email: email,
        isPublisher: isPublisher,
        description: "",
        profilePicture: { imageUrl: "../imgs/blank_profile.jpg" },
      };
      const databasePromise = database
        .ref("users/" + createdUser.uid)
        .set(newUserInDb);
      return Promise.all([profilePromise, databasePromise]);
    })
    .then(() => {
      alert("Bem-vindo, " + nick + "! Registro concluído.");
      window.location.href = "login.html";
    })
    .catch((error) => {
      if (error.code == "auth/email-already-in-use") {
        alert("Erro: Este endereço de e-mail já está cadastrado.");
      } else {
        alert("Erro no registro: " + error.message);
      }
    });
});
