import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {environnement} from "../../../../environnements/environnement";
import {Player} from "../../models/player.model";

@Injectable({
  providedIn: 'root',
})
export class PlayerService {
  private readonly Url: string;

  constructor(private httpClient: HttpClient) {
    this.Url = environnement.backUrl + 'player/';
  }


  getPlayerById(playerid: any): Observable<any> {
    return this.httpClient.get(`${this.Url}playerById?playerId=`+ playerid);
  }



}
