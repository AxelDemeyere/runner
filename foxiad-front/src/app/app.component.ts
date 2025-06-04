import { Component, OnInit } from '@angular/core';
import {NavigationEnd, Router, RouterOutlet} from '@angular/router';
import { HeaderComponent } from './shared/header/header.component';
import { FooterComponent } from './shared/footer/footer.component';
import {NgIf} from "@angular/common";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, FooterComponent, NgIf],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent  implements OnInit {
  title = 'Runner Game';

  isGameRoute = false;
  isPortrait = false;

    ngOnInit(): void {
    this.checkOrientation();
    window.addEventListener('resize', () => {
      this.checkOrientation();
    });
  }

  constructor(private router: Router) {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.isGameRoute = event.urlAfterRedirects.startsWith('/game');
      }
    });
  }


    private checkOrientation() {
    this.isPortrait = window.innerHeight > window.innerWidth;
  }
}
