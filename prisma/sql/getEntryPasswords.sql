-- @param {String} $1:entryId The ID of the entry
-- @param {String} $2:userId The ID of the current user
SELECT 
	Password.id, Password.title
FROM
	Password
WHERE 
  id IN (SELECT passwordId FROM EntryPassword WHERE EntryPassword.entryId = $1)
  AND
	aclId IN (SELECT aclId FROM user_read_acls WHERE userId = $2)
ORDER BY
	Password.title ASC