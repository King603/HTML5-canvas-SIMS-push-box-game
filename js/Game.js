import gonglue from "./gonglue.js";
import levels from "./mapdata100.js";
import Point from "./Point.js";
export default class Game {
  constructor() {
    this.can = document.getElementById("canvas");
    this.msg = document.getElementById("msg");
    this.cxt = this.can.getContext("2d");
    this.img = new Image();
    this.img.src = "../images/block.gif";
    ({ width: this.w, height: this.h } = this.img);
    this.can.width = this.can.height = this.w * levels[0].length;
    this.curMap; //当前的地图
    this.curLevel; //当前等级的地图
    this.curMan; //初始化小人
    this.iCurlevel = 0; //关卡数
    this.moveTimes = 0; //移动了多少次
    (this.levs = document.querySelector("input")).valueAsNumber = 1;
    this.btns = document.querySelectorAll("button");
    // 跳转关卡
    this.btns[0].onclick = () => this.NextLevel(-1);
    this.btns[1].onclick = () => this.jump();
    this.btns[2].onclick = () => this.NextLevel(1);
    this.btns[3].onclick = () => this.NextLevel(0);
    // 游戏说明
    let isShowHelp = !1;
    this.btns[4].onclick = () => (isShowHelp = !isShowHelp)
      ? this.msg.innerHTML += "<br>用键盘上的上、下、左、右键移动小人，把箱子全部推到小球的位置即可过关。箱子只可向前推，不能往后拉，并且小人一次只能推动一个箱子。"
      : this.showMoveInfo();
    // 查看攻略
    let isgl = !1;
    this.gl = document.getElementById("gl");
    this.btns[5].onclick = () => this.gl.innerHTML = (isgl = !isgl) ? `本关卡最简攻略为：${gonglue[this.iCurlevel] || "进一步完善中"}` : "";
    this.imagesObj = {
      block: "images/block.gif",
      wall: "images/wall.png",
      box: "images/box.png",
      ball: "images/ball.png",
      up: "images/up.png",
      down: "images/down.png",
      left: "images/left.png",
      right: "images/right.png",
    };
    this.onloadImg(this.imagesObj, images => {
      this.block = images.block;
      this.wall = images.wall;
      this.box = images.box;
      this.ball = images.ball;
      this.up = images.up;
      this.down = images.down;
      this.left = images.left;
      this.right = images.right;
      this.init();
    });
    this.perPosition = new Point(); //小人的初始标值
    // 与键盘上的上下左右键关联
    window.onkeydown = event => {
      switch (event.keyCode) {
        case 37: // 左键头
          this.go("left");
          break;
        case 38: // 上键头
          this.go("up");
          break;
        case 39: // 右箭头
          this.go("right");
          break;
        case 40: // 下箭头
          this.go("down");
          break;
        case 13:
          this.jump();
          break;
      }
    };
  }
  onloadImg(srcs, callback) {
    let count = 0, imgNum = 0, images = {};
    for (let src in srcs)
      imgNum++;
    for (let src in srcs) {
      images[src] = new Image();
      images[src].onload = () => ++count >= imgNum && callback(images); //判断是否所有的图片都预加载完成
      images[src].src = srcs[src];
    }
  }
  jump() {
    (i => {
      if (i < 1 || i > levels.length) {
        alert("选择错误");
        this.levs.valueAsNumber = this.iCurlevel + 1;
        return;
      }
      this.iCurlevel = i - 1;
      this.moveTimes = 0; // 游戏关卡移动步数清零
      this.init();
      this.gl.innerHTML = "";
    })(this.levs.valueAsNumber);
  }
  //初始化游戏
  init() {
    //InitMap();
    //DrawMap(levels[0]);
    (arr => {
      this.curMap = (arr => {
        let b = []; // 每次移动更新地图数据都先清空再添加新的地图
        for (let i = 0; i < arr.length; i++)
          b[i] = arr[i].concat(); // 链接两个数组
        return b;
      })(arr); // 当前移动过的游戏地图
      this.curLevel = arr; // 当前等级的初始地图
      this.curMan = this.down; // 初始化小人
      // 初始化界面
      this.map(this.curMap);
    })(levels[this.iCurlevel]); //初始化对应等级的游戏
    this.showMoveInfo(); //初始化对应等级的游戏数据
  }
  map(levels) {
    //绘制地板
    for (let y = 0; y < levels.length; y++)
      for (let x = 0; x < levels[0].length; x++)
        this.cxt.drawImage(this.block, this.w * x, this.h * y, this.w, this.h);
    //绘制每个游戏关卡地图
    for (let y = 0; y < levels.length; y++) {
      for (let x = 0; x < levels[y].length; x++) {
        let pic = this.block; //初始图片
        switch (levels[y][x]) {
          case 1:
            pic = this.wall;
            break; //绘制墙壁
          case 2:
            pic = this.ball;
            break; //绘制陷进
          case 3:
            pic = this.box;
            break; //绘制箱子
          case 5:
            pic = this.box;
            break; //绘制箱子及陷进位置
          case 4: //绘制小人
            pic = this.curMan; //小人有四个方向 具体显示哪个图片需要和上下左右方位值关联
            //获取小人的坐标位置
            this.perPosition.x = y;
            this.perPosition.y = x;
        }
        //每个图片不一样宽 需要在对应地板的中心绘制地图
        this.cxt.drawImage(pic, this.w * x - (pic.width - this.w) / 2, this.h * y - (pic.height - this.h), pic.width, pic.height);
      }
    }
  }
  //下一关
  NextLevel(i) {
    //iCurlevel当前的地图关数
    this.iCurlevel += i;
    if (this.iCurlevel < 0) {
      this.iCurlevel = 0;
      return;
    }
    this.iCurlevel = Math.min(this.iCurlevel, levels.length - 1);
    this.moveTimes = 0; //游戏关卡移动步数清零
    this.init();
    this.levs.valueAsNumber = this.iCurlevel + 1;
  }
  //小人移动
  go(dir) {
    let p = [];
    let { x, y } = this.perPosition;
    switch (dir) { //获取小人前面的两个坐标位置来进行判断小人是否能够移动
      case "up":
        this.curMan = this.up;
        for (let i = 0; i < 2; p[i] = new Point(x - ++i, y))
          ;
        break;
      case "down":
        this.curMan = this.down;
        for (let i = 0; i < 2; p[i] = new Point(x + ++i, y))
          ;
        break;
      case "left":
        this.curMan = this.left;
        for (let i = 0; i < 2; p[i] = new Point(x, y - ++i))
          ;
        break;
      case "right":
        this.curMan = this.right;
        for (let i = 0; i < 2; p[i] = new Point(x, y + ++i))
          ;
        break;
    }
    // 如果小人能够移动的话，更新游戏数据，并重绘地图
    if (((p1, p2) => {
      if (p1.x < 0)
        return !1; // 如果超出地图的上边，不通过
      if (p1.y < 0)
        return !1; // 如果超出地图的左边，不通过
      if (p1.x > this.curMap.length)
        return !1; // 如果超出地图的下边，不通过
      if (p1.y > this.curMap[0].length)
        return !1; // 如果超出地图的右边，不通过
      switch (this.curMap[p1.x][p1.y]) {
        case 1: return !1; // 如果前面是墙，不通过
        case 3:
        case 5:
          switch (this.curMap[p2.x][p2.y]) { // 如果小人前面是箱子那就还需要判断箱子前面有没有障碍物(箱子/墙)
            case 1:
            case 3: return !1;
          }
          // 如果判断不成功小人前面的箱子前进一步
          this.curMap[p2.x][p2.y] = 3; //更改地图对应坐标点的值
        //console.log(curMap[p2.x][p2.y]);
      }
      this.curMap[p1.x][p1.y] = 4; //更改地图对应坐标点的值
      // 如果小人前进了一步，小人原来的位置如何显示
      let v = this.curLevel[x][y];
      // 如果刚开始小人位置不是陷进的话
      v != 2 &&
        //可能是5 既有箱子又陷进
        (v = v == 5 ? 2 /* 如果小人本身就在陷进里面的话移开之后还是显示陷进 */ : 0 /* 小人移开之后之前小人的位置改为地板 */);
      //重置小人位置的地图参数
      this.curMap[x][y] = v;
      // 如果判断小人前进了一步，更新坐标值
      this.perPosition = p1;
      // 如果小动了 返回!0 指代能够移动小人
      return !0;
    })(...p)) {
      this.moveTimes++;
      this.showMoveInfo();
    }
    //重绘界面
    this.map(this.curMap);
    // 如果移动完成了进入下一关
    if ((() => {
      for (let i = 0; i < this.curMap.length; i++) {
        for (let j = 0; j < this.curMap[i].length; j++) {
          //当前移动过的地图和初始地图进行比较， 如果初始地图上的陷进参数在移动之后不是箱子的话就指代没推成功
          switch (this.curLevel[i][j]) {
            case 2:
            case 5: if (this.curMap[i][j] != 3)
              return !1;
          }
        }
      }
      return !0;
    })()) {
      alert("恭喜过关！！");
      this.NextLevel(1);
    }
  }
  // 完善关卡数据及游戏说明
  showMoveInfo() {
    this.msg.innerHTML = `第${this.iCurlevel + 1}关 移动次数: ${this.moveTimes}`;
  }
}
