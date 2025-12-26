import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getDatabase, ref, set, get, onValue } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyDOPErXM1g4vdmiVdau67U7vGRsmbtMMhE",
    authDomain: "white-drack-fd1ee.firebaseapp.com",
    databaseURL: "https://white-drack-fd1ee-default-rtdb.firebaseio.com",
    projectId: "white-drack-fd1ee",
    storageBucket: "white-drack-fd1ee.firebasestorage.app",
    messagingSenderId: "151227903888",
    appId: "1:151227903888:web:02a2d7ab14f7d1e152cd15"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);
const provider = new GoogleAuthProvider();

let currentUser = null; 
let currentSeasonBest = 0; // सिर्फ एक वेरिएबल जो हाईएस्ट जंप याद रखेगा

function getSeasonID() {
    const now = new Date();
    // सीजन ID में महीना और साल है। महीना बदलते ही ID बदल जाएगी और डेटा रिफ्रेश हो जाएगा।
    return `season_${now.getFullYear()}_${now.getMonth() + 1}`;
}

function getSeasonInfo() {
    const now = new Date();
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const seasonName = `${monthNames[now.getMonth()]} ${now.getFullYear()}`;
    
    if(document.getElementById('seasonDisplay')) {
        document.getElementById('seasonDisplay').innerText = "Season: " + seasonName;
        document.getElementById('lbSeasonName').innerText = "Top Jumps of " + seasonName;
    }
    return { seasonID: getSeasonID() };
}
getSeasonInfo();

window.login = () => signInWithPopup(auth, provider);
window.logout = () => signOut(auth);

onAuthStateChanged(auth, (user) => {
    if (user) {
        currentUser = user;
        document.getElementById('bottomNav').style.display = 'flex';
        loadUserData(user);
        navTo('jumpPage', document.querySelector('.nav-item'));
    } else {
        document.getElementById('bottomNav').style.display = 'none';
        navTo('loginPage');
    }
});

window.navTo = (pageId, el) => {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById(pageId).classList.add('active');
    if(el) { document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active-nav')); el.classList.add('active-nav'); }
    if(pageId === 'leaderboardPage') loadLeaderboard();
};

// --- Profile Load Logic ---
function loadUserData(user) {
    const season = getSeasonInfo().seasonID;

    document.getElementById('pName').innerText = user.displayName;
    document.getElementById('pImg').src = user.photoURL;
    document.getElementById('pUid').innerText = user.uid;
    
    // अब हम सिर्फ highScore सुन रहे हैं (Daily का कोई काम नहीं)
    onValue(ref(db, `${season}/users/${user.uid}/highScore`), (s) => {
        if(s.exists()) {
            currentSeasonBest = parseFloat(s.val());
        } else {
            currentSeasonBest = 0;
        }
        // UI Update
        document.getElementById('seasonBestDisplay').innerText = currentSeasonBest.toFixed(2) + "m";
        document.getElementById('pTotal').innerText = currentSeasonBest.toFixed(2) + "m";
    });
}

// --- MAIN LOGIC: Handle Highest Jump ---
async function handleJump(height) {
    if(!currentUser) return;
    const season = getSeasonInfo().seasonID;

    // सिर्फ तभी सेव करें अगर यह जंप पिछले रिकॉर्ड से ज़्यादा है
    if (height > currentSeasonBest) {
        currentSeasonBest = height;
        
        // UI अपडेट (ताकि यूज़र को तुरंत दिखे)
        document.getElementById('seasonBestDisplay').innerText = height.toFixed(2) + "m";
        document.getElementById('pTotal').innerText = height.toFixed(2) + "m";
        
        // Firebase में अपडेट (केवल High Score)
        await set(ref(db, `${season}/users/${currentUser.uid}`), {
            name: currentUser.displayName, 
            photo: currentUser.photoURL, 
            highScore: height  // यहाँ अब totalScore नहीं, highScore है
        });
    }
}

// --- Leaderboard Logic ---
function loadLeaderboard() {
    const lbList = document.getElementById('lbList');
    lbList.innerHTML = "<p style='text-align:center; color:#888; margin-top:20px;'>Loading Season Data...</p>";
    
    const season = getSeasonInfo().seasonID;
    const dbRef = ref(db, `${season}/users`);
    
    onValue(dbRef, (snapshot) => {
        if (!snapshot.exists()) {
            lbList.innerHTML = "<p style='text-align:center; margin-top:20px;'>New Season - No Records Yet</p>";
            return;
        }
        
        let players = [];
        snapshot.forEach(child => {
            const data = child.val();
            // हम अब highScore चेक कर रहे हैं
            if(data.highScore) {
                players.push({ ...data, uid: child.key });
            }
        });

        // सबसे बड़े स्कोर को ऊपर रखें
        players.sort((a, b) => parseFloat(b.highScore) - parseFloat(a.highScore));

        let allHtml = "";
        players.slice(0, 50).forEach((p, i) => {
            let rankStyle = "";
            let rankColor = "var(--primary)";
            
            if(i === 0) { rankStyle = "color:#ffd700; border:1px solid #ffd700; box-shadow: 0 0 5px rgba(255,215,0,0.3);"; rankColor="#ffd700"; }
            else if(i === 1) { rankStyle = "color:#c0c0c0; border:1px solid #c0c0c0;"; rankColor="#c0c0c0"; }
            else if(i === 2) { rankStyle = "color:#cd7f32; border:1px solid #cd7f32;"; rankColor="#cd7f32"; }

            let name = p.name ? p.name.split(' ')[0] : 'Unknown';
            let score = parseFloat(p.highScore).toFixed(2);
            
            allHtml += `
                <div class="player-row" onclick="viewPlayer('${p.uid}')">
                    <div class="rank-circle" style="${rankStyle}">${i+1}</div>
                    <div class="player-info">
                        <span class="player-name">${name}</span>
                    </div>
                    <div class="player-score" style="color:${rankColor}">${score}m</div>
                </div>`;
        });
        
        lbList.innerHTML = allHtml;

    }, (error) => {
        console.error(error);
        lbList.innerHTML = `<p style='color:red;'>Error: ${error.message}</p>`;
    });
}

// --- Public Profile Viewer ---
window.viewPlayer = (uid) => {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById('publicProfilePage').classList.add('active');
    
    document.getElementById('ppName').innerText = "Loading...";
    document.getElementById('ppUid').innerText = uid;
    document.getElementById('ppTotal').innerText = "...";
    document.getElementById('ppImg').src = "https://via.placeholder.com/80";

    const season = getSeasonInfo().seasonID;

    onValue(ref(db, `${season}/users/${uid}`), (snap) => {
        if(snap.exists()) {
            const u = snap.val();
            document.getElementById('ppName').innerText = u.name;
            document.getElementById('ppImg').src = u.photo || "https://via.placeholder.com/80";
            // High Score दिखाएं
            document.getElementById('ppTotal').innerText = parseFloat(u.highScore || 0).toFixed(2) + "m";
        } else {
            document.getElementById('ppName').innerText = "Unknown Player";
            document.getElementById('ppTotal').innerText = "0.00m";
        }
    }, {onlyOnce: true});
};

window.closePublicProfile = () => {
    navTo('leaderboardPage');
    document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active-nav'));
    document.querySelectorAll('.nav-item')[1].classList.add('active-nav');
};

// --- Sensor Logic (Same as before) ---
let isFreeFalling = false; let startTime = 0; let lastAcc = 9.8;
document.getElementById('startBtn').onclick = function() {
    if (typeof DeviceMotionEvent.requestPermission === 'function') { DeviceMotionEvent.requestPermission().then(s => { if(s=='granted') start(); }); } else { start(); }
    this.innerText = "SENSOR ACTIVE"; this.disabled = true; this.style.background = "#238636";
};
function start() {
    window.addEventListener('devicemotion', (e) => {
        let acc = e.accelerationIncludingGravity; if(!acc || !acc.x) return;
        let raw = Math.sqrt(acc.x**2 + acc.y**2 + acc.z**2);
        lastAcc = (lastAcc * 0.7) + (raw * 0.3);
        let now = performance.now();
        if(lastAcc < 2.5 && !isFreeFalling) { isFreeFalling = true; startTime = now; document.getElementById('status').innerText = "AIRBORNE"; }
        if(isFreeFalling && lastAcc > 14) {
            let d = (now - startTime)/1000;
            if(d > 0.2 && d < 2.5) {
                let h = 0.125 * 9.81 * (d**2);
                document.getElementById('height').innerText = h.toFixed(2);
                handleJump(h); // Send to Logic
            }
            isFreeFalling = false; document.getElementById('status').innerText = "READY";
        }
    });
}
