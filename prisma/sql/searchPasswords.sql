-- @param {String} $1:query The search query, as `%${query}%`
-- @param {String} $2:userRole The user's role
-- @param {String} $3:userId The users's id
SELECT "🔐" || " " || Password.title as label, "/app/passwords/" || Password.id as link FROM Password
  WHERE 
    (lower(Password.notes) LIKE lower($1) OR Password.title LIKE lower($1))
  AND 
    Password.aclId IN (SELECT aclId FROM ACLEntry 
    WHERE read = true AND (
      (type = "role" AND target = $2) 
      OR 
      (type = "user" AND target = $3)
      )
    )
  ORDER BY Password.title ASC