// Global state
let currentLanguage = detectDefaultLanguage();
let contentData = {};
let languageChangeCallbacks = [];

// Detect default language based on timezone
function detectDefaultLanguage() {
    try {
        // Get the user's timezone offset in minutes
        const offset = -new Date().getTimezoneOffset();
        
        // Beijing time is UTC+8 (480 minutes)
        // Also check for China Standard Time timezone identifier
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        
        if (offset === 480 || timezone === 'Asia/Shanghai' || timezone === 'Asia/Beijing' || 
            timezone === 'Asia/Chongqing' || timezone === 'Asia/Harbin' || timezone === 'Asia/Urumqi') {
            return 'zh';
        }
    } catch (e) {
        console.log('Timezone detection failed, using English');
    }
    return 'en';
}

// Initialize the website
document.addEventListener('DOMContentLoaded', async () => {
    await loadAllContent();
    updateAllLanguageText();
    renderProfile();
    renderAllChapters();
    initializeNavigation();
    initializeLanguageSwitch();
    updateLanguageButtonState();
    
    // Set initial chapter to About Me
    showChapter('about');
});

// Load all content from JSON files
async function loadAllContent() {
    try {
        const files = ['profile', 'about', 'experiences', 'demos', 'publications', 'contact'];
        const promises = files.map(file => 
            fetch(`content/${file}.json`)
                .then(response => response.json())
                .then(data => contentData[file] = data)
        );
        await Promise.all(promises);
    } catch (error) {
        console.error('Error loading content:', error);
    }
}

// Render profile section
function renderProfile() {
    const profile = contentData.profile;
    if (!profile) return;
    
    const profileSection = document.getElementById('profile-section');
    profileSection.innerHTML = `
        <img src="${profile.profilePicture}" alt="Profile Picture" class="profile-picture">
        <h2 class="profile-name" data-en="${profile.name.en}" data-zh="${profile.name.zh}">${profile.name[currentLanguage]}</h2>
    `;
}

// Render all chapters
function renderAllChapters() {
    renderAboutChapter();
    renderExperiencesChapter();
    renderDemosChapter();
    renderPublicationsChapter();
    renderContactChapter();
    initializeCollapsibleSections();
}

// Render About chapter
function renderAboutChapter() {
    const data = contentData.about;
    if (!data) return;
    
    const chapter = document.getElementById('about');
    const sectionsHTML = data.sections.map(section => `
        <div class="collapsible-section">
            <h2 class="section-header">
                <span class="toggle-icon">▼</span>
                <span data-en="${section.title.en}" data-zh="${section.title.zh}">${section.title[currentLanguage]}</span>
            </h2>
            <div class="section-content">
                <p data-en="${section.content.en}" data-zh="${section.content.zh}">${section.content[currentLanguage]}</p>
            </div>
        </div>
    `).join('');
    
    chapter.innerHTML = `
        <h1 class="chapter-title" data-en="${data.title.en}" data-zh="${data.title.zh}">${data.title[currentLanguage]}</h1>
        ${sectionsHTML}
    `;
}

// Render Experiences chapter
function renderExperiencesChapter() {
    const data = contentData.experiences;
    if (!data) return;
    
    const chapter = document.getElementById('experiences');
    const sectionsHTML = data.sections.map(section => {
        if (section.items) {
            // Education or Work Experience section
            const itemsHTML = section.items.map(item => `
                <div class="experience-item">
                    <h3 data-en="${item.title.en}" data-zh="${item.title.zh}">${item.title[currentLanguage]}</h3>
                    <p class="experience-meta" data-en="${item.meta.en}" data-zh="${item.meta.zh}">${item.meta[currentLanguage]}</p>
                    <p data-en="${item.description.en}" data-zh="${item.description.zh}">${item.description[currentLanguage]}</p>
                </div>
            `).join('');
            
            return `
                <div class="collapsible-section">
                    <h2 class="section-header">
                        <span class="toggle-icon">▼</span>
                        <span data-en="${section.title.en}" data-zh="${section.title.zh}">${section.title[currentLanguage]}</span>
                    </h2>
                    <div class="section-content">
                        ${itemsHTML}
                    </div>
                </div>
            `;
        } else if (section.projects) {
            // Projects section
            const projectsHTML = section.projects.map(project => `
                <div class="collapsible-subsection collapsed">
                    <h3 class="subsection-header">
                        <span class="toggle-icon">▶</span>
                        <span data-en="${project.title.en}" data-zh="${project.title.zh}">${project.title[currentLanguage]}</span>
                    </h3>
                    <div class="subsection-content">
                        <p class="project-meta" data-en="${project.meta.en}" data-zh="${project.meta.zh}">${project.meta[currentLanguage]}</p>
                        <p><strong data-en="Description:" data-zh="描述：">${currentLanguage === 'en' ? 'Description:' : '描述：'}</strong> <span data-en="${project.description.en}" data-zh="${project.description.zh}">${project.description[currentLanguage]}</span></p>
                        <p><strong data-en="My Contributions:" data-zh="我的贡献：">${currentLanguage === 'en' ? 'My Contributions:' : '我的贡献：'}</strong> <span data-en="${project.contributions.en}" data-zh="${project.contributions.zh}">${project.contributions[currentLanguage]}</span></p>
                        <p><strong data-en="Outcomes:" data-zh="成果：">${currentLanguage === 'en' ? 'Outcomes:' : '成果：'}</strong> <span data-en="${project.outcomes.en}" data-zh="${project.outcomes.zh}">${project.outcomes[currentLanguage]}</span></p>
                    </div>
                </div>
            `).join('');
            
            return `
                <div class="collapsible-section">
                    <h2 class="section-header">
                        <span class="toggle-icon">▼</span>
                        <span data-en="${section.title.en}" data-zh="${section.title.zh}">${section.title[currentLanguage]}</span>
                    </h2>
                    <div class="section-content">
                        ${projectsHTML}
                    </div>
                </div>
            `;
        }
    }).join('');
    
    chapter.innerHTML = `
        <h1 class="chapter-title" data-en="${data.title.en}" data-zh="${data.title.zh}">${data.title[currentLanguage]}</h1>
        ${sectionsHTML}
    `;
}

// Render Demos chapter
function renderDemosChapter() {
    const data = contentData.demos;
    if (!data) return;
    
    const chapter = document.getElementById('demos');
    const sectionsHTML = data.sections.map((section, index) => `
        <div class="collapsible-section demo-section collapsed" data-demo-index="${index}">
            <h2 class="section-header demo-section-title">
                <span class="toggle-icon">▼</span>
                <span data-en="${section.title.en}" data-zh="${section.title.zh}">${section.title[currentLanguage]}</span>
            </h2>
            <div class="section-content demo-content-wrapper">
                <div class="demo-explanation" data-en="${section.explanation.en}" data-zh="${section.explanation.zh}">${section.explanation[currentLanguage]}</div>
                <div class="demo-canvas-container" id="demo-container-${index}">
                    <canvas id="demo-canvas-${index}" class="demo-canvas" width="350" height="350"></canvas>
                </div>
            </div>
        </div>
    `).join('');
    
    chapter.innerHTML = `
        <h1 class="chapter-title" data-en="${data.title.en}" data-zh="${data.title.zh}">${data.title[currentLanguage]}</h1>
        ${sectionsHTML}
    `;
    
    // Initialize demo collapsible behavior after DOM is updated
    // Use setTimeout to ensure DOM is fully rendered
    setTimeout(() => {
        initializeDemoSections(data.sections);
    }, 0);
}

// Load demo scripts dynamically
function loadDemoScripts(sections) {
    // Clear all language change callbacks before reloading demos
    languageChangeCallbacks = [];
    
    sections.forEach((section, index) => {
        if (section.demoScript) {
            // Remove existing script if it exists
            const existingScript = document.querySelector(`script[src="${section.demoScript}"]`);
            if (existingScript) {
                existingScript.remove();
            }
            
            // Create and load new script
            const script = document.createElement('script');
            script.src = section.demoScript;
            script.async = true;
            document.body.appendChild(script);
        }
    });
}

// Load a single demo script by index
function loadSingleDemo(sections, index) {
    const section = sections[index];
    if (!section || !section.demoScript) return;
    
    // Check if already loaded
    const existingScript = document.querySelector(`script[src="${section.demoScript}"]`);
    if (existingScript) {
        // Already loaded, just re-run by removing and re-adding
        existingScript.remove();
    }
    
    // Create and load new script
    const script = document.createElement('script');
    script.src = section.demoScript;
    script.async = true;
    script.setAttribute('data-demo-index', index);
    document.body.appendChild(script);
}

// Initialize demo sections with accordion behavior
function initializeDemoSections(sections) {
    const demoSections = document.querySelectorAll('.demo-section.collapsible-section');
    
    if (demoSections.length === 0) {
        console.warn('No demo sections found to initialize');
        return;
    }
    
    demoSections.forEach((section) => {
        const header = section.querySelector('.section-header');
        
        if (!header) {
            console.warn('No header found for demo section');
            return;
        }
        
        header.addEventListener('click', (e) => {
            // Don't toggle if clicking on a link
            if (e.target.tagName === 'A') return;
            
            const isCurrentlyCollapsed = section.classList.contains('collapsed');
            const demoIndex = parseInt(section.getAttribute('data-demo-index'));
            
            // Accordion behavior: collapse all other demos
            demoSections.forEach(otherSection => {
                if (otherSection !== section) {
                    otherSection.classList.add('collapsed');
                }
            });
            
            // Toggle current section
            section.classList.toggle('collapsed');
            
            // Load demo only when expanding
            if (isCurrentlyCollapsed) {
                loadSingleDemo(sections, demoIndex);
            }
        });
    });
}

// Render Publications chapter
function renderPublicationsChapter() {
    const data = contentData.publications;
    if (!data) return;
    
    const chapter = document.getElementById('publications');
    const publicationsHTML = data.publications.map(pub => `
        <div class="collapsible-section publication-item">
            <h2 class="section-header">
                <span class="toggle-icon">▼</span>
                <span class="publication-title" data-en="${pub.title.en}" data-zh="${pub.title.zh}">${pub.title[currentLanguage]}</span>
            </h2>
            <div class="section-content">
                <p class="publication-meta">
                    <span data-en="${pub.meta.en}" data-zh="${pub.meta.zh}">${pub.meta[currentLanguage]}</span>
                    <br>
                    <a href="${pub.url}" target="_blank">${pub.url}</a>
                </p>
                <div class="publication-image">
                    <img src="${pub.image}" alt="Publication Image">
                </div>
                <div class="publication-abstract">
                    <h3 data-en="Abstract" data-zh="摘要">${currentLanguage === 'en' ? 'Abstract' : '摘要'}</h3>
                    <p data-en="${pub.abstract.en}" data-zh="${pub.abstract.zh}">${pub.abstract[currentLanguage]}</p>
                </div>
            </div>
        </div>
    `).join('');
    
    chapter.innerHTML = `
        <h1 class="chapter-title" data-en="${data.title.en}" data-zh="${data.title.zh}">${data.title[currentLanguage]}</h1>
        ${publicationsHTML}
    `;
}

// Render Contact chapter
function renderContactChapter() {
    const data = contentData.contact;
    if (!data) return;
    
    const chapter = document.getElementById('contact');
    const profilesHTML = data.profiles.map(profile => `
        <li><a href="${profile.url}" target="_blank">${profile.name}</a></li>
    `).join('');
    
    chapter.innerHTML = `
        <h1 class="chapter-title" data-en="${data.title.en}" data-zh="${data.title.zh}">${data.title[currentLanguage]}</h1>
        <div class="contact-info">
            <div class="contact-item">
                <h3 data-en="Email" data-zh="邮箱">${currentLanguage === 'en' ? 'Email' : '邮箱'}</h3>
                <p><a href="mailto:${data['email 1']}">${data['email 1']}</a></p>
                <p><a href="mailto:${data['email 2']}">${data['email 2']}</a></p>
                <p><a href="mailto:${data['email 3']}">${data['email 3']}</a></p>
            </div>
            <div class="contact-item">
                <h3 data-en="WeChat" data-zh="微信">${currentLanguage === 'en' ? 'WeChat' : '微信'}</h3>
                <p>${data.wechat}</p>
            </div>
            <div class="contact-item">
                <h3 data-en="Professional Profiles" data-zh="专业资料">${currentLanguage === 'en' ? 'Professional Profiles' : '专业资料'}</h3>
                <ul class="profile-links">${profilesHTML}</ul>
            </div>
        </div>
    `;
}

// Navigation functionality
function initializeNavigation() {
    const navBlocks = document.querySelectorAll('.nav-block');
    
    navBlocks.forEach(block => {
        block.addEventListener('click', (e) => {
            e.preventDefault();
            const chapterId = block.getAttribute('data-chapter');
            showChapter(chapterId);
            
            // Update active state on nav blocks
            navBlocks.forEach(b => b.classList.remove('active-nav'));
            block.classList.add('active-nav');
        });
    });
}

function showChapter(chapterId) {
    // Hide all chapters
    const chapters = document.querySelectorAll('.chapter');
    chapters.forEach(chapter => {
        chapter.classList.remove('active');
    });
    
    // Show selected chapter
    const targetChapter = document.getElementById(chapterId);
    if (targetChapter) {
        targetChapter.classList.add('active');
        
        // Scroll to top of main content
        document.querySelector('.main-content').scrollTop = 0;
    }
}

// Language switching functionality
function initializeLanguageSwitch() {
    const langButtons = document.querySelectorAll('.lang-btn');
    
    langButtons.forEach(button => {
        button.addEventListener('click', () => {
            const lang = button.getAttribute('data-lang');
            
            if (lang !== currentLanguage) {
                currentLanguage = lang;
                
                // Update button active state
                langButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                
                // Update all language-specific text
                updateAllLanguageText();
                
                // Re-render all content with new language
                renderProfile();
                renderAllChapters();
                
                // Note: We don't call notifyLanguageChange here because demos
                // are being re-rendered and will pick up the new language on initialization
            }
        });
    });
}

// Register a callback for language changes (used by demos)
function onLanguageChange(callback) {
    languageChangeCallbacks.push(callback);
}

// Notify all callbacks of language change
function notifyLanguageChange(newLang) {
    languageChangeCallbacks.forEach(callback => {
        try {
            callback(newLang);
        } catch (e) {
            console.error('Error in language change callback:', e);
        }
    });
}

// Get current language (used by demos)
function getCurrentLanguage() {
    return currentLanguage;
}

// Update language button state based on current language
function updateLanguageButtonState() {
    const langButtons = document.querySelectorAll('.lang-btn');
    langButtons.forEach(btn => {
        if (btn.getAttribute('data-lang') === currentLanguage) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
}

// Update all elements with language-specific text
function updateAllLanguageText() {
    const elements = document.querySelectorAll('[data-en][data-zh]');
    elements.forEach(element => {
        const enText = element.getAttribute('data-en');
        const zhText = element.getAttribute('data-zh');
        if (enText && zhText) {
            element.textContent = currentLanguage === 'en' ? enText : zhText;
        }
    });
}

// Collapsible sections functionality
function initializeCollapsibleSections() {
    // Initialize main sections (exclude demo sections - they have their own handler)
    const sectionHeaders = document.querySelectorAll('.collapsible-section:not(.demo-section) .section-header');
    
    sectionHeaders.forEach(header => {
        header.addEventListener('click', (e) => {
            // Don't toggle if clicking on a link inside the header
            if (e.target.tagName === 'A') return;
            
            const section = header.parentElement;
            section.classList.toggle('collapsed');
        });
    });
    
    // Initialize subsections (for projects)
    const subsectionHeaders = document.querySelectorAll('.collapsible-subsection .subsection-header');
    
    subsectionHeaders.forEach(header => {
        header.addEventListener('click', () => {
            const subsection = header.parentElement;
            subsection.classList.toggle('collapsed');
        });
    });
    
    // Add hover animations
    addHoverAnimations();
}

// Add hover animations to elements
function addHoverAnimations() {
    // Add animation when hovering over skill items
    const skillItems = document.querySelectorAll('.skill-item');
    skillItems.forEach(item => {
        item.addEventListener('mouseenter', function() {
            this.style.transform = 'translateX(10px)';
            this.style.transition = 'transform 0.3s ease';
        });
        
        item.addEventListener('mouseleave', function() {
            this.style.transform = 'translateX(0)';
        });
    });
    
    // Add animation when hovering over experience items
    const experienceItems = document.querySelectorAll('.experience-item');
    experienceItems.forEach(item => {
        item.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.02)';
            this.style.transition = 'transform 0.3s ease';
        });
        
        item.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1)';
        });
    });
}

// Add keyboard navigation support
document.addEventListener('keydown', (e) => {
    // ESC key to collapse all sections
    if (e.key === 'Escape') {
        const sections = document.querySelectorAll('.collapsible-section');
        sections.forEach(section => {
            section.classList.add('collapsed');
        });
        
        const subsections = document.querySelectorAll('.collapsible-subsection');
        subsections.forEach(subsection => {
            subsection.classList.add('collapsed');
        });
    }
});

// Utility function to get current chapter
function getCurrentChapter() {
    const activeChapter = document.querySelector('.chapter.active');
    return activeChapter ? activeChapter.id : null;
}

// Export functions for potential external use
window.personalWebsite = {
    showChapter,
    getCurrentChapter,
    contentData
};
