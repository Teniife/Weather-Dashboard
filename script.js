var searchHistory = [];
var weatherApiRootUrl = "https://api.openweathermap.org";
var weatherApiKey = "1933c5b03b24aef3f069e95fa147d52c";
var searchForm = document.querySelector("#search-form");
var searchInput = document.querySelector("#search-input");
var presentDayContainer = document.querySelector("#present-day");
var weatherContainer = document.querySelector("#weather-forecast");
var searchHistoryContainer = document.querySelector("#search-history");

// Add timezone plugins to day.js
dayjs.extend(window.dayjs_plugin_utc);
dayjs.extend(window.dayjs_plugin_timezone);

// Function to display the search history list.
function displaySearchHistory() {
  searchHistoryContainer.innerHTML = "";

  // Start at end of history array and count down to show the most recent at the top.
  for (var i = searchHistory.length - 1; i >= 0; i--) {
    var button = document.createElement("button");
    button.setAttribute("type", "button");
    button.setAttribute("aria-controls", "today forecast");
    button.classList.add("history-btn", "button-history");

    button.setAttribute("data-search", searchHistory[i]);
    button.textContent = searchHistory[i];
    searchHistoryContainer.append(button);
  }
}

// Function to update history in local storage then updates displayed history.
function appendToHistory(search) {
  // If there is no search term return the function
  if (searchHistory.indexOf(search) !== -1) {
    return;
  }
  searchHistory.push(search);

  localStorage.setItem("search-history", JSON.stringify(searchHistory));
  displaySearchHistory();
}

// Function to get search history from local storage
function showInSearchHistory() {
  var savedHistory = localStorage.getItem("search-history");
  if (savedHistory) {
    searchHistory = JSON.parse(savedHistory);
  }
  displaySearchHistory();
}

// Display the current weather data fetched from OpenWeather api.
function renderCurrentWeather(city, weather) {
  var Currentday = dayjs().format("MM/DD/YYYY");
  var temperature = weather.main.temp;
  var windSpeed = weather.wind.speed;
  var humidity = weather.main.humidity;
  var iconUrl = `https://openweathermap.org/img/w/${weather.weather[0].icon}.png`;
  var iconDescription = weather.weather[0].description || weather[0].main;

  var card = document.createElement("div");
  var cardBody = document.createElement("div");
  var heading = document.createElement("h2");
  var weatherIcon = document.createElement("img");
  var tempEl = document.createElement("p");
  var windEl = document.createElement("p");
  var humidityEl = document.createElement("p");

  card.setAttribute("class", "card");
  cardBody.setAttribute("class", "card-body");
  card.append(cardBody);

  heading.setAttribute("class", "h3 card-title");
  tempEl.setAttribute("class", "card-text");
  windEl.setAttribute("class", "card-text");
  humidityEl.setAttribute("class", "card-text");

  heading.textContent = `${city} (${Currentday})`;
  weatherIcon.setAttribute("src", iconUrl);
  weatherIcon.setAttribute("alt", iconDescription);
  weatherIcon.setAttribute("class", "weather-img");
  heading.append(weatherIcon);
  tempEl.textContent = `Temp: ${temperature}°F`;
  windEl.textContent = `Wind: ${windSpeed} MPH`;
  humidityEl.textContent = `Humidity: ${humidity} %`;
  cardBody.append(heading, tempEl, windEl, humidityEl);

  presentDayContainer.innerHTML = "";
  presentDayContainer.append(card);
}

function renderForecastCard(forecast) {
  // variables for data from api
  var iconUrl = `https://openweathermap.org/img/w/${forecast.weather[0].icon}.png`;
  var iconDescription = forecast.weather[0].description;
  var temperature = forecast.main.temp;
  var humidity = forecast.main.humidity;
  var windSpeed = forecast.wind.speed;

  // Create elements for a card
  var col = document.createElement("div");
  var card = document.createElement("div");
  var cardBody = document.createElement("div");
  var cardTitle = document.createElement("h5");
  var weatherIcon = document.createElement("img");
  var tempEl = document.createElement("p");
  var windEl = document.createElement("p");
  var humidityEl = document.createElement("p");

  col.append(card);
  card.append(cardBody);
  cardBody.append(cardTitle, weatherIcon, tempEl, windEl, humidityEl);

  
  col.classList.add("five-day-card");
  card.setAttribute("class", "card");
  cardBody.setAttribute("class", "card-body");
  tempEl.setAttribute("class", "card-text");
  windEl.setAttribute("class", "card-text");
  humidityEl.setAttribute("class", "card-text");

  // Add content to elements
  cardTitle.textContent = dayjs(forecast.dt_txt).format("MM/DD/YYYY");
  weatherIcon.setAttribute("src", iconUrl);
  weatherIcon.setAttribute("alt", iconDescription);
  tempEl.textContent = `Temp: ${temperature} °F`;
  windEl.textContent = `Wind: ${windSpeed} MPH`;
  humidityEl.textContent = `Humidity: ${humidity} %`;

  weatherContainer.append(col);
}

// Display 5 day forecast.
function renderForecast(dailyForecast) {
  // Create timestamps for the start and end of the 5 day forecast
  var startDate = dayjs().add(1, "day").startOf("day").unix();
  var endDate = dayjs().add(6, "day").startOf("day").unix();

  var headingCol = document.createElement("div");
  var heading = document.createElement("h4");

  headingCol.setAttribute("class", "headcol");
  heading.textContent = "5-Day Forecast:";
  headingCol.append(heading);

  weatherContainer.innerHTML = "";
  weatherContainer.append(headingCol);

  for (var i = 0; i < dailyForecast.length; i++) {

    if (dailyForecast[i].dt >= startDate && dailyForecast[i].dt < endDate) {

     
      if (dailyForecast[i].dt_txt.slice(11, 13) == "12") {
        renderForecastCard(dailyForecast[i]);
      }
    }
  }
}

function renderItems(city, data) {
  renderCurrentWeather(city, data.list[0], data.city.timezone);
  renderForecast(data.list);
}

function fetchWeather(location) {
  var { lat } = location;
  var { lon } = location;
  var city = location.name;

  var apiUrl = `${weatherApiRootUrl}/data/2.5/forecast?lat=${lat}&lon=${lon}&units=imperial&appid=${weatherApiKey}`;

  fetch(apiUrl)
    .then(function (res) {
      return res.json();
    })
    .then(function (data) {
      renderItems(city, data);
    })
    .catch(function (err) {
      console.error(err);
    });
}

function fetchCoords(search) {
  var apiUrl = `${weatherApiRootUrl}/geo/1.0/direct?q=${search}&limit=5&appid=${weatherApiKey}`;

  fetch(apiUrl)
    .then(function (res) {
      return res.json();
    })
    .then(function (data) {
      if (!data[0]) {
        alert("Location not found");
      } else {
        appendToHistory(search);
        fetchWeather(data[0]);
      }
    })
    .catch(function (err) {
      console.error(err);
    });
}

function handleSearchFormSubmit(e) {
    if (!searchInput.value) {
    return;
  }

  e.preventDefault();
  var search = searchInput.value.trim();
  fetchCoords(search);
  searchInput.value = "";
}

function handleSearchHistoryClick(e) {
  // Don't do search if current elements is not a search history button
  if (!e.target.matches(".button-history")) {
    return;
  }

  var button = e.target;
  var search = button.getAttribute("data-search");
  fetchCoords(search);
}

showInSearchHistory();
searchForm.addEventListener("submit", handleSearchFormSubmit);
searchHistoryContainer.addEventListener("click", handleSearchHistoryClick);
