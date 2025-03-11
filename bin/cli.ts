import path from 'path';
import { runBLKFile } from '../src/main'; // Import your run function

const args = process.argv.slice(2);

if (args.length !== 2) {
    console.error("Usage: blackrose <folder-name> <file-name.blk>");
    process.exit(1);
}

const folderName = args[0];
const fileName = args[1];

if (!fileName.endsWith('.blk')) {
    console.error("Error: Please provide a .blk file.");
    process.exit(1);
}

const filePath = path.resolve(process.cwd(), folderName, fileName);

runBLKFile(filePath);
