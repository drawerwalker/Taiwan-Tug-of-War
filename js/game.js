import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js';
import {
  getDatabase,
  ref,
  onValue,
  push,
  serverTimestamp
} from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-database.js';

document.addEventListener('DOMContentLoaded', () => {
  const mapContainer = document.getElementById('map-container');
  const taiwanBoat = document.getElementById('taiwan-boat');
  let isPaddleUp = true;

  // 初始化 Firebase
  const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "你的專案.firebaseapp.com",
    databaseURL: "https://你的專案-default-rtdb.firebaseio.com",
    projectId: "你的專案",
    storageBucket: "你的專案.appspot.com",
    messagingSenderId: "SENDER_ID",
    appId: "APP_ID"
  };
  const app = initializeApp(firebaseConfig);
  const db = getDatabase(app);

  let taiwanX = 80, taiwanY = 40;
  function updateTaiwanPosition() {
    taiwanBoat.style.left = taiwanX + '%';
    taiwanBoat.style.top = taiwanY + '%';
  }

  const positionRef = ref(db, 'taiwanPosition');
  onValue(positionRef, snapshot => {
    const pos = snapshot.val();
    if (pos) {
      taiwanX = pos.x;
      taiwanY = pos.y;
      updateTaiwanPosition();
      console.log('位置更新:', pos);
    }
  });

  mapContainer.addEventListener('click', event => {
    const rect = mapContainer.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const clickY = event.clientY - rect.top;

    const boatRect = taiwanBoat.getBoundingClientRect();
    const centerX = (boatRect.left + boatRect.right) / 2 - rect.left;
    const centerY = (boatRect.top + boatRect.bottom) / 2 - rect.top;

    let dirX = clickX - centerX;
    let dirY = clickY - centerY;
    const len = Math.hypot(dirX, dirY);
    if (!len) return;

    dirX /= len;
    dirY /= len;

    // 移動百分比（視容器大小自適應）
    taiwanX += dirX * (1 / mapContainer.offsetWidth * 100);
    taiwanY += dirY * (1 / mapContainer.offsetHeight * 100);
    taiwanX = Math.max(0, Math.min(100, taiwanX));
    taiwanY = Math.max(0, Math.min(100, taiwanY));
    updateTaiwanPosition();

    // 槳狀態切換
    isPaddleUp = !isPaddleUp;
    taiwanBoat.src = isPaddleUp ? 'public/paddle_up.png' : 'public/paddle_down.png';

    // 寫入投票資料
    const votesRef = ref(db, 'votes');
    push(votesRef, {
      dirX,
      dirY,
      timestamp: serverTimestamp()
    });

    console.log('已發送投票:', { dirX, dirY });
  });
});
