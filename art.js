"use strict";

// Paint the reef once and reuse it behind every level and around the page.
function paintReef() {
  const reef = document.createElement("canvas");
  reef.width = 352;
  reef.height = 256;
  const ctx = reef.getContext("2d");
  const water = ctx.createLinearGradient(0, 0, 0, reef.height);
  water.addColorStop(0, "#65d8d2");
  water.addColorStop(0.34, "#268fac");
  water.addColorStop(0.78, "#165777");
  water.addColorStop(1, "#123952");
  ctx.fillStyle = water;
  ctx.fillRect(0, 0, reef.width, reef.height);

  function pixel(x, y, w, h, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, h);
  }
  // Stepped beams preserve the pixel edges of the board artwork.
  for (const [start, width] of [[24, 13], [52, 4], [146, 28], [252, 11], [278, 4], [346, 20]]) {
    for (let y = 0; y < 160; y += 2) {
      ctx.globalAlpha = 0.16 * (1 - y / 160);
      pixel(start - Math.floor(y / 3), y, width + Math.floor(y / 12), 2, "#dcfff0");
    }
  }
  ctx.globalAlpha = 1;
  for (let x = 0; x < reef.width; x += 3) {
    const ridge = Math.round(187 + 9 * Math.sin(x / 19) + 7 * Math.sin(x / 8));
    pixel(x, ridge, 3, reef.height - ridge, "#28657b");
    const sand = Math.round(232 + 5 * Math.sin(x / 34));
    pixel(x, sand, 3, reef.height - sand, "#639fa3");
    pixel(x, sand, 3, 2, "#8fbeb4");
    pixel(x, sand + 9 + (x % 7), 2, 1, "#97c4b8");
  }

  function sprite(rows, palette, x, y, scale = 1, mirror = false) {
    rows.forEach((row, j) => [...row].forEach((ch, i) => {
      if (palette[ch]) pixel(x + (mirror ? row.length - 1 - i : i) * scale,
        y + j * scale, scale, scale, palette[ch]);
    }));
  }
  const coral = [
    "       h     ", "   h   hh    ", "   hc   c  h ", " h cc  hc  hc",
    " cc cc cc  cc", "  cc c cc cc ", "   ccc cccc  ", "     cccc    ",
    " h    cc     ", " hc  ccc     ", "  cccccc     ", "     cdc     ",
    "     cdd     ", "    cddd     "
  ];
  const kelp = [
    "    l   ", "   ll   ", "   ld  l", " l dd ll", " ll d ld",
    " dl d ld", "  dldld ", "   ddd  ", " l dd   ", " ld d   ",
    "  ddd   ", "   dd   ", "   dd   "
  ];
  const fronds = {l:"#55c6a8", d:"#237e79"};
  const branches = {h:"#ffc89c", c:"#e98b78", d:"#a95767"};
  sprite(kelp, fronds, 1, 189, 3);
  sprite(coral, branches, 8, 198, 3);
  sprite(kelp, fronds, 321, 178, 4, true);
  sprite(coral, branches, 308, 215, 2, true);
  sprite(kelp, fronds, 66, 222, 2);

  const fish = ["    fff   ", "f  aaaff  ", "ffaaaeaff ", "f  aaaaf  ", "    ff    "];
  const scales = {f:"#de865b", a:"#ffd18d", e:"#244959"};
  for (const [x, y, flip] of [[13, 40, false], [28, 32, false], [39, 42, false],
    [322, 59, true], [335, 67, true]]) sprite(fish, scales, x, y, 1, flip);
  for (const [x, y, r] of [[18, 170, 3], [24, 153, 2], [19, 143, 1],
    [334, 158, 3], [327, 141, 2], [331, 129, 1], [85, 22, 2], [89, 15, 1]]) {
    pixel(x, y - r, r, 1, "#c6eee1");
    pixel(x - 1, y - r + 1, 1, r, "#c6eee1");
    pixel(x, y + 1, r, 1, "#75bfbf");
    pixel(x + r, y - r + 1, 1, r, "#75bfbf");
  }
  return reef;
}

const reefBackdrop = paintReef();
document.documentElement.style.setProperty("--reef", 'url("' + reefBackdrop.toDataURL() + '")');

// Draw at a fixed low resolution so the tile artwork keeps its pixel edges.
function drawBoard(canvas, state, facing) {
  const ctx = canvas.getContext("2d");
  const tile = 32, ox = 32, oy = 15;
  const rect = (x,y,w,h,color) => {ctx.fillStyle = color; ctx.fillRect(x,y,w,h);};
  function line(x1,y1,x2,y2,color,size=2) {
    const n = Math.max(Math.abs(x2-x1),Math.abs(y2-y1),1);
    for (let i=0;i<=n;i++) rect(Math.round(x1+(x2-x1)*i/n),Math.round(y1+(y2-y1)*i/n),size,size,color);
  }
  const rand = (x,y) => ((Math.imul(x+23,73856093)^Math.imul(y+17,19349663))>>>0);
  ctx.drawImage(reefBackdrop, 0, 0);
  function wall(x,y,seed) {
    rect(x,y,32,32,"#465b49");rect(x+1,y+1,30,22,"#a6ae91");
    rect(x+2,y+2,28,2,"#c7cbb0");rect(x+2,y+5,27,2,"#b5bda0");
    rect(x+2,y+20,28,2,"#899779");rect(x,y+23,32,2,"#62755d");
    rect(x+1,y+25,30,5,"#7d8d70");rect(x+3,y+25,12,1,"#a4ae8e");
    rect(x+15,y+25,2,5,"#60745d");
    if(seed%3===0){rect(x+20,y+9,4,2,"#98a286");rect(x+23,y+7,2,2,"#98a286");}
  }
  function crate(x,y,done) {
    const edge=done?"#415e39":"#654c33", dark=done?"#719052":"#b47d42";
    const face=done?"#9ebd6b":"#d9a45e", light=done?"#c1d990":"#f5cd88";
    rect(x+2,y+5,28,26,"#9d9675");rect(x+2,y+1,28,28,edge);
    rect(x+4,y+3,24,23,face);rect(x+5,y+4,22,2,light);
    rect(x+5,y+7,2,17,light);rect(x+25,y+6,2,19,dark);
    for(const i of [11,18]) rect(x+i,y+7,1,16,dark);
    line(x+7,y+7,x+22,y+22,dark,3);line(x+7,y+22,x+22,y+7,edge,3);
    line(x+7,y+21,x+22,y+6,light,3);rect(x+4,y+25,24,2,dark);
    for(const i of [5,25]) for(const j of [4,23]) rect(x+i,y+j,1,1,edge);
    if(done){rect(x+11,y+10,11,10,"#496d43");line(x+13,y+14,x+15,y+16,"#edf4cd");line(x+15,y+16,x+19,y+12,"#edf4cd");}
  }
  function worker(x,y) {
    // Hand-pixelled porter with a vermilion cap and indigo overalls.
    const sprite=[
      "     ooooo    ","    orrrrrr   ","   orhhhrrro  ","   orrrrrrrro ","  ooooooooorr ",
      "   obsssssso  ","   obssoosso  ","    osssssso  ","     otttto   ","   ooceeeccoo ",
      "  osocceeccoso","  ossobbbbooso","   oobbbbbboo ","     obbboo   ","    obboobbo  ","   oddo  oddo "
    ];
    const palette={o:"#374638",r:"#c65d47",h:"#e98a61",b:"#53757a",s:"#edbb87",t:"#c99469",c:"#eee2b5",e:"#c8b783",d:"#695441"};
    rect(x+5,y+28,23,3,"#a69e7e");
    sprite.forEach((row,j)=>[...row].forEach((c,i)=>{if(palette[c])rect(x+2+(facing==="left"?13-i:i)*2,y-2+j*2,2,2,palette[c]);}));
  }
  for(let j=0;j<state.rows.length;j++)for(let i=0;i<state.width;i++){
    if(state.rows[j][i]!=="-")rect(ox+i*tile+3,oy+j*tile+5,tile,tile,"#164b61");
  }
  state.rows.forEach((row,j)=>[...row].forEach((c,i)=>{
    const x=ox+i*tile,y=oy+j*tile,pos=j*state.width+i,seed=rand(i,j);
    if(c==="-")return;
    if(c==="#"){wall(x,y,seed);return;}
    rect(x,y,tile,tile,"#b8b397");rect(x+1,y+1,30,30,seed%2?"#dcd5b6":"#e2dbbf");rect(x+2,y+2,28,1,"#ebe4c8");
    rect(x+4+seed%18,y+11+seed%12,3,1,"#c9c2a4");
    if(state.targets.has(pos)){
      rect(x+6,y+6,20,20,"#c6ce9f");
      for(const a of [6,20])for(const b of [6,20]){
        rect(x+a,y+b+(b===20?4:0),6,2,"#698351");rect(x+a+(a===20?4:0),y+b,2,6,"#698351");
      }
      rect(x+14,y+14,4,4,"#83985e");
    }
    if(state.boxes.has(pos))crate(x,y,state.targets.has(pos));
    if(state.player===pos)worker(x,y);
  }));
}
