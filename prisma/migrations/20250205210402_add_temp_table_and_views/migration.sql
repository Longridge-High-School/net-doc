-- CreateTable
CREATE TABLE "ACLArgs" (
    "id" TEXT NOT NULL,
    "role" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "ACLArgs_id_key" ON "ACLArgs"("id");

-- Create Views
CREATE VIEW user_read_acls 
AS
SELECT aclId FROM ACLEntry 
    WHERE read = true AND (
        (type = "role" AND target = (SELECT role FROM ACLArgs))
    OR 
        (type = "user" AND target = (SELECT id FROM ACLArgs))
    );

CREATE VIEW user_write_acls 
AS
SELECT aclId FROM ACLEntry 
    WHERE write = true AND (
        (type = "role" AND target = (SELECT role FROM ACLArgs))
    OR 
        (type = "user" AND target = (SELECT id FROM ACLArgs))
    );

CREATE VIEW user_delete_acls 
AS
SELECT aclId FROM ACLEntry 
    WHERE "delete" = true AND (
        (type = "role" AND target = (SELECT role FROM ACLArgs))
    OR 
        (type = "user" AND target = (SELECT id FROM ACLArgs))
    );