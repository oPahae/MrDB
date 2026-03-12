INSERT INTO ratingep (userID, episodeID, rating)
SELECT 3, id, 1
FROM episodes
WHERE title IN ("Breaking Bad", "Game of Thrones", "Dexter", "Prison Break")
ON DUPLICATE KEY UPDATE rating = 10;
UPDATE episodes e
JOIN (
    SELECT episodeID, ROUND(AVG(rating),1) AS avg_rating
    FROM ratingep
    GROUP BY episodeID
) r ON r.episodeID = e.id
SET e.rating = r.avg_rating;
UPDATE series s
JOIN (
    SELECT ss.serieID, ROUND(AVG(e.rating),1) AS avg_rating
    FROM seasons ss
    JOIN episodes e ON e.seasonID = ss.id
    GROUP BY ss.serieID
) t ON t.serieID = s.id
SET s.rating = t.avg_rating;