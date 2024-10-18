const apiKey = '2f42e1156858f041ed75cdb4f82d6404'; 

let barChart, doughnutChart, lineChart;

const barChartCtx = document.getElementById('barChart').getContext('2d');
const doughnutChartCtx = document.getElementById('doughnutChart').getContext('2d');
const lineChartCtx = document.getElementById('lineChart').getContext('2d');


document.getElementById('getWeatherBtn').addEventListener('click', async () => {
  const city = document.getElementById('cityInput').value.trim();
  
  if (city) {
    const coords = await getCityCoordinates(city);
    if (coords) {
      await fetchWeatherData(coords.lat, coords.lon); 
    }
  } else {
    alert('Please enter a city name.');
  }
});

// This function is used to get the latitude and longitude of the city
async function getCityCoordinates(city) {
  try {
    const response = await fetch(
      `https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${apiKey}`
    );
    const data = await response.json();

    if (!response.ok) throw new Error(`Error: ${data.message}`);

    if (data.length === 0) {
      alert('City not found!');
      return null;
    }

    console.log(`Coordinates of ${city}:`, data[0]); 
    return { lat: data[0].lat, lon: data[0].lon };
  } catch (error) {
    console.error('Error fetching city coordinates:', error);
    alert('Failed to fetch city coordinates. Check console for details.');
  }
}

//This function will fetch weather data 
async function fetchWeatherData(lat, lon) {
  try {
    const weatherResponse = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`
    );

    const weatherData = await weatherResponse.json();

    if (!weatherResponse.ok) throw new Error(`Error: ${weatherData.message}`);

    console.log('Fetched Weather Data:', weatherData);

    updateWeatherWidget(weatherData);
    updateCharts(weatherData);
  } catch (error) {
    console.error('Error fetching weather data:', error);
    alert('Failed to fetch weather data. Check console for details.');
  }
}

let isCelsius = true; // This is used to check which state the toggle is in
let currentTemperatureCelsius = null; //This is used to store the temperature in Celsius

function updateWeatherWidget(data) {
  const cityName = data.city.name;
  const weatherDescription = data.list[0].weather[0].description;
  const temperatureCelsius = data.list[0].main.temp; //The temperatyre is in celsius by default
  const humidity = data.list[0].main.humidity;
  const windSpeed = data.list[0].wind.speed;
  const mainWeather = data.list[0].weather[0].main.toLowerCase();

  // This will store thetemperature in celsius for conversion later
  currentTemperatureCelsius = temperatureCelsius;


  document.getElementById('cityName').textContent = cityName;
  document.getElementById('weatherDescription').textContent = weatherDescription;
  updateTemperatureDisplay(); 
  document.getElementById('humidity').textContent = `${humidity} %`;
  document.getElementById('windSpeed').textContent = `${windSpeed} m/s`;

 
  const widget = document.getElementById('weatherWidget');
  widget.className = 'weather-widget'; 

  if (mainWeather.includes('clear')) {
    widget.style.backgroundImage = "url('clrsky.jpeg')";
  } else if (mainWeather.includes('cloud')) {
    widget.style.backgroundImage = "url('clouds.jpeg')";
  } else if (mainWeather.includes('rain')) {
    widget.style.backgroundImage = "url('R.jpeg')";
  } else if (mainWeather.includes('snow')) {
    widget.style.backgroundImage = "url('snow.jpeg')";
  } else if (mainWeather.includes('thunderstorm')) {
    widget.style.backgroundImage = "url('thunderstorm.jpeg')";
  } else if (mainWeather.includes('mist') || mainWeather.includes('fog')) {
    widget.style.backgroundImage = "url('mist.jpeg')";
  } else {
    widget.style.backgroundImage = "url('default.jpg')"; 
  }

  widget.style.backgroundSize = 'cover'; 
  widget.style.backgroundPosition = 'center';
}


function updateTemperatureDisplay() {
  const tempElement = document.getElementById('tempValue');
  const unitElement = document.getElementById('tempUnit');
  const temperature = isCelsius ? currentTemperatureCelsius : convertToFahrenheit(currentTemperatureCelsius);

  tempElement.textContent = `${temperature.toFixed(1)}`; //The temp is displayed to 1 dp
  unitElement.textContent = isCelsius ? 'C' : 'F';
}


function convertToFahrenheit(celsius) {
  return (celsius * 9) / 5 + 32;
}

document.getElementById('toggleTempUnit').addEventListener('click', () => {
  isCelsius = !isCelsius; 
  updateTemperatureDisplay(); 

  document.getElementById('toggleTempUnit').textContent = isCelsius ? 'Switch to °F' : 'Switch to °C';
});

//This is used to destroy existing charts before creating new ones
function resetChart(chart) {
  if (chart) {
    chart.destroy();
  }
}

function updateCharts(data) {
  const labels = [...new Set(data.list.map(item => item.dt_txt.split(' ')[0]))].slice(0, 5);
  const temps = data.list
    .filter((item, index) => index % 8 === 0)
    .map(item => item.main.temp);
  const weatherCounts = getWeatherCounts(data);

  resetChart(barChart);
  resetChart(doughnutChart);
  resetChart(lineChart);

  barChart = new Chart(barChartCtx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Temperature (°C)',
        data: temps,
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      }]
    },
    options: {
      animation: { delay: 500 },
      scales: { x: { stacked: true }, y: { beginAtZero: true } }
    }
  });

  doughnutChart = new Chart(doughnutChartCtx, {
    type: 'doughnut',
    data: {
      labels: Object.keys(weatherCounts),
      datasets: [{
        data: Object.values(weatherCounts),
        backgroundColor: ['#ff6384', '#36a2eb', '#ffce56'],
      }]
    },
    options: { animation: { delay: 500 } }
  });

  lineChart = new Chart(lineChartCtx, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: 'Temperature (°C)',
        data: temps,
        borderColor: 'rgba(255, 99, 132, 1)',
        fill: false,
      }]
    },
    options: { animation: { duration: 1000, easing: 'easeOutBounce' } }
  });
}


function getWeatherCounts(data) {
  const counts = {};
  data.list.forEach(item => {
    const condition = item.weather[0].main;
    counts[condition] = (counts[condition] || 0) + 1;
  });
  return counts;
}
