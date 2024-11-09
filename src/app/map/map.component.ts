import { Component, OnInit } from '@angular/core';
import * as L from 'leaflet';
import { AttractionsService } from '../attractions.service';
import { faLocationArrow } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.sass']
})
export class MapComponent implements OnInit {
  private map!: L.Map;
  private userMarker!: L.Marker;
  private attractions: any[] = [];

  // Font Awesome icon
  faLocationArrow = faLocationArrow;

  private userMarkerIcon = L.icon({
    iconUrl: '../images/marker-icon-green-2x.png', // Path to your custom icon image
    iconSize: [25, 41], // Size of the icon
    iconAnchor: [12, 41], // Point of the icon which will correspond to marker's location
    popupAnchor: [1, -34], // Point from which the popup should open relative to the iconAnchor
  });

  constructor(private wikipediaService: AttractionsService) {
    // Workaround for Angular and Leaflet's image path issue
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: '../images/marker-icon-2x.png',
      iconUrl: '../images/marker-icon.png',
      shadowUrl: '../images/marker-shadow.png'
    });
  }
  ngOnInit(): void {
    this.initMap();

    // Optionally, center map on user's location when the app loads
    this.locateMe();

  }

  private initMap(): void {
    this.map = L.map('map', {
      //center: [51.505, -0.09], // Default center (London)
      center: [0, 0],
      zoom: 2
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);
  }

  locateMe(): void {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;

          // If a user marker exists, update its position
          if (this.userMarker) {
            this.userMarker.setLatLng([latitude, longitude]);
          } else {
            // Otherwise, create a new marker at the user's location with the custom icon
            this.userMarker = L.marker([latitude, longitude], {
              icon: this.userMarkerIcon, // Use the custom icon here
              title: "You are here"
            }).addTo(this.map);
          }

          // Center the map on the user's location
          this.map.setView([latitude, longitude], 14);

          // Optional: Fetch nearby attractions when locating the user
          this.fetchAttractions(latitude, longitude);
        },
        (error) => {
          console.error("Error getting location:", error);
        }
      );
    } else {
      console.error("Geolocation is not supported by this browser.");
    }
  }

  private fetchAttractions(lat: number, lon: number): void {
    this.wikipediaService.getNearbyAttractions(lat, lon).subscribe((response) => {
      this.attractions = response.query.geosearch;
      this.attractions.forEach((attraction: any) => {
        console.log(attraction);
        const marker = L.marker([attraction.lat, attraction.lon]).addTo(this.map);
        const distanceInKilometers = convertToKilometers(attraction.dist);
        marker.bindPopup(`<b>${attraction.title}</b><br>Distance: ${distanceInKilometers} km`).openPopup();
      });
    });
  }
}

function convertToKilometers(meters:number) {
    return meters / 1000; // Convert meters to kilometers
}
