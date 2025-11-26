
let srcImg = null;

const fileInput = document.getElementById("fileInput");
const sourceCanvas = document.getElementById("sourceCanvas");
const resultCanvas = document.getElementById("resultCanvas");
const histCanvas = document.getElementById("histCanvas");

const runBtn = document.getElementById("runBtn");
const resetBtn = document.getElementById("resetBtn");
const downloadBtn = document.getElementById("downloadBtn");

const contrastBtn = document.getElementById("contrastBtn");

const methodRadios = document.getElementsByName("method");
const contrastRadios = document.getElementsByName("contrast-method");

const paramBlocks = {
  canny: document.getElementById("param-canny"),
  sobel: document.getElementById("param-sobel"),
  hough: document.getElementById("param-hough"),
  harris: document.getElementById("param-harris"),
};

const paramLinear = document.getElementById("param-linear");


function showParamsFor(method) {
  Object.keys(paramBlocks).forEach(k => {
    paramBlocks[k].classList.toggle("hidden", k !== method);
  });
}

function getSelectedMethod() {
  for (const r of methodRadios) if (r.checked) return r.value;
}

function getContrastMethod() {
  for (const r of contrastRadios) if (r.checked) return r.value;
}


fileInput.addEventListener("change", async e => {
  if (!e.target.files.length) return;
  const img = await createImageBitmapFromFile(e.target.files[0]);
  drawSource(img);
});

document.querySelectorAll(".preset").forEach(btn => {
  btn.addEventListener("click", async () => {
    const img = await loadImageFromSrc(btn.dataset.src);
    drawSource(img);
  });
});

function drawSource(img) {
  srcImg = img;
  fitCanvasToImage(sourceCanvas, img);
  fitCanvasToImage(resultCanvas, img);

  sourceCanvas.getContext("2d").drawImage(img, 0, 0);
  resultCanvas.getContext("2d").clearRect(0, 0, resultCanvas.width, resultCanvas.height);

  const ctx = histCanvas.getContext("2d");
  ctx.clearRect(0, 0, histCanvas.width, histCanvas.height);
}


function onOpenCvReady() {
  console.log("OpenCV.js loaded");
}


runBtn.addEventListener("click", () => {
  if (!srcImg) return alert("Нет изображения");

  const method = getSelectedMethod();

  const src = cv.imread(sourceCanvas);
  let gray = new cv.Mat();
  cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);

  if (method === "canny") runCanny(gray);
  if (method === "sobel") runSobel(gray);
  if (method === "hough") runHough(gray);
  if (method === "harris") runHarris(gray);

  src.delete();
  gray.delete();
});

function runCanny(gray) {
  let t1 = +document.getElementById("canny-th1").value;
  let t2 = +document.getElementById("canny-th2").value;

  let edges = new cv.Mat();
  cv.Canny(gray, edges, t1, t2);
  cv.imshow(resultCanvas, edges);
  edges.delete();
}

function runSobel(gray) {
  let scale = +document.getElementById("sobel-scale").value;

  let gx = new cv.Mat(), gy = new cv.Mat();
  cv.Sobel(gray, gx, cv.CV_16S, 1, 0, 3, scale);
  cv.Sobel(gray, gy, cv.CV_16S, 0, 1, 3, scale);

  let agx = new cv.Mat(), agy = new cv.Mat();
  cv.convertScaleAbs(gx, agx);
  cv.convertScaleAbs(gy, agy);

  let out = new cv.Mat();
  cv.addWeighted(agx, 0.5, agy, 0.5, 0, out);
  cv.imshow(resultCanvas, out);

  gx.delete(); gy.delete();
  agx.delete(); agy.delete();
  out.delete();
}

function runHough(gray) {
  let th = +document.getElementById("hough-threshold").value;
  let minLen = +document.getElementById("hough-minlen").value;
  let maxGap = +document.getElementById("hough-gap").value;

  let edges = new cv.Mat();
  cv.Canny(gray, edges, 50, 150);

  let lines = new cv.Mat();
  cv.HoughLinesP(edges, lines, 1, Math.PI/180, th, minLen, maxGap);

  let color = new cv.Mat();
  cv.cvtColor(gray, color, cv.COLOR_GRAY2RGBA);

  for (let i = 0; i < lines.rows; i++) {
    let x1 = lines.data32S[i*4];
    let y1 = lines.data32S[i*4+1];
    let x2 = lines.data32S[i*4+2];
    let y2 = lines.data32S[i*4+3];
    cv.line(color, new cv.Point(x1,y1), new cv.Point(x2,y2), [255,0,0,255], 2);
  }

  cv.imshow(resultCanvas, color);
  edges.delete(); lines.delete(); color.delete();
}

function runHarris(gray) {
  let block = +document.getElementById("harris-block").value;
  let ksize = +document.getElementById("harris-ksize").value;
  let k = +document.getElementById("harris-k").value / 100;

  let dst = new cv.Mat();
  cv.cornerHarris(gray, dst, block, ksize, k);

  let norm = new cv.Mat();
  cv.normalize(dst, norm, 0, 255, cv.NORM_MINMAX);

  let color = new cv.Mat();
  cv.cvtColor(gray, color, cv.COLOR_GRAY2RGBA);

  for (let i = 0; i < norm.rows; i++) {
    for (let j = 0; j < norm.cols; j++) {
      if (norm.ucharPtr(i,j)[0] > 125) {
        cv.circle(color, new cv.Point(j,i), 2, [255,0,0,255], 1);
      }
    }
  }

  cv.imshow(resultCanvas, color);

  dst.delete(); norm.delete(); color.delete();
}


contrastRadios.forEach(r => {
  r.addEventListener("change", () => {
    paramLinear.classList.toggle("hidden", getContrastMethod() !== "linear");
  });
});

contrastBtn.addEventListener("click", () => {
  if (!srcImg) return alert("Нет изображения");
  const method = getContrastMethod();

  const src = cv.imread(sourceCanvas);
  let gray = new cv.Mat();
  cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);

  if (method === "hist") drawHistogram(gray);
  if (method === "equalize") equalize(gray);
  if (method === "linear") linear(gray);

  src.delete();
  gray.delete();
});


function drawHistogram(gray) {
  const srcVec = new cv.MatVector();
  srcVec.push_back(gray);

  const mask = new cv.Mat();
  const hist = new cv.Mat();

  const channels = [0];
  const histSize = [256];
  const ranges = [0, 256];

  cv.calcHist(srcVec, channels, mask, hist, histSize, ranges);

  const ctx = histCanvas.getContext("2d");
  ctx.clearRect(0, 0, histCanvas.width, histCanvas.height);
  ctx.fillStyle = "#000";

  
  let maxVal = 0;
  for (let i = 0; i < hist.rows; i++) {
    maxVal = Math.max(maxVal, hist.data32F[i]);
  }

  const w = histCanvas.width / 256;

  for (let i = 0; i < 256; i++) {
    const h = (hist.data32F[i] / maxVal) * histCanvas.height;
    ctx.fillRect(i * w, histCanvas.height - h, w, h);
  }

  hist.delete();
  mask.delete();
  srcVec.delete();
}



function equalize(gray) {
  let out = new cv.Mat();
  cv.equalizeHist(gray, out);
  cv.imshow(resultCanvas, out);
  out.delete();
}


function linear(gray) {
  let minV = +document.getElementById("linear-min").value;
  let maxV = +document.getElementById("linear-max").value;

  let out = new cv.Mat();

  cv.normalize(gray, out, 0, 255, cv.NORM_MINMAX);

  cv.imshow(resultCanvas, out);
  out.delete();
}


downloadBtn.addEventListener("click", () => {
  const link = document.createElement("a");
  link.download = "result.png";
  link.href = resultCanvas.toDataURL();
  link.click();
});

resetBtn.addEventListener("click", () => {
  if (srcImg) drawSource(srcImg);
});
