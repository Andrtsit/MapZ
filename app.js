// SELECTORS
const form = document.querySelector("#form");
const usersInput = document.querySelector("#input-city");
const humidity = document.querySelector("#humidity");
const wind = document.querySelector("#wind");
const feelslike = document.querySelector("#feelslike");
const temperature = document.querySelector("#temperature");
const country = document.querySelector("#country");
const city = document.querySelector("#city");
const time = document.querySelector("#time");
const date = document.querySelector("#date");
const mapDOM = document.querySelector("#map");

// DECLARATIONS
let map;
let searchHistory = [];
const zoomMap = 10;
const defaultLat = 50.833;
const defaultLon = 4.333;

// FUNCTION TO TAKE DATA FROM AN OBJECT AND RENDER THEM ON UI
const renderData = function (obj) {
  country.textContent = obj.country;
  city.textContent = obj.city;
  time.textContent = obj.time;
  date.textContent = obj.date.split("-").reverse().join("-");
  temperature.textContent = obj.temperature + "°C";
  feelslike.textContent = obj.feelslike + "°C";
  humidity.textContent = obj.humidity + "%";
  wind.textContent = obj.wind + "kph";
};

// FUNCTION FOR EVERY SUBMIT // TODO: REFACTORING
const changePlace = async function (e) {
  try {
    // PREVENT DEFAULT OF SUMBIT EVENT
    e.preventDefault();
    const city = usersInput.value;
    // CLEARING INPUT FIELD
    usersInput.value = "";
    // FETCHING DATA FOR THE INPUTED CITY
    const response = await fetch(
      `https://api.weatherapi.com/v1/current.json?key=4887801d6c2b40a08fd202818241712&q=${city}&aqi=no`
    );
    const data = await response.json();

    const objFromData = {
      country: data.location.country,
      city: data.location.name,
      date: data.current.last_updated.split(" ")[0],
      time: data.current.last_updated.split(" ")[1],
      temperature: data.current.temp_c,
      feelslike: data.current.feelslike_c,
      wind: data.current.wind_kph,
      humidity: data.current.humidity,
      coords: [data.location.lat, data.location.lon],
    };
    // MOVE MAP TO THE DESIRED INPUT
    map.setView(objFromData.coords, zoomMap);

    // RENDER MARK
    L.marker(objFromData.coords)
      .addTo(map)
      .bindPopup(`${objFromData.city}, ${objFromData.country}`)
      .openPopup();
    // RENDER DATA FROM AN OBJECT
    renderData(objFromData);

    // if city already exists in localstorage return
    if (searchHistory.some((obj) => obj.city === objFromData.city)) return;

    // else save the city in localstorage
    searchHistory.push(objFromData);
    localStorage.setItem("city", JSON.stringify(searchHistory));
  } catch (err) {
    console.error(err);
  }
};

// ADDING HANDLERS FUNCTION
const addHandlers = function () {
  // ADD EVEN LISTENER FOR SUMBITING FORM
  form.addEventListener("submit", changePlace);
  // EVENT LISTENER FROM LEAFLET LIBRARY FOR RENDERING MARKER ON CLICK
  map.on("click", function (e) {
    const { lat, lng } = e.latlng;
    L.marker([lat, lng]).addTo(map).bindPopup().openPopup();
  });
};

// GETING SEARCH HISTORY FROM LOCALSTORAGE AND ADD MARKERS
const getDataLocal = function () {
  const data = JSON.parse(localStorage.getItem("city"));
  searchHistory = data;
  console.log(searchHistory);
  searchHistory.forEach((obj) => {
    L.marker(obj.coords).addTo(map).bindPopup(`${obj.city}, ${obj.country}`);
  });
};

// INIT FUNCTION STARTS WITH GEOLOCATION GETCURRENTPOSITION SO I MAKE ONE FUNCTION FOR SUCCESS AND ONE FOR FAILURE
// SUCCESS TO GET GEOLOCATION

const success = function (position) {
  const { latitude, longitude } = position.coords;
  // RENDER MAP AND SET VIEW ON GEOLOCATION COORDINATES
  map = L.map("map").setView([latitude, longitude], zoomMap);
  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 15,
    attribution:
      '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  }).addTo(map);
  // ADDING HANDLERS
  addHandlers();
  getDataLocal();
};

// FAILED TO GET GEOLOCATION

const failure = function () {
  alert("Geolocation not Supported");
  // RENDERING MAP WITH DEFAULT LANG LON
  map = L.map("map").setView([defaultLat, defaultLon], zoomMap);
  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 15,
    attribution:
      '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  }).addTo(map);
  // ADDING HANDLERS
  addHandlers();
  getDataLocal();
};
// INIT FUNCTION
const init = async function () {
  // WE INITIALISE WITH GEOLOCATION
  navigator.geolocation.getCurrentPosition(success, failure);
};

init();
