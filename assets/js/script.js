import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import {
  getDatabase,
  ref,
  push,
  set,
  onValue,
  update,
  remove,
  onChildAdded,
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";

import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
const firebaseConfig = {
  apiKey: "AIzaSyAkGJ82UHVibX0oVZl_Fm3kuasw4s16PQ8",
  authDomain: "my-first-project-1ace2.firebaseapp.com",
  databaseURL: "https://my-first-project-1ace2-default-rtdb.firebaseio.com",
  projectId: "my-first-project-1ace2",
  storageBucket: "my-first-project-1ace2.firebasestorage.app",
  messagingSenderId: "14978118408",
  appId: "1:14978118408:web:83d76f43460e94693832bd",
};

const app = initializeApp(firebaseConfig);
const db = getDatabase();
const auth = getAuth(app);
const user = auth.currentUser;
const suggestsRef = ref(db, "suggestions");
const roomChatRef = ref(db, "roomChat");
// Hiển thị thông báo
const showAlert = (content, time = 3000, type = "alert--success") => {
  if (content) {
    const newAlert = document.createElement("div");
    newAlert.setAttribute("class", `alert ${type}`);
    newAlert.innerHTML = `
        <span class="alert__content">${content}</span>
        <span class="alert__close">
          <i class="fa-solid fa-xmark"></i>
        </span>
      `;

    const alertList = document.querySelector(".alert-list");
    alertList.appendChild(newAlert);
    const alertClose = document.querySelector(".alert__close");

    alertClose.addEventListener("click", () => {
      alertList.removeChild(newAlert);
    });

    setTimeout(() => {
      alertList.removeChild(newAlert);
    }, time);
  }
};
// Hết Hiển thị thông báo

// Kiểm tra trạng thái đăng nhập
const buttonLogin = document.querySelector("[button-login]");
const buttonRegister = document.querySelector("[button-register]");
const buttonLogout = document.querySelector("[button-logout]");
const chat = document.querySelector("[chat]");
const suggest = document.querySelector("[suggest]");
onAuthStateChanged(auth, (user) => {
  if (user) {
    buttonLogout.style.display = "inline";
    chat.style.display = "block";
    suggest.style.display = "block";
  } else {
    buttonLogin.style.display = "inline-block";
    buttonRegister.style.display = "inline-block";
    if (chat) {
      chat.innerHTML = `<i>Vui lòng đăng nhập để sử dụng.</i>`;
    }
    if (suggest) {
      suggest.innerHTML = `<i>Vui lòng đăng nhập để sử dụng.</i>`;
    }
  }
});
// Kiểm tra trạng thái đăng nhập

// Trang đăng ký
const formRegister = document.querySelector("#form-register");
if (formRegister) {
  formRegister.addEventListener("submit", (event) => {
    event.preventDefault();
    const fullName = formRegister.fullName.value;
    const email = formRegister.email.value;
    const password = formRegister.password.value;

    if (fullName && password && email) {
      createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
          const user = userCredential.user;
          if (user) {
            set(ref(db, `users/${user.uid}`), {
              fullName: fullName,
            }).then(() => {
              window.location.href = "chatPage.html";
            });
          }
        })
        .catch((error) => {
          const errorCode = error.code;
          const errorMessage = error.message;
          showAlert("Tài khoản đã tồn tại", 5000, "alert--error");
        });
    }
  });
}
// Trang đăng ký

// Trang đăng nhập
const formLogin = document.querySelector("#form-login");
if (formLogin) {
  formLogin.addEventListener("submit", (event) => {
    event.preventDefault();

    const email = formLogin.email.value;
    const password = formLogin.password.value;

    if (email && password) {
      signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
          // Signed in
          const user = userCredential.user;
          if (user) {
            window.location.href = "chatPage.html";
          }
        })
        .catch((error) => {
          const errorCode = error.code;
          const errorMessage = error.message;
          showAlert(
            "Email hoặc tài khoản không chính xác",
            5000,
            "alert--error"
          );
        });
    }
  });
}
// Trang đăng nhập

// Trang Góp Ý
const formSuggest = document.querySelector("#form-suggest");
if (formSuggest) {
  formSuggest.addEventListener("submit", (event) => {
    event.preventDefault();

    const suggestion = formSuggest.suggestion.value;
    const name = formSuggest.fullName.value;

    console.log(suggestion);
    console.log(name);
    if (suggestion && name) {
      const suggest = {
        name: name,
        suggestion: suggestion,
      };

      const newSuggestsRef = push(suggestsRef);
      set(newSuggestsRef, suggest).then(() => {
        showAlert("Góp ý thành công", 3000);
      });

      formSuggest.suggestion.value = "";
      formSuggest.fullName.value = "";
    }
  });
}
// Trang Góp Ý

// button-login-google
const buttonLoginGoogle = document.querySelector("[button-login-google]");
if (buttonLoginGoogle) {
  buttonLoginGoogle.addEventListener("click", () => {
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider)
      .then((result) => {
        const user = result.user;
        if (user) {
          set(ref(db, `users/${user.uid}`), {
            fullName: user.displayName,
          }).then(() => {
            window.location.href = "index.html";
          });
        }
        // Đăng nhập thành công
        // window.location.href = "index.html";
      })
      .catch((error) => {
        //  Đăng nhập thất bại
        showAlert("Thông tin đăng nhập không chính xác", 5000, "alert--error");
      });
  });
}
// button-login-google

// Tính năng đăng xuất
if (buttonLogout) {
  buttonLogout.addEventListener("click", () => {
    signOut(auth)
      .then(() => {
        // Sign-out successful.
        window.location.href = "index.html";
      })
      .catch((error) => {
        // An error happened.
      });
  });
}
// Tính năng đăng xuất

// Form chat
const formChat = document.querySelector("[chat] .inner-form");
if (formChat) {
  formChat.addEventListener("submit", (event) => {
    event.preventDefault();

    const content = formChat.content.value;
    const uid = auth.currentUser.uid;

    if (content && uid) {
      set(push(ref(db, `roomchat/${uid}/chats`)), {
        content: content,
      });
      onValue(ref(db, "App"), (items) => {
        items.forEach((item) => {
          const key = item.key;
          const matches = content.split(/\s*,\s*/);
          matches.forEach((content) => {
            if (key === content) {
              onValue(ref(db, "/App/" + `${key}`), (item) => {
                const data = item.val();
                data.forEach((item) => {
                  set(push(ref(db, `roomchat/${uid}/chats`)), {
                    image: item.image,
                    link: item.link,
                    title: item.title,
                  });
                });
              });
            }
          });
        });
      });
      formChat.content.value = "";
    }
  });
}

// Form chat

// Hiển thị tin nhắn mặc định
const chatBody = document.querySelector("[chat] .inner-body");
if (chatBody) {
  onAuthStateChanged(auth, (user) => {
    if (user) {
      const uid = user.uid;
      const chatRef = ref(db, `roomchat/${uid}/chats`);
      onChildAdded(chatRef, (data) => {
        const key = data.key;
        const content = data.val().content;
        const image = data.val().image;
        const link = data.val().link;
        const title = data.val().title;
        if (content) {
          const newChat = document.createElement("div");
          newChat.classList.add("inner-sending");
          newChat.innerHTML = `
          <div class="inner-content">${content}</div>
        `;
          chatBody.appendChild(newChat);
        }
        if (image && link && title) {
          const newReply = document.createElement("div");
          newReply.classList.add("inner-receiving");
          newReply.innerHTML = `
                      <div class="inner-logo">
                        <img src="./assets/img/logo.png" alt="NHONG NHACH" />
                      </div>
                      <div class="inner-content">
                        <div class="inner-blog">
                          <div class="inner-image">
                            <img
                              src= ${image}
                              alt=""
                            />
                          </div>
                        <div class="inner-title">
                          <h3><a href=${link} target="_blank">${title}</a></h3>
                        </div>
                      </div>
                    </div>
                    `;
          chatBody.appendChild(newReply);
        }
      });
    } else {
      console.log("No user is logged in.");
    }
  });
}
// Hiển thị tin nhắn mặc định
  