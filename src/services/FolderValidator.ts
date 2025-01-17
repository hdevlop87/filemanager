import { msg } from '../lib/constants';
import { sql, eq } from "drizzle-orm";
import { folders } from '../db/schema';
import { db } from '../db/index';
import folderDb from '../controllers/folderController/folderDb';
import Joi from 'joi';
import fs from 'fs/promises';
import path from 'path';

export const cleanTempFolder = async () => {
    const tempFolderPath = path.join(process.cwd(), "storage","temp");
    try {
        const files = await fs.readdir(tempFolderPath);
        for (const file of files) {
            const filePath = path.join(tempFolderPath, file);
            await fs.unlink(filePath);  
        }
    } catch (error) {
        console.error('Failed to clean temp folder:', error);
    }
};

export default class FolderValidator {
    static instance = null;
    folderSchema: Joi.ObjectSchema<any>;

    constructor() {
        if (FolderValidator.instance) {
            return FolderValidator.instance;
        }
        this.folderSchema = Joi.object({
            folderId: Joi.string().optional(),
            foldername: Joi.string().min(1).required().messages({
                'string.min': `Folder name is required`,
                'string.base': `Folder name must be a string`,
                'any.required': `Folder name is a required field`
            }),
            size: Joi.string().allow('').optional(),
            maxSize: Joi.string().allow('').optional(),
            description: Joi.string().allow('').optional(),
            password: Joi.string().allow('').optional(),
            isLocked: Joi.boolean().allow('').optional(),
            createdAt: Joi.string().optional(),
            updatedAt: Joi.string().optional(),
            parentId: Joi.string().allow(null, '').optional()
        });
        FolderValidator.instance = this;
    }

    async validateFolderSchema(data) {
        try {
            await this.folderSchema.validateAsync(data);
        } catch (error) {
            if (error instanceof Joi.ValidationError) {
                throw new Error(error.details[0].message);
            } else {
                throw error;
            }
        }
    }

    async checkFolderExists(folderId) {
        const folder = await folderDb.findFolderById(folderId);
        if (!folder) {
            await cleanTempFolder()
            throw new Error(msg.FOLDER_NOT_FOUND);
        }
        return folder;
    }

    async checkFolderNameExists(foldername, parentId = null, currentFolderId = null) {
        if (parentId === "") {
            parentId = null;
        }
        
        let conditions = parentId === null 
            ? sql`(${folders.foldername} = ${foldername} AND ${folders.parentId} IS NULL)`
            : sql`(${folders.foldername} = ${foldername} AND ${folders.parentId} = ${parentId})`;
    
        if (currentFolderId) {
            conditions = sql`${conditions} AND ${folders.folderId} != ${currentFolderId}`;
        }
        
        const existingFolder = await db.select().from(folders).where(conditions);
        
        if (existingFolder.length > 0) {
            throw new Error(msg.FOLDER_EXISTS);
        }
    }

    static getInstance() {
        if (!FolderValidator.instance) {
            FolderValidator.instance = new FolderValidator();
        }
        return FolderValidator.instance;
    }
}
