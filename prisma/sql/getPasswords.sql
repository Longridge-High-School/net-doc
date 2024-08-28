-- @param {String} $1:userRole The role of the current user
-- @param {String} $2:userId The ID of the current user
SELECT 
	Password.id, Password.title, Password.username 
FROM
	Password
WHERE 
	aclId IN (SELECT aclId FROM ACLEntry 
		WHERE read = true AND (
			(type = "role" AND target = $1) 
			OR 
			(type = "user" AND target = $2)
			)
		)
ORDER BY
	Password.title ASC