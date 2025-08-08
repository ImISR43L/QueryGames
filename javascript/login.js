
$(document).ready(function () {
  $("#form-login").on("submit", function (e) {
    e.preventDefault();
    const email = $("#email-login").val();
    const senha = $("#senha-login").val();
    if (!email || !senha) {
      alert("Por favor, preencha todos os campos.");
      return;
    }
    auth
      .signInWithEmailAndPassword(email, senha)
      .then((userCredential) => {
        const user = userCredential.user;
        alert("Bem-vindo de volta, " + (user.displayName || user.email) + "!");
        window.location.href = "../index.html";
      })
      .catch((error) => {
        alert("E-mail ou senha inválidos. Por favor, tente novamente.");
      });
  });
});
