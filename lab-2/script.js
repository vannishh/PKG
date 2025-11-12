document.addEventListener('DOMContentLoaded', function() {
    const fileInput = document.getElementById('fileInput');
    const folderInput = document.getElementById('folderInput');
    const selectFilesBtn = document.getElementById('selectFilesBtn');
    const selectFolderBtn = document.getElementById('selectFolderBtn');
    const uploadArea = document.getElementById('uploadArea');
    const progressSection = document.getElementById('progressSection');
    const progressFill = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');
    const resultsSection = document.getElementById('resultsSection');
    const resultsBody = document.getElementById('resultsBody');
    const fileCount = document.getElementById('fileCount');
    const exportBtn = document.getElementById('exportBtn');
    const clearBtn = document.getElementById('clearBtn');
    
    let fileResults = [];
    
    selectFilesBtn.addEventListener('click', () => fileInput.click());
    selectFolderBtn.addEventListener('click', () => folderInput.click());
    
    fileInput.addEventListener('change', handleFileSelection);
    folderInput.addEventListener('change', handleFileSelection);
    
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.style.borderColor = '#2980b9';
        uploadArea.style.backgroundColor = '#e8f4fc';
    });
    
    uploadArea.addEventListener('dragleave', () => {
        uploadArea.style.borderColor = '#3498db';
        uploadArea.style.backgroundColor = '#f8fafc';
    });
    
    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.style.borderColor = '#3498db';
        uploadArea.style.backgroundColor = '#f8fafc';
        
        if (e.dataTransfer.items) {
            const files = [];
            for (let i = 0; i < e.dataTransfer.items.length; i++) {
                if (e.dataTransfer.items[i].kind === 'file') {
                    files.push(e.dataTransfer.items[i].getAsFile());
                }
            }
            processFiles(files);
        } else {
            processFiles(e.dataTransfer.files);
        }
    });
    
    exportBtn.addEventListener('click', exportToCSV);
    clearBtn.addEventListener('click', clearResults);
    
    function handleFileSelection(e) {
        const files = Array.from(e.target.files);
        processFiles(files);
    }
    
    function processFiles(files) {
        const supportedFormats = ['jpg', 'jpeg', 'gif', 'tif', 'tiff', 'bmp', 'png', 'pcx'];
        const imageFiles = files.filter(file => {
            const extension = file.name.split('.').pop().toLowerCase();
            return supportedFormats.includes(extension);
        });
        
        if (imageFiles.length === 0) {
            alert('Не найдено файлов поддерживаемых форматов (jpg, gif, tif, bmp, png, pcx)');
            return;
        }
        
        if (imageFiles.length > 100000) {
            alert('Выбрано слишком много файлов. Максимальное количество: 100000');
            return;
        }
        
        progressSection.style.display = 'block';
        progressFill.style.width = '0%';
        progressText.textContent = `Обработано 0 из ${imageFiles.length} файлов`;
        
        fileResults = [];
        processFilesSequentially(imageFiles, 0);
    }
    
    function processFilesSequentially(files, index) {
        if (index >= files.length) {
            displayResults();
            progressSection.style.display = 'none';
            return;
        }
        
        const file = files[index];
        analyzeImageFile(file)
            .then(result => {
                fileResults.push(result);
                
                const progress = ((index + 1) / files.length) * 100;
                progressFill.style.width = `${progress}%`;
                progressText.textContent = `Обработано ${index + 1} из ${files.length} файлов`;
                
                setTimeout(() => processFilesSequentially(files, index + 1), 0);
            })
            .catch(error => {
                console.error(`Ошибка при обработке файла ${file.name}:`, error);
                
                fileResults.push({
                    name: file.name,
                    size: 'Ошибка',
                    resolution: 'Ошибка',
                    colorDepth: 'Ошибка',
                    compression: 'Ошибка',
                    format: 'Ошибка',
                    fileSize: formatFileSize(file.size)
                });
                
                const progress = ((index + 1) / files.length) * 100;
                progressFill.style.width = `${progress}%`;
                progressText.textContent = `Обработано ${index + 1} из ${files.length} файлов`;
                
                setTimeout(() => processFilesSequentially(files, index + 1), 0);
            });
    }
    
    function analyzeImageFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = function(e) {
                const dataUrl = e.target.result;
                
                loadImage(dataUrl, (img) => {
                    const format = getFileFormat(file.name);
                    
                    loadImage.parseMetaData(dataUrl, (data) => {
                        const resolution = getResolution(data, format);
                        
                        const colorDepth = getColorDepthFromFormat(format);
                        
                        const compression = getCompressionInfo(data, format);
                        
                        resolve({
                            name: file.name,
                            size: `${img.naturalWidth || img.width} × ${img.naturalHeight || img.height} пикселей`,
                            resolution: resolution,
                            colorDepth: colorDepth,
                            compression: compression,
                            format: format,
                            fileSize: formatFileSize(file.size)
                        });
                    });
                }, {
                    meta: false,
                    canvas: false,
                    orientation: true
                });
            };
            
            reader.onerror = function() {
                reject(new Error('Ошибка чтения файла'));
            };
            
            reader.readAsDataURL(file);
        });
    }
    
    function getResolution(data, format) {
        let resolution = 'Не указано';
        
        if (data.exif) {
            const xResolution = data.exif.get('XResolution');
            const yResolution = data.exif.get('YResolution');
            
            if (xResolution && yResolution) {
                resolution = `${Math.round(xResolution)} × ${Math.round(yResolution)} DPI`;
            } else if (xResolution) {
                resolution = `${Math.round(xResolution)} DPI`;
            }
        }
        
        if (resolution === 'Не указано') {
            switch(format) {
                case 'JPEG':
                    resolution = '72 DPI (стандартное)';
                    break;
                case 'PNG':
                    resolution = '96 DPI (стандартное)';
                    break;
                case 'BMP':
                    resolution = '96 DPI (стандартное)';
                    break;
                case 'GIF':
                    resolution = '72 DPI (стандартное)';
                    break;
                default:
                    resolution = 'Неизвестно';
            }
        }
        
        return resolution;
    }
    
    function getColorDepthFromFormat(format) {
        switch(format) {
            case 'JPEG':
                return '24 бит (True Color)';
            case 'PNG':
                return '32 бит (RGBA)';
            case 'BMP':
                return '24 бит (True Color)';
            case 'GIF':
                return '8 бит (256 цветов)';
            case 'TIFF':
                return '24-48 бит';
            case 'PCX':
                return '8-24 бит';
            default:
                return 'Неизвестно';
        }
    }
    
    function getFileFormat(filename) {
        const extension = filename.split('.').pop().toLowerCase();
        const formatMap = {
            'jpg': 'JPEG',
            'jpeg': 'JPEG',
            'gif': 'GIF',
            'tif': 'TIFF',
            'tiff': 'TIFF',
            'bmp': 'BMP',
            'png': 'PNG',
            'pcx': 'PCX'
        };
        return formatMap[extension] || extension.toUpperCase();
    }
    
    function getCompressionInfo(data, format) {
        let compression = 'Неизвестно';
        
        switch(format) {
            case 'JPEG':
                compression = 'JPEG (с потерями)';
                break;
            case 'PNG':
                compression = 'Deflate (без потерь)';
                break;
            case 'GIF':
                compression = 'LZW (без потерь)';
                break;
            case 'TIFF':
                compression = 'Зависит от типа (LZW, ZIP, JPEG)';
                break;
            case 'BMP':
                compression = 'Без сжатия или RLE';
                break;
            case 'PCX':
                compression = 'RLE (без потерь)';
                break;
            default:
                compression = 'Неизвестно';
        }
        
        return compression;
    }
    
    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Б';
        const k = 1024;
        const sizes = ['Б', 'КБ', 'МБ', 'ГБ'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
    
    function displayResults() {
        resultsBody.innerHTML = '';
        
        fileResults.forEach(result => {
            const row = document.createElement('tr');
            
            row.innerHTML = `
                <td>${result.name}</td>
                <td>${result.size}</td>
                <td>${result.resolution}</td>
                <td>${result.colorDepth}</td>
                <td>${result.compression}</td>
                <td>${result.format}</td>
                <td>${result.fileSize}</td>
            `;
            
            resultsBody.appendChild(row);
        });
        
        resultsSection.style.display = 'block';
        fileCount.textContent = `Обработано файлов: ${fileResults.length}`;
        fileCount.style.display = 'block';
    }
    
    function exportToCSV() {
        if (fileResults.length === 0) {
            alert('Нет данных для экспорта');
            return;
        }
        
        const headers = ['Имя файла', 'Размер изображения', 'Разрешение (DPI)', 'Глубина цвета', 'Сжатие', 'Формат', 'Размер файла'];
        
        let csvContent = '\uFEFF';
        
        csvContent += headers.join(';') + '\n';
        
        fileResults.forEach(result => {
            const row = [
                result.name,
                result.size,
                result.resolution,
                result.colorDepth,
                result.compression,
                result.format,
                result.fileSize
            ].map(field => {
                return `"${String(field).replace(/"/g, '""')}"`;
            }).join(';');
            
            csvContent += row + '\n';
        });
        
        const blob = new Blob([csvContent], { 
            type: 'text/csv;charset=utf-8;' 
        });
        
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        
        link.setAttribute('href', url);
        link.setAttribute('download', 'image_analysis_results.csv');
        link.style.visibility = 'hidden';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        setTimeout(() => URL.revokeObjectURL(url), 100);
    }
    
    function clearResults() {
        fileResults = [];
        resultsBody.innerHTML = '';
        resultsSection.style.display = 'none';
        fileCount.style.display = 'none';
        fileInput.value = '';
        folderInput.value = '';
    }
});