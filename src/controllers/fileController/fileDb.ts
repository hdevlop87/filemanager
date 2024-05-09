import { files } from '../../db/schema';
import { eq } from 'drizzle-orm';
import { db } from '../../db/index';

const FileDb = {

    findAllFiles: async () => {
        return await db.select().from(files);
    },

    deleteAllFiles: async () => {
        return await db.delete(files).returning();
    },

    insertFile: async (fileDetails) => {
        const [newFile] = await db.insert(files).values(fileDetails).returning();
        return newFile;
    },

    updateFile: async (fileId, fileDetails) => {
        const [updatedFile] = await db.update(files)
            .set(fileDetails)
            .where(eq(files.fileId, fileId))
            .returning();
        return updatedFile;
    },

    findFileById: async (fileId) => {
        const [file] = await db.select().from(files).where(eq(files.fileId, fileId));
        return file;
    },

    deleteFileById: async (fileId) => {
        const [deletedFile] = await db.delete(files).where(eq(files.fileId, fileId)).returning();
        return deletedFile;
    },

    findFilesByFolderId: async (folderId) => {
        return await db.select().from(files).where(eq(files.parentId, folderId));
    },

    findFileByPath: async (filePath) => {
        const [file] = await db.select().from(files).where(eq(files.path, filePath));
        return file;
    },

    fileExists: async (filename) => {
        const [file] = await db.select({ fileId: files.fileId })
            .from(files)
            .where(eq(files.originalname, filename));
        
        return !!file;
    },

    fileExistsByPath: async (filePath) => {
        const [existingFile] = await db.select().from(files).where(eq(files.path, filePath));
        return !!existingFile;
    },

    deleteFileByPath: async (filePath) => {
        const [deletedFile] = await db.delete(files).where(eq(files.path, filePath)).returning();
        return deletedFile;
    },

    deleteFileByName: async (FileName) => {
        const [deletedFile] = await db.delete(files).where(eq(files.originalname, FileName)).returning();
        return deletedFile;
    },
};

export default FileDb;
