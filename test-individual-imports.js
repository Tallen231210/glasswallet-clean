// Test individual component imports to find the problematic one
const fs = require('fs');
const path = require('path');

const componentsToTest = [
  'GlassCard',
  'NeonButton', 
  'StatCard',
  'Badge',
  'ToastProvider',
  'Progress',
  'CreditBalanceWidget',
  'CreditProcessingCenter',
  'ActivityFeed',
  'LineChart',
  'DonutChart',
  'InteractiveCard',
  'FloatingActionButton',
  'AnimatedCounter'
];

console.log('Testing imports from the main index file...\n');

// Read the index file to see the actual exports
const indexPath = path.join(__dirname, 'src/components/ui/index.ts');
const indexContent = fs.readFileSync(indexPath, 'utf8');

console.log('Index file exports:');
const exportLines = indexContent.split('\n').filter(line => line.startsWith('export'));
exportLines.forEach((line, i) => console.log(`${i + 1}: ${line}`));

console.log('\nLooking for potential issues:');

// Check for missing component files
componentsToTest.forEach(componentName => {
  const componentPath = path.join(__dirname, 'src/components/ui', `${componentName}.tsx`);
  const exists = fs.existsSync(componentPath);
  console.log(`${componentName}.tsx: ${exists ? '✓ exists' : '✗ missing'}`);
  
  if (exists) {
    const content = fs.readFileSync(componentPath, 'utf8');
    const hasExport = content.includes(`export const ${componentName}`) || content.includes(`export default ${componentName}`);
    console.log(`  - Has export: ${hasExport ? '✓' : '✗'}`);
    
    // Check if it's exported in index.ts
    const inIndex = indexContent.includes(`{ ${componentName}`) || indexContent.includes(`${componentName}`);
    console.log(`  - In index.ts: ${inIndex ? '✓' : '✗'}`);
  }
  console.log('');
});