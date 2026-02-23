// Constants are imported from data.js

const tooltip = document.getElementById('tooltip');

let lineWidthPhase = 0;
const linePhases = [];

function init() {
    const canvas = document.getElementById('connectionCanvas');
    const ctx = canvas.getContext('2d');
    const layersContainer = document.getElementById('layersContainer');
    layersContainer.innerHTML = '';

    layersConfig.forEach((layer, layerIndex) => {
        const layerWrapper = document.createElement('div');
        layerWrapper.className = 'layer-wrapper';
        layerWrapper.style.width = `${100 / layersConfig.length}%`;
        
        const title = document.createElement('div');
        title.className = 'layer-title';
        title.innerHTML = `<i class="${layerIcons[layerIndex]}"></i><br>${layersDisplayTitle[layer.title]}`;
        layerWrapper.appendChild(title);

        const layerDiv = document.createElement('div');
        layerDiv.className = 'neural-layer';
        
        for (let i = 0; i < layer.nodes; i++) {
            const node = document.createElement('div');
            node.className = 'neural-node';
            node.innerHTML = `<i class="${nodeIcons[layer.title][i]}"></i>`;

            if (layer.labels[i]) {
                node.addEventListener('mouseenter', (e) => {
                    tooltip.textContent = layer.labels[i];
                    tooltip.style.display = 'block';
                    tooltip.classList.add('show');
                });
                node.addEventListener('mousemove', (e) => {
                    tooltip.style.left = `${e.pageX + 10}px`;
                    tooltip.style.top = `${e.pageY - tooltip.offsetHeight - 10}px`;
                });
                node.addEventListener('mouseleave', () => {
                    tooltip.style.display = 'none';
                    tooltip.classList.remove('show');
                });
                node.addEventListener('click', (e) => {
                    e.stopPropagation();
                    showContent(layerIndex, i);
                });
            }

            node.style.zIndex = 2;
            layerDiv.appendChild(node);
        }

        layerDiv.style.zIndex = 1;
        layerWrapper.appendChild(layerDiv);
        layerWrapper.style.zIndex = 1;
        layersContainer.appendChild(layerWrapper);
    });

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight * 0.7;
        drawConnections();
    }

    function drawConnections() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
        
        const canvasRect = canvas.getBoundingClientRect();
        const layers = document.getElementsByClassName('neural-layer');

        if (linePhases.length === 0) {
            for (let i = 0; i < layers.length - 1; i++) {
                const currentLayer = layers[i].children;
                const nextLayer = layers[i + 1].children;
                Array.from(currentLayer).forEach(() => {
                    Array.from(nextLayer).forEach(() => {
                        linePhases.push(Math.random() * Math.PI * 2);
                    });
                });
            }
        }

        let phaseIndex = 0;
        for (let i = 0; i < layers.length - 1; i++) {
            const currentLayer = layers[i].children;
            const nextLayer = layers[i + 1].children;
            Array.from(currentLayer).forEach(node1 => {
                Array.from(nextLayer).forEach(node2 => {
                    const rect1 = node1.getBoundingClientRect();
                    const rect2 = node2.getBoundingClientRect();
                    const x1 = rect1.left + rect1.width / 2 - canvasRect.left;
                    const y1 = rect1.top + rect1.height / 2 - canvasRect.top;
                    const x2 = rect2.left + rect2.width / 2 - canvasRect.left;
                    const y2 = rect2.top + rect2.height / 2 - canvasRect.top;

                    const baseLineWidth = 1;
                    const maxLineWidth = 5;
                    const phase = lineWidthPhase + linePhases[phaseIndex];
                    const lineWidth = baseLineWidth + (maxLineWidth - baseLineWidth) * (Math.sin(phase) + 1) / 2;
                    ctx.lineWidth = lineWidth;
                    
                    ctx.beginPath();
                    ctx.moveTo(x1, y1);
                    ctx.lineTo(x2, y2);
                    ctx.stroke();

                    phaseIndex++;
                });
            });
        }

        lineWidthPhase = (lineWidthPhase + 0.005) % (Math.PI * 200);
        requestAnimationFrame(drawConnections);
    }

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    // const contentCard = document.getElementById('contentCard');
    // contentCard.addEventListener('click', e => e.stopPropagation());

    const contentOverlay = document.getElementById('contentOverlay');
    contentOverlay.addEventListener('click', function(e) {
        // print e.target
        if (e.target == contentOverlay) {
            closeContent();
        }
    });
}

let activeAnimation = null;

function showContent(layerIndex, nodeIndex) {
    const layerTitle = layersConfig[layerIndex].title;
    const layerDiv = document.querySelectorAll('.neural-layer')[layerIndex];
    const nodes = layerDiv.children;
    const clickedNode = nodes[nodeIndex];

    const container = document.getElementById('networkContainer');
    const containerRect = container.getBoundingClientRect();
    const centerX = containerRect.left + containerRect.width / 2;
    const centerY = containerRect.top + containerRect.height / 2;

    const nodeRect = clickedNode.getBoundingClientRect();
    const nodeCenterX = nodeRect.left + nodeRect.width / 2;
    const nodeCenterY = nodeRect.top + nodeRect.height / 2;

    const offsetX = centerX - nodeCenterX;
    const offsetY = centerY - nodeCenterY;

    clickedNode.style.setProperty('--center-x', `${offsetX}px`);
    clickedNode.style.setProperty('--center-y', `${offsetY}px`);
    clickedNode.classList.add('flood-animation');
    
    const contentOverlay = document.getElementById('contentOverlay');
    const contentTitle = document.getElementById('contentTitle');
    const contentBody = document.getElementById('contentBody');

    contentOverlay.style.display = 'flex';
    
    const node_label = layersConfig[layerIndex].labels[nodeIndex];
    contentTitle.textContent = node_label;
    contentBody.innerHTML = contentData[layerTitle][node_label];
    
    const fontSize = fontSizeData[layerTitle][node_label] || "16px";
    contentBody.style.fontSize = fontSize;

    contentOverlay.classList.add('fade-in');
    contentTitle.classList.add('fade-in');
    contentBody.classList.add('fade-in');
}

function closeContent() {
    const contentOverlay = document.getElementById('contentOverlay');
    const contentTitle = document.getElementById('contentTitle');
    const contentBody = document.getElementById('contentBody');

    contentTitle.classList.remove('fade-in');
    contentBody.classList.remove('fade-in');
    contentOverlay.classList.remove('fade-in');
    contentTitle.classList.add('fade-out');
    contentBody.classList.add('fade-out');
    contentOverlay.classList.add('fade-out');

    setTimeout(() => {
        contentOverlay.style.display = 'none';
        contentTitle.classList.remove('fade-out');
        contentBody.classList.remove('fade-out');
        contentOverlay.classList.remove('fade-out');
    }, 500);
    
    document.querySelectorAll('.neural-node').forEach(node => {
        if (node.classList.contains('flood-animation')) {
            node.classList.remove('flood-animation');
            node.classList.add('reverse-flood-animation');
            setTimeout(() => {
                node.classList.remove('reverse-flood-animation');
            }, 800);
        }
    });
    
    clearTimeout(activeAnimation);
}

window.onload = init;