var obstacles = [];
var bullets = [];
var targets = [];
const SCREENSIZE = {
    w: 1000,
    h: 600
};
const GRAVITY = 0.1;
const PHYSICS_ACCURACY = 0.1; // lower = more accurate. should always be < 1
const BOUNCE_FACTOR = -0.4;
const FRICTION_FACTOR = 0.7;
const CAMSPEED = 0.90; // lower = faster
const GUNSIZE = 30;
const MAXTARGETS = 20;
const OBSTACLECOUNT = 50;
var bufferRenderer;
var score = 0;



class obstacle {
    constructor(x, y, w, h, isColored, texture, effect) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;

        this.texture = texture;
        if (!texture) this.texture = false;

        this.effect = effect;
        if (!effect) this.effect = false;

        this.isColored = isColored;
        
        obstacles.push(this);
    }
};

class bullet {
    constructor(x, y, xv, yv, rad, dam, range) {
        this.x = x;
        this.y = y;
        this.rad = rad;
        this.dam = dam;
        this.xv = xv;
        this.yv = yv;
        this.life = range;

        bullets.push(this);
    }

    isHit() {
        for (let i = 0; i < obstacles.length; i++) {
            let o = obstacles[i];
            if ((this.x > o.x) && (this.y > o.y) && (this.x < o.x + o.w) && (this.y < o.y + o.h)) {
                return true;
            }
        }
        return false;
    }

    update() {
        if (!this.life) return;
        this.x += this.xv;
        this.y += this.yv;
        this.yv += GRAVITY;
        this.life--;
        if (this.isHit()) this.life = 0;
    }
};

class target {
    constructor (x, y) {
        this.w = textures.enemies.target.width;
        this.h = textures.enemies.target.height;
        this.x = x - this.w / 2;
        this.y = y - this.h / 2;
        this.hit = false;

        while (this.isColliding()) {
            this.y += 1;
        }

        while (!this.isColliding()) {
            this.y += 5;
        }

        targets.push(this);
    }

    update() {
        if (this.hit) return;
        for (let i = 0; i < bullets.length; i++) {
            let b = bullets[i];
            if ((b.x > this.x) && (b.y > this.y) && (b.x < this.x + this.w) && (b.y < this.y + this.h)) {
                b.life = 0;
                this.hit = true;
                score++;
                sounds.hits[Math.floor(random(0, sounds.hits.length))].play();
                return;
            }
        }
    }

    isColliding() {
        for (let i = 0; i < obstacles.length; i++) {
            let o = obstacles[i];
            if (rectsCollide(this.x, this.y, this.w, this.h, o.x, o.y, o.w, o.h)) return true;
        }
        return false;
    }
}

var player = {
    x: 0,
    y: -100,
    xv: 0,
    yv: 0,
    cx: 10,
    cy: -80,
    w: 20,
    h: 40,
    maxSpeed: 8,
    lastCollision: undefined,
    isColliding: function() {
        if (this.lastCollision != undefined) {
            let o = obstacles[this.lastCollision];
            if (rectsCollide(this.x, this.y, this.w, this.h, o.x, o.y, o.w, o.h)) {
                return obstacles[i];
            }
        }

        for (let i = 0; i < obstacles.length; i++) {
            if (i == this.lastCollision) continue;
            let o = obstacles[i];
            if (rectsCollide(this.x, this.y, this.w, this.h, o.x, o.y, o.w, o.h)) {
                return obstacles[i];
            }
        }
        return false;
    },

    gun: {
        power: 10,
        reload: 20,
        curCharge: 0,
        recoil: 0.15,
        baseRecoil: 0.15,
        maxRecoil: 0.75,
        speed: 20
    }
};

var cam = {
    x: player.cx - (SCREENSIZE.w / 2),
    y: player.cy - (SCREENSIZE.h / 2),
    w: SCREENSIZE.w,
    h: SCREENSIZE.h,
    moveRatio: CAMSPEED
};

var textures = {};
var sounds = {};

function rectsCollide(x1, y1, w1, h1, x2, y2, w2, h2) {
    return !((x1 > x2 + w2) || (y1 > y2 + h2) || (x1 + w1 < x2) || (y1 + h1 < y2));
}


function preload() {
    textures.pyramids = loadImage("./Resources/Textures/backgroundColorDesert.png");
    textures.enemies = {
        target: loadImage("./Resources/Textures/target.png")
    };
    textures.obstacles = {
        sandstone: loadImage("./Resources/Textures/sandStone.png"),
        wall: loadImage("./Resources/Textures/brick_grey.png")
    };

    sounds.gunshots = [];
    for (let i = 0; i < 5; i++) {
        sounds.gunshots.push(new Howl({src: ["./Resources/Sound/shot" + i + ".ogg"]}));
    }

    sounds.hits = [];
    for (let i = 0; i < 5; i++) {
        sounds.hits.push(new Howl({src: ["./Resources/Sound/hit" + i + ".ogg"]}))
    }
}

function setup() {
    createCanvas(SCREENSIZE.w, SCREENSIZE.h).center("horizontal");
    bufferRenderer = createGraphics(0, 0);
    new obstacle(-1000, 0, 2000, 1000, false, textures.obstacles.wall);

    for (let i = 0; i < OBSTACLECOUNT; i++) {
        new obstacle(random(-1000, 1000), random(-200, -2000), random(100, 300), random(10, 30), true, color(random(150, 255), random(100, 150), random(100, 150)));
    }
}

function textureRect(x, y, w, h, texture, xoff, yoff) {
    let bufferRenderer = createGraphics(w, h);
    // bufferRenderer.w = w;
    // bufferRenderer.h = h;
    // bufferRenderer.resize(w, h);
    bufferRenderer.background(0);

    if ((xoff != undefined) && (yoff != undefined)) {
        for (let x = xoff; x < w; x += texture.width) {
            for (let y = yoff; y < h; y += texture.height) {
                bufferRenderer.image(texture, x, y);
            }
        }
    } else {
        for (let x = 0; x < w; x += texture.width) {
            for (let y = 0; y < h; y += texture.height) {
                bufferRenderer.image(texture, x, y);
            }
        }
    }


    image(bufferRenderer, x, y);
    bufferRenderer.remove();
}

function draw() {
    background(207, 239, 252);
    if (cam.y + cam.h > -724) {

        let firstX = -(cam.x % textures.pyramids.width) - textures.pyramids.width;
        let repeats = 3;
        for (let x = firstX, i = 0; i < repeats; x += textures.pyramids.width, i++) {
            image(textures.pyramids, x, Math.max(-724 - cam.y, -724 + cam.h / 2));
        }
    }

    // spawn in the targets
    while (targets.length < MAXTARGETS) {
        new target(random(-1000, 1000), random(-210, -2100));
    }

    player.yv += GRAVITY;
    player.gun.curCharge = Math.max(0, player.gun.curCharge - 1);
    player.gun.recoil = map(player.gun.curCharge, 0, player.gun.reload, player.gun.baseRecoil, player.gun.maxRecoil)

    let pvel = dist(0, 0, player.xv, player.yv);
    if (pvel > player.maxSpeed) { // cap out the player's speed
        player.xv *= player.maxSpeed / pvel;
        player.yv *= player.maxSpeed / pvel;
    }

    player.x += player.xv;
    player.y += player.yv;

    if (player.isColliding()) {
        player.y -= player.yv;
        if (player.isColliding()) {
            player.x -= player.xv;
            player.y += player.yv;

            if (player.isColliding()) {
                // diagonal collision
                player.x -= player.xv;
                let horStrike = !player.isColliding();
                player.y -= player.yv;

                let stepX = player.xv * (PHYSICS_ACCURACY / pvel);
                let stepY = player.yv * (PHYSICS_ACCURACY / pvel);
                while (!player.isColliding()) {
                    player.x += stepX;
                    player.y += stepY;
                }
                
                player.x -= stepX;
                player.y -= stepY;

                if (horStrike) {
                    player.xv *= BOUNCE_FACTOR;
                    player.yv *= FRICTION_FACTOR;
                } else {
                    player.xv *= FRICTION_FACTOR;
                    player.yv *= BOUNCE_FACTOR;
                }
            } else {
                // horizontal collision
                player.x += player.xv;
                let xStep = PHYSICS_ACCURACY * (player.xv / Math.abs(player.xv));
                while (player.isColliding()) {
                    player.x -= xStep;
                }
                player.xv *= BOUNCE_FACTOR;
                player.yv *= FRICTION_FACTOR;
            }
        } else {
            // vertical collision
            player.y += player.yv;
            let yStep = PHYSICS_ACCURACY * (player.yv / Math.abs(player.yv));
            while (player.isColliding()) {
                player.y -= yStep;
            }
            player.yv *= BOUNCE_FACTOR;
            player.xv *= FRICTION_FACTOR;
        }
        
    }

    player.cx = player.x + (player.w / 2); // update the player's center
    player.cy = player.y + (player.h / 2);

    // update the camera position
    cam.x = (cam.moveRatio * cam.x) + ((1 - cam.moveRatio) * (player.cx - (cam.w / 2)));
    cam.y = (cam.moveRatio * cam.y) + ((1 - cam.moveRatio) * (player.cy - (cam.h / 2)));


    // update the bullets
    for (let i = 0; i < bullets.length; i++) {
        bullets[i].update();
        if (bullets[i].life <= 0) {
            bullets.splice(i, 1);
            i--;
        }
    }

    //draw the bullets
    for (let i = 0; i < bullets.length; i++){
        let b = bullets[i];
        if ((b.x + b.rad > cam.x) && (b.x - b.rad < cam.x + cam.w) && (b.y + b.rad > cam.y) && (b.y - b.rad < cam.y + cam.h)) {
            fill(0);
            noStroke();
            circle(b.x - cam.x, b.y - cam.y, b.rad * 2);
        }
    }

    // update the targets
    for (let i = 0; i < targets.length; i++) {
        targets[i].update();
        if (targets[i].hit) targets.splice(i, 1);
    }

    // draw the targets
    for (let i = 0; i < targets.length; i++) {
        let t = targets[i];
        if (rectsCollide(t.x, t.y, t.w, t.h, cam.x, cam.y, cam.w, cam.h)) {
            image(textures.enemies.target, t.x - cam.x, t.y - cam.y);
        }
    }

    // draw the player
    fill(255, 0, 0);
    noStroke();
    rect(player.x - cam.x, player.y - cam.y, player.w, player.h, 8);
    let gunDir = [mouseX - player.cx + cam.x, mouseY - player.cy + cam.y];
    let gunLF = GUNSIZE / dist(0, 0, gunDir[0], gunDir[1]);
    gunDir[0] *= gunLF;
    gunDir[1] *= gunLF;
    stroke(100);
    strokeWeight(8);
    line(player.cx - cam.x - (player.gun.recoil * gunDir[0]), player.cy - cam.y - (player.gun.recoil * gunDir[1]), player.cx - cam.x + ((1 - player.gun.recoil) * gunDir[0]), player.cy - cam.y + ((1 - player.gun.recoil) * gunDir[1]));
    noStroke();

    // draw the obstacles
    for (let i = 0; i < obstacles.length; i++) {
        let o = obstacles[i];
        if ((o.x < cam.x + cam.w) && (o.x + o.w > cam.x) && (o.y < cam.y + cam.h) && (o.y + o.h > cam.y)) {
            
            let rx = Math.max(o.x - cam.x, 0);
            let ry = Math.max(o.y - cam.y, 0);
            let rw = Math.min(o.x - cam.x + o.w - rx, cam.w - rx);
            let rh = Math.min(o.y - cam.y + o.h - ry, cam.h - ry);

            if (!((rh < 1) || (rw < 1))) {
                if (obstacles[i].texture && (!obstacles[i].isColored)) {

                    let leftStart = Math.abs(rx - (o.x - cam.x));
                    let topStart = Math.abs(ry - (o.y - cam.y));

                    let xOff = -(leftStart % obstacles[i].texture.width);
                    let yOff = -(topStart % obstacles[i].texture.height);
                    textureRect(rx, ry, rw + 1, rh + 1, obstacles[i].texture, xOff, yOff);
                } else {
                    fill(50);
                    if (obstacles[i].isColored) {
                        fill(obstacles[i].texture);
                    }
                    rect(rx, ry, rw, rh);
                }
            }

        }
    }

    // draw the score
    fill(255);
    stroke(0);
    textAlign(LEFT);
    textStyle(BOLD);
    textSize(25);
    text("Score: " + score, 5, 25);
}



function mousePressed() {
    if (player.gun.curCharge == 0) {
        player.gun.curCharge = player.gun.reload;
        let px = player.cx - cam.x;
        let py = player.cy - cam.y;

        let dx = px - mouseX;
        let dy = py - mouseY;

        let dmag = dist(0, 0, dx, dy);
        
        player.xv += dx * (player.gun.power / dmag);
        player.yv += dy * (player.gun.power / dmag);

        // shoot a bullet
        let bx = player.cx - dx * (((1 - player.gun.maxRecoil) * GUNSIZE) / dmag);
        let by = player.cy - dy * (((1 - player.gun.maxRecoil) * GUNSIZE) / dmag);
        new bullet(bx, by, -dx * (player.gun.speed / dmag), -dy * (player.gun.speed / dmag), player.gun.power / 2, player.gun.power, 500);
        sounds.gunshots[Math.floor(random(0, sounds.gunshots.length))].play();
    }

    return false;
}