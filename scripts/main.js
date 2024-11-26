import { DomService } from "./domservice.js";

const domService = new DomService();

function toggleFavorite() {
  domService.toggleFavorite();
}

function currentLocation() {
  domService.currentLocation();
}

function searchLocation() {
  domService.searchLocation();
}

function expandWeatherDetails(event) {
  domService.expandWeatherDetails(event);
}

function main() {
  //Live clock
  let hrs = document.getElementById("hrs");
  let min = document.getElementById("min");

  setInterval(() => {
    let currentTime = new Date();

    hrs.innerHTML =
      (currentTime.getHours() < 10 ? "0" : "") + currentTime.getHours();
    min.innerHTML =
      (currentTime.getMinutes() < 10 ? "0" : "") + currentTime.getMinutes();
    document.getElementById("semiCol").style.visibility =
      document.getElementById("semiCol").style.visibility == "hidden"
        ? ""
        : "hidden";
  }, 1000);

  domService.getLocalStorageData();

  domService.initialize();
}

window.document.onload = main();

//To enable global scoping on functions (because script file is type="module")
window.currentLocation = currentLocation;
window.searchLocation = searchLocation;
window.toggleFavorite = toggleFavorite;
window.expandWeatherDetails = expandWeatherDetails;
