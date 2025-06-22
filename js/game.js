document.addEventListener('DOMContentLoaded', () => {
  const mapContainer = document.getElementById('map-container');
  const taiwanBoat  = document.getElementById('taiwan-boat');

  // 1. 初始化 Firebase
  const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "你的專案.firebaseapp.com",
    databaseURL: "https://你的專案-default-rtdb.firebaseio.com",
    projectId: "你的專案",
    storageBucket: "你的專案.appspot.com",
    messagingSenderId: "SENDER_ID",
    appId: "APP_ID"
  };
  firebase.initializeApp(firebaseConfig);
  const db = firebase.database();

  // 2. 初始位置變數
  let taiwanX = 80, taiwanY = 40;
  function updateTaiwanPosition() {
    taiwanBoat.style.left = taiwanX + '%';
    taiwanBoat.style.top  = taiwanY + '%';
  }

  // 3. 監聽資料庫位置更新
  db.ref('taiwanPosition').on('value', snap => {
    const pos = snap.val();
    taiwanX = pos.x; taiwanY = pos.y;
    updateTaiwanPosition();
    console.log('位置更新:', pos);
  });

  // 4. 點擊事件與投票
  mapContainer.addEventListener('click', event => {
    const rect = mapContainer.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const clickY = event.clientY - rect.top;

    const boatRect = taiwanBoat.getBoundingClientRect();
    const centerX = (boatRect.left + boatRect.right)/2 - rect.left;
    const centerY = (boatRect.top + boatRect.bottom)/2 - rect.top;

    let dirX = clickX - centerX, dirY = clickY - centerY;
    const len = Math.hypot(dirX, dirY);
    if (!len) return;
    dirX /= len; dirY /= len;

    // 本地即時回饋
    taiwanX += dirX*(1/mapContainer.offsetWidth*100);
    taiwanY += dirY*(1/mapContainer.offsetHeight*100);
    taiwanX = Math.max(0, Math.min(100, taiwanX));
    taiwanY = Math.max(0, Math.min(100, taiwanY));
    updateTaiwanPosition();

    // 寫入投票
    db.ref('votes').push({
      dirX, dirY,
      timestamp: firebase.database.ServerValue.TIMESTAMP
    });
    console.log('已發送投票:', {dirX, dirY});
  });
});
