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

function find_min_index(array){
  let min = Infinity;
  let min_index;
  for(let i = 0; i < array.length; i += 1){
    if(array[i] < min){
      min = array[i];
      min_index = i;
    }
  }
  return min_index
}

function calculate_distance_between_points(point_1, point_2){
  let distance_to_point = Math.sqrt((Math.pow((point_1.x - point_2.x), 2) + Math.pow((point_1.y - point_2.y), 2)));
  return distance_to_point;
}

//gives random integer between min(inclusive) and max(inclusive)
function get_random_int(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
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


class Asteroid{
  
  constructor(ctx, center_x, center_y){
    this.min_radius = 20;
    
    this.max_radius = 30;
    this.center_x = center_x;
    this.center_y = center_y;
    this.ctx = ctx;
    this.fill_color = "hsl(0, 2%, 28%)";
    this.points = [];
    this.generate_points();
    
  }
  generate_points = () => {
    let point = {
     x: this.center_x,
     y: get_random_int(this.center_y - this.min_radius, this.center_y - this.max_radius)
    }
    this.points.push(point);
    point = {
      x: get_random_int(this.center_x + this.min_radius, this.center_x + this.max_radius),
      y: this.center_y
    }
    this.points.push(point);
    point = {
      x: this.center_x,
      y: get_random_int(this.center_y + this.min_radius, this.center_y + this.max_radius)
    }
    this.points.push(point);
    point = {
      x: get_random_int(this.center_x - this.min_radius, this.center_x - this.max_radius),
      y: this.center_y
    }
    this.points.push(point);

  }

  /*
  generate_points = () => {
    for(let i = 0; i < this.number_on_left; i += 1){
      let proper_point = false;
      while(proper_point === false){
        console.log("generate_points_while_loop");
        let point_x = get_random_int(this.center_x - this.max_radius, this.center_x - this.min_radius);
        let point_y = get_random_int(this.center_y - this.max_radius, this.center_y + this.max_radius);
        while(Math.abs(this.center_y - point_y) < this.min_radius){
          point_y = get_random_int(this.center_y - this.max_radius, this.center_y + this.max_radius);
        }
        let cont_loop = false;
        let point = {
          x: point_x,
          y: point_y
        }
        for(let j = 0; j < this.points.length; j += 1){
          let scoped_point = this.points[j];
          let distance_to_point = calculate_distance_between_points(scoped_point, point );
          if(distance_to_point < this.radius_between_points){
            cont_loop = true;
            break;
          }
        }
        if(cont_loop === true){
          continue;
        }
        
        this.points.push(point);
        
        proper_point = true;
      }
      
      
    }
    for(let i = 0; i < this.number_on_right; i += 1){
      let proper_point = false;
      while(proper_point === false){
        let point_x = get_random_int(this.center_x + this.min_radius, this.center_x + this.max_radius);
        let point_y = get_random_int(this.center_y - this.max_radius, this.center_y + this.max_radius);
        console.log("generate_points_while_loop");
        while(Math.abs(this.center_y - point_y) < this.min_radius){
          point_y = get_random_int(this.center_y - this.max_radius, this.center_y + this.max_radius);
        }
        let cont_loop = false;
        for(let j = 0; j < this.points.length; j += 1){
          let scoped_point = this.points[j];
          let distance_to_point = Math.sqrt((Math.pow((point_x - scoped_point.x), 2) + Math.pow((point_y - scoped_point.y), 2)));
          if(distance_to_point < this.radius_between_points){
            cont_loop = true;
            break;
          }
        }
        if(cont_loop === true){
          continue;
        }
        let point = {
          x: point_x,
          y: point_y
        }
        this.points.push(point);
        
        proper_point = true;
      }
      
      
    }
    console.log(this.points);
  }
  generate_draw_order = () => {
    let draw_order = [0];
    
    while(draw_order.length != this.number_of_points){
      let current_point = this.points[draw_order[draw_order.length - 1]];
      let distances = [];
      let points = [];
      for(let i = 0; i < this.points.length; i += 1){
        if(draw_order.includes(i) === false){
          points.push(i);
        }
      }
      for(let i = 0; i < points.length; i += 1){
        let distance_to = calculate_distance_between_points(current_point, this.points[points[i]]);
        distances.push(distance_to);
      }
      let min_distance_index = find_min_index(distances);
      
      draw_order.push(points[min_distance_index]);
    }
    this.draw_order = draw_order;
    console.log(this.draw_order);
  }
  */

  draw = () => {
    let asteroid_path = new Path2D();

    /*
    let starting_point = this.points[this.draw_order[0]];
    asteroid_path.moveTo(starting_point.x, starting_point.y);
    for(let i = 1; i < this.draw_order.length; i += 1){
      let index = this.draw_order[i];
      let point = this.points[index];
      asteroid_path.lineTo(point.x, point.y);
    }
    asteroid_path.closePath();
    */
    asteroid_path.moveTo(this.points[0].x, this.points[0].y);
    for(let i = 0; i < this.points.length; i += 1){
      let point = this.points[i];
      asteroid_path.lineTo(point.x, point.y);
    }
    asteroid_path.closePath();
    this.ctx.save();
    this.ctx.fillStyle = this.fill_color;
    this.ctx.fill(asteroid_path);
    this.ctx.restore();
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
    this.asteroid = new Asteroid(this.ctx, 100, 100);
    // in order: up, right, down, left, shoot
    this.input_array = [0, 0, 0, 0, 0]
    //this.bind_mouse_move_on_canvas();
    this.bind_keys();
    this.start_frame_interval();
  }
  on_frame = () => {
    this.ctx.clearRect(0, 0, this.canvas_width, this.canvas_height);
    this.player_object.on_frame(this.input_array);
    this.asteroid.draw();
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
