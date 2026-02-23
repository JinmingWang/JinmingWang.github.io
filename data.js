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
        labels: ["Road Network Generation", "Trajectory Recovery & Generation", "", "", ""]},
    {
        title: "Career",
        nodes: 2,
        labels: ["Computer Vision Algorithm Engineer", "Post Graduate Teaching Assistant"] }
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
        "BSc": "BSc in Computer Science from University of Alberta, Canada, 2018 - 2022.<br> During my undergraduate study, I developed a strong foundation in computer science principles and gained hands-on experience with various programming languages and technologies. In particular, I gained experience in Python, C++, C, Java, and SQL (ranking from most to least familiar). I also got exposure to machine learning, deep learning, computer vision, and reinforcement learning.",
        "MSc": "MSc in Computer Science from University of Exeter, UK, 2022 - 2023.<br> During my master's study, I studied evolutionary algorithms, computer modeling and simulation, multi-objective optimization, etc (but actually I have learned them during my BSc study). My final project was about using reinforcement learning + imitation learning to traing an autonomous driving agent in the CARLA simulator.",
        "PhD": "PhD in Computer Science from University of Exeter, UK, 2023 - Present.<br> I mainly focus on urban computing and generative AI. In terms of data, I am familiar with spatio-temporal data like trajectories, graph data like road networks, image data and other contextual data. In terms of generative AI, I usually work with VAEs and diffusion models, but I also have experience with GANs. In addition, I am also interested in Digital Twins and RAG."
    },
    "Projects and Publications": {
        "Road Network Generation": "<a href=\"https://doi.org/10.24963/ijcai.2025/702\" target=\"_blank\">High-Fidelity Road Network Generation with Latent Diffusion Models (IJCAI 2025)</a> <br> Jinming Wang, Hongkai Wen, Geyong Min, Man Luo <br> Digital road networks (RN) are so important in data-driven smart city applications. Accurate construction of RNs relies on GPS trajectory data, which is often sparse and noisy. Existing trajectory-based RN generators involves multiple data-modality conversions that lead to information loss, as well as heuristic processing steps that are not robust. This work proposes GraphWalker, a novel end-to-end learnable RN generator based on latent diffusion models (LDM). GraphWalker keeps features in geographic space throughout its pipeline, and its unique end-to-end learnable design eliminates the need for heuristic processing.",
        "Trajectory Recovery & Generation": "<a href=\"https://doi.org/10.1145/3774904.3792461\" target=\"_blank\">TRACE: Trajectory Recovery with State Propagation Diffusion for Urban Mobility</a> <br> Jinming Wang, Hai Wang, Hongkai Wen, Geyong Min, Man Luo <br> High-quality GPS trajectories are essential for location-based web services and smart city applications. Yet, real-world trajectories are often sparse and feature unevenly distributed location points due to low sampling rates and limited infrastructure coverage, making it challenging to recover them into dense and continuous forms. TRACE is a novel trajectory recovery framework that uses State Propagation Diffusion Model (SPDM), which retain, leverage and propagates state features from previous steps to assist the generation of later steps."
    },
    "Career": {
        "Computer Vision Algorithm Engineer": "Beijing Kanbig Technology Corp, Ltd, China, 2021 - 2023 <br> I worked as a computer vision algorithm engineer here. My main responsibilities included developing and optimizing computer vision algorithms for various applications, such as pedestrian detection & tracking (YoloV5), pose estimation (OpenPose, AlphaPose), image segmentation (U-Net, DeepLab), image synthesis and augmentation (GANs, CycleGAN), OCR (YOLO + SEResNEt), License Plate Recognition (RetinaNet + STNet + InceptionNet + MobileNet), etc. I also deployed these models using NVIDIA TensorRT and DeepStream.",
        "Post Graduate Teaching Assistant": "University of Exeter, UK, 2023 - Present <br> I am currently working as a Post Graduate Teaching Assistant at the University of Exeter. My main responsibility is to provide academic support to postgraduate students in High Performance Computing (HPC) courses."
    }
};

// 字体大小配置
const fontSizeData = {
    "About Me": { "Who Am I": "18px" },
    "Research Interests": {
        "Deep Learning": "16px",
        "Generative Methods": "16px",
        "Urban Computing": "16px",
        "Spatio-Temporal Data": "16px",
        "Computer Vision": "16px",
        "Reinforcement Learning": "16px"
    },
    "Academic Background": {
        "BSc": "18px",
        "MSc": "18px",
        "PhD": "18px"
    },
    "Projects and Publications": {
        "Road Network Generation": "16px",
        "Project B": "18px"
    },
    "Career": {
        "Computer Vision Algorithm Engineer": "16px",
        "Post Graduate Teaching Assistant": "16px"
    }
};

// 配置层图标
const layerIcons = [
    'fas fa-user-astronaut',
    'fas fa-brain',
    'fas fa-graduation-cap',
    'fas fa-book-open',
    'fas fa-briefcase'
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
