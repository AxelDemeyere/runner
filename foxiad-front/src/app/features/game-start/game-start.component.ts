import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Player } from '../../core/models/player.model';
import { TokenService } from '../../core/services/token/token.service';

@Component({
  selector: 'app-game-start',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './game-start.component.html',
  styleUrl: './game-start.component.css',
})
export class GameStartComponent implements OnInit {
  username: string | null = null;

  constructor(
    private router: Router,
    private readonly tokenService: TokenService
  ) {}

  ngOnInit(): void {
    this.username = this.tokenService.getUserName();
    /*if (!this.player) {
      this.router.navigate(['/register']);
    } */
  }

  startGame(): void {
    this.router.navigate(['/game']);
  }
}
