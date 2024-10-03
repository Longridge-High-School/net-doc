-- @param {String} $1:userId The ID of the current user
SELECT Pin.id as pinId, Pin.target, Pin.targetId,
    CASE Pin.target
      WHEN "documents" THEN (SELECT Document.title FROM Document WHERE Document.id = Pin.targetId)
      WHEN "passwords" THEN (SELECT Password.title FROM Password WHERE Password.id = Pin.targetId)
      ELSE (SELECT Value.value FROM Value WHERE Value.fieldId = (SELECT Asset.nameFieldId FROM Asset WHERE Asset.slug = Pin.target) AND Value.entryId = Pin.targetId)
    END AS name,
    CASE Pin.target
      WHEN "documents" THEN "📰"
      WHEN "passwords" THEN "🔐"
      ELSE (SELECT Asset.icon FROM Asset WHERE Asset.slug = Pin.target)
    END AS icon
  FROM Pin WHERE Pin.userId = $1 ORDER BY name ASC