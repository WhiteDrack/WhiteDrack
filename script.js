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
let seasonBestScore = 0; // "Today Score" की जगह अब "Season Best" है

function getSeasonID() {
    const now = new Date();
    // सीजन हर महीने बदल जाएगा (जैसे: season_2025_12 -> season_2026_1)
    return `season_${now.getFullYear()}_${now.getMonth() + 1}`;
}

function getSeasonInfo() {
    const now = new Date(); const d = now.getDate();
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const seasonName = `${monthNames[now.getMonth()]} ${now.getFullYear()}`;
    
    if(document.getElementById('seasonDisplay')) {
        document.getElementById('seasonDisplay').innerText = "Season: " + seasonName;
        document.getElementById('lbSeasonName').innerText = "Leaderboard for " + seasonName;
    }

    let round = 1; if (d > 7) round = 2; if (d > 14) round = 3; if (d > 21) round = 4; if (d > 28) round = "FINAL";
    
    return { 
        text: round === "FINAL" ? "Finalizing..." : `Round ${round}`, 
        seasonID: getSeasonID()
    };
}

if(document.getElementById('roundDisplay')) {
    document.getElementById('roundDisplay').innerText = getSeasonInfo().text;
}

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

window.viewPlayer = (uid) => {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById('publicProfilePage').classList.add('active');
    
    document.getElementById('ppName').innerText = "Loading...";
    document.getElementById('ppUid').innerText = uid;
    document.getElementById('ppTotal').innerText = "...";
    document.getElementById('ppImg').src = "https://via.placeholder.com/80";
    document.getElementById('ppAwardsList').innerHTML = '<p style="grid-column: span 2; color:#555;">Loading...</p>';

    const season = getSeasonInfo().seasonID;

    onValue(ref(db, `${season}/users/${uid}`), (snap) => {
        if(snap.exists()) {
            const u = snap.val();
            document.getElementById('ppName').innerText = u.name;
            document.getElementById('ppImg').src = u.photo || "https://via.placeholder.com/80";
            // totalScore अब Highest Jump ही है
            document.getElementById('ppTotal').innerText = parseFloat(u.totalScore || 0).toFixed(2) + "m";
        } else {
            document.getElementById('ppName').innerText = "Unknown Player";
            document.getElementById('ppTotal').innerText = "0.00m";
        }
    }, {onlyOnce: true});

    onValue(ref(db, `users/${uid}/awards`), (snap) => {
        const list = document.getElementById('ppAwardsList');
        if(!snap.exists()) { list.innerHTML = `<p style="grid-column: span 2; color:#555; text-align:center;">No trophies yet.</p>`; return; }
        list.innerHTML = "";
        snap.forEach(c => {
            const a = c.val(); let rank = parseInt(a.rank);
            let cls = rank===1?'rank-1':rank===2?'rank-2':rank===3?'rank-3':'rank-top';
            let icn = rank<=3?'fa-trophy':'fa-medal';
            list.innerHTML += `<div class="award-card ${cls}"><i class="fas ${icn} ${cls}" style="font-size:24px;"></i><div style="font-weight:bold; color:#fff;">#${rank}</div><div style="font-size:10px; color:#888;">${a.seasonName}</div></div>`;
        });
    }, {onlyOnce: true});
};

window.closePublicProfile = () => {
    navTo('leaderboardPage');
    document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active-nav'));
    document.querySelectorAll('.nav-item')[1].classList.add('active-nav');
};

function loadUserData(user) {
    const season = getSeasonInfo().seasonID;

    document.getElementById('pName').innerText = user.displayName;
    document.getElementById('pImg').src = user.photoURL;
    document.getElementById('pUid').innerText = user.uid;
    
    // UI Label Update: "Today's Best" को बदलकर "Season Best" कर देते हैं
    const bestLabel = document.getElementById('todayBest').previousElementSibling;
    if(bestLabel) bestLabel.innerText = "SEASON BEST";

    // सिर्फ User नोड को सुनना है (Daily नोड को हटा दिया गया है)
    onValue(ref(db, `${season}/users/${user.uid}/totalScore`), (s) => {
        // अगर डेटा है तो वही स्कोर है, वरना 0
        seasonBestScore = s.exists() ? parseFloat(s.val()) : 0;
        
        // UI अपडेट करें
        document.getElementById('pTotal').innerText = seasonBestScore.toFixed(2) + "m";
        document.getElementById('todayBest').innerText = seasonBestScore.toFixed(2) + "m";
    });

    // Awards Listener (Same as before)
    onValue(ref(db, `users/${user.uid}/awards`), (snap) => {
        const list = document.getElementById('awardsList');
        if(!snap.exists()) { list.innerHTML = `<p style="grid-column: span 2; color:#555; text-align:center;">No trophies yet.</p>`; return; }
        list.innerHTML = "";
        snap.forEach(c => {
            const a = c.val(); let rank = parseInt(a.rank);
            let cls = rank===1?'rank-1':rank===2?'rank-2':rank===3?'rank-3':'rank-top';
            let icn = rank<=3?'fa-trophy':'fa-medal';
            list.innerHTML += `<div class="award-card ${cls}"><i class="fas ${icn} ${cls}" style="font-size:24px;"></i><div style="font-weight:bold; color:#fff;">#${rank}</div><div style="font-size:10px; color:#888;">${a.seasonName}</div></div>`;
        });
    });
}

async function handleJump(height) {
    if(!currentUser) return;
    
    const info = getSeasonInfo();
    const season = info.seasonID;

    // सिर्फ तब सेव करें जब नई ऊंचाई पुरानी 'seasonBestScore' से ज्यादा हो
    if (height > seasonBestScore) {
        seasonBestScore = height;
        
        // UI अपडेट
        document.getElementById('todayBest').innerText = height.toFixed(2) + "m";
        document.getElementById('pTotal').innerText = height.toFixed(2) + "m";

        try {
            // डायरेक्ट User के स्कोर को अपडेट करें (Daily का चक्कर खत्म)
            // totalScore ही अब Highest Score है
            await set(ref(db, `${season}/users/${currentUser.uid}`), {
                name: currentUser.displayName, 
                photo: currentUser.photoURL, 
                totalScore: height 
            });
            
            console.log("New Season Record Saved: " + height);

        } catch (error) {
            console.error("Save Failed:", error);
        }
    }
}

function loadLeaderboard() {
    const lbList = document.getElementById('lbList');
    lbList.innerHTML = "<p style='text-align:center; color:#888; margin-top:20px;'>Loading Season Data...</p>";
    
    const season = getSeasonInfo().seasonID;
    const dbRef = ref(db, `${season}/users`);
    
    onValue(dbRef, (snapshot) => {
        if (!snapshot.exists()) {
            lbList.innerHTML = "<p style='text-align:center; margin-top:20px;'>No Players Yet</p>";
            return;
        }
        
        let players = [];
        snapshot.forEach(child => {
            const data = child.val();
            if(data.totalScore) {
                players.push({ ...data, uid: child.key });
            }
        });

        // जो सबसे ऊंचा कूदा है वो सबसे ऊपर (Highest First)
        players.sort((a, b) => parseFloat(b.totalScore) - parseFloat(a.totalScore));

        let allHtml = "";
        players.slice(0, 50).forEach((p, i) => {
            let rankStyle = "";
            let rankColor = "var(--primary)";
            
            if(i === 0) { rankStyle = "color:#ffd700; border:1px solid #ffd700; box-shadow: 0 0 5px rgba(255,215,0,0.3);"; rankColor="#ffd700"; }
            else if(i === 1) { rankStyle = "color:#c0c0c0; border:1px solid #c0c0c0;"; rankColor="#c0c0c0"; }
            else if(i === 2) { rankStyle = "color:#cd7f32; border:1px solid #cd7f32;"; rankColor="#cd7f32"; }

            let name = p.name ? p.name.split(' ')[0] : 'Unknown';
            let score = parseFloat(p.totalScore).toFixed(2);
            
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
                handleJump(h);
            }
            isFreeFalling = false; document.getElementById('status').innerText = "READY";
        }
    });
}

