-- @param {String} $1:userId The ID of the current user
SELECT
  Entry.id, Entry.updatedAt, Value.value as name, Asset.slug, Asset.icon
FROM Entry 
    INNER JOIN Value value ON fieldId = (SELECT nameFieldId from Asset WHERE Asset.id = Entry.assetId) AND entryId = Entry.id
    INNER JOIN Asset ON Asset.id = Entry.assetId
WHERE
  deleted = false 
  AND
  Entry.aclId IN (SELECT aclId FROM user_read_acls WHERE userId = $1)
ORDER BY 
  Entry.updatedAt DESC
LIMIT 5