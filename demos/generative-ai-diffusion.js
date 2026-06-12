// Generative AI Diffusion Demo
(function() {
    const canvas = document.getElementById('demo-canvas-1');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const width = canvas.width = 350;
    const height = canvas.height = 350;
    
    let originalImageData = null;
    let currentT = 500;
    const maxT = 500;
    
    // Load the seed image
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = function() {
        // Draw original image scaled to canvas size
        ctx.drawImage(img, 0, 0, width, height);
        // Store original image data
        originalImageData = ctx.getImageData(0, 0, width, height);
        // Initial render
        updateDiffusion(500);
    };
    img.onerror = function() {
        // If image fails to load, create a gradient placeholder
        console.log('Image failed to load, using gradient placeholder');
        createPlaceholderImage();
    };
    img.src = 'demos/SEED.JPG';
    
    // Create a placeholder gradient image if SEED.JPG doesn't exist
    function createPlaceholderImage() {
        // Create a colorful gradient
        const gradient = ctx.createLinearGradient(0, 0, width, height);
        gradient.addColorStop(0, '#ff6b6b');
        gradient.addColorStop(0.25, '#4ecdc4');
        gradient.addColorStop(0.5, '#45b7d1');
        gradient.addColorStop(0.75, '#f9ca24');
        gradient.addColorStop(1, '#ff6b6b');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
        
        // Add some circles for visual interest
        for (let i = 0; i < 10; i++) {
            const x = Math.random() * width;
            const y = Math.random() * height;
            const radius = Math.random() * 50 + 20;
            const gradient2 = ctx.createRadialGradient(x, y, 0, x, y, radius);
            gradient2.addColorStop(0, `rgba(255, 255, 255, 0.3)`);
            gradient2.addColorStop(1, `rgba(255, 255, 255, 0)`);
            ctx.fillStyle = gradient2;
            ctx.beginPath();
            ctx.arc(x, y, radius, 0, Math.PI * 2);
            ctx.fill();
        }
        
        originalImageData = ctx.getImageData(0, 0, width, height);
        updateDiffusion(500);
    }
    
    // Update diffusion based on timestep t
    function updateDiffusion(t) {
        if (!originalImageData) return;
        
        currentT = t;
        
        // Calculate noise level (0 to 1)
        const noiseLevel = t / maxT;
        
        // Use a beta schedule for more realistic diffusion
        // This makes early steps have less noise and later steps have more
        const alpha = 1 - (noiseLevel * noiseLevel); // quadratic schedule
        const sqrtAlpha = Math.sqrt(alpha);
        const sqrtOneMinusAlpha = Math.sqrt(1 - alpha);
        
        // Clone original image data
        const noisyData = ctx.createImageData(width, height);
        const original = originalImageData.data;
        const noisy = noisyData.data;
        
        // Add Gaussian noise to each pixel
        for (let i = 0; i < original.length; i += 4) {
            // Generate Gaussian noise using Box-Muller transform
            const noise1 = gaussianRandom();
            const noise2 = gaussianRandom();
            const noise3 = gaussianRandom();
            
            // Apply diffusion formula: x_t = sqrt(alpha_t) * x_0 + sqrt(1 - alpha_t) * noise
            noisy[i] = clamp(sqrtAlpha * original[i] + sqrtOneMinusAlpha * noise1 * 128);     // R
            noisy[i + 1] = clamp(sqrtAlpha * original[i + 1] + sqrtOneMinusAlpha * noise2 * 128); // G
            noisy[i + 2] = clamp(sqrtAlpha * original[i + 2] + sqrtOneMinusAlpha * noise3 * 128); // B
            noisy[i + 3] = 255; // Alpha
        }
        
        // Draw the noisy image
        ctx.putImageData(noisyData, 0, 0);
        
        // Update slider value display
        updateSliderDisplay(t);
    }
    
    // Generate Gaussian random number (mean=0, std=1)
    function gaussianRandom() {
        let u = 0, v = 0;
        while (u === 0) u = Math.random(); // Converting [0,1) to (0,1)
        while (v === 0) v = Math.random();
        return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
    }
    
    // Clamp value to 0-255 range
    function clamp(value) {
        return Math.max(0, Math.min(255, Math.round(value)));
    }
    
    // Update slider value display
    function updateSliderDisplay(t) {
        const display = document.getElementById('diffusion-t-display');
        if (display) {
            display.textContent = `t = ${t}`;
        }
    }
    
    // Create slider control
    const container = canvas.parentElement;
    const controlsContainer = document.createElement('div');
    controlsContainer.style.marginTop = '15px';
    controlsContainer.style.width = '100%';
    controlsContainer.style.display = 'flex';
    controlsContainer.style.flexDirection = 'column';
    controlsContainer.style.alignItems = 'center';
    controlsContainer.style.gap = '10px';
    
    // Time step display
    const displayDiv = document.createElement('div');
    displayDiv.id = 'diffusion-t-display';
    displayDiv.style.fontFamily = 'Consolas, monospace';
    displayDiv.style.fontSize = '16px';
    displayDiv.style.color = '#d4d4d4';
    displayDiv.style.fontWeight = 'bold';
    displayDiv.textContent = 't = 500';
    
    // Slider container
    const sliderContainer = document.createElement('div');
    sliderContainer.style.width = '90%';
    sliderContainer.style.display = 'flex';
    sliderContainer.style.alignItems = 'center';
    sliderContainer.style.gap = '10px';
    
    // Min label
    const minLabel = document.createElement('span');
    minLabel.textContent = '0';
    minLabel.style.fontFamily = 'Consolas, monospace';
    minLabel.style.fontSize = '14px';
    minLabel.style.color = '#858585';
    minLabel.style.minWidth = '30px';
    
    // Slider
    const slider = document.createElement('input');
    slider.type = 'range';
    slider.min = '0';
    slider.max = maxT.toString();
    slider.value = '500';
    slider.style.flex = '1';
    slider.style.cursor = 'pointer';
    slider.style.height = '6px';
    slider.style.background = '#4ec9b0';
    slider.style.outline = 'none';
    slider.style.borderRadius = '3px';
    
    // Max label
    const maxLabel = document.createElement('span');
    maxLabel.textContent = '500';
    maxLabel.style.fontFamily = 'Consolas, monospace';
    maxLabel.style.fontSize = '14px';
    maxLabel.style.color = '#858585';
    maxLabel.style.minWidth = '30px';
    maxLabel.style.textAlign = 'right';
    
    // Slider event
    slider.addEventListener('input', (e) => {
        const t = parseInt(e.target.value);
        updateDiffusion(t);
    });
    
    // Assemble controls
    sliderContainer.appendChild(minLabel);
    sliderContainer.appendChild(slider);
    sliderContainer.appendChild(maxLabel);
    
    controlsContainer.appendChild(displayDiv);
    controlsContainer.appendChild(sliderContainer);
    
    // Add reset button
    let buttonContainer = document.getElementById('diffusion-button-container');
    let resetButton;
    
    if (!buttonContainer) {
        buttonContainer = document.createElement('div');
        buttonContainer.id = 'diffusion-button-container';
        buttonContainer.style.marginTop = '5px';
        
        resetButton = document.createElement('button');
        resetButton.setAttribute('data-en', 'Reset');
        resetButton.setAttribute('data-zh', '重置');
        
        // Set initial text based on current language
        const lang = typeof getCurrentLanguage === 'function' ? getCurrentLanguage() : 'en';
        resetButton.textContent = lang === 'zh' ? '重置' : 'Reset';
        
        resetButton.style.padding = '8px 25px';
        resetButton.style.fontSize = '14px';
        resetButton.style.backgroundColor = '#569cd6';
        resetButton.style.color = '#ffffff';
        resetButton.style.border = 'none';
        resetButton.style.borderRadius = '5px';
        resetButton.style.cursor = 'pointer';
        resetButton.style.fontFamily = 'Consolas, monospace';
        resetButton.style.transition = 'background-color 0.3s';
        
        resetButton.addEventListener('mouseenter', () => {
            resetButton.style.backgroundColor = '#4a8bc2';
        });
        
        resetButton.addEventListener('mouseleave', () => {
            resetButton.style.backgroundColor = '#569cd6';
        });
        
        resetButton.addEventListener('click', () => {
            slider.value = '500';
            updateDiffusion(500);
        });
        
        buttonContainer.appendChild(resetButton);
        controlsContainer.appendChild(buttonContainer);
    } else {
        resetButton = buttonContainer.querySelector('button');
    }
    
    // Only append controlsContainer if not already in DOM
    if (!document.getElementById('diffusion-controls-container')) {
        controlsContainer.id = 'diffusion-controls-container';
        container.appendChild(controlsContainer);
    }
    
    // Register for language changes
    if (typeof onLanguageChange === 'function') {
        onLanguageChange((newLang) => {
            resetButton.textContent = newLang === 'zh' ? '重置' : 'Reset';
        });
    }
})();
