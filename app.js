const app = function () {
  const form = document.querySelector("#form");
  const usersInput = document.querySelector("#input-city");
  let humidity = document.querySelector("#humidity");
  let wind = document.querySelector("#wind");
  let feelslike = document.querySelector("#feelslike");
  let temperature = document.querySelector("#temperature");
  let country = document.querySelector("#country");
  let city = document.querySelector("#city");
  let time = document.querySelector("#time");
  let date = document.querySelector("#date");
  let map;
  const zoomMap = 10;

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
      L.marker(objFromData.coords).addTo(map);
      // .bindPopup("A pretty CSS popup.<br> Easily customizable.")
      // .openPopup();
      // RENDER DATA FROM AN OBJECT
      renderData(objFromData);
    } catch (err) {
      console.error(err);
    }
  };

  // INITIALIZE
  navigator.geolocation.getCurrentPosition(
    function (position) {
      // GETING GEOLOCATION COORDINATES
      const { latitude, longitude } = position.coords;
      // RENDER MAP
      map = L.map("map").setView([latitude, longitude], zoomMap);
      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 15,
        attribution:
          '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(map);
      // RENDER A MARKER ON THE EXACT COORDINATES
      // L.marker([latitude, longitude])
      //   .addTo(map)
      //   .bindPopup("A pretty CSS popup.<br> Easily customizable.")
      //   .openPopup();

      // ADD EVEN LISTENER FOR FORM
      form.addEventListener("submit", changePlace);

      //ADD EVENT LISTENER TO CHANGE MODE ^_^
      // form.addEventListener("submit", changeMode);
    },

    function () {
      alert("Geolocation not supported or declined permission");
    }
  );
};
app();
