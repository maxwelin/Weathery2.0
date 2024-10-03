import { SearchService } from "./searchservice.js"
import { RenderService } from "./renderservice.js"

const searchService = new SearchService()
const renderService = new RenderService()

export class DomService {
    constructor(){

        this.favoriteList = []
        this.arrowIcon = document.querySelector("#arrow")
        this.searchSelect = document.querySelector("#search-select")
        this.searchBtn = document.querySelector("#search-btn")
        this.favoriteListDropDown = document.querySelector("#favorite-list")
        this.weatherDetails = document.querySelector("#weather-details")
        this.interactiveMap = document.querySelector("#interactive-map")
        this.starIcon = document.querySelector("#click-to-favorite")
        this.favoriteDropDownList = document.querySelector("#favorite-list")
        
        this.lastClickedCard = null;
        

        this.searchSelect.addEventListener("click", this.toggleList.bind(this))
        this.arrowIcon.addEventListener("click", this.toggleList.bind(this))
        this.searchSelect.addEventListener("keydown", this.inputEnter.bind(this))
    }

    inputEnter(event){

    
        if(event.key === "Enter"){
            this.searchBtn.click()
            if(this.arrowIcon.classList.contains("fa-angle-up")){
                this.toggleList()
            }
        }
    }

    toggleList(){

    this.favoriteListDropDown.classList.toggle("open")
    
        setTimeout(() => {
            this.arrowIcon.classList.toggle("fa-angle-down")
            this.arrowIcon.classList.toggle("fa-angle-up")
        }, 100);
    }

    getDailyDetails(clickedCard, lat, lon){
        searchService.fetchWeatherData(lat, lon)
            .then(data => {
                renderService.renderWeatherDetails(data, clickedCard.id)
            })
    }

    expandWeatherDetails(event, lat = searchService.lat, lon = searchService.lon){
    
        const clickedCard = event.currentTarget
        
        //Toggle weather details and interactive map if first click or clicking on the same card
        if (!this.lastClickedCard){
            this.weatherDetails.classList.toggle("toggled")
            this.interactiveMap.classList.toggle("toggled")
    
        }else if(this.lastClickedCard === clickedCard){
            this.weatherDetails.classList.remove("toggled")
            setTimeout(() => {
                this.interactiveMap.classList.remove("toggled")
            }, 150)
            this.lastClickedCard.classList.remove("clicked")
            this.lastClickedCard = null
            return
    
        }else{
            //If a different card is clicked, close the last one
            this.lastClickedCard.classList.remove("clicked")
        }
        
        clickedCard.classList.toggle("clicked")
        this.lastClickedCard = clickedCard
        this.getDailyDetails(clickedCard, lat, lon)
    }

    removedStarIcon(){

        if(!this.starIcon.classList.contains("fa-regular")){
            this.starIcon.classList.add("fa-regular")
            this.starIcon.classList.remove("fa-solid")
        }
    }

    addedStarIcon(){

        if(!this.starIcon.classList.contains("fa-solid")){
            this.starIcon.classList.remove("fa-regular")
            this.starIcon.classList.add("fa-solid")
        }
    }

    currentLocation(){

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
                    for(let i = 0; i < this.favoriteList.length; i++){
    
                        if(this.favoriteList[i].lat === data.lat && this.favoriteList[i].lon === data.lon){
                            this.addedStarIcon()
                            alreadyFavorited = true;
                            break
                        }
                    }
                    if(!alreadyFavorited){
                        this.removedStarIcon()
                    }
                })
            })
    }

    searchLocation(){

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
                for(let i = 0; i < this.favoriteList.length; i++){
    
                    if(this.favoriteList[i].lat === data.lat && this.favoriteList[i].lon === data.lon){
                        this.addedStarIcon()
                        alreadyFavorited = true;
                        break
                    }
                }
                if(!alreadyFavorited){
                    this.removedStarIcon()
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

    createListItem(location){

        
        const newListItem = document.createElement('li')
        
        newListItem.className = "location-li"
        newListItem.textContent = location
    
        //Add event listener for the list item
        newListItem.addEventListener("click", () => {
            const normalizedLocation = location.toLowerCase()//noramalized input to avoid bugs
            const targetFavorite = this.favoriteList.find(fav => 
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
    
                this.addedStarIcon()
            }else{
                console.log("Favorite location not found for:", location)
            }
        })
    
        this.favoriteDropDownList.appendChild(newListItem)//Append the new list item to the favorite list
    }
    
    removeListItem(data){

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

    toggleFavorite(){

        searchService.coordsToLocation(searchService.lat, searchService.lon)
        .then(data => {
            const favoriteItem = {
                lat: data.lat,
                lon: data.lon,
                suburb: data.suburb || data.town || data.city // Ensure you choose the right property
            }
    
            // Check if the item already exists
            const index = this.favoriteList.findIndex(fav => 
                fav.lat === favoriteItem.lat && fav.lon === favoriteItem.lon
            )
    
            if(index > -1){
                //If already favorited remove it
                this.favoriteList.splice(index, 1)
                localStorage.removeItem(JSON.stringify(favoriteItem))
                this.removeListItem(favoriteItem)
                this.removedStarIcon()
            }else{
                //If not favorited add it
                this.favoriteList.push(favoriteItem)
                localStorage.setItem(JSON.stringify(favoriteItem.suburb || favoriteItem.town || favoriteItem.city), JSON.stringify(favoriteItem))//Store in local storage
                this.createListItem(favoriteItem.suburb || favoriteItem.town || favoriteItem.city)//Create the list item
                this.addedStarIcon()
            }
        });
    }

    getLocalStorageData(){

        // Loop through localStorage and create list items
        for (let i = 0; i < localStorage.length; i++){
    
            const key = localStorage.key(i);
            const value = localStorage.getItem(key)
            try{
                const parsedValue = JSON.parse(value)
                if (parsedValue){
                    this.favoriteList.push(parsedValue)//Push to favoriteList
    
                    const location = parsedValue.suburb || parsedValue.town || parsedValue.city
                    this.createListItem(location)
                }
            }catch(error) {
                console.error("Error parsing data from localStorage:", error)
            }
        }
    }

    initialize(){

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
}
