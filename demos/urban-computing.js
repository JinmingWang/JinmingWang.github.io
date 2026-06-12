// Urban Computing Demo
(function() {
    const canvas = document.getElementById('demo-canvas-2');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const width = canvas.width = 350;
    const height = canvas.height = 350;
    const padding = 20;
    
    let batchData = null;
    let currentSampleIndex = 0;
    let currentMode = 'trajectories'; // 'trajectories', 'walks', 'graph'
    let isLoading = true;
    
    // Load batch data
    fetch('demos/batch_data.json')
        .then(response => response.json())
        .then(data => {
            batchData = data;
            isLoading = false;
            console.log('Batch data loaded successfully');
            draw();
        })
        .catch(error => {
            console.error('Error loading batch data:', error);
            drawError();
        });
    
    // Calculate bounding box for current sample data
    function getBounds(data) {
        let minLat = Infinity, maxLat = -Infinity;
        let minLon = Infinity, maxLon = -Infinity;
        
        // Flatten the data structure to find min/max
        function processPoint(point) {
            if (point && point.length >= 2) {
                const lat = point[0];
                const lon = point[1];
                if (lat !== 0 || lon !== 0) { // Skip padding zeros
                    minLat = Math.min(minLat, lat);
                    maxLat = Math.max(maxLat, lat);
                    minLon = Math.min(minLon, lon);
                    maxLon = Math.max(maxLon, lon);
                }
            }
        }
        
        function traverse(obj) {
            if (Array.isArray(obj)) {
                if (obj.length === 2 && typeof obj[0] === 'number' && typeof obj[1] === 'number') {
                    processPoint(obj);
                } else {
                    obj.forEach(item => traverse(item));
                }
            }
        }
        
        traverse(data);
        
        // Add small padding to bounds
        const latPadding = (maxLat - minLat) * 0.05;
        const lonPadding = (maxLon - minLon) * 0.05;
        
        return {
            minLat: minLat - latPadding,
            maxLat: maxLat + latPadding,
            minLon: minLon - lonPadding,
            maxLon: maxLon + lonPadding
        };
    }
    
    // Convert GPS coordinates to canvas coordinates
    function gpsToCanvas(lat, lon, bounds) {
        const x = padding + ((lon - bounds.minLon) / (bounds.maxLon - bounds.minLon)) * (width - 2 * padding);
        const y = height - padding - ((lat - bounds.minLat) / (bounds.maxLat - bounds.minLat)) * (height - 2 * padding);
        return { x, y };
    }
    
    // Draw trajectories
    function drawTrajectories() {
        if (!batchData) return;
        
        const trajs = batchData.trajs[currentSampleIndex];
        const bounds = getBounds(trajs);
        
        // Draw each trajectory with different color
        trajs.forEach((traj, idx) => {
            // Generate color based on trajectory index
            const hue = (idx / trajs.length) * 360;
            ctx.strokeStyle = `hsl(${hue}, 70%, 60%)`;
            ctx.lineWidth = 2;
            ctx.beginPath();
            
            let started = false;
            traj.forEach(point => {
                if (point[0] !== 0 || point[1] !== 0) { // Skip padding
                    const { x, y } = gpsToCanvas(point[0], point[1], bounds);
                    if (!started) {
                        ctx.moveTo(x, y);
                        started = true;
                    } else {
                        ctx.lineTo(x, y);
                    }
                }
            });
            ctx.stroke();
            
            // Draw start point
            if (traj.length > 0 && (traj[0][0] !== 0 || traj[0][1] !== 0)) {
                const start = gpsToCanvas(traj[0][0], traj[0][1], bounds);
                ctx.fillStyle = '#4ec9b0';
                ctx.beginPath();
                ctx.arc(start.x, start.y, 3, 0, Math.PI * 2);
                ctx.fill();
            }
        });
    }
    
    // Draw walks
    function drawWalks() {
        if (!batchData) return;
        
        const walks = batchData.walks[currentSampleIndex];
        const bounds = getBounds(walks);
        
        // Draw each walk with different color
        walks.forEach((walk, idx) => {
            const hue = (idx / walks.length) * 360;
            ctx.strokeStyle = `hsl(${hue}, 70%, 60%)`;
            ctx.lineWidth = 2;
            
            walk.forEach(edge => {
                ctx.beginPath();
                let started = false;
                
                edge.forEach(point => {
                    if (point[0] !== 0 || point[1] !== 0) { // Skip padding
                        const { x, y } = gpsToCanvas(point[0], point[1], bounds);
                        if (!started) {
                            ctx.moveTo(x, y);
                            started = true;
                        } else {
                            ctx.lineTo(x, y);
                        }
                    }
                });
                ctx.stroke();
            });
        });
    }
    
    // Draw graph
    function drawGraph() {
        if (!batchData) return;
        
        const graph = batchData.graphs[currentSampleIndex];
        const numEdges = batchData.N_edges_per_graph[currentSampleIndex];
        const bounds = getBounds(graph.slice(0, numEdges));
        
        // Draw each edge
        ctx.strokeStyle = '#4ec9b0';
        ctx.lineWidth = 2;
        
        for (let i = 0; i < numEdges; i++) {
            const edge = graph[i];
            ctx.beginPath();
            let started = false;
            
            edge.forEach(point => {
                if (point[0] !== 0 || point[1] !== 0) { // Skip padding
                    const { x, y } = gpsToCanvas(point[0], point[1], bounds);
                    if (!started) {
                        ctx.moveTo(x, y);
                        started = true;
                    } else {
                        ctx.lineTo(x, y);
                    }
                }
            });
            ctx.stroke();
        }
        
        // Draw nodes (endpoints)
        ctx.fillStyle = '#569cd6';
        for (let i = 0; i < numEdges; i++) {
            const edge = graph[i];
            // Draw first and last point of each edge
            const first = edge.find(p => p[0] !== 0 || p[1] !== 0);
            const last = edge.slice().reverse().find(p => p[0] !== 0 || p[1] !== 0);
            
            if (first) {
                const pos = gpsToCanvas(first[0], first[1], bounds);
                ctx.beginPath();
                ctx.arc(pos.x, pos.y, 3, 0, Math.PI * 2);
                ctx.fill();
            }
            if (last && (last[0] !== first[0] || last[1] !== first[1])) {
                const pos = gpsToCanvas(last[0], last[1], bounds);
                ctx.beginPath();
                ctx.arc(pos.x, pos.y, 3, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    }
    
    // Main draw function
    function draw() {
        // Clear canvas
        ctx.fillStyle = '#1e1e1e';
        ctx.fillRect(0, 0, width, height);
        
        if (isLoading) {
            drawLoading();
            return;
        }
        
        if (!batchData) {
            drawError();
            return;
        }
        
        // Draw based on current mode
        switch (currentMode) {
            case 'trajectories':
                drawTrajectories();
                break;
            case 'walks':
                drawWalks();
                break;
            case 'graph':
                drawGraph();
                break;
        }
        
        // Draw sample info
        const lang = typeof getCurrentLanguage === 'function' ? getCurrentLanguage() : 'en';
        const modeNames = {
            'trajectories': { en: 'TRAJECTORIES', zh: '轨迹' },
            'walks': { en: 'WALKS', zh: '步行路径' },
            'graph': { en: 'GRAPH', zh: '路网图' }
        };
        const modeName = modeNames[currentMode] ? modeNames[currentMode][lang] : currentMode.toUpperCase();
        const sampleText = lang === 'zh' ? `样本 ${currentSampleIndex + 1}/32 - ${modeName}` : `Sample ${currentSampleIndex + 1}/32 - ${modeName}`;
        
        ctx.fillStyle = '#d4d4d4';
        ctx.font = '14px Consolas, monospace';
        ctx.fillText(sampleText, 10, height - 10);
    }
    
    // Draw loading message
    function drawLoading() {
        const lang = typeof getCurrentLanguage === 'function' ? getCurrentLanguage() : 'en';
        const text = lang === 'zh' ? '加载数据中...' : 'Loading data...';
        ctx.fillStyle = '#d4d4d4';
        ctx.font = '16px Consolas, monospace';
        ctx.textAlign = 'center';
        ctx.fillText(text, width / 2, height / 2);
        ctx.textAlign = 'left';
    }
    
    // Draw error message
    function drawError() {
        const lang = typeof getCurrentLanguage === 'function' ? getCurrentLanguage() : 'en';
        const text1 = lang === 'zh' ? '加载数据错误' : 'Error loading data';
        const text2 = lang === 'zh' ? '请确保 batch_data.json 存在' : 'Please ensure batch_data.json exists';
        ctx.fillStyle = '#f48771';
        ctx.font = '16px Consolas, monospace';
        ctx.textAlign = 'center';
        ctx.fillText(text1, width / 2, height / 2);
        ctx.fillText(text2, width / 2, height / 2 + 20);
        ctx.textAlign = 'left';
    }
    
    // Create control buttons
    const container = canvas.parentElement;
    const controlsContainer = document.createElement('div');
    controlsContainer.style.marginTop = '15px';
    controlsContainer.style.width = '100%';
    controlsContainer.style.display = 'flex';
    controlsContainer.style.flexDirection = 'column';
    controlsContainer.style.alignItems = 'center';
    controlsContainer.style.gap = '10px';
    
    // Button container
    const buttonContainer = document.createElement('div');
    buttonContainer.style.display = 'flex';
    buttonContainer.style.gap = '8px';
    buttonContainer.style.flexWrap = 'wrap';
    buttonContainer.style.justifyContent = 'center';
    buttonContainer.id = 'urban-button-container';
    
    // Create buttons
    const buttons = [
        { label: 'Trajectories', labelZh: '轨迹', mode: 'trajectories' },
        { label: 'Walks', labelZh: '路径', mode: 'walks' },
        { label: 'Graph', labelZh: '路网图', mode: 'graph' },
        { label: 'Next Sample', labelZh: '下一个样本', mode: 'next' }
    ];
    
    // Check if controls already exist (prevent duplicates on re-load)
    const existingContainer = document.getElementById('urban-button-container');
    const buttonElements = [];
    
    if (!existingContainer) {
        // Get initial language
        const lang = typeof getCurrentLanguage === 'function' ? getCurrentLanguage() : 'en';
        
        buttons.forEach(btnInfo => {
            const button = document.createElement('button');
            button.setAttribute('data-en', btnInfo.label);
            button.setAttribute('data-zh', btnInfo.labelZh);
            button.textContent = lang === 'zh' ? btnInfo.labelZh : btnInfo.label;
            button.style.padding = '8px 16px';
            button.style.fontSize = '14px';
            button.style.fontFamily = 'Consolas, monospace';
            button.style.backgroundColor = btnInfo.mode === currentMode ? '#4ec9b0' : '#2d2d30';
            button.style.color = '#d4d4d4';
            button.style.border = '1px solid #3e3e42';
            button.style.borderRadius = '4px';
            button.style.cursor = 'pointer';
            button.style.transition = 'all 0.2s';
            
            button.addEventListener('mouseenter', () => {
                if (btnInfo.mode !== currentMode) {
                    button.style.backgroundColor = '#3e3e42';
                }
            });
            
            button.addEventListener('mouseleave', () => {
                button.style.backgroundColor = btnInfo.mode === currentMode ? '#4ec9b0' : '#2d2d30';
            });
            
            button.addEventListener('click', () => {
                if (btnInfo.mode === 'next') {
                    currentSampleIndex = (currentSampleIndex + 1) % 32;
                } else {
                    currentMode = btnInfo.mode;
                    // Update button styles
                    buttonContainer.querySelectorAll('button').forEach((btn, idx) => {
                        if (idx < 3) { // Only update mode buttons, not Next button
                            btn.style.backgroundColor = buttons[idx].mode === currentMode ? '#4ec9b0' : '#2d2d30';
                        }
                    });
                }
                draw();
            });
            
            buttonContainer.appendChild(button);
            buttonElements.push({ button, btnInfo });
        });
        
        controlsContainer.appendChild(buttonContainer);
        controlsContainer.id = 'urban-controls-container';
        container.appendChild(controlsContainer);
    } else {
        // Buttons already exist, just get references
        existingContainer.querySelectorAll('button').forEach((button, idx) => {
            buttonElements.push({ button, btnInfo: buttons[idx] });
        });
    }
    
    // Register for language changes
    if (typeof onLanguageChange === 'function') {
        onLanguageChange((newLang) => {
            buttonElements.forEach(({ button, btnInfo }) => {
                button.textContent = newLang === 'zh' ? btnInfo.labelZh : btnInfo.label;
            });
            // Redraw canvas with new language
            draw();
        });
    }
    
    // Initial draw
    if (!isLoading) {
        draw();
    }
})();
