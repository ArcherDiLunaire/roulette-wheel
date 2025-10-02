import { Slots } from "./slots";

export class Wheel {
  constructor(el) {
    this.wheelElm = el;
    this.wheelElm.addEventListener('mousedown', e => {
      this.onGrab(e.clientX, e.clientY);
    });
    window.addEventListener('mousemove', e => {
      if (e.which == 1)
        this.onMove(e.clientX, e.clientY);
      else if (!this.isDragging)
        this.onRelease()

    });
    window.addEventListener('mouseup', this.onRelease.bind(this));

    this.wheelElm.addEventListener('touchstart', e => {
      this.onGrab(e.touches[0].clientX, e.touches[0].clientY);
    });
    window.addEventListener('touchmove', e => {
      this.onMove(e.touches[0].clientX, e.touches[0].clientY);
    });
    window.addEventListener('touchend', this.onRelease.bind(this));

    this.calculatePositions();
    window.addEventListener('resize', this.calculatePositions.bind(this));

    this.currentAngle = 0;
    this.oldAngle = 0;
    this.lastAngles = [0, 0, 0];
    this.isDragging = false;
    this.startX = null;
    this.startY = null;
    this.targetAngle = null;
    this.positionCallbacks = [];

    this.slots = new Slots();
    this.slots.setCount(12); // number of slots on your wheel
    this.slots.setWeights([5, 5, 3, 2, 2, 2, 2, 2, 2, 1, 2, 2]);
    this.slots.setSlotCap(9, 15); // slot index 9 (slot 10) max 15 selections per 24h
  }

  // setTargetAngle(slot) {
  //   // Call this before a spin to define the final stopping angle
  //   this.targetAngle = slot * (360 / this.slotAmount) - (360 / this.slotAmount);
  // }

  calculatePositions() {
    this.wheelWidth = this.wheelElm.getBoundingClientRect()['width'];
    this.wheelHeight = this.wheelElm.getBoundingClientRect()['height']
    this.wheelX = this.wheelElm.getBoundingClientRect()['x'] + this.wheelWidth / 2;
    this.wheelY = this.wheelElm.getBoundingClientRect()['y'] + this.wheelHeight / 2;
  }

  onPositionChange(callback) {
    this.positionCallbacks.push(callback);
  }

  onGrab(x, y) {
    if (!this.isSpinning) {
      this.isDragging = true;
      this.startAngle = this.calculateAngle(x, y);
    }
  }

  onMove(x, y) {
    if (!this.isDragging)
      return

    this.lastAngles.shift();
    this.lastAngles.push(this.currentAngle);

    let deltaAngle = this.calculateAngle(x, y) - this.startAngle;
    this.currentAngle = deltaAngle + this.oldAngle;

    this.render(this.currentAngle);
  }

  calculateAngle(currentX, currentY) {
    let xLength = currentX - this.wheelX;
    let yLength = currentY - this.wheelY;
    let angle = Math.atan2(xLength, yLength) * (180 / Math.PI);
    return 365 - angle;
  }

  onRelease() {
    if (this.isDragging) {
      this.isDragging = false;
      let speed = this.lastAngles[0] - this.lastAngles[2];
      if (Math.abs(speed) < 7) {
        this.animateToTarget(this.currentAngle, this.oldAngle, -Math.sign(speed), 500, true);
        return; // Minimum speed to trigger a spin
      }
      this.oldAngle = this.currentAngle;
      const u = this.slots.chooseSlotAndSetTarget();
      this.slot = u.slot; // +1 to make it 1-based
      this.targetAngle = u.angle;
      document.querySelector('#debug').innerHTML = `${this.slot} <br /> ${JSON.stringify(this.slots._getAllCounts())}`;
      this.momentum(speed);
    }
  }

  momentum(speed) {
    let maxSpeed = 30;
    if (speed >= maxSpeed) speed = maxSpeed;
    else if (speed <= -maxSpeed) speed = -maxSpeed;

    if (speed >= 7) {
      speed -= 0.1;
      window.requestAnimationFrame(this.momentum.bind(this, speed));
      this.isSpinning = true;
    } else if (speed <= -7) {
      speed += 0.1;
      window.requestAnimationFrame(this.momentum.bind(this, speed));
      this.isSpinning = true;
    } else {
      // Momentum finished → snap to target if set
      if (this.targetAngle !== null) {
        this.isSpinning = true;
        const finalAngle = Math.floor(this.oldAngle / 360) * 360 + (360 * -Math.sign(speed) + (((360 + (this.targetAngle * Math.sign(speed))) % 360)) * - Math.sign(speed));
        const t = Math.abs((this.oldAngle - finalAngle) / (speed * 0.02)); // Duration based on speed
        this.animateToTarget(this.oldAngle, finalAngle, Math.sign(speed), t);
      }
    }

    this.oldAngle -= speed;
    this.render(this.oldAngle);
  }

  animateToTarget(oldAngle, newAngle, direction, duration, bounce = false) {
    const startAngle = oldAngle;
    console.log("SNAP", newAngle, direction, duration);


    const startTime = performance.now();
    const animate = (time) => {
      const elapsed = time - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // easeOut
      const easing = bounce ? this.easeOutBack(progress) : this.easingOutCubic(progress);

      this.currentAngle = startAngle + (newAngle - startAngle) * easing;
      this.render(this.currentAngle);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else if(this.isSpinning === true) {
        this.isSpinning = false;
        this.oldAngle = this.currentAngle;
        console.log("STOP", this.slot);
        const event = new CustomEvent('wheelStop', { detail: { slot: this.slot } });
        this.wheelElm.dispatchEvent(event);
      }
    };

    requestAnimationFrame(animate);
  }

  render(deg) {
    this.wheelElm.style.transform = `rotate(${deg}deg)`;
    for (let callback of this.positionCallbacks) {
      callback(deg);
    }
  }

  easingOutCubic(progress) {
    return 1 - Math.pow(1 - progress, 3);
  }

  easeOutBack(progress) {
    // Smooth damped wobble with 2 overshoots
    const damping = Math.pow(1 - progress, 2.5);      // exponential decay (smooth)
    return 1 - damping * Math.cos(progress * 3 * Math.PI);
  }
}
