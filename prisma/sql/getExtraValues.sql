-- @param {String} $1:assetSlug The slug of the asset
-- @param {String} $2:userId The users id
SELECT Value.id, Value.value, Value.entryId || '/' || Value.fieldId as lookup, Field.type  FROM Value 
    INNER JOIN Entry ON Entry.id = Value.entryId
    INNER JOIN Asset ON Asset.id = Entry.assetId
    INNER JOIN AssetField ON AssetField.assetId = Asset.id AND AssetField.fieldId = Value.fieldId
    INNER JOIN Field ON Field.id = Value.fieldId
  WHERE 
    ((AssetField.displayOnTable = true) OR (Value.fieldId = Asset.nameFieldId))
    AND
    Value.entryId IN (SELECT Entry.id FROM Entry
      WHERE 
        assetId = (SELECT id from Asset WHERE slug = $1) 
        AND
        deleted = false
        AND
        aclId IN (SELECT aclId FROM user_read_acls WHERE userId = $2)
        AND
        groupId IN (SELECT groupId FROM GroupMembership WHERE userId = $2)
    )