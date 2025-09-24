// 初始化神经网络结构
const layersConfig = [
    {
        title: "About Me",
        nodes: 1,
        labels: ["Who Am I"] },
    {
        title: "Research Interests",
        nodes: 6,
        labels: ["Deep Learning", "Generative Methods", "Urban Computing", "Spatio-Temporal Data", "Computer Vision", "Reinforcement Learning"] },
    {
        title: "Academic Background",
        nodes: 5,
        labels: ["BSc", "MSc", "PhD", "", ""] },
    {
        title: "Projects and Publications",
        nodes: 5,
        labels: ["Road Network Generation", "Project B", "", "", ""]},
    {
        title: "Career",
        nodes: 2,
        labels: ["Position A", "Position B"] }
];

const layersDisplayTitle = {
    "About Me": "About Me",
    "Research Interests": "Research<br>Interests",
    "Academic Background": "Academic<br>Background",
    "Projects and Publications": "Projects<br>and Publications",
    "Career": "Career"
}

// 内容数据
const contentData = {
    "About Me": {
        "Who Am I": "I am a Computer Science PhD candidate at the University of Exeter specializing in deep learning and urban computing. My research focuses on integrating generative AI with spatio-temporal data analysis to solve complex urban challenges."
    },
    "Research Interests": {
        "Deep Learning": "I have experience on building and training various deep learning architectures including CNNs, RNNs, and Transformers. I am familiar with different Neural Network Layers, their principles and functions. PyTorch is my main framework.",

        "Generative Methods": "VAEs, GANs, and diffusion models are very popular models in recent years. Especially diffusion models are widely used in image generation and text-to-image generation. I am interested in their applications in urban computing, such as spatio-temporal data synthesis.",

        "Urban Computing": "Urban computing is a multidisciplinary field that focuses on the study of urban environments through the lens of data science and computer science. I am interested in how to use data-driven methods to solve urban problems, especially those related to trajectory data, road networks, and dispatching systems.",

        "Spatio-Temporal Data": "Spatio-temporal data refers to data that has both spatial and temporal components. I am interested in how to use deep learning methods to figure out the hidden relations between spatial and temporal features, or sometimes merge them together.",

        "Computer Vision": "I have experience in various computer vision tasks in real-world industries, such as object detection with YOLOv5, image segmentation with U-Net and DeepLab, image generation with CycleGAN, pose estimation with OpenPose and AlphaPose, pose classification with SEResNet. I also have experience on deploying these models using NVIDIA TensorRT and DeepStream.",

        "Reinforcement Learning": "Really fun to learn how to train an agent to make decisions in a dynamic environment. RL is pretty useful (and is becoming more and more popular) in many fields, such as robotics, order dispatching, or even LLMs recently. Most importantly, they can be used in games, imagine you can train an agent to play games like Terraria (And you can never win against it)."
    },
    "Academic Background": {
        "BSc": "BSc in Computer Science from University of Alberta, Canada, 2018 - 2022",
        "MSc": "MSc in Computer Science from University of Exeter, UK, 2022 - 2023",
        "PhD": "PhD in Computer Science from University of Exeter, UK, 2023 - Present",
    },
    "Projects and Publications": {
        "Road Network Generation": "<a href=\"https://doi.org/10.24963/ijcai.2025/702\" target=\"_blank\">https://doi.org/10.24963/ijcai.2025/702</a> Road networks are the vein of modern cities. Yet, maintaining up-to-date and accurate road network information is a persistent challenge, especially in areas with rapid urban changes or limited surveying resources. Crowdsourced trajectories, e.g., from GPS records collected by mobile devices and vehicles, have emerged as a powerful data source for continuously mapping the urban areas. However, the inherent noise, irregular and often sparse sampling rates, and the vast variability in movement patterns make the problem of road network generation from trajectories a non-trivial task. Existing methods often approach this from an appearance-based perspective: they typically render trajectories as 2D density maps and then employ heuristic algorithms to extract road networks - leading to inevitable information loss and thus poor performance especially when trajectories are sparse or ambiguities present, e.g. flyovers. In this paper, we propose a novel approach, called GraphWalker, to generate high-fidelity road network graphs from raw trajectories in an end-to-end manner. We achieve this by designing a bespoke latent diffusion transformer T2W-DiT, which treats input trajectories as generation conditions, and gradually denoises samples from a latent space to obtain the corresponding walks on the underlying road network graph - then assemble them together as the final road network. Extensive experiments on multiple datasets demonstrate the proposed GraphWalker can effectively generate high quality road networks from noisy and sparse trajectories, showcasing significant improvements over state-of-the-art.",
        "Project B": "TODO"
    },
    "Career": {
        "Computer Vision Algorithm Engineer": "Beijing Kanbig Technology Corp, Ltd, China, 2021 - 2023",
        "Post Graduate Teaching Assistant": "University of Exeter, UK, 2023 - Present",
    }
};

// 字体大小配置
const fontSizeData = {
    "About Me": {
        "Who Am I": "18px"
    },
    "Research Interests": {
        "Deep Learning": "16px",
        "Generative Methods": "16px",
        "Urban Computing": "16px",
        "Spatio-Temporal Data": "16px",
        "Computer Vision": "14px",
        "Reinforcement Learning": "16px"
    },
    "Academic Background": {
        "BSc": "18px",
        "MSc": "18px",
        "PhD": "18px"
    },
    "Projects and Publications": {
        "Road Network Generation": "12px",
        "Project B": "18px"
    },
    "Career": {
        "Computer Vision Algorithm Engineer": "16px",
        "Post Graduate Teaching Assistant": "16px"
    }
};

// 配置层图标
const layerIcons = [
    'fas fa-user-astronaut',       // About Me
    'fas fa-brain',                // Research
    'fas fa-graduation-cap',       // Academic
    'fas fa-book-open',            // Publications
    'fas fa-briefcase'             // Career
];

// 节点图标配置
const nodeIcons = {
    'About Me': ['fas fa-id-card'],
    'Research Interests': [
        'fa-solid fa-robot', 
        'fa-solid fa-lightbulb',
        'fa-solid fa-city',
        'fa-solid fa-clock',
        'fa-solid fa-eye',
        'fa-solid fa-gamepad'
    ],
    'Academic Background': [
        'fas fa-user-graduate',
        'fas fa-user-graduate',
        'fas fa-user-graduate',
        '',
        ''
    ],
    'Projects and Publications': [
        'fas fa-diagram-project',
        'fas fa-diagram-project',
        '',
        '',
        ''
    ],
    'Career': [
        'fas fa-eye',
        'fas fa-chalkboard-user'
    ]
};

const tooltip = document.getElementById('tooltip');

let lineWidthPhase = 0; // 全局相位，用于控制线宽变化的速度
const linePhases = []; // 存储每条线的随机初始相位

// 初始化函数
function init() {
    // 定义并初始化 canvas 和 ctx
    const canvas = document.getElementById('connectionCanvas');
    const ctx = canvas.getContext('2d');
    const layersContainer = document.getElementById('layersContainer');
    layersContainer.innerHTML = ''; // 清空容器

    layersConfig.forEach((layer, layerIndex) => {
        const layerWrapper = document.createElement('div');
        layerWrapper.className = 'layer-wrapper';
        layerWrapper.style.width = `${100 / layersConfig.length}%`;
        
        // 创建标题元素
        const title = document.createElement('div');
        title.className = 'layer-title';
        title.innerHTML = `<i class="${layerIcons[layerIndex]}"></i><br>${layersDisplayTitle[layer.title]}`;
        
        // 先添加标题到容器
        layerWrapper.appendChild(title);

        // 创建节点容器
        const layerDiv = document.createElement('div');
        layerDiv.className = 'neural-layer';
        
        // 创建节点
        for (let i = 0; i < layer.nodes; i++) {
            const node = document.createElement('div');
            node.className = 'neural-node';
            node.innerHTML = `<i class="${nodeIcons[layer.title][i]}"></i>`;

            if (layer.labels[i]) {
                // 鼠标移入时显示 tooltip
                node.addEventListener('mouseenter', (e) => {
                    tooltip.textContent = layer.labels[i]; // 设置 tooltip 内容
                    tooltip.style.display = 'block';
                });
                
                // 鼠标移动时更新 tooltip 位置
                node.addEventListener('mousemove', (e) => {
                    tooltip.style.left = `${e.pageX + 10}px`;
                    tooltip.style.top = `${e.pageY - tooltip.offsetHeight - 10}px`;
                });
                
                node.addEventListener('mouseenter', (e) => {
                    tooltip.textContent = layer.labels[i]; // 设置 tooltip 内容
                    tooltip.style.display = 'block';
                    tooltip.classList.add('show');
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

            // 设置节点z-index
            node.style.zIndex = 2; // 确保节点在其层的上方
            
            layerDiv.appendChild(node);
        }

        layerDiv.style.zIndex = 1; // 确保层在标题下方
        
        // 添加节点容器到 wrapper
        layerWrapper.appendChild(layerDiv);

        layerWrapper.style.zIndex = 1;

        layersContainer.appendChild(layerWrapper);
    });

    // 画布自适应
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight * 0.7;
        drawConnections();
    }

    // 绘制连接线
    function drawConnections() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
        
        const canvasRect = canvas.getBoundingClientRect(); // 获取 canvas 的位置
        const layers = document.getElementsByClassName('neural-layer');

        // 初始化线的相位数组（只在第一次调用时执行）
        if (linePhases.length === 0) {
            for (let i = 0; i < layers.length - 1; i++) {
                const currentLayer = layers[i].children;
                const nextLayer = layers[i + 1].children;

                Array.from(currentLayer).forEach(() => {
                    Array.from(nextLayer).forEach(() => {
                        linePhases.push(Math.random() * Math.PI * 2); // 随机初始相位
                    });
                });
            }
        }

        let phaseIndex = 0; // 用于遍历线的相位数组

        for (let i = 0; i < layers.length - 1; i++) {
            const currentLayer = layers[i].children;
            const nextLayer = layers[i + 1].children;
            
            Array.from(currentLayer).forEach(node1 => {
                Array.from(nextLayer).forEach(node2 => {
                    const rect1 = node1.getBoundingClientRect();
                    const rect2 = node2.getBoundingClientRect();
                    
                    // 修正坐标相对于 canvas
                    const x1 = rect1.left + rect1.width / 2 - canvasRect.left;
                    const y1 = rect1.top + rect1.height / 2 - canvasRect.top;
                    const x2 = rect2.left + rect2.width / 2 - canvasRect.left;
                    const y2 = rect2.top + rect2.height / 2 - canvasRect.top;

                    // 动态计算线宽
                    const baseLineWidth = 1; // 基础线宽
                    const maxLineWidth = 5; // 最大线宽
                    const phase = lineWidthPhase + linePhases[phaseIndex]; // 当前线的相位
                    const lineWidth = baseLineWidth + (maxLineWidth - baseLineWidth) * (Math.sin(phase) + 1) / 2;
                    ctx.lineWidth = lineWidth;
                    
                    ctx.beginPath();
                    ctx.moveTo(x1, y1);
                    ctx.lineTo(x2, y2);
                    ctx.stroke();

                    phaseIndex++; // 更新相位索引
                });
            });
        }

        // 更新全局相位并请求下一帧
        lineWidthPhase = (lineWidthPhase + 0.005) % (Math.PI * 200); // 控制线宽变化的速度同时防止数值过大
        requestAnimationFrame(drawConnections);
    }

    // 初始化和窗口监听
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
}

// 重写内容显示逻辑
let activeAnimation = null;

function showContent(layerIndex, nodeIndex) {
    const layerTitle = layersConfig[layerIndex].title;
    const layerDiv = document.querySelectorAll('.neural-layer')[layerIndex];
    const nodes = layerDiv.children;
    const clickedNode = nodes[nodeIndex];

    // 获取容器 #2 的中心点
    const container = document.getElementById('networkContainer');
    const containerRect = container.getBoundingClientRect();
    const centerX = containerRect.left + containerRect.width / 2;
    const centerY = containerRect.top + containerRect.height / 2;

    const nodeRect = clickedNode.getBoundingClientRect();
    const nodeCenterX = nodeRect.left + nodeRect.width / 2;
    const nodeCenterY = nodeRect.top + nodeRect.height / 2;

    // 计算节点相对于中心的偏移量
    const offsetX = centerX - nodeCenterX;
    const offsetY = centerY - nodeCenterY;

    // 设置节点的 CSS 变量
    clickedNode.style.setProperty('--center-x', `${offsetX}px`);
    clickedNode.style.setProperty('--center-y', `${offsetY}px`);
    
    // 洪水动画
    clickedNode.classList.add('flood-animation');
    
    // 动画结束显示内容
    const contentOverlay = document.getElementById('contentOverlay');
    const contentTitle = document.getElementById('contentTitle');
    const contentBody = document.getElementById('contentBody');

    contentOverlay.style.display = 'flex';
    
    // 更新内容
    const node_label = layersConfig[layerIndex].labels[nodeIndex];
    contentTitle.textContent = node_label;
    contentBody.innerHTML = contentData[layerTitle][node_label];
    
    // 应用字体大小
    const fontSize = fontSizeData[layerTitle][node_label] || "16px";
    contentBody.style.fontSize = fontSize;

    contentOverlay.classList.add('fade-in');
    contentTitle.classList.add('fade-in');
    contentBody.classList.add('fade-in');
}

// 关闭逻辑修改
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
    
    // 逆洪水动画
    document.querySelectorAll('.neural-node').forEach(node => {
        if (node.classList.contains('flood-animation')) {
            node.classList.remove('flood-animation');
            node.classList.add('reverse-flood-animation');

            // 在逆动画结束后清除类
            setTimeout(() => {
                node.classList.remove('reverse-flood-animation');
            }, 800); // 与逆动画的持续时间一致
        }
    });
    
    clearTimeout(activeAnimation);
}

// 点击任意位置关闭
document.getElementById('contentOverlay').addEventListener('click', closeContent);

window.onload = init;
