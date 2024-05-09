import { folders, files } from '../../db/schema';
import { eq, sql, and } from "drizzle-orm";
import { db } from '../../db/index';

const FolderDb = {

    findAllFolders: async () => {
        const results = await db.select({
            folderId: folders.folderId,
            foldername: folders.foldername,
            maxSize: folders.maxSize,
            password: folders.password,
            isLocked: folders.isLocked,
            filesCount: sql`COUNT(${files.fileId})`,
            size: sql`SUM(CAST(${files.size} AS BIGINT))`,
            folderPath: folders.folderPath,
            updatedAt: folders.updatedAt,
            parentId: folders.parentId
        })
            .from(folders)
            .leftJoin(files, eq(folders.folderId, files.parentId))
            .groupBy(folders.folderId)

        return results.map(folder => ({
            ...folder,
            filesCount: folder.filesCount || 0,
            size: folder.size || 0,
        }));
    },

    deleteAllFolders: async () => {
        const allFolders = await db.delete(folders).returning();
        await FolderDb.resetSequence();
        return allFolders
    },

    insertFolder: async (folderDetails) => {
        const [newFolder] = await db.insert(folders).values(folderDetails).returning();
        return newFolder;
    },

    updateFolder: async (folderId, folderDetails) => {
        const [updatedFolder] = await db.update(folders)
            .set(folderDetails)
            .where(eq(folders.folderId, folderId))
            .returning();
        return updatedFolder;
    },

    findFolderById: async (folderId) => {
        const [folder] = await db.select().from(folders).where(eq(folders.folderId, folderId));
        return folder;
    },

    findFolderByName: async (folderName) => {
        const [folder] = await db.select().from(folders).where(eq(folders.foldername, folderName));
        return folder;
    },

    findFolderByPath: async (folderPath) => {
        const [folder] = await db.select().from(folders).where(eq(folders.folderPath, folderPath));
        return folder;
    },

    deleteFolderById: async (folderId) => {
        const [deletedFolder] = await db.delete(folders)
            .where(eq(folders.folderId, folderId))
            .returning();

        await FolderDb.resetSequence();
        return deletedFolder;
    },

    deleteFolderByPath: async (folderPath) => {
        const [deletedFolder] = await db.delete(folders).where(eq(folders.folderPath, folderPath)).returning();
        await FolderDb.resetSequence();
        return deletedFolder;
    },

    folderExists: async (foldername, parentId = null) => {
        let conditions = parentId === null
            ? sql`(${folders.foldername} = ${foldername} AND ${folders.parentId} IS NULL)`
            : sql`(${folders.foldername} = ${foldername} AND ${folders.parentId} = ${parentId})`;

        const existingFolder = await db.select().from(folders).where(conditions);
        return existingFolder.length > 0;
    },

    folderExistsByPath: async (folderPath) => {
        const [existingFolder] = await db.select().from(folders).where(eq(folders.folderPath, folderPath));
        return !!existingFolder;
    },
 
    resetSequence: async () => {
        try {
            const query = sql`SELECT setval(pg_get_serial_sequence('folders', 'folderId'), COALESCE((SELECT MAX("folderId") + 1 FROM folders), 1), false)`;
            await db.execute(query);
        } catch (error) {
            throw new Error('Error resetting sequence');
        }
    },

};

export default FolderDb;
