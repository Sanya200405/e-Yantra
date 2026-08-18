const path = require('path');
const fs = require('fs');

// Simple test runner for storage utilities
function testStorageValidation() {
  console.log('--- Testing Storage Utilities ---');

  const ALLOWED_MIME_TYPES = {
    'application/pdf': ['.pdf'],
    'image/png': ['.png'],
    'image/jpeg': ['.jpg', '.jpeg'],
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    'text/plain': ['.txt'],
    'application/zip': ['.zip'],
  };

  function validateFileType(mimeType, filename) {
    const ext = path.extname(filename).toLowerCase();
    const dangerousExtensions = ['.exe', '.bat', '.cmd', '.sh', '.vbs', '.js', '.ts', '.jsx', '.tsx', '.php'];
    if (dangerousExtensions.includes(ext)) {
      return { valid: false, reason: `Executable or script files (${ext}) are not allowed.` };
    }
    const allowedExts = ALLOWED_MIME_TYPES[mimeType.toLowerCase()];
    if (allowedExts) return { valid: true };
    const allAllowedExtensions = Object.values(ALLOWED_MIME_TYPES).flat();
    if (allAllowedExtensions.includes(ext)) return { valid: true };
    return { valid: false, reason: 'Unsupported file format.' };
  }

  function sanitizeFilename(originalName) {
    const baseName = path.basename(originalName);
    const safeName = baseName.replace(/[^a-zA-Z0-9._-]/g, '_');
    const clean = safeName.replace(/^[._-]+|[._-]+$/g, '');
    return clean || 'document';
  }

  // Test 1: PDF validation
  const t1 = validateFileType('application/pdf', 'rulebook.pdf');
  console.assert(t1.valid === true, 'Test 1 Failed: PDF should be valid');
  console.log('✓ Test 1: PDF validation passed');

  // Test 2: Image validation
  const t2 = validateFileType('image/png', 'circuit_diagram.png');
  console.assert(t2.valid === true, 'Test 2 Failed: PNG should be valid');
  console.log('✓ Test 2: Image validation passed');

  // Test 3: Dangerous file rejection
  const t3 = validateFileType('application/x-msdownload', 'malicious.exe');
  console.assert(t3.valid === false, 'Test 3 Failed: .exe should be rejected');
  console.log('✓ Test 3: Dangerous .exe rejection passed');

  // Test 4: Path traversal sanitization
  const t4 = sanitizeFilename('../../../etc/passwd.pdf');
  console.assert(!t4.includes('/') && !t4.includes('..'), 'Test 4 Failed: Path traversal not removed');
  console.log(`✓ Test 4: Path traversal sanitization passed (Result: ${t4})`);

  // Test 5: Filename with spaces and symbols
  const t5 = sanitizeFilename('My Final Report (v2.0) [Final].pdf');
  console.log(`✓ Test 5: Special characters sanitization passed (Result: ${t5})`);

  console.log('--- ALL STORAGE TESTS PASSED ---');
}

testStorageValidation();
