import { SearchService } from "./searchservice.js"
import { RenderService } from "./renderservice.js"
import { DomService } from "./domservice.js"

const searchService = new SearchService()
const renderService = new RenderService()
const domService = new DomService()

const favoriteList = []

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
                        domService.addedStarIcon()
                        alreadyFavorited = true;
                        break
                    }
                }
                if(!alreadyFavorited){
                    domService.removedStarIcon()
                }
            })
        })
}

function searchLocation(){

    const value = document.querySelector("#search-select").value
    let alreadyFavorited = false;


    if(value){
        document.querySelector("#location-suburb").innerText = "Retrieving location..."
        document.querySelector("#location-municipality").innerText = ""

        searchService.updateLocation(null, null, value)
    
        searchService.getLocationFromString(value)
        .then(data => {
            searchService.updateLocation(data.lat, data.lon)
            renderService.renderGeoData(data)

            //Checks if the location is favorited, and changes the star icon if it is
            for(let i = 0; i < favoriteList.length; i++){

                if(favoriteList[i].lat === data.lat && favoriteList[i].lon === data.lon){
                    domService.addedStarIcon()
                    alreadyFavorited = true;
                    break
                }
            }
            if(!alreadyFavorited){
                domService.removedStarIcon()
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

function createListItem(location){

    const favoriteDropDownList = document.querySelector("#favorite-list")
    const newListItem = document.createElement('li')
    
    newListItem.className = "location-li"
    newListItem.textContent = location

    //Add event listener for the list item
    newListItem.addEventListener("click", () => {
        const normalizedLocation = location.toLowerCase()//noramalized input to avoid bugs
        const targetFavorite = favoriteList.find(fav => 
            (fav.suburb && fav.suburb.toLowerCase() === normalizedLocation) || 
            (fav.town && fav.town.toLowerCase() === normalizedLocation) || 
            (fav.city && fav.city.toLowerCase() === normalizedLocation)
        )

        if (targetFavorite){

            searchService.updateLocation(targetFavorite.lat, targetFavorite.lon, targetFavorite.suburb || targetFavorite.town || targetFavorite.municipality);
            
            searchService.fetchWeatherData()
            .then(data => {
                renderService.renderWeatherData(data)
                renderService.renderWeatherDetails(data)
            })

            searchService.coordsToLocation(targetFavorite.lat, targetFavorite.lon)
            .then(data => {
                renderService.renderGeoData(data)
            })

            domService.addedStarIcon()
        }else{
            console.log("Favorite location not found for:", location)
        }
    })

    favoriteDropDownList.appendChild(newListItem)//Append the new list item to the favorite list
}

function removeListItem(data){

    const favoriteListItems = document.querySelectorAll(".location-li")

    const listItemToRemove = Array.from(favoriteListItems).find(item => 
        item.innerText === data.suburb ||
        item.innerText === data.town ||
        item.innerText === data.city
    )

    if (listItemToRemove){
        listItemToRemove.remove()
    }else{
        console.log("No matching item found to remove")
    }

    //Loop through localStorage to retrieve and remove matching data
    for(let i = localStorage.length - 1; i >= 0; i--){ //Loop backwards to avoid index issues while removing
        const key = localStorage.key(i)
        const value = localStorage.getItem(key)

        try{
            const parsedValue = JSON.parse(value)
            
            // Check if the parsed value matches any of the data properties
            const matches = (
                (parsedValue.suburb && parsedValue.suburb === data.suburb) ||
                (parsedValue.town && parsedValue.town === data.town) ||
                (parsedValue.city && parsedValue.city === data.city)
            )

            if(matches){
                localStorage.removeItem(key)
            }
        }catch(error){
            console.error(error)
        }
    }
}

function toggleFavorite(){

    searchService.coordsToLocation(searchService.lat, searchService.lon)
    .then(data => {
        const favoriteItem = {
            lat: data.lat,
            lon: data.lon,
            suburb: data.suburb || data.town || data.city // Ensure you choose the right property
        }

        // Check if the item already exists
        const index = favoriteList.findIndex(fav => 
            fav.lat === favoriteItem.lat && fav.lon === favoriteItem.lon
        )

        if(index > -1){
            //If already favorited remove it
            favoriteList.splice(index, 1)
            localStorage.removeItem(JSON.stringify(favoriteItem))
            removeListItem(favoriteItem)
            domService.removedStarIcon()
        }else{
            //If not favorited add it
            favoriteList.push(favoriteItem)
            localStorage.setItem(JSON.stringify(favoriteItem.suburb || favoriteItem.town || favoriteItem.city), JSON.stringify(favoriteItem))//Store in local storage
            createListItem(favoriteItem.suburb || favoriteItem.town || favoriteItem.city)//Create the list item
            domService.addedStarIcon()
        }
    });
}

function expandWeatherDetails(event){
    
    domService.expandWeatherDetails(event, searchService.lat, searchService.lon)
}

function getLocalStorageData(){

    if(localStorage.length > 0){
        domService.addedStarIcon()
    }
    
    // Loop through localStorage and create list items
    for (let i = 0; i < localStorage.length; i++){

        const key = localStorage.key(i);
        const value = localStorage.getItem(key)
        try{
            const parsedValue = JSON.parse(value)
            if (parsedValue){
                favoriteList.push(parsedValue)//Push to favoriteList

                const location = parsedValue.suburb || parsedValue.town || parsedValue.city
                createListItem(location)
            }
        }catch(error) {
            console.error("Error parsing data from localStorage:", error)
        }
    }
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

    getLocalStorageData()
     
    searchService.updateLocation(59.401352, 17.934977, "kista")
    
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
window.currentLocation = currentLocation;
window.searchLocation = searchLocation;
window.toggleFavorite = toggleFavorite;
window.expandWeatherDetails = expandWeatherDetails;
window.createListItem = createListItem;
window.removeListItem = removeListItem;
window.getLocalStorageData = getLocalStorageData;