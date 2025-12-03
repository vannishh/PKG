 // Элементы DOM для сегментации
        const uploadArea1 = document.getElementById('uploadArea1');
        const imageInput1 = document.getElementById('imageInput1');
        const originalCanvas = document.getElementById('originalCanvas');
        const originalCtx = originalCanvas.getContext('2d');
        const segmentationCanvas = document.getElementById('segmentationCanvas');
        const segmentationCtx = segmentationCanvas.getContext('2d');
        const applySegmentationBtn = document.getElementById('applySegmentation');
        const resetSegmentationBtn = document.getElementById('resetSegmentation');
        const segmentationType = document.getElementById('segmentationType');
        const segmentationInfo = document.getElementById('segmentationInfo');
        
        // Элементы DOM для гистограмм
        const uploadArea2 = document.getElementById('uploadArea2');
        const imageInput2 = document.getElementById('imageInput2');
        const originalCanvas2 = document.getElementById('originalCanvas2');
        const originalCtx2 = originalCanvas2.getContext('2d');
        const processedCanvas = document.getElementById('processedCanvas');
        const processedCtx = processedCanvas.getContext('2d');
        const histogramBefore = document.getElementById('histogramBefore');
        const histogramBeforeCtx = histogramBefore.getContext('2d');
        const histogramAfter = document.getElementById('histogramAfter');
        const histogramAfterCtx = histogramAfter.getContext('2d');
        const equalizeHistogramBtn = document.getElementById('equalizeHistogram');
        const linearContrastBtn = document.getElementById('linearContrast');
        const resetHistogramBtn = document.getElementById('resetHistogram');
        const histogramInfo = document.getElementById('histogramInfo');
        
        // Параметры сегментации
        const sensitivitySlider = document.getElementById('sensitivity');
        const sizeSlider = document.getElementById('size');
        const thresholdSlider = document.getElementById('threshold');
        const sensitivityValue = document.getElementById('sensitivityValue');
        const sizeValue = document.getElementById('sizeValue');
        const thresholdValue = document.getElementById('thresholdValue');
        
        // Переменные для хранения изображений
        let originalImage = null;
        let originalImage2 = null;
        let currentCanvasWidth = 600;
        let currentCanvasHeight = 400;
        
        // Инициализация
        function init() {
            // Установка размеров canvas (увеличиваем размеры)
            setCanvasSize(originalCanvas, currentCanvasWidth, currentCanvasHeight);
            setCanvasSize(segmentationCanvas, currentCanvasWidth, currentCanvasHeight);
            setCanvasSize(originalCanvas2, currentCanvasWidth, currentCanvasHeight);
            setCanvasSize(processedCanvas, currentCanvasWidth, currentCanvasHeight);
            setCanvasSize(histogramBefore, currentCanvasWidth, 250);
            setCanvasSize(histogramAfter, currentCanvasWidth, 250);
            
            // Обработчики событий для сегментации
            uploadArea1.addEventListener('click', () => imageInput1.click());
            uploadArea1.addEventListener('dragover', (e) => {
                e.preventDefault();
                uploadArea1.style.backgroundColor = '#e8f4fc';
            });
            uploadArea1.addEventListener('dragleave', () => {
                uploadArea1.style.backgroundColor = '#f8fafc';
            });
            uploadArea1.addEventListener('drop', (e) => {
                e.preventDefault();
                uploadArea1.style.backgroundColor = '#f8fafc';
                if (e.dataTransfer.files.length) {
                    loadImage(e.dataTransfer.files[0], originalCanvas, originalCtx, 'segmentation');
                }
            });
            
            imageInput1.addEventListener('change', (e) => {
                if (e.target.files.length) {
                    loadImage(e.target.files[0], originalCanvas, originalCtx, 'segmentation');
                }
            });
            
            applySegmentationBtn.addEventListener('click', applySegmentation);
            resetSegmentationBtn.addEventListener('click', resetSegmentation);
            
            // Обработчики событий для гистограмм
            uploadArea2.addEventListener('click', () => imageInput2.click());
            uploadArea2.addEventListener('dragover', (e) => {
                e.preventDefault();
                uploadArea2.style.backgroundColor = '#e8f4fc';
            });
            uploadArea2.addEventListener('dragleave', () => {
                uploadArea2.style.backgroundColor = '#f8fafc';
            });
            uploadArea2.addEventListener('drop', (e) => {
                e.preventDefault();
                uploadArea2.style.backgroundColor = '#f8fafc';
                if (e.dataTransfer.files.length) {
                    loadImage(e.dataTransfer.files[0], originalCanvas2, originalCtx2, 'histogram');
                }
            });
            
            imageInput2.addEventListener('change', (e) => {
                if (e.target.files.length) {
                    loadImage(e.target.files[0], originalCanvas2, originalCtx2, 'histogram');
                }
            });
            
            equalizeHistogramBtn.addEventListener('click', equalizeHistogram);
            linearContrastBtn.addEventListener('click', applyLinearContrast);
            resetHistogramBtn.addEventListener('click', resetHistogram);
            
            // Обработчики для слайдеров
            sensitivitySlider.addEventListener('input', function() {
                sensitivityValue.textContent = this.value + '%';
            });
            
            sizeSlider.addEventListener('input', function() {
                sizeValue.textContent = this.value + 'px';
            });
            
            thresholdSlider.addEventListener('input', function() {
                thresholdValue.textContent = this.value + '%';
            });
            
            // Деактивируем кнопки до загрузки изображений
            applySegmentationBtn.disabled = true;
            resetSegmentationBtn.disabled = true;
            equalizeHistogramBtn.disabled = true;
            linearContrastBtn.disabled = true;
            resetHistogramBtn.disabled = true;
        }
        
        // Установка размеров canvas
        function setCanvasSize(canvas, width, height) {
            canvas.width = width;
            canvas.height = height;
            canvas.style.width = '100%';
            canvas.style.height = '100%';
        }
        
        // Загрузка изображения
        function loadImage(file, canvas, ctx, type) {
            const reader = new FileReader();
            
            reader.onload = function(e) {
                const img = new Image();
                
                img.onload = function() {
                    // Определяем размеры для отображения
                    let displayWidth, displayHeight;
                    
                    if (img.width > img.height) {
                        displayWidth = Math.min(currentCanvasWidth, img.width);
                        displayHeight = (img.height * displayWidth) / img.width;
                    } else {
                        displayHeight = Math.min(currentCanvasHeight, img.height);
                        displayWidth = (img.width * displayHeight) / img.height;
                    }
                    
                    displayWidth = Math.min(displayWidth * 1.2, currentCanvasWidth);
                    displayHeight = Math.min(displayHeight * 1.2, currentCanvasHeight);
                    
                    const x = (canvas.width - displayWidth) / 2;
                    const y = (canvas.height - displayHeight) / 2;
                    
                    // Очищаем canvas и рисуем изображение
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    ctx.drawImage(img, x, y, displayWidth, displayHeight);
                    
                    // Сохраняем изображение в переменной
                    if (type === 'segmentation') {
                        originalImage = {
                            image: img,
                            x: x,
                            y: y,
                            width: displayWidth,
                            height: displayHeight
                        };
                        
                        applySegmentationBtn.disabled = false;
                        resetSegmentationBtn.disabled = false;
                        segmentationInfo.textContent = 'Изображение загружено. Выберите тип сегментации, настройте параметры и нажмите "Применить сегментацию". Для обнаружения точек используйте изображения с четкими уголками и деталями.';
                    } else if (type === 'histogram') {
                        originalImage2 = {
                            image: img,
                            x: x,
                            y: y,
                            width: displayWidth,
                            height: displayHeight
                        };
                        
                        // Копируем изображение в processedCanvas
                        processedCtx.clearRect(0, 0, processedCanvas.width, processedCanvas.height);
                        processedCtx.drawImage(img, x, y, displayWidth, displayHeight);
                        
                        equalizeHistogramBtn.disabled = false;
                        linearContrastBtn.disabled = false;
                        resetHistogramBtn.disabled = false;
                        
                        // Строим гистограмму исходного изображения
                        drawHistogram(originalCanvas2, histogramBeforeCtx, originalImage2);
                        drawHistogram(processedCanvas, histogramAfterCtx, originalImage2);
                        
                        histogramInfo.innerHTML = '<strong>Изображение загружено.</strong> Нажмите "Эквализация гистограммы" для выравнивания распределения яркости или "Линейное контрастирование" для растяжения диапазона яркости.';
                    }
                };
                
                img.src = e.target.result;
            };
            
            reader.readAsDataURL(file);
        }
        
        // Применение сегментации
        function applySegmentation() {
            if (!originalImage) return;
            
            // Получаем значения параметров
            const sensitivity = parseInt(sensitivitySlider.value) / 100;
            const size = parseInt(sizeSlider.value);
            const thresholdValue = parseInt(thresholdSlider.value) / 100;
            
            // Копируем изображение на canvas сегментации
            segmentationCtx.clearRect(0, 0, segmentationCanvas.width, segmentationCanvas.height);
            segmentationCtx.drawImage(originalImage.image, originalImage.x, originalImage.y, originalImage.width, originalImage.height);
            
            // Получаем данные изображения
            const imageData = segmentationCtx.getImageData(0, 0, segmentationCanvas.width, segmentationCanvas.height);
            const data = imageData.data;
            
            // Применяем выбранный тип сегментации
            const type = segmentationType.value;
            
            switch(type) {
                case 'edges':
                    detectEdges(data, segmentationCanvas.width, segmentationCanvas.height, sensitivity, thresholdValue);
                    segmentationInfo.innerHTML = `<strong>Применено обнаружение перепадов яркости (краев)</strong><br>
                    Использован оператор Собеля. Настройки: чувствительность ${sensitivitySlider.value}%, порог ${thresholdSlider.value}%`;
                    break;
                case 'lines':
                    detectLines(data, segmentationCanvas.width, segmentationCanvas.height, sensitivity, size, thresholdValue);
                    segmentationInfo.innerHTML = `<strong>Применено обнаружение линий</strong><br>
                    Использован многонаправленный детектор линий. Настройки: чувствительность ${sensitivitySlider.value}%, толщина ${size}px, порог ${thresholdSlider.value}%`;
                    break;
                case 'points':
                    detectPointsFixed(data, segmentationCanvas.width, segmentationCanvas.height, sensitivity, size, thresholdValue);
                    segmentationInfo.innerHTML = `<strong>Применено обнаружение точек</strong><br>
                    Использован детектор углов. Найдено точек: <span id="pointsCount">0</span>. Настройки: чувствительность ${sensitivitySlider.value}%, размер ${size}px, порог ${thresholdSlider.value}%`;
                    break;
            }
            
            // Обновляем canvas с результатами
            segmentationCtx.putImageData(imageData, 0, 0);
        }
        
        // Обнаружение краев
        function detectEdges(data, width, height, sensitivity, threshold) {
            // Ядро оператора Собеля
            const sobelX = [
                [-1, 0, 1],
                [-2, 0, 2],
                [-1, 0, 1]
            ];
            
            const sobelY = [
                [-1, -2, -1],
                [0, 0, 0],
                [1, 2, 1]
            ];
            
            // Создаем копию данных для вычислений
            const originalData = new Uint8ClampedArray(data);
            const edgeMap = new Array(width * height).fill(0);
            let maxMagnitude = 0;
            
            // Вычисляем градиенты
            for (let y = 1; y < height - 1; y++) {
                for (let x = 1; x < width - 1; x++) {
                    let gx = 0, gy = 0;
                    
                    // Применяем оператор Собеля
                    for (let ky = -1; ky <= 1; ky++) {
                        for (let kx = -1; kx <= 1; kx++) {
                            const pixelIndex = ((y + ky) * width + (x + kx)) * 4;
                            const brightness = (originalData[pixelIndex] + originalData[pixelIndex + 1] + originalData[pixelIndex + 2]) / 3;
                            
                            gx += brightness * sobelX[ky + 1][kx + 1];
                            gy += brightness * sobelY[ky + 1][kx + 1];
                        }
                    }
                    
                    // Вычисляем величину градиента
                    const magnitude = Math.sqrt(gx * gx + gy * gy);
                    edgeMap[y * width + x] = magnitude;
                    
                    if (magnitude > maxMagnitude) {
                        maxMagnitude = magnitude;
                    }
                }
            }
            
            // Применяем порог с учетом чувствительности
            const edgeThreshold = maxMagnitude * sensitivity * threshold;
            
            // Применяем границы
            for (let y = 0; y < height; y++) {
                for (let x = 0; x < width; x++) {
                    const pixelIndex = (y * width + x) * 4;
                    const magnitude = edgeMap[y * width + x];
                    
                    const value = magnitude > edgeThreshold ? 255 : 0;
                    
                    data[pixelIndex] = value;     // R
                    data[pixelIndex + 1] = value; // G
                    data[pixelIndex + 2] = value; // B
                }
            }
        }
        
        // Обнаружение линий
        function detectLines(data, width, height, sensitivity, size, threshold) {
            // Создаем копию данных для вычислений
            const originalData = new Uint8ClampedArray(data);
            
            // Детектор линий в нескольких направлениях
            const lineMasks = [
                // Горизонтальные линии
                [
                    [-1, -1, -1],
                    [2, 2, 2],
                    [-1, -1, -1]
                ],
                // Вертикальные линии
                [
                    [-1, 2, -1],
                    [-1, 2, -1],
                    [-1, 2, -1]
                ],
                // Диагональные линии (45°)
                [
                    [-1, -1, 2],
                    [-1, 2, -1],
                    [2, -1, -1]
                ],
                // Диагональные линии (135°)
                [
                    [2, -1, -1],
                    [-1, 2, -1],
                    [-1, -1, 2]
                ]
            ];
            
            const lineMap = new Array(width * height).fill(0);
            let maxResponse = 0;
            
            // Вычисляем отклики детекторов линий
            for (let y = 1; y < height - 1; y++) {
                for (let x = 1; x < width - 1; x++) {
                    let maxMaskResponse = 0;
                    
                    for (const mask of lineMasks) {
                        let response = 0;
                        
                        for (let ky = -1; ky <= 1; ky++) {
                            for (let kx = -1; kx <= 1; kx++) {
                                const pixelIndex = ((y + ky) * width + (x + kx)) * 4;
                                const brightness = (originalData[pixelIndex] + originalData[pixelIndex + 1] + originalData[pixelIndex + 2]) / 3;
                                
                                response += brightness * mask[ky + 1][kx + 1];
                            }
                        }
                        
                        maxMaskResponse = Math.max(maxMaskResponse, Math.abs(response));
                    }
                    
                    lineMap[y * width + x] = maxMaskResponse;
                    
                    if (maxMaskResponse > maxResponse) {
                        maxResponse = maxMaskResponse;
                    }
                }
            }
            
            // Применяем порог
            const lineThreshold = maxResponse * sensitivity * threshold;
            
            // Рисуем линии
            for (let y = 0; y < height; y++) {
                for (let x = 0; x < width; x++) {
                    const pixelIndex = (y * width + x) * 4;
                    const response = lineMap[y * width + x];
                    
                    if (response > lineThreshold) {
                        // Тонкая линия
                        data[pixelIndex] = 255;
                        data[pixelIndex + 1] = 255;
                        data[pixelIndex + 2] = 255;
                        
                        // Делаем линии толще при необходимости
                        if (size > 1) {
                            for (let dy = -Math.floor(size/2); dy <= Math.floor(size/2); dy++) {
                                for (let dx = -Math.floor(size/2); dx <= Math.floor(size/2); dx++) {
                                    if (dx === 0 && dy === 0) continue;
                                    
                                    const ny = y + dy;
                                    const nx = x + dx;
                                    
                                    if (ny >= 0 && ny < height && nx >= 0 && nx < width) {
                                        const idx = (ny * width + nx) * 4;
                                        data[idx] = 200;
                                        data[idx + 1] = 200;
                                        data[idx + 2] = 200;
                                    }
                                }
                            }
                        }
                    } else {
                        // Не линия - черный цвет
                        data[pixelIndex] = 0;
                        data[pixelIndex + 1] = 0;
                        data[pixelIndex + 2] = 0;
                    }
                }
            }
        }
        
        // ИСПРАВЛЕННОЕ обнаружение точек
        function detectPointsFixed(data, width, height, sensitivity, pointSize, threshold) {
            // Создаем копию данных для вычислений
            const originalData = new Uint8ClampedArray(data);
            
            // Матрица для хранения значений углов
            const cornerMap = new Array(width * height).fill(0);
            let maxResponse = 0;
            
            // Упрощенный детектор углов (адаптивный)
            const windowSize = 2;
            
            for (let y = windowSize; y < height - windowSize; y++) {
                for (let x = windowSize; x < width - windowSize; x++) {
                    // Вычисляем градиенты в окрестности
                    let sumIx = 0, sumIy = 0, sumIxy = 0;
                    let count = 0;
                    
                    for (let wy = -windowSize; wy <= windowSize; wy++) {
                        for (let wx = -windowSize; wx <= windowSize; wx++) {
                            const ny = y + wy;
                            const nx = x + wx;
                            
                            if (ny > 0 && ny < height-1 && nx > 0 && nx < width-1) {
                                // Вычисляем градиенты с помощью простой разности
                                const idxCenter = (ny * width + nx) * 4;
                                const idxRight = (ny * width + (nx+1)) * 4;
                                const idxBottom = ((ny+1) * width + nx) * 4;
                                
                                const brightnessCenter = (originalData[idxCenter] + originalData[idxCenter+1] + originalData[idxCenter+2]) / 3;
                                const brightnessRight = (originalData[idxRight] + originalData[idxRight+1] + originalData[idxRight+2]) / 3;
                                const brightnessBottom = (originalData[idxBottom] + originalData[idxBottom+1] + originalData[idxBottom+2]) / 3;
                                
                                const Ix = brightnessRight - brightnessCenter;
                                const Iy = brightnessBottom - brightnessCenter;
                                
                                sumIx += Ix * Ix;
                                sumIy += Iy * Iy;
                                sumIxy += Ix * Iy;
                                count++;
                            }
                        }
                    }
                    
                    // Вычисляем угол (упрощенная версия детектора Харриса)
                    if (count > 0) {
                        const avgIx = sumIx / count;
                        const avgIy = sumIy / count;
                        const avgIxy = sumIxy / count;
                        
                        // Вычисляем детерминант и след
                        const det = avgIx * avgIy - avgIxy * avgIxy;
                        const trace = avgIx + avgIy;
                        
                        // Упрощенная формула для углов
                        const response = trace > 0 ? det / trace : 0;
                        cornerMap[y * width + x] = response;
                        
                        if (response > maxResponse) {
                            maxResponse = response;
                        }
                    }
                }
            }
            
            // Применяем порог
            const cornerThreshold = maxResponse * sensitivity * threshold * 0.5;
            let pointsCount = 0;
            
            // Сначала очищаем все пиксели
            for (let i = 0; i < data.length; i += 4) {
                data[i] = 0;
                data[i+1] = 0;
                data[i+2] = 0;
            }
            
            // Находим локальные максимумы и рисуем точки
            for (let y = windowSize; y < height - windowSize; y++) {
                for (let x = windowSize; x < width - windowSize; x++) {
                    const response = cornerMap[y * width + x];
                    
                    if (response > cornerThreshold) {
                        // Проверяем, является ли это локальным максимумом
                        let isLocalMax = true;
                        
                        for (let dy = -1; dy <= 1 && isLocalMax; dy++) {
                            for (let dx = -1; dx <= 1 && isLocalMax; dx++) {
                                if (dy === 0 && dx === 0) continue;
                                
                                const ny = y + dy;
                                const nx = x + dx;
                                
                                if (ny >= 0 && ny < height && nx >= 0 && nx < width) {
                                    if (cornerMap[ny * width + nx] > response) {
                                        isLocalMax = false;
                                    }
                                }
                            }
                        }
                        
                        if (isLocalMax) {
                            pointsCount++;
                            
                            // Рисуем точку
                            const radius = Math.max(1, Math.floor(pointSize / 2));
                            
                            for (let dy = -radius; dy <= radius; dy++) {
                                for (let dx = -radius; dx <= radius; dx++) {
                                    const dist = Math.sqrt(dx*dx + dy*dy);
                                    
                                    if (dist <= radius) {
                                        const ny = y + dy;
                                        const nx = x + dx;
                                        
                                        if (ny >= 0 && ny < height && nx >= 0 && nx < width) {
                                            const idx = (ny * width + nx) * 4;
                                            // Белые точки
                                            data[idx] = 255;
                                            data[idx + 1] = 255;
                                            data[idx + 2] = 255;
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
            
            // Обновляем счетчик точек
            setTimeout(() => {
                const pointsCountElement = document.getElementById('pointsCount');
                if (pointsCountElement) {
                    pointsCountElement.textContent = pointsCount;
                }
            }, 0);
            
            return pointsCount;
        }
        
        // Сброс сегментации
        function resetSegmentation() {
            if (!originalImage) return;
            
            // Восстанавливаем исходное изображение
            segmentationCtx.clearRect(0, 0, segmentationCanvas.width, segmentationCanvas.height);
            segmentationCtx.drawImage(originalImage.image, originalImage.x, originalImage.y, originalImage.width, originalImage.height);
            
            segmentationInfo.innerHTML = '<strong>Сегментация сброшена.</strong> Исходное изображение восстановлено. Выберите тип сегментации и настройте параметры для повторной обработки.';
        }
        
        // Эквализация гистограммы
        function equalizeHistogram() {
            if (!originalImage2) return;
            
            // Копируем изображение
            processedCtx.clearRect(0, 0, processedCanvas.width, processedCanvas.height);
            processedCtx.drawImage(originalImage2.image, originalImage2.x, originalImage2.y, originalImage2.width, originalImage2.height);
            
            // Получаем данные изображения
            const imageData = processedCtx.getImageData(
                Math.max(0, originalImage2.x), 
                Math.max(0, originalImage2.y), 
                originalImage2.width, 
                originalImage2.height
            );
            const data = imageData.data;
            
            // Вычисляем гистограмму яркости
            const histogram = new Array(256).fill(0);
            
            for (let i = 0; i < data.length; i += 4) {
                const brightness = Math.floor((data[i] + data[i + 1] + data[i + 2]) / 3);
                histogram[brightness]++;
            }
            
            // Вычисляем кумулятивную гистограмму
            const totalPixels = (data.length / 4);
            const cumulativeHistogram = new Array(256).fill(0);
            cumulativeHistogram[0] = histogram[0];
            
            for (let i = 1; i < 256; i++) {
                cumulativeHistogram[i] = cumulativeHistogram[i - 1] + histogram[i];
            }
            
            // Нормализуем кумулятивную гистограмму
            const normalizedHistogram = new Array(256).fill(0);
            for (let i = 0; i < 256; i++) {
                normalizedHistogram[i] = Math.floor((cumulativeHistogram[i] / totalPixels) * 255);
            }
            
            // Применяем преобразование к изображению
            for (let i = 0; i < data.length; i += 4) {
                const brightness = Math.floor((data[i] + data[i + 1] + data[i + 2]) / 3);
                const newBrightness = normalizedHistogram[brightness];
                
                // Масштабируем цветовые каналы
                const scaleFactor = newBrightness / (brightness || 1);
                
                data[i] = Math.min(255, Math.max(0, data[i] * scaleFactor));     // R
                data[i + 1] = Math.min(255, Math.max(0, data[i + 1] * scaleFactor)); // G
                data[i + 2] = Math.min(255, Math.max(0, data[i + 2] * scaleFactor)); // B
            }
            
            // Обновляем canvas
            processedCtx.putImageData(imageData, originalImage2.x, originalImage2.y);
            
            // Обновляем гистограммы
            drawHistogram(originalCanvas2, histogramBeforeCtx, originalImage2);
            drawHistogram(processedCanvas, histogramAfterCtx, originalImage2);
            
            histogramInfo.innerHTML = '<strong>Применена эквализация гистограммы.</strong> Распределение яркости выровнено, контраст изображения улучшен. Обратите внимание на изменения в гистограмме - она стала более равномерной.';
        }
        
        // ИСПРАВЛЕННОЕ линейное контрастирование
        function applyLinearContrast() {
            if (!originalImage2) return;
            
            // Копируем изображение
            processedCtx.clearRect(0, 0, processedCanvas.width, processedCanvas.height);
            processedCtx.drawImage(originalImage2.image, originalImage2.x, originalImage2.y, originalImage2.width, originalImage2.height);
            
            // Получаем данные изображения
            const imageData = processedCtx.getImageData(
                Math.max(0, originalImage2.x), 
                Math.max(0, originalImage2.y), 
                originalImage2.width, 
                originalImage2.height
            );
            const data = imageData.data;
            
            // Находим минимальную и максимальную яркость
            let minBrightness = 255;
            let maxBrightness = 0;
            
            for (let i = 0; i < data.length; i += 4) {
                const r = data[i];
                const g = data[i + 1];
                const b = data[i + 2];
                const brightness = (r + g + b) / 3;
                
                if (brightness < minBrightness) minBrightness = brightness;
                if (brightness > maxBrightness) maxBrightness = brightness;
            }
            
            console.log(`Min brightness: ${minBrightness}, Max brightness: ${maxBrightness}`);
            
            // Если диапазон слишком мал, немного расширяем его
            if (maxBrightness - minBrightness < 10) {
                minBrightness = Math.max(0, minBrightness - 5);
                maxBrightness = Math.min(255, maxBrightness + 5);
            }
            
            // Применяем линейное контрастирование
            const range = maxBrightness - minBrightness;
            
            if (range > 0) {
                for (let i = 0; i < data.length; i += 4) {
                    const r = data[i];
                    const g = data[i + 1];
                    const b = data[i + 2];
                    const brightness = (r + g + b) / 3;
                    
                    // Вычисляем новую яркость с линейным растяжением
                    const newBrightness = ((brightness - minBrightness) / range) * 255;
                    
                    // Корректируем каждый цветовой канал пропорционально
                    const scale = newBrightness / (brightness || 1);
                    
                    data[i] = Math.min(255, Math.max(0, r * scale));     // R
                    data[i + 1] = Math.min(255, Math.max(0, g * scale)); // G
                    data[i + 2] = Math.min(255, Math.max(0, b * scale)); // B
                }
            }
            
            // Обновляем canvas
            processedCtx.putImageData(imageData, originalImage2.x, originalImage2.y);
            
            // Обновляем гистограммы
            drawHistogram(originalCanvas2, histogramBeforeCtx, originalImage2);
            drawHistogram(processedCanvas, histogramAfterCtx, originalImage2);
            
            histogramInfo.innerHTML = `<strong>Применено линейное контрастирование.</strong> Диапазон яркости растянут от ${minBrightness.toFixed(1)} до ${maxBrightness.toFixed(1)}. Обратите внимание, как гистограмма заполнила весь доступный диапазон яркости.`;
        }
        
        // Построение гистограммы
        function drawHistogram(sourceCanvas, ctx, imgInfo) {
            // Получаем данные изображения только в области изображения
            const x = Math.max(0, imgInfo.x);
            const y = Math.max(0, imgInfo.y);
            const width = Math.min(imgInfo.width, sourceCanvas.width - x);
            const height = Math.min(imgInfo.height, sourceCanvas.height - y);
            
            // Если область некорректна, используем весь canvas
            let imageData;
            if (width > 0 && height > 0) {
                imageData = sourceCanvas.getContext('2d').getImageData(x, y, width, height);
            } else {
                imageData = sourceCanvas.getContext('2d').getImageData(0, 0, sourceCanvas.width, sourceCanvas.height);
            }
            
            const data = imageData.data;
            
            // Вычисляем гистограмму яркости
            const histogram = new Array(256).fill(0);
            
            for (let i = 0; i < data.length; i += 4) {
                const brightness = Math.floor((data[i] + data[i + 1] + data[i + 2]) / 3);
                histogram[brightness]++;
            }
            
            // Находим максимальное значение в гистограмме
            let maxCount = 0;
            for (let i = 0; i < 256; i++) {
                if (histogram[i] > maxCount) {
                    maxCount = histogram[i];
                }
            }
            
            // Очищаем canvas гистограммы
            ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
            
            // Рисуем фон
            ctx.fillStyle = '#f8f9fa';
            ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
            
            // Рисуем сетку
            ctx.strokeStyle = '#e0e0e0';
            ctx.lineWidth = 0.5;
            
            // Вертикальные линии
            for (let i = 0; i <= 10; i++) {
                const x = (i / 10) * ctx.canvas.width;
                ctx.beginPath();
                ctx.moveTo(x, 0);
                ctx.lineTo(x, ctx.canvas.height);
                ctx.stroke();
            }
            
            // Горизонтальные линии
            for (let i = 0; i <= 5; i++) {
                const y = (i / 5) * ctx.canvas.height;
                ctx.beginPath();
                ctx.moveTo(0, y);
                ctx.lineTo(ctx.canvas.width, y);
                ctx.stroke();
            }
            
            // Рисуем гистограмму с плавными столбцами
            const barWidth = ctx.canvas.width / 256;
            
            // Градиент для гистограммы
            const gradient = ctx.createLinearGradient(0, 0, 0, ctx.canvas.height);
            gradient.addColorStop(0, '#3498db');
            gradient.addColorStop(1, '#2980b9');
            ctx.fillStyle = gradient;
            
            // Рисуем плавную гистограмму
            ctx.beginPath();
            ctx.moveTo(0, ctx.canvas.height);
            
            for (let i = 0; i < 256; i++) {
                const barHeight = (histogram[i] / maxCount) * ctx.canvas.height * 0.85;
                const x = i * barWidth;
                const y = ctx.canvas.height - barHeight;
                
                if (i === 0) {
                    ctx.lineTo(x, y);
                } else {
                    // Плавные линии между точками
                    const prevX = (i-1) * barWidth;
                    const prevY = ctx.canvas.height - (histogram[i-1] / maxCount) * ctx.canvas.height * 0.85;
                    
                    const cp1x = prevX + barWidth/2;
                    const cp1y = prevY;
                    const cp2x = x - barWidth/2;
                    const cp2y = y;
                    
                    ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x, y);
                }
            }
            
            ctx.lineTo(ctx.canvas.width, ctx.canvas.height);
            ctx.closePath();
            ctx.fill();
            
            // Рисуем ось
            ctx.strokeStyle = '#333';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(0, ctx.canvas.height);
            ctx.lineTo(ctx.canvas.width, ctx.canvas.height);
            ctx.moveTo(0, 0);
            ctx.lineTo(0, ctx.canvas.height);
            ctx.stroke();
            
            // Подписи осей
            ctx.fillStyle = '#333';
            ctx.font = 'bold 12px Arial';
            ctx.textAlign = 'center';
            
            // Подписи по оси X
            for (let i = 0; i <= 10; i++) {
                const x = (i / 10) * ctx.canvas.width;
                const value = Math.floor(i * 25.5);
                ctx.fillText(value.toString(), x, ctx.canvas.height - 5);
            }
            
            // Подписи по оси Y
            ctx.save();
            ctx.translate(15, ctx.canvas.height / 2);
            ctx.rotate(-Math.PI / 2);
            ctx.textAlign = 'center';
            ctx.fillText('Количество пикселей', 0, 0);
            ctx.restore();
            
            // Заголовок оси X
            ctx.textAlign = 'center';
            ctx.fillText('Яркость (0-255)', ctx.canvas.width / 2, ctx.canvas.height - 20);
            
            // Статистика
            ctx.font = '12px Arial';
            ctx.textAlign = 'left';
            ctx.fillStyle = '#2c3e50';
            
            let totalPixels = 0;
            let sumBrightness = 0;
            for (let i = 0; i < 256; i++) {
                totalPixels += histogram[i];
                sumBrightness += histogram[i] * i;
            }
            
            const avgBrightness = totalPixels > 0 ? (sumBrightness / totalPixels).toFixed(1) : 0;
            
            // Находим моду (наиболее часто встречающуюся яркость)
            let mode = 0;
            let modeCount = 0;
            for (let i = 0; i < 256; i++) {
                if (histogram[i] > modeCount) {
                    modeCount = histogram[i];
                    mode = i;
                }
            }
            
            ctx.fillText(`Всего пикселей: ${totalPixels.toLocaleString()}`, 10, 20);
            ctx.fillText(`Средняя яркость: ${avgBrightness}`, 10, 40);
            ctx.fillText(`Мода: ${mode}`, 10, 60);
        }
        
        // Сброс гистограмм
        function resetHistogram() {
            if (!originalImage2) return;
            
            // Восстанавливаем исходное изображение
            processedCtx.clearRect(0, 0, processedCanvas.width, processedCanvas.height);
            processedCtx.drawImage(originalImage2.image, originalImage2.x, originalImage2.y, originalImage2.width, originalImage2.height);
            
            // Обновляем гистограммы
            drawHistogram(originalCanvas2, histogramBeforeCtx, originalImage2);
            drawHistogram(processedCanvas, histogramAfterCtx, originalImage2);
            
            histogramInfo.innerHTML = '<strong>Гистограммы сброшены.</strong> Исходное изображение восстановлено. Выберите метод обработки гистограммы для применения.';
        }
        
        // Инициализация приложения
        window.addEventListener('load', init);