let drawTable;

function createTable() {
  const margin = room.width * 0.05;
  const radius = room.width * 0.1;
  const goalLen = room.width * 0.4;
  const segments = 5;
  const lineWidth = Math.floor(room.width * 0.03);
  objects.push(
    // bottom left
    new LinearWall(
      margin,
      room.height / 2,
      margin,
      room.height - margin - radius,
      '#ff9f43', lineWidth
    ),
    new CircleWall(
      margin + radius,
      room.height - margin - radius,
      radius, 180, 90,
      segments, '#ff9f43', lineWidth
    ),
    new LinearWall(
      margin + radius,
      room.height - margin,
      room.width / 2 - goalLen / 2,
      room.height - margin,
      '#ff9f43', lineWidth
    ),
    // bottom right
    new LinearWall(
      room.width / 2 + goalLen / 2,
      room.height - margin,
      room.width - margin - radius,
      room.height - margin,
      '#f368e0', lineWidth
    ),
    new CircleWall(
      room.width - margin - radius,
      room.height - margin - radius,
      radius, 90, 0,
      segments, '#f368e0', lineWidth
    ),
    new LinearWall(
      room.width - margin,
      room.height - margin - radius,
      room.width - margin,
      room.height / 2,
      '#f368e0', lineWidth
    ),
    // top right
    new LinearWall(
      room.width - margin,
      room.height / 2,
      room.width - margin,
      margin + radius,
      '#54a0ff', lineWidth
    ),
    new CircleWall(
      room.width - margin - radius,
      margin + radius,
      radius, 360, 270,
      segments, '#54a0ff', lineWidth
    ),
    new LinearWall(
      room.width - margin - radius,
      margin,
      room.width / 2 + goalLen / 2,
      margin,
      '#54a0ff', lineWidth
    ),
    // top left
    new LinearWall(
      room.width / 2 - goalLen / 2,
      margin,
      margin + radius,
      margin,
      '#00d2d3', lineWidth
    ),
    new CircleWall(
      margin + radius,
      margin + radius,
      radius, 270, 180,
      segments, '#00d2d3', lineWidth
    ),
    new LinearWall(
      margin,
      margin + radius,
      margin,
      room.height / 2,
      '#00d2d3', lineWidth
    )
  );
  
  let middleLine = world.createBody(Pixie.vec(room.width / 2, room.height / 2));
  Pixie.addEdge(
    middleLine,
    margin - room.width / 2, 0,
    room.width / 2 - margin, 0,
    { filterGroupIndex: -1 }
  );
  middleLine.draw = () => {};
  objects.push(middleLine);
  
  drawTable = () => {
    room.strokeStyle = '#c8d6e5';
    room.lineWidth = 2;
    room.beginPath();
    room.moveTo(margin, room.height / 2);
    room.lineTo(room.width - margin, room.height / 2);
    room.stroke();
    room.beginPath();
    room.arc(room.width / 2, room.height / 2, goalLen / 2, 0, Math.PI * 2);
    room.stroke();
    room.beginPath();
    room.arc(room.width / 2, margin, goalLen / 1.5, 0, Math.PI);
    room.stroke();
    room.beginPath();
    room.arc(room.width / 2, room.height - margin, goalLen / 1.5, Math.PI, Math.PI * 2);
    room.stroke();
    room.fillStyle = '#c8d6e5';
    room.save();
    room.translate(room.width / 2, room.height / 2);
    room.fillText(world.score[1], 0, goalLen / 2 - margin);
    room.rotate(Math.PI);
    room.fillText(world.score[0], 0, goalLen / 2 - margin);
    room.restore();
  };
}

function createPaddles() {
  const margin = room.width * 0.05;
  const startMargin = room.width * 0.1;
  objects.push(
    new Paddle(
      room.width / 2, margin + startMargin,
      '#5f27cd', [65, 87, 68, 83]
    ),
    new Paddle(
      room.width / 2, room.height - margin - startMargin,
      '#ee5253', [37, 38, 39, 40]
    ),
    new Puck(room.width / 2, room.height / 2, '#f6e58d')
  );
}