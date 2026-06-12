// Computer Vision MNIST Demo
(function() {
    const canvas = document.getElementById('demo-canvas-3');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    const modelSize = 28;
    const displaySize = 280; // 10x scale for visibility
    canvas.width = modelSize;
    canvas.height = modelSize;
    canvas.style.width = displaySize + 'px';
    canvas.style.height = displaySize + 'px';
    canvas.style.imageRendering = 'pixelated'; // Keep pixels sharp
    
    let isDrawing = false;
    let model = null;
    let isLoading = true;
    const brushRadius = 1.0;
    
    // Initialize canvas - white background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, modelSize, modelSize);
    
    // Load model
    fetch('demos/model.json')
        .then(response => response.json())
        .then(data => {
            model = data;
            isLoading = false;
            console.log('MNIST model loaded successfully');
            drawPlaceholder();
        })
        .catch(error => {
            console.error('Error loading model:', error);
            isLoading = false;
            drawError();
        });
    
    // Drawing functions
    function startDrawing(e) {
        isDrawing = true;
        draw(e);
    }
    
    function draw(e) {
        if (!isDrawing) return;
        
        const pos = getMousePos(e);
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, brushRadius, 0, Math.PI * 2);
        ctx.fill();
    }
    
    function stopDrawing() {
        isDrawing = false;
    }
    
    function getMousePos(e) {
        const rect = canvas.getBoundingClientRect();
        
        let clientX, clientY;
        if (e.touches && e.touches[0]) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        } else {
            clientX = e.clientX;
            clientY = e.clientY;
        }
        
        // Convert from display coordinates to canvas coordinates
        const x = (clientX - rect.left) / (rect.width / modelSize);
        const y = (clientY - rect.top) / (rect.height / modelSize);
        
        return { x, y };
    }
    
    // Mouse events
    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseout', stopDrawing);
    
    // Touch events
    canvas.addEventListener('touchstart', (e) => {
        e.preventDefault();
        startDrawing(e);
    }, { passive: false });
    
    canvas.addEventListener('touchmove', (e) => {
        e.preventDefault();
        draw(e);
    }, { passive: false });
    
    canvas.addEventListener('touchend', (e) => {
        e.preventDefault();
        stopDrawing();
    }, { passive: false });
    
    // Clear canvas
    function clearCanvas() {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, modelSize, modelSize);
        clearResults();
    }
    
    // Get centered image data (like MNIST preprocessing)
    function getCenteredImageData() {
        const imageData = ctx.getImageData(0, 0, modelSize, modelSize);
        const data = imageData.data;
        
        // Find bounding box and center of mass
        let minX = modelSize, maxX = 0, minY = modelSize, maxY = 0;
        let sumX = 0, sumY = 0, count = 0;
        
        for (let y = 0; y < modelSize; y++) {
            for (let x = 0; x < modelSize; x++) {
                const idx = (y * modelSize + x) * 4;
                // Check if pixel is dark (drawn on)
                const brightness = data[idx]; // R channel (grayscale)
                const darkness = 255 - brightness;
                
                if (darkness > 0) {
                    if (x < minX) minX = x;
                    if (x > maxX) maxX = x;
                    if (y < minY) minY = y;
                    if (y > maxY) maxY = y;
                    sumX += x * darkness;
                    sumY += y * darkness;
                    count += darkness;
                }
            }
        }
        
        if (count === 0) return new Float32Array(784); // Empty canvas
        
        // Calculate offset to center the digit at (13.5, 13.5)
        const dx = 13.5 - sumX / count;
        const dy = 13.5 - sumY / count;
        
        // Create temporary canvas for translation
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = modelSize;
        tempCanvas.height = modelSize;
        const tCtx = tempCanvas.getContext('2d');
        tCtx.fillStyle = '#ffffff';
        tCtx.fillRect(0, 0, modelSize, modelSize);
        tCtx.translate(dx, dy);
        tCtx.drawImage(canvas, 0, 0);
        
        // Extract centered data
        const centeredData = tCtx.getImageData(0, 0, modelSize, modelSize).data;
        const input = new Float32Array(784);
        
        for (let i = 0; i < 784; i++) {
            // Invert: white background (255) -> 0, black drawing (0) -> 1
            input[i] = (255 - centeredData[i * 4]) / 255.0;
        }
        
        return input;
    }
    
    // Neural network forward pass
    function predict(input) {
        if (!model) return null;
        
        let activations = input;
        
        // Process each layer
        for (let layerIdx = 0; layerIdx < model.layers.length; layerIdx++) {
            const layer = model.layers[layerIdx];
            const weights = layer.weights; // weights[outputNeuron][inputNeuron]
            const biases = layer.biases;
            const outputSize = biases.length;
            
            // Matrix multiplication: output = weights * input + bias
            const output = new Float32Array(outputSize);
            for (let i = 0; i < outputSize; i++) {
                let sum = biases[i];
                for (let j = 0; j < weights[i].length; j++) {
                    sum += weights[i][j] * activations[j];
                }
                output[i] = sum;
            }
            
            // Apply activation
            const activation = model.activationNames[layerIdx];
            if (activation === 'relu') {
                for (let i = 0; i < output.length; i++) {
                    output[i] = Math.max(0, output[i]);
                }
            }
            // identity activation does nothing
            
            activations = output;
        }
        
        // Apply softmax
        const expScores = activations.map(x => Math.exp(x));
        const sumExp = expScores.reduce((a, b) => a + b, 0);
        const probabilities = expScores.map(x => x / sumExp);
        
        return probabilities;
    }
    
    // Classify the drawn digit
    function classify() {
        if (!model) {
            const lang = typeof getCurrentLanguage === 'function' ? getCurrentLanguage() : 'en';
            alert(lang === 'zh' ? '模型尚未加载!' : 'Model not loaded yet!');
            return;
        }
        
        const input = getCenteredImageData();
        const probabilities = predict(input);
        
        if (probabilities) {
            displayResults(probabilities);
        }
    }
    
    // Display results
    function displayResults(probabilities) {
        const resultDiv = document.getElementById('mnist-results');
        if (!resultDiv) return;
        
        // Find prediction
        const maxIdx = probabilities.indexOf(Math.max(...probabilities));
        const confidence = probabilities[maxIdx];
        
        const lang = typeof getCurrentLanguage === 'function' ? getCurrentLanguage() : 'en';
        const predictionText = lang === 'zh' ? '预测' : 'Prediction';
        const confidenceText = lang === 'zh' ? '置信度' : 'Confidence';
        
        let html = `
            <div style="margin-bottom: 15px; font-size: 18px;">
                <strong>${predictionText}:</strong> 
                <span style="color: #4ec9b0; font-size: 24px; font-weight: bold;">${maxIdx}</span> 
                (${confidenceText}: ${(confidence * 100).toFixed(1)}%)
            </div>
            <div style="font-size: 14px;">
        `;
        
        // Show all probabilities as bars
        for (let i = 0; i < probabilities.length; i++) {
            const prob = probabilities[i];
            const percentage = (prob * 100).toFixed(1);
            const barWidth = prob * 100;
            
            html += `
                <div style="display: flex; align-items: center; margin-bottom: 5px;">
                    <span style="width: 30px; font-family: Consolas, monospace;">${i}:</span>
                    <div style="flex: 1; height: 20px; background-color: #2d2d30; border-radius: 3px; overflow: hidden; margin: 0 10px;">
                        <div style="width: ${barWidth}%; height: 100%; background-color: ${i === maxIdx ? '#4ec9b0' : '#569cd6'}; transition: width 0.3s;"></div>
                    </div>
                    <span style="width: 50px; text-align: right; font-family: Consolas, monospace; font-size: 12px;">${percentage}%</span>
                </div>
            `;
        }
        
        html += '</div>';
        resultDiv.innerHTML = html;
    }
    
    function clearResults() {
        const resultDiv = document.getElementById('mnist-results');
        if (resultDiv) {
            resultDiv.innerHTML = '';
        }
    }
    
    function drawPlaceholder() {
        const lang = typeof getCurrentLanguage === 'function' ? getCurrentLanguage() : 'en';
        const text = lang === 'zh' ? '绘制 0-9' : 'Draw 0-9';
        
        ctx.fillStyle = '#aaaaaa';
        ctx.font = '3px Consolas, monospace';
        ctx.textAlign = 'center';
        ctx.fillText(text, modelSize / 2, modelSize / 2);
        ctx.textAlign = 'left';
    }
    
    function drawError() {
        const lang = typeof getCurrentLanguage === 'function' ? getCurrentLanguage() : 'en';
        const text = lang === 'zh' ? '错误' : 'Error';
        
        ctx.fillStyle = '#ff0000';
        ctx.font = '3px Consolas, monospace';
        ctx.textAlign = 'center';
        ctx.fillText(text, modelSize / 2, modelSize / 2);
        ctx.textAlign = 'left';
    }
    
    // Create controls
    const container = canvas.parentElement;
    
    // Check if controls already exist (prevent duplicates on re-load)
    let resultsDiv = document.getElementById('mnist-results');
    let buttonContainer = document.getElementById('mnist-button-container');
    let clearButton, classifyButton;
    
    if (!resultsDiv) {
        // Results container
        resultsDiv = document.createElement('div');
        resultsDiv.id = 'mnist-results';
        resultsDiv.style.marginTop = '15px';
        resultsDiv.style.padding = '15px';
        resultsDiv.style.backgroundColor = '#2d2d30';
        resultsDiv.style.borderRadius = '5px';
        resultsDiv.style.minHeight = '50px';
        resultsDiv.style.fontFamily = 'Consolas, monospace';
        resultsDiv.style.color = '#d4d4d4';
        container.appendChild(resultsDiv);
    }
    
    if (!buttonContainer) {
        // Button container
        buttonContainer = document.createElement('div');
        buttonContainer.id = 'mnist-button-container';
        buttonContainer.style.marginTop = '15px';
        buttonContainer.style.display = 'flex';
        buttonContainer.style.gap = '10px';
        buttonContainer.style.justifyContent = 'center';
        
        // Clear button
        clearButton = document.createElement('button');
        const lang = typeof getCurrentLanguage === 'function' ? getCurrentLanguage() : 'en';
        clearButton.setAttribute('data-en', 'Clear');
        clearButton.setAttribute('data-zh', '清除');
        clearButton.textContent = lang === 'zh' ? '清除' : 'Clear';
        clearButton.style.padding = '10px 30px';
        clearButton.style.fontSize = '16px';
        clearButton.style.backgroundColor = '#858585';
        clearButton.style.color = '#ffffff';
        clearButton.style.border = 'none';
        clearButton.style.borderRadius = '5px';
        clearButton.style.cursor = 'pointer';
        clearButton.style.fontFamily = 'Consolas, monospace';
        clearButton.style.transition = 'background-color 0.3s';
        
        clearButton.addEventListener('mouseenter', () => {
            clearButton.style.backgroundColor = '#6d6d6d';
        });
        clearButton.addEventListener('mouseleave', () => {
            clearButton.style.backgroundColor = '#858585';
        });
        clearButton.addEventListener('click', clearCanvas);
        
        // Classify button
        classifyButton = document.createElement('button');
        classifyButton.setAttribute('data-en', 'Classify');
        classifyButton.setAttribute('data-zh', '分类');
        classifyButton.textContent = lang === 'zh' ? '分类' : 'Classify';
        classifyButton.style.padding = '10px 30px';
        classifyButton.style.fontSize = '16px';
        classifyButton.style.backgroundColor = '#569cd6';
        classifyButton.style.color = '#ffffff';
        classifyButton.style.border = 'none';
        classifyButton.style.borderRadius = '5px';
        classifyButton.style.cursor = 'pointer';
        classifyButton.style.fontFamily = 'Consolas, monospace';
        classifyButton.style.transition = 'background-color 0.3s';
        
        classifyButton.addEventListener('mouseenter', () => {
            classifyButton.style.backgroundColor = '#4a8bc2';
        });
        classifyButton.addEventListener('mouseleave', () => {
            classifyButton.style.backgroundColor = '#569cd6';
        });
        classifyButton.addEventListener('click', classify);
        
        buttonContainer.appendChild(clearButton);
        buttonContainer.appendChild(classifyButton);
        container.appendChild(buttonContainer);
    } else {
        // Elements already exist, just get references to buttons
        clearButton = buttonContainer.children[0];
        classifyButton = buttonContainer.children[1];
    }
    
    // Register for language changes
    if (typeof onLanguageChange === 'function') {
        onLanguageChange((newLang) => {
            clearButton.textContent = newLang === 'zh' ? '清除' : 'Clear';
            classifyButton.textContent = newLang === 'zh' ? '分类' : 'Classify';
            // Redraw placeholder if canvas is empty
            const imageData = ctx.getImageData(0, 0, modelSize, modelSize);
            const data = imageData.data;
            let hasDrawing = false;
            for (let i = 0; i < data.length; i += 4) {
                // Check if any pixel is not white (has drawing)
                if (data[i] < 255) {
                    hasDrawing = true;
                    break;
                }
            }
            if (!hasDrawing && !isLoading && model) {
                clearCanvas();
                drawPlaceholder();
            }
        });
    }
})();
