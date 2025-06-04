import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { JwtHelperService } from "@auth0/angular-jwt";

@Injectable({
  providedIn: 'root',
})
export class TokenService {
  private _isLoggedIn$ = new BehaviorSubject<boolean>(false);
  isLoggedIn$ = this._isLoggedIn$.asObservable();
  private tokenName: string;
  private user: string;
  private userId: string;
  private role: string;
  private userName: string;

  constructor(
    private router: Router,
    private jwtHelperService: JwtHelperService,
  ) {
    this.tokenName = 'token';
    this.user = 'user';
    this.userId = 'userId';
    this.role = 'role';
    this.userName = 'userName';
  }

  saveToken(token: string): void {
    localStorage.setItem(this.tokenName, token);
    this.decodeToken(token);
  }

  decodeToken(token: string): any {
    const decodedToken = this.jwtHelperService.decodeToken(token);
    localStorage.setItem(this.userId, decodedToken.userId);
    localStorage.setItem(this.role, decodedToken.role);
    localStorage.setItem(this.userName, decodedToken.userName);
  }

  deconnexion(): void {
    this.removeToken();
    this._isLoggedIn$.next(false);
    this.router.navigate(['/login']);
  }

  removeToken(): void {
    localStorage.removeItem(this.tokenName);
    localStorage.removeItem(this.user);
    localStorage.removeItem(this.userId);
    localStorage.removeItem(this.role);
    localStorage.removeItem(this.userName);
  }

  isLogged(): boolean {
    const token = localStorage.getItem(this.tokenName);
    return !!token;
  }

  isAdmin(): boolean {
    const roleUser = localStorage.getItem(this.role);
    return roleUser == 'ADMIN';
  }


  getToken(): string {
    return localStorage.getItem(this.tokenName) || '';
  }

  getUser(): string {
    return localStorage.getItem(this.user) || '';
  }

  getUserId(): string {
    return localStorage.getItem(this.userId) || '';
  }

  getUserRole(): string {
    return localStorage.getItem(this.role) || '';
  }
  
  getUserName(): string {
    return localStorage.getItem(this.userName) || '';
  }


}
