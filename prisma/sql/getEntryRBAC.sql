-- @param {String} $1:entryId The ID of the Entry
-- @param {String} $2:userId The ID of the current user
SELECT
	Entry.id,
	(
		SELECT 
			COUNT(*)
		FROM 
			user_read_acls
		INNER JOIN Entry ON Entry.id = $1
		WHERE 
			userId = $2 
			AND 
			user_read_acls.aclId = Entry.aclId
	) as readCount,
	(
		SELECT 
			COUNT(*)
		FROM 
			user_write_acls
		INNER JOIN Entry ON Entry.id = $1
		WHERE 
			userId = $2
			AND 
			user_write_acls.aclId = Entry.aclId
	) as writeCount,
	(
		SELECT 
			COUNT(*)
		FROM 
			user_delete_acls
		INNER JOIN Entry ON Entry.id = $1
		WHERE 
			userId = $2
			AND 
			user_delete_acls.aclId = Entry.aclId
	) as deleteCount,
	(
		SELECT
			COUNT(*)
		FROM
			GroupMembership
		INNER JOIN Entry ON Entry.id = $1
		WHERE
			GroupMembership.groupId = Entry.groupId
			AND
			GroupMembership.userId = $2
	) as groupCount
FROM
	Entry
WHERE
	Entry.id = $1