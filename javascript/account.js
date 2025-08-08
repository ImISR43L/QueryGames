
$(document).ready(function () {
  const auth = firebase.auth();
  const database = firebase.database();

  const $profileImage = $("#profileImage");
  const $fileInput = $("#fileInput");
  const $descriptionDisplay = $("#descriptionDisplay");
  const $descriptionEditor = $("#descriptionEditor");
  const $editProfileBtn = $("#editProfileBtn");
  const $saveChangesBtn = $("#saveChangesBtn");

  auth.onAuthStateChanged(function (currentUser) {
    let profileUserId = new URLSearchParams(window.location.search).get("user");


    if (!profileUserId && currentUser) {
      profileUserId = currentUser.uid;
    }

    if (!profileUserId) {
      $("body").html("<h1>User profile not found. A user ID is required.</h1>");
      return;
    }

    const loggedInUserId = currentUser ? currentUser.uid : null;
    initializeProfile(profileUserId, loggedInUserId);
  });

  function initializeProfile(profileId, viewerId) {
    const isOwner = profileId === viewerId;
    const userRef = database.ref("users/" + profileId);

    if (isOwner) {
      $editProfileBtn.show();
    }

    $editProfileBtn.on("click", function () {
      $(this).hide();
      $saveChangesBtn.show();
      $descriptionDisplay.hide();
      $descriptionEditor.show().focus();
      $profileImage.addClass("editable");
      $profileImage.on("click", () => $fileInput.click());
    });

    $saveChangesBtn.on("click", function () {
      handleDescriptionSave(profileId); 
      $(this).hide();
      $editProfileBtn.show();
      $descriptionDisplay.show();
      $descriptionEditor.hide();
      $profileImage.removeClass("editable");
      $profileImage.off("click");
    });

    $fileInput.on("change", (event) => handleFileChange(event, profileId)); 

    userRef.on("value", (snapshot) => {
      const data = snapshot.val();
      if (!data) {
        $("body").html("<h1>User profile not found.</h1>");
        return;
      }
      const imageUrl =
        data.profilePicture?.imageUrl || "../imgs/blank_profile.jpg";
      $profileImage.attr("src", imageUrl);
      const description =
        data.description || "This user hasn't written a description yet.";
      $descriptionDisplay.text(description);
      if (isOwner) {
        $descriptionEditor.val(data.description || "");
      }
    });
  }

  function handleFileChange(event, profileUserId) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      database
        .ref("users/" + profileUserId + "/profilePicture")
        .set({ imageUrl: e.target.result })
        .then(() => alert("Profile picture updated!"))
        .catch((err) => console.error(err));
    };
    reader.readAsDataURL(file);
  }

  function handleDescriptionSave(profileUserId) {
    const newDescription = $descriptionEditor.val();
    database
      .ref("users/" + profileUserId + "/description")
      .set(newDescription)
      .then(() => alert("Description saved!"))
      .catch((err) => console.error(err));
  }
});
