import chokidar from 'chokidar';
import path from 'path';
import fileDb from '../../controllers/fileController/fileDb';
import folderDb from '../../controllers/folderController/folderDb';
import StorageManager from '../../services/StorageManager'
import fs from 'fs/promises';
import mime from 'mime-types';
import debounce from 'lodash.debounce'

const storageManager = new StorageManager();

export function watchFiles() {

    const rootFolderPath = path.resolve(process.cwd(), "storage");
    const tempPath = path.resolve(rootFolderPath, "temp");

    const watcher = chokidar.watch(rootFolderPath, {
        ignored: (watchPath) => {
            const normalizedWatchPath = path.normalize(watchPath);
            const normalizedTempPath = path.normalize(tempPath);
            return normalizedWatchPath.startsWith(normalizedTempPath) || /(^|[\/\\])\../.test(normalizedWatchPath);
        },
        persistent: true
    });

    const debouncedFileAddition = debounce(handleFileAddition, 1000);
    const debouncedFolderAddition = debounce(handleFolderAddition, 1000);

    watcher
        //handle Files Actions
        .on('add', watchPath => {
            debouncedFileAddition(watchPath);
        })
        .on('unlink', watchPath => {
            handleFileDeletion(watchPath);
        })
        //handle Folders Actions
        .on('addDir', watchPath => {
            if (watchPath === rootFolderPath) return;
            debouncedFolderAddition(watchPath);
        })
        .on('unlinkDir', watchPath => {
            if (watchPath === rootFolderPath) return;
            handleFolderDeletion(watchPath);
        })
}

async function handleFileAddition(watchPath) {

    const fileName = path.basename(watchPath);
    const filePath = await storageManager.getRelativePath(watchPath);

    let parentId = null;
    const parentFolder = await fileDb.findFileByPath(filePath);
    if (parentFolder) {
        parentId = parentFolder.fileId;
    }

    const exists = await fileDb.fileExistsByPath(fileName);

    if (exists) return;

    const stats = await fs.stat(watchPath);
    const mimeType = mime.lookup(watchPath);

    const newFile = {
        fileId: await storageManager.getUUID(),
        filename: await storageManager.getUniqueName(fileName),
        mimetype: mimeType,
        originalname: fileName,
        destination: path.dirname(watchPath),
        size: stats.size.toString(),
        path: await storageManager.getRelativePath(watchPath),
        parentId: parentId,
    }

    await fileDb.insertFile(newFile)
}

async function handleFolderAddition(watchPath) {

    const foldername = path.basename(watchPath);
    const folderPath = await storageManager.getRelativePath(watchPath);

    let parentId = null; 
    const parentFolder = await folderDb.findFolderByPath(folderPath);
    if (parentFolder) {
        parentId = parentFolder.folderId;
    }

    const exists = await folderDb.folderExistsByPath(folderPath);

    if (exists) return;

    await folderDb.insertFolder({
        foldername,
        parentId,
        folderPath
    });

}

async function handleFileDeletion(watchPath) {
    const fileName = await storageManager.getRelativePath(watchPath);
    await fileDb.deleteFileByPath(fileName)
}

async function handleFolderDeletion(watchPath) {
    const folderPath = await storageManager.getRelativePath(watchPath);
    await folderDb.deleteFolderByPath(folderPath)
}