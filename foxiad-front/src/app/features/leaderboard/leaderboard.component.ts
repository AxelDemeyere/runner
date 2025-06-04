import { Component } from '@angular/core';
import { Player } from '../../core/models/player.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-leaderboard',
  standalone: true,
  templateUrl: './leaderboard.component.html',
  styleUrls: ['./leaderboard.component.css'],
  imports: [CommonModule],
})
export class LeaderboardComponent {
  players: Player[] = [
    { id: 1, firstName: 'Alice', lastName: 'Smith', email: '', phone: '', job: '', score: 950, lives: 3, gameDate: new Date(), winner: 0 },
    { id: 2, firstName: 'Bob', lastName: 'Johnson', email: '', phone: '', job: '', score: 870, lives: 3, gameDate: new Date(), winner: 0 },
    { id: 3, firstName: 'Charlie', lastName: 'Williams', email: '', phone: '', job: '', score: 790, lives: 3, gameDate: new Date(), winner: 0 },
    { id: 4, firstName: 'Diana', lastName: 'Brown', email: '', phone: '', job: '', score: 620, lives: 3, gameDate: new Date(), winner: 0 },
    { id: 5, firstName: 'Eve', lastName: 'Jones', email: '', phone: '', job: '', score: 560, lives: 3, gameDate: new Date(), winner: 0 },
    { id: 6, firstName: 'Diana', lastName: 'Brown', email: '', phone: '', job: '', score: 620, lives: 3, gameDate: new Date(), winner: 0 },
    { id: 7, firstName: 'Diana', lastName: 'Brown', email: '', phone: '', job: '', score: 350, lives: 3, gameDate: new Date(), winner: 0 },
    { id: 8, firstName: 'Diana', lastName: 'Brown', email: '', phone: '', job: '', score: 520, lives: 3, gameDate: new Date(), winner: 0 },
    { id: 9, firstName: 'Diana', lastName: 'Brown', email: '', phone: '', job: '', score: 620, lives: 3, gameDate: new Date(), winner: 0 },
    { id: 10, firstName: 'Diana', lastName: 'Brown', email: '', phone: '', job: '', score: 430, lives: 3, gameDate: new Date(), winner: 0 },
    { id: 11, firstName: 'xs', lastName: 'Brown', email: '', phone: '', job: '', score: 410, lives: 3, gameDate: new Date(), winner: 0 },
    { id: 12, firstName: 'Diana', lastName: 'Brown', email: '', phone: '', job: '', score: 420, lives: 3, gameDate: new Date(), winner: 0 },
    { id: 13, firstName: 'xc', lastName: 'Brown', email: '', phone: '', job: '', score: 640, lives: 3, gameDate: new Date(), winner: 0 },
    { id: 14, firstName: 'da', lastName: 'Brown', email: '', phone: '', job: '', score: 666, lives: 3, gameDate: new Date(), winner: 0 },
    { id: 15, firstName: 'qc', lastName: 'Brown', email: '', phone: '', job: '', score: 457, lives: 3, gameDate: new Date(), winner: 0 },
    { id: 16, firstName: 'scqxsq', lastName: 'Brown', email: '', phone: '', job: '', score: 175, lives: 3, gameDate: new Date(), winner: 0 },
    { id: 17, firstName: 'sc', lastName: 'Brown', email: '', phone: '', job: '', score: 80, lives: 3, gameDate: new Date(), winner: 0 },
    { id: 18, firstName: 'sqc', lastName: 'Brown', email: '', phone: '', job: '', score: 67, lives: 3, gameDate: new Date(), winner: 0 },
    { id: 19, firstName: 'xcw', lastName: 'Brown', email: '', phone: '', job: '', score: 50, lives: 3, gameDate: new Date(), winner: 0 },
    { id: 20, firstName: 's', lastName: 'cx', email: '', phone: '', job: '', score: 120, lives: 3, gameDate: new Date(), winner: 0 },
    { id: 21, firstName: 'xc<w', lastName: 'Brown', email: '', phone: '', job: '', score: 550, lives: 3, gameDate: new Date(), winner: 0 },
    { id: 22, firstName: 'xwc', lastName: 'Brown', email: '', phone: '', job: '', score: 620, lives: 3, gameDate: new Date(), winner: 0 },
    { id: 23, firstName: 'azer', lastName: 'Brown', email: '', phone: '', job: '', score: 620, lives: 3, gameDate: new Date(), winner: 0 },
    { id: 24, firstName: 'xwc', lastName: 'Brown', email: '', phone: '', job: '', score: 222, lives: 3, gameDate: new Date(), winner: 0 },
    { id: 25, firstName: 'xwc', lastName: 'Brown', email: '', phone: '', job: '', score: 700, lives: 3, gameDate: new Date(), winner: 0} 

  ];

  topPlayers: Player[] = [];
  randomWinner!: Player;
  isRolling = false;
  countdown = 10;
  currentDate = new Date();
  currentRouletteName = '';
  drawCompleted = false;

  private rouletteInterval: any;
  private countdownInterval: any;

  startRoulette() {
    // Réinitialiser les gagnants
    this.players.forEach(p => p.winner = 0);
    this.drawCompleted = true;
    this.randomWinner = undefined!;
    this.currentRouletteName = '';
    this.countdown = 10;
    this.isRolling = true;

    // Calculer les deux meilleurs
    this.topPlayers = [...this.players]
      .sort((a, b) => b.score - a.score)
      .slice(0, 2);

    // Marquer les deux premiers
    this.topPlayers[0].winner = 1;
    this.topPlayers[1].winner = 2;

    const candidates = this.players.filter(p =>
      !this.topPlayers.some(top => top.id === p.id)
    );

    if (candidates.length === 0) return;

    // Effet visuel "machine à sous"
    this.rouletteInterval = setInterval(() => {
      const random = candidates[Math.floor(Math.random() * candidates.length)];
      this.currentRouletteName = `${random.firstName} ${random.lastName}`;
    }, 100);

    this.countdownInterval = setInterval(() => {
      this.countdown--;
      if (this.countdown <= 0) {
        clearInterval(this.countdownInterval);
        clearInterval(this.rouletteInterval);
        this.isRolling = false;

        // Tirage final
        const winner = candidates[Math.floor(Math.random() * candidates.length)];
        this.randomWinner = winner;
        this.randomWinner.winner = 3;
        this.currentRouletteName = `${winner.firstName} ${winner.lastName}`;
      }
    }, 1000);
  }

  get allPlayersSorted(): Player[] {
    return this.players.slice().sort((a, b) => b.score - a.score);
  }
}
