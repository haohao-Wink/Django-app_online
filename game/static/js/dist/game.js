class AcGameMenu{
    constructor(root){
        this.root=root;
        this.$menu=$(`
<div class="ac-game-menu">
    <div class="ac-game-menu-field">
        <div class="ac-game-menu-field-item ac-game-menu-field-item-single-mode">
            单人模式
        </div>
        <br>
        <div class="ac-game-menu-field-item ac-game-menu-field-item-multi-mode">
            多人模式
        </div>
        <br>
        <div class="ac-game-menu-field-item ac-game-menu-field-item-settings">
            设置
        </div>
    </div>
</div>
`);
        this.root.$ac_game.append(this.$menu);
        this.$single_mode=this.$menu.find('.ac-game-menu-field-item-single-mode');
        this.$multi_mode=this.$menu.find('.ac-game-menu-field-item-multi-mode');
        this.$settings=this.$menu.find('.ac-game-menu-field-item-settings');

        this.start();
    }
    start(){
        this.add_listening_events();
    }
    add_listening_events(){
        let outer=this;
        this.$single_mode.click(function(){
            outer.hide();
            outer.root.playground.show();
        });
        this.$multi_mode.click(function(){
            console.log("click multi mode");
        });
        this.$settings.click(function(){
            console.log("click settings");
        });
    }

    //显示menu界面
    show(){
        this.$menu.show();
    }
    //关闭menu界面
    hide(){
        this.$menu.hide();
    }
}

//定义全局数组，每秒钟进行调用，实现帧数
let AC_GAME_OBJECTS =[];

//定义游戏引擎
class AcGameObject{
    constructor(){
        AC_GAME_OBJECTS.push(this);

        //标记物体,使得每个物体只执行一次start函数
        this.has_called_start=false;

        //两帧之间的时间间隔,单位是ms
        this.timedelta = 0;
    }

    //开始函数，第一帧执行一次
    start(){}

    //每一帧均执行
    update(){}

    //在被销毁前执行一次
    on_destroy(){
    }

    //删除
    destroy(){

        this.on_destroy();
        for(let i=0;i<AC_GAME_OBJECTS.length;i++){
            if(AC_GAME_OBJECTS[i]===this){
                AC_GAME_OBJECTS.splice(i,1);
                break;
            }
        }
    }

}



//记录上一帧的时间间隔
let last_timestamp;

let AC_GAME_ANIMATION=function(timestamp){

    //遍历所有物品
    for(let i=0;i<AC_GAME_OBJECTS.length;i++){

        let obj =AC_GAME_OBJECTS[i];
        if(!obj.has_called_start){
            obj.start();
            obj.has_called_start=true;
        }else{
            obj.timedelta=timestamp-last_timestamp;
            obj.update();
        }
    }

    //每一帧执行完成后更新上一帧的时间
    last_timestamp=timestamp;

    //每一帧都调用，使用递归函数
    requestAnimationFrame(AC_GAME_ANIMATION);
}

//一秒钟分成60份，在下一次事件触发时执行
requestAnimationFrame(AC_GAME_ANIMATION);





class GameMap extends AcGameObject {
    constructor(playground) {
        super();
        this.playground = playground;
        this.$canvas = $(`<canvas></canvas>`);
        this.ctx = this.$canvas[0].getContext('2d');
        this.ctx.canvas.width = this.playground.width;
        this.ctx.canvas.height = this.playground.height;
        this.playground.$playground.append(this.$canvas);
    }

    start() {
    }

    update() {
        this.render();
    }

    render() {
        //0.2为渐变度
        this.ctx.fillStyle = "rgba(0, 0, 0,0.2)";
        this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    }
}

class Particle extends AcGameObject(){
    constructor(playground,x,y,radius,vx,vy,color,speed,move_lenght){
        super();
        this.playground=playground;
        this.ctx=this.playground.game_map.ctx;
        this.x=x;
        this.y=y;
        this.radius=radius;
        this.vx=vx;
        this.vy=vy;
        this.color=color;
        this.speed=speed;
        this.move_length=move_length;
        this.friction=0.9;
        this.eps=1;
    }

    start(){}

    update(){

        //判断死亡
        if(this.move_legth<this.eps || this.speed<this.eps){
            this.destroy();
            return false;
        }

        let moved =Math.min(this.move_length,this.speed*this.timedelta/1000);
        this.x+=this.vx*moved;
        this.y+=this.vy*moved;
        this.speed*=this.friction;
        this.move_length-=moved;
        this.render();
    }

    render(){
        this.ctx.beginPath();
        this.ctx.arc(this.x,this.y,tis.radius,0,Math.PI*2,false);
        this.ctx.fillStyle=this.color;
        this.ctx.fill();
    }
}
class Player extends AcGameObject{
    constructor(playground,x,y,radius,color,speed,is_me){
        super();
        this.playground=playground;
        this.ctx=this.playground.game_map.ctx;
        this.x=x;
        this.y=y;

        //速度
        this.vx=0;
        this.vy=0;

        //被攻击后
        this.damage_x=0;
        this.damage_y=0;

        this.move_length=0;

        this.radius=radius;
        this.color=color;
        this.speed=speed;
        this.is_me=is_me;
        this.eps=0.1;

        this.friction=0.9;
        this.spent_time=0;
        this.cur_skill=null;
    }

    start(){
        if(this.is_me){
            this.add_listening_events();
        }else{
            let tx=Math.random()*this.playground.width;
            let ty=Math.random()*this.playground.height;
            this.move_to(tx,ty);
        }   
    }

    add_listening_events(){

        let outer=this;
        //防止右键打开菜单
        this.playground.game_map.$canvas.on("contextmenu",function(){
            return false;
        });

        //鼠标控制右键
        this.playground.game_map.$canvas.mousedown(function(e){

            //左键1，滚轮2，右键3
            if(e.which===3){
                outer.move_to(e.clientX,e.clientY);
            }else if(e.which===1){
                if(outer.cur_skill === "firevall"){
                    outer.shoot_fireball(e.clientX,e.clientY);
                }
                outer.cur_skill=null;
            }
        });


        //设置火球技能，查表找出键盘和数字的替代关系
        $(window).keydown(function(e){
            if(e.which===81){
                outer.cur_skill="fireball";
                return false;
            }
        });
    }

    //发射火球
    shoot_firaball(tx,ty){
        let x=this.x;
        let y=this.y;
        let radius=radius;
        i
    }

    //求两点之间的距离
    get_dist(x1,y1,x2,y2){
        let dx=x1-x2;
        let dy=y1-y2;
        return Math.sqrt(dx*dx+dy*dy);

    }

    move_to(tx,ty){

        this.move_length=this.get_dist(this.x,this.y,tx,ty);

        //atan2(y,x)求坐标角度
        let angle=Math.atan2(ty-this.y,tx-this.x);

        this.vx=Math.cos(angle);
        this.vy=Math.sin(angle);
    }

    update(){

        if(this.move_length <this.eps){
            this.move_length=0;
            this.vx=this.vy=0;
        }else{
            //真实移动距离
            let moved=Math.min(this.move_length,this.speed * timedelta / 1000);
            this.x+=this.vx+moved;
            this.y+=this.vy+moved;
        }

        this.render();

    }

    render(){
        this.ctx.beginPath();
        this.ctx.arc(this.x,this.y,this.radius,0,Math.PI*2,false);
        this.ctx.fillStyle=this.color;
        this.ctx.fill();
    }

}

class AcGamePlayground{
    constructor(root){
        this.root=root;
        this.$playground=$(`<div class="ac-game-playground"></div>`);
        //this.hide();
        this.root.$ac_game.append(this.$playground);

      

        this.width = this.$playground.width();
        this.height = this.$playground.height();


        this.game_map=new GameMap(this);
        this.players=[];
        this.players.push(new Player(this,this.width/2,this.height/2,this.height*0.05,"white",this.height*0.15,true));
        this.start();
    }

    start(){}
    //打开playground界面
    update(){}
    show(){
        this.$playground.show();
    }
    //关闭playground界面
    hide(){
        this.$playground.hide();
    }
}

export class AcGame {
    constructor(id) {
        this.id = id;
        this.$ac_game = $('#' + id);
        //this.menu = new AcGameMenu(this);
        this.playground = new AcGamePlayground(this);

        this.start();
    }

    start() {
    }
}


