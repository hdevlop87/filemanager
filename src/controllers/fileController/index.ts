import { sendSuccess } from '../../services/responseHandler';
import FileValidator from '../../services/FileValidator';
import StorageManager from '../../services/StorageManager';
import asyncHandler from '../../lib/asyncHandler';
import { msg } from '../../lib/constants';
import { upload } from './multerConfig';
import { watchFiles } from './watcher';
import fileDb from './fileDb';

watchFiles();
const fileValidator = new FileValidator();
const storageManager = new StorageManager();

const FileController = {

    getAllFiles: asyncHandler(async (req, res) => {
        const allFiles = await fileDb.findAllFiles();
        sendSuccess(res, allFiles, msg.Files_RETRIEVED_SUCCESS);
    }),

    getFilesByFolder: asyncHandler(async (req, res) => {
        const folderId = req.params.folderId;
        const files = await fileDb.findFilesByFolderId(folderId);
        sendSuccess(res, files, msg.FILES_RETRIEVED_SUCCESS);
    }),

    deleteAllFiles: asyncHandler(async (req, res) => {
        await fileDb.deleteAllFiles();
        sendSuccess(res, null, msg.FILES_DELETED_SUCCESS);
    }),

    createFile: [
        upload.single('file'),
        asyncHandler(async (req, res) => {

            const { originalname, ...fileDetails } = req.file;
            let foldername = null;
            let parentId = req.body.parentId;
            parentId = parentId === "" ? null : parentId;

            const fileId = crypto.randomUUID();

            if (parentId) {
                const folder = await fileValidator.checkFolderExists(parentId);
                foldername = folder.foldername;
            }

            let { baseName, relativePath, relativeName } = await storageManager.moveFileFromTemp(foldername, originalname);

            const newFile = await fileDb.insertFile({
                ...fileDetails,
                fileId,
                filename: relativeName,
                path: relativePath,
                originalname: baseName
            });
            sendSuccess(res, newFile, msg.FILE_CREATED_SUCCESS, 201);
        }),
    ],

    updateFile: asyncHandler(async (req, res) => {
        const fileId = req.params.id;
        const fileDetails = req.body;

        await fileValidator.checkFileExists(fileId);

        const validations = {
            folderId: fileValidator.checkFolderExists,
            fileName: fileValidator.checkFileNameExists,
        };

        for (const [field, validationFn] of Object.entries(validations)) {
            if (fileDetails.hasOwnProperty(field)) {
                await validationFn(fileDetails[field], fileId);
            }
        }

        fileDetails.updatedAt = new Date();

        const updatedFile = await fileDb.updateFile(fileId, fileDetails);
        sendSuccess(res, updatedFile, msg.CUSTOMER_UPDATED_SUCCESS);
    }),

    getFileById: asyncHandler(async (req, res) => {
        const fileId = req.params.id;
        const file = await fileValidator.checkFileExists(fileId)
        sendSuccess(res, file, msg.file_RETRIEVED_SUCCESS);
    }),

    deleteFileById: asyncHandler(async (req, res) => {
        const fileId = req.params.id;
        await fileValidator.checkFileExists(fileId);
        const file = await fileDb.deleteFileById(fileId);
        sendSuccess(res, file, msg.FILE_DELETED_SUCCESS);
    }),

};

export default FileController;
