-- @param {String} $1:query The search query, as `%${query}%`
-- @param {String} $2:userId The users's id
SELECT "🔐" || " " || Password.title as label, "/app/passwords/" || Password.id as link FROM Password
  WHERE 
    (lower(Password.notes) LIKE lower($1) OR Password.title LIKE lower($1))
  AND 
    Password.aclId IN (SELECT aclId FROM user_read_acls WHERE userId = $2)
  ORDER BY Password.title ASC