-- @param {String} $1:userRole The role of the current user
-- @param {String} $2:userId The ID of the current user
-- @param {String} $3:entryId
SELECT 
	Password.id, Password.title
FROM
	Password
WHERE 
  id IN (SELECT passwordId FROM EntryPassword WHERE EntryPassword.entryId = $3)
  AND
	aclId IN (SELECT aclId FROM ACLEntry 
		WHERE read = true AND (
			(type = "role" AND target = $1) 
			OR 
			(type = "user" AND target = $2)
			)
		)
ORDER BY
	Password.title ASC