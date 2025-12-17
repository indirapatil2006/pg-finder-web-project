/* script.js - tenant side
   - renders rooms
   - handles slider, map, booking
   - notifications for tenant (polling + storage event)
*/

const BOOKING_KEY = 'pg_bookings_v1';

// Rooms with DIRECT Google Maps links
const rooms = [
  { 
    id:0, 
    name:'COZYHIVES PG', 
    type:'coed', 
    price:4500, 
    priceLabel:'₹4500/month', 
    phone:'9876543210', 
    distance:0.4, 
    amenities:['WiFi','Laundry','Hot Water'], 
    images:['a1.jpeg','a2.jpeg','a3.jpeg'], 
    map:'https://www.google.co.in/maps/place/COZYHIVES+PG+%2F+Hostel/@15.826325,74.4994451,17z/data=!3m1!4b1!4m6!3m5!1s0x3bbf6500044c9bb5:0xfbc961601e1962b3!8m2!3d15.826325!4d74.4994451!16s%2Fg%2F11whsb2ldm?entry=ttu'
  },

  { 
    id:1, 
    name:'Nesarkar PG', 
    type:'girls', 
    price:3900, 
    priceLabel:'₹3900/month', 
    phone:'9876599870', 
    distance:0.3, 
    amenities:['WiFi','Fridge','Study Table'], 
    images:['n1.jpeg','n2.jpeg','n3.jpeg'], 
    map:'https://www.google.co.in/maps/place/Nesarkar+Boys+PG/@15.8126315,74.4859643,17z/data=!3m1!4b1!4m6!3m5!1s0x3bbf65003009c17b:0xb4794c9f462f1f94!8m2!3d15.8126315!4d74.4859643!16s%2Fg%2F11w93ytndf?entry=ttu'
  },

  { 
    id:2, 
    name:'Annapurna PG', 
    type:'girls', 
    price:5500, 
    priceLabel:'₹5500/month', 
    phone:'9346783210', 
    distance:0.9, 
    amenities:['WiFi','Purified Water','CCTV'], 
    images:['c1.jpeg','c2.jpeg','c3.jpeg'], 
    map:'https://www.google.co.in/maps/place/Annapurna+PG/@15.8129328,74.4864024,17z/data=!3m1!4b1!4m6!3m5!1s0x3bbf65e61555d283:0x5f85a2d42bfa20d5!8m2!3d15.8129328!4d74.4864024!16s%2Fg%2F11lcfqxw1g?entry=ttu'
  },

  { 
    id:3, 
    name:'Sai Boys Hostel', 
    type:'boys', 
    price:5000, 
    priceLabel:'₹5000/month', 
    phone:'9087654321', 
    distance:0.7, 
    amenities:['CCTV','Parking','Hot Water'], 
    images:['s1.jpeg','s2.jpeg','s3.jpeg'], 
    map:'https://www.google.co.in/maps/place/sai+boys+hostel/@15.8124115,74.4854417,17z/data=!3m1!4b1!4m6!3m5!1s0x3bbf65c502c75f39:0x30a8f236f8d32a18!8m2!3d15.8124115!4d74.4854417!16s%2Fg%2F11cs28vrtw?entry=ttu'
  },

  { 
    id:4, 
    name:'Padmavati PG', 
    type:'girls', 
    price:4200, 
    priceLabel:'₹4200/month', 
    phone:'9871203456', 
    distance:0.9, 
    amenities:['WiFi','Study Table','CCTV'], 
    images:['p1.jpeg','p2.jpeg'], 
    map:'https://www.google.co.in/maps/place/SHRI+PADMAVATI+GIRLS+PG/@15.824562,74.4861127,14z/data=!4m10!1m2!2m1!1spadmavai+pg!3m6!1s0x3bbf67a4c17c0ea1:0xbd27f68121e0ce2!8m2!3d15.824562!4d74.5036222!15sCgxwYWRtYXZhdGkgcGeSAQxnaXJsc19ob3N0ZWzgAQA!16s%2Fg%2F11v9jzmc7y?entry=ttu'
  }
];

let sliderIndex = new Array(rooms.length).fill(0);

function loadBookings(){ 
  try { return JSON.parse(localStorage.getItem(BOOKING_KEY) || '[]'); } 
  catch(e){ return []; } 
}

function saveBookings(list){ localStorage.setItem(BOOKING_KEY, JSON.stringify(list)); }

function addBooking(b){ 
  const list = loadBookings(); 
  list.push(b); 
  saveBookings(list); 
}

// ensure tenant session
(function initSession(){
  const userStr = sessionStorage.getItem('pg_user');
  if(!userStr){ location.href = 'index.html'; return; }
  const user = JSON.parse(userStr);
  if(user.role !== 'tenant'){ location.href = 'index.html'; return; }
})();

const roomsContainer = document.getElementById('roomsContainer');
const searchInput = document.getElementById('search');
const genderFilter = document.getElementById('genderFilter');
const sortBy = document.getElementById('sortBy');
const notifCountEl = document.getElementById('notifCount');
const toast = document.getElementById('toast');

function renderRooms(){
  roomsContainer.innerHTML = '';
  const q = (searchInput?.value || '').toLowerCase();
  const filter = genderFilter?.value || 'all';
  const sort = sortBy?.value || 'relevance';

  let visible = rooms.filter(r => (filter === 'all' || r.type === filter));
  if(q) visible = visible.filter(r => (r.name + ' ' + r.amenities.join(' ') + ' ' + r.priceLabel).toLowerCase().includes(q));

  if(sort === 'price-asc') visible.sort((a,b)=>a.price-b.price);
  if(sort === 'price-desc') visible.sort((a,b)=>b.price-a.price);

  visible.forEach((room) => {
    const card = document.createElement('article');
    card.className = 'room-card glass-card';

    // slider
    const slider = document.createElement('div');
    slider.className = 'slider';
    const img = document.createElement('img');
    img.id = `img-${room.id}`;
    img.src = `images/${room.images[0]}`;
    slider.appendChild(img);

    const leftBtn = document.createElement('button');
    leftBtn.className = 'nav left';
    leftBtn.textContent = '❮';
    leftBtn.addEventListener('click', ()=> prevImg(room.id));
    slider.appendChild(leftBtn);

    const rightBtn = document.createElement('button');
    rightBtn.className = 'nav right';
    rightBtn.textContent = '❯';
    rightBtn.addEventListener('click', ()=> nextImg(room.id));
    slider.appendChild(rightBtn);

    // body
    const body = document.createElement('div');
    body.className = 'room-body';

    const title = document.createElement('h3');
    title.textContent = room.name;
    body.appendChild(title);

    const meta = document.createElement('div');
    meta.className = 'meta';
    meta.innerHTML = `Distance: ${room.distance} km • <span class="price">${room.priceLabel}</span>`;
    body.appendChild(meta);

    const amen = document.createElement('div');
    amen.className = 'amenities';
    room.amenities.forEach(a=>{
      const chip = document.createElement('span');
      chip.className = 'chip';
      chip.textContent = a;
      amen.appendChild(chip);
    });
    body.appendChild(amen);

    const actions = document.createElement('div');
    actions.className = 'actions';

    const callBtn = document.createElement('button');
    callBtn.className = 'btn';
    callBtn.textContent = 'Call';
    callBtn.addEventListener('click', ()=> { window.location.href = `tel:${room.phone}`; });
    actions.appendChild(callBtn);

    const waBtn = document.createElement('button');
    waBtn.className = 'btn';
    waBtn.textContent = 'WhatsApp';
    waBtn.addEventListener('click', ()=> { window.open(`https://wa.me/${room.phone.replace(/\D/g,'')}`,'_blank'); });
    actions.appendChild(waBtn);

    const bookBtn = document.createElement('button');
    bookBtn.className = 'btn';
    bookBtn.textContent = 'Book Room';
    bookBtn.addEventListener('click', ()=> bookRoom(room.id));
    actions.appendChild(bookBtn);

    body.appendChild(actions);

    // MAP BUTTON — uses your direct link
    const mapBtn = document.createElement('button');
    mapBtn.className = 'map-btn';
    mapBtn.textContent = '📍 Open Map';
    mapBtn.addEventListener('click', ()=> { window.open(room.map, '_blank'); });
    body.appendChild(mapBtn);

    card.appendChild(slider);
    card.appendChild(body);
    roomsContainer.appendChild(card);
  });
}

window.nextImg = function(i){
  const r = rooms.find(x=>x.id===i);
  if(!r) return;
  sliderIndex[i] = (sliderIndex[i] + 1) % r.images.length;
  const el = document.getElementById(`img-${i}`);
  if(el) el.src = `images/${r.images[sliderIndex[i]]}`;
}

window.prevImg = function(i){
  const r = rooms.find(x=>x.id===i);
  if(!r) return;
  sliderIndex[i] = (sliderIndex[i] - 1 + r.images.length) % r.images.length;
  const el = document.getElementById(`img-${i}`);
  if(el) el.src = `images/${r.images[sliderIndex[i]]}`;
}

function bookRoom(roomId){
  const user = JSON.parse(sessionStorage.getItem('pg_user')||'{}');
  if(!user || user.role !== 'tenant'){ 
    alert('Please login as tenant to book.'); 
    location.href='index.html'; 
    return; 
  }

  const room = rooms.find(r=>r.id===roomId);
  if(!room) return;

  const name = prompt('Enter your name to confirm booking:');
  if(!name) return;

  const booking = {
    id: Date.now(),
    roomId: room.id,
    roomName: room.name,
    tenantName: name,
    tenantEmail: user.email,
    phone: room.phone,
    status: 'pending',
    createdAt: new Date().toISOString(),
    notified: false
  };

  addBooking(booking);
  showToast('Booking requested — owner will review it.');
  localStorage.setItem('pg_last_update', Date.now().toString());
}

// NOTIFICATIONS
function checkNotifications(){
  const user = JSON.parse(sessionStorage.getItem('pg_user')||'{}');
  if(!user || !user.email) return;

  const bookings = loadBookings();
  let count = 0;

  bookings.forEach(b=>{
    if(b.tenantEmail === user.email){
      if((b.status === 'accepted' || b.status === 'rejected') && !b.notified){
        showToast(`Your booking for ${b.roomName} has been ${b.status.toUpperCase()}`);
        b.notified = true;
      }
      if(b.status !== 'pending' && b.notified) count++;
    }
  });

  saveBookings(bookings);
  updateBell(count);
}

function updateBell(n){
  const el = document.getElementById('notifCount');
  if(!el) return;
  if(n>0){ 
    el.textContent = n; 
    el.classList.remove('hidden'); 
  } else { 
    el.classList.add('hidden'); 
  }
}

function showToast(msg){
  toast.textContent = msg;
  toast.classList.remove('hidden');
  setTimeout(()=>{ toast.classList.add('hidden'); }, 3500);
}

// logout
document.getElementById('logoutBtn').addEventListener('click', ()=>{
  sessionStorage.removeItem('pg_user');
  location.href = 'index.html';
});

// filter wiring
searchInput?.addEventListener('input', renderRooms);
genderFilter?.addEventListener('change', renderRooms);
sortBy?.addEventListener('change', renderRooms);

// detect owner changes
window.addEventListener('storage', (e)=>{
  if(e.key === BOOKING_KEY || e.key === 'pg_last_update'){
    checkNotifications();
  }
});

// init
renderRooms();
checkNotifications();
setInterval(checkNotifications, 3000);
