const pgs = [
 {name:"Annapurna PG",price:5500,rate:4.5,amen:"WiFi, Food, Hot Water, Power Backup, CCTV, Housekeeping",gender:"girls",
 imgs:["images/a1.jpeg","images/a2.jpeg","images/a3.jpeg"],loc:"Pune",ownerPhone:"919880000001"},
 {name:"CozyHives PG",price:4500,rate:4.2,amen:"WiFi, Laundry, Parking, Study Table, Kitchen Access",gender:"boys",
 imgs:["images/c1.jpeg","images/c2.jpeg","images/c3.jpeg"],loc:"Pune",ownerPhone:"919880000002"},
 {name:"Nesarkar PG",price:4000,rate:4.1,amen:"WiFi, Study Table, Attached Bathroom, Cleaning Service",gender:"boys",
 imgs:["images/n1.jpeg","images/n2.jpeg","images/n3.jpeg"],loc:"Pune",ownerPhone:"919880000003"},
 {name:"Sunrise PG",price:3800,rate:4.0,amen:"AC, WiFi, Hot Water, Mess Facility, CCTV",gender:"girls",
 imgs:["images/s1.jpeg","images/s2.jpeg"],loc:"Pune",ownerPhone:"919880000004"},
 {name:"MetroComfort PG",price:6000,rate:4.7,amen:"Food, Gym, WiFi, Parking, Power Backup, CCTV",gender:"boys",
 imgs:["images/p1.jpeg","images/p2.jpeg","images/p3.jpeg"],loc:"Pune",ownerPhone:"919880000005"}
];

let imgIndex={};
let _currentBookingPG=null;

function renderPGs(){
  const box=document.getElementById("pgs");
  if(!box) return;
  box.innerHTML="";
  const q=(document.getElementById('search')?.value||"").toLowerCase();
  const gender = (document.getElementById('genderFilter')?.value||"").toLowerCase();
  pgs.filter(p=>{
    const matchesQuery = p.amen.toLowerCase().includes(q) || p.name.toLowerCase().includes(q);
    const matchesGender = !gender || (p.gender && p.gender.toLowerCase()===gender);
    return matchesQuery && matchesGender;
  }).forEach((p,i)=>{
    imgIndex[i]=imgIndex[i]||0;
    box.innerHTML+=`
    <div class="card">
      <div class="slider">
        <img id="img${i}" src="${p.imgs[imgIndex[i]]||p.imgs[0]}" onerror="this.onerror=null;this.src='data:image/svg+xml;utf8,<svg xmlns=&quot;http://www.w3.org/2000/svg&quot; width=&quot;400&quot; height=&quot;300&quot;><rect width=&quot;100%&quot; height=&quot;100%&quot; fill=&quot;%237b2f6f&quot;/><text x=&quot;50%25&quot; y=&quot;50%25&quot; fill=&quot;%23fff&quot; font-size=&quot;20&quot; font-family=&quot;Arial&quot; dominant-baseline=&quot;middle&quot; text-anchor=&quot;middle&quot;>No Image</text></svg>';">
        <button class="prev" onclick="slide(${i},-1)">◀</button>
        <button class="next" onclick="slide(${i},1)">▶</button>
      </div>
      <h3>${p.name}</h3>
      <p>₹${p.price} | ⭐ ${p.rate}</p>
      <p>${p.amen}</p>
      <p style="margin-top:6px;font-size:14px;opacity:0.95">Contact: ${p.ownerPhone || 'N/A'}</p>
      <div style="display:flex;gap:8px;margin-top:8px">
          <button onclick="openModal('${p.name}')">Book</button>
          <button onclick="openMap('${p.name}','${p.loc}')">View Map</button>
          <button style="background:#25D366;color:#fff" onclick="contactOwner('${p.ownerPhone||''}','${p.name}')">Contact Owner</button>
        </div>
    </div>`;
  });
}

function slide(i,dir){
  imgIndex[i]=(imgIndex[i]+dir+pqs(i).length)%pqs(i).length;
  document.getElementById("img"+i).src=pqs(i)[imgIndex[i]];
}

function pqs(i){return pgs[i].imgs;}

function openModal(pg){
  _currentBookingPG = pg;
  document.getElementById('modalTitle').innerText = 'Book: '+pg;
  document.getElementById('tenantName').value='';
  document.getElementById('phone').value='';
  document.getElementById('otpInput').value='';
  document.getElementById('modalBody').style.display='block';
  document.getElementById('otpRow').style.display='none';
  document.getElementById('modal').style.display='flex';
}

function closeModal(){ document.getElementById('modal').style.display='none'; }

function sendOtp(){
  const tenantName = (document.getElementById('tenantName')?.value||'').trim();
  const phone = document.getElementById('phone').value.trim();
  if(!tenantName){ alert('Please enter your name'); return; }
  if(!phone.match(/^\d{10,15}$/)){ alert('Enter valid phone number'); return; }
  const otp = Math.floor(1000+Math.random()*9000);
  // attach additional PG info (price, ownerPhone) if available
  const pgObj = pgs.find(p=>p.name===_currentBookingPG) || {};
  const duration = (document.getElementById('stayDuration')?.value||'').trim();
  const booking = {pg:_currentBookingPG, otp, phone, tenantName, duration, email: localStorage.getItem('email')||'' , time: new Date().toISOString(), price: pgObj.price||null, ownerPhone: pgObj.ownerPhone||'' };
  localStorage.setItem('booking', JSON.stringify(booking));
  // show OTP input on same page
  document.getElementById('modalBody').style.display='none';
  document.getElementById('otpRow').style.display='block';
  // in real app send via SMS; here show a small hint
  alert('OTP (for demo): '+otp);
}

function confirmOtp(){
  const input = document.getElementById('otpInput').value.trim();
  const booking = JSON.parse(localStorage.getItem('booking')||'null');
  if(!booking){ alert('No booking found'); return; }
  if(input==booking.otp){
    booking.verifiedByTenant = true;
    // push to persistent requests array so owner can see it until cleared
    try{
      const reqs = JSON.parse(localStorage.getItem('requests')||'[]');
      // add a small id so owner can reference it
      booking.id = Date.now();
      booking.status = 'pending';
      reqs.push(booking);
      localStorage.setItem('requests', JSON.stringify(reqs));
    }catch(e){
      booking.id = Date.now(); booking.status = 'pending';
      localStorage.setItem('requests', JSON.stringify([booking]));
    }
    // remove temporary booking
    localStorage.removeItem('booking');
    alert('Booking confirmed. Owner will verify soon.');
    closeModal();
  } else alert('Invalid OTP');
}

// Open map modal focused on this PG
function openMap(name,loc){
  // try to show current location on Google Maps; fall back to searching the PG
  if(navigator.geolocation){
    navigator.geolocation.getCurrentPosition((pos)=>{
      const lat = pos.coords.latitude;
      const lon = pos.coords.longitude;
      // open map centered on current location
      const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lon}`;
      window.open(url,'_blank');
    },(err)=>{
      const q = encodeURIComponent(name + ' ' + (loc||''));
      const url = `https://www.google.com/maps/search/?api=1&query=${q}`;
      window.open(url,'_blank');
    },{timeout:10000});
  } else {
    const q = encodeURIComponent(name + ' ' + (loc||''));
    const url = `https://www.google.com/maps/search/?api=1&query=${q}`;
    window.open(url,'_blank');
  }
}

function closeMap(){
  // kept for backward compatibility but map modal is no longer used
  const f = document.getElementById('mapFrame'); if(f) f.src='';
  const m = document.getElementById('mapModal'); if(m) m.style.display='none';
}

// Contact owner: if number provided, open WhatsApp with that number; otherwise prompt
function contactOwner(number, pgName){
  let num = (number||'').trim();
  if(!num){
    num = prompt('Enter owner phone number (with country code, e.g. 919999999999):');
    if(!num) return;
  }
  const msg = encodeURIComponent(`Hi, I'm interested in ${pgName}. Is it available?`);
  const url = `https://wa.me/${num}?text=${msg}`;
  window.open(url,'_blank');
}

function sortPG(){
  const v = document.getElementById('sort').value;
  pgs.sort(v==="low"?(a,b)=>a.price-b.price:(a,b)=>b.price-a.price);
  renderPGs();
}

function logout(){
  localStorage.clear();
  location="index.html";
}

function togglePassword(){
  const passwordInput = document.getElementById('password');
  const toggleButton = document.getElementById('togglePwd');
  if(!passwordInput || !toggleButton) return;

  const isVisible = passwordInput.type === 'text';
  passwordInput.type = isVisible ? 'password' : 'text';
  toggleButton.setAttribute('aria-pressed', String(!isVisible));
  toggleButton.setAttribute('aria-label', isVisible ? 'Show password' : 'Hide password');
}

renderPGs();

// Notifications: support multiple notifications stored under 'notifications'
function getNotifications(){
  try{ return JSON.parse(localStorage.getItem('notifications')||'[]'); }catch(e){ return []; }
}

function updateNotifications(){
  const notes = getNotifications();
  const bell = document.getElementById('count');
  if(!bell) return;
  bell.innerText = notes.length ? String(notes.length) : '0';
  // show a small banner for the latest notification
  if(notes.length) showBanner(notes[notes.length-1]); else removeBanner();
}

function showBanner(note){
  if(document.getElementById('notifyBanner')) return;
  const main = document.querySelector('main') || document.body;
  const b = document.createElement('div');
  b.id='notifyBanner';
  b.style.background='#fff8';
  b.style.color='#111';
  b.style.padding='10px 14px';
  b.style.borderRadius='8px';
  b.style.margin='12px auto';
  b.style.maxWidth='1200px';
  b.style.display='flex';
  b.style.justifyContent='space-between';
  const content = (typeof note === 'string') ? note : `${note.message} — ${note.email}`;
  b.innerHTML = `<div><strong>Owner response:</strong> ${content}</div><div><button onclick="dismissLatest()">Dismiss</button></div>`;
  main.insertBefore(b, main.firstChild);
}

function removeBanner(){ const b = document.getElementById('notifyBanner'); if(b) b.remove(); }

function dismissLatest(){
  const notes = getNotifications();
  if(!notes.length) return;
  notes.pop();
  localStorage.setItem('notifications', JSON.stringify(notes));
  updateNotifications();
  renderNotificationsList();
}

// Bell click: toggle dropdown list of notifications
function toggleNotificationsList(){
  const existing = document.getElementById('notifList');
  if(existing){ existing.remove(); return; }
  const notes = getNotifications();
  const div = document.createElement('div');
  div.id = 'notifList';
  div.style.position='fixed';
  div.style.right='24px';
  div.style.top='64px';
  div.style.width='320px';
  div.style.maxHeight='60vh';
  div.style.overflow='auto';
  div.style.background='rgba(255,255,255,0.95)';
  div.style.boxShadow='0 6px 18px rgba(0,0,0,0.2)';
  div.style.borderRadius='10px';
  div.style.padding='12px';
  div.style.zIndex = '9999';
  let html = `<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px"><strong>Notifications</strong><div><button onclick="dismissAllNotifications()" style="background:#ff6b6b;color:#fff;border:none;padding:6px 8px;border-radius:6px">Clear All</button></div></div>`;
  if(!notes.length) html += `<div style="padding:8px;color:#666">No notifications</div>`;
  notes.slice().reverse().forEach((n,i)=>{
    const idx = notes.length - 1 - i; // original index
    html += `<div style="padding:8px;border-radius:6px;margin-bottom:8px;background:#fff;box-shadow:0 1px 4px rgba(0,0,0,0.06)"><div style="font-weight:600">${n.message}</div><div style="font-size:12px;color:#444">${n.email}</div><div style="font-size:11px;color:#666;margin-top:6px">${new Date(n.time).toLocaleString()}</div><div style="margin-top:8px;text-align:right"><button onclick="dismissNotification(${idx})" style="padding:6px 8px;background:#ffd166;border:none;border-radius:6px">Dismiss</button></div></div>`;
  });
  div.innerHTML = html;
  document.body.appendChild(div);
}

function dismissNotification(index){
  const notes = getNotifications();
  if(index<0 || index>=notes.length) return;
  notes.splice(index,1);
  localStorage.setItem('notifications', JSON.stringify(notes));
  renderNotificationsList();
  updateNotifications();
}

function dismissAllNotifications(){
  localStorage.removeItem('notifications');
  renderNotificationsList();
  updateNotifications();
}

function renderNotificationsList(){
  const el = document.getElementById('notifList'); if(!el) return; el.remove();
  // reopen if there are still items
  toggleNotificationsList();
}

// attach click handler to bell (if present)
setTimeout(()=>{
  const bellWrap = document.getElementById('bell'); if(bellWrap) bellWrap.addEventListener('click', toggleNotificationsList);
},300);

// update when storage changes (owner accepted/rejected or notifications changed in another tab)
window.addEventListener('storage', (e)=>{ if(e.key==='notifications' || e.key==='booking') updateNotifications(); });

// initial notification state
updateNotifications();

/* ----------------- UI helpers: toast + theme persistence ----------------- */
function showToast(message, timeout=3000){
  try{
    const t = document.createElement('div');
    t.className = 'app-toast';
    t.innerText = message;
    document.body.appendChild(t);
    // allow CSS to animate
    requestAnimationFrame(()=> t.classList.add('show'));
    setTimeout(()=>{ t.classList.remove('show'); setTimeout(()=>t.remove(),300); }, timeout);
  }catch(e){ console.log('Toast error',e); }
}

// Theme persistence: default follows the system preference unless a choice is saved.
function applyTheme(name){
  name = (name === 'light') ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', name);
  document.documentElement.classList.toggle('dark', name === 'dark');
  document.documentElement.classList.toggle('light', name === 'light');
  document.body.classList.toggle('dark', name === 'dark');
  document.body.classList.toggle('light', name === 'light');

  const toggle = document.getElementById('themeToggle');
  if(toggle) toggle.checked = (name === 'dark');
}

function _initThemeToggle(){
  let saved = localStorage.getItem('theme');
  if(!saved){
    try{ saved = window.matchMedia && window.matchMedia('(prefers-color-scheme:dark)').matches ? 'dark' : 'light'; }catch(e){ saved = 'light'; }
  }
  applyTheme(saved);

  const toggle = document.getElementById('themeToggle');
  if(toggle){
    toggle.checked = (saved === 'dark');
    toggle.addEventListener('change', ()=>{
      const t = toggle.checked ? 'dark' : 'light';
      localStorage.setItem('theme', t);
      applyTheme(t);
    });
  }
}

if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', _initThemeToggle); else _initThemeToggle();
