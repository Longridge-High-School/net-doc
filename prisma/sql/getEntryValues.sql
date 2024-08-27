-- @param {String} $1:entryId The ID of the entry to collect values for
SELECT Value.id, Value.value, AssetField."order", Field.type, Field.meta, Value.fieldId, Field.name as fieldName FROM Value
  INNER JOIN Entry ON Entry.Id = Value.entryId
  INNER JOIN Asset on Asset.Id = Entry.assetId
  INNER JOIN AssetField on AssetField.assetId = Asset.id AND AssetField.fieldId = Value.fieldId
  INNER JOIN Field on Field.id = Value.fieldId
  WHERE entryId = $1
  ORDER BY AssetField."order" ASC