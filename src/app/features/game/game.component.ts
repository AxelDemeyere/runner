import { Component, ElementRef, ViewChild, HostListener, OnInit } from '@angular/core';
import { Character } from './models/character.model';
import { Obstacle } from './models/obstacle.model';
import { Player } from '../../core/models/player.model';
import { PlayerService } from '../../core/services/player/player.service';
import { TokenService } from '../../core/services/token/token.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  standalone: true,
  imports: [CommonModule],
  styleUrls: ['./game.component.css']
})
export class GameComponent implements OnInit {
  @ViewChild('gameCanvas', { static: true }) gameCanvas!: ElementRef<HTMLCanvasElement>;
  private ctx!: CanvasRenderingContext2D;

  player!: Player;
  fox!: Character;
  obstacles: Obstacle[] = [];
  backgroundImage!: HTMLImageElement;
  gameSpeed: number = 5;
  score: number = 0;
  highScore: number = 0;
  gameStarted: boolean = false;
  gameOver: boolean = false;
  lastTime: number = 0;
  animationFrameId!: number;
  obstacleTimer: number = 0;
  obstacleInterval: number = 1500;
  isPortrait: boolean = false;

  // Assets
  readonly BG_IMAGE = '/assets/background/lunar-landscape.png';
  readonly PLAYER_IMAGES = [
    '/assets/fox/1.png',
    '/assets/fox/2.png',
    '/assets/fox/3.png'
  ];
  readonly JUMP_IMAGE = '/assets/fox/jump.png';
  readonly OBSTACLE_IMAGES = {
    ground: [
      { width: 50, height: 25, src: 'assets/obstacles/cave_rock5.png' },
      { width: 50, height: 30, src: 'assets/obstacles/Meteor_04.png' },
      { width: 50, height: 40, src: 'assets/obstacles/cave_rock5.png' },
      { width: 50, height: 50, src: 'assets/obstacles/Meteor_04.png' },
      { width: 50, height: 55, src: 'assets/obstacles/cave_rock5.png' }
    ],
    flying: [
      { width: 50, height: 20, src: 'assets/obstacles/volants/shipYellow.png' },
      { width: 50, height: 30, src: 'assets/obstacles/volants/shipPink.png' },
      { width: 50, height: 40, src: 'assets/obstacles/volants/Meteor_07.png' },
      { width: 50, height: 50, src: 'assets/obstacles/volants/Meteor_05.png' },
      { width: 50, height: 60, src: 'assets/obstacles/volants/shipBlue.png' }
    ]
  };

  isMobile: boolean = false;
  scaleFactor: number = 1;

  constructor(
    private playerService: PlayerService,
    private tokenService: TokenService,
    private toastr: ToastrService,
    private router: Router
  ) {
    this.checkOrientation();
  }

  ngOnInit(): void {
    this.playerService.getPlayerById(this.tokenService.getUserId()).subscribe({
      next: value => {
        this.player = value.data;
        this.initializeGame();
      },
      error: err => {
        this.toastr.error(err.error.message, 'error');
      }
    });

    this.isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    window.addEventListener('orientationchange', () => this.checkOrientation());
    window.addEventListener('resize', () => this.checkOrientation());
  }

  private checkOrientation(): void {
    this.isPortrait = window.innerHeight > window.innerWidth;
    if (this.isPortrait && this.gameStarted) {
      this.pauseGame();
    } else if (!this.isPortrait && this.gameStarted && !this.gameOver) {
      this.resumeGame();
    }
  }

  private initializeGame(): void {
    const canvas = this.gameCanvas.nativeElement;
    this.ctx = canvas.getContext('2d')!;
    this.ctx.imageSmoothingEnabled = false;
    
    this.backgroundImage = new Image();
    this.backgroundImage.src = this.BG_IMAGE;
    
    this.loadAssets().then(() => {
      this.resizeCanvas();
      this.drawInitialScreen();
    });
  }

  private async loadAssets(): Promise<void> {
    return new Promise((resolve) => {
      if (this.backgroundImage.complete) {
        resolve();
      } else {
        this.backgroundImage.onload = () => resolve();
      }
    });
  }

  @HostListener('window:resize')
  private resizeCanvas(): void {
    const canvas = this.gameCanvas.nativeElement;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight * 0.8;

    this.scaleFactor = this.isMobile ? 0.8 : 1.3;
    this.resyncEntitiesAfterResize();
  }

  private resyncEntitiesAfterResize(): void {
    const canvasHeight = this.ctx.canvas.height;
    
    if (this.fox) {
      const newY = canvasHeight - this.fox.height;
      this.fox.y = newY;
      this.fox.groundY = newY;
    }

    this.obstacles.forEach(obstacle => {
      if (obstacle.type === 'ground') {
        obstacle.y = canvasHeight - obstacle.height;
      } else {
        obstacle.y = canvasHeight - obstacle.height - Math.random() * (canvasHeight / 2 - obstacle.height);
      }
    });
  }

  private drawInitialScreen(): void {
    this.ctx.fillStyle = '#000000';
    this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);

    if (this.backgroundImage.complete) {
      this.ctx.drawImage(this.backgroundImage, 0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    }

    if (!this.isPortrait) {
      this.ctx.fillStyle = '#ffffff';
      this.ctx.font = '20px Poppins';
      this.ctx.textAlign = 'center';
      this.ctx.fillText('Appuyez pour commencer', this.ctx.canvas.width / 2, this.ctx.canvas.height / 2);

      if (this.highScore > 0) {
        this.ctx.fillText(`Meilleur score: ${this.highScore}`, this.ctx.canvas.width / 2, this.ctx.canvas.height / 2 + 40);
      }
    }
  }

  private startGame(): void {
    if (this.isPortrait) return;

    this.gameStarted = true;
    this.gameOver = false;
    this.score = 0;
    this.gameSpeed = 5;
    this.obstacleInterval = 1500;

    const groundY = this.ctx.canvas.height;
    const playerHeight = 60 * this.scaleFactor;
    const playerWidth = 60 * this.scaleFactor;

    this.fox = new Character(
      50,
      groundY - playerHeight,
      playerWidth,
      playerHeight,
      groundY - playerHeight,
      this.PLAYER_IMAGES,
      this.scaleFactor,
      this.JUMP_IMAGE
    );

    this.obstacles = [];
    this.lastTime = performance.now();
    this.gameLoop(this.lastTime);
  }

  private gameLoop(timestamp: number): void {
    const deltaTime = timestamp - this.lastTime;
    this.lastTime = timestamp;

    if (!this.gameOver && !this.isPortrait) {
      this.update(deltaTime);
      this.drawGame();
      this.animationFrameId = requestAnimationFrame((time) => this.gameLoop(time));
    }
  }

  private update(deltaTime: number): void {
    if (!this.gameStarted || this.gameOver) return;

    this.fox.update(deltaTime);
    this.obstacles.forEach(obstacle => obstacle.update(deltaTime));
    this.obstacles = this.obstacles.filter(obstacle => obstacle.x + obstacle.width > 0);

    this.obstacleTimer += deltaTime;
    if (this.obstacleTimer > this.obstacleInterval) {
      this.generateObstacle();
      this.obstacleTimer = 0;
      this.gameSpeed += 0.1;
      this.score += 1;
      this.obstacleInterval = Math.max(600, this.obstacleInterval - 10);
    }

    this.checkCollisions();
  }

  private generateObstacle(): void {
    const canvas = this.ctx.canvas;
    const type = Math.random() > 0.2 ? 'ground' : 'flying';
    const obstacleSelect = type === 'ground'
      ? this.OBSTACLE_IMAGES.ground[Math.floor(Math.random() * this.OBSTACLE_IMAGES.ground.length)]
      : this.OBSTACLE_IMAGES.flying[Math.floor(Math.random() * this.OBSTACLE_IMAGES.flying.length)];

    const width = obstacleSelect.width * this.scaleFactor;
    const height = obstacleSelect.height * this.scaleFactor;
    const y = type === 'ground'
      ? canvas.height - height
      : canvas.height - height - Math.random() * (canvas.height / 2 - height);

    this.obstacles.push(new Obstacle(
      canvas.width,
      y,
      width,
      height,
      this.gameSpeed,
      obstacleSelect.src,
      type,
      this.scaleFactor
    ));
  }

  private checkCollisions(): void {
    const playerRect = {
      x: this.fox.x,
      y: this.fox.y,
      width: this.fox.width,
      height: this.fox.height
    };

    for (const obstacle of this.obstacles) {
      const obstacleRect = {
        x: obstacle.x,
        y: obstacle.y,
        width: obstacle.width,
        height: obstacle.height
      };

      if (this.rectsOverlap(playerRect, obstacleRect)) {
        this.player.lives -= 1;
        this.gameOver = true;
        this.highScore = Math.max(this.highScore, this.score);
        this.player.score = this.highScore;
        break;
      }
    }
  }

  private rectsOverlap(rect1: any, rect2: any): boolean {
    return (
      rect1.x < rect2.x + rect2.width &&
      rect1.x + rect1.width > rect2.x &&
      rect1.y < rect2.y + rect2.height &&
      rect1.y + rect1.height > rect2.y
    );
  }

  private drawGame(): void {
    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    
    if (this.backgroundImage.complete) {
      this.ctx.drawImage(this.backgroundImage, 0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    }

    this.fox.draw(this.ctx);
    this.obstacles.forEach(obstacle => obstacle.draw(this.ctx));
  }

  handleCanvasClick(event: MouseEvent | TouchEvent): void {
    event.preventDefault();
    if (!this.gameStarted && !this.gameOver && !this.isPortrait) {
      this.startGame();
    } else if (this.gameStarted && !this.gameOver && !this.isPortrait) {
      this.fox.jump();
    }
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyboard(event: KeyboardEvent): void {
    if (['Space', 'ArrowUp', ' '].includes(event.code)) {
      event.preventDefault();
      if (!this.gameStarted && !this.gameOver && !this.isPortrait) {
        this.startGame();
      } else if (this.gameStarted && !this.gameOver && !this.isPortrait) {
        this.fox.jump();
      }
    }
  }

  resetGame(): void {
    cancelAnimationFrame(this.animationFrameId);
    this.gameStarted = false;
    this.gameOver = false;
    this.drawInitialScreen();
  }

  pauseGame(): void {
    cancelAnimationFrame(this.animationFrameId);
    this.gameStarted = false;
  }

  resumeGame(): void {
    if (!this.gameOver) {
      this.gameStarted = true;
      this.gameLoop(performance.now());
    }
  }

  goToLeaderboard(): void {
    this.router.navigate(['/leaderboard']);
  }

  ngOnDestroy(): void {
    cancelAnimationFrame(this.animationFrameId);
    window.removeEventListener('orientationchange', () => this.checkOrientation());
    window.removeEventListener('resize', () => this.checkOrientation());
  }
}