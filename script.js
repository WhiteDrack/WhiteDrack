import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getDatabase, ref, set, get, onValue, remove, push, query, orderByChild, equalTo } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

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
let currentSeasonTotal = 0.00; // Local tracker for adding scores

// --- UTILS ---
function getSeasonID() {
    const now = new Date();
    return `season_${now.getFullYear()}_${now.getMonth() + 1}`;
}
function getSeasonInfo() {
    const now = new Date();
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const seasonName = `${monthNames[now.getMonth()]} ${now.getFullYear()}`;
    if(document.getElementById('seasonDisplay')) {
        document.getElementById('seasonDisplay').innerText = "Season: " + seasonName;
        document.getElementById('lbSeasonName').innerText = "Leaderboard for " + seasonName;
    }
    return { seasonID: getSeasonID() };
}

// --- AUTH & NAVIGATION ---
window.login = () => signInWithPopup(auth, provider);
window.logout = () => { closeMenu(); signOut(auth); };

onAuthStateChanged(auth, (user) => {
    if (user) {
        currentUser = user;
        document.getElementById('bottomNav').style.display = 'flex';
        document.getElementById('hamburgerBtn').style.display = 'flex'; // Show Menu Button
        loadUserData(user);
        navTo('jumpPage', document.querySelector('.nav-item'));
    } else {
        currentUser = null;
        document.getElementById('bottomNav').style.display = 'none';
        document.getElementById('hamburgerBtn').style.display = 'none'; // Hide Menu Button
        navTo('loginPage');
    }
});

window.navTo = (pageId, el) => {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById(pageId).classList.add('active');
    if(el) { document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active-nav')); el.classList.add('active-nav'); }
    if(pageId === 'leaderboardPage') loadLeaderboard();
};

// --- MENU FUNCTIONS ---
window.openMenu = () => {
    document.getElementById('sideMenu').classList.add('open');
    document.getElementById('sideMenuOverlay').style.display = 'block';
    if(currentUser) {
        document.getElementById('menuUserEmail').innerText = currentUser.displayName || "User";
    }
};
window.closeMenu = () => {
    document.getElementById('sideMenu').classList.remove('open');
    document.getElementById('sideMenuOverlay').style.display = 'none';
};

// --- NUMERIC ID LOGIC ---
async function getOrGeneratePublicID(user) {
    const idRef = ref(db, `users/${user.uid}/publicID`);
    const snap = await get(idRef);
    if (snap.exists()) {
        return snap.val();
    } else {
        const newID = Math.floor(10000000 + Math.random() * 90000000);
        await set(idRef, newID);
        return newID;
    }
}

// --- DATA LOADING & SCORING (CUMULATIVE) ---
async function loadUserData(user) {
    const season = getSeasonInfo().seasonID;
    const publicID = await getOrGeneratePublicID(user);
    
    document.getElementById('pUid').innerText = publicID;
    document.getElementById('pName').innerText = user.displayName;
    document.getElementById('pImg').src = user.photoURL;
    document.getElementById('menuUserId').innerText = publicID;

    // Listen for TOTAL SCORE updates
    onValue(ref(db, `${season}/users/${user.uid}/totalScore`), (s) => {
        if(s.exists()) {
            currentSeasonTotal = parseFloat(s.val());
        } else {
            currentSeasonTotal = 0.00;
        }
        
        // Update Displays
        const displayScore = currentSeasonTotal.toFixed(2) + "m";
        document.getElementById('pTotal').innerText = displayScore;
        if(document.getElementById('todayBest')) {
            document.getElementById('todayBest').innerText = displayScore;
        }
    });

    onValue(ref(db, `users/${user.uid}/awards`), (snap) => renderAwards(snap, 'awardsList'));
}

// CALL THIS TO SAVE A JUMP (ADDS TO TOTAL)
async function saveJumpData(jumpHeight) {
    if (!currentUser || jumpHeight < 0.05) return; // Ignore tiny movements

    const season = getSeasonInfo().seasonID;
    const newTotal = currentSeasonTotal + parseFloat(jumpHeight);

    try {
        await set(ref(db, `${season}/users/${currentUser.uid}`), {
            name: currentUser.displayName,
            photo: currentUser.photoURL,
            publicID: parseInt(document.getElementById('pUid').innerText),
            totalScore: newTotal // CUMULATIVE UPDATE
        });
        console.log(`Added ${jumpHeight}m. New Total: ${newTotal}`);
    } catch (e) { console.error("Save failed", e); }
}

// --- PHYSICS & JUMP DETECTION (FLIGHT TIME) ---
let isJumping = false;
let jumpStartTime = 0;

window.requestPermission = () => {
    if (typeof DeviceMotionEvent.requestPermission === 'function') {
        DeviceMotionEvent.requestPermission()
            .then(response => {
                if (response === 'granted') startSensor();
                else alert('Permission denied');
            })
            .catch(console.error);
    } else {
        startSensor();
    }
};

function startSensor() {
    document.getElementById('status').innerText = "DETECTING...";
    document.getElementById('startBtn').style.display = 'none';
    
    window.addEventListener('devicemotion', (event) => {
        const acc = Math.abs(event.accelerationIncludingGravity.z);
        
        // 1. FREEFALL DETECTION (Start Jump)
        if (acc < 2.0 && !isJumping) { 
            isJumping = true;
            jumpStartTime = Date.now();
            document.getElementById('status').innerText = "IN AIR!";
            document.getElementById('status').style.color = "#00ff88";
        }
        
        // 2. LANDING DETECTION (End Jump)
        if (acc > 15.0 && isJumping) { 
            const flightTime = (Date.now() - jumpStartTime) / 1000;
            
            // Limit fake long jumps (max 1.5 sec flight time)
            if (flightTime > 0.15 && flightTime < 1.5) {
                // Formula: h = 0.5 * g * (t/2)^2 => h = 1.226 * t^2
                const height = 1.226 * Math.pow(flightTime, 2);
                const heightM = height.toFixed(2);
                
                document.getElementById('height').innerText = heightM;
                saveJumpData(heightM); // Add to total
            }
            
            isJumping = false;
            document.getElementById('status').innerText = "READY";
            document.getElementById('status').style.color = "#e3b341";
        }
    });
}

// --- LEADERBOARD ---
async function loadLeaderboard() {
    const season = getSeasonInfo().seasonID;
    const list = document.getElementById('lbList');
    list.innerHTML = '<p style="color:#555">Loading...</p>';

    const q = query(ref(db, `${season}/users`), orderByChild('totalScore'));
    
    const snapshot = await get(q);
    if (!snapshot.exists()) {
        list.innerHTML = '<p style="color:#555">No players yet this season.</p>';
        return;
    }

    let players = [];
    snapshot.forEach(child => players.push(child.val()));
    players.reverse(); // Highest total first

    list.innerHTML = "";
    players.forEach((p, index) => {
        let rankColor = index === 0 ? '#ffd700' : index === 1 ? '#c0c0c0' : index === 2 ? '#cd7f32' : '#30363d';
        let txtColor = index < 3 ? '#000' : '#fff';
        
        list.innerHTML += `
        <div class="player-row" onclick="searchPlayerByID(${p.publicID})">
            <div class="rank-circle" style="background:${rankColor}; color:${txtColor}">${index + 1}</div>
            <div class="profile-img-container" style="margin:0 10px 0 0; margin-top:0;">
                 <img src="${p.photo}" style="width:35px; height:35px; border-radius:50%;">
            </div>
            <div class="player-info">
                <div class="player-name">${p.name}</div>
                <div style="font-size:10px; color:#8b949e;">ID: ${p.publicID}</div>
            </div>
            <div class="player-score">${parseFloat(p.totalScore).toFixed(2)}m</div>
        </div>`;
    });
}

// --- SEARCH & PROFILE VIEW ---
window.openSearchModal = () => { document.getElementById('searchModal').style.display = 'flex'; };
window.closeSearchModal = () => { document.getElementById('searchModal').style.display = 'none'; };
window.closePublicProfile = () => { document.getElementById('publicProfilePage').classList.remove('active'); };

window.searchPlayer = async () => {
    const id = document.getElementById('modalSearchInput').value;
    searchPlayerByID(id);
};

async function searchPlayerByID(publicID) {
    if(!publicID) return;
    closeSearchModal();
    
    const q = query(ref(db, 'users'), orderByChild('publicID'), equalTo(parseInt(publicID)));
    const snapshot = await get(q);
    
    if (snapshot.exists()) {
        const data = snapshot.val();
        const uid = Object.keys(data)[0];
        viewPlayer(uid);
    } else {
        alert("Player not found!");
    }
}

async function viewPlayer(targetUid) {
    const season = getSeasonInfo().seasonID;
    
    // Get Basic Info
    const userRef = ref(db, `users/${targetUid}`);
    const userSnap = await get(userRef);
    if(!userSnap.exists()) return;
    const userData = userSnap.val();

    // Get Season Score
    const scoreRef = ref(db, `${season}/users/${targetUid}/totalScore`);
    const scoreSnap = await get(scoreRef);
    const score = scoreSnap.exists() ? scoreSnap.val() : 0;

    // Fill UI
    document.getElementById('ppName').innerText = userData.displayName || "Player"; // Fallback name
    document.getElementById('ppUid').innerText = userData.publicID;
    document.getElementById('ppTotal').innerText = parseFloat(score).toFixed(2) + "m";
    
    // Attempt to load photo (might not be in 'users' root, check season data if missing)
    // For simplicity, we assume auth provided photo is stored or we use a placeholder
    // In a real app, you'd store the photoUrl in 'users/{uid}' upon login too.
    const seasonUserSnap = await get(ref(db, `${season}/users/${targetUid}`));
    if(seasonUserSnap.exists()) {
         document.getElementById('ppImg').src = seasonUserSnap.val().photo;
    }

    renderAwards(await get(ref(db, `users/${targetUid}/awards`)), 'ppAwardsList');
    
    document.getElementById('publicProfilePage').classList.add('active');
}

// --- AWARDS & MAIL (UNCHANGED UTILS) ---
function renderAwards(snap, listId) {
    const list = document.getElementById(listId);
    if(!snap.exists()) { list.innerHTML = `<p style="grid-column: span 3; color:#555; font-size:12px;">No trophies yet.</p>`; return; }
    list.innerHTML = "";
    Object.values(snap.val()).forEach(a => {
        if (a.isSpecial) {
            const s = a.specialData;
            list.innerHTML += `<div class="special-trophy-card ${s.style}"><i class="fas ${s.icon} special-icon"></i><div class="special-title">${s.name}</div></div>`;
        } else {
            let rank = parseInt(a.rank);
            let cls = rank===1?'rank-1':rank===2?'rank-2':rank===3?'rank-3':'rank-top';
            list.innerHTML += `<div class="award-card ${cls}"><i class="fas fa-trophy ${cls}"></i><div>#${rank}</div><div style="font-size:8px; color:#555;">${a.seasonName}</div></div>`;
        }
    });
}

// Mail logic remains same as previous steps (Inbox, Claim, etc.)
window.openMailbox = () => { document.getElementById('mailModal').style.display = 'flex'; fetchMail(); };
window.closeMailbox = () => { document.getElementById('mailModal').style.display = 'none'; };
function fetchMail() {
    if(!currentUser) return;
    onValue(ref(db, `users/${currentUser.uid}/inbox`), (snap) => {
        const list = document.getElementById('mailList');
        if(!snap.exists()) { list.innerHTML = '<p style="color:#555; text-align:center;">Empty.</p>'; document.getElementById('mailCount').style.display='none'; return; }
        let html = ""; let c = 0;
        Object.entries(snap.val()).forEach(([k, m]) => {
            c++;
            let btn = m.reward ? `<button onclick="claimReward('${k}', ${m.reward})" class="claim-btn">CLAIM +${m.reward}m</button>` : `<button onclick="deleteMail('${k}')" class="claim-btn" style="background:#30363d;">Dismiss</button>`;
            html += `<div class="mail-item"><div style="font-weight:bold; color:#00ff88;">${m.title}</div><div style="font-size:12px; color:#ccc;">${m.message}</div>${btn}</div>`;
        });
        list.innerHTML = html;
        document.getElementById('mailCount').innerText = c; document.getElementById('mailCount').style.display = 'flex';
    });
}
window.deleteMail = async (id) => { if(currentUser) await remove(ref(db, `users/${currentUser.uid}/inbox/${id}`)); };
window.claimReward = async (id, val) => {
    if(!currentUser) return;
    await saveJumpData(val); // Reuse the cumulative add function!
    await deleteMail(id);
    alert("Reward Claimed!");
};
