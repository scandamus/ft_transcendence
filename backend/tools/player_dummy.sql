INSERT INTO players_player (user_id, level, play_count, win_count, lang, status, data_created)
VALUES
((SELECT id FROM auth_user WHERE username = 'user1'), 2.0, 10, 1, 'en', 'waiting', NOW()),
((SELECT id FROM auth_user WHERE username = 'user2'), 4.2, 20, 20, 'ja', 'waiting', NOW()),
((SELECT id FROM auth_user WHERE username = 'user3'), 6.0, 3, 0, 'en', 'waiting', NOW());