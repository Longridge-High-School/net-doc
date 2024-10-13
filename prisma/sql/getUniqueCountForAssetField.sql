-- @param {String} $1:entryId The ID of the entry being checked
-- @param {String} $2:fieldId The ID of the field being checked
-- @param {String} $3:value The value to be checked
SELECT
	COUNT(*)
FROM
	Value
WHERE
	Value.entryId IN (SELECT Entry.id FROM Entry WHERE Entry.assetId = (SELECT Asset.id FROM Asset WHERE Asset.id = (SELECT Entry.assetId FROM Entry WHERE Entry.id = $1)))
AND
	Value.fieldId = $2
AND
	Value.value = $3