"use strict";

const canvas = document.querySelector("#myCanvas");
const ctx = canvas.getContext("2d");
const clearBtn = document.querySelector("#clear");

ctx.lineWidth = 10;

canvas.addEventListener("mousedown", startDrawing);
canvas.addEventListener("mousemove", draw);
canvas.addEventListener("mouseup", stopDrawing);
clearBtn.addEventListener("click", clearCanvas);
document.querySelector("#sendButton").addEventListener('click', sendImage);

let isDrawing = false;
let lastX = 0;
let lastY = 0;

displayLastResult();

function clearCanvas(e) {
	e.preventDefault();
	ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function startDrawing(e) {
	isDrawing = true;
	[lastX, lastY] = [e.offsetX, e.offsetY];
}

function draw(e) {
	if (!isDrawing) return;
	ctx.beginPath();
	ctx.moveTo(lastX, lastY);
	ctx.lineTo(e.offsetX, e.offsetY);
	ctx.stroke();
	[lastX, lastY] = [e.offsetX, e.offsetY];
}

function stopDrawing() {
	isDrawing = false;
}

async function sendImage(e) {
	e.preventDefault();
	// Convert canvas contents to base64 encoded PNG
	const image = canvas.toDataURL('image/png');

	// Send image to server
	const fetched = await fetch('http://localhost:8000/predict', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ image: image })
	});

	const result = await fetched.json();
	localStorage.setItem('result', JSON.stringify(result));
	location.reload();
}


function displayLastResult() {
	if (!localStorage.getItem('result')) return;
	const result = JSON.parse(localStorage.getItem('result'));
	const resultSpan = document.querySelector("#result");
	resultSpan.innerHTML = "";
	resultSpan.innerHTML = `The model guessed your last number to be: ${result.prediction}`;
}