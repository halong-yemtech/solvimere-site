import type { Access, FieldAccess } from "payload";

export type Role = "admin" | "user";

/** True for a logged-in user with the admin role. Works with any user-like object. */
export const isAdminUser = (user: unknown): boolean =>
  Boolean(user && typeof user === "object" && (user as { role?: string }).role === "admin");

/** Anyone (including the public site and REST API) may read. */
export const anyone: Access = () => true;

/** Only admins. Regular (non-admin) accounts can log in but cannot change anything. */
export const isAdmin: Access = ({ req: { user } }) => isAdminUser(user);

/** Field-level variant of isAdmin. */
export const isAdminField: FieldAccess = ({ req: { user } }) => isAdminUser(user);

/** Visitors and non-admins see published documents only; admins see drafts too. */
export const publishedOrAdmin: Access = ({ req: { user } }) =>
  isAdminUser(user) ? true : { _status: { equals: "published" } };

/** Admins see every user; other accounts only themselves. */
export const adminOrSelf: Access = ({ req: { user } }) =>
  isAdminUser(user) ? true : user ? { id: { equals: user.id } } : false;
