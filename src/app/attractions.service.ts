import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AttractionsService {
  private wikiApiUrl = 'https://en.wikipedia.org/w/api.php';

  constructor(private http: HttpClient) {}

  getNearbyAttractions(lat: number, lon: number): Observable<any> {
    const params = {
      action: 'query',
      list: 'geosearch',
      gscoord: `${lat}|${lon}`,
      gsradius: '10000', // Change this value to a smaller radius (e.g., 5000 meters)
      gslimit: '10', // Limit the number of results
      format: 'json',
      origin: '*'
    };

    return this.http.get(this.wikiApiUrl, { params });
  }

  getAttractionDetails(pageId: number): Observable<any> {
    const params = {
      action: 'query',
      prop: 'extracts',
      pageids: pageId.toString(),
      format: 'json',
      origin: '*',
      exintro: true, // Get only the introduction
      explaintext: true // Get plain text (no HTML)
    };

    return this.http.get(this.wikiApiUrl, { params });
  }
}
