const fs = require('fs');
let css = fs.readFileSync('src/index.css', 'utf8');
css = css.replace(/:\s+!/g, ':!');
css = css.replace(/static\s+!/g, 'static !'); // fix 'static !' which is also broken? No wait, 'static !' -> static!
css = css.replace(/static\s+!/g, 'static!');
fs.writeFileSync('src/index.css', css);
