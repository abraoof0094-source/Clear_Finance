#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Fix the capacitor.build.gradle file by removing the problematic line
const filePath = path.join(__dirname, 'android/app/capacitor.build.gradle');

try {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Remove the problematic line
  content = content.replace(/apply from: "\.\.\/capacitor-cordova-android-plugins\/cordova\.variables\.gradle"\n?/g, '');
  
  fs.writeFileSync(filePath, content);
  console.log('✅ Fixed capacitor.build.gradle - removed problematic cordova.variables.gradle line');
} catch (error) {
  console.error('❌ Error fixing capacitor.build.gradle:', error.message);
}
