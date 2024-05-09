import { timestamp, pgTable, text, varchar, integer, boolean, serial, primaryKey, pgEnum } from "drizzle-orm/pg-core";
import { relations } from 'drizzle-orm';

export const userStatusEnum = pgEnum('userStatus', ['Active', 'Inactive', 'Pending']);

export const users = pgTable("users", {
    id: text("id").notNull().primaryKey(),
    name: text("name").notNull(),
    username: text("username").notNull(),
    password: text("password"),
    email: text("email").notNull(),
    emailVerified: boolean("emailVerified").default(false),
    image: text("image"),
    status: userStatusEnum("status").default('Inactive'),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),

    roleId: integer("roleId").references(() => roles.roleId, { onDelete: 'set null' }),
    imageId: text("imageId").references(() => files.fileId, { onDelete: 'set null' }),
});

export const roles = pgTable("roles", {
    roleId: serial("roleId").primaryKey(),
    roleName: text("roleName").notNull(),
    description: text("description"),
});

export const permissions = pgTable("permissions", {
    permissionId: serial("permissionId").primaryKey(),
    permissionName: text("permissionName").notNull(),
    description: text("description"),
});

export const rolesPermissions = pgTable("roles_permissions", {
    roleId: integer("roleId").notNull().references(() => roles.roleId, { onDelete: 'cascade' }),
    permissionId: integer("permissionId").notNull().references(() => permissions.permissionId, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at').defaultNow(),
});

export const tokens = pgTable("tokens", {
    id: text("id").notNull().primaryKey(),
    userId: text("userId").notNull().unique().references(() => users.id, { onDelete: 'cascade' }),
    refreshToken: text("refreshToken").notNull(),
    refreshExpires: timestamp("refreshExpires").notNull(),
    tokenType: text("tokenType").default('Bearer'),
    createdAt: timestamp('created_at').defaultNow(),
});

//============================================================================//

export const files = pgTable("files", {
    fileId: text("fileId").notNull().primaryKey(),
    fieldname: text("fieldname").default("uploadField"),
    filename: text("filename").notNull(),
    mimetype: text("mimetype").default("application/octet-stream"),
    originalname: text("originalname").notNull(),
    destination: text("destination"),
    size: text("size").notNull(),
    path: text("path").notNull(),
    encoding: text("encoding").default("binary"),
    password: text("password"),
    isLocked: boolean("isLocked").default(false),
    parentId: integer("parentId").references(() => folders.folderId, { onDelete: 'cascade' }),

    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
});

export const folders = pgTable("folders", {
    folderId: serial("folderId").primaryKey(),
    foldername: text("foldername").notNull(),
    size: text("size").default("0"),
    maxSize: text("maxSize").default("10"),
    password: text("password"),
    isLocked: boolean("isLocked").default(false),
    parentId: integer("parentId").references(() => folders.folderId, { onDelete: 'set null' }),
    folderPath: text("folderPath"),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
});

//=========================================================================//

export const rolesRelations = relations(roles, ({ many }) => ({
    permissions: many(rolesPermissions, { relationName: 'rolePermissions' }),
}));

export const permissionsRelations = relations(permissions, ({ many }) => ({
    roles: many(rolesPermissions, { relationName: 'permissionRoles' }),
}));


