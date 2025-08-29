// Component Import Test
// This file tests all UI component imports to identify which ones are failing

console.log('Testing UI component imports...\n');

const components = [
  'GlassCard',
  'NeonButton',
  'Badge',
  'StatCard',
  'Alert',
  'ToastProvider',
  'useToast',
  'Loading',
  'EnhancedLoading',
  'Skeleton',
  'PageLoading',
  'InteractiveCard',
  'FloatingActionButton',
  'AnimatedCounter',
  'LineChart',
  'DonutChart',
  'BarChart',
  'HeatMap',
  'MetricDisplay',
  'Spinner'
];

try {
  const uiComponents = require('./src/components/ui/index.ts');
  console.log('✓ Main index.ts file imported successfully');
  
  components.forEach(componentName => {
    try {
      const component = uiComponents[componentName];
      if (component === undefined) {
        console.log(`✗ ${componentName}: undefined`);
      } else if (component === null) {
        console.log(`✗ ${componentName}: null`);
      } else {
        console.log(`✓ ${componentName}: ${typeof component}`);
      }
    } catch (error) {
      console.log(`✗ ${componentName}: Error - ${error.message}`);
    }
  });

} catch (error) {
  console.log('✗ Failed to import main index.ts:', error.message);
  
  // Try importing individual components
  console.log('\nTrying individual component imports...');
  
  const individualTests = [
    './src/components/ui/GlassCard.tsx',
    './src/components/ui/NeonButton.tsx',
    './src/components/ui/Badge.tsx',
    './src/components/ui/StatCard.tsx',
    './src/components/ui/Alert.tsx',
    './src/components/ui/Toast.tsx',
    './src/components/ui/Spinner.tsx',
    './src/components/ui/EnhancedLoading.tsx',
    './src/components/ui/InteractiveCard.tsx',
    './src/components/ui/Charts.tsx'
  ];
  
  individualTests.forEach(filePath => {
    try {
      const component = require(filePath);
      console.log(`✓ ${filePath}: imported successfully`);
    } catch (error) {
      console.log(`✗ ${filePath}: ${error.message}`);
    }
  });
}