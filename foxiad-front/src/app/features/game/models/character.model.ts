import { GameObject } from './game-object.model';

export class Character implements GameObject {
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number = 0;
  gravity: number;
  jumpForce: number;
  isJumping: boolean = false;
  groundY: number;
  currentFrame: number = 0;
  frameSpeed: number = 8;
  frameIndex: number = 0;
  images: HTMLImageElement[] = [];
  scaleFactor: number = 1;
  jumpImage?: HTMLImageElement;

  constructor(
    x: number,
    y: number,
    width: number,
    height: number,
    groundY: number,
    imageUrls: string[],
    scaleFactor: number = 1,
    jumpImageUrl: string


  ) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.groundY = groundY;
    this.scaleFactor = scaleFactor;


    // Adapter la gravité et la force de saut
    this.gravity = 0.5 * scaleFactor;
    this.jumpForce = -13 * scaleFactor;

    imageUrls.forEach(url => {
      const img = new Image();
      img.src = url;
      this.images.push(img);
    });

    if (jumpImageUrl) {
      this.jumpImage = new Image();
      this.jumpImage.src = jumpImageUrl;
    }

  }

  jump() {
    if (!this.isJumping) {
      this.speed = this.jumpForce;
      this.isJumping = true;
    }
  }


  update(deltaTime: number) {
    this.speed += this.gravity;
    this.y += this.speed;

    if (this.y > this.groundY) {
      this.y = this.groundY;
      this.isJumping = false;
      this.speed = 0;
    }

    this.frameIndex++;
    if (this.frameIndex >= this.frameSpeed) {
      this.currentFrame = (this.currentFrame + 1) % this.images.length;
      this.frameIndex = 0;
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    const img = this.isJumping && this.jumpImage?.complete
        ? this.jumpImage
        : this.images[this.currentFrame];
        console.log(img)

    if (img?.complete) {
      ctx.drawImage(
        img,
        this.x,
        this.y,
        this.width,
        this.height
      );
    }
  }
}
