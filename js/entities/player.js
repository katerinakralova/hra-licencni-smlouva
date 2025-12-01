import * as me from "https://esm.run/melonjs@17";

// Custom renderable for player
class PlayerRenderable extends me.Renderable {
  constructor(player, w, h) {
    super(0, 0, w, h);
    this.player = player;
    this.anchorPoint.set(0, 0);
  }

  draw(renderer) {
    const img = this.player.currentImage;
    if (!img) return;

    const ctx = renderer.getContext();

    // Scale up for better resolution (1.5x the collision box height)
    const scale = (this.height * 1.5) / this.player.standingImg.height;

    // Draw current image at its natural proportions with same scale
    const drawW = img.width * scale;
    const drawH = img.height * scale;

    // Center horizontally and align feet to bottom of collision box
    const offsetX = (this.width - drawW) / 2;
    const offsetY = this.height - drawH + 4;

    // Add bobbing effect when running
    let bobY = 0;
    if (this.player.isRunning) {
      bobY = Math.sin(this.player.runTimer * 0.3) * 3;
    }

    ctx.save();

    // Enable image smoothing for better quality
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    if (!this.player.facingRight) {
      ctx.translate(this.pos.x + offsetX + drawW, this.pos.y + offsetY + bobY);
      ctx.scale(-1, 1);
      ctx.drawImage(img, 0, 0, drawW, drawH);
    } else {
      ctx.drawImage(img, this.pos.x + offsetX, this.pos.y + offsetY + bobY, drawW, drawH);
    }

    ctx.restore();
  }
}

class PlayerEntity extends me.Entity {
  constructor(x, y, settings) {
    settings = settings || {};

    const collisionW = 40;
    const collisionH = 80;

    settings.width = collisionW;
    settings.height = collisionH;

    super(x, y, settings);

    this.body.collisionType = me.collision.types.PLAYER_OBJECT;
    this.alwaysUpdate = true;
    this.body.gravityScale = 0;

    this.w = collisionW;
    this.h = collisionH;

    // Physics - floaty fun jumps
    this.gravity = 0.25;
    this.maxFallSpeed = 9;
    this.moveSpeed = 6;
    this.jumpPower = 16;
    this.acceleration = 1.0;
    this.friction = 0.88;

    this.velX = 0;
    this.velY = 0;

    this.onGround = false;
    this.currentPlatform = null; // Track platform we're standing on
    this.lastPlatformX = 0; // For moving platform friction
    this.facingRight = true;
    this.isCrouching = false;
    this.isRunning = false;
    this.runTimer = 0;
    this.isJumping = false;
    this.dropThroughTimer = 0;
    this.landingTimer = 0;
    this.coyoteTime = 0; // Allows jumping briefly after leaving platform
    this.jumpBufferTime = 0; // Allows buffering jump input
    this.jumpsRemaining = 2; // Double jump!
    this.doubleJumpSquat = 0; // Brief crouch animation on double jump

    // Images
    this.standingImg = me.loader.getImage("standing");
    this.runningImg = me.loader.getImage("running");
    this.crouchImg = me.loader.getImage("crouch");
    this.currentImage = this.standingImg;

    // Renderable
    this.renderable = new PlayerRenderable(this, collisionW, collisionH);

    this.anchorPoint.set(0, 0);

    this.platforms = [];
  }

  update(dt) {
    // Gather platforms once
    if (this.platforms.length === 0) {
      me.game.world.forEach((child) => {
        if (child !== this && child.body?.collisionType === me.collision.types.WORLD_OBJECT) {
          this.platforms.push(child);
        }
      });
      console.log("Found platforms:", this.platforms.length);
    }

    // Coyote time - allows jumping briefly after walking off platform
    if (this.onGround) {
      this.coyoteTime = 8;
    } else if (this.coyoteTime > 0) {
      this.coyoteTime--;
    }

    // Jump buffer - remembers jump input for a few frames
    if (me.input.isKeyPressed("jump")) {
      this.jumpBufferTime = 8;
    } else if (this.jumpBufferTime > 0) {
      this.jumpBufferTime--;
    }

    // Check crouch input
    this.isCrouching = me.input.isKeyPressed("down") && this.onGround;

    // Drop through platform when crouching and pressing down
    if (this.isCrouching && this.dropThroughTimer <= 0) {
      this.dropThroughTimer = 15;
    }
    if (this.dropThroughTimer > 0) {
      this.dropThroughTimer--;
    }

    // Movement with acceleration
    if (this.isCrouching) {
      this.velX *= this.friction;
    } else if (me.input.isKeyPressed("left")) {
      this.velX -= this.acceleration;
      if (this.velX < -this.moveSpeed) this.velX = -this.moveSpeed;
      this.facingRight = false;
    } else if (me.input.isKeyPressed("right")) {
      this.velX += this.acceleration;
      if (this.velX > this.moveSpeed) this.velX = this.moveSpeed;
      this.facingRight = true;
    } else {
      // Apply friction when no input
      this.velX *= this.friction;
      if (Math.abs(this.velX) < 0.1) this.velX = 0;
    }

    // Jumping with double jump
    if (this.jumpBufferTime > 0 && !this.isCrouching && this.jumpsRemaining > 0) {
      // Add brief crouch on double jump (not first jump)
      if (this.jumpsRemaining < 2 && !this.onGround) {
        this.doubleJumpSquat = 8; // 8 frames of crouch animation
      }
      this.velY = -this.jumpPower;
      this.onGround = false;
      this.isJumping = true;
      this.coyoteTime = 0;
      this.jumpBufferTime = 0;
      this.jumpsRemaining--;

      // Jump sound disabled - was annoying
      // try { me.audio.play("jump", false, null, 0.3); } catch(e) {}
    }

    // Decrement double jump squat timer
    if (this.doubleJumpSquat > 0) {
      this.doubleJumpSquat--;
    }

    // Reset jumps when on ground
    if (this.onGround) {
      this.jumpsRemaining = 2;
    }

    // Variable jump height - release early for shorter jump (but not too aggressive)
    if (this.isJumping && !me.input.isKeyPressed("jump") && this.velY < -10) {
      this.velY = -10;  // Less aggressive cut for better jump feel
    }

    // Track jumping state and landing
    if (this.onGround) {
      if (this.isJumping) {
        this.landingTimer = 8;
        // Play landing sound
        try { me.audio.play("enemykill", false, null, 0.2); } catch(e) {}
      }
      this.isJumping = false;
    }
    if (this.landingTimer > 0) {
      this.landingTimer--;
    }

    // Gravity
    this.velY += this.gravity;
    if (this.velY > this.maxFallSpeed) this.velY = this.maxFallSpeed;

    // Move and collide
    this.pos.x += this.velX;
    this.resolveCollisionsX();

    // Store previous platform for friction calculation
    const prevPlatform = this.currentPlatform;
    const prevPlatformX = this.lastPlatformX;

    this.pos.y += this.velY;
    this.onGround = false;
    this.currentPlatform = null;
    this.resolveCollisionsY();

    // Apply moving platform friction - move with the platform
    if (this.currentPlatform && this.currentPlatform.isMoving) {
      // Move with platform
      if (this.currentPlatform.velocityX) {
        this.pos.x += this.currentPlatform.velocityX;
      }
    } else if (prevPlatform && prevPlatform.isMoving && !this.currentPlatform) {
      // Just left a moving platform - add platform momentum to player velocity
      if (prevPlatform.velocityX) {
        this.velX += prevPlatform.velocityX * 0.8;
      }
    }

    // World bounds
    const worldW = me.game.world.width || 1280;
    if (this.pos.x < 0) this.pos.x = 0;
    if (this.pos.x > worldW - this.w) this.pos.x = worldW - this.w;

    // Respawn if fallen below the level
    const worldH = me.game.world.height || 2400;
    if (this.pos.y > worldH + 100) {
      this.pos.x = 100;
      this.pos.y = worldH - 180;
      this.velX = 0;
      this.velY = 0;
      // Play die sound
      try { me.audio.play("die", false, null, 0.4); } catch(e) {}
    }

    // Update animation state
    this.isRunning = Math.abs(this.velX) > 0.5 && this.onGround;
    if (this.isRunning) {
      this.runTimer += dt;
    } else {
      this.runTimer = 0;
    }

    // Update image
    if (this.isCrouching) {
      this.currentImage = this.crouchImg;
    } else if (this.doubleJumpSquat > 0) {
      // Brief crouch during double jump
      this.currentImage = this.crouchImg;
    } else if (this.isRunning) {
      this.currentImage = this.runningImg;
      this.landingTimer = 0;
    } else if (this.landingTimer > 0) {
      this.currentImage = this.crouchImg;
    } else {
      this.currentImage = this.standingImg;
    }

    // Check for collectible collisions manually
    me.game.world.forEach((child) => {
      if (child.body?.collisionType === me.collision.types.COLLECTABLE_OBJECT) {
        if (this.overlaps(child)) {
          if (typeof child.onCollision === "function") {
            child.onCollision(null, this);
          }
        }
      }
    });

    return true;
  }

  resolveCollisionsX() {
    for (const plat of this.platforms) {
      if (plat.isSolid && this.overlaps(plat)) {
        if (this.velX > 0) {
          this.pos.x = plat.pos.x - this.w;
        } else if (this.velX < 0) {
          this.pos.x = plat.pos.x + plat.width;
        }
        this.velX = 0;
      }
    }
  }

  resolveCollisionsY() {
    for (const plat of this.platforms) {
      // Skip crumbled platforms
      if (plat.isCrumbled) {
        continue;
      }

      if (this.overlaps(plat)) {
        if (plat.isSolid) {
          // Solid ground - full collision
          if (this.velY > 0) {
            this.pos.y = plat.pos.y - this.h;
            this.velY = 0;
            this.onGround = true;
          } else if (this.velY < 0) {
            this.pos.y = plat.pos.y + plat.height;
            this.velY = 0;
          }
        } else {
          // Platform - can drop through
          if (this.dropThroughTimer > 0) {
            continue;
          }
          // Only collide when falling from above
          if (this.velY > 0) {
            const prevBottom = this.pos.y + this.h - this.velY;
            if (prevBottom <= plat.pos.y + 5) {
              this.pos.y = plat.pos.y - this.h;
              this.velY = 0;
              this.onGround = true;
              this.currentPlatform = plat;

              // Track platform position for friction
              if (plat.isMoving) {
                this.lastPlatformX = plat.pos.x;
              }

              // Trigger crumbling if standing on ice platform
              if (plat.isCrumbling && typeof plat.startCrumble === 'function') {
                plat.startCrumble();
              }
            }
          }
        }
      }

      // Update crumble timer for platforms
      if (plat.crumbleTimer > 0 && typeof plat.updateCrumble === 'function') {
        plat.updateCrumble(16); // Approximate dt
      }
    }
  }

  overlaps(other) {
    return (
      this.pos.x < other.pos.x + other.width &&
      this.pos.x + this.w > other.pos.x &&
      this.pos.y < other.pos.y + other.height &&
      this.pos.y + this.h > other.pos.y
    );
  }

  onCollision(response, other) {
    // Handle collectible collisions
    if (other.body?.collisionType === me.collision.types.COLLECTABLE_OBJECT) {
      if (typeof other.onCollision === "function") {
        other.onCollision(response, this);
      }
    }
    return false;
  }
}

export default PlayerEntity;
