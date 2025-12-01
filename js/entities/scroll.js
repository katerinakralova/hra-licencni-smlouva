import * as me from "https://esm.run/melonjs@17";

// Popup to show scroll text
class ScrollPopup extends me.Renderable {
  constructor(text, onDismiss) {
    super(0, 0, 960, 640);
    this.text = text;
    this.floating = true;
    this.alwaysUpdate = true;
    this.onDismiss = onDismiss;
    this.timerStarted = false;
    this.totalTime = 6000; // 6 seconds total
    this.timeRemaining = this.totalTime;
    this.initialDelay = 500; // 0.5s before checking for movement
    this.frameCount = 0;
  }

  update(dt) {
    this.frameCount++;

    // Wait a bit before starting countdown
    if (this.frameCount < 30) {
      return true;
    }

    // Start timer immediately (movement check disabled but kept for reference)
    if (!this.timerStarted) {
      this.timerStarted = true;
      /* Movement-based start (disabled):
      if (me.input.isKeyPressed("left") ||
          me.input.isKeyPressed("right") ||
          me.input.isKeyPressed("jump") ||
          me.input.isKeyPressed("down")) {
        this.timerStarted = true;
      }
      */
    }

    // Countdown when timer started
    if (this.timerStarted) {
      this.timeRemaining -= dt;
      if (this.timeRemaining <= 0) {
        if (this.onDismiss) {
          this.onDismiss();
        }
        if (this.ancestor) {
          me.game.world.removeChild(this);
        }
        return false;
      }
    }

    return true;
  }

  draw(renderer) {
    const ctx = renderer.getContext();
    const w = me.game.viewport.width;

    // Save and reset transform for screen-space drawing
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);

    // Semi-transparent banner at bottom of screen
    const bannerX = 80;
    const bannerY = me.game.viewport.height - 140;
    const bannerW = w - 160;
    const bannerH = 120;

    ctx.fillStyle = "rgba(30, 60, 90, 0.95)";
    ctx.fillRect(bannerX, bannerY, bannerW, bannerH);

    // Border
    ctx.strokeStyle = "#87CEEB";
    ctx.lineWidth = 3;
    ctx.strokeRect(bannerX, bannerY, bannerW, bannerH);

    // Scroll text
    ctx.font = "bold 18px Georgia";
    ctx.fillStyle = "#FFFFFF";
    ctx.textAlign = "center";

    // Word wrap the text
    const maxWidth = bannerW - 40;
    const words = this.text.split(' ');
    let line = '';
    let textY = bannerY + 40;

    for (let word of words) {
      const testLine = line + word + ' ';
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth && line !== '') {
        ctx.fillText(line.trim(), w / 2, textY);
        line = word + ' ';
        textY += 26;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line.trim(), w / 2, textY);

    // Scroll count
    ctx.font = "bold 14px Arial";
    ctx.fillStyle = "#87CEEB";
    ctx.fillText(`Článek ${window.gameData.scrollsCollected} z ${window.gameData.totalScrolls}`, w / 2, bannerY + bannerH - 20);

    // Progress bar (shows when timer is running)
    if (this.timerStarted) {
      const barWidth = bannerW - 40;
      const barHeight = 6;
      const barX = bannerX + 20;
      const barY = bannerY + bannerH - 12;
      const progress = this.timeRemaining / this.totalTime;

      // Background
      ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
      ctx.fillRect(barX, barY, barWidth, barHeight);

      // Progress (shrinks from right to left)
      ctx.fillStyle = "#87CEEB";
      ctx.fillRect(barX, barY, barWidth * progress, barHeight);
    }

    ctx.restore();
  }
}

// Custom renderable for scroll (using a simple drawn scroll)
class ScrollRenderable extends me.Renderable {
  constructor(width, height) {
    super(0, 0, width, height);
    this.anchorPoint.set(0.5, 0.5);
    this.bobOffset = 0;
    this.bobTimer = Math.random() * Math.PI * 2; // Random start phase
  }

  update(dt) {
    this.bobTimer += dt * 0.005;
    this.bobOffset = Math.sin(this.bobTimer) * 5;
    return true;
  }

  draw(renderer) {
    const ctx = renderer.getContext();
    const x = this.pos.x;
    const y = this.pos.y + this.bobOffset;
    const w = this.width;
    const h = this.height;

    ctx.save();

    // Draw scroll body (parchment color)
    ctx.fillStyle = "#F5DEB3";
    ctx.fillRect(x + 5, y + 5, w - 10, h - 10);

    // Scroll edges (rolled parts)
    ctx.fillStyle = "#DEB887";
    ctx.beginPath();
    ctx.ellipse(x + 5, y + h / 2, 5, h / 2 - 2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(x + w - 5, y + h / 2, 5, h / 2 - 2, 0, 0, Math.PI * 2);
    ctx.fill();

    // Draw some lines to represent text
    ctx.fillStyle = "#8B4513";
    for (let i = 0; i < 3; i++) {
      ctx.fillRect(x + 12, y + 12 + i * 8, w - 24, 2);
    }

    // Add a golden glow effect
    ctx.shadowColor = "#FFD700";
    ctx.shadowBlur = 10;
    ctx.strokeStyle = "#DAA520";
    ctx.lineWidth = 2;
    ctx.strokeRect(x + 3, y + 3, w - 6, h - 6);

    ctx.restore();
  }
}

class ScrollEntity extends me.Entity {
  constructor(x, y, settings) {
    settings = settings || {};
    const width = settings.width || 50;
    const height = settings.height || 50;

    super(x, y, {
      width: width,
      height: height,
      shapes: [new me.Rect(0, 0, width, height)]
    });

    // Store the scroll text
    this.scrollText = settings.text || "An ancient legal wisdom...";

    // Set up collision
    this.body.collisionType = me.collision.types.COLLECTABLE_OBJECT;
    this.body.setStatic(true);

    // Custom renderable
    this.renderable = new ScrollRenderable(width, height);

    this.alwaysUpdate = true;
    this.collected = false;

    // Platform attachment for moving scrolls
    this.attachedPlatform = null;
    this.offsetX = 0;
  }

  // Attach to a moving platform
  attachToPlatform(platform) {
    this.attachedPlatform = platform;
    this.offsetX = this.pos.x - platform.pos.x;
  }

  update(dt) {
    // Follow attached platform
    if (this.attachedPlatform && !this.collected) {
      this.pos.x = this.attachedPlatform.pos.x + this.offsetX;
    }

    if (this.renderable) {
      this.renderable.update(dt);
    }
    return super.update(dt);
  }

  onCollision(response, other) {
    // Prevent double collection
    if (this.collected) return false;
    this.collected = true;

    // Update game data
    window.gameData.scrollsCollected++;
    window.gameData.scrollTexts.push(this.scrollText);

    // Play collect sound
    try { me.audio.play("cling", false, null, 0.5); } catch(e) {}

    // Hide tutorial on first scroll pickup
    if (window.gameData.scrollsCollected === 1) {
      const instructions = document.getElementById('instructions');
      if (instructions) {
        instructions.style.transition = 'opacity 0.5s';
        instructions.style.opacity = '0';
        setTimeout(() => { instructions.style.display = 'none'; }, 500);
      }
    }

    // Show the scroll text
    this.showScrollMessage();

    // Remove the scroll
    me.game.world.removeChild(this);

    return false;
  }

  showScrollMessage() {
    // Create a simple popup renderable with callback for win check
    const self = this;
    const popup = new ScrollPopup(this.scrollText, () => {
      // Check for win condition when dismissed
      if (window.gameData.scrollsCollected >= window.gameData.totalScrolls) {
        self.showWinScreen();
      }
    });
    me.game.world.addChild(popup, 100);
  }

  showWinScreen() {
    // Disable player controls
    me.input.unbindKey(me.input.KEY.LEFT);
    me.input.unbindKey(me.input.KEY.RIGHT);
    me.input.unbindKey(me.input.KEY.UP);
    me.input.unbindKey(me.input.KEY.SPACE);
    me.input.unbindKey(me.input.KEY.A);
    me.input.unbindKey(me.input.KEY.D);
    me.input.unbindKey(me.input.KEY.W);
    me.input.unbindKey(me.input.KEY.DOWN);
    me.input.unbindKey(me.input.KEY.S);

    // Create win background renderable
    const winBg = new me.Renderable(0, 0, me.game.viewport.width, me.game.viewport.height);
    winBg.name = 'winBackground';
    winBg.draw = function(renderer) {
      const ctx = renderer.getContext();
      const w = me.game.viewport.width;
      const h = me.game.viewport.height;

      // Reset transform for screen-space drawing
      ctx.save();
      ctx.setTransform(1, 0, 0, 1, 0, 0);

      ctx.fillStyle = "rgba(0, 0, 0, 0.85)";
      ctx.fillRect(0, 0, w, h);

      // Draw win text
      ctx.font = "bold 48px Arial";
      ctx.fillStyle = "#FFD700";
      ctx.textAlign = "center";
      ctx.fillText("Gratulujeme!", w / 2, h / 2 - 80);

      ctx.font = "24px Arial";
      ctx.fillStyle = "#FFFFFF";
      ctx.fillText("Sesbírali jste všech 6 článků licenční smlouvy!", w / 2, h / 2 - 20);

      ctx.font = "20px Arial";
      ctx.fillStyle = "#90EE90";
      ctx.fillText("Nyní znáte svá práva při užívání obrázků z fotobanky.", w / 2, h / 2 + 20);

      ctx.restore();
    };
    winBg.floating = true;
    winBg.alwaysUpdate = true;
    winBg.update = function() { return true; };

    me.game.world.addChild(winBg, 200);

    // Create buttons in HTML
    const buttonContainer = document.createElement('div');
    buttonContainer.id = 'win-buttons';
    buttonContainer.style.cssText = 'position:fixed;bottom:80px;left:50%;transform:translateX(-50%);display:flex;gap:20px;z-index:1000;';

    /* Hidden restart button - kept for potential future use
    const restartBtn = document.createElement('button');
    restartBtn.textContent = 'Hrát znovu';
    restartBtn.style.cssText = 'padding:15px 30px;font-size:18px;background:#FFD700;border:none;border-radius:8px;cursor:pointer;font-weight:bold;';
    restartBtn.onclick = () => {
      // Remove all HTML elements
      const btns = document.getElementById('win-buttons');
      if (btns) btns.remove();
      const overlay = document.getElementById('articles-overlay');
      if (overlay) overlay.remove();

      // Show instructions again
      const instructions = document.getElementById('instructions');
      if (instructions) {
        instructions.style.display = 'block';
        instructions.style.opacity = '1';
      }

      // Reset game data
      window.gameData.scrollsCollected = 0;
      window.gameData.scrollTexts = [];

      // Restart the game state properly
      me.state.restart();
    };
    buttonContainer.appendChild(restartBtn);
    */

    const showArticlesBtn = document.createElement('button');
    showArticlesBtn.textContent = 'Zobrazit články';
    showArticlesBtn.style.cssText = 'padding:15px 30px;font-size:18px;background:#87CEEB;border:none;border-radius:8px;cursor:pointer;font-weight:bold;';
    showArticlesBtn.onclick = () => {
      buttonContainer.style.display = 'none';
      this.showAllArticles(buttonContainer);
    };

    buttonContainer.appendChild(showArticlesBtn);
    document.body.appendChild(buttonContainer);
  }

  showAllArticles(buttonContainer) {
    // Create overlay with all articles
    let overlay = document.getElementById('articles-overlay');
    if (overlay) {
      overlay.remove();
      if (buttonContainer) buttonContainer.style.display = 'flex';
      return;
    }

    overlay = document.createElement('div');
    overlay.id = 'articles-overlay';
    overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.95);z-index:1001;overflow-y:auto;padding:40px;box-sizing:border-box;';

    const content = document.createElement('div');
    content.style.cssText = 'max-width:800px;margin:0 auto;color:white;font-family:Georgia,serif;';

    const title = document.createElement('h1');
    title.textContent = 'Licenční smlouva fotobanky';
    title.style.cssText = 'color:#FFD700;text-align:center;margin-bottom:30px;';
    content.appendChild(title);

    const articles = [
      "Článek 1: Stažením obrázku získáváte nevýhradní licenci k jeho užití pro osobní a nekomerční účely.",
      "Článek 2: ÚPRAVY - Obrázek smíte libovolně upravovat, měnit jeho velikost, barvy, ořezávat jej či jinak modifikovat dle svých potřeb.",
      "Článek 3: SPOJENÍ S DÍLEM - Obrázek smíte spojit s jiným dílem, včlenit do koláže, prezentace či jakéhokoliv vlastního projektu.",
      "Článek 4: TERITORIUM - Licence platí celosvětově, bez územního omezení. Obrázek můžete užívat kdekoliv na světě.",
      "Článek 5: AUTORSTVÍ - Nejste povinni uvádět jméno původního autora ani zdroj obrázku při jeho užití.",
      "Článek 6: ZÁKAZ KOMERČNÍHO UŽITÍ - Obrázek NESMÍTE používat pro komerční účely, tj. k přímému či nepřímému finančnímu zisku."
    ];

    articles.forEach((text, i) => {
      const article = document.createElement('div');
      article.style.cssText = 'background:rgba(30,60,90,0.8);padding:20px;margin-bottom:15px;border-radius:8px;border-left:4px solid #87CEEB;';
      article.innerHTML = `<p style="margin:0;font-size:16px;line-height:1.6;">${text}</p>`;
      content.appendChild(article);
    });

    const closeBtn = document.createElement('button');
    closeBtn.textContent = 'Zavřít';
    closeBtn.style.cssText = 'display:block;margin:30px auto;padding:15px 40px;font-size:18px;background:#FFD700;border:none;border-radius:8px;cursor:pointer;font-weight:bold;';
    closeBtn.onclick = () => {
      overlay.remove();
      if (buttonContainer) buttonContainer.style.display = 'flex';
    };
    content.appendChild(closeBtn);

    overlay.appendChild(content);
    document.body.appendChild(overlay);
  }
}

export default ScrollEntity;
