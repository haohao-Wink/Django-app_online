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
