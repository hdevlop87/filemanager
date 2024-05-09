import fs from 'fs/promises';
import multer from 'multer';
import path from 'path';

const tempFolderPath = path.join(process.cwd(), "storage","temp");

const storage = multer.diskStorage({
    destination: async (req, file, cb) => {
        try {
            await fs.mkdir(tempFolderPath, { recursive: true });
            cb(null, tempFolderPath); 
        } catch (error) {
            cb(error, null);
        }
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname); 
    }
});

export const upload = multer({ storage });

// export const cleanTempFolder = async () => {
//     try {
//         const files = await fs.readdir(tempFolderPath);
//         for (const file of files) {
//             const filePath = path.join(tempFolderPath, file);
//             await fs.unlink(filePath);  
//         }
//     } catch (error) {
//         console.error('Failed to clean temp folder:', error);
//     }
// };


// export const moveFileFromTemp = async (finalFolder, fileName) => {
//     const basePath = path.join(process.cwd(), "storage");
//     const destinationPath = finalFolder ? path.join(basePath, finalFolder, fileName) : path.join(basePath, fileName);
//     const destinationDir = path.dirname(destinationPath);
//     await fs.mkdir(destinationDir, { recursive: true });

//     let finalDestinationPath = destinationPath;
//     let counter = 1;

//     while (await fileExists(finalDestinationPath)) {
//         let fileExtension = path.extname(fileName);
//         let fileNameWithoutExt = path.basename(fileName, fileExtension);
//         finalDestinationPath = path.join(destinationDir, `${fileNameWithoutExt} (${counter})${fileExtension}`);
//         counter++;
//     }

//     const tempPath = path.join(basePath, "temp", fileName);
//     await fs.rename(tempPath, finalDestinationPath);
//     await cleanTempFolder();
    
//     const relativePath = path.relative(process.cwd(), finalDestinationPath);
//     return {
//         baseName: path.basename(finalDestinationPath),
//         relativePath: relativePath
//     };
// };

// async function fileExists(filePath) {
//     try {
//         await fs.access(filePath);
//         return true;
//     } catch (error) {
//         return false;
//     }
// }
