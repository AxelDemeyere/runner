import { Component, ElementRef, ViewChild, HostListener, OnInit } from '@angular/core';
import { Character } from './models/character.model';
import { Obstacle } from './models/obstacle.model';
import { Player } from '../../core/models/player.model';
import { PlayerService } from '../../core/services/player/player.service';
import { TokenService } from '../../core/services/token/token.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  standalone: true,
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
    ) {}

  ngOnInit(): void {
    this.playerService.getPlayerById(this.tokenService.getUserId()).subscribe({
        
            next: value => {
              this.player = value.data;
              console.log(this.player)
            },
            error: err => {
              this.toastr.error(err.error.message, 'error');
            },
            complete: () => {},
      });
    

    this.isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    window.addEventListener('orientationchange', () => this.checkOrientation());
    this.checkOrientation();

    this.initializeGame();

    this.loadAssets().then(() => {
      this.resizeCanvas();
      this.drawInitialScreen();
    });
  }

  checkOrientation() {
    if (this.isMobile && window.innerHeight > window.innerWidth) {
      if(this.gameStarted && !this.gameOver){
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
        this.ctx.fillStyle = '#fff';
        this.ctx.font = '18px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('Restez en mode paysage pour jouer', this.ctx.canvas.width / 2, this.ctx.canvas.height / 2 - 100);
      }
      //alert('Veuillez passer en mode paysage pour jouer.');
      this.gameStarted = false;
      this.gameOver = true;
    }
  }

  initializeGame() {
    const canvas = this.gameCanvas.nativeElement;
    this.ctx = canvas.getContext('2d')!;
    this.backgroundImage = new Image();
    this.backgroundImage.src = this.BG_IMAGE;
  }

  async loadAssets(): Promise<void> {
    return new Promise((resolve) => {
      if (this.backgroundImage.complete) {
        resolve();
      } else {
        this.backgroundImage.onload = () => resolve();
      }
    });
  }

  @HostListener('window:resize')
  resizeCanvas() {
    const canvas = this.gameCanvas.nativeElement;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight * 0.8;

    this.scaleFactor = this.isMobile ? 0.8 : 1.3;

    if (this.gameStarted) {
      this.drawGame();
    } else {
      this.drawInitialScreen();
    }
    this.resyncEntitiesAfterResize();
  }

  resyncEntitiesAfterResize() {
  const canvasHeight = this.ctx.canvas.height;
  
  // Repositionner le renard au sol
  if (this.fox) {
    const newY = canvasHeight - this.fox.height;
    this.fox.y = newY;
    this.fox.groundY = newY;
  }

  // Repositionner les obstacles au sol (ou en vol)
  this.obstacles.forEach(obstacle => {
    if (obstacle.type === 'ground') {
      obstacle.y = canvasHeight - obstacle.height;
    } else {
      obstacle.y = canvasHeight - obstacle.height - Math.random() * (canvasHeight / 2 - obstacle.height);
    }
  });
}


  drawInitialScreen() {
    this.ctx.fillStyle = '#f0f0f0';
    this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);

    if (this.backgroundImage.complete) {
      this.ctx.drawImage(this.backgroundImage, 0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    }

    if (this.isMobile && window.innerHeight > window.innerWidth) {
      this.ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
      this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
      this.ctx.fillStyle = '#fff';
      this.ctx.font = '18px Arial';
      this.ctx.textAlign = 'center';
      this.ctx.fillText('Tournez votre appareil en mode paysage', this.ctx.canvas.width / 2, this.ctx.canvas.height / 2 - 100);
      return;
    }

    this.ctx.fillStyle = '#fff';
    this.ctx.font = '20px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('Appuyez sur ESPACE ou cliquez pour commencer', this.ctx.canvas.width / 2, this.ctx.canvas.height / 2);

    if (this.highScore > 0) {
      this.ctx.font = '20px Arial';
      this.ctx.fillText(`Meilleur score: ${this.highScore}`, this.ctx.canvas.width / 2, this.ctx.canvas.height / 2 + 40);
    }
  }

  startGame() {
    if (this.isMobile && window.innerHeight > window.innerWidth) return;

    this.gameStarted = true;
    this.gameOver = false;
    this.score = 0;
    this.gameSpeed = 5;
    this.obstacleInterval = 1500;

    const groundY = this.ctx.canvas.height ;
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

  gameLoop(timestamp: number) {
    const deltaTime = timestamp - this.lastTime;
    this.lastTime = timestamp;

    
    this.update(deltaTime);
    this.drawGame();
    this.checkOrientation()

    if (!(this.gameOver || this.player.lives <= 0)) {
      this.animationFrameId = requestAnimationFrame((time) => this.gameLoop(time));
    }
  }

  update(deltaTime: number) {
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

  generateObstacle() {
    const canvas = this.ctx.canvas;
    const groundY = canvas.height;
    const type = Math.random() > 0.2 ? 'ground' : 'flying';

    const isGround = type === 'ground';
    const obstacleSelect = isGround
      ? this.OBSTACLE_IMAGES.ground[Math.floor(Math.random() * this.OBSTACLE_IMAGES.ground.length)]
      : this.OBSTACLE_IMAGES.flying[Math.floor(Math.random() * this.OBSTACLE_IMAGES.flying.length)];

    const width = obstacleSelect.width * this.scaleFactor;
    const height = obstacleSelect.height * this.scaleFactor;

    const y = isGround
      ? groundY - height
      : groundY - height - Math.random() * (canvas.height / 2 - height);

    const obstacle = new Obstacle(
      canvas.width,
      y,
      width,
      height,
      this.gameSpeed,
      obstacleSelect.src,
      type
    );

    this.obstacles.push(obstacle);
  }

  checkCollisions() {
    const playerRect = { x: this.fox.x, y: this.fox.y, width: this.fox.width, height: this.fox.height };

    for (const obstacle of this.obstacles) {
      const obstacleRect = { x: obstacle.x, y: obstacle.y, width: obstacle.width, height: obstacle.height };

      if (this.rectsOverlap(playerRect, obstacleRect)) {
        this.player.lives -= 1;
        this.obstacles = this.obstacles.filter(o => o !== obstacle);
        this.gameOver = true;
        this.highScore = Math.max(this.highScore, this.score);
        this.player.score = this.highScore;
        break;
      }
    }
  }

  rectsOverlap(rect1: any, rect2: any): boolean {
    return (
      rect1.x < rect2.x + rect2.width &&
      rect1.x + rect1.width > rect2.x &&
      rect1.y < rect2.y + rect2.height &&
      rect1.y + rect1.height > rect2.y
    );
  }

drawGame() {
  // Nettoyage complet du canvas avec la bonne couleur de fond
  this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
  this.ctx.fillStyle = '#f0f0f0';
  this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);

  // Dessin de l'image de fond si disponible
  if (this.backgroundImage.complete) {
    this.ctx.drawImage(this.backgroundImage, 0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
  }

  // Sol (ligne grise ici, à personnaliser si tu veux l’enlever complètement)
  this.ctx.fillStyle = '#333';
  this.ctx.fillRect(0, this.ctx.canvas.height - 4, this.ctx.canvas.width, 20);

  // Dessin du joueur et des obstacles
  this.fox.draw(this.ctx);
  this.obstacles.forEach(obstacle => obstacle.draw(this.ctx));

  // Affichage du score
  this.ctx.fillStyle = 'rgba(179, 185, 207, 0.5)';
  this.ctx.font = '20px Arial';
  this.ctx.textAlign = 'left';
  this.ctx.fillText(`Score: ${this.score}`, 20, 30);
  this.ctx.fillText(`Vies: ${this.player.lives}`, 20, 60);

  // Écran de fin de jeu
  if (this.gameOver) {
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);

    this.ctx.fillStyle = '#fff';
    this.ctx.font = '20px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('Game Over', this.ctx.canvas.width / 2, this.ctx.canvas.height / 2 - 30);
    this.ctx.fillText(`Score: ${this.score}`, this.ctx.canvas.width / 2, this.ctx.canvas.height / 2 + 10);
    this.ctx.fillText(`Meilleur score: ${this.highScore}`, this.ctx.canvas.width / 2, this.ctx.canvas.height / 2 + 30);
    
    if(this.player.lives <= 0){
      this.ctx.fillText('Consulter la page de classement ', this.ctx.canvas.width / 2, this.ctx.canvas.height / 2 + 70);
    }else{
      this.ctx.fillText('Appuyez sur ESPACE ou cliquez pour rejouer', this.ctx.canvas.width / 2, this.ctx.canvas.height / 2 + 70);
    }
  }
}


  // Gestion des contrôles
  handleCanvasClick(event: MouseEvent | TouchEvent) {
    event.preventDefault();
    this.handleJumpAction();
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyboard(event: KeyboardEvent) {
    if (['Space', 'ArrowUp', ' '].includes(event.code)) {
      event.preventDefault();
      this.handleJumpAction();
    }
  }


  private handleJumpAction() {
    if (!this.gameStarted && !this.gameOver && this.player.lives > 0) {
      this.startGame();
    } else if (this.gameOver && this.player.lives > 0) {
      this.resetGame();
    } else if (this.gameStarted) {
      this.fox.jump();
    }
  }

  resetGame() {
    cancelAnimationFrame(this.animationFrameId);
    this.gameStarted = false;
    this.gameOver = false;
    this.drawInitialScreen();
  }

  ngOnDestroy() {
    cancelAnimationFrame(this.animationFrameId);
  }
}
