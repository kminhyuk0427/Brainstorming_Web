document.addEventListener('DOMContentLoaded', () => {
    const mainCircle = document.querySelector('.main__circle');
    const canvasTransform = document.getElementById('canvasTransform');

    // canvasTransform에 position 설정
    canvasTransform.style.position = 'relative';

    let startColorHue = 220; // 파랑
    let endColorHue = 140;   // 초록

    // === 선용 SVG 추가 ===
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    Object.assign(svg.style, {
        position: 'absolute',
        top: '0',
        left: '0',
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: '0'
    });
    canvasTransform.appendChild(svg);

    const nodeMap = new Map();
    let currentTarget = null;

    // === 우클릭 메뉴 ===
    const customMenu = document.createElement('div');
    Object.assign(customMenu.style, {
        position: 'absolute',
        background: 'white',
        border: '1px solid #ccc',
        boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
        padding: '5px 0',
        zIndex: '9999',
        display: 'none'
    });
    document.body.appendChild(customMenu);

    function createMenuItem(label, onClick) {
        const item = document.createElement('div');
        item.textContent = label;
        Object.assign(item.style, {
            padding: '5px 20px',
            cursor: 'pointer'
        });
        item.addEventListener('mouseover', () => item.style.background = '#eee');
        item.addEventListener('mouseout', () => item.style.background = 'white');
        item.addEventListener('click', () => {
            customMenu.style.display = 'none';
            onClick();
        });
        return item;
    }

    function createLineElement(x1, y1, x2, y2) {
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', x1);
        line.setAttribute('y1', y1);
        line.setAttribute('x2', x2);
        line.setAttribute('y2', y2);
        line.setAttribute('stroke', '#666');
        line.setAttribute('stroke-width', '2');
        return line;
    }

    function updateLinePosition(child, parent, line) {
        const canvasRect = canvasTransform.getBoundingClientRect();
        const parentRect = parent.getBoundingClientRect();
        const childRect = child.getBoundingClientRect();

        const x1 = parentRect.left + parentRect.width / 2 - canvasRect.left;
        const y1 = parentRect.top + parentRect.height / 2 - canvasRect.top;
        const x2 = childRect.left + childRect.width / 2 - canvasRect.left;
        const y2 = childRect.top + childRect.height / 2 - canvasRect.top;

        line.setAttribute('x1', x1);
        line.setAttribute('y1', y1);
        line.setAttribute('x2', x2);
        line.setAttribute('y2', y2);
    }

    function attachContextMenu(circleElement) {
        circleElement.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            currentTarget = circleElement;
            customMenu.style.left = `${e.pageX}px`;
            customMenu.style.top = `${e.pageY}px`;
            customMenu.style.display = 'block';
        });
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
        const parentSize = currentTarget.offsetWidth;
        const size = parentSize * 0.9;

        const baseSize = 100;
        const depthRatio = Math.min(1, Math.max(0, 1 - (size / baseSize)));
        const hue = startColorHue + (endColorHue - startColorHue) * depthRatio;
        const backgroundColor = `hsl(${hue}, 70%, 50%)`;

        const subCircle = document.createElement('div');
        subCircle.className = 'sub-circle';
        Object.assign(subCircle.style, {
            position: 'absolute',
            width: `${size}px`,
            height: `${size}px`,
            borderRadius: '50%',
            backgroundColor: backgroundColor,
            color: 'white',
            fontSize: '12px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: '1',
            left: `${rect.left - parentRect.left + 120}px`,
            top: `${rect.top - parentRect.top}px`
        });
        subCircle.textContent = '노드';

        canvasTransform.appendChild(subCircle);
        attachContextMenu(subCircle);

        const line = createLineElement(0, 0, 0, 0);
        svg.appendChild(line);

        // 다음 프레임에서 선 위치 계산
        requestAnimationFrame(() => {
            updateLinePosition(subCircle, currentTarget, line);
        });

        nodeMap.set(subCircle, { parent: currentTarget, line });

        const observer = new MutationObserver(() => {
            const data = nodeMap.get(subCircle);
            if (data) updateLinePosition(subCircle, data.parent, data.line);
        });
        observer.observe(subCircle, { attributes: true, attributeFilter: ['style'] });
    });

    customMenu.appendChild(editTextItem);
    customMenu.appendChild(addChildCircleItem);

    document.addEventListener('click', () => {
        customMenu.style.display = 'none';
    });

    if (mainCircle) {
        attachContextMenu(mainCircle);
        nodeMap.set(mainCircle, { parent: null, line: null });
    }
});
