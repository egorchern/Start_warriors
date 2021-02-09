let root = document.querySelector("#root");
let ship_height = 30;
let frame_rate = 60;

function round_to(n, digits) {
    if (digits === undefined) {
      digits = 0;
    }
  
    var multiplicator = Math.pow(10, digits);
    n = parseFloat((n * multiplicator).toFixed(11));
    return Math.round(n) / multiplicator;
  }

function init_canvas(){
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


class Ship{
    constructor(ctx, center_x, center_y, fill_color){
        this.ctx = ctx;
        this.center_x = center_x;
        this.center_y = center_y;
        this.ship_height = ship_height;
        this.ship_width = 30;
        this.fill_color = fill_color;
    }
    set_coordinates(center_x, center_y){
        this.center_x = center_x;
        this.center_y = center_y;
    }
    draw(){
        this.ctx.save();
        this.ctx.fillStyle = this.fill_color;
        this.ctx.fillRect(this.center_x - this.ship_width / 2, this.center_y - this.ship_height / 2, this.ship_width, this.ship_height);
    }
}



class Game_field{
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");
        this.frame_interval;
        this.player_object = new Ship(this.ctx, this.canvas.width / 2, this.canvas.height - ship_height - 10);
        this.bind_mouse_move_on_canvas();
        this.start_frame_interval();
    }
    draw = () => {
        
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.player_object.draw();
    }
    start_frame_interval = () => {
        let ms = round_to(1000 / frame_rate, 1);
        this.frame_interval = setInterval(this.draw, ms);
    }
    bind_mouse_move_on_canvas = () => {
        this.canvas.onmousemove = (ev) => {
            let position = getMousePos(ev, this.canvas);
            this.player_object.set_coordinates(position.x, position.y);
        };
    }
}



function main(){
    init_canvas();
    let canvas = document.querySelector("#canvas");
    let game_field = new Game_field(canvas);
}
main();