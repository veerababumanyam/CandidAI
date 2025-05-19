const fs = require('fs');
const path = require('path');

// Function to fix script and CSS paths in HTML files
function fixScriptPaths() {
  console.log('Fixing script and CSS paths in HTML files...');

  // Fix options.html
  const optionsHtmlPath = path.join(__dirname, 'dist', 'options', 'options.html');
  if (fs.existsSync(optionsHtmlPath)) {
    let content = fs.readFileSync(optionsHtmlPath, 'utf8');
    // Fix both possible incorrect paths for JS
    content = content.replace(/src="options\/options\.js"/g, 'src="options.js"');
    content = content.replace(/src="\.\/options\/options\.js"/g, 'src="options.js"');
    content = content.replace(/src="\.\.\/options\/options\.js"/g, 'src="options.js"');

    // Fix CSS paths
    content = content.replace(/href="\.\.\/css\//g, 'href="../css/');
    content = content.replace(/href="css\//g, 'href="../css/');

    // Fix icon paths
    content = content.replace(/src="\.\.\/icons\//g, 'src="../icons/');
    content = content.replace(/src="icons\//g, 'src="../icons/');
    fs.writeFileSync(optionsHtmlPath, content);
    console.log('Fixed options.html');
  } else {
    console.error('options.html not found');
  }

  // Fix calendar.html
  const calendarHtmlPath = path.join(__dirname, 'dist', 'options', 'calendar.html');
  if (fs.existsSync(calendarHtmlPath)) {
    let content = fs.readFileSync(calendarHtmlPath, 'utf8');
    // Fix both possible incorrect paths for JS
    content = content.replace(/src="options\/calendar\.js"/g, 'src="calendar.js"');
    content = content.replace(/src="\.\/options\/calendar\.js"/g, 'src="calendar.js"');
    content = content.replace(/src="\.\.\/options\/calendar\.js"/g, 'src="calendar.js"');

    // Fix CSS paths
    content = content.replace(/href="\.\.\/css\//g, 'href="../css/');
    content = content.replace(/href="css\//g, 'href="../css/');

    // Fix icon paths
    content = content.replace(/src="\.\.\/icons\//g, 'src="../icons/');
    content = content.replace(/src="icons\//g, 'src="../icons/');
    fs.writeFileSync(calendarHtmlPath, content);
    console.log('Fixed calendar.html');
  } else {
    console.error('calendar.html not found');
  }

  // Fix performance-hub.html
  const performanceHubHtmlPath = path.join(__dirname, 'dist', 'options', 'performance-hub.html');
  if (fs.existsSync(performanceHubHtmlPath)) {
    let content = fs.readFileSync(performanceHubHtmlPath, 'utf8');
    // Fix both possible incorrect paths for JS
    content = content.replace(/src="options\/performance-hub\.js"/g, 'src="performance-hub.js"');
    content = content.replace(/src="\.\/options\/performance-hub\.js"/g, 'src="performance-hub.js"');
    content = content.replace(/src="\.\.\/options\/performance-hub\.js"/g, 'src="performance-hub.js"');

    // Fix CSS paths
    content = content.replace(/href="\.\.\/css\//g, 'href="../css/');
    content = content.replace(/href="css\//g, 'href="../css/');

    // Fix icon paths
    content = content.replace(/src="\.\.\/icons\//g, 'src="../icons/');
    content = content.replace(/src="icons\//g, 'src="../icons/');
    fs.writeFileSync(performanceHubHtmlPath, content);
    console.log('Fixed performance-hub.html');
  } else {
    console.error('performance-hub.html not found');
  }

  console.log('Script path fixing completed');
}

// Run the function
fixScriptPaths();
