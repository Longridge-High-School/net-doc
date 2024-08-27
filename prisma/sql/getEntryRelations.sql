-- @param {String} $1:entryId The ID of the entry to collect relations for
-- @param {String} $2:userRole The role of the current user
-- @param {String} $3:userId The ID of the current user
SELECT Entry.id, Value.value, Asset.icon, Asset.slug FROM Entry 
  INNER JOIN Value value ON fieldId = (SELECT nameFieldId FROM Asset WHERE Asset.id = entry.assetId) AND entryId = Entry.id 
  INNER JOIN Asset ON Entry.assetId = Asset.id
  WHERE 
    Entry.id IN (SELECT entryId FROM Value WHERE value LIKE $1)
  AND 
    deleted = false 
  AND 
    Entry.aclId IN (SELECT aclId FROM ACLEntry 
		WHERE read = true AND (
			(type = "role" AND target = $2) 
			OR 
			(type = "user" AND target = $3)
			)
		)