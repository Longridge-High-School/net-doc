-- @param {String} $1:userId The ID of the current user
SELECT RecentItems.id as RecentItemId, RecentItems.target, RecentItems.targetId, RecentItems.updatedAt,
    CASE RecentItems.target
      WHEN "documents" THEN (SELECT Document.title FROM Document WHERE Document.id = RecentItems.targetId)
      WHEN "passwords" THEN (SELECT Password.title FROM Password WHERE Password.id = RecentItems.targetId)
      WHEN "process" THEN (SELECT Process.title FROM Process WHERE Process.id = RecentItems.targetId)
      ELSE (SELECT Value.value FROM Value WHERE Value.fieldId = (SELECT Asset.nameFieldId FROM Asset WHERE Asset.slug = RecentItems.target) AND Value.entryId = RecentItems.targetId)
    END AS name,
    CASE RecentItems.target
      WHEN "documents" THEN "📰"
      WHEN "passwords" THEN "🔐"
      WHEN "process" THEN "✔️"
      ELSE (SELECT Asset.icon FROM Asset WHERE Asset.slug = RecentItems.target)
    END AS icon
  FROM RecentItems WHERE RecentItems.userId = $1 ORDER BY RecentItems.updatedAt DESC LIMIT 5