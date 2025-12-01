import * as me from "https://esm.run/melonjs@17";
import PlayerEntity from "../entities/player.js";
import PlatformEntity from "../entities/platform.js";
import ScrollEntity from "../entities/scroll.js";

class PlayScreen extends me.Stage {
  onResetEvent() {
    // Reset game data
    if (!window.gameData) {
      window.gameData = { scrollsCollected: 0, totalScrolls: 6, scrollTexts: [] };
    }
    window.gameData.scrollsCollected = 0;
    window.gameData.scrollTexts = [];

    // Tall level for vertical climbing
    const levelWidth = 1280;
    const levelHeight = 2400;

    // Set world size
    me.game.world.resize(levelWidth, levelHeight);

    // Add sky background
    const bg = new SkyBackground(levelWidth, levelHeight);
    me.game.world.addChild(bg, 0);

    // Create ground at bottom
    const ground = new PlatformEntity(0, levelHeight - 80, {
      width: levelWidth,
      height: 80,
      isGround: true
    });
    me.game.world.addChild(ground, 1);

    // Create tower of platforms going up with different types
    // style: 0 = stone (solid), 1 = wood (can move), 2 = ice (crumbles)
    const platforms = [
      // Floor 1 - easy start
      { x: 100, y: levelHeight - 180, w: 200, style: 0 },
      { x: 600, y: levelHeight - 180, w: 200, style: 0 },

      // Floor 2 - first moving platform
      { x: 300, y: levelHeight - 350, w: 180, style: 1, moving: true, moveRange: 200, moveSpeed: 0.6 },
      { x: 900, y: levelHeight - 380, w: 180, style: 0 },

      // Floor 3
      { x: 100, y: levelHeight - 550, w: 180, style: 0 },
      { x: 500, y: levelHeight - 580, w: 150, style: 2, crumbling: true },

      // Floor 4
      { x: 750, y: levelHeight - 750, w: 160, style: 1, moving: true, moveRange: 250, moveSpeed: 0.7 },
      { x: 150, y: levelHeight - 800, w: 180, style: 0 },

      // Floor 5
      { x: 400, y: levelHeight - 980, w: 180, style: 0 },
      { x: 850, y: levelHeight - 950, w: 140, style: 2, crumbling: true },

      // Floor 6
      { x: 100, y: levelHeight - 1150, w: 160, style: 1, moving: true, moveRange: 220, moveSpeed: 0.8 },
      { x: 700, y: levelHeight - 1180, w: 180, style: 0 },

      // Floor 7
      { x: 350, y: levelHeight - 1380, w: 180, style: 0 },
      { x: 800, y: levelHeight - 1420, w: 150, style: 1, moving: true, moveRange: 180, moveSpeed: 0.9 },

      // Floor 8
      { x: 150, y: levelHeight - 1600, w: 140, style: 2, crumbling: true },
      { x: 500, y: levelHeight - 1650, w: 180, style: 0 },

      // Floor 9
      { x: 300, y: levelHeight - 1850, w: 160, style: 1, moving: true, moveRange: 200, moveSpeed: 0.7 },
      { x: 800, y: levelHeight - 1880, w: 180, style: 0 },

      // Top platform
      { x: 400, y: levelHeight - 2050, w: 300, style: 0 }
    ];

    platforms.forEach((p) => {
      const platform = new FancyPlatform(p.x, p.y, {
        width: p.w,
        height: 25,
        style: p.style,
        moving: p.moving || false,
        moveRange: p.moveRange || 0,
        moveSpeed: p.moveSpeed || 1,
        moveOffset: p.moveOffset || 0,
        crumbling: p.crumbling || false
      });
      me.game.world.addChild(platform, 2);
    });

    // Create scrolls spread throughout the tower - License Agreement
    // Scroll 1: On first floor platform (x:600, y:levelHeight-180)
    const scroll1 = new ScrollEntity(650, levelHeight - 230, {
      width: 45,
      height: 45,
      text: "LICENČNÍ SMLOUVA FOTOBANKY - Článek 1: Stažením obrázku získáváte nevýhradní licenci k jeho užití pro osobní a nekomerční účely."
    });
    me.game.world.addChild(scroll1, 3);

    // Scroll 2: On moving platform Floor 2 (x:300, y:levelHeight-350) - ATTACHED TO PLATFORM
    const scroll2 = new ScrollEntity(380, levelHeight - 400, {
      width: 45,
      height: 45,
      text: "Článek 2: ÚPRAVY - Obrázek smíte libovolně upravovat, měnit jeho velikost, barvy, ořezávat jej či jinak modifikovat dle svých potřeb."
    });
    me.game.world.addChild(scroll2, 3);
    // Find the moving platform on floor 2 and attach
    me.game.world.forEach((child) => {
      if (child.isMoving && Math.abs(child.pos.y - (levelHeight - 350)) < 10) {
        scroll2.attachToPlatform(child);
      }
    });

    // Scroll 3: Floating in mid-air between floors 3 and 4 - MUST JUMP TO GET
    const scroll3 = new ScrollEntity(350, levelHeight - 680, {
      width: 45,
      height: 45,
      text: "Článek 3: SPOJENÍ S DÍLEM - Obrázek smíte spojit s jiným dílem, včlenit do koláže, prezentace či jakéhokoliv vlastního projektu."
    });
    me.game.world.addChild(scroll3, 3);

    // Scroll 4: On Floor 5 platform (x:400, y:levelHeight-980)
    const scroll4 = new ScrollEntity(450, levelHeight - 1030, {
      width: 45,
      height: 45,
      text: "Článek 4: TERITORIUM - Licence platí celosvětově, bez územního omezení. Obrázek můžete užívat kdekoliv na světě."
    });
    me.game.world.addChild(scroll4, 3);

    // Scroll 5: On Floor 7 platform (x:350, y:levelHeight-1380)
    const scroll5 = new ScrollEntity(400, levelHeight - 1430, {
      width: 45,
      height: 45,
      text: "Článek 5: AUTORSTVÍ - Nejste povinni uvádět jméno původního autora ani zdroj obrázku při jeho užití."
    });
    me.game.world.addChild(scroll5, 3);

    // Scroll 6: On top platform (x:400, y:levelHeight-2050)
    const scroll6 = new ScrollEntity(500, levelHeight - 2100, {
      width: 45,
      height: 45,
      text: "Článek 6: ZÁKAZ KOMERČNÍHO UŽITÍ - Obrázek NESMÍTE používat pro komerční účely, tj. k přímému či nepřímému finančnímu zisku."
    });
    me.game.world.addChild(scroll6, 3);

    // Create player at bottom
    const player = new PlayerEntity(100, levelHeight - 180, {
      width: 48,
      height: 90
    });
    me.game.world.addChild(player, 5);

    // Camera follows player vertically
    me.game.viewport.follow(player, me.game.viewport.AXIS.BOTH, 0.1);
    me.game.viewport.setBounds(0, 0, levelWidth, levelHeight);

    // Add HUD
    this.HUD = new ScrollHUD();
    me.game.world.addChild(this.HUD, 10);

    // Key bindings
    me.input.bindKey(me.input.KEY.LEFT, "left");
    me.input.bindKey(me.input.KEY.RIGHT, "right");
    me.input.bindKey(me.input.KEY.UP, "jump", true);
    me.input.bindKey(me.input.KEY.SPACE, "jump", true);
    me.input.bindKey(me.input.KEY.A, "left");
    me.input.bindKey(me.input.KEY.D, "right");
    me.input.bindKey(me.input.KEY.W, "jump", true);
    me.input.bindKey(me.input.KEY.DOWN, "down");
    me.input.bindKey(me.input.KEY.S, "down");
  }

  onDestroyEvent() {
    me.input.unbindKey(me.input.KEY.LEFT);
    me.input.unbindKey(me.input.KEY.RIGHT);
    me.input.unbindKey(me.input.KEY.UP);
    me.input.unbindKey(me.input.KEY.SPACE);
    me.input.unbindKey(me.input.KEY.A);
    me.input.unbindKey(me.input.KEY.D);
    me.input.unbindKey(me.input.KEY.W);
    me.input.unbindKey(me.input.KEY.DOWN);
    me.input.unbindKey(me.input.KEY.S);
  }
}

// Sky background with gradient
class SkyBackground extends me.Renderable {
  constructor(w, h) {
    super(0, 0, w, h);
    this.anchorPoint.set(0, 0);
    this.levelHeight = h;
  }

  draw(renderer) {
    const ctx = renderer.getContext();
    const viewY = me.game.viewport.pos.y;
    const viewH = me.game.viewport.height;
    const viewW = me.game.viewport.width;

    // Sky gradient that changes as you go up
    const progress = 1 - (viewY / (this.levelHeight - viewH));
    const r = Math.floor(135 - progress * 50);
    const g = Math.floor(206 - progress * 30);
    const b = Math.floor(235 + progress * 20);

    const gradient = ctx.createLinearGradient(0, viewY, 0, viewY + viewH);
    gradient.addColorStop(0, `rgb(${r}, ${g}, ${b})`);
    gradient.addColorStop(1, `rgb(${r + 30}, ${g + 20}, ${b - 20})`);

    ctx.fillStyle = gradient;
    ctx.fillRect(0, viewY, viewW, viewH);

    // Add stars near the top
    if (viewY < 400) {
      ctx.fillStyle = "rgba(255, 255, 255, " + (1 - viewY / 400) * 0.8 + ")";
      for (let i = 0; i < 70; i++) {
        const sx = (i * 137) % viewW;
        const sy = (i * 89) % 400;
        ctx.beginPath();
        ctx.arc(sx, sy, 1.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Clouds
    ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
    for (let i = 0; i < 10; i++) {
      const cx = ((i * 200) + viewY * 0.1) % (viewW + 200) - 100;
      const cy = 300 + i * 200;
      if (cy > viewY - 100 && cy < viewY + viewH + 100) {
        this.drawCloud(ctx, cx, cy, 0.8 + (i % 3) * 0.3);
      }
    }
  }

  drawCloud(ctx, x, y, scale) {
    ctx.beginPath();
    ctx.arc(x, y, 25 * scale, 0, Math.PI * 2);
    ctx.arc(x + 30 * scale, y - 10 * scale, 30 * scale, 0, Math.PI * 2);
    ctx.arc(x + 60 * scale, y, 25 * scale, 0, Math.PI * 2);
    ctx.fill();
  }

  update() {
    return true;
  }
}

// Fancy platform with different styles and behaviors
class FancyPlatform extends me.Entity {
  constructor(x, y, settings) {
    const width = settings.width || 100;
    const height = settings.height || 25;
    const style = settings.style || 0;

    super(x, y, {
      width: width,
      height: height,
      shapes: [new me.Rect(0, 0, width, height)]
    });

    this.body.collisionType = me.collision.types.WORLD_OBJECT;
    this.body.setStatic(true);
    this.isSolid = settings.isGround || false;
    this.isPlatform = true;
    this.width = width;
    this.height = height;
    this.style = style;
    this.alwaysUpdate = true;

    // Moving platform settings
    this.isMoving = settings.moving || false;
    this.moveRange = settings.moveRange || 200;
    this.moveSpeed = settings.moveSpeed || 1;
    this.startX = x;
    this.moveTimer = settings.moveOffset || 0;

    // Crumbling platform (ice/crystal)
    this.isCrumbling = settings.crumbling || false;
    this.crumbleTimer = 0;
    this.isCrumbled = false;
    this.respawnTimer = 0;

    this.renderable = new FancyPlatformRenderable(width, height, style, this);
    this.anchorPoint.set(0, 0);
  }

  update(dt) {
    // Moving platform logic
    if (this.isMoving && !this.isCrumbled) {
      const prevX = this.pos.x;
      this.moveTimer += dt * 0.002 * this.moveSpeed;
      this.pos.x = this.startX + Math.sin(this.moveTimer) * this.moveRange;
      this.velocityX = this.pos.x - prevX; // Track actual velocity
    } else {
      this.velocityX = 0;
    }

    // Crumbling platform logic
    if (this.isCrumbled) {
      this.respawnTimer -= dt;
      if (this.respawnTimer <= 0) {
        this.isCrumbled = false;
        this.crumbleTimer = 0;
      }
    }

    return true;
  }

  // Called when player stands on it
  startCrumble() {
    if (this.isCrumbling && !this.isCrumbled && this.crumbleTimer === 0) {
      this.crumbleTimer = 1500; // 1.5 seconds before falling
    }
  }

  updateCrumble(dt) {
    if (this.crumbleTimer > 0) {
      this.crumbleTimer -= dt;
      if (this.crumbleTimer <= 0) {
        this.isCrumbled = true;
        this.respawnTimer = 3000; // Respawn after 3 seconds
        // Play crumble sound
        try { me.audio.play("die", false, null, 0.3); } catch(e) {}
      }
    }
  }
}

class FancyPlatformRenderable extends me.Renderable {
  constructor(w, h, style, platform) {
    super(0, 0, w, h);
    this.anchorPoint.set(0, 0);
    this.style = style;
    this.platform = platform;
  }

  draw(renderer) {
    // Don't draw if crumbled
    if (this.platform && this.platform.isCrumbled) {
      return;
    }

    const ctx = renderer.getContext();
    const x = this.pos.x;
    const y = this.pos.y;
    const w = this.width;
    const h = this.height;

    // Shake effect when crumbling
    let shakeX = 0;
    if (this.platform && this.platform.crumbleTimer > 0) {
      shakeX = (Math.random() - 0.5) * 6;
    }

    // Different platform styles
    if (this.style === 0) {
      // Stone platform (solid, stable)
      ctx.fillStyle = "#696969";
      ctx.fillRect(x + shakeX, y, w, h);
      ctx.fillStyle = "#808080";
      ctx.fillRect(x + shakeX, y, w, 5);
      ctx.fillStyle = "#505050";
      for (let i = 0; i < w; i += 20) {
        ctx.fillRect(x + shakeX + i + 5, y + 8, 10, h - 12);
      }
    } else if (this.style === 1) {
      // Wood platform with stripes (moving)
      ctx.fillStyle = "#8B4513";
      ctx.fillRect(x + shakeX, y, w, h);
      ctx.fillStyle = "#A0522D";
      ctx.fillRect(x + shakeX, y, w, 4);
      // Stripes to indicate movement
      ctx.fillStyle = "#654321";
      for (let i = 0; i < w; i += 15) {
        ctx.fillRect(x + shakeX + i, y + 8, 8, h - 10);
      }
      // Arrow indicators if moving
      if (this.platform && this.platform.isMoving) {
        ctx.fillStyle = "#FFD700";
        ctx.fillRect(x + shakeX + 5, y + h/2 - 2, 10, 4);
        ctx.fillRect(x + shakeX + w - 15, y + h/2 - 2, 10, 4);
      }
    } else {
      // Crystal/ice platform (crumbling)
      const alpha = this.platform && this.platform.crumbleTimer > 0 ? 0.5 : 0.8;
      ctx.fillStyle = `rgba(100, 200, 255, ${alpha})`;
      ctx.fillRect(x + shakeX, y, w, h);
      ctx.fillStyle = `rgba(200, 240, 255, ${alpha + 0.1})`;
      ctx.fillRect(x + shakeX, y, w, 5);
      ctx.fillStyle = `rgba(150, 220, 255, ${alpha - 0.2})`;
      ctx.fillRect(x + shakeX + 10, y + 8, w - 20, h - 12);
    }

    // Add shine effect
    ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
    ctx.fillRect(x + shakeX + 5, y + 2, w / 3, 2);
  }
}

// Simple HUD
class ScrollHUD extends me.Renderable {
  constructor() {
    super(10, 10, 200, 50);
    this.floating = true;
    this.alwaysUpdate = true;
  }

  draw(renderer) {
    const ctx = renderer.getContext();

    // Save and reset transform for screen-space drawing
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);

    // Background
    ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
    ctx.fillRect(20, 20, 220, 60);
    ctx.strokeStyle = "#FFD700";
    ctx.lineWidth = 2;
    ctx.strokeRect(20, 20, 220, 60);

    // Title
    ctx.font = "bold 18px Georgia";
    ctx.fillStyle = "#FFD700";
    ctx.fillText("Licenční smlouva", 30, 44);

    // Count
    ctx.font = "bold 16px Arial";
    ctx.fillStyle = "#FFFFFF";
    ctx.fillText(`${window.gameData?.scrollsCollected || 0} / 6 článků`, 30, 70);

    ctx.restore();
  }

  update(dt) {
    return true;
  }
}

export default PlayScreen;
