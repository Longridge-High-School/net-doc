-- @param {String} $1:assetSlug The Asset's slug
-- @param {String} $2:assetId The Asset's ID
-- @param {String} $3:userRole The users role
-- @param {String} $4:userId The users ID
SELECT read, write, "delete" FROM ACLEntry WHERE aclId = (SELECT aclId FROM Asset WHERE slug = $1 OR id = $2) AND (target = $3 OR target = $4)