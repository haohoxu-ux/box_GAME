"use strict";

const Sokoban = (() => {
  // 空格是室内地板，短横线是不可通行的室外草地。
  const levels = [
    ["初入仓库", [
      "--#####--",
      "###   ###",
      "#   .   #",
      "# $   $ #",
      "#   @ . #",
      "###   ###",
      "--#####--"
    ]],
    ["并排入库", [
      "-#######-",
      "-#  .  #-",
      "##  $  ##",
      "# . $ @ #",
      "#   #   #",
      "##     ##",
      "-#######-"
    ]],
    ["转角货架", [
      "-######--",
      "-# .  ###",
      "## # $  #",
      "#  $ @  #",
      "#  #  . #",
      "###    ##",
      "--######-"
    ]],
    ["三箱同行", [
      "-#######-",
      "## . . ##",
      "#   #   #",
      "# $ $ $ #",
      "#   @ . #",
      "##     ##",
      "-#######-"
    ]],
    ["窄巷调度", [
      "########-",
      "#  .   ##",
      "# $$ #  #",
      "#  @  . #",
      "## # $  #",
      "-# .   ##",
      "-#######-"
    ]],
    ["最后一班", [
      "-#######-",
      "## .   ##",
      "# $ # . #",
      "#  $ $  #",
      "#. # @  #",
      "##     ##",
      "-#######-"
    ]]
  ];
  const directions = {left:[-1,0], right:[1,0], up:[0,-1], down:[0,1]};

  function start(index) {
    const [name, rows] = levels[index];
    const width = rows[0].length;
    const floor = new Set(), targets = new Set(), boxes = new Set();
    let player;
    rows.forEach((row, y) => [...row].forEach((cell, x) => {
      const pos = y * width + x;
      if (cell === "#" || cell === "-") return;
      floor.add(pos);
      if (cell === ".") targets.add(pos);
      if (cell === "$") boxes.add(pos);
      if (cell === "@") player = pos;
    }));
    return {name, rows, width, floor, targets, boxes, player, history:[]};
  }

  function placed(state) {
    return [...state.boxes].filter(pos => state.targets.has(pos)).length;
  }

  function move(state, dir) {
    const [dx,dy] = directions[dir];
    const delta = dx + dy * state.width;
    const to = state.player + delta, beyond = to + delta;
    if (!state.floor.has(to)) return false;
    const push = state.boxes.has(to);
    if (push && (!state.floor.has(beyond) || state.boxes.has(beyond))) return false;
    state.history.push({from:state.player, boxFrom:push ? to : null, boxTo:beyond});
    if (push) {
      state.boxes.delete(to);
      state.boxes.add(beyond);
    }
    state.player = to;
    return true;
  }

  function undo(state) {
    const step = state.history.pop();
    if (!step) return false;
    state.player = step.from;
    if (step.boxFrom !== null) {
      state.boxes.delete(step.boxTo);
      state.boxes.add(step.boxFrom);
    }
    return true;
  }
  return {levels, start, placed, move, undo};
})();
