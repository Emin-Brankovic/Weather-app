const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];


const getUserLocation=()=>{
  const positionSuccess=({coords})=>{
    getWeatherForecast(coords.latitude,coords.longitude);
  }
  
  const positionError=(error)=>{
    switch(error.code) {
      case error.PERMISSION_DENIED:
        alert("")
        break;
      case error.POSITION_UNAVAILABLE:
        alert( "Location information is unavailable.")
        break;
      case error.TIMEOUT:
        alert( "The request to get user location timed out.")
        break;
      case error.UNKNOWN_ERROR:
        alert( "An unknown error occurred.")
        break;
    }
  }
  navigator.geolocation.getCurrentPosition(positionSuccess,positionError);
}

const startApp=()=>{
  let cityInput=document.getElementById("city-input").value;
  getCoordinates(cityInput);
}

const getWeatherIcon=(code,isDay)=>{
  switch (code) {
    case 0: case 1:
      if(isDay===1){return "Clear sky";}
      return "moon";
    case 2:
      if(isDay===1){return "sun-cloud";}
      return "moon-cloud"; 
    case 3:
      return "cloud";
    case 45: case 48:
      return "fog";
    case 71: case 73: case 75: case 77: case 85: case 86:
      return "snow";
    case 95: case 96: case 99:
      return "cloud-bolt";
    case 51: case 53: case 55: case 56: case 57: case 61: case 63: case 65:
      return "light-rain";
    case 66: case 67: case 80: case 81: case 82:
      return "heavy-rain"; 
  }
}


const getCoordinates=(cityInput)=>{
  const geocodingURL=`https://geocoding-api.open-meteo.com/v1/search?name=${cityInput}&count=1&language=en&format=json`
  if(document.getElementById("city-input").value === ""){
    alert("You must enter a city");
    return;
    }
  fetch(geocodingURL).then(res=>{
    if(res.status!==200){
      alert("Not responding")
      return;
    }
    res.json().then(obj=>{
      let lat=obj.results[0].latitude;
      let lon=obj.results[0].longitude;
      getWeatherForecast(lat,lon)
    })
  })
  .catch(err=>{
    alert(err)
  })
}

const getWeatherForecast = (lat,lon) => {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=temperature_2m,relativehumidity_2m,apparent_temperature,precipitation,weathercode,windspeed_10m&daily=weathercode,temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,windspeed_10m_max&current_weather=true&timeformat=unixtime&timezone=${Intl.DateTimeFormat().resolvedOptions().timeZone}`;
    fetch(url)
      .then(response => {
        if (response.status !== 200) {
          alert("Not responding");
          return;
        }
        response.json().then(({ current_weather, daily }) => {
          showApp(current_weather, daily);
        });
      });
  }


const showApp=(currentWeather,dailyWeather)=>{
  let body=document.querySelector(".body");
  let cityInput=document.getElementById("city-input").value;
  let weatherIcon=getWeatherIcon(currentWeather.weathercode,currentWeather.is_day);
    body.innerHTML=`
    <header class="bg-primary text-center py-3">
    <h1 class="fw-bold h3 text-light my-1">Weather Dashboard</h1>
    </header>
  <div class="container-fluid my-5 weather-data">
      <div class="row">
          <div class="col-xxl-3 col-md-4 px-lg-4">
          <h4 class="fw-bold">Enter a City Name</h4>
              <input type="text" id="city-input" class="py-2 form-control" value="${cityInput}">
              <button class="btn btn-primary w-100 my-2 p-2" onclick="startApp()" type="submit" >Search</button>
              <div class="container-fluid ">
                  <div class="row">
                    <div class="col-5 px-0">
                      <hr>
                    </div>
                    <div class="col-2 px-1 text-center">
                      <p class="text-center my-0 text-secondary-emphasis">or</p>
                    </div>
                    <div class="col-5 px-0">
                      <hr>
                      </div>
                      </div>
                      </div>
              <button class="btn btn-secondary w-100 my-2 p-2" onclick="getUserLocation()">Use Current Location</button>
              </div>
          <div class="col-xxl-9 col-md-8 mt-md-1 mt-4 pe-lg-4">
              <div class="current-weather bg-primary text-white py-2 px-4 rounded-3 d-flex justify-content-between"> 
                <div>
                  <h3 class="fw-bold current-city">Now</h3>
                  <h5 class="font-s" id="current-temp">Temperature: ${Math.round(currentWeather.temperature)}°C</h5>
                  <h5 id="current-wind">Wind: ${Math.round(currentWeather.windspeed)} km/h</h5>
                </div>
                <div class="text-center me-lg-5 mt-lg-3 mb-lg-3 weather-icon">
                  <img src="/public/${weatherIcon}.png" alt="">
                </div>
              </div>
            <h4 class="fw-bold my-4">5-Day Forecast</h4>
            <div class="weather-forecast row row-cols-sm-2 row-cols-lg-4 row-cols-xl-5 justify-content-between">
            </div>
          </div>
      </div>
  </div>`
  forecastLoad(dailyWeather);
}
 


  const forecastLoad=(dailyWeather)=>{
    const weatherForecast=document.querySelector(".weather-forecast");
    weatherForecast.innerHTML=``;
    for(let i=1;i<=5;i++){
      let day=dateConverter(dailyWeather.time[i]);
      let weatherIcon=getWeatherIcon(dailyWeather.weathercode[i]);
      weatherForecast.innerHTML+=`
      <div class="col-12 col-md-6 col-lg-6 col-xl-3 mb-3">
      <div class="card border-0 bg-secondary text-white ">
        <div class="card-body p-3 text-white d-flex justify-content-between">
          <div>
              <h5 class="card-title fw-semibold">${day}</h5>
              <h6 class="card-text my-3 mt-3">Max Temperature:${Math.round(dailyWeather.apparent_temperature_max[i])}°C</h6>
              <h6 class="card-text my-3 mt-3">Min Temp:${Math.round(dailyWeather.apparent_temperature_min[i])}°C</h6>
              <h6 class="card-text my-3 mt-3">Wind:${Math.round(dailyWeather.windspeed_10m_max[i])}km/h</h6>
          </div>
          <div class="text-center">
              <img class="weather-icon-card" src="/public/${weatherIcon}.png" alt="">
            </div>
        </div>
      </div>
     </div>
      `
    }
  }


  const dateConverter=(ms)=>{
    ms*=1000;
    let date=new Date(ms);
    return daysOfWeek[date.getDay()];
  }
