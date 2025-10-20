// Game Constants
const CANVAS_WIDTH = 1200;
const CANVAS_HEIGHT = 800;
const PLAYER_RADIUS = 15;
const SEGMENT_RADIUS = 12;
const ENEMY_RADIUS = 12;
const XP_ORB_RADIUS = 6;
const PLAYER_SPEED = 3;
const ENEMY_SPEED = 1.5;

// Game State
const game = {
    state: 'menu', // menu, playing, levelup, gameover
    canvas: null,
    ctx: null,
    player: null,
    enemies: [],
    xpOrbs: [],
    projectiles: [],
    keys: {},
    time: 0,
    kills: 0,
    lastEnemySpawn: 0,
    enemySpawnRate: 2000, // ms
    waveMultiplier: 1,
    animationId: null
};

// Player Class
class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.vx = 0;
        this.vy = 0;
        this.segments = []; // Snake tail
        this.maxHealth = 100;
        this.health = 100;
        this.level = 1;
        this.xp = 0;
        this.xpToNextLevel = 100;
        this.attackDamage = 10;
        this.attackSpeed = 1000; // ms
        this.lastAttack = 0;
        this.attackRange = 200;
        this.projectileSpeed = 5;
        this.weapons = ['basic'];
        this.moveSpeed = PLAYER_SPEED;
    }

    update(deltaTime) {
        // Handle input
        this.vx = 0;
        this.vy = 0;

        if (game.keys['w'] || game.keys['ArrowUp']) this.vy = -1;
        if (game.keys['s'] || game.keys['ArrowDown']) this.vy = 1;
        if (game.keys['a'] || game.keys['ArrowLeft']) this.vx = -1;
        if (game.keys['d'] || game.keys['ArrowRight']) this.vx = 1;

        // Normalize diagonal movement
        if (this.vx !== 0 && this.vy !== 0) {
            this.vx *= 0.707;
            this.vy *= 0.707;
        }

        // Update position
        const prevX = this.x;
        const prevY = this.y;

        this.x += this.vx * this.moveSpeed;
        this.y += this.vy * this.moveSpeed;

        // Keep player in bounds
        this.x = Math.max(PLAYER_RADIUS, Math.min(CANVAS_WIDTH - PLAYER_RADIUS, this.x));
        this.y = Math.max(PLAYER_RADIUS, Math.min(CANVAS_HEIGHT - PLAYER_RADIUS, this.y));

        // Update tail segments
        if (this.segments.length > 0 && (this.vx !== 0 || this.vy !== 0)) {
            // Add current position as new segment
            this.segments.unshift({ x: prevX, y: prevY });

            // Keep only the number of segments we should have
            const maxSegments = (this.level - 1) * 3;
            if (this.segments.length > maxSegments) {
                this.segments.pop();
            }
        }

        // Auto-attack
        this.attack();
    }

    attack() {
        const now = Date.now();
        if (now - this.lastAttack < this.attackSpeed) return;

        // Find nearest enemy
        let nearestEnemy = null;
        let nearestDist = Infinity;

        for (const enemy of game.enemies) {
            const dist = Math.hypot(enemy.x - this.x, enemy.y - this.y);
            if (dist < this.attackRange && dist < nearestDist) {
                nearestDist = dist;
                nearestEnemy = enemy;
            }
        }

        if (nearestEnemy) {
            // Fire projectile at nearest enemy
            const angle = Math.atan2(nearestEnemy.y - this.y, nearestEnemy.x - this.x);
            game.projectiles.push({
                x: this.x,
                y: this.y,
                vx: Math.cos(angle) * this.projectileSpeed,
                vy: Math.sin(angle) * this.projectileSpeed,
                damage: this.attackDamage,
                radius: 5
            });
            this.lastAttack = now;
        }
    }

    takeDamage(amount) {
        this.health -= amount;
        if (this.health <= 0) {
            this.health = 0;
            gameOver();
        }
    }

    gainXP(amount) {
        this.xp += amount;
        if (this.xp >= this.xpToNextLevel) {
            this.levelUp();
        }
    }

    levelUp() {
        this.level++;
        this.xp -= this.xpToNextLevel;
        this.xpToNextLevel = Math.floor(this.xpToNextLevel * 1.5);

        // Show level up screen
        game.state = 'levelup';
        showUpgradeOptions();
    }

    draw(ctx) {
        // Draw tail segments
        for (let i = this.segments.length - 1; i >= 0; i--) {
            const segment = this.segments[i];
            const alpha = 0.3 + (i / this.segments.length) * 0.7;
            ctx.fillStyle = `rgba(78, 204, 163, ${alpha})`;
            ctx.beginPath();
            ctx.arc(segment.x, segment.y, SEGMENT_RADIUS, 0, Math.PI * 2);
            ctx.fill();

            // Draw connecting line
            if (i === 0) {
                ctx.strokeStyle = `rgba(78, 204, 163, ${alpha})`;
                ctx.lineWidth = SEGMENT_RADIUS * 2;
                ctx.beginPath();
                ctx.moveTo(segment.x, segment.y);
                ctx.lineTo(this.x, this.y);
                ctx.stroke();
            } else if (i < this.segments.length - 1) {
                const nextSegment = this.segments[i - 1];
                ctx.strokeStyle = `rgba(78, 204, 163, ${alpha})`;
                ctx.lineWidth = SEGMENT_RADIUS * 2;
                ctx.beginPath();
                ctx.moveTo(segment.x, segment.y);
                ctx.lineTo(nextSegment.x, nextSegment.y);
                ctx.stroke();
            }
        }

        // Draw head
        ctx.fillStyle = '#4ecca3';
        ctx.beginPath();
        ctx.arc(this.x, this.y, PLAYER_RADIUS, 0, Math.PI * 2);
        ctx.fill();

        // Draw eyes
        ctx.fillStyle = '#1a1a2e';
        ctx.beginPath();
        ctx.arc(this.x - 5, this.y - 5, 3, 0, Math.PI * 2);
        ctx.arc(this.x + 5, this.y - 5, 3, 0, Math.PI * 2);
        ctx.fill();
    }
}

// Enemy Class
class Enemy {
    constructor(x, y, type = 'normal') {
        this.x = x;
        this.y = y;
        this.type = type;
        this.health = 20;
        this.maxHealth = 20;
        this.speed = ENEMY_SPEED;
        this.damage = 5;
        this.xpValue = 10;
        this.radius = ENEMY_RADIUS;
        this.color = '#ff4444';
        this.lastDamage = 0;
    }

    update() {
        // Move towards player
        const dx = game.player.x - this.x;
        const dy = game.player.y - this.y;
        const dist = Math.hypot(dx, dy);

        if (dist > 0) {
            this.x += (dx / dist) * this.speed;
            this.y += (dy / dist) * this.speed;
        }

        // Check collision with player head
        const distToPlayer = Math.hypot(this.x - game.player.x, this.y - game.player.y);
        if (distToPlayer < this.radius + PLAYER_RADIUS) {
            const now = Date.now();
            if (now - this.lastDamage > 500) {
                game.player.takeDamage(this.damage);
                this.lastDamage = now;
            }
        }

        // Check collision with player tail
        for (const segment of game.player.segments) {
            const distToSegment = Math.hypot(this.x - segment.x, this.y - segment.y);
            if (distToSegment < this.radius + SEGMENT_RADIUS) {
                const now = Date.now();
                if (now - this.lastDamage > 500) {
                    game.player.takeDamage(this.damage);
                    this.lastDamage = now;
                }
                break;
            }
        }
    }

    takeDamage(amount) {
        this.health -= amount;
        if (this.health <= 0) {
            this.die();
        }
    }

    die() {
        // Spawn XP orb
        game.xpOrbs.push({
            x: this.x,
            y: this.y,
            value: this.xpValue,
            radius: XP_ORB_RADIUS
        });

        // Remove enemy
        const index = game.enemies.indexOf(this);
        if (index > -1) {
            game.enemies.splice(index, 1);
        }

        game.kills++;
    }

    draw(ctx) {
        // Draw enemy
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();

        // Draw health bar
        const barWidth = this.radius * 2;
        const barHeight = 3;
        const healthPercent = this.health / this.maxHealth;

        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(this.x - barWidth / 2, this.y - this.radius - 8, barWidth, barHeight);

        ctx.fillStyle = '#ff6b6b';
        ctx.fillRect(this.x - barWidth / 2, this.y - this.radius - 8, barWidth * healthPercent, barHeight);
    }
}

// Spawn enemies
function spawnEnemy() {
    const side = Math.floor(Math.random() * 4);
    let x, y;

    switch (side) {
        case 0: // top
            x = Math.random() * CANVAS_WIDTH;
            y = -ENEMY_RADIUS;
            break;
        case 1: // right
            x = CANVAS_WIDTH + ENEMY_RADIUS;
            y = Math.random() * CANVAS_HEIGHT;
            break;
        case 2: // bottom
            x = Math.random() * CANVAS_WIDTH;
            y = CANVAS_HEIGHT + ENEMY_RADIUS;
            break;
        case 3: // left
            x = -ENEMY_RADIUS;
            y = Math.random() * CANVAS_HEIGHT;
            break;
    }

    game.enemies.push(new Enemy(x, y));
}

// Update game
function update(deltaTime) {
    if (game.state !== 'playing') return;

    game.player.update(deltaTime);

    // Update enemies
    for (const enemy of game.enemies) {
        enemy.update();
    }

    // Update projectiles
    for (let i = game.projectiles.length - 1; i >= 0; i--) {
        const proj = game.projectiles[i];
        proj.x += proj.vx;
        proj.y += proj.vy;

        // Remove if out of bounds
        if (proj.x < 0 || proj.x > CANVAS_WIDTH || proj.y < 0 || proj.y > CANVAS_HEIGHT) {
            game.projectiles.splice(i, 1);
            continue;
        }

        // Check collision with enemies
        for (const enemy of game.enemies) {
            const dist = Math.hypot(proj.x - enemy.x, proj.y - enemy.y);
            if (dist < proj.radius + enemy.radius) {
                enemy.takeDamage(proj.damage);
                game.projectiles.splice(i, 1);
                break;
            }
        }
    }

    // Update XP orbs (move towards player)
    for (let i = game.xpOrbs.length - 1; i >= 0; i--) {
        const orb = game.xpOrbs[i];
        const dist = Math.hypot(orb.x - game.player.x, orb.y - game.player.y);

        // Magnet effect
        if (dist < 100) {
            const dx = game.player.x - orb.x;
            const dy = game.player.y - orb.y;
            orb.x += (dx / dist) * 4;
            orb.y += (dy / dist) * 4;
        }

        // Collect orb
        if (dist < PLAYER_RADIUS + orb.radius) {
            game.player.gainXP(orb.value);
            game.xpOrbs.splice(i, 1);
        }
    }

    // Spawn enemies
    const now = Date.now();
    if (now - game.lastEnemySpawn > game.enemySpawnRate / game.waveMultiplier) {
        spawnEnemy();
        game.lastEnemySpawn = now;
    }

    // Increase difficulty over time
    game.waveMultiplier = 1 + (game.time / 60);
}

// Draw game
function draw() {
    const ctx = game.ctx;

    // Clear canvas
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw grid
    ctx.strokeStyle = 'rgba(78, 204, 163, 0.05)';
    ctx.lineWidth = 1;
    for (let i = 0; i < CANVAS_WIDTH; i += 50) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, CANVAS_HEIGHT);
        ctx.stroke();
    }
    for (let i = 0; i < CANVAS_HEIGHT; i += 50) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(CANVAS_WIDTH, i);
        ctx.stroke();
    }

    // Draw XP orbs
    for (const orb of game.xpOrbs) {
        ctx.fillStyle = '#ffcc00';
        ctx.beginPath();
        ctx.arc(orb.x, orb.y, orb.radius, 0, Math.PI * 2);
        ctx.fill();

        // Glow effect
        ctx.strokeStyle = 'rgba(255, 204, 0, 0.3)';
        ctx.lineWidth = 3;
        ctx.stroke();
    }

    // Draw projectiles
    for (const proj of game.projectiles) {
        ctx.fillStyle = '#5ef3b3';
        ctx.beginPath();
        ctx.arc(proj.x, proj.y, proj.radius, 0, Math.PI * 2);
        ctx.fill();
    }

    // Draw enemies
    for (const enemy of game.enemies) {
        enemy.draw(ctx);
    }

    // Draw player
    game.player.draw(ctx);

    // Update UI
    updateUI();
}

// Update UI
function updateUI() {
    const healthPercent = (game.player.health / game.player.maxHealth) * 100;
    document.getElementById('health-fill').style.width = healthPercent + '%';
    document.getElementById('health-text').textContent = `${game.player.health}/${game.player.maxHealth}`;

    const xpPercent = (game.player.xp / game.player.xpToNextLevel) * 100;
    document.getElementById('xp-fill').style.width = xpPercent + '%';

    document.getElementById('level-text').textContent = game.player.level;
    document.getElementById('kills-text').textContent = game.kills;

    const minutes = Math.floor(game.time / 60);
    const seconds = Math.floor(game.time % 60);
    document.getElementById('time-text').textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

// Game loop
let lastTime = 0;
function gameLoop(timestamp) {
    const deltaTime = timestamp - lastTime;
    lastTime = timestamp;

    if (game.state === 'playing') {
        game.time += deltaTime / 1000;
        update(deltaTime);
    }

    draw();

    game.animationId = requestAnimationFrame(gameLoop);
}

// Show upgrade options
function showUpgradeOptions() {
    const upgrades = [
        {
            name: 'Increased Damage',
            description: 'Increase attack damage by 5',
            apply: () => game.player.attackDamage += 5
        },
        {
            name: 'Faster Attacks',
            description: 'Reduce attack cooldown by 15%',
            apply: () => game.player.attackSpeed *= 0.85
        },
        {
            name: 'Longer Range',
            description: 'Increase attack range by 30',
            apply: () => game.player.attackRange += 30
        },
        {
            name: 'Max Health Up',
            description: 'Increase max health by 20 and restore health',
            apply: () => {
                game.player.maxHealth += 20;
                game.player.health = game.player.maxHealth;
            }
        },
        {
            name: 'Speed Boost',
            description: 'Increase movement speed by 10%',
            apply: () => game.player.moveSpeed *= 1.1
        },
        {
            name: 'Rapid Fire',
            description: 'Significantly increase attack speed',
            apply: () => game.player.attackSpeed *= 0.7
        }
    ];

    // Randomly select 3 upgrades
    const shuffled = upgrades.sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, 3);

    const container = document.getElementById('upgrade-options');
    container.innerHTML = '';

    for (const upgrade of selected) {
        const card = document.createElement('div');
        card.className = 'upgrade-card';
        card.innerHTML = `
            <h3>${upgrade.name}</h3>
            <p>${upgrade.description}</p>
        `;
        card.addEventListener('click', () => {
            upgrade.apply();
            game.state = 'playing';
            document.getElementById('levelup-screen').classList.remove('active');
            document.getElementById('game-screen').classList.add('active');
        });
        container.appendChild(card);
    }
}

// Game over
function gameOver() {
    game.state = 'gameover';
    document.getElementById('game-screen').classList.remove('active');
    document.getElementById('gameover-screen').classList.add('active');

    const minutes = Math.floor(game.time / 60);
    const seconds = Math.floor(game.time % 60);

    document.getElementById('final-stats').innerHTML = `
        <div><span class="stat-label">Final Level:</span> ${game.player.level}</div>
        <div><span class="stat-label">Enemies Killed:</span> ${game.kills}</div>
        <div><span class="stat-label">Time Survived:</span> ${minutes}:${seconds.toString().padStart(2, '0')}</div>
        <div><span class="stat-label">Tail Length:</span> ${game.player.segments.length}</div>
    `;
}

// Start game
function startGame() {
    // Reset game state
    game.player = new Player(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
    game.enemies = [];
    game.xpOrbs = [];
    game.projectiles = [];
    game.time = 0;
    game.kills = 0;
    game.lastEnemySpawn = Date.now();
    game.waveMultiplier = 1;
    game.state = 'playing';

    // Show game screen
    document.getElementById('menu-screen').classList.remove('active');
    document.getElementById('gameover-screen').classList.remove('active');
    document.getElementById('game-screen').classList.add('active');

    // Start game loop if not running
    if (!game.animationId) {
        lastTime = performance.now();
        gameLoop(lastTime);
    }
}

// Initialize
window.addEventListener('load', () => {
    game.canvas = document.getElementById('game-canvas');
    game.ctx = game.canvas.getContext('2d');
    game.canvas.width = CANVAS_WIDTH;
    game.canvas.height = CANVAS_HEIGHT;

    // Event listeners
    document.getElementById('start-button').addEventListener('click', startGame);
    document.getElementById('restart-button').addEventListener('click', startGame);

    // Keyboard input
    window.addEventListener('keydown', (e) => {
        game.keys[e.key] = true;

        // Prevent arrow key scrolling
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
            e.preventDefault();
        }
    });

    window.addEventListener('keyup', (e) => {
        game.keys[e.key] = false;
    });
});
