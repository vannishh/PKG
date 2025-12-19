// Получаем элементы DOM
        const canvas = document.getElementById('canvas');
        const ctx = canvas.getContext('2d');
        const x1Input = document.getElementById('x1');
        const y1Input = document.getElementById('y1');
        const x2Input = document.getElementById('x2');
        const y2Input = document.getElementById('y2');
        const cxInput = document.getElementById('cx');
        const cyInput = document.getElementById('cy');
        const radiusInput = document.getElementById('radius');
        const scaleInput = document.getElementById('scale');
        const drawBtn = document.getElementById('draw-btn');
        const clearBtn = document.getElementById('clear-btn');
        const algoExplanation = document.getElementById('algo-explanation');
        const selectedAlgosEl = document.getElementById('selected-algos');
        const executionTimeEl = document.getElementById('execution-time');
        const pixelCountEl = document.getElementById('pixel-count');
        const coordinatesEl = document.getElementById('coordinates');
        const calculationsEl = document.getElementById('calculations');
        const algorithmStatsEl = document.getElementById('algorithm-stats');
        const algoButtons = document.querySelectorAll('.algo-btn');
        const zoomInBtn = document.getElementById('zoom-in');
        const zoomOutBtn = document.getElementById('zoom-out');
        const lineBtn = document.getElementById('line-btn');
        const circleBtn = document.getElementById('circle-btn');
        const lineControls = document.getElementById('line-controls');
        const circleControls = document.getElementById('circle-controls');
        const modeCompareBtn = document.getElementById('mode-compare');
        const modeSingleBtn = document.getElementById('mode-single');
        
        // Переменные состояния
        let scale = parseInt(scaleInput.value);
        let offsetX = canvas.width / 2;
        let offsetY = canvas.height / 2;
        let activeAlgorithms = new Set(['wu']);
        let currentDrawings = [];
        let isCircleMode = false;
        let displayMode = 'compare'; // 'compare' или 'single'
        
        // Цвета для разных алгоритмов
const algorithmColors = {
    'step': '#4a9eff',      // Синий
    'dda': '#ff6b6b',       // Красный
    'bresenham': '#51cf66', // Зеленый
    'bresenham-circle': '#ffd43b', // Желтый
    'wu': '#9b59b6',        // Фиолетовый
    'castle-pitway': '#e67e22' // Оранжевый (новый цвет для Кастла-Питвея)
};

// Названия алгоритмов
const algorithmNames = {
    'step': 'Пошаговый',
    'dda': 'ЦДА',
    'bresenham': 'Брезенхем (линия)',
    'bresenham-circle': 'Брезенхем (окружность)',
    'wu': 'Ву (сглаживание)',
    'castle-pitway': 'Кастла-Питвея' // Новый алгоритм
};
        
        // Инициализация кнопок выбора алгоритмов
        function initAlgorithmButtons() {
            algoButtons.forEach(btn => {
                const algo = btn.getAttribute('data-algo');
                btn.addEventListener('click', function() {
                    if (displayMode === 'single') {
                        // В режиме "по отдельности" выбирается только один алгоритм
                        algoButtons.forEach(b => b.classList.remove('active'));
                        activeAlgorithms.clear();
                        this.classList.add('active');
                        activeAlgorithms.add(algo);
                    } else {
                        // В режиме "сравнение" можно выбирать несколько алгоритмов
                        if (activeAlgorithms.has(algo)) {
                            activeAlgorithms.delete(algo);
                            this.classList.remove('active');
                        } else {
                            activeAlgorithms.add(algo);
                            this.classList.add('active');
                        }
                    }
                    updateSelectedAlgorithmsDisplay();
                });
            });
        }
        
        // Обновление отображения выбранных алгоритмов
        function updateSelectedAlgorithmsDisplay() {
            const algoNames = Array.from(activeAlgorithms).map(algo => algorithmNames[algo]);
            selectedAlgosEl.textContent = algoNames.join(', ') || 'Не выбрано';
            
            // Обновляем пояснения для первого выбранного алгоритма
            if (activeAlgorithms.size > 0) {
                const firstAlgo = Array.from(activeAlgorithms)[0];
                updateAlgorithmExplanation(firstAlgo);
            }
        }
        
        function updateAlgorithmExplanation(algo) {
    let explanation = '';
    
    switch(algo) {
        case 'step':
            explanation = '<strong>Пошаговый алгоритм:</strong> Простейший алгоритм растеризации отрезка. Вычисляет координаты точек между началом и концом отрезка с использованием уравнения прямой y = kx + b.';
            break;
        case 'dda':
            explanation = '<strong>Алгоритм ЦДА (Цифровой дифференциальный анализатор):</strong> Использует приращения для вычисления координат пикселей. Эффективнее пошагового алгоритма, так как избегает умножений в цикле.';
            break;
        case 'bresenham':
            explanation = '<strong>Алгоритм Брезенхема (отрезок):</strong> Эффективный алгоритм, использующий только целочисленные операции. Определяет, какой пиксель лучше аппроксимирует линию на каждом шаге.';
            break;
        case 'bresenham-circle':
            explanation = '<strong>Алгоритм Брезенхема (окружность):</strong> Эффективный алгоритм растеризации окружности, использующий симметрию окружности и только целочисленные операции.';
            break;
        case 'wu':
            explanation = '<strong>Алгоритм Ву (сглаживание):</strong> Алгоритм сглаживания линий (антиалиасинга). Использует взвешенное окрашивание двух соседних пикселей для создания плавных линий без "лесенок".';
            break;
        case 'castle-pitway':
            explanation = '<strong>Алгоритм Кастла-Питвея:</strong> Улучшенная версия алгоритма Брезенхема, также известная как "алгоритм среднего точки". Использует критерий средней точки для выбора следующего пикселя.';
            break;
    }
    
    // algoExplanation.innerHTML = explanation;
}
        
        // Переключение между отрезком и окружностью
        lineBtn.addEventListener('click', function() {
            lineBtn.classList.add('active');
            circleBtn.classList.remove('active');
            lineControls.style.display = 'block';
            circleControls.style.display = 'none';
            isCircleMode = false;
            updateCalculations();
        });
        
        circleBtn.addEventListener('click', function() {
            circleBtn.classList.add('active');
            lineBtn.classList.remove('active');
            lineControls.style.display = 'none';
            circleControls.style.display = 'block';
            isCircleMode = true;
            updateCalculations();
        });
        
        // Переключение режимов отображения
        modeCompareBtn.addEventListener('click', function() {
            modeCompareBtn.classList.add('active');
            modeSingleBtn.classList.remove('active');
            displayMode = 'compare';
        });
        
        modeSingleBtn.addEventListener('click', function() {
            modeSingleBtn.classList.add('active');
            modeCompareBtn.classList.remove('active');
            displayMode = 'single';
            
            // В режиме "по отдельности" оставляем активным только первый выбранный алгоритм
            if (activeAlgorithms.size > 0) {
                const firstAlgo = Array.from(activeAlgorithms)[0];
                activeAlgorithms.clear();
                activeAlgorithms.add(firstAlgo);
                
                // Обновляем визуальное состояние кнопок
                algoButtons.forEach(btn => {
                    const algo = btn.getAttribute('data-algo');
                    if (algo === firstAlgo) {
                        btn.classList.add('active');
                    } else {
                        btn.classList.remove('active');
                    }
                });
                
                updateSelectedAlgorithmsDisplay();
            }
        });
        
        // Кнопки масштабирования
        zoomInBtn.addEventListener('click', () => {
            scale = Math.min(50, scale + 2);
            scaleInput.value = scale;
            drawGridAndAxes();
            redrawAll();
        });
        
        zoomOutBtn.addEventListener('click', () => {
            scale = Math.max(5, scale - 2);
            scaleInput.value = scale;
            drawGridAndAxes();
            redrawAll();
        });
        
        // Обработка изменения масштаба
        scaleInput.addEventListener('change', function() {
            scale = parseInt(this.value);
            if (scale < 5) scale = 5;
            if (scale > 50) scale = 50;
            this.value = scale;
            drawGridAndAxes();
            redrawAll();
        });
        
        // Кнопка построения
        drawBtn.addEventListener('click', draw);
        
        // Кнопка очистки
        clearBtn.addEventListener('click', function() {
            currentDrawings = [];
            algorithmStatsEl.innerHTML = '';
            drawGridAndAxes();
        });
        
        // Инициализация
        drawGridAndAxes();
        initAlgorithmButtons();
        updateSelectedAlgorithmsDisplay();
        updateCalculations();
        
        // Функция обновления пояснительных вычислений
        function updateCalculations() {
    let calculations = '';
    
    if (isCircleMode) {
        const cx = parseInt(cxInput.value);
        const cy = parseInt(cyInput.value);
        const radius = parseInt(radiusInput.value);
        
        calculations = `
            <p>Для алгоритма Брезенхема (окружность) с центром (${cx},${cy}) и радиусом ${radius}:</p>
            <p>1. Инициализация: x = 0, y = R, d = 3 - 2*R = ${3 - 2*radius}</p>
            <p>2. На каждом шаге рисуем 8 симметричных точек (октанты окружности)</p>
            <p>3. Пока x ≤ y, обновляем координаты на основе значения d</p>
            <p>4. Если d < 0, то d = d + 4*x + 6, иначе d = d + 4*(x - y) + 10, y = y - 1</p>
            <p>5. x = x + 1 на каждом шаге</p>
        `;
        
        coordinatesEl.textContent = `Центр: (${cx},${cy}), Радиус: ${radius}`;
    } else {
        const x1 = parseInt(x1Input.value);
        const y1 = parseInt(y1Input.value);
        const x2 = parseInt(x2Input.value);
        const y2 = parseInt(y2Input.value);
        
        const dx = x2 - x1;
        const dy = y2 - y1;
        const adx = Math.abs(dx);
        const ady = Math.abs(dy);
        
        // Получаем первый активный алгоритм для пояснений
        const firstAlgo = activeAlgorithms.size > 0 ? Array.from(activeAlgorithms)[0] : 'wu';
        
        if (firstAlgo === 'castle-pitway') {
            calculations = `
                <p>Для алгоритма Кастла-Питвея с координатами (${x1},${y1}) и (${x2},${y2}):</p>
                <p>1. Вычисляем приращения: Δx = ${dx}, Δy = ${dy}</p>
                <p>2. Определяем направление: sx = ${dx > 0 ? 1 : -1}, sy = ${dy > 0 ? 1 : -1}</p>
                <p>3. Если |Δx| ≥ |Δy| (${adx} ≥ ${ady}):</p>
                <p>   - Начальное значение: d = 2*|Δy| - |Δx| = ${2*ady - adx}</p>
                <p>   - d1 = 2*|Δy| = ${2*ady}, d2 = 2*(|Δy| - |Δx|) = ${2*(ady - adx)}</p>
                <p>4. На каждом шаге: если d < 0, то d += d1, иначе y += sy, d += d2</p>
                <p>5. x += sx на каждом шаге</p>
            `;
        } else if (firstAlgo === 'wu') {
            const gradient = dx !== 0 ? dy/dx : 1;
            calculations = `
                <p>Для алгоритма Ву с координатами (${x1},${y1}) и (${x2},${y2}):</p>
                <p>1. Вычисляем градиент: gradient = Δy/Δx = ${gradient.toFixed(3)}</p>
                <p>2. Основной цикл по координате x (если |gradient| < 1) или по y</p>
                <p>3. Для каждого шага вычисляем две точки: основную и соседнюю</p>
                <p>4. Интенсивность цвета для каждой точки: 1 - fractional_part и fractional_part</p>
                <p>5. Отрисовываем пиксели с вычисленной интенсивностью для сглаживания</p>
            `;
        } else {
            const k = dx !== 0 ? (dy/dx).toFixed(3) : '∞';
            
            calculations = `
                <p>Для ${algorithmNames[firstAlgo]} с координатами (${x1},${y1}) и (${x2},${y2}):</p>
                <p>1. Вычисляем приращения: Δx = ${dx}, Δy = ${dy}</p>
                <p>2. Угловой коэффициент: k = Δy/Δx = ${k}</p>
                ${firstAlgo === 'bresenham' ? `<p>3. Инициализация: dx = ${adx}, dy = ${ady}, err = dx - dy = ${adx - ady}</p>` : ''}
                ${firstAlgo === 'dda' ? `<p>3. Количество шагов: steps = max(|Δx|, |Δy|) = ${Math.max(adx, ady)}</p>` : ''}
                <p>${firstAlgo === 'step' ? '3' : firstAlgo === 'dda' ? '4' : '4'}. На каждом шаге вычисляем координаты следующего пикселя</p>
                <p>${firstAlgo === 'step' ? '4' : firstAlgo === 'dda' ? '5' : '5'}. Отрисовываем пиксели с вычисленными координатами</p>
            `;
        }
        
        coordinatesEl.textContent = `(${x1},${y1})-(${x2},${y2})`;
    }
    
    calculationsEl.innerHTML = calculations;
}
        
        // Функция отрисовки сетки и осей
        function drawGridAndAxes() {
            // Очищаем canvas
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // Рисуем сетку
            ctx.strokeStyle = 'rgba(100, 150, 255, 0.1)';
            ctx.lineWidth = 1;
            
            // Вертикальные линии сетки
            for (let x = offsetX % scale; x < canvas.width; x += scale) {
                ctx.beginPath();
                ctx.moveTo(x, 0);
                ctx.lineTo(x, canvas.height);
                ctx.stroke();
            }
            
            // Горизонтальные линии сетки
            for (let y = offsetY % scale; y < canvas.height; y += scale) {
                ctx.beginPath();
                ctx.moveTo(0, y);
                ctx.lineTo(canvas.width, y);
                ctx.stroke();
            }
            
            // Рисуем оси координат
            ctx.strokeStyle = 'rgba(100, 150, 255, 0.7)';
            ctx.lineWidth = 2;
            
            // Ось X
            ctx.beginPath();
            ctx.moveTo(0, offsetY);
            ctx.lineTo(canvas.width, offsetY);
            ctx.stroke();
            
            // Ось Y
            ctx.beginPath();
            ctx.moveTo(offsetX, 0);
            ctx.lineTo(offsetX, canvas.height);
            ctx.stroke();
            
            // Подписи осей
            ctx.fillStyle = 'rgba(200, 220, 255, 0.9)';
            ctx.font = '14px Arial';
            ctx.fillText('Y', offsetX - 20, 20);
            ctx.fillText('X', canvas.width - 20, offsetY - 10);
            
            // Деления на осях
            ctx.fillStyle = 'rgba(150, 200, 255, 0.7)';
            ctx.font = '10px Arial';
            
            // Деления на оси X
            for (let x = offsetX + scale; x < canvas.width; x += scale) {
                const value = (x - offsetX) / scale;
                ctx.beginPath();
                ctx.moveTo(x, offsetY - 5);
                ctx.lineTo(x, offsetY + 5);
                ctx.stroke();
                ctx.fillText(value, x - 5, offsetY + 20);
            }
            
            for (let x = offsetX - scale; x > 0; x -= scale) {
                const value = (x - offsetX) / scale;
                ctx.beginPath();
                ctx.moveTo(x, offsetY - 5);
                ctx.lineTo(x, offsetY + 5);
                ctx.stroke();
                ctx.fillText(value, x - 5, offsetY + 20);
            }
            
            // Деления на оси Y
            for (let y = offsetY + scale; y < canvas.height; y += scale) {
                const value = (offsetY - y) / scale;
                ctx.beginPath();
                ctx.moveTo(offsetX - 5, y);
                ctx.lineTo(offsetX + 5, y);
                ctx.stroke();
                ctx.fillText(value, offsetX + 10, y + 3);
            }
            
            for (let y = offsetY - scale; y > 0; y -= scale) {
                const value = (offsetY - y) / scale;
                ctx.beginPath();
                ctx.moveTo(offsetX - 5, y);
                ctx.lineTo(offsetX + 5, y);
                ctx.stroke();
                ctx.fillText(value, offsetX + 10, y + 3);
            }
            
            // Центр координат
            ctx.fillStyle = '#ff6b6b';
            ctx.beginPath();
            ctx.arc(offsetX, offsetY, 3, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // Функция преобразования координат
        function toCanvasX(x) {
            return offsetX + x * scale;
        }
        
        function toCanvasY(y) {
            return offsetY - y * scale;
        }
        
        // Функция отрисовки пикселя
        function drawPixel(x, y, color) {
            const canvasX = toCanvasX(x);
            const canvasY = toCanvasY(y);
            
            ctx.fillStyle = color;
            ctx.fillRect(canvasX - scale/2, canvasY - scale/2, scale, scale);
            
            // Контур пикселя
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.lineWidth = 1;
            ctx.strokeRect(canvasX - scale/2, canvasY - scale/2, scale, scale);
        }
        
        // Функция отрисовки пикселя с прозрачностью (для алгоритма Ву)
        function drawPixelWithAlpha(x, y, color, alpha) {
            const canvasX = toCanvasX(x);
            const canvasY = toCanvasY(y);
            
            // Сохраняем текущие настройки контекста
            ctx.save();
            
            // Устанавливаем прозрачность
            ctx.globalAlpha = alpha;
            ctx.fillStyle = color;
            ctx.fillRect(canvasX - scale/2, canvasY - scale/2, scale, scale);
            
            // Восстанавливаем настройки
            ctx.restore();
            
            // Контур пикселя (более прозрачный)
            ctx.strokeStyle = `rgba(255, 255, 255, ${alpha * 0.3})`;
            ctx.lineWidth = 1;
            ctx.strokeRect(canvasX - scale/2, canvasY - scale/2, scale, scale);
        }
        
        // Пошаговый алгоритм
        function stepAlgorithm(x1, y1, x2, y2) {
            const pixels = [];
            
            const dx = x2 - x1;
            const dy = y2 - y1;
            
            if (dx === 0) {
                // Вертикальная линия
                const step = dy > 0 ? 1 : -1;
                for (let y = y1; y !== y2; y += step) {
                    pixels.push({x: Math.round(x1), y: Math.round(y)});
                }
            } else {
                const k = dy / dx;
                const step = dx > 0 ? 1 : -1;
                
                for (let x = x1; x !== x2; x += step) {
                    const y = k * (x - x1) + y1;
                    pixels.push({x: Math.round(x), y: Math.round(y)});
                }
            }
            
            pixels.push({x: Math.round(x2), y: Math.round(y2)});
            return pixels;
        }
        
        // Алгоритм ЦДА
        function ddaAlgorithm(x1, y1, x2, y2) {
            const pixels = [];
            
            const dx = x2 - x1;
            const dy = y2 - y1;
            const steps = Math.max(Math.abs(dx), Math.abs(dy));
            
            const xInc = dx / steps;
            const yInc = dy / steps;
            
            let x = x1;
            let y = y1;
            
            for (let i = 0; i <= steps; i++) {
                pixels.push({x: Math.round(x), y: Math.round(y)});
                x += xInc;
                y += yInc;
            }
            
            return pixels;
        }
        
        // Алгоритм Брезенхема (линия)
        function bresenhamLine(x1, y1, x2, y2) {
            const pixels = [];
            
            let x = x1;
            let y = y1;
            const dx = Math.abs(x2 - x1);
            const dy = Math.abs(y2 - y1);
            const sx = x1 < x2 ? 1 : -1;
            const sy = y1 < y2 ? 1 : -1;
            let err = dx - dy;
            
            while (true) {
                pixels.push({x: x, y: y});
                
                if (x === x2 && y === y2) break;
                
                const e2 = 2 * err;
                if (e2 > -dy) {
                    err -= dy;
                    x += sx;
                }
                if (e2 < dx) {
                    err += dx;
                    y += sy;
                }
            }
            
            return pixels;
        }
        
        // Алгоритм Брезенхема (окружность)
        function bresenhamCircle(cx, cy, radius) {
            const pixels = [];
            
            let x = 0;
            let y = radius;
            let d = 3 - 2 * radius;
            
            while (x <= y) {
                // Добавляем 8 симметричных точек
                pixels.push({x: cx + x, y: cy + y});
                pixels.push({x: cx - x, y: cy + y});
                pixels.push({x: cx + x, y: cy - y});
                pixels.push({x: cx - x, y: cy - y});
                pixels.push({x: cx + y, y: cy + x});
                pixels.push({x: cx - y, y: cy + x});
                pixels.push({x: cx + y, y: cy - x});
                pixels.push({x: cx - y, y: cy - x});
                
                if (d < 0) {
                    d = d + 4 * x + 6;
                } else {
                    d = d + 4 * (x - y) + 10;
                    y--;
                }
                x++;
            }
            
            return pixels;
        }
        
        // Алгоритм Ву (сглаживание)
        function wuAlgorithm(x1, y1, x2, y2) {
            const pixels = [];
            
            // Функция для добавления пикселя с интенсивностью
            function addPixel(x, y, brightness) {
                pixels.push({x: Math.round(x), y: Math.round(y), alpha: brightness});
            }
            
            // Функция для вычисления дробной части
            function fpart(x) {
                return x - Math.floor(x);
            }
            
            function rfpart(x) {
                return 1 - fpart(x);
            }
            
            const steep = Math.abs(y2 - y1) > Math.abs(x2 - x1);
            
            let X1 = x1, Y1 = y1, X2 = x2, Y2 = y2;
            
            if (steep) {
                [X1, Y1] = [Y1, X1];
                [X2, Y2] = [Y2, X2];
            }
            
            if (X1 > X2) {
                [X1, X2] = [X2, X1];
                [Y1, Y2] = [Y2, Y1];
            }
            
            const dx = X2 - X1;
            const dy = Y2 - Y1;
            let gradient = dx === 0 ? 1 : dy / dx;
            
            // Обработка первого конца отрезка
            let xend = Math.round(X1);
            let yend = Y1 + gradient * (xend - X1);
            let xgap = rfpart(X1 + 0.5);
            let xpxl1 = xend;
            let ypxl1 = Math.floor(yend);
            
            if (steep) {
                addPixel(ypxl1, xpxl1, rfpart(yend) * xgap);
                addPixel(ypxl1 + 1, xpxl1, fpart(yend) * xgap);
            } else {
                addPixel(xpxl1, ypxl1, rfpart(yend) * xgap);
                addPixel(xpxl1, ypxl1 + 1, fpart(yend) * xgap);
            }
            
            let intery = yend + gradient;
            
            // Обработка второго конца отрезка
            xend = Math.round(X2);
            yend = Y2 + gradient * (xend - X2);
            xgap = fpart(X2 + 0.5);
            let xpxl2 = xend;
            let ypxl2 = Math.floor(yend);
            
            if (steep) {
                addPixel(ypxl2, xpxl2, rfpart(yend) * xgap);
                addPixel(ypxl2 + 1, xpxl2, fpart(yend) * xgap);
            } else {
                addPixel(xpxl2, ypxl2, rfpart(yend) * xgap);
                addPixel(xpxl2, ypxl2 + 1, fpart(yend) * xgap);
            }
            
            // Основная часть отрезка
            if (steep) {
                for (let x = xpxl1 + 1; x < xpxl2; x++) {
                    addPixel(Math.floor(intery), x, rfpart(intery));
                    addPixel(Math.floor(intery) + 1, x, fpart(intery));
                    intery += gradient;
                }
            } else {
                for (let x = xpxl1 + 1; x < xpxl2; x++) {
                    addPixel(x, Math.floor(intery), rfpart(intery));
                    addPixel(x, Math.floor(intery) + 1, fpart(intery));
                    intery += gradient;
                }
            }
            
            return pixels;
        }
        
        // Основная функция отрисовки
        function draw() {
            // Очищаем предыдущие рисунки
            drawGridAndAxes();
            
            // Получаем параметры фигуры
            let params = {};
            if (isCircleMode) {
                params.cx = parseInt(cxInput.value);
                params.cy = parseInt(cyInput.value);
                params.radius = parseInt(radiusInput.value);
            } else {
                params.x1 = parseInt(x1Input.value);
                params.y1 = parseInt(y1Input.value);
                params.x2 = parseInt(x2Input.value);
                params.y2 = parseInt(y2Input.value);
            }
            
            // Обновляем пояснительные вычисления
            updateCalculations();
            
            // Очищаем статистику
            algorithmStatsEl.innerHTML = '';
            currentDrawings = [];
            
            // Отрисовываем все выбранные алгоритмы
            let totalPixels = 0;
            let totalTime = 0;
            const algorithmStats = [];
            
            activeAlgorithms.forEach(algo => {
                const startTime = performance.now();
                let pixels = [];
                
                try {
                    switch(algo) {
                        case 'step':
                            if (!isCircleMode) {
                                pixels = stepAlgorithm(params.x1, params.y1, params.x2, params.y2);
                            }
                            break;
                        case 'dda':
                            if (!isCircleMode) {
                                pixels = ddaAlgorithm(params.x1, params.y1, params.x2, params.y2);
                            }
                            break;
                        case 'bresenham':
                            if (!isCircleMode) {
                                pixels = bresenhamLine(params.x1, params.y1, params.x2, params.y2);
                            }
                            break;
                        case 'bresenham-circle':
                            if (isCircleMode) {
                                pixels = bresenhamCircle(params.cx, params.cy, params.radius);
                            }
                            break;
                        case 'wu':
                            if (!isCircleMode) {
                                pixels = wuAlgorithm(params.x1, params.y1, params.x2, params.y2);
                            }
                            break;
                        case 'castle-pitway':
                            if (!isCircleMode) {
                                pixels = castlePitwayAlgorithm(params.x1, params.y1, params.x2, params.y2);
                            }
                            break;
                    }
                } catch (error) {
                    console.error(`Ошибка в алгоритме ${algo}:`, error);
                }
                
                const endTime = performance.now();
                const executionTime = endTime - startTime;
                
                // Сохраняем статистику
                algorithmStats.push({
                    name: algorithmNames[algo],
                    time: executionTime,
                    pixels: pixels.length,
                    color: algorithmColors[algo],
                    algo: algo
                });
                
                // Отрисовываем пиксели
                if (algo === 'wu') {
                    // Для алгоритма Ву используем прозрачность
                    pixels.forEach(pixel => {
                        if (pixel.alpha !== undefined) {
                            drawPixelWithAlpha(pixel.x, pixel.y, algorithmColors[algo], pixel.alpha);
                        } else {
                            drawPixel(pixel.x, pixel.y, algorithmColors[algo]);
                        }
                    });
                } else {
                    // Для остальных алгоритмов обычная отрисовка
                    pixels.forEach(pixel => {
                        drawPixel(pixel.x, pixel.y, algorithmColors[algo]);
                    });
                }
                
                totalPixels += pixels.length;
                totalTime += executionTime;
                
                // Сохраняем информацию о рисунке
                if (pixels.length > 0) {
                    currentDrawings.push({
                        algorithm: algo,
                        pixels: pixels,
                        color: algorithmColors[algo],
                        time: executionTime
                    });
                }
            });
            
            // Обновляем общую информацию
            executionTimeEl.textContent = `${totalTime.toFixed(2)} мс`;
            pixelCountEl.textContent = totalPixels;
            
            // Отображаем статистику по каждому алгоритму
            algorithmStats.forEach(stat => {
                const statEl = document.createElement('div');
                statEl.className = 'algo-stat';
                statEl.style.borderLeftColor = stat.color;
                
                statEl.innerHTML = `
                    <div class="stat-name">${stat.name}</div>
                    <div class="stat-value">${stat.time.toFixed(2)} мс</div>
                    <div class="stat-name">${stat.pixels} пикселей</div>
                `;
                
                algorithmStatsEl.appendChild(statEl);
            });
        }
        
        // Функция перерисовки всех сохраненных рисунков
        function redrawAll() {
            drawGridAndAxes();
            
            currentDrawings.forEach(drawing => {
                if (drawing.algorithm === 'wu') {
                    // Для алгоритма Ву используем прозрачность
                    drawing.pixels.forEach(pixel => {
                        if (pixel.alpha !== undefined) {
                            drawPixelWithAlpha(pixel.x, pixel.y, drawing.color, pixel.alpha);
                        } else {
                            drawPixel(pixel.x, pixel.y, drawing.color);
                        }
                    });
                } else {
                    // Для остальных алгоритмов обычная отрисовка
                    drawing.pixels.forEach(pixel => {
                        drawPixel(pixel.x, pixel.y, drawing.color);
                    });
                }
            });
        }

        // Алгоритм Кастла-Питвея (Castle-Pitway) для отрезка
function castlePitwayAlgorithm(x1, y1, x2, y2) {
    const pixels = [];
    
    let x = x1;
    let y = y1;
    const dx = x2 - x1;
    const dy = y2 - y1;
    
    // Определяем направление приращения
    const sx = dx > 0 ? 1 : -1;
    const sy = dy > 0 ? 1 : -1;
    
    // Абсолютные значения приращений
    const adx = Math.abs(dx);
    const ady = Math.abs(dy);
    
    if (adx >= ady) {
        // Более пологий отрезок (|dx| >= |dy|)
        let d = 2 * ady - adx;
        const d1 = 2 * ady;
        const d2 = 2 * (ady - adx);
        
        pixels.push({x: x, y: y});
        
        for (let i = 0; i < adx; i++) {
            x += sx;
            if (d < 0) {
                d += d1;
            } else {
                y += sy;
                d += d2;
            }
            pixels.push({x: x, y: y});
        }
    } else {
        // Более крутой отрезок (|dx| < |dy|)
        let d = 2 * adx - ady;
        const d1 = 2 * adx;
        const d2 = 2 * (adx - ady);
        
        pixels.push({x: x, y: y});
        
        for (let i = 0; i < ady; i++) {
            y += sy;
            if (d < 0) {
                d += d1;
            } else {
                x += sx;
                d += d2;
            }
            pixels.push({x: x, y: y});
        }
    }
    
    return pixels;
}
