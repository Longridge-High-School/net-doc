-- @param {String} $1:passwordId The ID of the Password
-- @param {String} $2:userId The ID of the current user
SELECT
	Password.id,
	(
		SELECT 
			COUNT(*)
		FROM 
			user_read_acls
		INNER JOIN Password ON Password.id = $1
		WHERE 
			userId = $2 
			AND 
			user_read_acls.aclId = Password.aclId
	) as readCount,
	(
		SELECT 
			COUNT(*)
		FROM 
			user_write_acls
		INNER JOIN Password ON Password.id = $1
		WHERE 
			userId = $2
			AND 
			user_write_acls.aclId = Password.aclId
	) as writeCount,
	(
		SELECT 
			COUNT(*)
		FROM 
			user_delete_acls
		INNER JOIN Password ON Password.id = $1
		WHERE 
			userId = $2
			AND 
			user_delete_acls.aclId = Password.aclId
	) as deleteCount,
	(
		SELECT
			COUNT(*)
		FROM
			GroupMembership
		INNER JOIN Password ON Password.id = $1
		WHERE
			GroupMembership.groupId = Password.groupId
			AND
			GroupMembership.userId = $2
	) as groupCount
FROM
	Password
WHERE
	Password.id = $1