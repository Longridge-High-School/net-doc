-- @param {String} $1:userRole The role of the current user
-- @param {String} $2:userId The ID of the current user
-- @param {String} $3:fieldId The ID of the date field
SELECT Entry.id, Value.value, Asset.slug, Asset.icon, NameValue.value as name FROM Value 
  INNER JOIN Entry ON Entry.id = Value.entryId
  INNER JOIN Asset ON Asset.id = Entry.assetId
  INNER JOIN Value NameValue ON NameValue.entryId = Entry.id AND NameValue.fieldId = Asset.nameFieldId
WHERE 
  Value.fieldId = $3
  AND 
  date(Value.value) > date('now')
  AND
  Entry.aclId IN (SELECT aclId FROM ACLEntry 
  WHERE read = true AND (
    (type = "role" AND target = $1) 
    OR 
    (type = "user" AND target = $2)
    )
  )
ORDER BY
  Value.value ASC
LIMIT 5