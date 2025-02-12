-- @param {String} $1:userId The ID of the current user
SELECT 
Process.id, Process.title, Process.updatedAt, Process.complete
FROM
Process
WHERE 
aclId IN (SELECT aclId FROM user_read_acls WHERE userId = $1)
ORDER BY
Process.complete ASC, Process.title ASC