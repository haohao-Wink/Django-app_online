
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



