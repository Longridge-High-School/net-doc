-- @param {String} $1:userId The ID of the current user
WITH ACLArgs AS (SELECT id, role FROM User WHERE id = $1) 
SELECT 
  Document.id, Document.title, Document.updatedAt
FROM
  Document
WHERE 
  aclId IN user_read_acls
ORDER BY
  Document.title ASC