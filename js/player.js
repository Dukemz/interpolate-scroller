"use strict";

class Player extends Sprite {
  constructor(data) {
    super([
      [0, 0], // bottom notch
      [-50, 50], // bottom left
      [0, -70], // top
      [0, 0] // repeat 1st to connect
    ]);

    /*
      [0, 0], // bottom notch
      [50, 50], // bottom right
      [0, -70], // top
      [0, 0] // repeat 1st to connect

      [0, 0], [50, 50], [0, -70], [0, 0]
    */

    Object.assign(this, data);

    // weapons, bullets, etc
    // in future figure out how to make this into classes
    // for easier addition of new weapons, use of extends, etc

    // array of available weapon classes
    // group of all projectiles
    // allow for use with enemies as well?

    // if this.weapons is not already an array, create it
    this.weapons ||= [];
    // this.activeWeapon will be the currently active weapon
    // at the end of update, if pressing down fire key or autofire is on, call the fire function
    // the weapon class should handle everything from there
    this.projectiles ||= new Group();
    this.activeWeapon = 0;
    this.weapons.forEach(weapon => { // initialise all weapons
      weapon.initialise(this);
    });


    // subdetails should already be created in the constructor
    this.subdetails ||= new Group();
    // indicators like health and such - rings around the player
    this.arcindics = new this.subdetails.Group();
    this.arcindics.push(new ArcIndicator(this));

    // offset for first half (this took FOREVER to get right)
    this.offset = {x:-16.666, y:0}
    // second half of the thing
    this.addCollider(-16.666, 0, [[0, 0], [50, 50], [0, -70], [0, 0]]);
    this.resetCenterOfMass();

    // delete any bullets that touch the player
    this.overlaps(this.projectiles, (_p, b) => b.remove());

    // set attributes
    this.rotationLock = true;
    this.strokeWeight = 1;

    this.autoDraw = false;
    this.autoFire = false;
    this.scale = {x: 0.5, y: 0.5};

    this.pos = {x:0, y:0}
    // not sure why this needs to be here???
    this.offset.y = -1.666;
    this.rotation = 90;
  }

  directionalVelocity(angle) { // calculate velocity respective of an angle
    if(typeof angle !== "number") throw new Error("Invalid or missing argument for directionalVelocity() function!");
    
    // convert from degrees to radians
    const angleRad = angle * Math.PI/180;
    const relativeVel = this.vel.x * Math.cos(angleRad) + this.vel.y * Math.sin(angleRad);
    return relativeVel;
  }

  // ~~ UPDATE FUNCTION ~~ //
  update() { // this is called after the sprite's internal draw function
    // difference between camera position and player position
    // const camDevX = camera.x-this.x;
    // const camDevY = camera.y-this.y;

    // counteract gravity if there is any
    if(world.gravity.y) {
      this.bearing = -90;
      this.applyForceScaled(world.gravity.y);
    }
    if(world.gravity.x) {
      this.bearing = 180;
      this.applyForceScaled(world.gravity.x);
    }

    // movement
    if(kb.pressing("up")) {
      this.vel.y = -5;
    } else if(kb.pressing("down")) {
      this.vel.y = 5;
    } else {
      this.vel.y = deltaLerp(this.vel.y, 0, 0.999);
    }
    if(kb.pressing("left")) {
      this.vel.x = -5;
    } else if(kb.pressing("right")) {
      this.vel.x = 5;
    } else {
      this.vel.x = deltaLerp(this.vel.x, 0, 0.999);
    }

    // toggle auto fire
    if(kb.presses("e")) this.autoFire = !this.autoFire;

    // cycle weapon
    if(kb.presses("q")) this.activeWeapon = (this.activeWeapon + 1) % this.weapons.length

    // shoot controls
    if(kb.pressing("space") || this.autoFire) this.weapons[this.activeWeapon].fire();
  }
}