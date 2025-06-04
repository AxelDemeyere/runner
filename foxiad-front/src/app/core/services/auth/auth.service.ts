import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {environnement} from "../../../../environnements/environnement";


@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly Url: string;

  constructor(private httpClient: HttpClient) {
    this.Url = environnement.backUrl + 'authentification/';
  }

  register(player: any): Observable<any> {
    return this.httpClient.post(`${this.Url}register`, player);
  }
}