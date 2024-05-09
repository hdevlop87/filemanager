import fs from 'fs/promises';
import path from 'path';

class StorageManager {
    static instance = null;
    basePath: string;
    tempFolderPath: string;

    constructor() {
        if (StorageManager.instance) {
            return StorageManager.instance;
        }
        this.basePath = path.join(process.cwd(), "storage");
        this.tempFolderPath = path.join(this.basePath, "temp");
    }

    getPath(folder, fileName = '') {
        folder = folder || "";
        fileName = fileName || "";
        return path.join(this.basePath, folder, fileName);
    }

    async getUUID(){
        return crypto.randomUUID();
    }

    async cleanTempFolder() {
        const files = await fs.readdir(this.tempFolderPath);
        const deletionPromises = files.map(file => fs.unlink(this.getPath("temp", file)));
        await Promise.all(deletionPromises);
    }

    async moveFileFromTemp(folderName = "", fileName) {
        const destinationDir = this.getPath(folderName);
        await fs.mkdir(destinationDir, { recursive: true });

        const destinationPath = this.getPath(folderName, fileName);
        const uniquePath = await this.getUniquePath(destinationPath);
        const tempPath = this.getPath("temp", fileName);
        const relativeName = await this.getUniqueName(fileName)
        await fs.rename(tempPath, uniquePath);

        return {
            baseName: path.basename(uniquePath),
            relativePath: await this.getRelativePath(uniquePath),
            relativeName
        };
    }

    async getRelativePath(Path) {
        return path.relative(process.cwd(), Path)
    }

    async getUniqueName(name) {
        const timestamp = new Date().toISOString().replace(/[:.-]/g, '');
        const originalnameParts = name.split('.');
        const extension = originalnameParts.pop();
        return `${originalnameParts.join('.')}_${timestamp}.${extension}`;
    }

    async getUniquePath(filePath) {
        let finalPath = filePath;
        let counter = 1;
        while (await this.fileExists(finalPath)) {
            const fileExtension = path.extname(filePath);
            const nameWithoutExt = path.basename(filePath, fileExtension);
            finalPath = path.join(path.dirname(filePath), `${nameWithoutExt} (${counter})${fileExtension}`);
            counter++;
        }
        return finalPath;
    }

    async fileExists(filePath) {
        try {
            await fs.access(filePath);
            return true;
        } catch (error) {
            return false;
        }
    }

    static getInstance() {
        if (!StorageManager.instance) {
            StorageManager.instance = new StorageManager();
        }
        return StorageManager.instance;
    }
}

export default StorageManager;
