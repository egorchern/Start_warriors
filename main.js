let root = document.querySelector("#root");
let loop_option = document.querySelector("#loop_option");
let sfx_option = document.querySelector("#sfx_option");
let ship_height = 40;
let ship_width = 50;
let small_ship_width = ship_width * 0.75;
let small_ship_height = ship_height * 0.75;
let max_asteroid_length = 45;
let stroke_hitboxes = false;
let loop_enabled;
let sfx_enabled;
let loop_track;
let frame_rate = 60;
let canvas, ctx;
let canvas_width, canvas_height;
//TODO remake into keyboard control

function play_loop_music(){
  if(loop_track === undefined && loop_enabled === true){
    loop_track = new Howl({
      src: ["sound/loop.mp3"],
      autoplay: true,
      loop: true,
      volume: 0.6
    });
    loop_track.play();
  }

}

function get_sfx_enabled(){
  let temp = localStorage.getItem("sfx_enabled");
  if(temp === undefined || temp === null){
    temp = true;
  }
  else{
    temp = JSON.parse(temp);
  }
  sfx_enabled = temp;
}

function bind_sfx_option(){
  sfx_option.onclick = toggle_sfx_option;
}

function set_sfx_enabled(){
  localStorage.setItem("sfx_enabled", JSON.stringify(sfx_enabled));
}

function toggle_sfx_option(){
  sfx_enabled = !sfx_enabled;
  set_sfx_enabled();
  if(sfx_enabled === true){
    sfx_option.src = "images/sfx_enabled.png";
  }
  else{
    sfx_option.src = "images/sfx_disabled.png"
  }

}

function bind_loop_option(){
  
  loop_option.onclick = toggle_loop_enabled;
    
}

function toggle_loop_enabled(){
  console.log(loop_enabled);
  loop_enabled = !loop_enabled;
  console.log(loop_enabled);
  if(loop_enabled === true){
    loop_option.src = "images/sound_enabled.png";
    if(loop_track != undefined){
      loop_track.play();
    }
  }
  else{
    loop_option.src = "images/sound_disabled.png";
    if(loop_track != undefined){
      loop_track.stop();
    }
  }

  set_loop_enabled(loop_enabled);
}

function play_explosion_sound_effect(){
  if(sfx_enabled === true){
    let explosion = new Howl({
      src: ["sound/explosion.wav"],
      volume: 0.2
    })
    explosion.play();
  }
}

function play_upgrade_sound_effect(){
  if(sfx_enabled === true){
    let upgrade = new Howl({
      src: ["sound/upgrade.wav"],
      volume: 0.3
    })
    upgrade.play();
  }
}

function play_player_hit_sound_effect(){
  if(sfx_enabled === true){
    let hit = new Howl({
      src: ["sound/hit.wav"],
      volume: 0.2
    })
    hit.play();
  }
}

function get_loop_enabled(){
  let temp = localStorage.getItem("loop_enabled");
  if(temp === undefined || temp === null){
    temp = true;
  }
  else{
    temp = JSON.parse(temp);
  }
  loop_enabled = temp;
}

function set_loop_enabled(value){
  localStorage.setItem("loop_enabled", JSON.stringify(value));
}

function round_to(n, digits) {
  if (digits === undefined) {
    digits = 0;
  }

  var multiplicator = Math.pow(10, digits);
  n = parseFloat((n * multiplicator).toFixed(11));
  return Math.round(n) / multiplicator;
}

function drawString(
  ctx,
  text,
  posX,
  posY,
  textColor,
  rotation,
  font,
  fontSize
) {
  var lines = text.split("\n");
  if (!rotation) rotation = 0;
  if (!font) font = "'serif'";
  if (!fontSize) fontSize = 16;
  if (!textColor) textColor = "#000000";
  ctx.save();
  ctx.font = fontSize + "px " + font;
  ctx.fillStyle = textColor;
  ctx.translate(posX, posY);
  ctx.rotate((rotation * Math.PI) / 180);
  for (i = 0; i < lines.length; i++) {
    ctx.fillText(lines[i], 0, i * fontSize);
  }
  ctx.restore();
}

function find_index(array, element) {
  for (let i = 0; i < array.length; i += 1) {
    if (array[i] === element) {
      return i;
    }
  }
  return -1;
}

function init_canvas() {
  //let height_to_width_ratio = 1.618;
  let canv_width, canv_height;
  let wind_width = window.innerWidth;
  let wind_height = window.innerHeight;
  canv_width = Math.min(560, wind_width * 0.95);
  canv_height = Math.min(650, wind_height * 0.95);
  let canv_html = `
    <canvas id="canvas" width="${canv_width}" height="${canv_height}">
    </canvas>
    `;
  root.innerHTML = canv_html;
  canvas = document.querySelector("#canvas");
  ctx = canvas.getContext("2d");
  canvas_width = canvas.width;
  canvas_height = canvas.height;
}

function find_min_index(array) {
  let min = Infinity;
  let min_index;
  for (let i = 0; i < array.length; i += 1) {
    if (array[i] < min) {
      min = array[i];
      min_index = i;
    }
  }
  return min_index;
}

function calculate_distance_between_points(point_1, point_2) {
  let distance_to_point = Math.sqrt(
    Math.pow(point_1.x - point_2.x, 2) + Math.pow(point_1.y - point_2.y, 2)
  );
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
    this.hitboxes_number_per_wing = 8;
    this.speed = 6.5;
    this.bullets_per_valley = 1;
    this.fire_rate = 2;
    this.bullet_damage = 1;
    this.fire_counter = 0;
    this.bullet_speed = 9;
    this.fill_color = fill_color;
    this.hitboxes = [];
    this.hitpoints = 2;
    this.max_hitpoints = 2;
    this.points = [];
    this.bullet_spawn_locations = [];
    this.bullet_color = "red";
    this.bullet_x_radius = 3;
    this.bullet_y_radius = 7;
    this.bullet_list = [];
    this.target_x = undefined;
  }

  fire() {
    let direction;
    if (this.facing_top === true) {
      direction = "up";
    } else {
      direction = "down";
    }
    for (let i = 0; i < this.bullet_spawn_locations.length; i += 1) {
      let currnet_bullet_spawn_location = this.bullet_spawn_locations[i];
      let bullet = new Bullet(
        currnet_bullet_spawn_location.x,
        currnet_bullet_spawn_location.y,
        this.bullet_color,
        this.bullet_x_radius,
        this.bullet_y_radius,
        this.bullet_speed,
        direction,
        this.bullet_damage
      );
      this.bullet_list.push(bullet);
    }
  }

  should_fire(frame_number) {
    if (frame_number === frame_rate) {
      this.fire_counter = 0;
    }
    if (this.fire_counter != this.fire_rate) {
      let frame_as_second = round_to(frame_number / frame_rate, 2);
      let fire_scale = round_to(1 / this.fire_rate, 2);
      let current_slice = fire_scale * this.fire_counter;
      if (frame_as_second >= current_slice) {
        this.fire_counter += 1;

        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  dispose_bullets() {
    let stop_loop = false;
    while (stop_loop === false) {
      let some_found = false;

      for (let i = 0; i < this.bullet_list.length; i += 1) {
        let curent_bullet = this.bullet_list[i];

        let out_of_bounds = curent_bullet.is_out_of_bounds();

        if (out_of_bounds === true) {
          some_found = true;
          this.bullet_list.splice(i, 1);
          break;
        }
      }
      stop_loop = !some_found;
    }
  }

  generate_points() {
    if (this.facing_top === true) {
      this.points = [
        {
          x:
            this.center_x -
            this.ship_width * 0.5 * this.top_part_width_percentage,
          y: this.center_y,
        },
        {
          x: this.center_x,
          y: this.center_y - this.ship_height / 2,
        },
        {
          x:
            this.center_x +
            this.ship_width * 0.5 * this.top_part_width_percentage,
          y: this.center_y,
        },
        {
          x: this.center_x - this.ship_width * 0.5,
          y:
            this.center_y +
            this.ship_height * 0.5 * this.wing_height_percentage,
        },
        {
          x: this.center_x - this.ship_width * 0.5 * this.left_wing_percentage,
          y:
            this.center_y +
            this.ship_height * 0.5 * this.wing_height_percentage,
        },
        {
          x: this.center_x,
          y:
            this.center_y +
            this.ship_height * 0.5 * this.wing_height_percentage,
        },
        {
          x: this.center_x + this.ship_width * 0.5,
          y:
            this.center_y +
            this.ship_height * 0.5 * this.wing_height_percentage,
        },
      ];
    } else {
      this.points = [
        {
          x:
            this.center_x -
            this.ship_width * 0.5 * this.top_part_width_percentage,
          y: this.center_y,
        },
        {
          x: this.center_x,
          y: this.center_y + this.ship_height / 2,
        },
        {
          x:
            this.center_x +
            this.ship_width * 0.5 * this.top_part_width_percentage,
          y: this.center_y,
        },
        {
          x: this.center_x - this.ship_width * 0.5,
          y:
            this.center_y -
            this.ship_height * 0.5 * this.wing_height_percentage,
        },
        {
          x: this.center_x - this.ship_width * 0.5 * this.left_wing_percentage,
          y:
            this.center_y -
            this.ship_height * 0.5 * this.wing_height_percentage,
        },
        {
          x: this.center_x,
          y:
            this.center_y -
            this.ship_height * 0.5 * this.wing_height_percentage,
        },
        {
          x: this.center_x + this.ship_width * 0.5,
          y:
            this.center_y -
            this.ship_height * 0.5 * this.wing_height_percentage,
        },
      ];
    }
  }

  generate_bullet_spawn_location() {
    this.bullet_spawn_locations = [];

    let y_coord = this.points[1].y - 5;
    let x_reference = this.points[1].x;
    let x_dist_increment = 8;
    let local_bullets_per_valley = this.bullets_per_valley;
    if (local_bullets_per_valley % 2 === 1) {
      this.bullet_spawn_locations.push({
        x: x_reference,
        y: y_coord,
      });
      local_bullets_per_valley -= 1;
    }
    let counter = 1;
    for (let i = 0; i < local_bullets_per_valley; i += 1) {
      let amount;
      if (i % 2 === 0) {
        amount = -(counter * x_dist_increment);
      } else {
        amount = counter * x_dist_increment;
        counter += 1;
      }

      this.bullet_spawn_locations.push({
        x: x_reference + amount,
        y: y_coord,
      });
    }
  }

  generate_hitboxes() {
    if (this.facing_top === true) {
      let top_part_multiplier_scale = round_to(
        1 / this.top_part_hitboxes_number,
        2
      );
      let top_part_multiplier = 0;
      let x_dist = Math.abs(this.points[0].x - this.points[1].x);
      let y_dist = Math.abs(this.points[0].y - this.points[1].y);
      let left_reference = this.points[0].x;

      let right_reference = this.points[2].x;
      let bottom_reference = this.points[0].y;

      for (let i = 0; i < this.top_part_hitboxes_number; i += 1) {
        let left = left_reference + x_dist * top_part_multiplier;
        let right = right_reference - x_dist * top_part_multiplier;
        let bottom = bottom_reference - y_dist * top_part_multiplier;
        top_part_multiplier += top_part_multiplier_scale;
        top_part_multiplier = round_to(top_part_multiplier, 2);
        let top = bottom_reference - y_dist * top_part_multiplier;
        let hitbox = {
          left: left,
          right: right,
          top: top,
          bottom: bottom,
        };
        this.hitboxes.push(hitbox);
      }
      let body_hitbox = {
        left: left_reference,
        right: right_reference,
        top: bottom_reference,
        bottom: this.points[3].y,
      };
      this.hitboxes.push(body_hitbox);
      let wing_multiplier_scale = round_to(
        1 / this.hitboxes_number_per_wing,
        2
      );
      let wing_multiplier = 0;
      x_dist = this.ship_width / 2;
      y_dist = Math.abs(this.points[2].y - this.points[3].y);
      right_reference = left_reference;
      let top_reference = bottom_reference;
      bottom_reference = top_reference + y_dist;
      for (let i = 0; i < this.hitboxes_number_per_wing; i += 1) {
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
          bottom: bottom,
        };
        this.hitboxes.push(hitbox);
      }
      wing_multiplier = 0;
      left_reference = this.points[2].x;
      right_reference = left_reference;
      for (let i = 0; i < this.hitboxes_number_per_wing; i += 1) {
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
          bottom: bottom,
        };
        this.hitboxes.push(hitbox);
      }
      let bottom_part_hitbox = {
        left: this.points[5].x - this.radius,
        right: this.points[5].x + this.radius,
        top: this.points[5].y,
        bottom: this.points[5].y + this.radius,
      };
      this.hitboxes.push(bottom_part_hitbox);
    } else {
      let top_part_multiplier_scale = round_to(
        1 / this.top_part_hitboxes_number,
        2
      );
      let top_part_multiplier = 0;
      let x_dist = Math.abs(this.points[0].x - this.points[1].x);
      let y_dist = Math.abs(this.points[0].y - this.points[1].y);
      let left_reference = this.points[0].x;

      let right_reference = this.points[2].x;
      let bottom_reference = this.points[0].y;

      for (let i = 0; i < this.top_part_hitboxes_number; i += 1) {
        let left = left_reference + x_dist * top_part_multiplier;
        let right = right_reference - x_dist * top_part_multiplier;
        let bottom = bottom_reference + y_dist * top_part_multiplier;
        top_part_multiplier += top_part_multiplier_scale;
        top_part_multiplier = round_to(top_part_multiplier, 2);
        let top = bottom_reference + y_dist * top_part_multiplier;
        let hitbox = {
          left: left,
          right: right,
          top: top,
          bottom: bottom,
        };
        this.hitboxes.push(hitbox);
      }
      let body_hitbox = {
        left: left_reference,
        right: right_reference,
        top: bottom_reference,
        bottom: this.points[3].y,
      };
      this.hitboxes.push(body_hitbox);
      let wing_multiplier_scale = round_to(
        1 / this.hitboxes_number_per_wing,
        2
      );
      let wing_multiplier = 0;
      x_dist = this.ship_width / 2;
      y_dist = Math.abs(this.points[2].y - this.points[3].y);
      right_reference = left_reference;
      let top_reference = bottom_reference - y_dist;

      for (let i = 0; i < this.hitboxes_number_per_wing; i += 1) {
        let right = right_reference - x_dist * wing_multiplier;
        let bottom = bottom_reference - y_dist * wing_multiplier;
        let top = top_reference;
        wing_multiplier += wing_multiplier_scale;
        wing_multiplier = round_to(wing_multiplier, 2);
        let left = right_reference - x_dist * wing_multiplier;
        let hitbox = {
          left: left,
          right: right,
          top: top,
          bottom: bottom,
        };
        this.hitboxes.push(hitbox);
      }
      wing_multiplier = 0;
      left_reference = this.points[2].x;
      right_reference = left_reference;
      for (let i = 0; i < this.hitboxes_number_per_wing; i += 1) {
        let right = right_reference + x_dist * wing_multiplier;
        let bottom = bottom_reference - y_dist * wing_multiplier;
        let top = top_reference;
        wing_multiplier += wing_multiplier_scale;
        wing_multiplier = round_to(wing_multiplier, 2);
        let left = right_reference + x_dist * wing_multiplier;
        let hitbox = {
          left: left,
          right: right,
          top: top,
          bottom: bottom,
        };
        this.hitboxes.push(hitbox);
      }
      let bottom_part_hitbox = {
        left: this.points[5].x - this.radius,
        right: this.points[5].x + this.radius,
        top: this.points[5].y,
        bottom: this.points[5].y - this.radius,
      };
      this.hitboxes.push(bottom_part_hitbox);
    }
  }

  move_left() {
    this.center_x -= this.speed;
    this.adjust_everything("left");
  }

  move_up() {
    this.center_y -= this.speed;
    this.adjust_everything("up");
  }

  move_right() {
    this.center_x += this.speed;
    this.adjust_everything("right");
  }

  move_down() {
    this.center_y += this.speed;
    this.adjust_everything("down");
  }

  adjust_bullet_spawn_locations(direction) {
    let coordinate, amount;
    switch (direction) {
      case "up":
        coordinate = "y";
        amount = -this.speed;
        break;
      case "right":
        coordinate = "x";
        amount = this.speed;
        break;
      case "down":
        coordinate = "y";
        amount = this.speed;
        break;
      case "left":
        coordinate = "x";
        amount = -this.speed;
        break;
    }
    for (let i = 0; i < this.bullet_spawn_locations.length; i += 1) {
      this.bullet_spawn_locations[i][coordinate] += amount;
    }
  }

  adjust_everything(direction) {
    this.adjust_points(direction);
    this.adjust_hitboxes(direction);
    this.adjust_bullet_spawn_locations(direction);
  }

  adjust_points(direction) {
    let coordinate, amount;
    switch (direction) {
      case "up":
        coordinate = "y";
        amount = -this.speed;
        break;
      case "right":
        coordinate = "x";
        amount = this.speed;
        break;
      case "down":
        coordinate = "y";
        amount = this.speed;
        break;
      case "left":
        coordinate = "x";
        amount = -this.speed;
        break;
    }

    for (let i = 0; i < this.points.length; i += 1) {
      let new_amount = this.points[i][coordinate] + amount;
      this.points[i][coordinate] = new_amount;
    }
  }

  adjust_hitboxes(direction) {
    let coordinate, amount;
    switch (direction) {
      case "up":
        coordinate = "y";
        amount = -this.speed;
        break;
      case "right":
        coordinate = "x";
        amount = this.speed;
        break;
      case "down":
        coordinate = "y";
        amount = this.speed;
        break;
      case "left":
        coordinate = "x";
        amount = -this.speed;
        break;
    }

    for (let i = 0; i < this.hitboxes.length; i += 1) {
      let current_hitbox = this.hitboxes[i];
      if (coordinate === "x") {
        current_hitbox.left += amount;
        current_hitbox.right += amount;
      } else {
        current_hitbox.bottom += amount;
        current_hitbox.top += amount;
      }
      this.hitboxes[i] = current_hitbox;
    }
  }

  touches_boundary(x, y) {
    let left = x - this.ship_width / 2;
    let right = x + this.ship_width / 2;
    let top = y - this.ship_height / 2;
    let bottom = y + this.ship_height / 2;

    if (
      left < 0 ||
      right > this.canvas_width ||
      top < 0 ||
      bottom > this.canvas_height
    ) {
      return true;
    } else {
      return false;
    }
  }

  stroke_hitboxes() {
    ctx.save();
    for (let i = 0; i < this.hitboxes.length; i += 1) {
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
    rest_of_ship.moveTo(this.points[0].x, this.points[0].y);
    rest_of_ship.lineTo(this.points[3].x, this.points[3].y);
    rest_of_ship.lineTo(this.points[4].x, this.points[4].y);

    if (this.facing_top === true) {
      rest_of_ship.arc(
        this.points[5].x,
        this.points[5].y,
        this.radius,
        0,
        Math.PI
      );
    } else {
      rest_of_ship.arc(
        this.points[5].x,
        this.points[5].y,
        this.radius,
        Math.PI,
        2 * Math.PI
      );
    }

    rest_of_ship.lineTo(this.points[6].x, this.points[6].y);
    rest_of_ship.lineTo(this.points[2].x, this.points[2].y);
    ctx.fill(rest_of_ship);
    if(stroke_hitboxes === true){
      this.stroke_hitboxes();
    }
    
    ctx.restore();
  }

  on_frame(frame_number) {
    if (this.center_y - this.ship_height < 0) {
      this.move_down();
    }
    if(Math.abs(this.center_x - this.target_x) >= this.speed && this.center_x < this.target_x){
      this.move_right();
    }
    if(Math.abs(this.center_x - this.target_x) >= this.speed && this.center_x > this.target_x){
      this.move_left();
    }
    
    let should_fire = this.should_fire(frame_number);
    if (should_fire === true) {
      this.fire();
    }
    this.dispose_bullets();
    this.bullet_list.forEach((bullet) => {
      bullet.on_frame();
    });

    this.draw();
  }
}

class Asteroid {
  constructor(center_x, center_y, canvas_width, canvas_height, hitpoints) {
    this.canvas_width = canvas_width;
    this.canvas_height = canvas_height;
    this.speed = 3;
    this.max_radius = max_asteroid_length / 2;
    this.min_radius = this.max_radius - 8;
    this.center_x = center_x;
    this.center_y = center_y;
    this.hitpoints = hitpoints;
    this.fill_color = "hsl(0, 2%, 28%)";
    this.points = [];
    this.hitboxes = [];
    this.number_of_hitboxes_per_half = 8;
    this.generate_points();
    this.generate_hitboxes();
  }

  is_out_of_bounds() {
    if (this.points[0].y > this.canvas_height) {
      return true;
    } else {
      return false;
    }
  }

  move_down() {
    this.center_y += this.speed;
    this.adjust_points("down");
    this.adjust_hitboxes("down");
  }

  generate_points() {
    let point = {
      x: this.center_x,
      y: get_random_int(
        this.center_y - this.min_radius,
        this.center_y - this.max_radius
      ),
    };
    this.points.push(point);
    point = {
      x: get_random_int(
        this.center_x + this.min_radius,
        this.center_x + this.max_radius
      ),
      y: this.center_y,
    };
    this.points.push(point);
    point = {
      x: this.center_x,
      y: get_random_int(
        this.center_y + this.min_radius,
        this.center_y + this.max_radius
      ),
    };
    this.points.push(point);
    point = {
      x: get_random_int(
        this.center_x - this.min_radius,
        this.center_x - this.max_radius
      ),
      y: this.center_y,
    };
    this.points.push(point);
  }

  generate_hitboxes() {
    let half_multiplier_scale = round_to(
      1 / this.number_of_hitboxes_per_half,
      2
    );
    let half_multiplier = 0;
    let x_dist_left = Math.abs(this.center_x - this.points[3].x);
    let x_dist_right = Math.abs(this.center_x - this.points[1].x);
    let y_dist = Math.abs(this.center_y - this.points[2].y);
    let x_reference = this.points[2].x;
    let y_reference = this.points[2].y;
    for (let i = 0; i < this.number_of_hitboxes_per_half; i += 1) {
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
        bottom: bottom,
      };
      this.hitboxes.push(hitbox);
    }
    half_multiplier = 0;
    y_dist = Math.abs(this.center_y - this.points[0].y);
    x_reference = this.points[0].x;
    y_reference = this.points[0].y;
    for (let i = 0; i < this.number_of_hitboxes_per_half; i += 1) {
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
        bottom: bottom,
      };
      this.hitboxes.push(hitbox);
    }
  }

  adjust_hitboxes(direction) {
    let coordinate, amount;
    switch (direction) {
      case "up":
        coordinate = "y";
        amount = -this.speed;
        break;
      case "right":
        coordinate = "x";
        amount = this.speed;
        break;
      case "down":
        coordinate = "y";
        amount = this.speed;
        break;
      case "left":
        coordinate = "x";
        amount = -this.speed;
        break;
    }

    for (let i = 0; i < this.hitboxes.length; i += 1) {
      let current_hitbox = this.hitboxes[i];
      if (coordinate === "x") {
        current_hitbox.left += amount;
        current_hitbox.right += amount;
      } else {
        current_hitbox.bottom += amount;
        current_hitbox.top += amount;
      }
      this.hitboxes[i] = current_hitbox;
    }
  }

  adjust_points(direction) {
    let coordinate, amount;
    switch (direction) {
      case "up":
        coordinate = "y";
        amount = -this.speed;
        break;
      case "right":
        coordinate = "x";
        amount = this.speed;
        break;
      case "down":
        coordinate = "y";
        amount = this.speed;
        break;
      case "left":
        coordinate = "x";
        amount = -this.speed;
        break;
    }

    for (let i = 0; i < this.points.length; i += 1) {
      let new_amount = this.points[i][coordinate] + amount;
      this.points[i][coordinate] = new_amount;
    }
  }

  stroke_hitboxes() {
    ctx.save();
    for (let i = 0; i < this.hitboxes.length; i += 1) {
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

  on_frame() {
    this.move_down();
    this.draw();
  }

  draw() {
    let asteroid_path = new Path2D();
    asteroid_path.moveTo(this.points[0].x, this.points[0].y);
    for (let i = 0; i < this.points.length; i += 1) {
      let point = this.points[i];
      asteroid_path.lineTo(point.x, point.y);
    }
    asteroid_path.closePath();
    ctx.save();
    ctx.fillStyle = this.fill_color;
    ctx.fill(asteroid_path);
    if(stroke_hitboxes === true){
      this.stroke_hitboxes();
    }
    ctx.restore();
  }
}

class Bullet {
  constructor(
    center_x,
    center_y,
    fill_color,
    x_radius,
    y_radius,
    bullet_speed,
    direction,
    damage
  ) {
    this.center_x = center_x;
    this.center_y = center_y;
    this.fill_color = fill_color;
    this.x_radius = x_radius;
    this.y_radius = y_radius;
    this.speed = bullet_speed;
    this.direction = direction;
    this.hitboxes = [];
    this.damage = damage;
    this.generate_hitboxes();
  }

  generate_hitboxes() {
    let hitbox = {
      left: this.center_x - this.x_radius,
      right: this.center_x + this.x_radius,
      top: this.center_y - this.y_radius,
      bottom: this.center_y + this.y_radius,
    };

    this.hitboxes.push(hitbox);
  }

  adjust_hitboxes(direction) {
    let coordinate, amount;
    switch (direction) {
      case "up":
        coordinate = "y";
        amount = -this.speed;
        break;
      case "right":
        coordinate = "x";
        amount = this.speed;
        break;
      case "down":
        coordinate = "y";
        amount = this.speed;
        break;
      case "left":
        coordinate = "x";
        amount = -this.speed;
        break;
    }

    for (let i = 0; i < this.hitboxes.length; i += 1) {
      let current_hitbox = this.hitboxes[i];
      if (coordinate === "x") {
        current_hitbox.left += amount;
        current_hitbox.right += amount;
      } else {
        current_hitbox.bottom += amount;
        current_hitbox.top += amount;
      }
      this.hitboxes[i] = current_hitbox;
    }
  }

  move_up() {
    this.center_y -= this.speed;
    this.adjust_hitboxes("up");
  }

  is_out_of_bounds() {
    if (
      this.center_y - this.y_radius < 0 ||
      this.center_y + this.y_radius > canvas_height
    ) {
      return true;
    } else {
      return false;
    }
  }

  move_down() {
    this.center_y += this.speed;
    this.adjust_hitboxes("down");
  }

  on_frame() {
    if (this.direction === "up") {
      this.move_up();
    } else if (this.direction === "down") {
      this.move_down();
    }
    this.draw();
  }

  stroke_hitboxes() {
    ctx.save();
    for (let i = 0; i < this.hitboxes.length; i += 1) {
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
    let bullet_path = new Path2D();
    bullet_path.ellipse(
      this.center_x,
      this.center_y,
      this.x_radius,
      this.y_radius,
      0,
      0,
      Math.PI * 2
    );
    bullet_path.closePath();
    ctx.save();
    ctx.fillStyle = this.fill_color;
    ctx.fill(bullet_path);

    if(stroke_hitboxes === true){
      this.stroke_hitboxes();
    }
    ctx.restore();
  }
}

class Player_ship extends Ship {
  constructor(canvas_width, canvas_height, fill_color, facing_top) {
    super(canvas_width, canvas_height, fill_color, facing_top);
    this.center_x = this.canvas_width / 2;
    this.center_y = this.canvas_height - this.ship_height - 10;
    this.generate_points();
    this.generate_hitboxes();
    this.generate_bullet_spawn_location();
  }
  process_inputs(input_array) {
    if (input_array[0] === 1) {
      let touches_boundary = this.touches_boundary(
        this.center_x,
        this.center_y - this.speed
      );

      if (touches_boundary === false) {
        this.move_up();
      }
    }
    if (input_array[1] === 1) {
      let touches_boundary = this.touches_boundary(
        this.center_x + this.speed,
        this.center_y
      );
      if (touches_boundary === false) {
        this.move_right();
      }
    }
    if (input_array[2] === 1) {
      let touches_boundary = this.touches_boundary(
        this.center_x,
        this.center_y + this.speed
      );

      if (touches_boundary === false) {
        this.move_down();
      }
    }
    if (input_array[3] === 1) {
      let touches_boundary = this.touches_boundary(
        this.center_x - this.speed,
        this.center_y
      );
      if (touches_boundary === false) {
        this.move_left();
      }
    }
  }
  on_frame(input_array, frame_number) {
    this.process_inputs(input_array);
    let should_fire = this.should_fire(frame_number);
    if (should_fire === true) {
      this.fire();
    }
    this.dispose_bullets();
    this.bullet_list.forEach((bullet) => {
      bullet.on_frame();
    });

    this.draw();
  }
}

class Enemy_ship_small extends Ship {
  constructor(
    center_x,
    center_y,
    canvas_width,
    canvas_height,
    fill_color,
    facing_top,
    hitpoints,
    bullet_speed_multiplier,
    fire_rate,
    bullets_per_valley
  ) {
    super(canvas_width, canvas_height, fill_color, facing_top);
    this.center_x = center_x;
    this.center_y = center_y;
    this.hitpoints = hitpoints;
    this.max_hitpoints = hitpoints;
    this.bullet_color = "hsl(120, 100%, 50%)";
    this.bullet_speed = bullet_speed_multiplier * this.bullet_speed;
    this.fire_rate = fire_rate;
    this.speed = 0.5 * this.speed;
    this.bullets_per_valley = bullets_per_valley;
    this.bullet_x_radius = 2.5;
    this.bullet_y_radius = 6.5;
    this.generate_points();
    this.generate_hitboxes();
    this.generate_bullet_spawn_location();
  }
}

class Game_field {
  constructor() {
    this.frame_interval;
    let player_ship_color = "hsl(184, 100%, 50%)";
    this.canvas_width = canvas.width;
    this.canvas_height = canvas.height;
    this.max_asteroids_on_field = 1;
    this.max_asteroid_on_screen = 8;
    this.increase_asteroid_count_seconds = 15;
    this.seconds_elapsed = 0;
    this.increase_asteroids_counter = 0;

    this.asteroid_list = [];
    this.frame_number = 0;
    this.asteroid_hitpoints = 1;
    //this.asteroid_max_hitpoints = 6;
    this.increase_asteroid_hitpoints_counter = 0;
    this.increase_asteroid_hitpoints_after = 30;
    this.player_hp_regen_after = 30;
    this.player_hp_regen_counter = 0;
    this.upgrade_after = 30;
    this.upgrade_counter = this.upgrade_after;
    this.score = 0;
    this.score_per_small_ship = 30;
    this.points_per_asteroid = 10;
    this.enemy_ships_on_field = 0;
    this.enemy_ships_max = 3;
    this.enemy_ships_increase_after = 30;
    this.enemy_ships_increase_counter = 0;
    this.enemy_ship_spawn_cooldown = 2 * frame_rate;
    this.enemy_ship_spawn_cooldown_counter = 0;
    this.player_object = new Player_ship(
      this.canvas_width,
      this.canvas_height,
      player_ship_color,
      true
    );
    this.enemy_ship_color = "hsl(30, 100%, 60%)";
    this.enemy_ship_hitpoints = 2;
    this.enemy_ship_hitpoints_increase_after = 20;
    this.enemy_ship_hitpoints_increase_counter = 0;
    this.enemy_ships_attempt_to_move_every = 3 * frame_rate;
    this.enemy_ship_bullet_speed_multiplier = 0.4;
    this.enemy_ship_bullet_speed_multiplier_max = 0.9;
    this.enemy_ship_bullet_speed_multiplier_increase_after = 50;
    this.enemy_ship_bullet_speed_multiplier_increase_counter = 0;
    this.enemy_ship_fire_rate = 1;
    this.enemy_ship_fire_rate_max = 6;
    this.enemy_ship_fire_rate_increase_after = 50;
    this.enemy_ship_fire_rate_increase_counter = 0;
    this.enemy_ship_bullets_per_valley = 1;
    this.enemy_ship_bullets_per_valley_max = 4;
    this.enemy_ship_bullets_per_valley_increase_after = 50;
    this.enemy_ship_bullets_per_valley_increase_counter = 0;
    this.enemy_ships_move_counters = [];
    this.enemy_ships_list = [];
    this.score_per_second = 2;
    this.generate_entities();
    // in order: up, right, down, left, shoot
    this.input_array = [0, 0, 0, 0, 0];
    //this.bind_mouse_move_on_canvas();
    this.bind_keys();
    this.on_frame = this.on_frame.bind(this);
    this.start_frame_interval();
  }

  handle_game_end(){
    this.stop_frames();
    ctx.save();
    ctx.textAlign = "center";
    let background_color = "hsl(0, 0%, 0%, 90%)";
    ctx.fillStyle = background_color;
    ctx.fillRect(0, 0, canvas_width, canvas_height);
    let y = canvas_height / 2 - 80;
    let x = canvas_width / 2;
    let font_size = 28;
    let y_increment = 40;
    drawString(ctx, "Game Over", x, y, "white", 0, "sans-serif", font_size );
    y += y_increment;
    drawString(ctx, `Survived for: ${this.seconds_elapsed} seconds`, x, y, "white", 0, "sans-serif", font_size );
    y += y_increment;
    let final_score = this.score + this.seconds_elapsed * this.score_per_second;
    drawString(ctx, `Final score: ${final_score}`, x, y, "white", 0, "sans-serif", font_size );
    y += y_increment;
    drawString(ctx, `Press R to restart`, x, y, "white", 0, "sans-serif", font_size );
    ctx.restore();
    window.onkeydown = (ev) => {
      let key = ev.key;
      if(key === "r"){
        main();
      }
    }
  }

  attempt_enemy_ships_move(){
    let min_distance = small_ship_width + 10;
    for(let i = 0; i < this.enemy_ships_list.length; i += 1){
      let current_ship = this.enemy_ships_list[i];
      if(this.enemy_ships_move_counters[i] >= this.enemy_ships_attempt_to_move_every){
        let usable_ranges = this.get_usable_range();
        let left_range, right_range;
        let left = current_ship.center_x - current_ship.ship_width / 2;
        let right = current_ship.center_x + current_ship.ship_width / 2;
        for(let i = 0; i < usable_ranges.length; i += 1){
          let current_range = usable_ranges[i];
          if(current_range[1] === left){
            left_range = current_range;
          }
          if(current_range[0] === right){
            right_range = current_range;
          }

        }
        
        let left_dist = left_range[1] - left_range[0];
        let right_dist = right_range[1] - right_range[0];
        
        if(left_dist > right_dist){
          let min = left_range[0] + current_ship.ship_width/2;
          let max = left_range[1];
          let center_x = get_random_int(min, max);
          current_ship.target_x = center_x;
          
        }
        else{
          let min = right_range[0];
          let max = right_range[1] - current_ship.ship_width/2;
          let center_x = get_random_int(min, max);
          current_ship.target_x = center_x;
          
        }
        
        this.enemy_ships_move_counters[i] = 0;
      }
      else{
        this.enemy_ships_move_counters[i] += 1;
      }
    }
  }

  increase_enemy_ship_bullets_per_valley(){
    if(this.enemy_ship_bullets_per_valley < this.enemy_ship_bullets_per_valley_max){
      this.enemy_ship_bullets_per_valley += 1;
      this.enemy_ship_bullets_per_valley_increase_counter = 0;
    }
  }

  increase_enemy_ship_fire_rate(){
    if(this.enemy_ship_fire_rate < this.enemy_ship_fire_rate_max){
      this.enemy_ship_fire_rate += 1;
      this.enemy_ship_fire_rate_increase_counter = 0;
    }
  }

  increase_enemy_ship_bullet_speed_multiplier(){
    if(this.enemy_ship_bullet_speed_multiplier < this.enemy_ship_bullet_speed_multiplier_max){
      this.enemy_ship_bullet_speed_multiplier += 0.1;
      this.enemy_ship_bullet_speed_multiplier_increase_counter = 0;
    }
  }

  get_usable_range() {
    let boundaries_list = [];
    this.asteroid_list.forEach((asteroid) => {
      boundaries_list.push([asteroid.points[3].x, asteroid.points[1].x]);
    });
    this.enemy_ships_list.forEach((ship) => {
      let left_boundary = ship.center_x - ship.ship_width / 2;
      let right_boundary = ship.center_x + ship.ship_width / 2;
      boundaries_list.push([left_boundary, right_boundary]);
    });

    for (let i = 0; i < boundaries_list.length; i += 1) {
      for (let j = 0; j < boundaries_list.length - i - 1; j += 1) {
        let left_1 = boundaries_list[j][0];
        let left_2 = boundaries_list[j + 1][0];
        if (left_1 > left_2) {
          let temp = boundaries_list[j];
          boundaries_list[j] = boundaries_list[j + 1];

          boundaries_list[j + 1] = temp;
        }
      }
    }
    let free_ranges = [];
    let running_x = 0;
    for (let i = 0; i < boundaries_list.length; i += 1) {
      free_ranges.push([running_x, boundaries_list[i][0]]);
      running_x = boundaries_list[i][1];
    }
    free_ranges.push([running_x, canvas_width]);

    return free_ranges;
  }

  increase_enemy_ships_hitpoints() {

    this.enemy_ship_hitpoints += 1;
    this.enemy_ship_hitpoints_increase_counter = 0;

  }

  apply_min_distance_on_ranges(min_distance, free_ranges) {
    let new_ranges = [];
    for (let i = 0; i < free_ranges.length; i += 1) {
      let current_range = free_ranges[i];
      let left = current_range[0];
      let right = current_range[1];
      if (right - left > min_distance) {
        new_ranges.push(current_range);
      }
    }
    return new_ranges;
  }

  draw_menu(
    attack_damage,
    attack_rate,
    attacks_per_valley,
    hitpoints,
    score,
    regen_rate
  ) {
    let vertical_space_between = 20;
    ctx.save();
    ctx.font = "14px sans-serif";
    let y_dist = 20;
    ctx.fillText(
      `Attack damage: ${attack_damage}`,
      canvas_width - 110,
      y_dist,
      105
    );
    y_dist += vertical_space_between;
    ctx.fillText(
      `Attack rate: ${attack_rate}`,
      canvas_width - 110,
      y_dist,
      105
    );
    y_dist += vertical_space_between;
    ctx.fillText(
      `Bullets/attack: ${attacks_per_valley}`,
      canvas_width - 110,
      y_dist,
      105
    );
    y_dist += vertical_space_between;
    ctx.fillText(`Hitpoints: ${hitpoints}`, canvas_width - 110, y_dist, 105);
    y_dist += vertical_space_between;
    ctx.fillText(
      `Hp regen rate: ${regen_rate}`,
      canvas_width - 110,
      y_dist,
      105
    );
    y_dist += vertical_space_between;
    ctx.fillText(`Score: ${score}`, canvas_width - 110, y_dist, 105);

    ctx.restore();
  }

  handle_upgrade() {
    // upgrade codes: 1 - attack damage+, 2 - attack rate+, 3 - shots per attack+, 4 - hitpoints+, 5 - hitpoints regen+, 6 - ship speed+
    let upgrade_codes = [];
    let end_code = 6;
    let font_size = 15;
    let number_of_upgrades_to_choose = 3;
    for (let i = 0; i < number_of_upgrades_to_choose; i += 1) {
      let upgrade_code = get_random_int(1, end_code);
      while (upgrade_codes.includes(upgrade_code) === true) {
        upgrade_code = get_random_int(1, end_code);
      }
      upgrade_codes.push(upgrade_code);
    }
    let upgrade_messages = {
      1: "Increase attack damage \nby 1",
      2: "Increase attack rate \nby 1",
      3: "Increase the number of \nbullets per attack by 1",
      4: "Increase hitpoints \nby 2",
      5: "Increase hitpoint \nregeneration rate by 4s\n(Min 1s)",
      6: "Increase ship speed \nby 0.5",
    };
    let background_color = "hsl(0, 0%, 0%, 90%)";
    ctx.save();
    ctx.fillStyle = background_color;

    ctx.fillRect(0, 0, canvas_width, canvas_height);
    let keys = ["1", "2", "3"];
    ctx.restore();
    let line_color = "hsl(0, 0%, 86%)";
    let x_scale = round_to(canvas_width / number_of_upgrades_to_choose, 2);
    let x_position = x_scale;
    for (let i = 0; i < number_of_upgrades_to_choose; i += 1) {
      ctx.save();
      ctx.strokeStyle = line_color;
      ctx.beginPath();
      ctx.moveTo(x_position, 0);

      ctx.lineTo(x_position, canvas_height);
      ctx.stroke();
      ctx.restore();
      ctx.save();
      ctx.textAlign = "center";
      let text_x_position = x_position - x_scale / 2;

      let text_y_position = 50;
      drawString(
        ctx,
        `Press "${keys[i]}"`,
        text_x_position,
        text_y_position,
        "white",
        0,
        "sans-serif",
        font_size
      );
      text_y_position = canvas_height / 2;
      drawString(
        ctx,
        upgrade_messages[upgrade_codes[i]],
        text_x_position,
        text_y_position,
        "white",
        0,
        "sans-serif",
        font_size
      );
      ctx.restore();
      x_position += x_scale;
    }

    this.stop_frames();
    window.onkeydown = (e) => {
      let key = e.key;
      let index = find_index(keys, key);
      play_loop_music();
      if (index != -1) {
        let upgrade_code = upgrade_codes[index];
        switch (upgrade_code) {
          case 1:
            this.player_object.bullet_damage += 1;
            break;
          case 2:
            this.player_object.fire_rate += 1;
            break;
          case 3:
            this.player_object.bullets_per_valley += 1;
            this.player_object.generate_bullet_spawn_location();
            break;
          case 4:
            this.player_object.hitpoints += 2;
            this.player_object.max_hitpoints += 2;
            break;
          case 5:
            let end_result = this.player_hp_regen_after - 4;
            if(end_result >= 1){ 
              this.player_hp_regen_after -= 4;
            }
            else{
              this.player_hp_regen_after = 1;
            }
            
            break;
          case 6:
            this.player_object.speed += 0.5;
            break;
        }
        this.upgrade_counter = 0;
        play_upgrade_sound_effect();
        this.start_frame_interval();
        this.bind_keys();
      }
    };
  }

  increase_enemy_ships() {
    if (this.enemy_ships_on_field < this.enemy_ships_max) {
      this.enemy_ships_on_field += 1;
      this.enemy_ships_increase_counter = 0;
    }
  }

  check_timed_events() {
    if (
      this.increase_asteroids_counter === this.increase_asteroid_count_seconds
    ) {
      this.increase_asteroid_count();
    }

    if (
      this.increase_asteroid_hitpoints_counter ===
      this.increase_asteroid_hitpoints_after
    ) {
      this.increase_asteroid_hitpoints();
    }

    if (this.upgrade_counter === this.upgrade_after) {
      this.handle_upgrade();
    }
    
    if (this.player_hp_regen_counter === this.player_hp_regen_after) {
      if (this.player_object.hitpoints < this.player_object.max_hitpoints) {
        this.player_object.hitpoints += 1;
        
      }
      this.player_hp_regen_counter = 0;
    }

    if (this.enemy_ships_increase_counter === this.enemy_ships_increase_after) {
      this.increase_enemy_ships();
    }

    if (this.enemy_ship_hitpoints_increase_counter === this.enemy_ship_hitpoints_increase_after) {
      this.increase_enemy_ships_hitpoints();
    }

    if(this.enemy_ship_bullet_speed_multiplier_increase_counter === this.enemy_ship_bullet_speed_multiplier_increase_after){
      this.increase_enemy_ship_bullet_speed_multiplier();
    }

    if(this.enemy_ship_fire_rate_increase_counter === this.enemy_ship_fire_rate_increase_after){
      this.increase_enemy_ship_fire_rate();
    }

    if(this.enemy_ship_bullets_per_valley_increase_counter === this.enemy_ship_bullets_per_valley_increase_after){
      this.increase_enemy_ship_bullets_per_valley();
    }
  }

  increase_asteroid_count() {
    this.increase_asteroids_counter = 0;
    if (this.max_asteroids_on_field < this.max_asteroid_on_screen) {
      this.max_asteroids_on_field += 1;
    }
  }

  increase_asteroid_hitpoints() {
    this.increase_asteroid_hitpoints_counter = 0;

    this.asteroid_hitpoints += 1;

  }

  dispose_asteroids() {
    while (true) {
      let found = false;
      for (let i = 0; i < this.asteroid_list.length; i += 1) {
        let asteroid_object = this.asteroid_list[i];
        let is_out_of_bounds = asteroid_object.is_out_of_bounds();
        if (is_out_of_bounds === true) {
          this.asteroid_list.splice(i, 1);
          found = true;
          break;
        }
      }
      if (found === false) {
        break;
      }
    }
    this.generate_asteroids();
  }

  handle_player_ship_collides_with_asteroids() {
    while (true) {
      let some_found = false;
      for (let i = 0; i < this.asteroid_list.length; i += 1) {
        let collide_bool = this.hitboxes_collide(
          this.player_object.hitboxes,
          this.asteroid_list[i].hitboxes
        );
        if (collide_bool === true) {
          play_player_hit_sound_effect();
          some_found = true;
          this.player_object.hitpoints -= 1;
          this.asteroid_list.splice(i, 1);
          if (this.player_object.hitpoints <= 0) {
            this.handle_game_end();
          }
        }
      }
      if (some_found === false) {
        break;
      }
    }
  }

  handle_player_bullets_with_enemy_bullets() {
    while (true) {
      let some_found = false;
      let players_bullet_list = this.player_object.bullet_list;
      for (let i = 0; i < this.enemy_ships_list.length; i += 1) {
        let enemy_ship = this.enemy_ships_list[i];
        let enemy_bullet_list = enemy_ship.bullet_list;
        for (let j = 0; j < enemy_bullet_list.length; j += 1) {
          let current_enemy_bullet = enemy_bullet_list[j];
          let current_enemy_bullet_hitboxes = current_enemy_bullet.hitboxes;
          for (let k = 0; k < players_bullet_list.length; k += 1) {
            let current_player_bullet = players_bullet_list[k];
            let current_player_bullet_hitboxes = current_player_bullet.hitboxes;
            let collides_bool = this.hitboxes_collide(
              current_player_bullet_hitboxes,
              current_enemy_bullet_hitboxes
            );

            if (collides_bool === true) {
              some_found = true;
              current_player_bullet.damage -= 1;
              if(current_player_bullet.damage <= 0){
                players_bullet_list.splice(k, 1);
              }
              
              enemy_bullet_list.splice(j, 1);
              break;
            }
          }
          if (some_found === true) {
            break;
          }
        }
        if (some_found === true) {
          break;
        }
      }
      if (some_found === false) {
        break;
      }
    }
  }

  handle_player_bullets_with_enemy_ships() {
    while (true) {
      let some_found = false;
      let players_bullet_list = this.player_object.bullet_list;
      for (let i = 0; i < players_bullet_list.length; i += 1) {
        let current_player_bullet = players_bullet_list[i];
        for (let j = 0; j < this.enemy_ships_list.length; j += 1) {
          let current_enemy_ship = this.enemy_ships_list[j];
          let collides_bool = this.hitboxes_collide(
            current_player_bullet.hitboxes,
            current_enemy_ship.hitboxes
          );
          if (collides_bool === true) {
            some_found = true;
            current_enemy_ship.hitpoints -= current_player_bullet.damage;

            if (current_enemy_ship.hitpoints <= 0) {
              play_explosion_sound_effect();
              this.enemy_ships_list.splice(j, 1);
              this.enemy_ships_move_counters.splice(j, 1);
              this.score += this.score_per_small_ship * this.enemy_ship_hitpoints;
            }
            else{
              play_player_hit_sound_effect();
            }
            players_bullet_list.splice(i, 1);
          }
        }
        if (some_found === true) {
          break;
        }
      }
      if (some_found === false) {
        break;
      }
    }
  }

  handle_enemy_bullets_with_player_ship() {
    while (true) {
      let some_found = false;
      for (let i = 0; i < this.enemy_ships_list.length; i += 1) {
        let current_enemy_ship = this.enemy_ships_list[i];
        let bullet_list = current_enemy_ship.bullet_list;
        for (let j = 0; j < bullet_list.length; j += 1) {
          let current_bullet = bullet_list[j];
          let collides_bool = this.hitboxes_collide(
            current_bullet.hitboxes,
            this.player_object.hitboxes
          );
          if (collides_bool === true) {
            play_player_hit_sound_effect();
            some_found = true;
            bullet_list.splice(j, 1);
            this.player_object.hitpoints -= current_bullet.damage;
            if (this.player_object.hitpoints <= 0) {
              this.handle_game_end();
            }
          }
          if (some_found === true) {
            break;
          }
        }
        if (some_found === true) {
          break;
        }
      }
      if (some_found === false) {
        break;
      }
    }
  }


  generate_entities() {
    this.generate_enemy_ships();
    this.generate_asteroids();
  }

  generate_enemy_ships() {
    let min = small_ship_width + 1;
    
    if (this.enemy_ships_list.length < this.enemy_ships_on_field) {
      if (
        this.enemy_ship_spawn_cooldown_counter >= this.enemy_ship_spawn_cooldown
      ) {
        let ranges = this.get_usable_range();

        ranges = this.apply_min_distance_on_ranges(min, ranges);

        if (ranges.length > 0) {
          let range_index = get_random_int(0, ranges.length - 1);
          let range = ranges[range_index];

          let choosable = [range[0] + min / 2, range[1] - min / 2];

          let center_x = get_random_int(choosable[0], choosable[1]);

          let ship = new Enemy_ship_small(
            center_x,
            -small_ship_height,
            canvas_width,
            canvas_height,
            this.enemy_ship_color,
            false,
            this.enemy_ship_hitpoints,
            this.enemy_ship_bullet_speed_multiplier,
            this.enemy_ship_fire_rate,
            this.enemy_ship_bullets_per_valley
          );

          this.enemy_ships_list.push(ship);
          this.enemy_ships_move_counters.push(0);
          this.enemy_ship_spawn_cooldown_counter = 0;
        }
      }
      else {
        this.enemy_ship_spawn_cooldown_counter += 1;
      }
    }
  }

  generate_asteroids() {
    let min = max_asteroid_length + 1;
    for (
      let i = this.asteroid_list.length;
      i < this.max_asteroids_on_field;
      i += 1
    ) {
      let ranges = this.get_usable_range();

      ranges = this.apply_min_distance_on_ranges(min, ranges);

      if (ranges.length > 0) {
        let range_index = get_random_int(0, ranges.length - 1);
        let range = ranges[range_index];

        let choosable = [range[0] + min / 2, range[1] - min / 2];

        let center_x = get_random_int(choosable[0], choosable[1]);

        let asteroid = new Asteroid(
          center_x,
          -max_asteroid_length,
          canvas_width,
          canvas_height,
          this.asteroid_hitpoints
        );

        this.asteroid_list.push(asteroid);
      }
    }
  }

  hitboxes_collide(hitbox_list_1, hitbox_list_2) {
    for (let i = 0; i < hitbox_list_1.length; i += 1) {
      let temp1 = hitbox_list_1[i];
      for (let j = 0; j < hitbox_list_2.length; j += 1) {
        let temp2 = hitbox_list_2[j];
        let hitbox_1, hitbox_2;
        if (temp1.left < temp2.left) {
          hitbox_1 = temp1;
          hitbox_2 = temp2;
        } else {
          hitbox_1 = temp2;
          hitbox_2 = temp1;
        }
        let x_overlap_exists = false;
        if (hitbox_2.left >= hitbox_1.left && hitbox_2.left <= hitbox_1.right) {
          x_overlap_exists = true;
        }
        if (temp1.top < temp2.top) {
          hitbox_1 = temp1;
          hitbox_2 = temp2;
        } else {
          hitbox_1 = temp2;
          hitbox_2 = temp1;
        }
        let y_overlap_exists = false;
        if (hitbox_2.top >= hitbox_1.top && hitbox_2.top <= hitbox_1.bottom) {
          y_overlap_exists = true;
        }

        if (x_overlap_exists && y_overlap_exists === true) {
          return true;
        }
      }
    }
    return false;
  }

  stop_frames() {
    clearInterval(this.frame_interval);
  }

  increment_time_variables() {
    this.seconds_elapsed += 1;
    this.increase_asteroids_counter += 1;
    this.increase_asteroid_hitpoints_counter += 1;
    this.upgrade_counter += 1;
    this.player_hp_regen_counter += 1;
    this.enemy_ships_increase_counter += 1;
    this.enemy_ship_hitpoints_increase_counter += 1;
    this.enemy_ship_bullet_speed_multiplier_increase_counter += 1;
    this.enemy_ship_bullets_per_valley_increase_counter += 1;
  }

  handle_player_ship_bullets_with_asteroids() {
    let local_player_ship_bullet_list = this.player_object.bullet_list;
    while (true) {
      let some_found = false;
      for (let i = 0; i < local_player_ship_bullet_list.length; i += 1) {
        let bullet = local_player_ship_bullet_list[i];
        for (let j = 0; j < this.asteroid_list.length; j += 1) {
          let current_asteroid = this.asteroid_list[j];

          let hitboxes_collide = this.hitboxes_collide(
            current_asteroid.hitboxes,
            bullet.hitboxes
          );

          if (hitboxes_collide === true) {
            current_asteroid.hitpoints -= bullet.damage;
            local_player_ship_bullet_list.splice(i, 1);

            if (current_asteroid.hitpoints <= 0) {
              play_explosion_sound_effect();
              this.score += this.points_per_asteroid * this.asteroid_hitpoints;
              some_found = true;
              this.asteroid_list.splice(j, 1);
              break;
            }
            else{
              play_player_hit_sound_effect();
            }
          }
        }
        if (some_found === true) {
          break;
        }
      }
      if (some_found === false) {
        break;
      }
    }
  }

  on_frame() {
    
    this.frame_number += 1;
    if (this.frame_number > frame_rate) {
      this.increment_time_variables();
      this.frame_number = 0;
    }

    ctx.clearRect(0, 0, this.canvas_width, this.canvas_height);

    this.player_object.on_frame(this.input_array, this.frame_number);
    this.attempt_enemy_ships_move();
    this.asteroid_list.forEach((asteroid) => {
      asteroid.on_frame();
    });
    this.enemy_ships_list.forEach((ship) => {
      ship.on_frame(this.frame_number);
    });
    this.handle_player_ship_collides_with_asteroids();
    this.handle_player_ship_bullets_with_asteroids();
    this.handle_player_bullets_with_enemy_bullets();
    this.handle_player_bullets_with_enemy_ships();
    this.handle_enemy_bullets_with_player_ship();
    this.dispose_asteroids();
    this.generate_enemy_ships();
    this.draw_menu(
      this.player_object.bullet_damage,
      this.player_object.fire_rate,
      this.player_object.bullets_per_valley,
      this.player_object.hitpoints,
      this.score,
      this.player_hp_regen_after
    );
    this.check_timed_events();

    
  }

  start_frame_interval() {
    let ms = round_to(1000 / frame_rate, 1);
    this.frame_interval = setInterval(this.on_frame, ms);
  }

  bind_keys() {
    window.onkeydown = (ev) => {

      let key = ev.key;
      play_loop_music();
      if (key === "w") {
        this.input_array[0] = 1;
      }
      if (key === "d") {
        this.input_array[1] = 1;
      }
      if (key === "s") {
        this.input_array[2] = 1;
      }
      if (key === "a") {
        this.input_array[3] = 1;
      }
      if (key === "space") {
        this.input_array[4] = 1;
      }
      
    };
    window.onkeyup = (ev) => {
      let key = ev.key;

      if (key === "w") {
        this.input_array[0] = 0;
      }
      if (key === "d") {
        this.input_array[1] = 0;
      }
      if (key === "s") {
        this.input_array[2] = 0;
      }
      if (key === "a") {
        this.input_array[3] = 0;
      }
      if (key === "space") {
        this.input_array[4] = 0;
      }
    };
  }
}

function handle_sound(){
  get_loop_enabled();
  if(loop_enabled === true){
    loop_option.src = "images/sound_enabled.png";
  }
  else{
    loop_option.src = "images/sound_disabled.png";
  }
  bind_loop_option();
  get_sfx_enabled();
  if(sfx_enabled === true){
    sfx_option.src = "images/sfx_enabled.png";
  }
  else{
    sfx_option.src = "images/sfx_disabled.png"
  }
  bind_sfx_option();
}

function main() {
  
  init_canvas();
  
  
  let game_field = new Game_field(canvas);
}
handle_sound();

main();
