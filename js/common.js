document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && (e.key === 'h' || e.key === 'H')) {
        e.preventDefault();

        const wrapperRect = canvasWrapper.getBoundingClientRect();
        const centerX = wrapperRect.width / 2;
        const centerY = wrapperRect.height / 2;

        const circleRect = mainCircle.getBoundingClientRect();
        const circleCenterX = circleRect.left + circleRect.width / 2;
        const circleCenterY = circleRect.top + circleRect.height / 2;

        // 여기서 translateX, translateY 변수는 canvas.js에서 관리중이라면
        // common.js에서 접근 가능하게 모듈화 하거나 window에 노출해야 함
        translateX += centerX - circleCenterX;
        translateY += centerY - circleCenterY;

        updateTransform();
    }
});
