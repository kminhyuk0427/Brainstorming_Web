const canvas = document.getElementById('mainContent');      // .main 도화지
const canvasWrapper = document.getElementById('canvasWrapper');
const mainCircle = document.querySelector('.main__circle');

let isDragging = false;
let startX, startY;
let translateX = 0, translateY = 0;
let scale = 1;

const scaleStep = 0.1;
const scaleMin = 0.3;
const scaleMax = 3;

canvasWrapper.style.cursor = 'grab';

// 드래그 시작
canvas.addEventListener('mousedown', (e) => {
    isDragging = true;
    startX = e.clientX - translateX;
    startY = e.clientY - translateY;
    canvasWrapper.style.cursor = 'grabbing';
});

// 드래그 중
document.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    translateX = e.clientX - startX;
    translateY = e.clientY - startY;
    updateTransform();
});

// 드래그 종료
document.addEventListener('mouseup', () => {
    isDragging = false;
    canvasWrapper.style.cursor = 'grab';
});

// Ctrl + H 누르면 메인 원이 화면 중앙으로 이동
document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && (e.key === 'h' || e.key === 'H')) {
        e.preventDefault();

        const wrapperRect = canvasWrapper.getBoundingClientRect();
        const centerX = wrapperRect.width / 2;
        const centerY = wrapperRect.height / 2;

        const circleRect = mainCircle.getBoundingClientRect();
        const circleCenterX = circleRect.left + circleRect.width / 2;
        const circleCenterY = circleRect.top + circleRect.height / 2;

        const deltaX = centerX - circleCenterX;
        const deltaY = centerY - circleCenterY;

        translateX += deltaX;
        translateY += deltaY;

        updateTransform();
    }
});

// Ctrl + 마우스 휠: 도화지 확대/축소
canvasWrapper.addEventListener('wheel', (e) => {
    if (!e.ctrlKey) return;

    e.preventDefault();

    if (e.deltaY < 0) {
        scale += scaleStep;
        if (scale > scaleMax) scale = scaleMax;
    } else {
        scale -= scaleStep;
        if (scale < scaleMin) scale = scaleMin;
    }

    updateTransform();
});

// transform 갱신 함수 (translate + scale 동시 적용)
function updateTransform() {
    canvas.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`;
}
