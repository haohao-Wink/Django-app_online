
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

