function logout() {
  localStorage.removeItem("loggedUser");
  window.location.href = "index.html";
}

// Accept Booking
function acceptBooking() {
  document.getElementById("bookingStatus").innerText = "Accepted";
  notifyTenant("Your booking has been ACCEPTED by owner.");
}

// Reject Booking
function rejectBooking() {
  document.getElementById("bookingStatus").innerText = "Rejected";
  notifyTenant("Your booking has been REJECTED by owner.");
}

// OTP Verification (SIMULATED)
function verifyTenant() {
  const otp = prompt("Enter OTP sent to tenant:");
  if (otp === "1234") {
    document.getElementById("verifyStatus").innerText = "Verified";
    notifyTenant("Your OTP verification is SUCCESSFUL.");
  } else {
    alert("Invalid OTP");
  }
}

// Create Contract + PDF
function createContract() {
  document.getElementById("contractStatus").innerText = "Created";

  const contractText = `
PG RENTAL CONTRACT

Tenant: ira123@gmail.com
PG: CozyHives PG
Rent: ₹4500/month
Start Date: ${new Date().toDateString()}

Owner Signature: ____________
Tenant Signature: ____________
`;

  const blob = new Blob([contractText], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "PG_Contract.pdf";
  a.click();

  notifyTenant("Your rental contract has been created.");
}

// Notification System (LocalStorage)
function notifyTenant(message) {
  let notifications = JSON.parse(localStorage.getItem("tenantNotifications")) || [];
  notifications.push({
    message,
    time: new Date().toLocaleString()
  });
  localStorage.setItem("tenantNotifications", JSON.stringify(notifications));
}
