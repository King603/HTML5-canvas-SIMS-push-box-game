import Game from "./Game.js";

// 页面加载完后刷新
setTimeout('(() => location.href.indexOf("?reload=!0") < 0 && (location.href += "?reload=!0"))()', 50);

console.clear();

new Game();
