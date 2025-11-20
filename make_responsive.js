const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

// Directory containing HTML files
const htmlDir = path.join(__dirname, 'KODIGOA');
const outputDir = path.join(__dirname, 'KODIGOA', 'responsive');

// Ensure output directory exists
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

// Process each HTML file
const processFile = async (file) => {
    const filePath = path.join(htmlDir, file);
    const outputPath = path.join(outputDir, file);
    
    // Skip non-HTML files and header/footer
    if (!file.endsWith('.html') || file === 'header.html' || file === 'footer.html') {
        return;
    }

    try {
        // Read the file
        let content = fs.readFileSync(filePath, 'utf8');
        
        // Parse HTML
        const dom = new JSDOM(content);
        const doc = dom.window.document;
        
        // 1. Ensure viewport meta tag exists
        let viewportMeta = doc.querySelector('meta[name="viewport"]');
        if (!viewportMeta) {
            viewportMeta = doc.createElement('meta');
            viewportMeta.setAttribute('name', 'viewport');
            viewportMeta.setAttribute('content', 'width=device-width, initial-scale=1.0');
            doc.head.appendChild(viewportMeta);
        }
        
        // 2. Add Bootstrap CSS (if not already present)
        const hasBootstrapCSS = Array.from(doc.querySelectorAll('link[rel="stylesheet"]'))
            .some(link => link.href.includes('bootstrap'));
            
        if (!hasBootstrapCSS) {
            const bootstrapCSS = doc.createElement('link');
            bootstrapCSS.rel = 'stylesheet';
            bootstrapCSS.href = 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css';
            bootstrapCSS.integrity = 'sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH';
            bootstrapCSS.crossOrigin = 'anonymous';
            
            // Insert before any other stylesheets
            const firstStyle = doc.querySelector('link[rel="stylesheet"], style');
            if (firstStyle) {
                firstStyle.before(bootstrapCSS);
            } else {
                doc.head.appendChild(bootstrapCSS);
            }
        }
        
        // 3. Add Bootstrap JS (if not already present)
        const hasBootstrapJS = Array.from(doc.querySelectorAll('script[src]'))
            .some(script => script.src.includes('bootstrap'));
            
        if (!hasBootstrapJS) {
            const bootstrapJS = doc.createElement('script');
            bootstrapJS.src = 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js';
            bootstrapJS.integrity = 'sha384-YvpcrYf0tY3lHB60NNkmXc5s9fDVZLESaAA55NDzOxhy9GkcIdslK1eN7N6jIeHz';
            bootstrapJS.crossOrigin = 'anonymous';
            doc.body.appendChild(bootstrapJS);
        }
        
        // 4. Make sure the main content is in a container
        const body = doc.body;
        const mainContent = body.querySelector('main, .container, .wrap, section, div[role="main"]') || body;
        
        if (!mainContent.classList.contains('container') && !mainContent.classList.contains('container-fluid')) {
            mainContent.classList.add('container', 'my-4');
        }
        
        // 5. Make images responsive
        doc.querySelectorAll('img:not([class*="img-"])').forEach(img => {
            img.classList.add('img-fluid');
        });
        
        // 6. Add responsive table class to tables
        doc.querySelectorAll('table').forEach(table => {
            const wrapper = doc.createElement('div');
            wrapper.className = 'table-responsive';
            table.parentNode.insertBefore(wrapper, table);
            wrapper.appendChild(table);
        });
        
        // 7. Ensure forms are responsive
        doc.querySelectorAll('form').forEach(form => {
            if (!form.classList.contains('needs-validation')) {
                form.classList.add('needs-validation');
                form.setAttribute('novalidate', '');
            }
        });
        
        // 8. Add basic responsive navigation if needed
        const header = doc.querySelector('header');
        if (header && !header.querySelector('.navbar')) {
            header.classList.add('bg-light', 'p-3', 'mb-4');
        }
        
        // 9. Make sure buttons have proper spacing on mobile
        doc.querySelectorAll('.btn, button:not(.btn)').forEach(btn => {
            if (!btn.classList.contains('btn') && btn.tagName === 'BUTTON') {
                btn.classList.add('btn', 'btn-primary');
            }
            btn.classList.add('mb-2', 'me-2');
        });
        
        // Save the modified HTML
        const updatedHTML = `<!DOCTYPE html>\n${doc.documentElement.outerHTML}`;
        
        fs.writeFileSync(outputPath, updatedHTML);
        console.log(`Processed: ${file}`);
        
    } catch (error) {
        console.error(`Error processing ${file}:`, error);
    }
};

// Process all HTML files in the directory
const htmlFiles = fs.readdirSync(htmlDir).filter(file => file.endsWith('.html'));

// Process files sequentially to avoid too many open files
const processFiles = async () => {
    for (const file of htmlFiles) {
        await processFile(file);
    }
    console.log('All files processed. Check the "responsive" directory for the results.');};

processFiles();
