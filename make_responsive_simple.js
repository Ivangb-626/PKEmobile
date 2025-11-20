const fs = require('fs');
const path = require('path');

// Directory containing HTML files
const htmlDir = path.join(__dirname, 'KODIGOA');

// Bootstrap CDN links
const bootstrapCSS = `
    <!-- Bootstrap CSS -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
`;

const bootstrapJS = `
    <!-- Bootstrap JS Bundle with Popper -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
`;

// Process each HTML file
fs.readdir(htmlDir, (err, files) => {
    if (err) {
        console.error('Error reading directory:', err);
        return;
    }

    files.forEach(file => {
        if (!file.endsWith('.html') || file === 'header.html' || file === 'footer.html') {
            return; // Skip non-HTML files and header/footer
        }

        const filePath = path.join(htmlDir, file);
        
        fs.readFile(filePath, 'utf8', (err, data) => {
            if (err) {
                console.error(`Error reading file ${file}:`, err);
                return;
            }

            let content = data;
            
            // 1. Add viewport meta tag if not exists
            if (!content.includes('name="viewport"')) {
                content = content.replace(
                    '<head>',
                    '<head>\n    <meta name="viewport" content="width=device-width, initial-scale=1.0">'
                );
            }
            
            // 2. Add Bootstrap CSS if not exists
            if (!content.includes('bootstrap.min.css')) {
                content = content.replace('</head>', `${bootstrapCSS}</head>`);
            }
            
            // 3. Add Bootstrap JS before closing body if not exists
            if (!content.includes('bootstrap.bundle.min.js')) {
                content = content.replace('</body>', `${bootstrapJS}</body>`);
            }
            
            // 4. Add container class to main content if not exists
            if (!content.includes('class="container') && !content.includes('class="container-fluid')) {
                // Look for common main content elements
                const mainElements = ['<main', '<div role="main"', '<div id="content"', '<div id="main"', '<div class="content"'];
                
                for (const el of mainElements) {
                    if (content.includes(el)) {
                        content = content.replace(
                            new RegExp(`(${el}[^>]*)`),
                            (match, p1) => `${p1} class="container my-4"`
                        );
                        break;
                    }
                }
                
                // If no main element found, wrap content in a container
                if (!content.includes('class="container')) {
                    const bodyContent = content.split('<body>')[1]?.split('</body>')[0] || '';
                    if (bodyContent) {
                        content = content.replace(
                            bodyContent,
                            `\n    <div class="container my-4">\n        ${bodyContent.trim()}\n    </div>\n`
                        );
                    }
                }
            }
            
            // 5. Make images responsive
            content = content.replace(/<img([^>]*)>/g, (match, p1) => {
                if (!p1.includes('class=')) {
                    return `<img class="img-fluid"${p1}>`;
                } else if (!p1.includes('img-fluid')) {
                    return match.replace('class="', 'class="img-fluid ')
                              .replace("class='", "class='img-fluid ");
                }
                return match;
            });
            
            // 6. Make tables responsive
            content = content.replace(/<table([^>]*)>/g, (match, p1) => {
                const tableContent = match + match.replace(/<\/table>/, '').split('>').slice(1).join('>');
                return `\n    <div class="table-responsive">\n        ${tableContent}\n    </div>\n`;
            });
            
            // 7. Add btn class to buttons
            content = content.replace(/<button([^>]*)>/g, (match, p1) => {
                if (!p1.includes('class=')) {
                    return `<button class="btn btn-primary"${p1}>`;
                } else if (!p1.includes('btn-')) {
                    return match.replace('class="', 'class="btn btn-primary ')
                               .replace("class='", "class='btn btn-primary ");
                }
                return match;
            });
            
            // Save the modified file
            fs.writeFile(filePath, content, 'utf8', err => {
                if (err) {
                    console.error(`Error writing file ${file}:`, err);
                } else {
                    console.log(`Updated: ${file}`);
                }
            });
        });
    });
});

console.log('Starting to make files responsive...');
