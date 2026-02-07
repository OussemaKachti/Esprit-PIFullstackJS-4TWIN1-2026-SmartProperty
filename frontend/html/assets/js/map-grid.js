/*
Author       : Dreamguys
Template Name: DreamsEstate - Bootstrap Template
Version      : 1.0
*/

google.maps.visualRefresh = true;
var slider, infowindow = null;
var bounds = new google.maps.LatLngBounds();
var map, current = 0;

var locations = [
  {
    "id": 1,
    "lat": 53.470692,
    "lng": -2.220328,
    "rent_prize": "$1,100 ",
    "rent_bed": "4",
    "rent_baths": "4",
    "rent_sqft": "1900",
    "rent_listedon": "17 Jan 2023",
    "rent_Category": "Condos",
    "rent_name": "Place perfect for nature",
    "total_review": "17",
    "rent_address": "122-140 N Morgan St, Chicago, IL 60607, USA",
    "image": "assets/img/buy/buy-grid-img-01.jpg",
    "profile_image": "assets/img/users/user-01.jpg"
  },
  {
    "id": 2,
    "lat": 53.469189,
    "lng": -2.199262,
    "rent_prize": "$1,700 ",
    "rent_bed": "4",
    "rent_baths": "4",
    "rent_sqft": "1100",
    "rent_listedon": "17 Jan 2023",
    "rent_Category": "Condos",
    "rent_name": "Place perfect for nature",
    "total_review": "17",
    "rent_address": "470 Park Ave S, New York, NY 10016",
    "image": "assets/img/buy/buy-grid-img-02.jpg",
    "profile_image": "assets/img/users/user-02.jpg"
  },
  // ... other entries (same format with corrected IDs)
];

// Optional: define icons if you want custom marker icons
var icons = {
  default: null // replace with 'path/to/icon.png' if needed
};

function initialize() {
  bounds = new google.maps.LatLngBounds();

  var mapOptions = {
    zoom: 14,
    center: new google.maps.LatLng(53.470692, -2.220328),
    scrollwheel: false,
    mapTypeId: google.maps.MapTypeId.ROADMAP
  };

  map = new google.maps.Map(document.getElementById('map'), mapOptions);
  map.slide = true;
  map.markers = [];

  infowindow = new google.maps.InfoWindow({
    content: "loading..."
  });

  google.maps.event.addListener(infowindow, 'closeclick', function () {
    infowindow.close();
  });

  setMarkers(map, locations);
  slider = window.setTimeout(show, 3000);
}

function setMarkers(map, markers) {
  for (var i = 0; i < markers.length; i++) {
    var item = markers[i];
    var latlng = new google.maps.LatLng(item.lat, item.lng);
    var marker = new google.maps.Marker({
      position: latlng,
      map: map,
      title: item.rent_name,
      profile_image: item.profile_image,
      rent_Category: item.rent_Category,
      rent_listedon: item.rent_listedon,
      rent_sqft: item.rent_sqft,
      rent_baths: item.rent_baths,
      rent_bed: item.rent_bed,
      rent_address: item.rent_address,
      rent_prize: item.rent_prize,
      rent_name: item.rent_name,
      total_review: item.total_review,
      image: item.image,
      animation: google.maps.Animation.DROP,
      icon: icons.default
    });

    bounds.extend(marker.position);
    map.markers.push(marker);

    google.maps.event.addListener(marker, "click", function () {
      setInfo(this);
      infowindow.open(map, this);
      window.clearTimeout(slider);
    });
  }

  map.fitBounds(bounds);

  google.maps.event.addListener(map, 'zoom_changed', function () {
    if (map.zoom > 16) map.slide = false;
  });
}

function show() {
  if (!map.slide || map.markers.length === 0) return;

  var next;
  if (map.markers.length === 1) {
    next = 0;
  } else {
    do {
      next = Math.floor(Math.random() * map.markers.length);
    } while (next === current);
  }

  current = next;
  var marker = map.markers[next];
  setInfo(marker);
  infowindow.open(map, marker);
}

function setInfo(marker) {
  var content =`
      <div class="property-card property-map-card mb-lg-0">
        <div class="property-listing-item p-0 mb-0 shadow-none">
          <div class="buy-grid-img mb-0 rounded-0 position-relative">
            <a href="javascript:void(0);">
              <img class="img-fluid" src="${marker.image}" alt="${marker.rent_name}">
            </a>
            <div class="d-flex align-items-center justify-content-between position-absolute bottom-0 end-0 start-0 p-3 z-1">
              <h6 class="text-white mb-0">${marker.rent_prize}</h6>
            </div>
          </div> 
          <div class="buy-grid-content">
            <div class="d-flex align-items-center justify-content-between mb-3">
              <div>
                <h6 class="title mb-1">
                  <a href="javascript:void(0);">${marker.rent_name}</a> 
                </h6>
                <p class="d-flex align-items-center fs-14 mb-0">
                  <i class="material-icons-outlined me-1 ms-0">location_on</i>${marker.rent_address}
                </p>
              </div>
            </div>
            <div class="d-flex align-items-center justify-content-between flex-wrap gap-1">
              <p class="fs-14 fw-medium text-dark mb-0">
                Listed on : <span class="fw-medium text-body">${marker.rent_listedon}</span>
              </p>
              <p class="badge bg-secondary text-white mb-0">${marker.rent_Category}</p>
            </div>
          </div>
        </div> 
      </div>
  `;

  infowindow.setContent(content);
}

google.maps.event.addDomListener(window, 'load', initialize);