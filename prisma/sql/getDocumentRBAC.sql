-- @param {String} $1:documentId The ID of the document
-- @param {String} $2:userId The ID of the current user
SELECT
	Document.id,
	(
		SELECT 
			COUNT(*)
		FROM 
			user_read_acls
		INNER JOIN Document ON Document.id = $1
		WHERE 
			userId = $2 
			AND 
			user_read_acls.aclId = Document.aclId
	) as readCount,
	(
		SELECT 
			COUNT(*)
		FROM 
			user_write_acls
		INNER JOIN Document ON Document.id = $1
		WHERE 
			userId = $2
			AND 
			user_write_acls.aclId = Document.aclId
	) as writeCount,
	(
		SELECT 
			COUNT(*)
		FROM 
			user_delete_acls
		INNER JOIN Document ON Document.id = $1
		WHERE 
			userId = $2
			AND 
			user_delete_acls.aclId = Document.aclId
	) as deleteCount,
	(
		SELECT
			COUNT(*)
		FROM
			GroupMembership
		INNER JOIN Document ON Document.id = $1
		WHERE
			GroupMembership.groupId = Document.groupId
			AND
			GroupMembership.userId = $2
	) as groupCount
FROM
	Document
WHERE
	Document.id = $1