-- Insertion de l'anime
INSERT INTO series (title, img, trailer, descr, start, end, maker, rating)
VALUES (
    'Attack on Titan',
    'https://m.media-amazon.com/images/I/81O9KQlE0SL._AC_UF1000,1000_QL80_.jpg',
    'https://www.youtube.com/watch?v=MGRm4IzK1SQ',
    'Dans un monde où l\'humanité vit entourée de murs gigantesques pour se protéger des Titans, des créatures géantes qui dévorent les humains, le jeune Eren Yeager rêve de rejoindre les rangs de l\'armée pour venger la destruction de son foyer et la mort de sa mère.',
    '2013-04-07',
    '2023-11-04',
    'Wit Studio (S1-S3), MAPPA (S4)',
    9.1
);

-- Récupération de l'ID de l'anime inséré
SET @serie_id = LAST_INSERT_ID();

-- Insertion de la saison 1
INSERT INTO seasons (serieID, title)
VALUES (@serie_id, 'Saison 1');

-- Récupération de l'ID de la saison 1
SET @season1_id = LAST_INSERT_ID();

-- Insertion des épisodes de la saison 1
INSERT INTO episodes (seasonID, number, title, img, rating)
VALUES
(@season1_id, 1, 'À toi, dans 2000 ans : L\'assaut des Titans', 'https://i.ytimg.com/vi/5fKm3pJQJl0/maxresdefault.jpg', 8.9),
(@season1_id, 2, 'Ce jour-là : La chute de Shiganshina, partie 1', 'https://i.ytimg.com/vi/5fKm3pJQJl0/maxresdefault.jpg', 8.7),
(@season1_id, 3, 'Ce jour-là : La chute de Shiganshina, partie 2', 'https://i.ytimg.com/vi/5fKm3pJQJl0/maxresdefault.jpg', 9.0),
(@season1_id, 4, 'La première bataille : Le combat pour Trost, partie 1', 'https://i.ytimg.com/vi/5fKm3pJQJl0/maxresdefault.jpg', 9.1),
(@season1_id, 5, 'La première bataille : Le combat pour Trost, partie 2', 'https://i.ytimg.com/vi/5fKm3pJQJl0/maxresdefault.jpg', 9.2),
(@season1_id, 6, 'Le monde que la fille aux cheveux noirs m\'a montré', 'https://i.ytimg.com/vi/5fKm3pJQJl0/maxresdefault.jpg', 8.8),
(@season1_id, 7, 'Petite lame', 'https://i.ytimg.com/vi/5fKm3pJQJl0/maxresdefault.jpg', 8.9),
(@season1_id, 8, 'Je peux entendre son cœur battre', 'https://i.ytimg.com/vi/5fKm3pJQJl0/maxresdefault.jpg', 9.0),
(@season1_id, 9, 'Où est la main gauche ?', 'https://i.ytimg.com/vi/5fKm3pJQJl0/maxresdefault.jpg', 9.1),
(@season1_id, 10, 'Réponse : La réponse à tout', 'https://i.ytimg.com/vi/5fKm3pJQJl0/maxresdefault.jpg', 9.3);

-- Insertion de la saison 2
INSERT INTO seasons (serieID, title)
VALUES (@serie_id, 'Saison 2');

-- Récupération de l'ID de la saison 2
SET @season2_id = LAST_INSERT_ID();

-- Insertion des épisodes de la saison 2
INSERT INTO episodes (seasonID, number, title, img, rating)
VALUES
(@season2_id, 1, 'Beast Titan', 'https://i.ytimg.com/vi/5fKm3pJQJl0/maxresdefault.jpg', 9.0),
(@season2_id, 2, 'Je suis chez moi', 'https://i.ytimg.com/vi/5fKm3pJQJl0/maxresdefault.jpg', 9.1),
(@season2_id, 3, 'Sud-ouest', 'https://i.ytimg.com/vi/5fKm3pJQJl0/maxresdefault.jpg', 8.9),
(@season2_id, 4, 'Soldat', 'https://i.ytimg.com/vi/5fKm3pJQJl0/maxresdefault.jpg', 9.0),
(@season2_id, 5, 'Histoire', 'https://i.ytimg.com/vi/5fKm3pJQJl0/maxresdefault.jpg', 9.2),
(@season2_id, 6, 'Guerre', 'https://i.ytimg.com/vi/5fKm3pJQJl0/maxresdefault.jpg', 9.1),
(@season2_id, 7, 'Ennemi commun', 'https://i.ytimg.com/vi/5fKm3pJQJl0/maxresdefault.jpg', 9.0),
(@season2_id, 8, 'Le chasseur', 'https://i.ytimg.com/vi/5fKm3pJQJl0/maxresdefault.jpg', 9.3),
(@season2_id, 9, 'Ouverture', 'https://i.ytimg.com/vi/5fKm3pJQJl0/maxresdefault.jpg', 9.2),
(@season2_id, 10, 'Les enfants', 'https://i.ytimg.com/vi/5fKm3pJQJl0/maxresdefault.jpg', 9.4);

-- Insertion de l'anime
INSERT INTO series (title, img, trailer, descr, start, end, maker, rating)
VALUES (
    'Demon Slayer: Kimetsu no Yaiba',
    'https://m.media-amazon.com/images/I/91OwKxYl1HL._AC_UF1000,1000_QL80_.jpg',
    'https://www.youtube.com/watch?v=L-kjj9Ymma8',
    'Tanjirou Kamado, un jeune garçon dont la famille a été massacrée par des démons, devient un chasseur de démons pour venger sa famille et trouver un remède pour sa sœur Nezuko, transformée en démon mais conservant encore des traces d\'humanité.',
    '2019-04-06',
    '2024-06-16',
    'Ufotable',
    8.9
);

-- Récupération de l'ID de l'anime inséré
SET @serie_id = LAST_INSERT_ID();

-- Insertion de la saison 1
INSERT INTO seasons (serieID, title)
VALUES (@serie_id, 'Saison 1');

-- Récupération de l'ID de la saison 1
SET @season1_id = LAST_INSERT_ID();

-- Insertion des épisodes de la saison 1
INSERT INTO episodes (seasonID, number, title, img, rating)
VALUES
(@season1_id, 1, 'La cruauté', 'https://i.ytimg.com/vi/8jJXk9WQZ1o/maxresdefault.jpg', 8.7),
(@season1_id, 2, 'Formation', 'https://i.ytimg.com/vi/8jJXk9WQZ1o/maxresdefault.jpg', 8.8),
(@season1_id, 3, 'Sabito et Makomo', 'https://i.ytimg.com/vi/8jJXk9WQZ1o/maxresdefault.jpg', 8.9),
(@season1_id, 4, 'La sélection finale', 'https://i.ytimg.com/vi/8jJXk9WQZ1o/maxresdefault.jpg', 9.0),
(@season1_id, 5, 'Mon frère', 'https://i.ytimg.com/vi/8jJXk9WQZ1o/maxresdefault.jpg', 9.1),
(@season1_id, 6, 'La mission de divertissement', 'https://i.ytimg.com/vi/8jJXk9WQZ1o/maxresdefault.jpg', 8.9),
(@season1_id, 7, 'Muzan Kibutsuji', 'https://i.ytimg.com/vi/8jJXk9WQZ1o/maxresdefault.jpg', 9.2),
(@season1_id, 8, 'Le sabre de Nichirin', 'https://i.ytimg.com/vi/8jJXk9WQZ1o/maxresdefault.jpg', 9.0),
(@season1_id, 9, 'Temari et Kayo', 'https://i.ytimg.com/vi/8jJXk9WQZ1o/maxresdefault.jpg', 9.1),
(@season1_id, 10, 'Ensemble pour toujours', 'https://i.ytimg.com/vi/8jJXk9WQZ1o/maxresdefault.jpg', 9.3);

-- Insertion de la saison 2 (Arc du Quartier des Plaisirs)
INSERT INTO seasons (serieID, title)
VALUES (@serie_id, 'Saison 2 : Quartier des Plaisirs');

-- Récupération de l'ID de la saison 2
SET @season2_id = LAST_INSERT_ID();

-- Insertion des épisodes de la saison 2
INSERT INTO episodes (seasonID, number, title, img, rating)
VALUES
(@season2_id, 1, 'Un lien indestructible', 'https://i.ytimg.com/vi/8jJXk9WQZ1o/maxresdefault.jpg', 9.2),
(@season2_id, 2, 'Les flammes de la passion', 'https://i.ytimg.com/vi/8jJXk9WQZ1o/maxresdefault.jpg', 9.1),
(@season2_id, 3, 'Ce qu\'on ne peut pas abandonner', 'https://i.ytimg.com/vi/8jJXk9WQZ1o/maxresdefault.jpg', 9.3),
(@season2_id, 4, 'La voix de quelqu\'un d\'important', 'https://i.ytimg.com/vi/8jJXk9WQZ1o/maxresdefault.jpg', 9.0),
(@season2_id, 5, 'Je veux que tu sois heureux', 'https://i.ytimg.com/vi/8jJXk9WQZ1o/maxresdefault.jpg', 9.4),
(@season2_id, 6, 'La maison de la lumière', 'https://i.ytimg.com/vi/8jJXk9WQZ1o/maxresdefault.jpg', 9.2),
(@season2_id, 7, 'La transformation', 'https://i.ytimg.com/vi/8jJXk9WQZ1o/maxresdefault.jpg', 9.1),
(@season2_id, 8, 'Le combat acharné', 'https://i.ytimg.com/vi/8jJXk9WQZ1o/maxresdefault.jpg', 9.3),
(@season2_id, 9, 'Jamais plus', 'https://i.ytimg.com/vi/8jJXk9WQZ1o/maxresdefault.jpg', 9.4),
(@season2_id, 10, 'Le lien qui nous unit', 'https://i.ytimg.com/vi/8jJXk9WQZ1o/maxresdefault.jpg', 9.5);

-- Insertion de l'anime
INSERT INTO series (title, img, trailer, descr, start, end, maker, rating)
VALUES (
    'My Hero Academia',
    'https://m.media-amazon.com/images/I/91E4oZqo+SL._AC_UF1000,1000_QL80_.jpg',
    'https://www.youtube.com/watch?v=0VlLMVW8l1I',
    'Dans un monde où 80% de la population possède des super-pouvoirs appelés "Alters", Izuku Midoriya, un jeune garçon sans pouvoir, rêve de devenir le plus grand héros du monde. Après avoir hérité du pouvoir du légendaire All Might, il intègre l\'académie U.A. pour apprendre à maîtriser ses capacités et devenir un héros professionnel.',
    '2016-04-03',
    NULL,
    'Bones',
    8.4
);

-- Récupération de l'ID de l'anime inséré
SET @serie_id = LAST_INSERT_ID();

-- Insertion de la saison 1
INSERT INTO seasons (serieID, title)
VALUES (@serie_id, 'Saison 1');

-- Récupération de l'ID de la saison 1
SET @season1_id = LAST_INSERT_ID();

-- Insertion des épisodes de la saison 1
INSERT INTO episodes (seasonID, number, title, img, rating)
VALUES
(@season1_id, 1, 'Izuku Midoriya : L\'origine', 'https://i.ytimg.com/vi/0VlLMVW8l1I/maxresdefault.jpg', 8.5),
(@season1_id, 2, 'Ce que signifie être un héros', 'https://i.ytimg.com/vi/0VlLMVW8l1I/maxresdefault.jpg', 8.3),
(@season1_id, 3, 'Le pouvoir de l\'amitié', 'https://i.ytimg.com/vi/0VlLMVW8l1I/maxresdefault.jpg', 8.6),
(@season1_id, 4, 'Le début de la fin', 'https://i.ytimg.com/vi/0VlLMVW8l1I/maxresdefault.jpg', 8.4),
(@season1_id, 5, 'Ce que j\'ai hérité', 'https://i.ytimg.com/vi/0VlLMVW8l1I/maxresdefault.jpg', 8.7),
(@season1_id, 6, 'Le garçon en vert', 'https://i.ytimg.com/vi/0VlLMVW8l1I/maxresdefault.jpg', 8.5),
(@season1_id, 7, 'Deku vs. Kacchan', 'https://i.ytimg.com/vi/0VlLMVW8l1I/maxresdefault.jpg', 8.8),
(@season1_id, 8, 'Bakugo\'s Start Line', 'https://i.ytimg.com/vi/0VlLMVW8l1I/maxresdefault.jpg', 8.6),
(@season1_id, 9, 'All Might', 'https://i.ytimg.com/vi/0VlLMVW8l1I/maxresdefault.jpg', 8.9),
(@season1_id, 10, 'Encounter with the Unknown', 'https://i.ytimg.com/vi/0VlLMVW8l1I/maxresdefault.jpg', 8.7);

-- Insertion de la saison 2
INSERT INTO seasons (serieID, title)
VALUES (@serie_id, 'Saison 2');

-- Récupération de l'ID de la saison 2
SET @season2_id = LAST_INSERT_ID();

-- Insertion des épisodes de la saison 2
INSERT INTO episodes (seasonID, number, title, img, rating)
VALUES
(@season2_id, 1, 'Game Over', 'https://i.ytimg.com/vi/0VlLMVW8l1I/maxresdefault.jpg', 8.6),
(@season2_id, 2, 'Roaring Sports Festival', 'https://i.ytimg.com/vi/0VlLMVW8l1I/maxresdefault.jpg', 8.7),
(@season2_id, 3, 'The Boy Born with Everything', 'https://i.ytimg.com/vi/0VlLMVW8l1I/maxresdefault.jpg', 8.5),
(@season2_id, 4, 'Starting Line', 'https://i.ytimg.com/vi/0VlLMVW8l1I/maxresdefault.jpg', 8.8),
(@season2_id, 5, 'Victory or Defeat', 'https://i.ytimg.com/vi/0VlLMVW8l1I/maxresdefault.jpg', 8.9),
(@season2_id, 6, 'The Name I Inherited', 'https://i.ytimg.com/vi/0VlLMVW8l1I/maxresdefault.jpg', 8.7),
(@season2_id, 7, 'The Secrets They Kept', 'https://i.ytimg.com/vi/0VlLMVW8l1I/maxresdefault.jpg', 8.6),
(@season2_id, 8, 'Midoriya and Shigaraki', 'https://i.ytimg.com/vi/0VlLMVW8l1I/maxresdefault.jpg', 8.8),
(@season2_id, 9, 'Everyone\'s Internships', 'https://i.ytimg.com/vi/0VlLMVW8l1I/maxresdefault.jpg', 8.7),
(@season2_id, 10, 'A Symbol of Peace', 'https://i.ytimg.com/vi/0VlLMVW8l1I/maxresdefault.jpg', 8.9);

-- Insertion de l'anime
INSERT INTO series (title, img, trailer, descr, start, end, maker, rating)
VALUES (
    'One Piece',
    'https://m.media-amazon.com/images/I/81nZQgQX+TL._AC_UF1000,1000_QL80_.jpg',
    'https://www.youtube.com/watch?v=vgmKlyeZQ1E',
    'Monkey D. Luffy, un jeune garçon inspiré par le pirate Shanks, part à l\'aventure pour devenir le Roi des Pirates. Il recrute un équipage varié et affronte de nombreux ennemis tout en cherchant le trésor légendaire, le One Piece, laissé par Gol D. Roger.',
    '1999-10-20',
    NULL,
    'Toei Animation',
    8.6
);

-- Récupération de l'ID de l'anime inséré
SET @serie_id = LAST_INSERT_ID();

-- Insertion de la saison 1 (Arc East Blue)
INSERT INTO seasons (serieID, title)
VALUES (@serie_id, 'Arc East Blue');

-- Récupération de l'ID de la saison 1
SET @season1_id = LAST_INSERT_ID();

-- Insertion des épisodes de la saison 1
INSERT INTO episodes (seasonID, number, title, img, rating)
VALUES
(@season1_id, 1, 'Je ne veux pas mourir ! Le début de la grande aventure de Luffy', 'https://i.ytimg.com/vi/vgmKlyeZQ1E/maxresdefault.jpg', 8.5),
(@season1_id, 2, 'L\'apparition du pirate légendaire ! Un homme aux pouvoirs mystérieux', 'https://i.ytimg.com/vi/vgmKlyeZQ1E/maxresdefault.jpg', 8.4),
(@season1_id, 3, 'Zoro, le chasseur de primes, entre en scène ! Trois épées contre le pirate Luffy', 'https://i.ytimg.com/vi/vgmKlyeZQ1E/maxresdefault.jpg', 8.7),
(@season1_id, 4, 'Le secret du capitaine Ussop ! Le serment fait à son ami', 'https://i.ytimg.com/vi/vgmKlyeZQ1E/maxresdefault.jpg', 8.6),
(@season1_id, 5, 'Le combat désespéré ! Luffy vs. le capitaine Kuro des Mille Mains', 'https://i.ytimg.com/vi/vgmKlyeZQ1E/maxresdefault.jpg', 8.8),
(@season1_id, 6, 'La grande aventure commence ! L\'équipage au chapeau de paille se forme', 'https://i.ytimg.com/vi/vgmKlyeZQ1E/maxresdefault.jpg', 8.7),
(@season1_id, 7, 'Le village détruit ! Le serment de Luffy et Nami', 'https://i.ytimg.com/vi/vgmKlyeZQ1E/maxresdefault.jpg', 8.6),
(@season1_id, 8, 'Je ne perdrai pas ! Le duel entre Zoro et le capitaine des pirates Krieg', 'https://i.ytimg.com/vi/vgmKlyeZQ1E/maxresdefault.jpg', 8.9),
(@season1_id, 9, 'La promesse faite à la mer ! L\'adieu de Luffy et Arlong', 'https://i.ytimg.com/vi/vgmKlyeZQ1E/maxresdefault.jpg', 8.8),
(@season1_id, 10, 'Le rêve de Sanji ! Le cuisinier du restaurant flottant', 'https://i.ytimg.com/vi/vgmKlyeZQ1E/maxresdefault.jpg', 8.7);

-- Insertion de la saison 2 (Arc Alabasta)
INSERT INTO seasons (serieID, title)
VALUES (@serie_id, 'Arc Alabasta');

-- Récupération de l'ID de la saison 2
SET @season2_id = LAST_INSERT_ID();

-- Insertion des épisodes de la saison 2
INSERT INTO episodes (seasonID, number, title, img, rating)
VALUES
(@season2_id, 1, 'La princesse Vivi et l\'organisation secrète Baroque Works', 'https://i.ytimg.com/vi/vgmKlyeZQ1E/maxresdefault.jpg', 8.9),
(@season2_id, 2, 'Le duel entre Luffy et Zoro ! Qui est le plus fort ?', 'https://i.ytimg.com/vi/vgmKlyeZQ1E/maxresdefault.jpg', 8.7),
(@season2_id, 3, 'Le mystère du géant ! Le royaume d\'Alabasta en danger', 'https://i.ytimg.com/vi/vgmKlyeZQ1E/maxresdefault.jpg', 8.8),
(@season2_id, 4, 'L\'infiltration dans Baroque Works ! L\'alliance de Luffy et Smoker', 'https://i.ytimg.com/vi/vgmKlyeZQ1E/maxresdefault.jpg', 8.6),
(@season2_id, 5, 'La bataille décisive commence ! Luffy vs. Crocodile', 'https://i.ytimg.com/vi/vgmKlyeZQ1E/maxresdefault.jpg', 9.0),
(@season2_id, 6, 'Le sacrifice de Vivi ! Le plan pour sauver Alabasta', 'https://i.ytimg.com/vi/vgmKlyeZQ1E/maxresdefault.jpg', 8.9),
(@season2_id, 7, 'La trahison de Miss All Sunday ! Le secret de Nico Robin', 'https://i.ytimg.com/vi/vgmKlyeZQ1E/maxresdefault.jpg', 8.8),
(@season2_id, 8, 'La bataille finale ! Luffy contre Crocodile, round 3', 'https://i.ytimg.com/vi/vgmKlyeZQ1E/maxresdefault.jpg', 9.1),
(@season2_id, 9, 'Le miracle d\'Alabasta ! La pluie qui sauve le royaume', 'https://i.ytimg.com/vi/vgmKlyeZQ1E/maxresdefault.jpg', 9.0),
(@season2_id, 10, 'Les adieux à Vivi ! L\'équipage part vers de nouvelles aventures', 'https://i.ytimg.com/vi/vgmKlyeZQ1E/maxresdefault.jpg', 8.9);