class SearchGeoData {

    constructor(lat, lon, municipality, town, suburb, country, district, city){
        this.lat = lat
        this.lon = lon
        this.municipality = municipality
        this.town = town
        this.suburb = suburb
        this.country = country
        this.district = district 
        this.city = city 
    }
}

class SearchWeatherData {

    constructor(currentTemp,currentWeatherCode, maxTemp, minTemp, rainSum, dailyWeatherCode,
        hourlyApparentTemp, hourlyPrecipitation, hourlyWindSpeed, hourlyRelativeHumidity,
        hourlyTemp, hourlyWeatherCode){
        this.currentTemp = currentTemp
        this.currentWeatherCode = currentWeatherCode
        this.maxTemp = maxTemp
        this.minTemp = minTemp
        this.rainSum = rainSum
        this.dailyWeatherCode = dailyWeatherCode
        this.hourlyApparentTemp = hourlyApparentTemp
        this.hourlyPrecipitation = hourlyPrecipitation
        this.hourlyWindSpeed = hourlyWindSpeed
        this.hourlyRelativeHumidity = hourlyRelativeHumidity
        this.hourlyTemp = hourlyTemp
        this.hourlyWeatherCode = hourlyWeatherCode
    }
}

export class SearchService {

    constructor(lat, lon, location) {
        this.lat = lat
        this.lon = lon
        this.location = location
    }

    updateLocation(lat, lon, location) {
        this.lat = lat;
        this.lon = lon;
        this.location = location;
    }

    //Takes coordinates and returns weather data via API
    fetchWeatherData(lat = this.lat, lon = this.lon){

        return fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code&hourly=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation_probability,precipitation,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,rain_sum&timezone=Europe%2FBerlin`)
            .then(response => response.json())
            .then(data => {
                return new SearchWeatherData(
                    data.current.temperature_2m, 
                    data.current.weather_code,
                    data.daily.temperature_2m_max,
                    data.daily.temperature_2m_min,
                    data.daily.rain_sum,
                    data.daily.weather_code,
                    data.hourly.apparent_temperature,
                    data.hourly.precipitation,
                    data.hourly.wind_speed_10m,
                    data.hourly.relative_humidity_2m,
                    data.hourly.temperature_2m,
                    data.hourly.weather_code
                )
            })
            .catch(error => {
                console.error("Error fetching weather data:", error)
            })
        }

    //Takes coordinates and returns a location
    coordsToLocation(lat = this.lat, lon = this.lon){

        return fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`)
        .then(response => response.json())
        .then(data => {
            return new SearchGeoData(
                data.lat,
                data.lon,
                data.address.municipality,
                data.address.town, 
                data.address.suburb,
                data.address.country
            )
        })
        .catch(error => {
            console.error("Error retrieving location:", error)
        })
    }

    //Takes a string argument then use that string to fetch a location
    getLocationFromString(location = this.location){

        return fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(location)}&format=json&addressdetails=1`, {
            headers: {
                'Accept-Language': 'en'
            }
        })
        .then(response => response.json())
        .then(data => {
            return new SearchGeoData(
                data[0].lat,
                data[0].lon,
                data[0].address.municipality,
                data[0].address.town,
                data[0].address.suburb,
                data[0].address.country,
                data[0].address.city_district,
                data[0].address.city
            )
        })
        .catch(error => {
            console.error("Error retrieving location:", error)
        })
    } 

    //Gets user location via HTML geolocation, returns coordinates
    getUserLocation(){

        return new Promise((resolve, reject) => {

            if(navigator.geolocation){
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        const searchGeoData = new SearchGeoData(
                            position.coords.latitude,
                            position.coords.longitude
                        )
                        resolve(searchGeoData)
                    },
                    (error) => reject(error)
                )
            }else{
                alert("Geolocation is not supported by this browser.")
            }
        })
    }


}
