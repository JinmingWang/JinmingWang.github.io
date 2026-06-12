// Reinforcement Learning Grid World Demo
(function() {
    const canvas = document.getElementById('demo-canvas-4');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    const gridSize = 10;
    const cellSize = 40;
    canvas.width = gridSize * cellSize;
    canvas.height = gridSize * cellSize;
    
    // Grid state
    const EMPTY = 0;
    const WALL = 1;
    const START = 2;
    const END = 3;
    const TRAP = 4;
    
    let grid = Array(gridSize).fill(null).map(() => Array(gridSize).fill(EMPTY));
    let startPos = { x: 1, y: 1 };
    let endPos = { x: 8, y: 8 };
    
    // Multi-agent setup
    const numAgents = 3;
    const agentColors = ['#dcdcaa', '#4ec9b0', '#c586c0']; // Yellow, Teal, Pink
    let agents = [];
    
    // Q-learning parameters
    const actions = [
        { dx: 0, dy: -1, name: 'up' },
        { dx: 0, dy: 1, name: 'down' },
        { dx: -1, dy: 0, name: 'left' },
        { dx: 1, dy: 0, name: 'right' }
    ];
    
    let qTable = {}; // Q[state][action] = value
    let visitedStateActions = new Set(); // Track explored state-action pairs
    let learningRate = 0.4;
    let learningRateDecay = 0.995;
    let minLearningRate = 0.01;
    let discountFactor = 0.95;
    let epsilon = 0.3; // Epsilon-greedy exploration rate
    let epsilonDecay = 0.995;
    let minEpsilon = 0.01;
    const optimisticInit = 10; // Optimistic initialization value
    
    // Training state
    let isTraining = false;
    let episode = 0;
    let totalSteps = 0;
    let episodeRewards = [];
    let animationSpeed = 50; // ms per step
    const nSteps = 2; // 2-step TD
    
    // Drawing mode
    let drawMode = START;
    
    // Initialize agents
    function initializeAgents() {
        agents = [];
        for (let i = 0; i < numAgents; i++) {
            agents.push({
                pos: { ...startPos },
                trajectory: [],
                color: agentColors[i % agentColors.length]
            });
        }
    }
    
    // Initialize grid with default start and end
    grid[startPos.y][startPos.x] = START;
    grid[endPos.y][endPos.x] = END;
    initializeAgents();
    
    // Get Q-value for state-action pair
    function getQ(state, actionIdx) {
        const key = `${state.x},${state.y}`;
        if (!qTable[key]) {
            qTable[key] = Array(actions.length).fill(optimisticInit);
        }
        return qTable[key][actionIdx];
    }
    
    // Set Q-value for state-action pair
    function setQ(state, actionIdx, value) {
        const key = `${state.x},${state.y}`;
        if (!qTable[key]) {
            qTable[key] = Array(actions.length).fill(optimisticInit);
        }
        qTable[key][actionIdx] = value;
    }
    
    // Get max Q-value for a state
    function getMaxQ(state) {
        const key = `${state.x},${state.y}`;
        if (!qTable[key]) return optimisticInit;
        return Math.max(...qTable[key]);
    }
    
    // Get best action for a state (greedy)
    function getBestAction(state) {
        const key = `${state.x},${state.y}`;
        if (!qTable[key]) {
            qTable[key] = Array(actions.length).fill(optimisticInit);
        }
        const maxQ = Math.max(...qTable[key]);
        const bestActions = [];
        qTable[key].forEach((q, idx) => {
            if (q === maxQ) bestActions.push(idx);
        });
        return bestActions[Math.floor(Math.random() * bestActions.length)];
    }
    
    // Epsilon-greedy action selection with unexplored preference
    function selectAction(state) {
        const key = `${state.x},${state.y}`;
        if (!qTable[key]) {
            qTable[key] = Array(actions.length).fill(optimisticInit);
        }
        
        // Check for unexplored actions from this state
        const unexploredActions = [];
        for (let i = 0; i < actions.length; i++) {
            const stateActionKey = `${key}-${i}`;
            if (!visitedStateActions.has(stateActionKey)) {
                unexploredActions.push(i);
            }
        }
        
        // Prioritize unexplored actions
        if (unexploredActions.length > 0) {
            // Randomly select from unexplored actions
            return unexploredActions[Math.floor(Math.random() * unexploredActions.length)];
        }
        
        // All actions explored, use epsilon-greedy
        if (Math.random() < epsilon) {
            // Explore: random action
            return Math.floor(Math.random() * actions.length);
        } else {
            // Exploit: best action
            return getBestAction(state);
        }
    }
    
    // Check if position is valid
    function isValidPos(x, y) {
        return x >= 0 && x < gridSize && y >= 0 && y < gridSize && grid[y][x] !== WALL;
    }
    
    // Get next state
    function getNextState(state, actionIdx) {
        const action = actions[actionIdx];
        const newX = state.x + action.dx;
        const newY = state.y + action.dy;
        
        if (isValidPos(newX, newY)) {
            return { x: newX, y: newY };
        }
        return state; // Stay in place if hit wall or boundary
    }
    
    // Get reward for reaching a state
    function getReward(state) {
        const cell = grid[state.y][state.x];
        if (cell === END) return 100;
        if (cell === TRAP) return -100;
        return -1; // Small penalty for each step
    }
    
    // Check if episode is done
    function isDone(state) {
        const cell = grid[state.y][state.x];
        return cell === END || cell === TRAP;
    }
    
    // Run one episode
    function runEpisode() {
        let state = { ...startPos };
        let steps = 0;
        let totalReward = 0;
        const maxSteps = 200;
        
        while (!isDone(state) && steps < maxSteps) {
            const actionIdx = selectAction(state);
            const nextState = getNextState(state, actionIdx);
            const reward = getReward(nextState);
            
            // Q-learning update
            const currentQ = getQ(state, actionIdx);
            const maxNextQ = isDone(nextState) ? 0 : getMaxQ(nextState);
            const newQ = currentQ + learningRate * (reward + discountFactor * maxNextQ - currentQ);
            setQ(state, actionIdx, newQ);
            
            state = nextState;
            totalReward += reward;
            steps++;
        }
        
        return { steps, totalReward };
    }
    
    // Run one step with visualization (2-step TD) - Multi-agent version
    async function runStepWithAnimation() {
        // Move all agents in parallel
        for (let i = 0; i < agents.length; i++) {
            const agent = agents[i];
            
            if (isDone(agent.pos)) {
                // Episode done - process remaining trajectory
                processTrajectoryEnd(agent);
                
                // Start new episode for this agent
                episode++;
                agent.pos = { ...startPos };
                agent.trajectory = [];
                epsilon = Math.max(minEpsilon, epsilon * epsilonDecay);
                learningRate = Math.max(minLearningRate, learningRate * learningRateDecay);
            } else {
                // Take action and observe
                const state = { ...agent.pos };
                const actionIdx = selectAction(agent.pos);
                const nextState = getNextState(agent.pos, actionIdx);
                const reward = getReward(nextState);
                
                // Mark this state-action pair as visited
                const stateKey = `${state.x},${state.y}`;
                const stateActionKey = `${stateKey}-${actionIdx}`;
                visitedStateActions.add(stateActionKey);
                
                // Add to agent's trajectory
                agent.trajectory.push({ state, actionIdx, reward });
                
                // 2-step TD update
                if (agent.trajectory.length >= nSteps) {
                    const t = agent.trajectory[0];
                    let G = 0;
                    
                    // Calculate 2-step return: r_t + γr_{t+1} + γ²max Q(s_{t+2})
                    for (let j = 0; j < nSteps; j++) {
                        G += Math.pow(discountFactor, j) * agent.trajectory[j].reward;
                    }
                    
                    // Add bootstrapped value from current state (2 steps ahead)
                    const bootstrapValue = isDone(nextState) ? 0 : getMaxQ(nextState);
                    G += Math.pow(discountFactor, nSteps) * bootstrapValue;
                    
                    // Update Q-value (shared across all agents)
                    const currentQ = getQ(t.state, t.actionIdx);
                    const newQ = currentQ + learningRate * (G - currentQ);
                    setQ(t.state, t.actionIdx, newQ);
                    
                    // Remove oldest entry
                    agent.trajectory.shift();
                }
                
                agent.pos = nextState;
                totalSteps++;
            }
        }
        
        draw();
        updateStats();
        
        if (isTraining) {
            setTimeout(runStepWithAnimation, animationSpeed);
        }
    }
    
    // Process remaining trajectory at episode end
    function processTrajectoryEnd(agent) {
        // Update remaining states in trajectory with actual returns
        while (agent.trajectory.length > 0) {
            const t = agent.trajectory[0];
            let G = 0;
            
            // Calculate return from this state to end
            for (let i = 0; i < agent.trajectory.length; i++) {
                G += Math.pow(discountFactor, i) * agent.trajectory[i].reward;
            }
            
            // Update Q-value
            const currentQ = getQ(t.state, t.actionIdx);
            const newQ = currentQ + learningRate * (G - currentQ);
            setQ(t.state, t.actionIdx, newQ);
            
            agent.trajectory.shift();
        }
    }
    
    // Check if Q-values have converged
    function hasConverged() {
        // Run a test episode to see if agent reaches goal efficiently
        let testState = { ...startPos };
        let steps = 0;
        const visited = new Set();
        
        while (!isDone(testState) && steps < gridSize * gridSize) {
            const key = `${testState.x},${testState.y}`;
            if (visited.has(key)) {
                return false; // Looping, not converged
            }
            visited.add(key);
            
            const actionIdx = getBestAction(testState);
            testState = getNextState(testState, actionIdx);
            steps++;
        }
        
        return grid[testState.y][testState.x] === END;
    }
    
    // Start training
    function startTraining() {
        if (isTraining) return;
        isTraining = true;
        runStepWithAnimation();
        updateButtonStates();
    }
    
    // Stop training
    function stopTraining() {
        isTraining = false;
        updateButtonStates();
    }
    
    // Reset everything
    function reset() {
        stopTraining();
        qTable = {};
        visitedStateActions = new Set();
        episode = 0;
        totalSteps = 0;
        episodeRewards = [];
        epsilon = 0.3;
        learningRate = 0.4;
        initializeAgents();
        draw();
        updateStats();
    }
    
    // Clear grid
    function clearGrid() {
        stopTraining();
        grid = Array(gridSize).fill(null).map(() => Array(gridSize).fill(EMPTY));
        startPos = { x: 1, y: 1 };
        endPos = { x: 8, y: 8 };
        grid[startPos.y][startPos.x] = START;
        grid[endPos.y][endPos.x] = END;
        reset();
    }
    
    // Draw grid
    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw cells with Q-value coloring
        for (let y = 0; y < gridSize; y++) {
            for (let x = 0; x < gridSize; x++) {
                const cell = grid[y][x];
                
                // Background color based on Q-value
                const qValue = getMaxQ({ x, y });
                
                if (cell === WALL) {
                    ctx.fillStyle = '#000000';
                } else if (cell === START) {
                    ctx.fillStyle = '#ffffff'; // Pure white
                } else if (cell === END) {
                    ctx.fillStyle = '#ffffcc'; // Light yellow
                } else if (cell === TRAP) {
                    ctx.fillStyle = '#8B0000'; // Dark red - distinct from orange Q-values
                } else {
                    // Value-based color mapping
                    // Negative (-10 to 0): orange to yellow
                    // Zero (0): green
                    // Positive (0 to 100): cyan → blue → purple
                    
                    if (qValue < 0) {
                        // Negative: orange to yellow
                        // Map from -10 to 0 → orange to yellow
                        const intensity = Math.max(0, Math.min(1, (qValue + 10) / 10));
                        const r = Math.floor(255);                    // Full red
                        const g = Math.floor(140 + intensity * 115);  // 140-255 (orange to yellow)
                        const b = Math.floor(0 + intensity * 100);    // 0-100 (add slight blue in yellow)
                        ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
                    } else if (qValue > 0) {
                        // Positive: cyan → blue → purple
                        // Split into two ranges: 0-50 (cyan to blue), 50-100 (blue to purple)
                        if (qValue <= 50) {
                            // 0-50: cyan to blue
                            const intensity = qValue / 50;
                            const r = Math.floor(0 + intensity * 50);   // 0-50
                            const g = Math.floor(255 - intensity * 100); // 255-155
                            const b = 255;                               // Full blue
                            ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
                        } else {
                            // 50-100: blue to purple
                            const intensity = (qValue - 50) / 50;
                            const r = Math.floor(50 + intensity * 130);  // 50-180
                            const g = Math.floor(155 - intensity * 105); // 155-50
                            const b = 255;                               // Full blue
                            ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
                        }
                    } else {
                        // Zero: green
                        ctx.fillStyle = '#00ff00';
                    }
                }
                
                ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
                
                // Draw letters and symbols for special cells
                if (cell === START) {
                    ctx.fillStyle = '#000000';
                    ctx.font = 'bold 20px Consolas';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText('S', x * cellSize + cellSize / 2, y * cellSize + cellSize / 2);
                } else if (cell === END) {
                    ctx.fillStyle = '#000000';
                    ctx.font = 'bold 20px Consolas';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText('T', x * cellSize + cellSize / 2, y * cellSize + cellSize / 2);
                } else if (cell === TRAP) {
                    // Draw large X on trap cells
                    ctx.strokeStyle = '#FFD700'; // Gold color for high contrast
                    ctx.lineWidth = 3;
                    const offset = cellSize * 0.25;
                    ctx.beginPath();
                    ctx.moveTo(x * cellSize + offset, y * cellSize + offset);
                    ctx.lineTo((x + 1) * cellSize - offset, (y + 1) * cellSize - offset);
                    ctx.moveTo((x + 1) * cellSize - offset, y * cellSize + offset);
                    ctx.lineTo(x * cellSize + offset, (y + 1) * cellSize - offset);
                    ctx.stroke();
                } else if (cell === EMPTY && qValue !== 0) {
                    // Draw Q-value text in black
                    ctx.fillStyle = '#000000';
                    ctx.font = '10px Consolas';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText(qValue.toFixed(1), x * cellSize + cellSize / 2, y * cellSize + cellSize / 2);
                }
                
                // Draw grid lines
                ctx.strokeStyle = '#1e1e1e';
                ctx.lineWidth = 1;
                ctx.strokeRect(x * cellSize, y * cellSize, cellSize, cellSize);
            }
        }
        
        // Draw all agents
        agents.forEach((agent, idx) => {
            ctx.fillStyle = agent.color;
            ctx.beginPath();
            ctx.arc(
                agent.pos.x * cellSize + cellSize / 2,
                agent.pos.y * cellSize + cellSize / 2,
                cellSize / 3,
                0,
                Math.PI * 2
            );
            ctx.fill();
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2;
            ctx.stroke();
            
            // Draw agent number
            ctx.fillStyle = '#000000';
            ctx.font = 'bold 12px Consolas';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText((idx + 1).toString(), agent.pos.x * cellSize + cellSize / 2, agent.pos.y * cellSize + cellSize / 2);
        });
    }
    
    // Update statistics display
    function updateStats() {
        const statsDiv = document.getElementById('rl-stats');
        if (!statsDiv) return;
        
        const lang = typeof getCurrentLanguage === 'function' ? getCurrentLanguage() : 'en';
        const episodeText = lang === 'zh' ? '回合' : 'Episodes';
        const stepsText = lang === 'zh' ? '步数' : 'Steps';
        const epsilonText = lang === 'zh' ? '探索率' : 'Epsilon';
        const learningRateText = lang === 'zh' ? '学习率' : 'Learn Rate';
        const exploredText = lang === 'zh' ? '已探索' : 'Explored';
        const agentsText = lang === 'zh' ? '智能体' : 'Agents';
        
        const exploredCount = visitedStateActions.size;
        
        statsDiv.innerHTML = `
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; font-family: Consolas, monospace;">
                <div><strong>${agentsText}:</strong> ${numAgents}</div>
                <div><strong>${episodeText}:</strong> ${episode}</div>
                <div><strong>${stepsText}:</strong> ${totalSteps}</div>
                <div><strong>${epsilonText}:</strong> ${(epsilon * 100).toFixed(1)}%</div>
                <div><strong>${learningRateText}:</strong> ${learningRate.toFixed(3)}</div>
                <div><strong>${exploredText}:</strong> ${exploredCount}</div>
            </div>
        `;
    }
    
    // Update button states
    function updateButtonStates() {
        if (startButton && stopButton) {
            startButton.disabled = isTraining;
            stopButton.disabled = !isTraining;
            startButton.style.opacity = isTraining ? '0.5' : '1';
            stopButton.style.opacity = !isTraining ? '0.5' : '1';
            startButton.style.cursor = isTraining ? 'not-allowed' : 'pointer';
            stopButton.style.cursor = !isTraining ? 'not-allowed' : 'pointer';
        }
    }
    
    // Mouse interaction for drawing
    let isDrawing = false;
    
    function handleCanvasClick(e) {
        if (isTraining) return;
        
        const rect = canvas.getBoundingClientRect();
        const x = Math.floor((e.clientX - rect.left) / cellSize);
        const y = Math.floor((e.clientY - rect.top) / cellSize);
        
        if (x < 0 || x >= gridSize || y < 0 || y >= gridSize) return;
        
        // Clear old start/end if placing new one
        if (drawMode === START) {
            grid[startPos.y][startPos.x] = EMPTY;
            startPos = { x, y };
            // Reset all agents to new start position
            agents.forEach(agent => {
                agent.pos = { ...startPos };
            });
        } else if (drawMode === END) {
            grid[endPos.y][endPos.x] = EMPTY;
            endPos = { x, y };
        }
        
        grid[y][x] = drawMode;
        draw();
    }
    
    canvas.addEventListener('mousedown', (e) => {
        isDrawing = true;
        handleCanvasClick(e);
    });
    
    canvas.addEventListener('mousemove', (e) => {
        if (isDrawing && (drawMode === WALL || drawMode === TRAP || drawMode === EMPTY)) {
            handleCanvasClick(e);
        }
    });
    
    canvas.addEventListener('mouseup', () => {
        isDrawing = false;
    });
    
    canvas.addEventListener('mouseleave', () => {
        isDrawing = false;
    });
    
    // Create controls
    const container = canvas.parentElement;
    
    // Check if controls already exist
    let controlsContainer = document.getElementById('rl-controls-container');
    let statsDiv, toolButtons, actionButtons;
    let startButton, stopButton, resetButton, clearButton;
    
    if (!controlsContainer) {
        controlsContainer = document.createElement('div');
        controlsContainer.id = 'rl-controls-container';
        controlsContainer.style.marginTop = '15px';
        
        // Stats display
        statsDiv = document.createElement('div');
        statsDiv.id = 'rl-stats';
        statsDiv.style.padding = '15px';
        statsDiv.style.backgroundColor = '#2d2d30';
        statsDiv.style.borderRadius = '5px';
        statsDiv.style.marginBottom = '15px';
        statsDiv.style.color = '#d4d4d4';
        controlsContainer.appendChild(statsDiv);
        
        // Tool selection
        const toolContainer = document.createElement('div');
        toolContainer.style.marginBottom = '15px';
        
        const lang = typeof getCurrentLanguage === 'function' ? getCurrentLanguage() : 'en';
        const toolLabel = document.createElement('div');
        toolLabel.style.marginBottom = '8px';
        toolLabel.style.color = '#d4d4d4';
        toolLabel.style.fontFamily = 'Consolas, monospace';
        toolLabel.setAttribute('data-en', 'Draw Tool:');
        toolLabel.setAttribute('data-zh', '绘制工具：');
        toolLabel.textContent = lang === 'zh' ? '绘制工具：' : 'Draw Tool:';
        toolContainer.appendChild(toolLabel);
        
        const toolButtonContainer = document.createElement('div');
        toolButtonContainer.style.display = 'flex';
        toolButtonContainer.style.gap = '8px';
        toolButtonContainer.style.flexWrap = 'wrap';
        
        const tools = [
            { mode: START, label: 'Start', labelZh: '起点', color: '#4ec9b0' },
            { mode: END, label: 'End', labelZh: '终点', color: '#569cd6' },
            { mode: TRAP, label: 'Trap', labelZh: '陷阱', color: '#f48771' },
            { mode: WALL, label: 'Wall', labelZh: '墙壁', color: '#3c3c3c' },
            { mode: EMPTY, label: 'Erase', labelZh: '擦除', color: '#1e1e1e' }
        ];
        
        toolButtons = [];
        tools.forEach(tool => {
            const btn = document.createElement('button');
            btn.setAttribute('data-en', tool.label);
            btn.setAttribute('data-zh', tool.labelZh);
            btn.textContent = lang === 'zh' ? tool.labelZh : tool.label;
            btn.style.padding = '8px 16px';
            btn.style.fontSize = '14px';
            btn.style.backgroundColor = tool.mode === drawMode ? tool.color : '#2d2d30';
            btn.style.color = '#ffffff';
            btn.style.border = `2px solid ${tool.color}`;
            btn.style.borderRadius = '5px';
            btn.style.cursor = 'pointer';
            btn.style.fontFamily = 'Consolas, monospace';
            btn.style.transition = 'all 0.2s';
            
            btn.addEventListener('click', () => {
                drawMode = tool.mode;
                toolButtons.forEach((b, idx) => {
                    b.button.style.backgroundColor = tools[idx].mode === drawMode ? tools[idx].color : '#2d2d30';
                });
            });
            
            toolButtonContainer.appendChild(btn);
            toolButtons.push({ button: btn, tool });
        });
        
        toolContainer.appendChild(toolButtonContainer);
        controlsContainer.appendChild(toolContainer);
        
        // Action buttons
        const buttonContainer = document.createElement('div');
        buttonContainer.style.display = 'flex';
        buttonContainer.style.gap = '10px';
        buttonContainer.style.justifyContent = 'center';
        buttonContainer.style.flexWrap = 'wrap';
        
        // Start button
        startButton = document.createElement('button');
        startButton.setAttribute('data-en', 'Start Training');
        startButton.setAttribute('data-zh', '开始训练');
        startButton.textContent = lang === 'zh' ? '开始训练' : 'Start Training';
        startButton.style.padding = '10px 20px';
        startButton.style.fontSize = '16px';
        startButton.style.backgroundColor = '#4ec9b0';
        startButton.style.color = '#ffffff';
        startButton.style.border = 'none';
        startButton.style.borderRadius = '5px';
        startButton.style.cursor = 'pointer';
        startButton.style.fontFamily = 'Consolas, monospace';
        startButton.addEventListener('click', startTraining);
        
        // Stop button
        stopButton = document.createElement('button');
        stopButton.setAttribute('data-en', 'Stop');
        stopButton.setAttribute('data-zh', '停止');
        stopButton.textContent = lang === 'zh' ? '停止' : 'Stop';
        stopButton.style.padding = '10px 20px';
        stopButton.style.fontSize = '16px';
        stopButton.style.backgroundColor = '#f48771';
        stopButton.style.color = '#ffffff';
        stopButton.style.border = 'none';
        stopButton.style.borderRadius = '5px';
        stopButton.style.cursor = 'pointer';
        stopButton.style.fontFamily = 'Consolas, monospace';
        stopButton.disabled = true;
        stopButton.style.opacity = '0.5';
        stopButton.addEventListener('click', stopTraining);
        
        // Reset button
        resetButton = document.createElement('button');
        resetButton.setAttribute('data-en', 'Reset');
        resetButton.setAttribute('data-zh', '重置');
        resetButton.textContent = lang === 'zh' ? '重置' : 'Reset';
        resetButton.style.padding = '10px 20px';
        resetButton.style.fontSize = '16px';
        resetButton.style.backgroundColor = '#858585';
        resetButton.style.color = '#ffffff';
        resetButton.style.border = 'none';
        resetButton.style.borderRadius = '5px';
        resetButton.style.cursor = 'pointer';
        resetButton.style.fontFamily = 'Consolas, monospace';
        resetButton.addEventListener('click', reset);
        
        // Clear button
        clearButton = document.createElement('button');
        clearButton.setAttribute('data-en', 'Clear Grid');
        clearButton.setAttribute('data-zh', '清空网格');
        clearButton.textContent = lang === 'zh' ? '清空网格' : 'Clear Grid';
        clearButton.style.padding = '10px 20px';
        clearButton.style.fontSize = '16px';
        clearButton.style.backgroundColor = '#858585';
        clearButton.style.color = '#ffffff';
        clearButton.style.border = 'none';
        clearButton.style.borderRadius = '5px';
        clearButton.style.cursor = 'pointer';
        clearButton.style.fontFamily = 'Consolas, monospace';
        clearButton.addEventListener('click', clearGrid);
        
        buttonContainer.appendChild(startButton);
        buttonContainer.appendChild(stopButton);
        buttonContainer.appendChild(resetButton);
        buttonContainer.appendChild(clearButton);
        controlsContainer.appendChild(buttonContainer);
        
        container.appendChild(controlsContainer);
    } else {
        // Get references to existing elements
        statsDiv = document.getElementById('rl-stats');
        const buttons = controlsContainer.querySelectorAll('button');
        // Tool buttons are the first 5, action buttons are the last 4
        startButton = buttons[5];
        stopButton = buttons[6];
        resetButton = buttons[7];
        clearButton = buttons[8];
    }
    
    // Register for language changes
    if (typeof onLanguageChange === 'function') {
        onLanguageChange((newLang) => {
            // Update all buttons
            controlsContainer.querySelectorAll('[data-en][data-zh]').forEach(elem => {
                elem.textContent = newLang === 'zh' ? elem.getAttribute('data-zh') : elem.getAttribute('data-en');
            });
            updateStats();
        });
    }
    
    // Initial draw
    draw();
    updateStats();
})();
