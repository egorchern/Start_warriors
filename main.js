let root = document.querySelector("#root");
let ship_height = 45;
let ship_width = 55;
let max_asteroid_length = 50;
let frame_rate = 60;
let canvas, ctx;
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
  canvas = document.querySelector("#canvas");
  ctx = canvas.getContext("2d");
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
  constructor(canvas_width, canvas_height, fill_color, facing_top) {
    
    this.center_x = 0;
    this.center_y = 0;
    this.canvas_width = canvas_width;
    this.canvas_height = canvas_height;
    this.ship_height = ship_height;
    this.ship_width = ship_width;
    this.facing_top = facing_top;
    this.top_part_width_percentage = 0.3;
    this.wing_height_percentage = 0.65;
    this.left_wing_percentage = 0.2;
    this.radius = this.ship_height * 0.5 * (1 - this.wing_height_percentage);
    this.top_part_hitboxes_number = 3;
    this.hitboxes_number_per_wing = 6;
    this.speed = 6.5;
    this.max_speed = 10;
    this.acceleration = 0.1;
    this.fill_color = fill_color;
    this.hitboxes = [];
    this.points = [];
    
  }

  generate_points () {
    
    if(this.facing_top === true){
      this.points = [
        {
          x: this.center_x - this.ship_width * 0.5 * this.top_part_width_percentage,
          y: this.center_y,
        },
        {
          x: this.center_x,
          y: this.center_y - this.ship_height / 2,
        },
        {
          x: this.center_x + this.ship_width * 0.5 * this.top_part_width_percentage,
          y: this.center_y,
        },
        {
            x: this.center_x - this.ship_width * 0.5,
            y: this.center_y + this.ship_height * 0.5 * this.wing_height_percentage
        },
        {
            x: this.center_x - this.ship_width * 0.5 * this.left_wing_percentage,
            y: this.center_y + this.ship_height * 0.5 * this.wing_height_percentage
        },
        {
          x: this.center_x,
          y: this.center_y + this.ship_height * 0.5 * this.wing_height_percentage
        },
        {
          x: this.center_x + this.ship_width * 0.5,
          y: this.center_y + this.ship_height * 0.5 * this.wing_height_percentage
        }
      ];
    }
    else{
      this.points =  [
        {
          x: this.center_x - this.ship_width * 0.5 * this.top_part_width_percentage,
          y: this.center_y,
        },
        {
          x: this.center_x,
          y: this.center_y + this.ship_height / 2,
        },
        {
          x: this.center_x + this.ship_width * 0.5 * this.top_part_width_percentage,
          y: this.center_y,
        },
        {
            x: this.center_x - this.ship_width * 0.5,
            y: this.center_y - this.ship_height * 0.5 * this.wing_height_percentage
        },
        {
            x: this.center_x - this.ship_width * 0.5 * this.left_wing_percentage,
            y: this.center_y - this.ship_height * 0.5 * this.wing_height_percentage
        },
        {
          x: this.center_x,
          y: this.center_y - this.ship_height * 0.5 * this.wing_height_percentage
        },
        {
          x: this.center_x + this.ship_width * 0.5,
          y: this.center_y - this.ship_height * 0.5 * this.wing_height_percentage
        }
      ];
    }
  }

  generate_hitboxes (){
    let top_part_multiplier_scale = round_to(1 / this.top_part_hitboxes_number, 2);
    let top_part_multiplier = 0;
    let x_dist = Math.abs(this.points[0].x - this.points[1].x);
    let y_dist = Math.abs(this.points[0].y - this.points[1].y);
    let left_reference = this.points[0].x;
    
    let right_reference = this.points[2].x;
    let bottom_reference = this.points[0].y;
    
    for(let i = 0; i < this.top_part_hitboxes_number; i += 1){
      let left = left_reference + x_dist * top_part_multiplier;
      let right = right_reference - x_dist * top_part_multiplier;
      let bottom = bottom_reference - y_dist * top_part_multiplier;
      top_part_multiplier += top_part_multiplier_scale;
      top_part_multiplier = round_to(top_part_multiplier, 2);
      let top = bottom_reference - y_dist * top_part_multiplier
      let hitbox = {
        left: left,
        right: right,
        top: top,
        bottom: bottom
      }
      this.hitboxes.push(hitbox);

    }
    let body_hitbox = {
      left: left_reference,
      right: right_reference,
      top: bottom_reference,
      bottom: this.points[3].y
    }
    this.hitboxes.push(body_hitbox);
    let wing_multiplier_scale = round_to(1 / this.hitboxes_number_per_wing, 2);
    let wing_multiplier = 0;
    x_dist = this.ship_width / 2;
    y_dist = Math.abs(this.points[2].y - this.points[3].y);
    right_reference = left_reference;
    let top_reference = bottom_reference;
    bottom_reference = top_reference + y_dist;
    for(let i = 0; i < this.hitboxes_number_per_wing; i += 1){ 
      let right = right_reference - x_dist * wing_multiplier;
      let bottom = bottom_reference;
      let top = top_reference + y_dist * wing_multiplier;
      wing_multiplier += wing_multiplier_scale;
      wing_multiplier = round_to(wing_multiplier, 2);
      let left = right_reference - x_dist * wing_multiplier;
      let hitbox = {
        left: left,
        right: right,
        top: top,
        bottom: bottom
      }
      this.hitboxes.push(hitbox);
    }
    wing_multiplier = 0;
    left_reference = this.points[2].x;
    right_reference = left_reference;
    for(let i = 0; i < this.hitboxes_number_per_wing; i += 1){ 
      let left = right_reference + x_dist * wing_multiplier;
      let bottom = bottom_reference;
      let top = top_reference + y_dist * wing_multiplier;
      wing_multiplier += wing_multiplier_scale;
      wing_multiplier = round_to(wing_multiplier, 2);
      let right = right_reference + x_dist * wing_multiplier;
      let hitbox = {
        left: left,
        right: right,
        top: top,
        bottom: bottom
      }
      this.hitboxes.push(hitbox);
    }
    let bottom_part_hitbox = {
      left: this.points[5].x - this.radius,
      right: this.points[5].x + this.radius,
      top: this.points[5].y,
      bottom: this.points[5].y + this.radius
    }
    this.hitboxes.push(bottom_part_hitbox);
  }

  move_left () {
    this.center_x -= this.speed;
    this.adjust_points("left");
    this.adjust_hitboxes("left");
  }

  move_up () {
    this.center_y -= this.speed;
    this.adjust_points("up");
    this.adjust_hitboxes("up");
  }

  move_right ()  {
    this.center_x += this.speed;
    this.adjust_points("right");
    this.adjust_hitboxes("right");
  }

  move_down ()  {
    this.center_y += this.speed;
    this.adjust_points("down");
    this.adjust_hitboxes("down");
  }

  adjust_points (direction) {
    let coordinate, amount;
    switch(direction){
      case ("up"):
        coordinate = "y";
        amount = -this.speed;
        break;
      case ("right"):
        coordinate = "x";
        amount = this.speed;
        break;
      case ("down"):
        coordinate = "y";
        amount = this.speed;
        break;
      case ("left"):
        coordinate = "x";
        amount = -this.speed;
        break;
    }

    for(let i = 0; i < this.points.length; i += 1){
      let new_amount = this.points[i][coordinate] + amount;
      this.points[i][coordinate] = new_amount;
    }
  }

  adjust_hitboxes (direction) {
    let coordinate, amount;
    switch(direction){
      case ("up"):
        coordinate = "y";
        amount = -this.speed;
        break;
      case ("right"):
        coordinate = "x";
        amount = this.speed;
        break;
      case ("down"):
        coordinate = "y";
        amount = this.speed;
        break;
      case ("left"):
        coordinate = "x";
        amount = -this.speed;
        break;
    }

    for(let i = 0; i < this.hitboxes.length; i += 1){
      let current_hitbox = this.hitboxes[i];
      if(coordinate === "x"){
        current_hitbox.left += amount;
        current_hitbox.right += amount;

      }
      else{
        current_hitbox.bottom += amount;
        current_hitbox.top += amount;
      }
      this.hitboxes[i] = current_hitbox;
    }
  }

  touches_boundary (x, y) {
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
  
  stroke_hitboxes(){
    ctx.save();
    for(let i = 0; i < this.hitboxes.length; i += 1){
      let current_hitbox = this.hitboxes[i];
      let hitbox_path = new Path2D();
      hitbox_path.moveTo(current_hitbox.left, current_hitbox.bottom);
      hitbox_path.lineTo(current_hitbox.left, current_hitbox.top);
      hitbox_path.lineTo(current_hitbox.right, current_hitbox.top);
      hitbox_path.lineTo(current_hitbox.right, current_hitbox.bottom);
      hitbox_path.closePath();
      ctx.stroke(hitbox_path);
      
    }
    ctx.restore();
  }

  draw() {
    ctx.save();
    ctx.fillStyle = this.fill_color;
    
    let top_part = new Path2D();
    top_part.moveTo(this.points[0].x, this.points[0].y);
    top_part.lineTo(this.points[1].x, this.points[1].y);
    top_part.lineTo(this.points[2].x, this.points[2].y);
    top_part.closePath();
    ctx.fill(top_part);
    let rest_of_ship = new Path2D();
    rest_of_ship.moveTo(
      this.points[0].x,
      this.points[0].y
    );
    rest_of_ship.lineTo(
      this.points[3].x,
      this.points[3].y
    );
    rest_of_ship.lineTo(
      this.points[4].x,
      this.points[4].y
    );
    
    if(this.facing_top === true){
      rest_of_ship.arc(this.points[5].x, this.points[5].y, this.radius, 0, Math.PI);
    }
    else{
      rest_of_ship.arc(this.points[5].x, this.points[5].y, this.radius, Math.PI, 2 * Math.PI);
    }
    
    rest_of_ship.lineTo(this.points[6].x, this.points[6].y);
    rest_of_ship.lineTo(this.points[2].x, this.points[2].y);
    ctx.fill(rest_of_ship);
    //this.stroke_hitboxes();
    ctx.restore();
  }

  on_frame (input_array){
    
    this.draw();
  }
}


class Asteroid{
  
  constructor(center_x, center_y, canvas_width, canvas_height){
    
    this.canvas_width = canvas_width;
    this.canvas_height = canvas_height;
    this.speed = 3;
    this.max_radius = max_asteroid_length / 2;
    this.min_radius = this.max_radius - 8;
    this.center_x = center_x;
    this.center_y = center_y;
    
    this.fill_color = "hsl(0, 2%, 28%)";
    this.points = [];
    this.hitboxes = [];
    this.number_of_hitboxes_per_half = 7;
    this.generate_points();
    this.generate_hitboxes();
  }

  is_out_of_bounds () {
    if(this.points[0].y > this.canvas_height){
      return true;
    }
    else{
      return false;
    }
  }

  move_down(){
    this.center_y += this.speed;
    this.adjust_points("down");
    this.adjust_hitboxes("down");
  }

  generate_points (){
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

  generate_hitboxes(){
    let half_multiplier_scale = round_to(1 / this.number_of_hitboxes_per_half, 2);
    let half_multiplier = 0;
    let x_dist_left = Math.abs(this.center_x - this.points[3].x);
    let x_dist_right = Math.abs(this.center_x - this.points[1].x);
    let y_dist = Math.abs(this.center_y - this.points[2].y);
    let x_reference = this.points[2].x;
    let y_reference = this.points[2].y;
    for(let i = 0; i < this.number_of_hitboxes_per_half; i += 1){
      let bottom = y_reference - y_dist * half_multiplier;
      half_multiplier += half_multiplier_scale;
      half_multiplier = round_to(half_multiplier, 2);
      let top = y_reference - y_dist * half_multiplier;
      let left = x_reference - x_dist_left * half_multiplier;
      let right = x_reference + x_dist_right * half_multiplier;
      let hitbox = {
        left: left,
        right: right,
        top: top,
        bottom: bottom
      }
      this.hitboxes.push(hitbox);
    }
    half_multiplier = 0;
    y_dist = Math.abs(this.center_y - this.points[0].y);
    x_reference = this.points[0].x;
    y_reference = this.points[0].y;
    for(let i = 0; i < this.number_of_hitboxes_per_half; i += 1){
      let top = y_reference + y_dist * half_multiplier;
      half_multiplier += half_multiplier_scale;
      half_multiplier = round_to(half_multiplier, 2);
      let bottom = y_reference + y_dist * half_multiplier;
      let left = x_reference - x_dist_left * half_multiplier;
      let right = x_reference + x_dist_right * half_multiplier;
      let hitbox = {
        left: left,
        right: right,
        top: top,
        bottom: bottom
      }
      this.hitboxes.push(hitbox);
    }
  }
  
  

  adjust_hitboxes (direction) {
    let coordinate, amount;
    switch(direction){
      case ("up"):
        coordinate = "y";
        amount = -this.speed;
        break;
      case ("right"):
        coordinate = "x";
        amount = this.speed;
        break;
      case ("down"):
        coordinate = "y";
        amount = this.speed;
        break;
      case ("left"):
        coordinate = "x";
        amount = -this.speed;
        break;
    }

    for(let i = 0; i < this.hitboxes.length; i += 1){
      let current_hitbox = this.hitboxes[i];
      if(coordinate === "x"){
        current_hitbox.left += amount;
        current_hitbox.right += amount;

      }
      else{
        current_hitbox.bottom += amount;
        current_hitbox.top += amount;
      }
      this.hitboxes[i] = current_hitbox;
    }
  }

  adjust_points (direction) {
    let coordinate, amount;
    switch(direction){
      case ("up"):
        coordinate = "y";
        amount = -this.speed;
        break;
      case ("right"):
        coordinate = "x";
        amount = this.speed;
        break;
      case ("down"):
        coordinate = "y";
        amount = this.speed;
        break;
      case ("left"):
        coordinate = "x";
        amount = -this.speed;
        break;
    }

    for(let i = 0; i < this.points.length; i += 1){
      let new_amount = this.points[i][coordinate] + amount;
      this.points[i][coordinate] = new_amount;
    }
  }
  


  stroke_hitboxes(){
    ctx.save();
    for(let i = 0; i < this.hitboxes.length; i += 1){
      let current_hitbox = this.hitboxes[i];
      let hitbox_path = new Path2D();
      hitbox_path.moveTo(current_hitbox.left, current_hitbox.bottom);
      hitbox_path.lineTo(current_hitbox.left, current_hitbox.top);
      hitbox_path.lineTo(current_hitbox.right, current_hitbox.top);
      hitbox_path.lineTo(current_hitbox.right, current_hitbox.bottom);
      hitbox_path.closePath();
      ctx.stroke(hitbox_path);
      
    }
    ctx.restore();
  }

  on_frame(){ 
    this.move_down();
    this.draw();

  }

  draw () {
    
    let asteroid_path = new Path2D();
    asteroid_path.moveTo(this.points[0].x, this.points[0].y);
    for(let i = 0; i < this.points.length; i += 1){
      let point = this.points[i];
      asteroid_path.lineTo(point.x, point.y);
    }
    asteroid_path.closePath();
    ctx.save();
    ctx.fillStyle = this.fill_color;
    ctx.fill(asteroid_path);
    //this.stroke_hitboxes();
    ctx.restore();
  }

}


class Player_ship extends Ship{
  constructor(canvas_width, canvas_height, fill_color, facing_top){
    super(canvas_width, canvas_height, fill_color, facing_top);
    this.center_x = this.canvas_width / 2;
    this.center_y = this.canvas_height - this.ship_height - 10;
    this.generate_points();
    this.generate_hitboxes();
  }
  process_inputs (input_array) {
    
    if(input_array[0] === 1){
      let touches_boundary = this.touches_boundary(this.center_x, this.center_y - this.speed);
      
      if(touches_boundary === false){
        this.move_up();
      }
      
    }
    if(input_array[1] === 1){
      let touches_boundary = this.touches_boundary(this.center_x + this.speed, this.center_y);
      if(touches_boundary === false){
        this.move_right();
      }
    }
    if(input_array[2] === 1){
      let touches_boundary = this.touches_boundary(this.center_x, this.center_y + this.speed);
      
      if(touches_boundary === false){
        this.move_down();
      }
    }
    if(input_array[3] === 1){
      let touches_boundary = this.touches_boundary(this.center_x - this.speed, this.center_y);
      if(touches_boundary === false){
        this.move_left();
      }
    }
  }
  on_frame (input_array) {
    this.process_inputs(input_array);
    
    this.draw();
  }
}

class Game_field {
  constructor() {
    this.frame_interval;
    let player_ship_color = "hsl(184, 100%, 50%)";
    this.canvas_width = canvas.width;
    this.canvas_height = canvas.height;
    this.max_asteroids_on_field = 1;
    this.min_x_distance_between_asteroids = ship_width + 25;
    this.asteroid_list = [];
    this.player_object = new Player_ship(
      
      this.canvas_width,
      this.canvas_height,
      player_ship_color,
      true
    );
    this.generate_asteroids();
    // in order: up, right, down, left, shoot
    this.input_array = [0, 0, 0, 0, 0];
    //this.bind_mouse_move_on_canvas();
    this.bind_keys();
    this.on_frame = this.on_frame.bind(this);
    this.start_frame_interval();
  }

  dispose_asteroids (){
    
    
    while(true){
      let found = false;
      for(let i = 0; i < this.asteroid_list.length; i += 1){
        let asteroid_object = this.asteroid_list[i];
        let is_out_of_bounds = asteroid_object.is_out_of_bounds();
        if(is_out_of_bounds === true){
          this.asteroid_list.splice(i, 1);
          found = true;
          break;
        }
      }
      if(found === false){
        break;
      }
    }
    this.generate_asteroids();
    
  }

  player_ship_collides_with_asteroids(){
    for(let i = 0; i < this.asteroid_list.length; i += 1){
      let collide_bool = this.hitboxes_collide(this.player_object.hitboxes, this.asteroid_list[i].hitboxes);
      if(collide_bool === true){
        return true;
      }
    }
    return false;
  }

  other_asteroids_close  (x) {
    
    for(let i = 0; i < this.asteroid_list.length; i += 1){
      let asteroid_object = this.asteroid_list[i]
      let left_boundary = asteroid_object.points[3].x - this.min_x_distance_between_asteroids;
      let right_boundary = asteroid_object.points[1].x + this.min_x_distance_between_asteroids;
      
      if(x >= left_boundary && x <= right_boundary){
        return true;
      }
      
    }
    return false;
  }

  generate_asteroids () {
    let x_distance_increment = 10;
   
      for(let i = this.asteroid_list.length; i < this.max_asteroids_on_field; i += 1){
        let rand_x = get_random_int(0 + max_asteroid_length, this.canvas_width - max_asteroid_length);
        while(this.other_asteroids_close(rand_x) === true){
          let last_asteroid = this.asteroid_list[this.asteroid_list.length - 1];
          if(last_asteroid.center_x < this.canvas_width / 2){
            rand_x += x_distance_increment;
          }
          else{
            rand_x -= x_distance_increment;
          }
          
        }
        let y = -max_asteroid_length;
        let new_asteroid = new Asteroid(rand_x, y, this.canvas_width, this.canvas_height);
        this.asteroid_list.push(new_asteroid);
      }
      
    
  }

  hitboxes_collide(hitbox_list_1, hitbox_list_2){
    for(let i = 0; i < hitbox_list_1.length; i += 1){
      let hitbox_1 = hitbox_list_1[i];
      for(let j = 0; j < hitbox_list_2.length; j += 1){
        let hitbox_2 = hitbox_list_2[j];
        if(hitbox_1.top >= hitbox_2.top && hitbox_1.top <= hitbox_2.bottom && hitbox_1.left >= hitbox_2.left && hitbox_1.right <= hitbox_2.right){
          
          return true;
        }
        if(hitbox_1.right <= hitbox_2.right && hitbox_1.right >= hitbox_2.left && hitbox_1.top >= hitbox_2.top && hitbox_1.bottom <= hitbox_2.bottom){
          
          return true;
        }
        if(hitbox_1.left <= hitbox_2.right && hitbox_1.left >= hitbox_2.left && hitbox_1.top >= hitbox_2.top && hitbox_1.bottom <= hitbox_2.bottom){
          
          return true;
        }
        if(hitbox_1.bottom >= hitbox_2.top && hitbox_1.bottom <= hitbox_2.bottom && hitbox_1.left >= hitbox_2.left && hitbox_1.right <= hitbox_2.right){
          
          return true;
        }
      }
    }
    return false;
  }

  stop_frames () {
    clearInterval(this.frame_interval);
  }

  on_frame () {
    ctx.clearRect(0, 0, this.canvas_width, this.canvas_height);
    this.player_object.on_frame(this.input_array);
    this.asteroid_list.forEach(asteroid => {
      asteroid.on_frame();
    });
    this.dispose_asteroids();
    let player_ship_collides_with_asteroids = this.player_ship_collides_with_asteroids();
    console.log(player_ship_collides_with_asteroids);
    if(player_ship_collides_with_asteroids === true){
      this.stop_frames();
    }
  }

  start_frame_interval () {
    let ms = round_to(1000 / frame_rate, 1);
    this.frame_interval = setInterval(this.on_frame, ms);
  };

  bind_keys () {
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
      if(key === "1"){
        this.stop_frames();
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
  
}

function main() {
  init_canvas();

  let game_field = new Game_field(canvas);
}
main();
