-- @param {String} $1:userRole The role of the current user
-- @param {String} $2:userId The ID of the current user
SELECT 
Process.id, Process.title, Process.updatedAt, Process.complete
FROM
Process
WHERE 
aclId IN (SELECT aclId FROM ACLEntry 
  WHERE read = true AND (
    (type = "role" AND target = $1) 
    OR 
    (type = "user" AND target = $2)
    )
  )
AND
complete = false
ORDER BY
Process.complete ASC, Process.title ASC