import * as me from "https://esm.run/melonjs@17";

// Custom renderable for drawing platforms
class PlatformRenderable extends me.Renderable {
  constructor(width, height, isGround) {
    super(0, 0, width, height);
    this.isGround = isGround;
    this.anchorPoint.set(0, 0);
  }

  draw(renderer) {
    const ctx = renderer.getContext();

    if (this.isGround) {
      // Ground - green grass
      ctx.fillStyle = "#4a7c3f";
      ctx.fillRect(this.pos.x, this.pos.y, this.width, this.height);
      // Darker grass line on top
      ctx.fillStyle = "#2d5016";
      ctx.fillRect(this.pos.x, this.pos.y, this.width, 6);
    } else {
      // Platform - brown with grass top
      ctx.fillStyle = "#8B4513";
      ctx.fillRect(this.pos.x, this.pos.y, this.width, this.height);
      // Grass top
      ctx.fillStyle = "#2d5016";
      ctx.fillRect(this.pos.x, this.pos.y, this.width, 4);
      // Wood grain highlight
      ctx.fillStyle = "#A0522D";
      ctx.fillRect(this.pos.x + 3, this.pos.y + 6, this.width - 6, 2);
    }
  }
}

class PlatformEntity extends me.Entity {
  constructor(x, y, settings) {
    settings = settings || {};
    const width = settings.width || 100;
    const height = settings.height || 20;
    const isGround = settings.isGround || false;

    super(x, y, {
      width: width,
      height: height,
      shapes: [new me.Rect(0, 0, width, height)]
    });

    // Set as static world object for collision
    this.body.collisionType = me.collision.types.WORLD_OBJECT;
    this.body.setStatic(true);

    // Mark if this is solid ground (can't jump through)
    this.isSolid = isGround;
    this.isPlatform = true;
    this.width = width;
    this.height = height;

    // Create visual
    this.renderable = new PlatformRenderable(width, height, isGround);

    // Anchor at top-left
    this.anchorPoint.set(0, 0);
  }
}

export default PlatformEntity;
