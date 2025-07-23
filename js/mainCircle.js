document.addEventListener('DOMContentLoaded', () => {
    const mainCircle = document.querySelector('.main__circle');
    const canvasTransform = document.getElementById('canvasTransform');

    // 사용자 정의 시작색과 끝색 (HSL의 hue 값)
    let startColorHue = 220; // 파란색 계열
    let endColorHue = 140;   // 초록색 계열

    // === 전역 커스텀 우클릭 메뉴 생성 ===
    const customMenu = document.createElement('div');
    customMenu.style.position = 'absolute';
    customMenu.style.background = 'white';
    customMenu.style.border = '1px solid #ccc';
    customMenu.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
    customMenu.style.padding = '5px 0';
    customMenu.style.zIndex = '9999';
    customMenu.style.display = 'none';
    document.body.appendChild(customMenu);

    let currentTarget = null;

    function createMenuItem(label, onClick) {
        const item = document.createElement('div');
        item.textContent = label;
        item.style.padding = '5px 20px';
        item.style.cursor = 'pointer';
        item.addEventListener('mouseover', () => item.style.background = '#eee');
        item.addEventListener('mouseout', () => item.style.background = 'white');
        item.addEventListener('click', () => {
            customMenu.style.display = 'none';
            onClick();
        });
        return item;
    }

    const editTextItem = createMenuItem('텍스트 추가/수정', () => {
        const currentText = currentTarget.textContent;
        currentTarget.textContent = '';

        const input = document.createElement('input');
        input.type = 'text';
        input.value = currentText;
        input.placeholder = '텍스트 입력';
        currentTarget.appendChild(input);
        input.focus();

        input.addEventListener('blur', () => {
            currentTarget.textContent = input.value.trim() || '';
        });

        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') input.blur();
        });
    });

    const addChildCircleItem = createMenuItem('하위 원 추가', () => {
        const rect = currentTarget.getBoundingClientRect();
        const parentRect = canvasTransform.getBoundingClientRect();

        // === 크기 계산 ===
        const parentSize = currentTarget.offsetWidth;
        const size = parentSize * 0.9;

        // === 색상 계산 (파랑에서 초록으로 부드럽게 이동) ===
        const baseSize = 100;
        const depthRatio = Math.min(1, Math.max(0, 1 - (size / baseSize))); // 0 ~ 1
        const hue = startColorHue + (endColorHue - startColorHue) * depthRatio;
        const backgroundColor = `hsl(${hue}, 70%, 50%)`;

        const subCircle = document.createElement('div');
        subCircle.className = 'sub-circle';
        subCircle.style.position = 'absolute';
        subCircle.style.width = `${size}px`;
        subCircle.style.height = `${size}px`;
        subCircle.style.borderRadius = '50%';
        subCircle.style.backgroundColor = backgroundColor;
        subCircle.style.color = 'white';
        subCircle.style.fontSize = '12px';
        subCircle.style.display = 'flex';
        subCircle.style.justifyContent = 'center';
        subCircle.style.alignItems = 'center';
        subCircle.style.zIndex = '1';
        subCircle.textContent = '노드';

        const offset = 120;
        const relativeLeft = rect.left - parentRect.left + offset;
        const relativeTop = rect.top - parentRect.top;

        subCircle.style.left = `${relativeLeft}px`;
        subCircle.style.top = `${relativeTop}px`;

        canvasTransform.appendChild(subCircle);
        attachContextMenu(subCircle);
    });

    customMenu.appendChild(editTextItem);
    customMenu.appendChild(addChildCircleItem);

    function attachContextMenu(circleElement) {
        circleElement.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            customMenu.style.left = `${e.pageX}px`;
            customMenu.style.top = `${e.pageY}px`;
            customMenu.style.display = 'block';
            currentTarget = circleElement;
        });
    }

    attachContextMenu(mainCircle);

    document.addEventListener('click', () => {
        customMenu.style.display = 'none';
    });
});
