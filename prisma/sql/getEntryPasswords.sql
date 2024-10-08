-- @param {String} $1:entryId The ID of the entry
-- @param {String} $2:userRole The role of the current user
-- @param {String} $3:userId The ID of the current user
SELECT 
	Password.id, Password.title
FROM
	Password
WHERE 
  id IN (SELECT passwordId FROM EntryPassword WHERE EntryPassword.entryId = $1)
  AND
	aclId IN (SELECT aclId FROM ACLEntry 
		WHERE read = true AND (
			(type = "role" AND target = $2) 
			OR 
			(type = "user" AND target = $3)
			)
		)
ORDER BY
	Password.title ASC