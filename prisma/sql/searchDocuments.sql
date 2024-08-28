-- @param {String} $1:query The search query, as `%${query}%`
-- @param {String} $2:userRole The user's role
-- @param {String} $3:userId The users's id
SELECT "📰" || " " || Document.title as label, "/app/documents/" || Document.id as link FROM Document
  WHERE 
    (lower(Document.body) LIKE lower($1) OR lower(Document.title) LIKE lower($1))
  AND
    Document.aclId IN (SELECT aclId FROM ACLEntry 
      WHERE read = true AND (
        (type = "role" AND target = $2) 
        OR 
        (type = "user" AND target = $3)
        )
      )
  ORDER BY Document.title ASC