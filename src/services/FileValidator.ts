import { msg } from '../lib/constants';
import { sql, eq } from "drizzle-orm";
import { files } from '../db/schema';
import { db } from '../db/index';
import fileDb from '../controllers/fileController/fileDb'
import folderDb from '../controllers/folderController/folderDb'
import Joi from 'joi';

export default class FileValidator {
    static instance = null;
    fileSchema: Joi.ObjectSchema<any>;

    constructor() {
        if (FileValidator.instance) {
            return FileValidator.instance;
        }
        this.fileSchema = Joi.object({
            filename: Joi.string().required(),
            mimetype: Joi.string().required(),
            originalname: Joi.string().required(),
            size: Joi.number().required(),
            path: Joi.string().required(),
            folderId: Joi.string().required()
        });
        FileValidator.instance = this;
    }

    async validateFileSchema(data) {
        try {
            await this.fileSchema.validateAsync(data);
        } catch (error) {
            if (error instanceof Joi.ValidationError) {
                throw new Error(error.details[0].message);
            } else {
                throw error;
            }
        }
    }

    async checkFileExists(fileId) {
        const file = await fileDb.findFileById(fileId);
        if (!file) {
            throw new Error(msg.FILE_NOT_FOUND);
        }
        return file;
    }

    async checkFileNameExists(filename, fileId = null) {
        const query = fileId
            ? sql`${files.fileId} != ${fileId} AND ${files.filename} = ${filename}`
            : sql`${files.filename} = ${filename}`;
            const existingFile = await db.select().from(files).where(query);
        if (existingFile.length > 0) {
            throw new Error(msg.FILE_EXISTS);
        }
    }

    async checkFolderExists(folderId) {
        const folder = await folderDb.findFolderById(folderId);
        if (!folder) {
            throw new Error(msg.FOLDER_NOT_FOUND);
        }
        return folder;
    }

    static getInstance() {
        if (!FileValidator.instance) {
            FileValidator.instance = new FileValidator();
        }
        return FileValidator.instance;
    }
}
