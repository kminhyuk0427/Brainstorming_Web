document.addEventListener('DOMContentLoaded', () => {
    // DOMContentLoaded 이벤트는 HTML 문서가 완전히 로드되고 파싱되었을 때 발생합니다.
    // 이 이벤트 핸들러 안에 코드를 작성하면, HTML 요소에 안전하게 접근할 수 있습니다.

    // 메인 노드(가장 왼쪽에 있는 큰 원)와 노드들이 그려질 캔버스 컨테이너를 선택합니다.
    const mainCircle = document.querySelector('.main__circle');
    const canvasTransform = document.getElementById('canvasTransform');

    // 메인 노드의 크기를 더 크게 설정합니다.
    const mainNodeSize = 200; // 메인 노드의 기본 크기 (픽셀 단위)
    mainCircle.style.width = `${mainNodeSize}px`;
    mainCircle.style.height = `${mainNodeSize}px`;

    // 메인 노드 텍스트의 초기 크기를 설정합니다.
    mainCircle.style.fontSize = '30px';
    // 노드 텍스트가 마우스로 드래그되어 선택되는 것을 방지합니다.
    mainCircle.style.userSelect = 'none';

    // 노드 색상 그라데이션을 위한 시작과 끝 색상(Hue)을 설정합니다.
    // HSL(Hue, Saturation, Lightness) 색상 모델에서 Hue 값입니다.
    let startColorHue = 220; // 파란색 계열
    let endColorHue = 140;   // 청록색 계열

    // 노드들을 연결하는 선을 그리기 위해 SVG(Scalable Vector Graphics) 요소를 생성합니다.
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    Object.assign(svg.style, {
        position: 'absolute',
        top: '0',
        left: '0',
        width: '100%',
        height: '100%',
        // SVG가 마우스 이벤트를 가로채지 않도록 설정하여 하위 요소(노드)를 클릭할 수 있게 합니다.
        pointerEvents: 'none',
        zIndex: '0' // 다른 노드들보다 아래에 위치하도록 설정
    });
    // 생성한 SVG를 캔버스 컨테이너에 추가합니다.
    canvasTransform.appendChild(svg);

    // 노드와 노드 사이의 관계(부모-자식) 및 연결 선 정보를 저장할 Map 객체입니다.
    const nodeMap = new Map();
    // 현재 마우스 오른쪽 클릭으로 메뉴가 열린 노드를 저장하는 변수입니다.
    let currentTarget = null;

    // 마우스 오른쪽 클릭 시 나타나는 커스텀 메뉴를 생성합니다.
    const customMenu = document.createElement('div');
    Object.assign(customMenu.style, {
        position: 'absolute',
        background: 'white',
        border: '1px solid #ccc',
        boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
        padding: '5px 0',
        zIndex: '9999', // 다른 요소들보다 항상 위에 보이도록 설정
        display: 'none' // 초기에는 숨김 상태
    });
    document.body.appendChild(customMenu);

    // 커스텀 메뉴 항목을 생성하는 헬퍼 함수입니다.
    function createMenuItem(label, onClick) {
        const item = document.createElement('div');
        item.textContent = label;
        Object.assign(item.style, {
            padding: '5px 20px',
            cursor: 'pointer'
        });
        // 마우스 오버/아웃 시 배경색을 변경하여 시각적 효과를 줍니다.
        item.addEventListener('mouseover', () => item.style.background = '#eee');
        item.addEventListener('mouseout', () => item.style.background = 'white');
        // 항목 클릭 시 메뉴를 숨기고, 인자로 받은 함수를 실행합니다.
        item.addEventListener('click', () => {
            customMenu.style.display = 'none';
            onClick();
        });
        return item;
    }

    // 노드들을 연결하는 SVG 선(line) 요소를 생성하는 함수입니다.
    function createLineElement(x1, y1, x2, y2) {
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('stroke', '#666');
        line.setAttribute('stroke-width', '2');
        line.setAttribute('x1', x1);
        line.setAttribute('y1', y1);
        line.setAttribute('x2', x2);
        line.setAttribute('y2', y2);
        return line;
    }

    // 노드의 위치가 변경될 때 연결 선의 위치를 업데이트하는 함수입니다.
    function updateLinePosition(child, parent, line) {
        const canvasRect = canvasTransform.getBoundingClientRect();
        const parentRect = parent.getBoundingClientRect();
        const childRect = child.getBoundingClientRect();
        const scale = window.canvasState?.scale || 1;

        // 선이 노드 중앙에서 시작하도록 정확한 좌표를 계산합니다.
        const parentCenterX = (parentRect.left + parentRect.width / 2 - canvasRect.left) / scale;
        const parentCenterY = (parentRect.top + parentRect.height / 2 - canvasRect.top) / scale;
        const childCenterX = (childRect.left + childRect.width / 2 - canvasRect.left) / scale;
        const childCenterY = (childRect.top + childRect.height / 2 - canvasRect.top) / scale;

        line.setAttribute('x1', parentCenterX);
        line.setAttribute('y1', parentCenterY);
        line.setAttribute('x2', childCenterX);
        line.setAttribute('y2', childCenterY);
    }

    // 노드를 마우스로 드래그하여 이동할 수 있게 만드는 함수입니다.
    function makeDraggable(circleElement) {
        let isReadyToDrag = false;
        let offsetX = 0;
        let offsetY = 0;

        // 마우스 다운 이벤트 발생 시 드래그 준비 상태로 만듭니다.
        // `e.stopPropagation()`: 이벤트 버블링을 막아 부모 요소로 이벤트가 전달되는 것을 방지합니다.
        circleElement.addEventListener('mousedown', (e) => {
            e.stopPropagation();
            isReadyToDrag = true;
            const rect = circleElement.getBoundingClientRect();
            // 마우스 포인터와 노드 좌측 상단 모서리 사이의 간격을 계산하여 저장합니다.
            offsetX = e.clientX - rect.left;
            offsetY = e.clientY - rect.top;
        });

        // 마우스 이동 이벤트 발생 시, 드래그 중이면 노드 위치를 업데이트합니다.
        document.addEventListener('mousemove', (e) => {
            if (!isReadyToDrag) return;
        
            const canvasRect = canvasTransform.getBoundingClientRect();
            const scale = window.canvasState?.scale || 1;
        
            // 마우스 위치에 따라 노드의 새로운 위치를 계산합니다.
            let newLeft = (e.clientX - canvasRect.left - offsetX) / scale;
            let newTop = (e.clientY - canvasRect.top - offsetY) / scale;
        
            // 캔버스 내부에서만 움직이도록 좌표 제한 (노드 크기 고려)
            const canvasWidth = canvasTransform.clientWidth;
            const canvasHeight = canvasTransform.clientHeight;
        
            const circleWidth = circleElement.offsetWidth;
            const circleHeight = circleElement.offsetHeight;
        
            newLeft = Math.min(Math.max(newLeft, 0), canvasWidth - circleWidth);
            newTop = Math.min(Math.max(newTop, 0), canvasHeight - circleHeight);
        
            // 위치 반영
            circleElement.style.left = `${newLeft}px`;
            circleElement.style.top = `${newTop}px`;
        
            // 연결 선 업데이트
            const data = nodeMap.get(circleElement);
            if (data && data.parent && data.line) {
                updateLinePosition(circleElement, data.parent, data.line);
            }
            for (const [child, info] of nodeMap.entries()) {
                if (info.parent === circleElement && info.line) {
                    updateLinePosition(child, circleElement, info.line);
                }
            }
        });
        

        // 마우스 업 이벤트 발생 시 드래그를 종료합니다.
        document.addEventListener('mouseup', () => {
            isReadyToDrag = false;
        });
    }

    // 노드에 컨텍스트 메뉴(우클릭 메뉴)와 드래그 기능을 연결하는 함수입니다.
    function attachContextMenu(circleElement) {
        circleElement.addEventListener('contextmenu', (e) => {
            e.preventDefault(); // 기본 컨텍스트 메뉴가 나타나는 것을 막습니다.
            currentTarget = circleElement; // 현재 타겟 노드를 설정합니다.
            customMenu.style.left = `${e.pageX}px`;
            customMenu.style.top = `${e.pageY}px`;
            customMenu.style.display = 'block'; // 커스텀 메뉴를 보이게 합니다.
        });

        // 드래그 기능을 노드에 부여합니다.
        makeDraggable(circleElement);
    }

    // '텍스트 추가/수정' 메뉴 항목을 정의합니다.
    const editTextItem = createMenuItem('텍스트 추가/수정', () => {
        // 현재 타겟 노드 안에 있는 <span> 텍스트 요소를 찾거나 새로 생성합니다.
        const textElement = currentTarget.querySelector('span') || document.createElement('span');
        if (!textElement.parentElement) {
            currentTarget.textContent = ''; // 기존 텍스트를 비우고
            currentTarget.appendChild(textElement); // <span> 요소를 추가합니다.
        }

        // 텍스트 편집 중에는 텍스트 선택이 가능하도록 설정합니다.
        textElement.style.userSelect = 'text';

        // 텍스트 입력을 위한 <input> 요소를 생성합니다.
        const input = document.createElement('input');
        input.type = 'text';
        input.value = textElement.textContent;
        input.placeholder = '텍스트 입력';
        Object.assign(input.style, {
            // 입력창 스타일을 노드에 맞게 설정합니다.
            border: 'none',
            background: 'none',
            color: 'white',
            textAlign: 'center',
            outline: 'none',
            width: 'calc(100% - 10px)',
            fontSize: window.getComputedStyle(textElement).fontSize,
            userSelect: 'text'
        });

        // 텍스트 요소를 입력창으로 교체하고 포커스를 줍니다.
        currentTarget.replaceChild(input, textElement);
        input.focus();

        // 편집을 완료하는 함수를 정의합니다.
        const finishEditing = () => {
            const newText = input.value.trim() || '';
            textElement.textContent = newText;
            currentTarget.replaceChild(textElement, input);
            textElement.style.userSelect = 'none'; // 편집 완료 후 선택을 다시 막습니다.
        };

        // 입력창에서 포커스를 잃거나(blur) Enter 키를 누르면 편집을 완료합니다.
        input.addEventListener('blur', finishEditing);
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                finishEditing();
            }
        });
    });

    const addChildCircleItem = createMenuItem('하위 원 추가', () => {
        const rect = currentTarget.getBoundingClientRect();
        const parentRect = canvasTransform.getBoundingClientRect();
        const scale = window.canvasState?.scale || 1;

        const parentSize = currentTarget.offsetWidth;
        const newSize = parentSize * 0.9;

        // 최소 노드 크기를 설정하여 무한히 작아지는 것을 방지
        const minSize = 50;
        const finalSize = Math.max(newSize, minSize);

        // 부모 노드의 폰트 크기를 가져와서 새로운 폰트 크기를 계산합니다.
        // 현재 노드의 폰트 크기를 기준으로 20%씩 작아지도록 설정
        const parentFontSize = parseFloat(window.getComputedStyle(currentTarget).fontSize);
        const newFontSize = Math.max(10, parentFontSize * 0.8); // 최소 10px

        const depthRatio = Math.min(1, Math.max(0, 1 - (finalSize / mainNodeSize)));
        const hue = startColorHue + (endColorHue - startColorHue) * depthRatio;
        const backgroundColor = `hsl(${hue}, 70%, 50%)`;

        const subCircle = document.createElement('div');
        subCircle.className = 'sub-circle';
        Object.assign(subCircle.style, {
            position: 'absolute',
            width: `${finalSize}px`,
            height: `${finalSize}px`,
            borderRadius: '50%',
            backgroundColor: backgroundColor,
            color: 'white',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: '1',
            left: `${(rect.left - parentRect.left + parentSize + 50) / scale}px`,
            top: `${(rect.top - parentRect.top) / scale}px`,
            userSelect: 'none' // 텍스트 드래그 선택 방지
        });

        const textSpan = document.createElement('span');
        textSpan.textContent = '노드';
        textSpan.style.fontSize = `${newFontSize}px`;
        subCircle.appendChild(textSpan);

        canvasTransform.appendChild(subCircle);
        attachContextMenu(subCircle);

        const line = createLineElement(0, 0, 0, 0);
        svg.appendChild(line);
        updateLinePosition(subCircle, currentTarget, line);
        nodeMap.set(subCircle, { parent: currentTarget, line });
    });

    // 커스텀 메뉴에 정의한 항목들을 추가합니다.
    customMenu.appendChild(editTextItem);
    customMenu.appendChild(addChildCircleItem);

    // 문서의 다른 부분을 클릭하면 커스텀 메뉴를 숨깁니다.
    document.addEventListener('click', (e) => {
        // 클릭된 요소가 메뉴 자체가 아닌 경우에만 메뉴를 숨깁니다.
        if (!customMenu.contains(e.target)) {
            customMenu.style.display = 'none';
        }
    });

    // 메인 노드가 존재하면 컨텍스트 메뉴와 드래그 기능을 연결합니다.
    if (mainCircle) attachContextMenu(mainCircle);
});