-- @param {String} $1:entryId The entry to check
-- @param {String} $2:userRole The role of the user
-- @param {String} $3:userId The id of the user
SELECT read, write, "delete" FROM ACLEntry WHERE aclId = (SELECT aclId FROM Entry WHERE id = $1) AND (target = $2 OR target = $3)