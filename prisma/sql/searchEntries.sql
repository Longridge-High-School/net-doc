-- @param {String} $1:searchString The search string, as `%${query}%`
-- @param {String} $2:userRole The user's role
-- @param {String} $3:userId The user's id
SELECT Asset.icon || " " || NameValue.value as label, "/app/" || Asset.slug || "/" || Entry.id as link FROM Value 
  INNER JOIN Entry ON Entry.id = Value.entryId
  INNER JOIN Asset ON Asset.id = Entry.assetId
  INNER JOIN Value NameValue ON NameValue.entryId = Entry.id AND NameValue.fieldId = Asset.nameFieldId
  WHERE 
	lower(Value.value) LIKE lower($1)
  AND
	Entry.aclId IN (SELECT aclId FROM ACLEntry 
	WHERE read = true AND (
		(type = "role" AND target = $2) 
		OR 
		(type = "user" AND target = $3)
		)
	)
  GROUP BY Value.entryId
  ORDER BY label ASC