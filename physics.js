// handle collisions
if (player.isColliding()) {
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
}