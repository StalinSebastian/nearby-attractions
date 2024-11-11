import { Component, OnInit } from '@angular/core';
import { AttractionsService } from '../attractions.service';
import { faLocationArrow } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.sass']
})
export class MapComponent implements OnInit {
  private map!: google.maps.Map;
  private userMarker!: google.maps.Marker;
  private attractions: any[] = [];

  // Font Awesome icon
  faLocationArrow = faLocationArrow;

  constructor(private attractionsService: AttractionsService) {}

  ngOnInit(): void {
    this.loadGoogleMapsApi().then(() => {
      this.initMap();
      this.locateMe();
    });
  }

  private loadGoogleMapsApi(): Promise<void> {
    return new Promise((resolve) => {
      const checkGoogleMaps = setInterval(() => {
        if (typeof google !== 'undefined') {
          clearInterval(checkGoogleMaps);
          resolve();
        }
      }, 100); // Check every 100ms
    });
  }

  private initMap(): void {
    const mapOptions: google.maps.MapOptions = {
      center: { lat: 0, lng: 0 },
      zoom: 2
    };
    this.map = new google.maps.Map(document.getElementById('map') as HTMLElement, mapOptions);
  }

  locateMe(): void {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;

          // If a user marker exists, update its position
          if (this.userMarker) {
            this.userMarker.setPosition(new google.maps.LatLng(latitude, longitude));
          } else {
            // Otherwise, create a new marker at the user's location
            this.userMarker = new google.maps.Marker({
              position: { lat: latitude, lng: longitude },
              map: this.map,
              title: "You are here"
            });
          }

          // Center the map on the user's location
          this.map.setCenter({ lat: latitude, lng: longitude });
          this.map.setZoom(14);

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
    this.attractionsService.getNearbyAttractions(lat, lon).subscribe((response) => {
      this.attractions = response.query.geosearch;

      // Filter attractions based on keywords in the title
      const relevantKeywords = ['Museum', 'Park', 'Garden', 'Historical']; // Add relevant keywords
      this.attractions = this.attractions.filter(attraction =>
        relevantKeywords.some(keyword => attraction.title.includes(keyword))
      );

      this.attractions.forEach((attraction: any) => {
        this.attractionsService.getAttractionDetails(attraction.pageid).subscribe((detailsResponse) => {
          const description = detailsResponse.query.pages[attraction.pageid].extract; // Get the description
          const marker = new google.maps.Marker({
            position: { lat: attraction.lat, lng: attraction.lon },
            map: this.map
          });
          const distanceInKilometers = this.convertToKilometers(attraction.dist);
          const infowindow = new google.maps.InfoWindow({
            content: `<b>${attraction.title}</b><br>${description}<br>Distance: ${distanceInKilometers} km`
          });
          marker.addListener('click', () => {
            infowindow.open(this.map, marker);
          });
        });
      });
    });
  }

  private convertToKilometers(meters: number) {
    return meters / 1000; // Convert meters to kilometers
  }
}
