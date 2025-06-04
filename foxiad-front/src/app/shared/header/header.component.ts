import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, NavigationEnd, RouterModule } from '@angular/router';
import { filter } from 'rxjs';
import { TokenService } from '../../core/services/token/token.service';

@Component({
  standalone: true,
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
  imports: [RouterModule, CommonModule]
})

export class HeaderComponent {
  menuOpen = false;

  constructor(private router: Router, private tokenService: TokenService) {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        console.log('Navigation detected');
        this.menuOpen = false;
      });
  }

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }

  getIsConnected(): boolean {
    return this.tokenService.isLogged()
  }

  logout() {
    this.tokenService.deconnexion()
  }
}
