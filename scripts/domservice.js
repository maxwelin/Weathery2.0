import { SearchService } from "./searchservice.js"
import { RenderService } from "./renderservice.js"

const searchService = new SearchService()
const renderService = new RenderService()

export class DomService {
    constructor(){
        this.arrowIcon = document.querySelector("#arrow")
        this.searchSelect = document.querySelector("#search-select")
        this.searchBtn = document.querySelector("#search-btn")
        this.favoriteList = document.querySelector("#favorite-list")
        this.weatherDetails = document.querySelector("#weather-details")
        this.interactiveMap = document.querySelector("#interactive-map")
        this.starIcon = document.querySelector("#click-to-favorite")
        
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

    this.favoriteList.classList.toggle("open")
    
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

    expandWeatherDetails(event, lat, lon){
    
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
    
}
