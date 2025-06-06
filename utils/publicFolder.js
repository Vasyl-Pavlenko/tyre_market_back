const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, '../public');

function deleteFolderRecursive(folderPath) {
  if (!fs.existsSync(folderPath)) return;

  fs.readdirSync(folderPath).forEach((file) => {
    const curPath = path.join(folderPath, file);
    if (fs.lstatSync(curPath).isDirectory()) {
      deleteFolderRecursive(curPath);
    } else {
      fs.unlinkSync(curPath);
    }
  });
  fs.rmdirSync(folderPath);
}

function preparePublicFolder() {
  if (fs.existsSync(publicDir)) {
    deleteFolderRecursive(publicDir);
    console.log('Стара папка public видалена');
  }
  fs.mkdirSync(publicDir, { recursive: true });
  console.log('Папка public створена');
}

module.exports = {
  preparePublicFolder,
  publicDir,
};
