-- @param {String} $1:processId The ID of the Process
-- @param {String} $2:userId The ID of the current user
SELECT
	Process.id,
	(
		SELECT 
			COUNT(*)
		FROM 
			user_read_acls
		INNER JOIN Process ON Process.id = $1
		WHERE 
			userId = $2 
			AND 
			user_read_acls.aclId = Process.aclId
	) as readCount,
	(
		SELECT 
			COUNT(*)
		FROM 
			user_write_acls
		INNER JOIN Process ON Process.id = $1
		WHERE 
			userId = $2
			AND 
			user_write_acls.aclId = Process.aclId
	) as writeCount,
	(
		SELECT 
			COUNT(*)
		FROM 
			user_delete_acls
		INNER JOIN Process ON Process.id = $1
		WHERE 
			userId = $2
			AND 
			user_delete_acls.aclId = Process.aclId
	) as deleteCount,
	(
		SELECT
			COUNT(*)
		FROM
			GroupMembership
		INNER JOIN Process ON Process.id = $1
		WHERE
			GroupMembership.groupId = Process.groupId
			AND
			GroupMembership.userId = $2
	) as groupCount
FROM
	Process
WHERE
	Process.id = $1