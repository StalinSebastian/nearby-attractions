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
      gsradius: '10000', // Radius in meters
      gslimit: '10', // Limit the number of results
      format: 'json',
      origin: '*'
    };

    return this.http.get(this.wikiApiUrl, { params });
  }
}
