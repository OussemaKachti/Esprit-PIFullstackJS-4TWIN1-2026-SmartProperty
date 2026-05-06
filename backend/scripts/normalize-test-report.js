const fs = require('fs');
const path = require('path');

const projectRoot = process.cwd();
const inputPaths = [
  path.join(projectRoot, 'coverage', 'test-report.xml'),
  path.join(projectRoot, 'test-report.xml')
];

const inputPath = inputPaths.find((candidate) => fs.existsSync(candidate));

if (!inputPath) {
  console.error('No test report found to normalize. Looked for:', inputPaths.join(', '));
  process.exit(0);
}

const xml = fs.readFileSync(inputPath, 'utf8');
const normalized = xml.replace(/<file path="([^"]+)"/g, (match, rawPath) => {
  const forwardSlashPath = rawPath.replace(/\\/g, '/');
  const relativePath = path.relative(projectRoot, forwardSlashPath).replace(/\\/g, '/');
  return `<file path="${relativePath}"`;
});

const outputDir = path.join(projectRoot, 'coverage');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const outputPath = path.join(outputDir, 'test-report.xml');
fs.writeFileSync(outputPath, normalized, 'utf8');
console.log('Normalized test report written to', outputPath);