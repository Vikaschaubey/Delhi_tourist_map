let map, marker;
let rotating = true;  // rotation flag
let rotateRAF = null; // for animation frame

// Initialize Map
function initMap() {
  map = new mappls.Map("map", {
    center: [28.59033, 77.22712], // [lng, lat]
    zoom: 10,
    pitch: 40,
    bearing: 0
  });

  // Rotate map continuously
  function rotateCamera(ts) {
    if (!rotating) return;
    map.setBearing((ts / 100) % 360);
    rotateRAF = requestAnimationFrame(rotateCamera);
  }

  map.on("load", () => rotateCamera(0));
}

// Show marker on selection
function showMarker() {
  const place = document.getElementById("placeSelect").value;
  const resultBox = document.getElementById("result");

  if (!place) {
    resultBox.innerHTML = "👉 Please select a place.";
    return;
  }

  // Extract lat, lng
  const [lat, lng, eloc] = place.split(",");

  // Stop rotation temporarily
  rotating = false;
  if (rotateRAF) cancelAnimationFrame(rotateRAF);

  // Remove old marker
  if (marker) marker.remove();

  // Add new marker
  marker = new mappls.Marker({
    map,
    position: { lat, lng },
    icon_url: "https://apis.mapmyindia.com/map_v3/1.png"
  });

  
  // Fly to new location
  map.flyTo({
    center: [lng, lat], // flyTo expects [lng, lat]
    zoom: 16,
    pitch: 45,
    bearing: 0,
    speed: 0.9,
    curve: 1.2
  });

  // Resume rotation after 3s
  setTimeout(() => {
    rotating = true;
    document.getElementById("toggleRotationBtn").innerText = "⏸ Pause Rotation";
    rotateRAF = requestAnimationFrame(function step(ts) {
      if (!rotating) return;
      map.setBearing((ts / 100) % 360);
      rotateRAF = requestAnimationFrame(step);
    });
  }, 3000);

  // Show info
  resultBox.innerHTML = `📍 Selected Location:<br>Latitude: ${lat}, Longitude: ${lng}, eLoc: ${eloc}`;
}

// Toggle rotation (button + spacebar)
function toggleRotation() {
  const btn = document.getElementById("toggleRotationBtn");
  rotating = !rotating;

  if (rotating) {
    btn.innerText = "⏸ Pause Rotation";
    rotateRAF = requestAnimationFrame(function step(ts) {
      if (!rotating) return;
      map.setBearing((ts / 100) % 360);
      rotateRAF = requestAnimationFrame(step);
    });
  } else {
    btn.innerText = "▶ Continue Rotation";
    if (rotateRAF) cancelAnimationFrame(rotateRAF);
  }
}

// Spacebar shortcut
document.addEventListener("keydown", function(e) {
  if (e.code === "Space") {
    e.preventDefault(); // prevent page scroll
    toggleRotation();
  }
});
