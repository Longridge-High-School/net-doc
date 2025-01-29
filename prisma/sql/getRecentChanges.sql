-- @param {String} $1:userRole The role of the current user
-- @param {String} $2:userId The ID of the current user
SELECT
  Entry.id, Entry.updatedAt, Value.value as name, Asset.slug, Asset.icon
FROM Entry 
    INNER JOIN Value value ON fieldId = (SELECT nameFieldId from Asset WHERE Asset.id = Entry.assetId) AND entryId = Entry.id
    INNER JOIN Asset ON Asset.id = Entry.assetId
WHERE
  deleted = false 
  AND
  Entry.aclId IN (SELECT aclId FROM ACLEntry 
    WHERE read = true AND (
      (type = "role" AND target = $1) 
      OR 
      (type = "user" AND target = $2)
      )
    )
ORDER BY 
  Entry.updatedAt DESC
LIMIT 5