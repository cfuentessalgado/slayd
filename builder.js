#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

// Simple YAML presentation compiler
// Usage: slayd <input.yaml> [output.html]

function escapeHtml(text) {
    if (!text) return '';
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function renderMarkdown(text) {
    if (!text) return '';
    
    // Simple markdown-like rendering
    return text
        // Code blocks with language
        .replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
            return `<pre><code>${escapeHtml(code.trim())}</code></pre>`;
        })
        // Inline code
        .replace(/`([^`]+)`/g, '<code>$1</code>')
        // Bold
        .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
        // Line breaks
        .replace(/\n/g, '<br>');
}

function renderSlide(slide, index) {
    const activeClass = index === 0 ? ' active' : '';
    let content = '';
    
    // Determine slide type and render accordingly
    if (slide.type === 'hero') {
        content = renderHeroSlide(slide);
    } else if (slide.type === 'image') {
        content = renderImageSlide(slide);
    } else if (slide.type === 'two-column') {
        content = renderTwoColumnSlide(slide);
    } else if (slide.type === 'grid') {
        content = renderGridSlide(slide);
    } else if (slide.type === 'code') {
        content = renderCodeSlide(slide);
    } else if (slide.type === 'timeline') {
        content = renderTimelineSlide(slide);
    } else if (slide.type === 'table') {
        content = renderTableSlide(slide);
    } else if (slide.type === 'flow') {
        content = renderFlowSlide(slide);
    } else {
        content = renderDefaultSlide(slide);
    }
    
    return `
        <div class="slide${activeClass}">
            ${content}
        </div>
    `;
}

function renderHeroSlide(slide) {
    return `
        <div class="content" style="justify-content: center; text-align: center;">
            <div class="hero">
                ${slide.logo ? `<div class="logo">${slide.logo}</div>` : ''}
                <h1 style="font-size: ${slide.titleSize || '5rem'};">${slide.title}</h1>
                ${slide.subtitle ? `<div class="subtitle">${renderMarkdown(slide.subtitle)}</div>` : ''}
            </div>
        </div>
    `;
}

function renderImageSlide(slide) {
    return `
        <div class="image-slide">
            ${slide.title ? `<h1>${slide.title}</h1>` : ''}
            <img src="${slide.image}" alt="${slide.alt || slide.title || 'Image'}">
            ${slide.caption ? `<p style="margin-top: 1rem; color: #6b7280;">${renderMarkdown(slide.caption)}</p>` : ''}
        </div>
    `;
}

function renderTwoColumnSlide(slide) {
    // Check if content needs to be split into columns
    if (slide.content && Array.isArray(slide.content)) {
        const twoColContent = slide.content.find(item => item.type === 'two-column-content');
        if (twoColContent) {
            return `
                ${slide.title ? `<h2>${slide.title}</h2>` : ''}
                ${slide.subtitle ? `<div class="subtitle">${renderMarkdown(slide.subtitle)}</div>` : ''}
                <div class="content">
                    ${slide.content.filter(item => item.type !== 'two-column-content').map(item => renderContentItem(item)).join('\n')}
                    <div class="two-column">
                        ${renderColumn(twoColContent.left)}
                        ${renderColumn(twoColContent.right)}
                    </div>
                </div>
            `;
        }
    }
    
    return `
        ${slide.title ? `<h2>${slide.title}</h2>` : ''}
        ${slide.subtitle ? `<div class="subtitle">${renderMarkdown(slide.subtitle)}</div>` : ''}
        <div class="content">
            <div class="two-column">
                ${renderColumn(slide.left)}
                ${renderColumn(slide.right)}
            </div>
            ${slide.content ? renderContent(slide.content) : ''}
        </div>
    `;
}

function renderContentItem(item) {
    if (typeof item === 'string') {
        return `<p>${renderMarkdown(item)}</p>`;
    }
    if (item.type === 'list') {
        const listStyle = item.style ? `style="color: ${getColorFromStyle(item.style)};"` : '';
        return `<ul ${listStyle}>${item.items.map(i => `<li>${renderMarkdown(i)}</li>`).join('')}</ul>`;
    }
    if (item.type === 'card') {
        return renderCard(item);
    }
    if (item.type === 'code') {
        return `<pre><code>${escapeHtml(item.code)}</code></pre>`;
    }
    if (item.type === 'quote') {
        return `<div class="quote">${renderMarkdown(item.text)}</div>`;
    }
    if (item.type === 'callout') {
        return `<div class="card" style="text-align: center; ${item.style || ''}">
            ${item.content ? renderContent(item.content) : ''}
        </div>`;
    }
    if (item.type === 'flow') {
        return renderFlow(item);
    }
    return '';
}

function renderGridSlide(slide) {
    const columns = slide.columns || 3;
    return `
        ${slide.title ? `<h2>${slide.title}</h2>` : ''}
        ${slide.subtitle ? `<div class="subtitle">${renderMarkdown(slide.subtitle)}</div>` : ''}
        <div class="content">
            <div class="grid-${columns}">
                ${slide.items.map(item => renderGridItem(item)).join('\n')}
            </div>
        </div>
    `;
}

function renderCodeSlide(slide) {
    return `
        ${slide.title ? `<h2>${slide.title}</h2>` : ''}
        ${slide.subtitle ? `<div class="subtitle">${renderMarkdown(slide.subtitle)}</div>` : ''}
        <div class="content">
            ${slide.description ? `<p style="color: #6b7280; margin-bottom: 1rem;">${renderMarkdown(slide.description)}</p>` : ''}
            <pre><code>${escapeHtml(slide.code)}</code></pre>
            ${slide.notes ? `<div class="card" style="margin-top: 1rem;"><p style="color: #6b7280;">${renderMarkdown(slide.notes)}</p></div>` : ''}
        </div>
    `;
}

function renderTimelineSlide(slide) {
    return `
        ${slide.title ? `<h2>${slide.title}</h2>` : ''}
        ${slide.subtitle ? `<div class="subtitle">${renderMarkdown(slide.subtitle)}</div>` : ''}
        <div class="content">
            ${slide.items.map(item => `
                <div class="timeline-item">
                    <strong>${item.period}</strong> - ${item.title}
                    ${item.description ? `<p style="color: #6b7280; margin-top: 0.5rem;">${renderMarkdown(item.description)}</p>` : ''}
                    ${item.items ? `<ul>${item.items.map(i => `<li>${renderMarkdown(i)}</li>`).join('')}</ul>` : ''}
                </div>
            `).join('\n')}
        </div>
    `;
}

function renderTableSlide(slide) {
    return `
        ${slide.title ? `<h2>${slide.title}</h2>` : ''}
        ${slide.subtitle ? `<div class="subtitle">${renderMarkdown(slide.subtitle)}</div>` : ''}
        <div class="content">
            <table>
                <thead>
                    <tr>
                        ${slide.headers.map(h => `<th>${h}</th>`).join('')}
                    </tr>
                </thead>
                <tbody>
                    ${slide.rows.map(row => `
                        <tr>
                            ${row.map(cell => `<td>${renderMarkdown(String(cell))}</td>`).join('')}
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

function renderFlowSlide(slide) {
    return `
        ${slide.title ? `<h2>${slide.title}</h2>` : ''}
        ${slide.subtitle ? `<div class="subtitle">${renderMarkdown(slide.subtitle)}</div>` : ''}
        <div class="content">
            ${slide.description ? `<p style="color: #6b7280; margin-bottom: 1.5rem;">${renderMarkdown(slide.description)}</p>` : ''}
            ${slide.flows ? slide.flows.map(flow => renderFlow(flow)).join('') : ''}
            ${slide.content ? renderContent(slide.content) : ''}
        </div>
    `;
}

function renderFlow(flow) {
    if (!flow.items) return '';
    
    return `
        <div class="flow" ${flow.style ? `style="${flow.style}"` : ''}>
            ${flow.items.map(item => {
                if (item.type === 'arrow') {
                    return `<div class="flow-arrow">${item.text || '→'}</div>`;
                } else {
                    return `
                        <div class="flow-item">
                            ${item.title ? `<strong>${item.title}</strong>` : ''}
                            ${item.subtitle ? `<br><small style="color: #6b7280;">${item.subtitle}</small>` : ''}
                            ${item.content ? `<br>${renderMarkdown(item.content)}` : ''}
                        </div>
                    `;
                }
            }).join('\n')}
        </div>
    `;
}

function renderDefaultSlide(slide) {
    return `
        ${slide.title ? `<h2>${slide.title}</h2>` : ''}
        ${slide.subtitle ? `<div class="subtitle">${renderMarkdown(slide.subtitle)}</div>` : ''}
        <div class="content">
            ${slide.content ? renderContent(slide.content) : ''}
        </div>
    `;
}

function renderColumn(column) {
    if (!column) return '<div></div>';
    
    return `
        <div>
            ${column.title ? `<h3>${column.title}</h3>` : ''}
            ${column.cards ? column.cards.map(card => renderCard(card)).join('\n') : ''}
            ${column.content ? renderContent(column.content) : ''}
        </div>
    `;
}

function renderCard(card) {
    return `
        <div class="card" ${card.style ? `style="${card.style}"` : ''}>
            ${card.title ? `<h3>${card.title}</h3>` : ''}
            ${card.content ? renderContent(card.content) : ''}
        </div>
    `;
}

function renderGridItem(item) {
    const style = item.type === 'feature' ? 'feature-box' : 
                  item.type === 'metric' ? 'metric-box' : 'card';
    
    return `
        <div class="${style}">
            ${item.icon ? `<div class="feature-icon">${item.icon}</div>` : ''}
            ${item.stat ? `<div class="stat">${item.stat}</div>` : ''}
            ${item.title ? `<h3>${item.title}</h3>` : ''}
            ${item.label ? `<div class="stat-label">${item.label}</div>` : ''}
            ${item.content ? renderContent(item.content) : ''}
        </div>
    `;
}

function renderContent(content) {
    if (typeof content === 'string') {
        return `<p>${renderMarkdown(content)}</p>`;
    }
    
    if (Array.isArray(content)) {
        return content.map(item => renderContentItem(item)).join('\n');
    }
    
    return '';
}

function getColorFromStyle(style) {
    const colorMap = {
        'red': '#f87171',
        'green': '#4ade80',
        'blue': '#60a5fa',
        'yellow': '#fbbf24',
        'gray': '#6b7280'
    };
    return colorMap[style] || style;
}

function buildPresentation(yamlFile, outputFile) {
    try {
        // Read and parse YAML
        const yamlContent = fs.readFileSync(yamlFile, 'utf8');
        const presentation = yaml.load(yamlContent);
        
        // Render all slides
        const slidesHtml = presentation.slides.map((slide, index) => renderSlide(slide, index)).join('\n');
        
        // Build complete HTML
        const html = `<!DOCTYPE html>
<html lang="${presentation.lang || 'es'}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${presentation.title}</title>
    <link rel="stylesheet" href="presentation.css">
    ${presentation.theme ? `<link rel="stylesheet" href="${presentation.theme}.css">` : ''}
</head>
<body>
    <div class="progress-bar" id="progressBar"></div>
    
    <div class="slide-container">
        ${slidesHtml}
    </div>

    <div class="slide-number">
        <span id="current">1</span> / <span id="total">${presentation.slides.length}</span>
    </div>

    <div class="navigation">
        <button id="prev" onclick="changeSlide(-1)">← Anterior</button>
        <button id="next" onclick="changeSlide(1)">Siguiente →</button>
    </div>

    <script>
        let currentSlide = 0;
        const slides = document.querySelectorAll('.slide');
        const totalSlides = slides.length;
        const prevBtn = document.getElementById('prev');
        const nextBtn = document.getElementById('next');
        const currentSpan = document.getElementById('current');
        const totalSpan = document.getElementById('total');
        const progressBar = document.getElementById('progressBar');

        totalSpan.textContent = totalSlides;

        function updateProgress() {
            const progress = ((currentSlide + 1) / totalSlides) * 100;
            progressBar.style.width = progress + '%';
        }

        function showSlide(n) {
            slides[currentSlide].classList.remove('active');
            currentSlide = (n + totalSlides) % totalSlides;
            slides[currentSlide].classList.add('active');
            currentSpan.textContent = currentSlide + 1;
            
            prevBtn.disabled = currentSlide === 0;
            nextBtn.disabled = currentSlide === totalSlides - 1;
            
            updateProgress();
        }

        function changeSlide(direction) {
            showSlide(currentSlide + direction);
        }

        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft' && currentSlide > 0) {
                changeSlide(-1);
            } else if (e.key === 'ArrowRight' && currentSlide < totalSlides - 1) {
                changeSlide(1);
            }
        });

        showSlide(0);
    </script>
</body>
</html>`;
        
        // Write output file
        fs.writeFileSync(outputFile, html);
        console.log(`✅ Presentation built successfully: ${outputFile}`);
        console.log(`   ${presentation.slides.length} slides generated`);
        
    } catch (error) {
        console.error('❌ Error building presentation:', error.message);
        process.exit(1);
    }
}

function initPresentation(filename = 'presentation.yaml') {
    const templateContent = `title: "My Presentation"
theme: light  # or leave empty for dark theme

slides:
  # Title slide
  - type: hero
    title: "Welcome"
    subtitle: "My first presentation with Slayd"
    logo: "🚀"

  # Content slide
  - type: default
    title: "About This Presentation"
    content:
      - "This is a starter template"
      - "Edit this YAML file to create your slides"
      - type: list
        items:
          - "Multiple slide types available"
          - "Simple markdown formatting"
          - "Easy to customize"

  # Two-column slide
  - type: two-column
    title: "Features"
    left:
      title: "Easy"
      content:
        - "Write in YAML"
        - "No HTML needed"
    right:
      title: "Powerful"
      content:
        - "Multiple layouts"
        - "Custom themes"

  # Closing slide
  - type: hero
    title: "Thank You!"
    subtitle: "Start editing to make it yours"
    logo: "✨"
`;

    try {
        if (fs.existsSync(filename)) {
            console.error(`❌ File already exists: ${filename}`);
            console.log('   Use a different filename or delete the existing file first.');
            process.exit(1);
        }
        
        fs.writeFileSync(filename, templateContent);
        console.log(`✅ Created ${filename}`);
        console.log('');
        console.log('Next steps:');
        console.log(`  1. Edit ${filename} with your content`);
        console.log(`  2. Run: slayd ${filename}`);
        console.log(`  3. Open the generated HTML in your browser`);
        
    } catch (error) {
        console.error('❌ Error creating file:', error.message);
        process.exit(1);
    }
}

function buildAll() {
    try {
        const files = fs.readdirSync('.')
            .filter(f => /\.ya?ml$/i.test(f))
            .filter(f => fs.statSync(f).isFile());
        
        if (files.length === 0) {
            console.log('No YAML files found in current directory');
            process.exit(0);
        }
        
        console.log(`Found ${files.length} YAML file(s):`);
        console.log('');
        
        let successCount = 0;
        let errorCount = 0;
        
        files.forEach(file => {
            const outputFile = file.replace(/\.ya?ml$/i, '.html');
            try {
                buildPresentation(file, outputFile);
                successCount++;
            } catch (error) {
                console.error(`❌ Error building ${file}:`, error.message);
                errorCount++;
            }
            console.log('');
        });
        
        console.log('─'.repeat(50));
        console.log(`✅ Successfully built: ${successCount}`);
        if (errorCount > 0) {
            console.log(`❌ Failed: ${errorCount}`);
        }
        
    } catch (error) {
        console.error('❌ Error reading directory:', error.message);
        process.exit(1);
    }
}

// CLI
if (require.main === module) {
    const args = process.argv.slice(2);
    const command = args[0];
    
    // Handle init command
    if (command === 'init' || command === 'new') {
        const filename = args[1] || 'presentation.yaml';
        initPresentation(filename);
        process.exit(0);
    }
    
    // Handle build command
    if (command === 'build') {
        const inputFile = args[1];
        
        if (!inputFile) {
            // Build all YAML files
            buildAll();
            process.exit(0);
        }
        
        // Build specific file
        const outputFile = args[2] || inputFile.replace(/\.ya?ml$/, '.html');
        
        if (!fs.existsSync(inputFile)) {
            console.error(`❌ Input file not found: ${inputFile}`);
            process.exit(1);
        }
        
        buildPresentation(inputFile, outputFile);
        process.exit(0);
    }
    
    // Handle help
    if (args.length === 0 || command === '--help' || command === '-h') {
        console.log('Usage: slayd <command> [options]');
        console.log('');
        console.log('Commands:');
        console.log('  init [filename]           Create a new presentation template');
        console.log('  build [input.yaml]        Build presentation(s)');
        console.log('  <input.yaml> [output]     Build a specific presentation (shorthand)');
        console.log('');
        console.log('Examples:');
        console.log('  slayd init                       # Creates presentation.yaml');
        console.log('  slayd init my-talk.yaml          # Creates my-talk.yaml');
        console.log('  slayd build                      # Builds all .yaml files in cwd');
        console.log('  slayd build my-talk.yaml         # Builds my-talk.yaml');
        console.log('  slayd build input.yaml out.html  # Builds to out.html');
        console.log('  slayd my-talk.yaml               # Shorthand for build');
        process.exit(args.length === 0 ? 1 : 0);
    }
    
    // Handle shorthand: slayd <file.yaml> [output.html]
    const inputFile = args[0];
    const outputFile = args[1] || inputFile.replace(/\.ya?ml$/, '.html');
    
    if (!fs.existsSync(inputFile)) {
        console.error(`❌ Input file not found: ${inputFile}`);
        console.log('');
        console.log('Run "slayd --help" for usage information');
        process.exit(1);
    }
    
    buildPresentation(inputFile, outputFile);
}

module.exports = { buildPresentation };
