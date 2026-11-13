// Runs in CI after `npx cap add android`. Sets the version and release signing, registers the
// luckyboard:// link that LuckyWheel uses to send numbers, and lets the app see whether LuckyWheel is installed.
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
const versionCode = parseInt(process.env.VERSION_CODE || '1', 10);
const versionName = pkg.version;
const LUCKYWHEEL_ID = 'com.beatfactory.luckywheel';

function patch(file, edits) {
  let text = readFileSync(file, 'utf8');
  for (const [pattern, replacement, label] of edits) {
    if (!pattern.test(text)) throw new Error(`${label}: pattern not found in ${file}`);
    text = text.replace(pattern, replacement);
  }
  writeFileSync(file, text);
}

const signing = [
  'signingConfigs {',
  '    release {',
  '        storeFile file(System.getenv("KEYSTORE_FILE") ?: "upload.jks")',
  '        storeType "pkcs12"',
  '        storePassword System.getenv("KEYSTORE_PASSWORD")',
  '        keyAlias System.getenv("KEY_ALIAS") ?: "upload"',
  '        keyPassword System.getenv("KEY_PASSWORD")',
  '    }',
  '}'
];

patch(join(root, 'android', 'app', 'build.gradle'), [
  [/versionCode\s+\d+/, `versionCode ${versionCode}`, 'versionCode'],
  [/versionName\s+"[^"]*"/, `versionName "${versionName}"`, 'versionName'],
  [/(\n(\s*))buildTypes\s*\{/, (m, nl) => nl + signing.join(nl) + nl + 'buildTypes {', 'buildTypes'],
  [/(buildTypes\s*\{\s*release\s*\{)/, '$1\n            signingConfig signingConfigs.release', 'release build type']
]);

const deepLink = [
  '',
  '            <intent-filter>',
  '                <action android:name="android.intent.action.VIEW" />',
  '                <category android:name="android.intent.category.DEFAULT" />',
  '                <category android:name="android.intent.category.BROWSABLE" />',
  '                <data android:scheme="luckyboard" />',
  '            </intent-filter>'
].join('\n');

const queries = [
  '    <queries>',
  `        <package android:name="${LUCKYWHEEL_ID}" />`,
  '        <intent>',
  '            <action android:name="android.intent.action.VIEW" />',
  '            <data android:scheme="luckywheel" />',
  '        </intent>',
  '    </queries>',
  ''
].join('\n');

// Same SDK levels as LuckyWheel: Play's automatic protection needs minSdk 24+, and target the newest API Play asks for.
patch(join(root, 'android', 'variables.gradle'), [
  [/minSdkVersion\s*=\s*\d+/, 'minSdkVersion = 24', 'minSdkVersion'],
  [/compileSdkVersion\s*=\s*\d+/, 'compileSdkVersion = 36', 'compileSdkVersion'],
  [/targetSdkVersion\s*=\s*\d+/, 'targetSdkVersion = 36', 'targetSdkVersion']
]);

patch(join(root, 'android', 'app', 'src', 'main', 'AndroidManifest.xml'), [
  // first </intent-filter> belongs to MainActivity's launcher filter
  [/(<\/intent-filter>)/, `$1${deepLink}`, 'MainActivity intent filter'],
  [/(\s*)<application/, `\n${queries}$1<application`, 'application tag'],
  // Google code scanner (ticket QR): Play services shows the camera UI, so the app needs no camera permission
  [/<application([^>]*)>/, '<application$1>\n        <meta-data android:name="com.google.mlkit.vision.DEPENDENCIES" android:value="barcode_ui" />', 'barcode scanner module'],
  [/(<\/manifest>)/, '    <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />\n$1', 'manifest end']
]);

console.log(`Android configured: versionCode ${versionCode}, versionName ${versionName}, luckyboard:// link`);
