import express from 'express';
import RolePermissionController from '../controllers/PermissionController/RolePermissionController';
import PermissionController from '../controllers/PermissionController';
import authController from '../controllers/AuthController';
import UserController from '../controllers/UserController';
import RoleController from '../controllers/RoleController';
import FileController from '../controllers/fileController';
import FolderController from '../controllers/folderController';

// import FilesController from '../controllers/x';

import { isAuth, isAdmin } from '../middleware'

const router = express.Router();


const adminRoutes = [
    { path: 'users', method: 'get', handler: UserController.getAllUsers },
    { path: 'users', method: 'delete', handler: UserController.deleteAllUsers },
    { path: 'users', method: 'post', handler: UserController.createUser },
    { path: 'users/:id', method: 'get', handler: UserController.getUserById },
    { path: 'users/:id', method: 'patch', handler: UserController.updateUser },
    { path: 'users/:id', method: 'delete', handler: UserController.deleteUserById },
    { path: 'users/email/:email', method: 'get', handler: UserController.getUserByEmail },
    { path: 'users/username/:username', method: 'get', handler: UserController.getUserByUsername },

    { path: 'roles/', method: 'get', handler: RoleController.getAllRoles },
    { path: 'roles/', method: 'delete', handler: RoleController.deleteAllRoles },
    { path: 'roles/', method: 'post', handler: RoleController.createRole },
    { path: 'roles/:id', method: 'get', handler: RoleController.getRoleById },
    { path: 'roles/:id', method: 'patch', handler: RoleController.updateRole },
    { path: 'roles/:id', method: 'delete', handler: RoleController.deleteRoleById },
    { path: 'roles/initialize', method: 'post', handler: RoleController.initializeRoles },

    { path: 'permissions/', method: 'get', handler: PermissionController.getAllPermissions },
    { path: 'permissions/', method: 'delete', handler: PermissionController.deleteAllPermissions },
    { path: 'permissions/', method: 'post', handler: PermissionController.createPermission },
    { path: 'permissions/:id', method: 'get', handler: PermissionController.getPermissionById },
    { path: 'permissions/:id', method: 'patch', handler: PermissionController.updatePermission },
    { path: 'permissions/:id', method: 'delete', handler: PermissionController.deletePermissionById },
    { path: 'permission/initialize', method: 'post', handler: PermissionController.initializePermissions },

    { path: 'rolePermissions', method: 'post', handler: RolePermissionController.assignPermissionToRole },
    { path: 'rolePermissions', method: 'delete', handler: RolePermissionController.removePermissionFromRole },
    { path: 'rolePermissions/:id', method: 'get', handler: RolePermissionController.getPermissionsRole },

    { path: 'files/', method: 'get', handler: FileController.getAllFiles },
    { path: 'files/', method: 'delete', handler: FileController.deleteAllFiles },
    { path: 'files/', method: 'post', handler: FileController.createFile },
    { path: 'files/:id', method: 'get', handler: FileController.getFileById },
    { path: 'files/:id', method: 'patch', handler: FileController.updateFile },
    { path: 'files/:id', method: 'delete', handler: FileController.deleteFileById },

    { path: 'folders/', method: 'get', handler: FolderController.getAllFolders },
    { path: 'folders/', method: 'delete', handler: FolderController.deleteAllFolders },
    { path: 'folders/', method: 'post', handler: FolderController.createFolder },
    { path: 'folders/:id', method: 'get', handler: FolderController.getFolderById },
    { path: 'folders/:id', method: 'patch', handler: FolderController.updateFolder },
    { path: 'folders/:id', method: 'delete', handler: FolderController.deleteFolderById },


    { path: 'folders/:folderId/files', method: 'get', handler: FileController.getFilesByFolder },

]

const authRoutes = [
    { path: 'users/changePassword/:id', method: 'post', handler: UserController.updatePassUser },
    { path: 'users/getRole/:id', method: 'get', handler: UserController.getUserRole },
    { path: 'users/getPermissions/:id', method: 'get', handler: UserController.getUserPermissions },

    // { path: 'files', method: 'post', handler: FilesController.uploadFile },
    // { path: 'files/:filename', method: 'get', handler: FilesController.getFile },
];

const publicRoutes = [

    { path: 'auth/login', method: 'post', handler: authController.loginUser },
    { path: 'auth/logout/:id', method: 'post', handler: authController.logoutUser },

    // TODO: must assign role guest in register controller, the true role is assigned by admin
    { path: 'auth/register', method: 'post', handler: authController.registerUser },
    { path: 'auth/refreshToken', method: 'get', handler: authController.refreshToken },
    { path: 'auth/me', method: 'get', handler: authController.userProfile },

];

const applyRouteGroup = (router, routes, middlewares = []) => {
    routes.forEach(({ path, method, handler }) => {
        if (router[method]) {
            router[method](`/${path}`, ...middlewares, handler);
        } else {
            console.error(`Method ${method} is not supported for path ${path}.`);
        }
    });
};

applyRouteGroup(router, publicRoutes);
applyRouteGroup(router, authRoutes);
applyRouteGroup(router, adminRoutes);


export default router;