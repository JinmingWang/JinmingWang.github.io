// Data Science Classification Demo
(function() {
    const canvas = document.getElementById('demo-canvas-0');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const width = canvas.width = 350;
    const height = canvas.height = 350;
    
    let points = [];
    let weights = { w1: 0, w2: 0, b: 0 };
    
    // Initialize the demo
    function init() {
        generatePoints();
        trainClassifier();
        draw();
    }
    
    // Generate random data points in two classes
    function generatePoints() {
        points = [];
        const numPoints = 50;
        
        // Class 1 (Red) - clustered in upper-left region
        for (let i = 0; i < numPoints / 2; i++) {
            points.push({
                x: Math.random() * 0.4 * width + 0.1 * width,
                y: Math.random() * 0.4 * height + 0.1 * height,
                label: 0,
                color: '#ff5555'
            });
        }
        
        // Class 2 (Blue) - clustered in lower-right region
        for (let i = 0; i < numPoints / 2; i++) {
            points.push({
                x: Math.random() * 0.4 * width + 0.5 * width,
                y: Math.random() * 0.4 * height + 0.5 * height,
                label: 1,
                color: '#5555ff'
            });
        }
    }
    
    // Simple perceptron training algorithm
    function trainClassifier() {
        weights = { w1: 0, w2: 0, b: 0 };
        const learningRate = 0.01;
        const epochs = 1000;
        
        for (let epoch = 0; epoch < epochs; epoch++) {
            for (let point of points) {
                // Normalize coordinates to [0, 1]
                const x1 = point.x / width;
                const x2 = point.y / height;
                
                // Calculate prediction
                const z = weights.w1 * x1 + weights.w2 * x2 + weights.b;
                const prediction = z >= 0 ? 1 : 0;
                
                // Update weights if prediction is wrong
                const error = point.label - prediction;
                weights.w1 += learningRate * error * x1;
                weights.w2 += learningRate * error * x2;
                weights.b += learningRate * error;
            }
        }
    }
    
    // Draw the visualization
    function draw() {
        // Clear canvas
        ctx.fillStyle = '#1e1e1e';
        ctx.fillRect(0, 0, width, height);
        
        // Draw decision boundary
        drawDecisionBoundary();
        
        // Draw points
        points.forEach(point => {
            ctx.fillStyle = point.color;
            ctx.beginPath();
            ctx.arc(point.x, point.y, 6, 0, Math.PI * 2);
            ctx.fill();
            
            // Add outline
            ctx.strokeStyle = '#d4d4d4';
            ctx.lineWidth = 1;
            ctx.stroke();
        });
    }
    
    // Draw the decision boundary line
    function drawDecisionBoundary() {
        if (weights.w2 === 0) return;
        
        // Decision boundary equation: w1*x + w2*y + b = 0
        // Solve for y: y = -(w1*x + b) / w2
        
        const x1 = 0;
        const y1 = -(weights.w1 * (x1 / width) + weights.b) / weights.w2 * height;
        
        const x2 = width;
        const y2 = -(weights.w1 * (x2 / width) + weights.b) / weights.w2 * height;
        
        // Draw the line
        ctx.strokeStyle = '#4ec9b0';
        ctx.lineWidth = 3;
        ctx.setLineDash([10, 5]);
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
        ctx.setLineDash([]);
        
        // Draw shaded regions
        ctx.globalAlpha = 0.1;
        
        // Red region
        ctx.fillStyle = '#ff5555';
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.lineTo(x2, 0);
        ctx.lineTo(x1, 0);
        ctx.closePath();
        ctx.fill();
        
        // Blue region
        ctx.fillStyle = '#5555ff';
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.lineTo(x2, height);
        ctx.lineTo(x1, height);
        ctx.closePath();
        ctx.fill();
        
        ctx.globalAlpha = 1.0;
    }
    
    // Add regenerate button
    const container = canvas.parentElement;
    
    // Check if button already exists (prevent duplicates on re-load)
    let buttonContainer = document.getElementById('datasci-button-container');
    let button;
    
    if (!buttonContainer) {
        buttonContainer = document.createElement('div');
        buttonContainer.id = 'datasci-button-container';
        buttonContainer.style.marginTop = '15px';
        buttonContainer.style.textAlign = 'center';
        
        button = document.createElement('button');
        button.setAttribute('data-en', 'Regenerate');
        button.setAttribute('data-zh', '重新生成');
        
        // Set initial text based on current language
        const lang = typeof getCurrentLanguage === 'function' ? getCurrentLanguage() : 'en';
        button.textContent = lang === 'zh' ? '重新生成' : 'Regenerate';
        
        button.style.padding = '10px 30px';
        button.style.fontSize = '16px';
        button.style.backgroundColor = '#569cd6';
        button.style.color = '#ffffff';
        button.style.border = 'none';
        button.style.borderRadius = '5px';
        button.style.cursor = 'pointer';
        button.style.fontFamily = 'Consolas, monospace';
        button.style.transition = 'background-color 0.3s';
        
        button.addEventListener('mouseenter', () => {
            button.style.backgroundColor = '#4a8bc2';
        });
        
        button.addEventListener('mouseleave', () => {
            button.style.backgroundColor = '#569cd6';
        });
        
        button.addEventListener('click', () => {
            init();
        });
        
        buttonContainer.appendChild(button);
        container.appendChild(buttonContainer);
    } else {
        button = buttonContainer.querySelector('button');
    }
    
    // Register for language changes
    if (typeof onLanguageChange === 'function') {
        onLanguageChange((newLang) => {
            button.textContent = newLang === 'zh' ? '重新生成' : 'Regenerate';
        });
    }
    
    // Initialize on load
    init();
})();
