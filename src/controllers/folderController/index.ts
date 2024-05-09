import { sendSuccess } from '../../services/responseHandler';
import FolderValidator from '../../services/FolderValidator';
import asyncHandler from '../../lib/asyncHandler';
import { msg } from '../../lib/constants';
import { hashPassword } from '../../lib/utils';
import StorageManager from '../../services/StorageManager';
import folderDb from './folderDb';
import fs from 'fs/promises';
import path from 'path';

const folderValidator = new FolderValidator();
const BASE_DIR = path.join(process.cwd(), 'storage');
const storageManager = new StorageManager();

const FolderController = {

    getAllFolders: asyncHandler(async (req, res) => {
        const allFolders = await folderDb.findAllFolders();
        sendSuccess(res, allFolders, msg.Folders_RETRIEVED_SUCCESS);
    }),

    deleteAllFolders: asyncHandler(async (req, res) => {
        const folders = await folderDb.deleteAllFolders();

        for (const folder of folders) {
            const folderPath = path.join(BASE_DIR, folder.foldername);
            await fs.rm(folderPath, { recursive: true, force: true });
        }

        sendSuccess(res, null, msg.FOLDERS_DELETED_SUCCESS);
    }),

    createFolder: asyncHandler(async (req, res) => {
        let { foldername, parentId } = req.body;

        parentId = parentId === "" ? null : parentId;

        await folderValidator.validateFolderSchema(req.body);
        await folderValidator.checkFolderNameExists(foldername, parentId);
    
        let basePath = BASE_DIR;
        if (parentId) {
            try {
                const parentFolder = await folderValidator.checkFolderExists(parentId);
                basePath = path.join(basePath, parentFolder.foldername);
            } catch (error) {
                throw new Error("Parent Folder not found")
            }
        }
    
        const folderPath = path.join(basePath, foldername);
        await fs.mkdir(folderPath, { recursive: true });

        const newFolder = await folderDb.insertFolder({
            foldername, 
            parentId,
            folderPath:await storageManager.getRelativePath(folderPath)
        });
        sendSuccess(res, newFolder, msg.FOLDER_CREATED_SUCCESS, 201);
    }),

    updateFolder: asyncHandler(async (req, res) => {
        const folderId = req.params.id;
        const folderDetails = req.body;
        await folderValidator.checkFolderExists(folderId)
        await folderValidator.checkFolderNameExists(folderDetails.foldername, folderId);

        if (folderDetails.password) {
            const hashedPassword = await hashPassword(folderDetails.password);
            folderDetails.password = hashedPassword;
        }

        folderDetails.updatedAt = new Date();

        const updatedFolder = await folderDb.updateFolder(folderId, folderDetails);
        sendSuccess(res, updatedFolder, msg.FOLDER_UPDATED_SUCCESS);
    }),

    getFolderById: asyncHandler(async (req, res) => {
        const folderId = req.params.id;
        const folder = await folderValidator.checkFolderExists(folderId)
        sendSuccess(res, folder, msg.folder_RETRIEVED_SUCCESS);
    }),

    deleteFolderById: asyncHandler(async (req, res) => {
        const folderId = req.params.id;
        const folder = await folderValidator.checkFolderExists(folderId);

        const folderPath = path.join(BASE_DIR, folder.foldername);
        await fs.rm(folderPath, { recursive: true, force: true });

        await folderDb.deleteFolderById(folderId);
        sendSuccess(res, folder, msg.FOLDER_DELETED_SUCCESS);
    }),


};

export default FolderController;
