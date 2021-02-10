let root = document.querySelector("#root");
let ship_height = 45;
let frame_rate = 60;
//TODO remake into keyboard control
function round_to(n, digits) {
  if (digits === undefined) {
    digits = 0;
  }

  var multiplicator = Math.pow(10, digits);
  n = parseFloat((n * multiplicator).toFixed(11));
  return Math.round(n) / multiplicator;
}

function init_canvas() {
  //let height_to_width_ratio = 1.618;
  let canv_width, canv_height;
  let wind_width = window.innerWidth;
  let wind_height = window.innerHeight;
  canv_width = Math.min(550, wind_width * 0.95);
  canv_height = Math.min(650, wind_height * 0.95);
  let canv_html = `
    <canvas id="canvas" width="${canv_width}" height="${canv_height}">
    </canvas>
    `;
  root.innerHTML = canv_html;
}

function getMousePos(evt, canv) {
  var rect = canv.getBoundingClientRect();
  return {
    x: ((evt.clientX - rect.left) / (rect.right - rect.left)) * canv.width,
    y: ((evt.clientY - rect.top) / (rect.bottom - rect.top)) * canv.height,
  };
}

class Ship {
  constructor(ctx, canvas_width, canvas_height, fill_color, facing_top) {
    this.ctx = ctx;
    this.center_x = 0;
    this.center_y = 0;
    this.canvas_width = canvas_width;
    this.canvas_height = canvas_height;
    this.ship_height = ship_height;
    this.ship_width = 55;
    this.facing_top = facing_top;
    this.speed = 6.5;
    this.max_speed = 10;
    this.acceleration = 0.1;
    this.fill_color = fill_color;
  }

  touches_boundary = (x, y) => {
    let left = x - this.ship_width / 2;
    let right = x + this.ship_width / 2;
    let top = y - this.ship_height / 2;
    let bottom = y + this.ship_height / 2;
    if(left < 0 || right > this.canvas_width || top < 0 || bottom > this.canvas_height){
      return true;
    }
    else{
      return false;
    }
  }
  /*
  set_target = (x, y) => {
    //this.speed = 5;
    this.target_x = x;
    this.target_y = y;
  }
  
  move_to_target = () => {
    
    if(this.center_x < this.target_x - this.speed){
      this.center_x += this.speed;
    }
    else if(this.center_x > this.target_x + this.speed){
      this.center_x -= this.speed;
    }
    if(this.center_y < this.target_y - this.speed){
      this.center_y += this.speed;
    }
    else if(this.center_y > this.target_y + this.speed){
      this.center_y -= this.speed;
    }
    
  }
  */
  draw() {
    this.ctx.save();
    this.ctx.fillStyle = this.fill_color;
    let top_part_width_percentage = 0.3;
    let wing_height_percentage = 0.65;
    let left_wing_percentage = 0.2;
    let top_part = new Path2D();
    let points;
    if(this.facing_top === true){
      points = [
        {
          x: this.center_x - this.ship_width * 0.5 * top_part_width_percentage,
          y: this.center_y,
        },
        {
          x: this.center_x,
          y: this.center_y - this.ship_height / 2,
        },
        {
          x: this.center_x + this.ship_width * 0.5 * top_part_width_percentage,
          y: this.center_y,
        },
        {
            x: this.center_x - this.ship_width * 0.5,
            y: this.center_y + this.ship_height * 0.5 * wing_height_percentage
        },
        {
            x: this.center_x - this.ship_width * 0.5 * left_wing_percentage,
            y: this.center_y + this.ship_height * 0.5 * wing_height_percentage
        },
        {
          x: this.center_x,
          y: this.center_y + this.ship_height * 0.5 * wing_height_percentage
        },
        {
          x: this.center_x + this.ship_width * 0.5,
          y: this.center_y + this.ship_height * 0.5 * wing_height_percentage
        }
      ];
    }
    else{
      points =  [
        {
          x: this.center_x - this.ship_width * 0.5 * top_part_width_percentage,
          y: this.center_y,
        },
        {
          x: this.center_x,
          y: this.center_y + this.ship_height / 2,
        },
        {
          x: this.center_x + this.ship_width * 0.5 * top_part_width_percentage,
          y: this.center_y,
        },
        {
            x: this.center_x - this.ship_width * 0.5,
            y: this.center_y - this.ship_height * 0.5 * wing_height_percentage
        },
        {
            x: this.center_x - this.ship_width * 0.5 * left_wing_percentage,
            y: this.center_y - this.ship_height * 0.5 * wing_height_percentage
        },
        {
          x: this.center_x,
          y: this.center_y - this.ship_height * 0.5 * wing_height_percentage
        },
        {
          x: this.center_x + this.ship_width * 0.5,
          y: this.center_y - this.ship_height * 0.5 * wing_height_percentage
        }
      ];
    }
    top_part.moveTo(points[0].x, points[0].y);
    top_part.lineTo(points[1].x, points[1].y);
    top_part.lineTo(points[2].x, points[2].y);
    top_part.closePath();
    this.ctx.fill(top_part);
    let rest_of_ship = new Path2D();
    rest_of_ship.moveTo(
      points[0].x,
      points[0].y
    );
    rest_of_ship.lineTo(
      points[3].x,
      points[3].y
    );
    rest_of_ship.lineTo(
      points[4].x,
      points[4].y
    );
    //rest_of_ship.moveTo(points[5].x, points[5].y);
    if(this.facing_top === true){
      rest_of_ship.arc(points[5].x, points[5].y, this.ship_height * 0.5 * (1 - wing_height_percentage),0, Math.PI);
    }
    else{
      rest_of_ship.arc(points[5].x, points[5].y, this.ship_height * 0.5 * (1 - wing_height_percentage),Math.PI, 2 * Math.PI);
    }
    
    rest_of_ship.lineTo(points[6].x, points[6].y);
    rest_of_ship.lineTo(points[2].x, points[2].y);
    this.ctx.fill(rest_of_ship);
    this.ctx.restore();
  }
  on_frame = (input_array) => {
    
    this.draw();
  }
}

class Player_ship extends Ship{
  constructor(ctx, canvas_width, canvas_height, fill_color, facing_top){
    super(ctx, canvas_width, canvas_height, fill_color, facing_top);
    this.center_x = this.canvas_width / 2;
    this.center_y = this.canvas_height - this.ship_height - 10;
  }
  process_inputs = (input_array) => {
    
    if(input_array[0] === 1){
      let touches_boundary = this.touches_boundary(this.center_x, this.center_y - this.speed);
      
      if(touches_boundary === false){
        this.center_y -= this.speed;
      }
      
    }
    if(input_array[1] === 1){
      let touches_boundary = this.touches_boundary(this.center_x + this.speed, this.center_y);
      if(touches_boundary === false){
        this.center_x += this.speed;
      }
    }
    if(input_array[2] === 1){
      let touches_boundary = this.touches_boundary(this.center_x, this.center_y + this.speed);
      if(touches_boundary === false){
        this.center_y += this.speed;
      }
    }
    if(input_array[3] === 1){
      let touches_boundary = this.touches_boundary(this.center_x - this.speed, this.center_y);
      if(touches_boundary === false){
        this.center_x -= this.speed;
      }
    }
  }
  on_frame = (input_array) => {
    this.process_inputs(input_array);
    this.draw();
  }
}

class Game_field {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.frame_interval;
    let player_ship_color = "hsl(184, 100%, 50%)";
    this.canvas_width = this.canvas.width;
    this.canvas_height = this.canvas.height;
    this.player_object = new Player_ship(
      this.ctx,
      this.canvas_width,
      this.canvas_height,
      player_ship_color,
      true
    );
    // in order: up, right, down, left, shoot
    this.input_array = [0, 0, 0, 0, 0]
    //this.bind_mouse_move_on_canvas();
    this.bind_keys();
    this.start_frame_interval();
  }
  on_frame = () => {
    this.ctx.clearRect(0, 0, this.canvas_width, this.canvas_height);
    this.player_object.on_frame(this.input_array);
    
  }
  start_frame_interval = () => {
    let ms = round_to(1000 / frame_rate, 1);
    this.frame_interval = setInterval(this.on_frame, ms);
  };
  bind_keys = () => {
    window.onkeydown = (ev) => {
      let key = ev.key;
      
      if(key === "w"){
        this.input_array[0] = 1;
      }
      if(key === "d"){
        this.input_array[1] = 1;
      }
      if(key === "s"){
        this.input_array[2] = 1;
      }
      if(key === "a"){
        this.input_array[3] = 1;
      }
      if(key === "space"){
        this.input_array[4] = 1;
      }
    }
    window.onkeyup = (ev) => {
      let key = ev.key;
      
      if(key === "w"){
        this.input_array[0] = 0;
      }
      if(key === "d"){
        this.input_array[1] = 0;
      }
      if(key === "s"){
        this.input_array[2] = 0;
      }
      if(key === "a"){
        this.input_array[3] = 0;
      }
      if(key === "space"){
        this.input_array[4] = 0;
      }
    }
  }
  /*
  bind_mouse_move_on_canvas = () => {
    this.canvas.onmousemove = (ev) => {
      let position = getMousePos(ev, this.canvas);
      this.player_object.set_target(position.x, position.y);
    };
  };
  */
}

function main() {
  init_canvas();
  let canvas = document.querySelector("#canvas");
  let game_field = new Game_field(canvas);
}
main();
