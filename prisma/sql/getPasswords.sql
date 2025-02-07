-- @param {String} $1:userId The ID of the current user
SELECT 
	Password.id, Password.title, Password.username 
FROM
	Password
WHERE 
	aclId IN (SELECT aclId FROM user_read_acls WHERE userId = $1)
ORDER BY
	Password.title ASC