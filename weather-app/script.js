
/* =========================================
   1. HTML ELEMENTS
========================================= */

const cityInput = document.getElementById("cityInput");
const searchButton = document.getElementById("searchButton");
const locationButton = document.getElementById("locationButton");

const cityName = document.getElementById("cityName");
const temperature = document.getElementById("temperature");
const description = document.getElementById("description");
const feelsLike = document.getElementById("feelsLike");
const maxTemp = document.getElementById("maxTemp");
const minTemp = document.getElementById("minTemp");
const humidity = document.getElementById("humidity");
const wind = document.getElementById("wind");
const lastUpdated = document.getElementById("lastUpdated");
const weatherIcon = document.getElementById("weatherIcon");


/* =========================================
   2. WEATHER DESCRIPTION AND ICON
========================================= */

function getWeatherInfo(code) {

    if (code === 0) {
        return {
            description: "Clear Sky",
            icon: "☀️",
            type: "sunny"
        };

    } else if (code === 1) {
        return {
            description: "Mainly Clear",
            icon: "🌤️",
            type: "sunny"
        };

    } else if (code === 2) {
        return {
            description: "Partly Cloudy",
            icon: "⛅",
            type: "cloudy"
        };

    } else if (code === 3) {
        return {
            description: "Overcast",
            icon: "☁️",
            type: "cloudy"
        };

    } else if (code === 45 || code === 48) {
        return {
            description: "Foggy",
            icon: "🌫️",
            type: "cloudy"
        };

    } else if (code >= 51 && code <= 57) {
        return {
            description: "Drizzle",
            icon: "🌦️",
            type: "rainy"
        };

    } else if (code >= 61 && code <= 67) {
        return {
            description: "Rainy",
            icon: "🌧️",
            type: "rainy"
        };

    } else if (code >= 71 && code <= 77) {
        return {
            description: "Snowy",
            icon: "🌨️",
            type: "snowy"
        };

    } else if (code >= 80 && code <= 82) {
        return {
            description: "Rain Showers",
            icon: "🌦️",
            type: "rainy"
        };

    } else if (code === 85 || code === 86) {
        return {
            description: "Snow Showers",
            icon: "🌨️",
            type: "snowy"
        };

    } else if (code >= 95 && code <= 99) {
        return {
            description: "Thunderstorm",
            icon: "⛈️",
            type: "rainy"
        };

    } else {
        return {
            description: "Unknown Weather",
            icon: "🌡️",
            type: "cloudy"
        };
    }
}


/* =========================================
   3. CHANGE BACKGROUND
========================================= */

function changeWeatherBackground(type) {

    document.body.classList.remove(
        "sunny",
        "cloudy",
        "rainy",
        "snowy"
    );

    document.body.classList.add(type);
}


/* =========================================
   4. GET WEATHER DATA
========================================= */

async function getWeather(latitude, longitude, city) {

    const url =
        `https://api.open-meteo.com/v1/forecast` +
        `?latitude=${latitude}` +
        `&longitude=${longitude}` +
        `&current=temperature_2m,relative_humidity_2m,apparent_temperature,wind_speed_10m,weather_code` +
        `&daily=temperature_2m_max,temperature_2m_min` +
        `&timezone=auto`;

    try {

        description.textContent = "Loading weather...";
        searchButton.disabled = true;
        locationButton.disabled = true;

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error("Weather data could not be loaded.");
        }

        const data = await response.json();

        if (!data.current || !data.daily) {
            throw new Error("Weather information is unavailable.");
        }

        const current = data.current;
        const daily = data.daily;

        // City name
        cityName.textContent = city;

        // Current temperature
        temperature.textContent =
            Math.round(current.temperature_2m) + "°C";

        // Feels like temperature
        feelsLike.textContent =
            Math.round(current.apparent_temperature) + "°C";

        // Maximum temperature
        maxTemp.textContent =
            Math.round(daily.temperature_2m_max[0]) + "°C";

        // Minimum temperature
        minTemp.textContent =
            Math.round(daily.temperature_2m_min[0]) + "°C";

        // Humidity
        humidity.textContent =
            current.relative_humidity_2m + "%";

        // Wind speed
        wind.textContent =
            Math.round(current.wind_speed_10m) + " km/h";

        // Weather description and icon
        const weatherInfo = getWeatherInfo(current.weather_code);

        description.textContent = weatherInfo.description;
        weatherIcon.textContent = weatherInfo.icon;

        // Change background
        changeWeatherBackground(weatherInfo.type);

        // Update time
        lastUpdated.textContent =
            "Last checked: " + new Date().toLocaleTimeString();

    } catch (error) {

        console.error("Weather Error:", error);

        description.textContent =
            "Could not load weather data. Please try again.";

    } finally {

        searchButton.disabled = false;
        locationButton.disabled = false;
    }
}


/* =========================================
   5. SEARCH FOR A CITY
========================================= */

async function searchCity() {

    const city = cityInput.value.trim();

    if (city === "") {
        alert("Please enter a city name!");
        return;
    }

    const url =
        "https://geocoding-api.open-meteo.com/v1/search" +
        "?name=" + encodeURIComponent(city) +
        "&count=1&language=en&format=json";

    try {

        description.textContent = "Searching for city...";
        searchButton.disabled = true;
        locationButton.disabled = true;

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error("City search failed.");
        }

        const data = await response.json();

        if (!data.results || data.results.length === 0) {

            description.textContent = "City not found!";
            return;
        }

        const result = data.results[0];

        const latitude = result.latitude;
        const longitude = result.longitude;

        const cityResult = result.name;
        const country = result.country || "";

        const fullCityName = country
            ? `${cityResult}, ${country}`
            : cityResult;

        await getWeather(latitude, longitude, fullCityName);

    } catch (error) {

        console.error("Search Error:", error);

        description.textContent =
            "Search failed. Please try again.";

    } finally {

        searchButton.disabled = false;
        locationButton.disabled = false;
    }
}


/* =========================================
   6. GET CITY NAME FROM COORDINATES
========================================= */

async function getCityName(latitude, longitude) {

    const url =
        `https://api.bigdatacloud.net/data/reverse-geocode-client` +
        `?latitude=${latitude}` +
        `&longitude=${longitude}` +
        `&localityLanguage=en`;

    try {

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error("Could not find location name.");
        }

        const data = await response.json();

        const city =
            data.city ||
            data.locality ||
            data.principalSubdivision;

        const country = data.countryName || "";

        if (!city) {
            return country || "Your Current Location";
        }

        return country
            ? `${city}, ${country}`
            : city;

    } catch (error) {

        console.error("Location Name Error:", error);

        return "Your Current Location";
    }
}


/* =========================================
   7. SEARCH BUTTON
========================================= */

searchButton.addEventListener("click", function() {
    searchCity();
});


/* =========================================
   8. ENTER KEY
========================================= */

cityInput.addEventListener("keydown", function(event) {

    if (event.key === "Enter") {
        searchCity();
    }
});


/* =========================================
   9. CURRENT LOCATION
========================================= */

locationButton.addEventListener("click", function() {

    if (!navigator.geolocation) {

        alert("Geolocation is not supported by your browser.");
        return;
    }

    locationButton.disabled = true;
    locationButton.textContent = "Getting location...";

    navigator.geolocation.getCurrentPosition(

        async function(position) {

            try {

                const latitude = position.coords.latitude;
                const longitude = position.coords.longitude;

                const city = await getCityName(latitude, longitude);

                await getWeather(latitude, longitude, city);

            } catch (error) {

                console.error("Location Error:", error);

                description.textContent =
                    "Could not get your location weather.";

            } finally {

                locationButton.disabled = false;
                locationButton.textContent = "📍 Use My Location";
            }
        },

        function(error) {

            console.error("Location Error:", error);

            if (error.code === 1) {

                alert("Location permission was denied.");

            } else if (error.code === 2) {

                alert("Your location is unavailable.");

            } else if (error.code === 3) {

                alert("Location request timed out.");

            } else {

                alert("Unable to get your location.");
            }

            locationButton.disabled = false;
            locationButton.textContent = "📍 Use My Location";
        },

        {
            enableHighAccuracy: false,
            timeout: 15000,
            maximumAge: 60000
        }
    );
});


/* =========================================
   10. DEFAULT CITY
========================================= */

// Default weather: Reyhanli, Türkiye

getWeather(36.20, 36.16, "Reyhanli, Türkiye");
