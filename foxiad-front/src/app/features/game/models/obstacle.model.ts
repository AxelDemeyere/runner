import { GameObject } from './game-object.model';

export class Obstacle implements GameObject {
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
  images: HTMLImageElement[] = [];
  type: 'ground' | 'flying';
  scaleFactor: number = 1;

  constructor(
    x: number,
    y: number,
    width: number,
    height: number,
    speed: number,
    imageUrl: string,
    type: 'ground' | 'flying',
    scaleFactor: number = 1
  ) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.speed = speed;
    this.type = type;
    this.scaleFactor = scaleFactor;

    const image = new Image();
    image.src = imageUrl;
    this.images.push(image);
  }

  update(deltaTime: number) {
    this.x -= this.speed;
  }

  draw(ctx: CanvasRenderingContext2D) {
    if (this.images[0]?.complete) {
      ctx.drawImage(this.images[0], this.x, this.y, this.width, this.height);
    }
  }
}
