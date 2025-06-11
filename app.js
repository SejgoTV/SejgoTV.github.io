// JavaScript code should be added here based on prior conversation.
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  query,
  orderBy
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDAqXYL5WthlWvjfDBc-NdZCu01ygkrom0",
  authDomain: "teknologi-a1c06.firebaseapp.com",
  projectId: "teknologi-a1c06",
  storageBucket: "teknologi-a1c06.appspot.com",
  messagingSenderId: "323792176035",
  appId: "1:323792176035:web:022e3cd61c3e6b5c909016"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Login
document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = e.target.elements[0].value;
  const password = e.target.elements[1].value;
  try {
    await signInWithEmailAndPassword(auth, email, password);
    closeAuthModal();
  } catch (err) {
    alert("Login fejl: " + err.message);
  }
});

// Signup
document.getElementById('signupForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = e.target.elements[0].value;
  const password = e.target.elements[1].value;
  try {
    await createUserWithEmailAndPassword(auth, email, password);
    closeAuthModal();
  } catch (err) {
    alert("Opret fejl: " + err.message);
  }
});

// Vis bruger
onAuthStateChanged(auth, async (user) => {
  const authBtns = document.querySelector('.auth-buttons');
  const userInfo = document.querySelector('.user-info');
  const userEmail = document.getElementById('userEmail');
  if (user) {
    authBtns.style.display = 'none';
    userInfo.style.display = 'block';
    userEmail.textContent = `Logget ind som: ${user.email}`;
    await renderCards();
  } else {
    authBtns.style.display = 'block';
    userInfo.style.display = 'none';
    document.getElementById('card-list').innerHTML = '';
  }
});

window.logout = async function () {
  await signOut(auth);
};

window.openModal = function () {
  if (auth.currentUser) {
    document.getElementById('modal').style.display = 'flex';
  } else {
    alert("Du skal være logget ind for at oprette opslag.");
  }
};

window.closeModal = function () {
  document.getElementById('modal').style.display = 'none';
};

window.closeAuthModal = function () {
  document.querySelectorAll('.modal').forEach(modal => modal.style.display = 'none');
};

window.openAuthModal = function (id) {
  document.getElementById(id).style.display = 'flex';
};

window.addPost = async function () {
  const user = auth.currentUser;
  if (!user) return alert("Login kræves.");
  const title = document.getElementById('title').value.trim();
  const desc = document.getElementById('description').value.trim();
  const price = document.getElementById('price').value.trim();
  const type = document.getElementById('materialType').value;
  const imageFile = document.getElementById('image').files[0];

  if (title && desc && price && imageFile) {
    const reader = new FileReader();
    reader.onload = async function (e) {
      await addDoc(collection(db, "posts"), {
        title, desc, price, type,
        img: e.target.result,
        userEmail: user.email,
        createdAt: Date.now()
      });
      closeModal();
      await renderCards();
    };
    reader.readAsDataURL(imageFile);
  } else {
    alert("Udfyld alle felter.");
  }
};

async function renderCards() {
  const container = document.getElementById('card-list');
  container.innerHTML = '';
  const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);
  snapshot.forEach(doc => {
    const card = doc.data();
    const div = document.createElement('div');
    div.className = 'card';
    div.innerHTML = `
      <h3>${card.title}</h3>
      <p><strong>Pris:</strong> ${card.price} DKK</p>
      <img src="${card.img}" alt="Billede" style="width:100%;border-radius:8px;"/>
      <p>${card.desc}</p>
      <p><em>Type: ${card.type}</em></p>
      <p style="font-size:11px;">Oprettet af: ${card.userEmail}</p>`;
    container.appendChild(div);
  });
}

document.getElementById('search').addEventListener('input', function () {
  const filter = this.value.toLowerCase();
  const cards = document.querySelectorAll('#card-list .card');
  cards.forEach(card => {
    const text = card.textContent.toLowerCase();
    card.style.display = text.includes(filter) ? 'block' : 'none';
  });
});
