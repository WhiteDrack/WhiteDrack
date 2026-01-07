import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getDatabase, ref, set, get, onValue, remove, push, query, orderByChild, equalTo, runTransaction, update } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

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
let currentTotalScore = 0;

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
if(document.getElementById('roundDisplay')) document.getElementById('roundDisplay').innerText = "Compete for Glory";

// --- AUTH ---
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

// --- NAVIGATION ---
window.navTo = (pageId, el) => {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById(pageId).classList.add('active');
    if(el) { document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active-nav')); el.classList.add('active-nav'); }
    if(pageId === 'leaderboardPage') loadLeaderboard();
};

window.openSearchModal = () => { document.getElementById('searchModal').style.display = 'flex'; };
window.closeSearchModal = () => { document.getElementById('searchModal').style.display = 'none'; };
window.openMailbox = () => { document.getElementById('mailModal').style.display = 'flex'; fetchMail(); };
window.closeMailbox = () => { document.getElementById('mailModal').style.display = 'none'; };

// --- ID & PROFILE MANAGEMENT ---
async function manageUserProfile(user) {
    // 1. Get/Generate Numeric ID
    const idRef = ref(db, `users/${user.uid}/publicID`);
    let snap = await get(idRef);
    let publicID;
    
    if (snap.exists()) {
        publicID = snap.val();
    } else {
        publicID = Math.floor(10000000 + Math.random() * 90000000);
        await set(idRef, publicID);
    }

    // 2. Save Permanent Profile (NAME & PHOTO Fix for Search)
    // We update this every login to ensure fresh data
    await update(ref(db, `users/${user.uid}/profile`), {
        name: user.displayName,
        photo: user.photoURL,
        uid: user.uid,
        publicID: publicID
    });

    return publicID;
}

// --- SEARCH LOGIC (FIXED) ---
window.searchPlayer = async () => {
    const inputVal = document.getElementById('modalSearchInput').value.trim();
    if(!inputVal) { alert("Please enter Player ID!"); return; }

    const btn = document.querySelector('#searchModal .search-btn');
    const originalText = btn.innerText;
    btn.innerText = "Searching...";

    try {
        const usersRef = ref(db, 'users');
        // Search by publicID
        const q = query(usersRef, orderByChild('publicID'), equalTo(parseInt(inputVal)));
        const snapshot = await get(q);

        if (snapshot.exists()) {
            // Found the user node
            const data = snapshot.val();
            const foundUid = Object.keys(data)[0]; // Extract UID
            
            closeSearchModal();
            viewPlayer(foundUid); // Open profile
        } else {
            alert("Player ID not found.");
        }
    } catch (error) {
        console.error("Search Error:", error);
        alert("Search failed. Try again.");
    } finally {
        btn.innerText = originalText;
    }
};

// --- DATA LOADING & VIEWING ---
async function loadUserData(user) {
    const season = getSeasonInfo().seasonID;
    const publicID = await manageUserProfile(user); // Ensure profile exists
    
    document.getElementById('pUid').innerText = publicID;
    document.getElementById('pName').innerText = user.displayName;
    document.getElementById('pImg').src = user.photoURL;
    
    // Listen to SEASON TOTAL SCORE
    onValue(ref(db, `${season}/users/${user.uid}/totalScore`), (s) => {
        currentTotalScore = s.exists() ? parseFloat(s.val()) : 0;
        document.getElementById('pTotal').innerText = currentTotalScore.toFixed(2) + "m";
        document.getElementById('todayBest').innerText = currentTotalScore.toFixed(2) + "m";
    });

    // Listen to Awards
    onValue(ref(db, `users/${user.uid}/awards`), (snap) => {
        checkChampionStatus(snap.exists()?snap.val():null, 'myProfileContainer');
        renderAwards(snap, 'awardsList');
    });
}

// --- VIEW PLAYER (FIXED: Fetches Name/Photo from Global Profile) ---
window.viewPlayer = async (uid) => {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById('publicProfilePage').classList.add('active');
    
    // Reset UI
    document.getElementById('ppName').innerText = "Loading...";
    document.getElementById('ppUid').innerText = "...";
    document.getElementById('ppTotal').innerText = "0.00m";
    document.getElementById('ppImg').src = "https://via.placeholder.com/80";
    document.getElementById('ppAwardsList').innerHTML = '<p style="grid-column: span 3; color:#555;">Loading...</p>';
    
    const container = document.getElementById('publicProfileContainer');
    if(container) { container.classList.remove('legendary-ring'); const b=container.querySelector('.year-crown-badge'); if(b) b.remove(); }
    
    // 1. Fetch Basic Profile (Global) - This fixes the "No Name" issue in search
    try {
        const profileSnap = await get(ref(db, `users/${uid}/profile`));
        if (profileSnap.exists()) {
            const pData = profileSnap.val();
            document.getElementById('ppName').innerText = pData.name;
            document.getElementById('ppImg').src = pData.photo;
            document.getElementById('ppUid').innerText = pData.publicID;
        } else {
            document.getElementById('ppName').innerText = "Unknown User";
        }
    } catch(e) { console.error(e); }

    // 2. Fetch Season Score
    const season = getSeasonInfo().seasonID;
    onValue(ref(db, `${season}/users/${uid}/totalScore`), (snap) => {
        const score = snap.exists() ? parseFloat(snap.val()) : 0;
        document.getElementById('ppTotal').innerText = score.toFixed(2) + "m";
    }, {onlyOnce: true});

    // 3. Fetch Awards
    onValue(ref(db, `users/${uid}/awards`), (snap) => {
        checkChampionStatus(snap.exists()?snap.val():null, 'publicProfileContainer');
        renderAwards(snap, 'ppAwardsList');
    }, {onlyOnce: true});
};

window.closePublicProfile = () => { navTo('leaderboardPage'); document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active-nav')); document.querySelectorAll('.nav-item')[1].classList.add('active-nav'); };

// --- JUMP LOGIC (FIXED: Cumulative + Stricter Sensor) ---
async function handleJump(height) {
    if(!currentUser) return;
    const season = getSeasonInfo().seasonID;

    // 1. UI Update Immediately (Visual Feedback)
    const displayScore = currentTotalScore + height;
    document.getElementById('todayBest').innerText = displayScore.toFixed(2) + "m";
    document.getElementById('pTotal').innerText = displayScore.toFixed(2) + "m";

    try {
        // 2. Transaction to ADD score (Fixes the Highest Score issue)
        // This safely adds the new height to whatever is in the database
        await runTransaction(ref(db, `${season}/users/${currentUser.uid}`), (userData) => {
            if (!userData) {
                // If user doesn't exist in season yet, create entry
                return {
                    name: currentUser.displayName,
                    photo: currentUser.photoURL,
                    totalScore: height
                };
            } else {
                // If exists, ADD height to totalScore
                userData.totalScore = (userData.totalScore || 0) + height;
                // Update name/photo just in case they changed
                userData.name = currentUser.displayName;
                userData.photo = currentUser.photoURL;
                return userData;
            }
        });
        console.log("Score Added: +" + height);
    } catch (e) { 
        console.error("Jump Save Error:", e); 
        // Revert local UI if save failed (optional, but good practice)
    }
}

// --- SENSOR LOGIC (FIXED: High Sensitivity Issue) ---
let isFreeFalling = false; 
let startTime = 0; 
let lastAcc = 9.8;

document.getElementById('startBtn').onclick = function() { 
    if (typeof DeviceMotionEvent.requestPermission === 'function') { 
        DeviceMotionEvent.requestPermission().then(s => { if(s=='granted') start(); }); 
    } else { start(); } 
    this.innerText = "SENSOR ACTIVE"; 
    this.disabled = true; 
    this.style.background = "#238636"; 
};

function start() { 
    window.addEventListener('devicemotion', (e) => { 
        let acc = e.accelerationIncludingGravity; 
        if(!acc || !acc.x) return; 
        
        let raw = Math.sqrt(acc.x**2 + acc.y**2 + acc.z**2);
        // Low Pass Filter to smooth out jitter
        lastAcc = (lastAcc * 0.5) + (raw * 0.5); 
        
        let now = performance.now();
        
        // ISSUE 2 FIX: Stricter Thresholds
        // Freefall: Must be VERY close to 0 (gravity-less)
        if(lastAcc < 1.2 && !isFreeFalling) { 
            isFreeFalling = true; 
            startTime = now; 
            document.getElementById('status').innerText = "AIRBORNE"; 
        } 
        
        // Impact: Must be a HARD landing (> 20G equivalent spike roughly)
        if(isFreeFalling && lastAcc > 20) { 
            let d = (now - startTime)/1000;
            
            // Duration Check: Must be in air for at least 0.25s
            if(d > 0.25 && d < 2.5) { 
                let h = 0.5 * 9.81 * (d**2); // h = 1/2 * g * t^2
                // Cap max jump to realistic human limit (e.g. 1.5m - 2m) to prevent glitches
                if (h > 5.0) h = 5.0; 

                document.getElementById('height').innerText = h.toFixed(2); 
                handleJump(h); // Add Score
            } 
            isFreeFalling = false; 
            document.getElementById('status').innerText = "READY"; 
        }
        
        // Reset if freefall lasts too long (fake drop)
        if (isFreeFalling && (now - startTime) > 2500) {
             isFreeFalling = false;
             document.getElementById('status').innerText = "READY";
        }
    }); 
}

// --- LEADERBOARD & AWARDS ---
function loadLeaderboard() {
    const lbList = document.getElementById('lbList');
    lbList.innerHTML = "<p style='text-align:center; color:#888; margin-top:20px;'>Loading Season Data...</p>";
    const season = getSeasonInfo().seasonID;
    
    onValue(ref(db, `${season}/users`), (snapshot) => {
        if (!snapshot.exists()) { lbList.innerHTML = "<p style='text-align:center; margin-top:20px;'>No Players Yet</p>"; return; }
        
        let players = []; 
        snapshot.forEach(child => { 
            if(child.val().totalScore) players.push({ ...child.val(), uid: child.key }); 
        });
        
        // Sort High to Low
        players.sort((a, b) => parseFloat(b.totalScore) - parseFloat(a.totalScore));
        
        let allHtml = "";
        players.slice(0, 50).forEach((p, i) => {
            let rankStyle = i===0?"color:#ffd700; border:1px solid #ffd700; box-shadow: 0 0 5px rgba(255,215,0,0.3);":i===1?"color:#c0c0c0; border:1px solid #c0c0c0;":i===2?"color:#cd7f32; border:1px solid #cd7f32;":"";
            let rankColor = i===0?"#ffd700":i===1?"#c0c0c0":i===2?"#cd7f32":"var(--primary)";
            let name = p.name ? p.name.split(' ')[0] : 'Unknown';
            allHtml += `<div class="player-row" onclick="viewPlayer('${p.uid}')"><div class="rank-circle" style="${rankStyle}">${i+1}</div><div class="player-info"><span class="player-name">${name}</span></div><div class="player-score" style="color:${rankColor}">${parseFloat(p.totalScore).toFixed(2)}m</div></div>`;
        });
        lbList.innerHTML = allHtml;
    });
}

function checkChampionStatus(awards, containerId) {
    const container = document.getElementById(containerId);
    if(!container) return;
    container.classList.remove('legendary-ring');
    const oldBadge = container.querySelector('.year-crown-badge');
    if(oldBadge) oldBadge.remove();
    if(!awards) return;
    let yearCounts = {};
    Object.values(awards).forEach(award => {
        if(!award.isSpecial && parseInt(award.rank) === 1) { 
            const year = award.seasonName.split(' ')[1];
            if(year) yearCounts[year] = (yearCounts[year] || 0) + 1;
        }
    });
    let maxGold = 0; let bestYear = "";
    for(let y in yearCounts) { if(yearCounts[y] > maxGold) { maxGold = yearCounts[y]; bestYear = y; } }
    if(maxGold > 0) {
        container.classList.add('legendary-ring');
        container.innerHTML += `<div class="year-crown-badge">👑 ${bestYear} King</div>`;
    }
}

// --- MAIL & AWARD RENDERER ---
function renderAwards(snap, listId) {
    const list = document.getElementById(listId);
    if(!snap.exists()) { list.innerHTML = `<p style="grid-column: span 3; color:#555; text-align:center;">No trophies yet.</p>`; return; }
    list.innerHTML = "";
    const awards = snap.val();
    Object.values(awards).forEach(a => {
        if (a.isSpecial) {
            const s = a.specialData;
            list.innerHTML += `<div class="special-trophy-card ${s.style}"><i class="fas ${s.icon} special-icon"></i><div class="special-title">${s.name}</div></div>`;
        } else {
            let rank = parseInt(a.rank);
            let cls = rank===1?'rank-1':rank===2?'rank-2':rank===3?'rank-3':'rank-top';
            let icn = rank<=3?'fa-trophy':'fa-medal';
            list.innerHTML += `<div class="award-card ${cls}"><i class="fas ${icn} ${cls}"></i><div>#${rank}</div></div>`;
        }
    });
}

window.claimTrophy = async (mailId) => {
    if(!currentUser) return;
    const tData = window[`trophy_${mailId}`];
    if(!tData) return;
    if(confirm(`Claim '${tData.name}' Trophy?`)) {
        try {
            await push(ref(db, `users/${currentUser.uid}/awards`), { seasonName: tData.date, rank: "Special", isSpecial: true, specialData: tData });
            await remove(ref(db, `users/${currentUser.uid}/inbox/${mailId}`));
            delete window[`trophy_${mailId}`];
            alert("🏆 Trophy Claimed!");
        } catch(e) { console.error(e); }
    }
};

window.claimReward = async (mailId, rewardAmount) => {
    if(!currentUser) return;
    const season = getSeasonInfo().seasonID;
    if(confirm(`Claim ${rewardAmount}m reward?`)) {
        try {
            await runTransaction(ref(db, `${season}/users/${currentUser.uid}`), (userData) => {
                if (!userData) return { name: currentUser.displayName, photo: currentUser.photoURL, totalScore: parseFloat(rewardAmount) };
                userData.totalScore = (userData.totalScore || 0) + parseFloat(rewardAmount);
                return userData;
            });
            await remove(ref(db, `users/${currentUser.uid}/inbox/${mailId}`));
            alert("Score Added!");
        } catch(e) { console.error(e); }
    }
};

window.deleteMail = async (mailId) => { if(currentUser) await remove(ref(db, `users/${currentUser.uid}/inbox/${mailId}`)); };

function fetchMail() {
    if(!currentUser) return;
    const list = document.getElementById('mailList');
    onValue(ref(db, `users/${currentUser.uid}/inbox`), (snap) => {
        if(!snap.exists()) {
            list.innerHTML = '<p style="color:#555; text-align:center; padding:20px;">Inbox is empty.</p>';
            document.getElementById('mailCount').style.display = 'none';
            return;
        }
        const mails = snap.val();
        let html = ""; let count = 0;
        Object.entries(mails).forEach(([key, mail]) => {
            count++;
            let btn = "";
            if (mail.type === "special_trophy") {
                window[`trophy_${key}`] = mail.trophyData;
                btn = `<button onclick="claimTrophy('${key}')" class="claim-btn" style="background:linear-gradient(45deg, #7928ca, #ff0080); color:white;"><i class="fas fa-trophy"></i> CLAIM TROPHY</button>`;
            } else if (mail.reward) {
                btn = `<button onclick="claimReward('${key}', ${mail.reward})" class="claim-btn"><i class="fas fa-coins"></i> CLAIM +${mail.reward}m SCORE</button>`;
            } else {
                btn = `<button onclick="deleteMail('${key}')" class="claim-btn" style="background:#30363d; color:#fff;">Dismiss</button>`;
            }
            html += `<div class="mail-item"><div class="mail-title">${mail.title}</div><div class="mail-msg">${mail.message}</div>${btn}</div>`;
        });
        list.innerHTML = html;
        const badge = document.getElementById('mailCount');
        if(count > 0) { badge.innerText = count; badge.style.display = 'flex'; } else { badge.style.display = 'none'; }
    });
}
