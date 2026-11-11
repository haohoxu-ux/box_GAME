"use strict";

(() => {
  const el = id => document.getElementById(id);
  const board = el("board"), selector = el("level");
  const keyFor = i => "boxyard.best.v1." + i;
  const scores = Sokoban.levels.map((_,i) => {
    try {
      const score = Number(localStorage.getItem(keyFor(i)));
      return Number.isSafeInteger(score) && score > 0 ? score : null;
    } catch { return null; }
  });
  let index = 0, state, facing, finished;

  function number(i) { return String(i+1).padStart(2,"0"); }
  function updateMenu() {
    Sokoban.levels.forEach(([name],i) => {
      const option = selector.options[i] || selector.appendChild(document.createElement("option"));
      option.value = String(i);
      option.textContent = number(i) + " · " + name + (scores[i] ? " ✓" : "");
    });
    selector.value = String(index);
  }
  function render() {
    drawBoard(board,state,facing);
    el("steps").textContent = state.history.length;
    el("placed").textContent = Sokoban.placed(state);
    el("total").textContent = " / " + state.targets.size;
    el("best").textContent = scores[index] ? scores[index] + " 步" : "—";
    el("undo").disabled = !state.history.length;
    el("win").hidden = !finished;
    document.querySelectorAll("[data-dir]").forEach(btn => btn.disabled = finished);
  }
  function start(i) {
    index = i;
    state = Sokoban.start(i);
    facing = "right";
    finished = false;
    updateMenu();
    el("title").textContent = state.name;
    el("board-label").textContent = "仓库 " + number(i);
    el("announce").textContent = "开始第 " + (i+1) + " 关，" + state.name;
    render();
  }
  function move(dir) {
    if (finished || !Sokoban.move(state,dir)) return;
    if (dir === "left" || dir === "right") facing = dir;
    finished = Sokoban.placed(state) === state.targets.size;
    if (finished) {
      const steps = state.history.length;
      if (!scores[index] || steps < scores[index]) {
        scores[index] = steps;
        try { localStorage.setItem(keyFor(index),String(steps)); } catch { /* Keep the session score. */ }
      }
      updateMenu();
      el("result").textContent = "用 " + steps + " 步完成了搬运。";
      el("next").textContent = index+1 < Sokoban.levels.length ? "进入下一关 →" : "回到第一关";
      el("announce").textContent = "通关成功！" + el("result").textContent;
    }
    render();
    if (finished) el("next").focus({preventScroll:true});
  }
  function undo() {
    if (!Sokoban.undo(state)) return;
    finished = false;
    el("announce").textContent = "已撤销到第 " + state.history.length + " 步";
    render();
    board.focus({preventScroll:true});
  }
  function play(i) { start(i); board.focus({preventScroll:true}); }
  selector.addEventListener("change",() => play(Number(selector.value)));
  el("undo").addEventListener("click",undo);
  el("restart").addEventListener("click",() => play(index));
  el("again").addEventListener("click",() => play(index));
  el("next").addEventListener("click",() => play((index+1) % Sokoban.levels.length));
  document.querySelectorAll("[data-dir]").forEach(btn => btn.addEventListener("click",() => move(btn.dataset.dir)));
  const keys = {arrowup:"up",w:"up",arrowdown:"down",s:"down",arrowleft:"left",a:"left",arrowright:"right",d:"right"};
  document.addEventListener("keydown",event => {
    if (event.target === selector || event.altKey || event.ctrlKey || event.metaKey || event.isComposing) return;
    const key = event.key.toLowerCase();
    if (Object.hasOwn(keys,key)) {
      event.preventDefault();
      move(keys[key]);
    } else if (key === "z" || key === "r") {
      event.preventDefault();
      if (event.repeat) return;
      if (key === "z") undo();
      else play(index);
    }
  });
  start(0);
})();
