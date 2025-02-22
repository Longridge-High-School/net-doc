-- @param {String} $1:assetSlug The slug of the asset
-- @param {String} $2:userId The users id
SELECT Entry.id, Value.value as name FROM Entry 
  INNER JOIN Value ON Value.fieldId = (SELECT nameFieldId from Asset WHERE id = Entry.assetId) AND entryId = entry.id
  WHERE 
	assetId = (SELECT id from Asset WHERE slug = $1) 
	AND
	deleted = false
	AND
	aclId IN (SELECT aclId FROM user_read_acls WHERE userId = $2)
  AND
  groupId IN (SELECT groupId FROM GroupMembership WHERE userId = $2)