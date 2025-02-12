-- @param {String} $1:query The search query, as `%${query}%`
-- @param {String} $2:userId The users's id
SELECT "📰" || " " || Document.title as label, "/app/documents/" || Document.id as link FROM Document
  WHERE 
    (lower(Document.body) LIKE lower($1) OR lower(Document.title) LIKE lower($1))
  AND
    Document.aclId IN (SELECT aclId FROM user_read_acls WHERE userId = $2)
  ORDER BY Document.title ASC