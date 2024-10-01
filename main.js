import { SearchService } from "../Weathery2.0/searchservice.js"
import { RenderService } from "../Weathery2.0/renderservice.js"

const searchService = new SearchService()
const renderService = new RenderService()

let lastClickedCard = null;

function toggleList(){
    
    const icon = document.querySelector("#arrow")

    document.querySelector("#favorite-list").classList.toggle("open")
    
    setTimeout(() => {
        icon.classList.toggle("fa-angle-down");
        icon.classList.toggle("fa-angle-up");
    }, 100);
}

function toggleStarIcon(){

    const icon = document.querySelector("#click-to-favorite")
    
    icon.classList.toggle("fa-regular");
    icon.classList.toggle("fa-solid");
}

function currentLocation(){

    document.querySelector("#location-suburb").innerText = "Retrieving location..."
    document.querySelector("#location-municipality").innerText = ""

    searchService.getUserLocation()
        .then(data => {
            searchService.updateLocation(data.lat, data.lon)
        })
        .then(() => {
            searchService.fetchWeatherData()
            .then(data => {
                renderService.renderWeatherData(data)
                renderService.renderWeatherDetails(data)
            })
            searchService.coordsToLocation()
            .then(data => {
                renderService.renderGeoData(data)
            })
        })
}

function inputEnter(event){

    const searchBtn = document.querySelector("#search-btn")

    //Pressing Enter in the input field activates the search button
    if(event.key === "Enter"){
        searchBtn.click();
    }
}

function searchLocation(){

    const value = document.querySelector("#search-select").value

    if(value){
        document.querySelector("#location-suburb").innerText = "Retrieving location..."
        document.querySelector("#location-municipality").innerText = ""

        searchService.updateLocation(null, null, value)
    
        searchService.getLocationFromString(value)
        .then(data => {
            searchService.updateLocation(data.lat, data.lon)
            renderService.renderGeoData(data)
        })
        .then(() => {
            searchService.fetchWeatherData()
            .then(data => {
                renderService.renderWeatherData(data)
                renderService.renderWeatherDetails(data)
            })
        })
    }
}


function toggleFavorite(){

}

function expandWeatherDetails(event) {
    
    const clickedCard = event.currentTarget;
    const weatherDetails = document.querySelector("#weather-details")
    const interactiveMap = document.querySelector("#interactive-map")
    
    //Toggle weather details and interactive map if first click or clicking on the same card
    if (!lastClickedCard){
        weatherDetails.classList.toggle("toggled")
        interactiveMap.classList.toggle("toggled")

    }else if(lastClickedCard === clickedCard){
        weatherDetails.classList.remove("toggled")
        setTimeout(() => {
            interactiveMap.classList.remove("toggled")
        }, 150)
        lastClickedCard.classList.remove("clicked")
        lastClickedCard = null
        return

    }else{
        //If a different card is clicked, close the last one
        lastClickedCard.classList.remove("clicked")
    }
    
    clickedCard.classList.toggle("clicked")
    lastClickedCard = clickedCard
    getDailyDetails(clickedCard)
}

function getDailyDetails(clickedCard){
    searchService.fetchWeatherData()
        .then(data => {
            renderService.renderWeatherDetails(data, clickedCard.id)
        })
}

function main(){

    //Live clock
    let hrs = document.getElementById("hrs")
    let min = document.getElementById("min")

    setInterval(()=>{

    let currentTime = new Date();

    hrs.innerHTML = (currentTime.getHours()<10?"0":"") + currentTime.getHours();
    min.innerHTML = (currentTime.getMinutes()<10?"0":"") + currentTime.getMinutes();
    document.getElementById("semiCol").style.visibility = (document.getElementById("semiCol").style.visibility == 'hidden' ? '' : 'hidden');

    },1000)
     
    searchService.updateLocation(59.3505, 18.1461, "larsberg")
    
    searchService.getLocationFromString()
        .then(data => {
            renderService.renderGeoData(data)
        })
    
    searchService.fetchWeatherData()
        .then(data => {
            renderService.renderWeatherData(data)
        })
    
    renderService.renderDateAndDays()

}

window.document.onload = main()

//To enable global scoping on functions (because script file is type="module")
window.toggleList = toggleList;
window.toggleStarIcon = toggleStarIcon;
window.currentLocation = currentLocation;
window.inputEnter = inputEnter;
window.searchLocation = searchLocation;
window.toggleFavorite = toggleFavorite;
window.expandWeatherDetails = expandWeatherDetails;