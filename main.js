import { SearchService } from "../Weathery2.0/searchservice.js"
import { RenderService } from "../Weathery2.0/renderservice.js"

const searchService = new SearchService()
const renderService = new RenderService()

let lastClickedCard = null;
const favoriteList = []

function toggleList(){
    
    const icon = document.querySelector("#arrow")

    document.querySelector("#favorite-list").classList.toggle("open")
    
    setTimeout(() => {
        icon.classList.toggle("fa-angle-down");
        icon.classList.toggle("fa-angle-up");
    }, 100);
}

function addedStarIcon(){
    const icon = document.querySelector("#click-to-favorite")

    if(!icon.classList.contains("fa-solid")){
        icon.classList.remove("fa-regular");
        icon.classList.add("fa-solid");
    }
}

function removedStarIcon(){
    const icon = document.querySelector("#click-to-favorite")

    if(!icon.classList.contains("fa-regular")){
        icon.classList.add("fa-regular");
        icon.classList.remove("fa-solid");
    }
}

function currentLocation(){

    document.querySelector("#location-suburb").innerText = "Retrieving location..."
    document.querySelector("#location-municipality").innerText = ""

    let alreadyFavorited = false;

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

                //Checks if the location is favorited, and changes the star icon if it is
                for(let i = 0; i < favoriteList.length; i++){

                    if(favoriteList[i].lat === data.lat && favoriteList[i].lon === data.lon){
                        addedStarIcon()
                        alreadyFavorited = true;
                        break
                    }
                }
                if(!alreadyFavorited){
                    removedStarIcon()
                }
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
    let alreadyFavorited = false;

    console.log(favoriteList)

    if(value){
        document.querySelector("#location-suburb").innerText = "Retrieving location..."
        document.querySelector("#location-municipality").innerText = ""

        searchService.updateLocation(null, null, value)
    
        searchService.getLocationFromString(value)
        .then(data => {
            console.log(data)
            searchService.updateLocation(data.lat, data.lon)
            renderService.renderGeoData(data)

            //Checks if the location is favorited, and changes the star icon if it is
            for(let i = 0; i < favoriteList.length; i++){

                if(favoriteList[i].lat === data.lat && favoriteList[i].lon === data.lon){
                    addedStarIcon()
                    alreadyFavorited = true;
                    break
                }
            }
            if(!alreadyFavorited){
                removedStarIcon()
            }
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

function createListItem(location) {
    const favoriteDropDownList = document.querySelector("#favorite-list")
    const newListItem = document.createElement('li')
    
    newListItem.className = "location-li"
    newListItem.id = favoriteList.length
    newListItem.textContent = location
    
    console.log(favoriteList)

    //Add a click event listener for the list item
    newListItem.addEventListener("click", (event) => {
        console.log("Insert search logic here. Location: " + event.target.id)
        console.log(favoriteList[event.target.id - 1])

        const targetFavorite = favoriteList[event.target.id - 1]

        searchService.updateLocation(targetFavorite.lat, targetFavorite.lon, targetFavorite.suburb || targetFavorite.town || targetFavorite.municipality)
        
        searchService.fetchWeatherData()
        .then(data => {
            renderService.renderWeatherData(data)
            renderService.renderWeatherDetails(data)
        })
        searchService.coordsToLocation(targetFavorite.lat, targetFavorite.lon)
        .then(data => {
            renderService.renderGeoData(data)
        })
        

        addedStarIcon()

    })

    favoriteDropDownList.appendChild(newListItem) //Append the new list item to the favorite list
}

function removeListItem(data){

    const favoriteListItems = document.querySelectorAll(".location-li")

    const listItemToRemove = Array.from(favoriteListItems).find(item => item.innerText === data);

    listItemToRemove.remove()
}

function toggleFavorite(){

    let alreadyFavorited = false;

    searchService.coordsToLocation(searchService.lat, searchService.lon)
    .then(data => {
        console.log(data)
        if(favoriteList.length === 0){

            favoriteList.push(data)
            createListItem(data.suburb || data.town || data.city)
            addedStarIcon()
        }else{
            for(let i = 0; i < favoriteList.length; i++){

                if(favoriteList[i].lat === data.lat && favoriteList[i].lon === data.lon){
                console.log(`already favorited at index: ${i}`)
                favoriteList.splice(i, 1)
                alreadyFavorited = true;
                removeListItem(data.suburb || data.town || data.city)
                removedStarIcon()
                break
                }
            }
            if(!alreadyFavorited){

                favoriteList.push(data)
                createListItem(data.suburb)
                addedStarIcon()
            }
        }   
    console.log(favoriteList)
    })
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
     
    searchService.updateLocation(59.3486507, 18.1456932, "larsberg")
    
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
window.removedStarIcon = removedStarIcon;
window.addedStarIcon = addedStarIcon;
window.currentLocation = currentLocation;
window.inputEnter = inputEnter;
window.searchLocation = searchLocation;
window.toggleFavorite = toggleFavorite;
window.expandWeatherDetails = expandWeatherDetails;
window.createListItem = createListItem;
window.removeListItem = removeListItem;