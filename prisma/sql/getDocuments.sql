-- @param {String} $1:userId The ID of the current user
SELECT 
  Document.id, Document.title, Document.updatedAt
FROM
  Document
WHERE 
  aclId IN (SELECT aclId FROM user_read_acls WHERE userId = $1)
ORDER BY
  Document.title ASC