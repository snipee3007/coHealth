let map;
let listInfoWindow = [];
function calcRoute(curCoor, desCoor) {
  // console.log('nó vô đây');
  // console.log('Toa do hien tai la: ', curCoor);
  // console.log('Toa do dich den la: ', desCoor);
  console.log(listInfoWindow);
  if (listInfoWindow) {
    listInfoWindow.forEach((infoWindow) => {
      infoWindow.close();
    });
    listInfoWindow = [];
  }
  const directionsService = new google.maps.DirectionsService();

  let start = new google.maps.LatLng(curCoor.lat, curCoor.long);
  let end = new google.maps.LatLng(desCoor.lat, desCoor.long);
  let request = {
    origin: start,
    destination: end,
    travelMode: 'DRIVING',
  };
  directionsService.route(request, function (result, status) {
    if (status == 'OK') {
      directionsRenderer.setDirections(result);
      console.log(result);
      // hiển thị thời gian cho đường đi đó
      let time = result.routes[0].legs[0].duration.text;
      const steps = result.routes[0].legs[0].steps;
      let infoWindow = new google.maps.InfoWindow({
        content: `<div style="font-family: ABeeZee, sans-serif; padding: 5px; border-radius: 8px; text-align: center;">
      <p style="margin: 5px 0 0; font-size: 16px;">
        ⏳ You will get after <b style="color: #6f3afa">${time}</b>
      </p>
    </div>`,
      });
      infoWindow.setPosition(
        new google.maps.LatLng(
          steps[Math.floor(steps.length / 2)].end_point.lat(),
          steps[Math.floor(steps.length / 2)].end_point.lng()
        )
      );
      listInfoWindow.push(infoWindow);
      console.log(listInfoWindow);
      infoWindow.open(map);
    }
  });
}

function initMap() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition((position) => {
      let lat = position.coords.latitude;
      let long = position.coords.longitude;
      // tạo biến map toàn cục -> sau khi load xong có map xài chỉ đường r
      map = new google.maps.Map(document.getElementById('map'), {
        center: { lat: lat, lng: long },
        zoom: 16,
        mapId: 'Hospital Map',
      });

      const marker = new google.maps.marker.AdvancedMarkerElement({
        map: map,
        position: { lat: lat, lng: long },
        title: 'Current place',
      });
      const directionsService = new google.maps.DirectionsService();
      directionsRenderer = new google.maps.DirectionsRenderer();
      directionsRenderer.setMap(map);
    });
  } else {
    alert('Geolocation is not supported by this browser.');
  }
}

class FindHospital {
  constructor() {
    this.#findRouteToHospital();
    this.#findNearestHospital();
  }
  #findRouteToHospital() {
    // hàm này dùng để mỗi khi nhấn nút find the hospital thì nó nhận dữ liệu lat lng lun
    // thêm data-lat data-long trên button từng bệnh viện lun cho tiện
    const findRouteBtns = document.querySelectorAll(
      '#listOfNearestHospitals button'
    );
    console.log(findRouteBtns[0].getAttribute('data-lat'));

    findRouteBtns.forEach((button) => {
      button.addEventListener('click', (e) => {
        console.log('bấm rồi');
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition((position) => {
            const curr = {
              lat: position.coords.latitude,
              long: position.coords.longitude,
            };
            const des = {
              lat: button.getAttribute('data-lat'),
              long: button.getAttribute('data-long'),
            };
            calcRoute(curr, des);
          });
        } else {
          alert('Can not use this function');
        }
      });
    });
  }
  #findNearestHospital() {
    document
      .querySelector('#findNearestHospital')
      .addEventListener('click', async (e) => {
        e.preventDefault;
        console.log(document.querySelector('#findNearestHospital').textContent);
        if (
          document.querySelector('#findNearestHospital').textContent ===
          'Find Nearest Hospitals'
        ) {
          if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(async (position) => {
              let lat = position.coords.latitude;
              let long = position.coords.longitude;
              // khỏi cần res.json()
              try {
                const res = await axios({
                  method: 'GET',
                  url: `/api/hospitals/nearest`,
                  params: {
                    lat: lat,
                    long: long,
                  },
                });
                console.log(res);
                const listHospitals = res.data.data;
                document.querySelector('#listOfNearestHospitals').innerHTML =
                  '';
                let html = '';
                listHospitals.forEach((hospital) => {
                  html += `
                  <div class='border-2' id='${hospital.name}'>
                    <img src='${hospital.image}' class='h-64 w-full object-cover' alt = '${hospital.name}'>
                    <div class='flex justify-between'>
                      <div class='py-4 px-3 font-Roboto text-justify text-[#6F7CB2] w-2/3'>
                        <p class='text-xl font-bold text-black'>${hospital.name}</p>
                        <p>Address: ${hospital.address}</p>
                        <a href='${hospital.web}'> Website: ${hospital.web}</a>
                        <p>Hotline: ${hospital.phone}</p>
                      </div>
                      <div class = 'py-4 px-3 content-center w-1/3'>
                        <button type='submit' class='w-full p-2 linearBackground text-white font-DM-Sans font-bold rounded-xl cursor-pointer' data-lat = '${hospital.coordinates[1]}' data-long = '${hospital.coordinates[0]}'>Find Way To Hospital</button>
                      </div>
                    </div>
                  </div>`;
                });
                document
                  .querySelector('#listOfNearestHospitals')
                  .insertAdjacentHTML('beforeend', html);
                document.querySelector('#findNearestHospital').textContent =
                  'Find All Hospitals';
                this.#findRouteToHospital();
              } catch (err) {
                console.log('nó vô đây');
                alert(err.message);
              }
            });
          } else {
            alert('Can not use this button');
          }
        } else {
          const res = await axios({
            method: 'GET',
            url: `/api/hospitals`,
          });
          const listHospitals = res.data.data;
          document.querySelector('#listOfNearestHospitals').innerHTML = '';
          let html = '';
          listHospitals.forEach((hospital) => {
            html += `
                  <div class='border-2' id='${hospital.name}'>
                    <img src='${hospital.image}' class='h-64 w-full object-cover' alt = '${hospital.name}'>
                    <div class='flex justify-between'>
                      <div class='py-4 px-3 font-Roboto text-justify text-[#6F7CB2] w-2/3'>
                        <p class='text-xl font-bold text-black'>${hospital.name}</p>
                        <p>Address: ${hospital.address}</p>
                        <a href='${hospital.web}'> Website: ${hospital.web}</a>
                        <p>Hotline: ${hospital.phone}</p>
                      </div>
                      <div class = 'py-4 px-3 content-center w-1/3'>
                        <button type='submit' class='w-full p-2 linearBackground text-white font-DM-Sans font-bold rounded-xl cursor-pointer' data-lat = '${hospital.coordinates[1]}' data-long = '${hospital.coordinates[0]}'>Find Way To Hospital</button>
                      </div>
                    </div>
                  </div>`;
          });
          document
            .querySelector('#listOfNearestHospitals')
            .insertAdjacentHTML('beforeend', html);
          document.querySelector('#findNearestHospital').textContent =
            'Find Nearest Hospitals';
          this.#findRouteToHospital();
        }
      });
  }
}

new FindHospital();
