-- @param {String} $1:entryId The ID of the entry to collect revisions for
SELECT ValueHistory.id, ValueHistory.createdAt, ValueHistory.changeNote, Field.name as fieldName, User.name as userName FROM ValueHistory
  INNER JOIN Value on Value.id = ValueHistory.valueId
  INNER JOIN Field on Field.id = Value.fieldId
  INNER JOIN User on User.id = ValueHistory.editedById
  WHERE Value.entryId = $1
  ORDER BY ValueHistory.createdAt DESC