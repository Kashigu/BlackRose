import path from 'path';
import { runBLKFile } from '../src/main'; // Import your run function

const args = process.argv.slice(2);

const folderName = args[0];
const fileName = args[1];

if (folderName == "-h" || folderName == "--help") {
    console.log('Usage: blackrose "<folder-name>" <file-name.blk> \n');
    console.log('Options:');
    console.log('  -h, --help     Show usage information');
    console.log('  -v, --version  Display the version number');
    process.exit(0);
}

if (folderName == "-v" || folderName == "--version") {
    const { version } = require('../package.json');
    console.log(`Blackrose version ${version}`);
    process.exit(0);
}

if (args.length != 2) {
    console.error('Usage: blackrose "<folder-name>" <file-name.blk>');
    process.exit(1);
}


if (!fileName.endsWith('.blk')) {
    console.error("Error: Please provide a .blk file.");
    process.exit(1);
}

const filePath = path.resolve(process.cwd(), folderName, fileName);

runBLKFile(filePath);
