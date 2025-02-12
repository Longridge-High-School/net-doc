/*
  Warnings:

  - You are about to drop the `ACLArgs` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "ACLArgs";
PRAGMA foreign_keys=on;

-- Recreate views
DROP VIEW IF EXISTS user_read_acls;
CREATE VIEW user_read_acls 
AS
SELECT 
	User.id as userId,
	User.role as userRole,
	ACLEntry.aclId as aclId
FROM
	User
INNER JOIN 	ACLEntry ON ACLEntry.read = true
WHERE
	ACLEntry.target = userRole
	OR
	ACLEntry.target = userId;


DROP VIEW IF EXISTS user_write_acls;
CREATE VIEW user_write_acls 
AS
SELECT 
	User.id as userId,
	User.role as userRole,
	ACLEntry.aclId as aclId
FROM
	User
INNER JOIN 	ACLEntry ON ACLEntry.write = true
WHERE
	ACLEntry.target = userRole
	OR
	ACLEntry.target = userId;

DROP VIEW IF EXISTS user_delete_acls;
CREATE VIEW user_delete_acls 
AS
SELECT 
	User.id as userId,
	User.role as userRole,
	ACLEntry.aclId as aclId
FROM
	User
INNER JOIN 	ACLEntry ON ACLEntry."delete" = true
WHERE
	ACLEntry.target = userRole
	OR
	ACLEntry.target = userId;