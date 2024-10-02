export class RenderService {

    constructor(){
        //Gets the html weather elements to update
        this.currentTemp = document.querySelector("#current-temp")
        this.icons = []
        this.minMax = []
        this.avg = []
        this.rain = []

        this.hourlyTemp = []
        this.hourlyApparentTemp = []
        this.hourlyPrecipitation = []
        this.hourlyWindSpeed = []
        this.hourlyHumidity = []
        this.hourlyIcons = []

        //Gets the html day elements to update
        this.dateToday = document.querySelector("#date-today")
        this.dateDay = []
        this.day = []

        //Gets the html location elements to update
        this.suburb = document.querySelector("#location-suburb")
        this.municipality = document.querySelector("#location-municipality")

        //Gets multiple elements for the next 5 days
        for(let i = 0; i < 6; i++){
        
            this.icons[i] = document.querySelector(`#icon${i}`)
            this.minMax[i] = document.querySelector(`#minmax${i}`)
            this.rain[i] = document.querySelector(`#rain${i}`)
            if(i < 5){  //to avoid error
                this.avg[i] = document.querySelector(`#avg${i+1}`)
            }
            
            this.day[i] = document.querySelector(`#day${i+1}`)
            this.dateDay[i] = document.getElementById(`date-day${i+1}`)
        }

        //multiple elements for weather details
        for(let i = 0; i < 24; i++){
        
            this.hourlyTemp[i] = document.querySelector(`#h-temp${i}`)
            this.hourlyPrecipitation[i] = document.querySelector(`#h-precipitation${i}`)
            this.hourlyWindSpeed[i] = document.querySelector(`#h-wind-speed${i}`)
            this.hourlyHumidity[i] = document.querySelector(`#h-humidity${i}`)
            this.hourlyIcons[i] = document.querySelector(`#h-icons${i}`)
            }
    }

    renderWeatherData(data){

        this.currentTemp.innerText = `${data.currentTemp.toFixed(1)}°C `
        
        for(let i = 0; i < 6; i++){

            this.minMax[i].innerText = `${data.minTemp[i].toFixed(1)}°C / ${data.maxTemp[i].toFixed(1)}°C`   
            this.icons[i].innerText = this.getWeatherDescr(data.dailyWeatherCode[i])
            this.rain[i].innerText = `${data.rainSum[i].toFixed(1)} mm.`
            if (i < 5) {//to avoid error
                this.avg[i].innerText = ((data.minTemp[i+1] + data.maxTemp[i+1]) / 2).toFixed(1) + "°C";
            }
        }
    }
    
    renderWeatherDetails(data, clickedCard){
        let cardIndex = null;
        let offset = null;
        //card0 -> 0
        if(clickedCard){
            cardIndex = parseInt(clickedCard.replace('card', ''))
            offset = cardIndex * 24
        }
    
        for (let i = 0; i < 24; i++) {
            let y = i + offset//Use the offset for hourly data
    
            this.hourlyTemp[i].innerText = `${data.hourlyTemp[y].toFixed(1)}°C`;
            this.hourlyPrecipitation[i].innerText = `${data.hourlyPrecipitation[y].toFixed(1)} mm`;
            this.hourlyWindSpeed[i].innerText = `${data.hourlyWindSpeed[y].toFixed(1)} km/h`;
            this.hourlyHumidity[i].innerText = `${data.hourlyRelativeHumidity[y]}`;
            this.hourlyIcons[i].innerText = this.getWeatherDescr(data.hourlyWeatherCode[y]);
        }
    }
    

    renderGeoData(data){
        if(data.suburb && data.town){
            this.suburb.innerText = `${data.suburb}, ${data.town}`
        }else{
            this.suburb.innerText = data.suburb || data.town || data.city || "Could not recieve data"
        }
        this.municipality.innerText = data.district || data.municipality || data.country || ""
    }

    renderDateAndDays(){

        //Gets current date and seperates it to different variables
        const dateObj = new Date();
        const month = dateObj.getUTCMonth() + 1; //+1 because month index starts at 0
        const date = dateObj.getUTCDate();
        const day = dateObj.getUTCDay(); 

        const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
        
        this.dateToday.innerText = `${[date]} ${monthsMap[month]}`

        //Renders the weekday to weatherCards
        for (let i = 1; i < 6; i++) {
            const nextDay = (day + i) % 7; // Modulus 7 ensures that day wraps around after 7 days
            document.getElementById(`day${i + 1}`).innerText = dayMap[nextDay === 0 ? 7 : nextDay];
        }

        //Renders the date to weatherCards
        for (let i = 1; i < 6; i++) {
            const daysThisMonth = daysInMonth[month]
            let nextDay = date + i
        
            //if nextDay exceeds the days in the current month, go to to the next month
            if (nextDay > daysThisMonth) {
                nextDay -= daysThisMonth
                this.dateDay[i].innerText = `${nextDay} ${monthsMap[(month + 1) % 12]}` //next month
            } else {
                this.dateDay[i].innerText = `${nextDay} ${monthsMap[month]}`
            }
        }
    }


    getWeatherDescr(weatherCode){
        const weatherCodeMap = {
            0: "☀️",
            1: "🌤️",
            2: "⛅",
            3: "⛅",
            45: "🌫️",
            48: "🌫️",
            51: "🌦️",
            53: "🌦️",
            55: "🌦️",
            61: "🌧️",
            63: "🌧️",
            71: "❄️",
            95: "⛈️"
        };
        return weatherCodeMap[weatherCode] || "?";
    }

    dayMap = {
            1: "Monday",
            2: "Tuesday",
            3: "Wednesday",
            4: "Thursday",
            5: "Friday",
            6: "Saturday",
            7: "Sunday"
        };
    

    monthsMap = {
        1: "Jan",
        2: "Feb",
        3: "Mar",
        4: "Apr",
        5: "May",
        6: "Jun",
        7: "Jul",
        8: "Aug",
        9: "Sep",
        10: "Okt",
        11: "Nov",
        12: "Dec"
    }

}



