export interface GameObject {
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
  images: HTMLImageElement[];
  update?(deltaTime: number): void;
  draw(ctx: CanvasRenderingContext2D): void;
  scaleFactor: number;
  
}