import Api from "../utils/Api.js";
import enableValidation from "../scripts/validation.js";
import {
  disableBtn,
  resetValidation,
  settings,
} from "../scripts/validation.js";
import "./index.css";
import { renderLoading, handleSubmit } from "../utils/utils.js";

const api = new Api({
  baseUrl: "https://around-api.en.tripleten-services.com/v1",
  headers: {
    authorization: "31fad38a-37d4-4f40-8f40-c6d9eb302a1a",
    "Content-Type": "application/json",
  },
});

api
  .getAppInfo()
  .then(([cards, data]) => {
    cards.forEach(function (item) {
      const cardElement = getCardElement(item);
      cardsList.append(cardElement);
    });
    profileNameEl.textContent = data.name;
    profileDescriptionEl.textContent = data.about;
    profileAvatarEl.src = data.avatar;
  })
  .catch((err) => {
    console.error(err);
  });

// Edit Profile Elements
const editProfileBtn = document.querySelector(".profile__edit-btn");
const editProfileModal = document.querySelector("#edit-profile-modal");
const editProfileCloseBtn = editProfileModal.querySelector(".modal__close-btn");
const editProfileForm = editProfileModal.querySelector(".modal__form");
const editProfileNameInput = editProfileModal.querySelector(
  "#profile-name-input"
);
const editProfileDescriptionInput = editProfileModal.querySelector(
  "#profile-description-input"
);
const submitProfileBtn = document.querySelector(".modal__submit-profile");

// Base Profile Elements
const profileNameEl = document.querySelector(".profile__name");
const profileDescriptionEl = document.querySelector(".profile__description");
const profileAvatarEl = document.querySelector(".profile__avatar");

// Edit Avatar Elements
const avatarModalBtn = document.querySelector(".profile__avatar-btn");
const avatarModal = document.querySelector("#avatar-modal");
const avatarForm = avatarModal.querySelector(".modal__form");
const avatarSubmitBtn = avatarModal.querySelector(".modal__submit-btn");
const avatarModalCloseBtn = avatarModal.querySelector(".modal__close-btn");
const avatarInput = avatarModal.querySelector("#profile-avatar-input");

// Preview Image Elements
const previewModal = document.querySelector("#preview-modal");
const previewModalCloseBtn = previewModal.querySelector(
  ".modal__close-btn_type_preview"
);
const previewImageEl = previewModal.querySelector(".modal__image");
const previewCaptionEl = previewModal.querySelector(".modal__caption");

// New Post Elements
const newPostModal = document.querySelector("#new-post-modal");
const newPostForm = newPostModal.querySelector(".modal__form");
const newPostNameInput = newPostForm.querySelector("#card-caption-input");
const newPostLinkInput = newPostForm.querySelector("#card-image-input");
const newPostBtn = document.querySelector(".profile__add-btn");
const newPostCloseBtn = newPostModal.querySelector(".modal__close-btn");
const submitPostBtn = document.querySelector(".modal__submit-post");

// Delete Post Elements
const deleteModal = document.querySelector("#delete-modal");
const deleteForm = document.querySelector(".modal__delete-form");
const deleteBtn = document.querySelector(".modal__delete-close-btn");
const deleteBtnCancel = document.querySelector(".modal__cancel-btn");

// Card Elements
const cardTemplate = document
  .querySelector("#card-template")
  .content.querySelector(".card");
const cardsList = document.querySelector(".cards__list");
const modalList = document.querySelectorAll(".modal");

let selectedCard, selectedCardId;

// Card Functions
function getCardElement(data) {
  const cardElement = cardTemplate.cloneNode(true);
  const cardTitleEl = cardElement.querySelector(".card__title");
  const cardImageEl = cardElement.querySelector(".card__image");
  const cardLikeBtnEl = cardElement.querySelector(".card__like-btn");
  const cardDeleteBtnEl = cardElement.querySelector(".card__delete-btn");

  cardImageEl.src = data.link;
  cardImageEl.alt = data.name;
  cardTitleEl.textContent = data.name;

  cardLikeBtnEl.addEventListener("click", (evt) => handleLike(evt, data._id));

  if (data.isLiked == true) {
    cardLikeBtnEl.classList.add("card__like-btn_active");
  }

  cardDeleteBtnEl.addEventListener("click", () =>
    handleDeleteCard(cardElement, data._id)
  );

  cardImageEl.addEventListener("click", () => {
    previewImageEl.src = data.link;
    previewImageEl.alt = data.name;
    previewCaptionEl.textContent = data.name;
    openModal(previewModal);
  });

  return cardElement;
}

function openModal(modal) {
  modal.classList.add("modal_is-opened");
  document.addEventListener("keydown", handleEscape);
}

function closeModal(modal) {
  modal.classList.remove("modal_is-opened");
  document.removeEventListener("keydown", handleEscape);
}

modalList.forEach((modal) => {
  modal.addEventListener("click", (evt) => {
    if (evt.target.classList.contains("modal")) {
      closeModal(modal);
    }
  });
});

previewModalCloseBtn.addEventListener("click", function () {
  closeModal(previewModal);
});

function handleLike(evt, id) {
  const isLiked = evt.target.classList.contains("card__like-btn_active");
  api
    .changeLikeStatus(id, isLiked)
    .then(() => {
      evt.target.classList.toggle("card__like-btn_active");
    })
    .catch(console.error);
}

function handleEscape(evt) {
  if (evt.key === "Escape") {
    const openedPopup = document.querySelector(".modal_is-opened");
    closeModal(openedPopup);
  }
}

// Card Add
function handleAddCardSubmit(evt) {
  evt.preventDefault();

  renderLoading(true, submitPostBtn);

  const inputValues = {
    name: newPostNameInput.value,
    link: newPostLinkInput.value,
  };

  api
    .addNewCard(inputValues)
    .then((data) => {
      const cardElement = getCardElement(data);
      cardsList.prepend(cardElement);

      newPostForm.reset();
      disableBtn(submitPostBtn, settings);
      closeModal(newPostModal);
    })
    .catch(console.error)
    .finally(() => {
      renderLoading(false, submitPostBtn);
    });
}

newPostBtn.addEventListener("click", function () {
  openModal(newPostModal);
});

newPostCloseBtn.addEventListener("click", function () {
  closeModal(newPostModal);
});

newPostForm.addEventListener("submit", handleAddCardSubmit);

// Card Delete
function handleDeleteCard(cardElement, cardId) {
  selectedCard = cardElement;
  selectedCardId = cardId;
  openModal(deleteModal);
}

function handleDeleteSubmit(evt) {
  function makeRequest() {
    return api.deleteCard(selectedCardId).then(() => {
      closeModal(deleteModal);
      selectedCard.remove();
    });
  }

  handleSubmit(makeRequest, evt, "Delete", "Deleting...");
}

deleteBtn.addEventListener("click", function () {
  closeModal(deleteModal);
});

deleteBtnCancel.addEventListener("click", function () {
  closeModal(deleteModal);
});

deleteForm.addEventListener("submit", handleDeleteSubmit);

// Edit Profile
function handleEditProfileSubmit(evt) {
  function makeRequest() {
    return api
      .editUserInfo({
        name: editProfileNameInput.value,
        about: editProfileDescriptionInput.value,
      })
      .then((data) => {
        profileNameEl.textContent = data.name;
        profileDescriptionEl.textContent = data.about;
        disableBtn(submitProfileBtn, settings);
        closeModal(editProfileModal);
      });
  }
  handleSubmit(makeRequest, evt);
}

editProfileBtn.addEventListener("click", function () {
  openModal(editProfileModal);
  editProfileNameInput.value = profileNameEl.textContent;
  editProfileDescriptionInput.value = profileDescriptionEl.textContent;

  resetValidation(editProfileForm, settings);
});

editProfileCloseBtn.addEventListener("click", function () {
  closeModal(editProfileModal);
});

editProfileForm.addEventListener("submit", handleEditProfileSubmit);

// Edit Avatar
function handleAvatarSubmit(evt) {
  function makeRequest() {
    return api.editAvatarInfo(avatarInput.value).then((data) => {
      profileAvatarEl.src = data.avatar;
      disableBtn(avatarSubmitBtn, settings);
      closeModal(avatarModal);
      avatarForm.reset();
    });
  }
  handleSubmit(makeRequest, evt);
}

avatarModalBtn.addEventListener("click", () => {
  openModal(avatarModal);
});

avatarModalCloseBtn.addEventListener("click", () => {
  closeModal(avatarModal);
});

avatarForm.addEventListener("submit", handleAvatarSubmit);

//END

enableValidation(settings);
