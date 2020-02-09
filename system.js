class Pixie {
  constructor(configs) {
    return planck.World(configs);
  }
  static toMeter(pixels) {
    return isNaN(pixels) ? [pixels.x / 100, pixels.y / 100] : pixels / 100;
  }
  static toPixel(pixels) {
    return isNaN(pixels) ? [pixels.x * 100, pixels.y * 100] : pixels * 100;
  }
  static vec(x, y) {
    return planck.Vec2(Pixie.toMeter(x), Pixie.toMeter(y));
  }
  static directionalVec(angle, length) {
    return Pixie.vec(length * Math.cos(angle), length * Math.sin(angle));
  }
  static addEdge(object, x1, y1, x2, y2, options) {
    let edge = planck.Edge(Pixie.vec(x1, y1), Pixie.vec(x2, y2));
    object.createFixture(edge, options);
  }
  static addCircle(object, radius, options) {
    let circle = planck.Circle(Pixie.toMeter(radius));
    object.createFixture(circle, options);
  }
  static addPolygon(object, points, ratio, options) {
    decomp.makeCCW(points);
    decomp.quickDecomp(points).forEach(polygon => {
      let pointsMap = polygon.map(point => planck.Vec2(point[0] * ratio, point[1] * ratio))
      object.createFixture(planck.Polygon(pointsMap), options);
    });
  }
  static add(arr1, arr2) {
    for (let i = 0; i < arr1.length; i++) {
      arr1[i] += arr2[i];
    }
    return arr1;
  }
  static cos(angle) {return Math.cos(angle * Math.PI / 180); }
  static sin(angle) {return Math.sin(angle * Math.PI / 180); }
}

class LinearWall {
  constructor(x1, y1, x2, y2, color = '#fff', lineWidth) {
    this.body = world.createBody(Pixie.vec((x1 + x2) / 2, (y1 + y2) / 2));
    Pixie.addEdge(this.body, (x1 - x2) / 2, (y1 - y2) / 2, (x2 - x1) / 2, (y2 - y1) / 2);
    this.color = color;
    if (lineWidth) {
      let xTang = y1 - y2;
      let yTang = x2 - x1;
      let d = Math.sqrt(xTang ** 2 + yTang ** 2);
      xTang /= d; yTang /= d;
      this.lineWidth = lineWidth;
      this.x1 = (x2 - x1) / 2 + xTang * lineWidth / 2;
      this.y1 = (y2 - y1) / 2 + yTang * lineWidth / 2;
      this.x2 = (x1 - x2) / 2 + xTang * lineWidth / 2;
      this.y2 = (y1 - y2) / 2 + yTang * lineWidth / 2;
    }
  }
  draw() {
    let shape = this.body.getFixtureList().getShape();
    let v1 = Pixie.toPixel(shape.m_vertex1);
    let v2 = Pixie.toPixel(shape.m_vertex2);
    room.save();
    room.translate(...Pixie.toPixel(this.body.getPosition()));
    room.strokeStyle = this.color;
    room.shadowColor = this.color;
    room.beginPath();
    if (this.lineWidth) {
      room.lineWidth = this.lineWidth;
      room.moveTo(this.x1, this.y1);
      room.lineTo(this.x2, this.y2);
    } else {
      room.lineWidth = 1;
      room.moveTo(...v1);
      room.lineTo(...v2);
    }
    room.stroke();
    room.restore();
  }
}

class CircleWall {
  constructor(x, y, r, startAngle, endAngle, segments, color = '#fff', lineWidth) {
    const rad = Math.PI / 180;
    this.body = world.createBody(Pixie.vec(x, y));
    this.fixtures = Array(segments);
    let segAngle = Math.floor((endAngle - startAngle) / segments);
    let curAngle = startAngle;
    for (let i = 0; i < segments; i++) {
      Pixie.addEdge(
        this.body,
        r * Pixie.cos(curAngle),
        r * Pixie.sin(curAngle),
        r * Pixie.cos(curAngle + segAngle),
        r * Pixie.sin(curAngle + segAngle)
      );
      this.fixtures[i] = [
        r * Pixie.cos(curAngle),
        r * Pixie.sin(curAngle),
        r * Pixie.cos(curAngle + segAngle),
        r * Pixie.sin(curAngle + segAngle)
      ];
      if (lineWidth) {
        let p = this.fixtures[i];
        let xTang = p[1] - p[3];
        let yTang = p[2] - p[0];
        let d = Math.sqrt(xTang ** 2 + yTang ** 2);
        xTang /= d; yTang /= d;
        p[2] += xTang * lineWidth / 2;
        p[3] += yTang * lineWidth / 2;
        p[0] += xTang * lineWidth / 2;
        p[1] += yTang * lineWidth / 2;
      }
      curAngle += segAngle;
    }
    if (lineWidth) {this.lineWidth = lineWidth; }
    this.color = color;
  }
  draw() {
    room.save();
    room.translate(...Pixie.toPixel(this.body.getPosition()));
    room.strokeStyle = this.color;
    room.shadowColor = this.color;
    if (this.lineWidth) {room.lineWidth = this.lineWidth; }
    room.beginPath();
    room.moveTo(this.fixtures[0][0], this.fixtures[0][1]);
    for (let fixture of this.fixtures) {
      room.lineTo(fixture[2], fixture[3]);
    }
    room.stroke();
    room.restore();
  }
}

class Paddle {
  constructor(x, y, color, keypads) {
    this.body = world.createDynamicBody({
      position: Pixie.vec(x, y),
      linearDamping: 10
    });
    this.body.setMassData({
      mass: 50,
      center: planck.Vec2(0, 0),
      I: 0
    });
    this.radius = room.width * 0.1;
    Pixie.addCircle(this.body, this.radius);
    this.color = color;
    this.keypads = keypads;
  }
  step() {
    if (keys.get(this.keypads[0])) {
      this.body.applyForceToCenter(Pixie.vec(-5000, 0), true);
    }
    if (keys.get(this.keypads[1])) {
      this.body.applyForceToCenter(Pixie.vec(0, -5000), true);
    }
    if (keys.get(this.keypads[2])) {
      this.body.applyForceToCenter(Pixie.vec(5000, 0), true);
    }
    if (keys.get(this.keypads[3])) {
      this.body.applyForceToCenter(Pixie.vec(0, 5000), true);
    }
  }
  draw() {
    room.strokeStyle = this.color;
    room.shadowColor = this.color;
    room.lineWidth = 5;
    room.beginPath();
    room.arc(...Pixie.toPixel(this.body.getPosition()), this.radius, 0, Math.PI * 2);
    room.stroke();
    room.fillStyle = '#ecf0f1';
    room.beginPath();
    room.arc(...Pixie.toPixel(this.body.getPosition()), this.radius, 0, Math.PI * 2);
    room.fill();
    room.beginPath();
    room.arc(...Pixie.toPixel(this.body.getPosition()), this.radius / 2, 0, Math.PI * 2);
    room.stroke();
  }
}

class Puck {
  constructor(x, y, color) {
    this.body = world.createDynamicBody(Pixie.vec(x, y));
    this.radius = room.width * 0.05;
    Pixie.addCircle(this.body, this.radius, { filterGroupIndex: -1 });
    this.color = color;
  }
  draw() {
    room.strokeStyle = this.color;
    room.shadowColor = this.color;
    room.lineWidth = 5;
    room.beginPath();
    room.arc(...Pixie.toPixel(this.body.getPosition()), this.radius, 0, Math.PI * 2);
    room.stroke();
    room.fillStyle = '#ecf0f1';
    room.beginPath();
    room.arc(...Pixie.toPixel(this.body.getPosition()), this.radius, 0, Math.PI * 2);
    room.fill();
  }
}
