const apiKey = '2f42e1156858f041ed75cdb4f82d6404'; 

let weatherData = [];
let currentPage = 1;
const rowsPerPage = 10;
const totalPages = 5;

document.getElementById('getWeatherBtn').addEventListener('click', async () => {
  const city = document.getElementById('cityInput').value;
  if (city) {
    const coords = await getCityCoordinates(city);
    if (coords) {
      await fetchWeatherData(coords.lat, coords.lon);
      renderTable(currentPage); 
      document.getElementById('weatherTableContainer').style.display = 'block';
    }
  } else {
    alert('Please enter a city name.');
  }
});

// Gets city coords
async function getCityCoordinates(city) {
  try {
    const response = await fetch(
      `https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${apiKey}`
    );
    const data = await response.json();
    if (data.length === 0) {
      alert('City not found!');
      return null;
    }
    return { lat: data[0].lat, lon: data[0].lon };
  } catch (error) {
    console.error('Error fetching city coordinates:', error);
    alert('Failed to fetch city coordinates.');
  }
}

// Fetch 5-day weather data this is done at 3hr intervals
async function fetchWeatherData(lat, lon) {
  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`
    );
    const data = await response.json();
    if (data.cod !== '200') {
      alert('Weather data not available!');
      return;
    }
    weatherData = data.list.map(item => ({
      time: item.dt_txt,
      temp: item.main.temp,
      humidity: item.main.humidity,
      windspeed: item.wind.speed,
      description: item.weather[0].description
    }));
  } catch (error) {
    console.error('Error fetching weather data:', error);
    alert('Failed to fetch weather data.');
  }
}

function renderTable(page) {
  const tbody = document.querySelector('#weatherTable tbody');
  tbody.innerHTML = '';

  const start = (page - 1) * rowsPerPage;
  const end = start + rowsPerPage;
  const paginatedData = weatherData.slice(start, end);

  paginatedData.forEach(item => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${new Date(item.time).toLocaleString()}</td>
      <td>${item.temp}°C</td>
      <td>${item.humidity}%</td>
      <td>${item.windspeed} m/s</td>
      <td>${item.description}</td>
    `;
    tbody.appendChild(row);
  });

  document.getElementById('pageInfo').textContent = `Page ${page} of ${totalPages}`;
}

document.getElementById('prevPage').addEventListener('click', () => {
  if (currentPage > 1) {
    currentPage--;
    renderTable(currentPage);
  }
});

document.getElementById('nextPage').addEventListener('click', () => {
  if (currentPage < totalPages) {
    currentPage++;
    renderTable(currentPage);
  }
});

document.getElementById('sortAscBtn').addEventListener('click', () => {
  weatherData.sort((a, b) => a.temp - b.temp);
  renderTable(currentPage);
});

document.getElementById('sortDescBtn').addEventListener('click', () => {
  weatherData.sort((a, b) => b.temp - a.temp);
  renderTable(currentPage);
});

document.getElementById('filterRainBtn').addEventListener('click', () => {
  const rainyDays = weatherData.filter(item => item.description.toLowerCase().includes('rain'));
  if (rainyDays.length > 0) {
    weatherData = rainyDays;
    currentPage = 1;
    renderTable(currentPage);
  } else {
    alert('No rainy days in the forecast!');
  }
});

document.getElementById('highestTempBtn').addEventListener('click', () => {
  const highestTempDay = weatherData.reduce((max, item) => item.temp > max.temp ? item : max, weatherData[0]);
  alert(`The day with the highest temperature is:\n${highestTempDay.time}: ${highestTempDay.temp}°C`);
});

document.getElementById('sendChat').addEventListener('click', () => {
  const query = document.getElementById('chatInput').value.trim();
  if (query) {
    if (query.toLowerCase().includes('temperature') || query.toLowerCase().includes('rain')||query.toLowerCase().includes('cloud')|| query.toLowerCase().includes('clear')|| query.toLowerCase().includes('humidity')||query.toLowerCase().includes('windspeed')) {
      handleWeatherQuery(query);
    } else {
      displayChatResponse(`You: ${query}`);
      displayChatResponse(`Bot: I can assist you with weather-related queries, such as "What is the highest temperature?" or "Temperature on Tuesday?" etc.`);
    }
    //This will clear the inputbox after sending message
    document.getElementById('chatInput').value = '';
  } else {
    alert('Please enter a query.');
  }
});

//This will handle weather-related queries 
function handleWeatherQuery(query) {
  const lowerQuery = query.toLowerCase();
  let response = '';

  if (lowerQuery.includes('highest temperature')) {
    const highestTempDay = weatherData.reduce((max, item) => item.temp > max.temp ? item : max, weatherData[0]);
    response = `The day with the highest temperature is ${new Date(highestTempDay.time).toLocaleString()} with ${highestTempDay.temp}°C.`;
  } else if (lowerQuery.includes('lowest temperature')) {
    const minTempDay = weatherData.reduce((min, item) => item.temp < min.temp ? item : min, weatherData[0]);
    response = `The day with the lowest temperature is ${new Date(minTempDay.time).toLocaleString()} with ${minTempDay.temp}°C.`;
} else if (lowerQuery.includes('average temperature')) {
    const avgtemp = weatherData.reduce((sum, item) => sum + item.temp, 0) / weatherData.length;
    response = `The average temp for the forecast period is ${avgtemp.toFixed(2)} C.`;
} else if (lowerQuery.includes('rainy days')) {
    const rainyDays = weatherData.filter(item => item.description.toLowerCase().includes('rain')).length;
    response = `There are ${rainyDays} rainy days in the upcoming forecast.`;
  } else if (lowerQuery.includes('clear days')) {
    const clearDays = weatherData.filter(item => item.description.toLowerCase().includes('clear')).length;
    response = `There are ${clearDays} clear days in the upcoming forecast.`;
  } else if (lowerQuery.includes('average humidity')) {
    const avgHumidity = weatherData.reduce((sum, item) => sum + item.humidity, 0) / weatherData.length;
    response = `The average humidity for the forecast period is ${avgHumidity.toFixed(2)}%.`;
  } else if (lowerQuery.includes('average windspeed')) {
    const avgWindSpeed = weatherData.reduce((sum, item) => sum + item.windspeed, 0) / weatherData.length;
    response = `The average wind speed for the forecast period is ${avgWindSpeed.toFixed(2)} m/s.`;
  } else if (lowerQuery.includes('highest humidity')) {
    const highestHumidity = weatherData.reduce((max, item) => item.humidity > max.humidity ? item : max, weatherData[0]);
    response = `The highest humidity is ${highestHumidity.humidity}% on ${new Date(highestHumidity.time).toLocaleString()}.`;
  } else if (lowerQuery.includes('lowest humidity')) {
    const lowestHumidity = weatherData.reduce((min, item) => item.humidity < min.humidity ? item : min, weatherData[0]);
    response = `The lowest humidity is ${lowestHumidity.humidity}% on ${new Date(lowestHumidity.time).toLocaleString()}.`;
  
  } else {
    const dayOfWeek = extractDayFromQuery(query); // Extracts day from userinput
    if (dayOfWeek) {
      const dayWeather = weatherData.find(item => new Date(item.time).toLocaleString('en-US', { weekday: 'long' }).toLowerCase() === dayOfWeek);
      if (dayWeather) {
        response = `The temperature on ${dayOfWeek.charAt(0).toUpperCase() + dayOfWeek.slice(1)} is ${dayWeather.temp}°C with ${dayWeather.description}.`;
      } else {
        response = `Sorry, I couldn't find weather data for ${dayOfWeek}.`;
      }
    } else {
      response = 'I did not understand your query. You can ask things like "Highest temperature" or "Temperature on Monday."';
    }
  }

  displayChatResponse(`You: ${query}`);
  displayChatResponse(`Bot: ${response}`);
}

//This will extract the day of the week from the user's query 
function extractDayFromQuery(query) {
  const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  const lowerQuery = query.toLowerCase();

  return daysOfWeek.find(day => lowerQuery.includes(day)) || null;
}

//Ths will display chatbot response in the chatbox
function displayChatResponse(response) {
  const chatbox = document.getElementById('chatbox');
  const message = document.createElement('div');
  message.textContent = response;
  chatbox.appendChild(message);

  //Thiswill ensure that the chatbox scrolls to the bottom when a new message is added
  chatbox.scrollTop = chatbox.scrollHeight;
}
