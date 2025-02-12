-- @param {String} $1:fieldId The ID of the date field
-- @param {String} $2:userId The ID of the current user
SELECT Entry.id, Value.value, Asset.slug, Asset.icon, NameValue.value as name FROM Value 
  INNER JOIN Entry ON Entry.id = Value.entryId
  INNER JOIN Asset ON Asset.id = Entry.assetId
  INNER JOIN Value NameValue ON NameValue.entryId = Entry.id AND NameValue.fieldId = Asset.nameFieldId
WHERE 
  Value.fieldId = $1
  AND 
  date(Value.value) > date('now')
  AND
  Entry.aclId IN (SELECT aclId FROM user_read_acls WHERE userId = $2)
ORDER BY
  Value.value ASC
LIMIT 5