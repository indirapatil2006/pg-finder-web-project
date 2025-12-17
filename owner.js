/* owner.js
   - verify owner session
   - render bookings, accept/reject, clear
*/
const BOOKING_KEY = 'pg_bookings_v1';

function loadBookings(){ try { return JSON.parse(localStorage.getItem(BOOKING_KEY) || '[]'); } catch(e){ return []; } }
function saveBookings(list){ localStorage.setItem(BOOKING_KEY, JSON.stringify(list)); }

// verify owner session
(function verifyOwner(){
  const userStr = sessionStorage.getItem('pg_user');
  if(!userStr){ window.location.href = 'index.html'; return; }
  const user = JSON.parse(userStr);
  if(user.role !== 'owner'){ window.location.href = 'index.html'; return; }
})();

const listEl = document.getElementById('bookingsList');
const clearBtn = document.getElementById('clearBookings');

function renderBookings(){
  const bookings = loadBookings();
  if(bookings.length === 0){
    listEl.innerHTML = '<div class="muted">No booking requests yet.</div>';
    return;
  }
  listEl.innerHTML = '';
  // show newest first
  bookings.slice().reverse().forEach(b=>{
    const card = document.createElement('div');
    card.className = 'booking-card';

    const left = document.createElement('div');
    left.innerHTML = `<strong>${b.roomName}</strong>
                      <div>Requested by: <strong>${b.tenantName}</strong></div>
                      <div class="muted">${b.tenantEmail} • ${new Date(b.createdAt).toLocaleString()}</div>`;

    const right = document.createElement('div');
    const badge = document.createElement('span');
    badge.className = 'badge ' + (b.status === 'pending' ? 'pending' : (b.status === 'accepted' ? 'accepted' : 'rejected'));
    badge.textContent = b.status;
    right.appendChild(badge);

    if(b.status === 'pending'){
      const accept = document.createElement('button');
      accept.className = 'btn';
      accept.textContent = 'Accept';
      accept.style.marginLeft = '8px';
      accept.addEventListener('click', ()=> updateStatus(b.id, 'accepted'));

      const reject = document.createElement('button');
      reject.className = 'btn warn';
      reject.textContent = 'Reject';
      reject.style.marginLeft = '8px';
      reject.addEventListener('click', ()=> updateStatus(b.id, 'rejected'));

      right.appendChild(accept);
      right.appendChild(reject);
    }

    card.appendChild(left);
    card.appendChild(right);

    listEl.appendChild(card);
  });
}

function updateStatus(id, newStatus){
  const bookings = loadBookings();
  const updated = bookings.map(b => b.id === id ? { ...b, status: newStatus, notified: false } : b);
  saveBookings(updated);
  // notify other tabs
  localStorage.setItem('pg_last_update', Date.now().toString());
  renderBookings();
}

// Clear bookings
clearBtn?.addEventListener('click', ()=>{
  if(!confirm('Clear all bookings?')) return;
  localStorage.removeItem(BOOKING_KEY);
  localStorage.setItem('pg_last_update', Date.now().toString());
  renderBookings();
});

// listen for changes from other tabs
window.addEventListener('storage', (e)=>{
  if(e.key === BOOKING_KEY || e.key === 'pg_last_update'){
    renderBookings();
  }
});

// initial render
renderBookings();
