const canvasWrapper = document.getElementById('canvasWrapper');
const canvasTransform = document.getElementById('canvasTransform');

let isDragging = false;
let startX, startY;
let translateX = 0, translateY = 0;
let scale = 1;

const scaleStep = 0.1;
const scaleMin = 0.3;
const scaleMax = 3;

canvasWrapper.style.cursor = 'grab';

canvasWrapper.addEventListener('mousedown', (e) => {
    if (e.button !== 0) return;
    isDragging = true;
    startX = e.clientX - translateX;
    startY = e.clientY - translateY;
    canvasWrapper.style.cursor = 'grabbing';
});

document.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    translateX = e.clientX - startX;
    translateY = e.clientY - startY;
    updateTransform();
});

document.addEventListener('mouseup', () => {
    isDragging = false;
    canvasWrapper.style.cursor = 'grab';
});

canvasWrapper.addEventListener('wheel', (e) => {
    if (!e.ctrlKey) return;
    e.preventDefault();

    scale += (e.deltaY < 0 ? scaleStep : -scaleStep);
    scale = Math.max(scaleMin, Math.min(scaleMax, scale));
    updateTransform();
});

function updateTransform() {
    window.canvasState = {
        get scale() { return scale; },
        get translateX() { return translateX; },
        get translateY() { return translateY; }
    };
    canvasTransform.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`;
}

// 외부에서 translateX, translateY, scale을 필요하면 쓸 수 있게 export 또는 window에 노출 가능
