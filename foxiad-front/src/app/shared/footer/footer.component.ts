import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css',
})
export class FooterComponent {
  currentYear = new Date().getFullYear();
  constructor(
    private readonly router: Router){
  }

  mentionslegales() {
      this.router.navigate(['/mentions-legales']);
  }
}
