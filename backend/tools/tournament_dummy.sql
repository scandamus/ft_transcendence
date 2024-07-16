INSERT INTO game_tournament (name, start, period, status, current_round, max_participants, winner_id, second_place_id, third_place_id, result_json)
VALUES
('ちゃんま大戦争2', '2024-07-21 10:00:00', '2024-07-21 10:00:00', 'upcoming', 1, 16, NULL, NULL, NULL, ''),
('関ヶ原', '2024-07-18 22:30:00', '2024-07-18 22:30:00', 'upcoming', 1, 16, NULL, NULL, NULL, ''),
('ちゃんま大戦争1', '2024-07-14 10:00:00', '2024-07-14 10:00:00', 'ongoing', 2, 16, NULL, NULL, NULL,
 '[{"round":2,"matches":[{"player1":"testplayer31","player2":"testplayer19","avatar1":"/static/uploads/avatar/avatar31.jpg","avatar2":"/static/uploads/avatar/avatar19.jpg"},{"player1":"testplayer6","player2":"testplayer42","avatar1":"/static/uploads/avatar/avatar6.jpg","avatar2":"/static/uploads/avatar/avatar42.jpg"}]},{"round":1,"matches":[{"player1":"testplayer31","player2":"testplayer14","avatar1":"/static/uploads/avatar/avatar31.jpg","avatar2":"","score1":10,"score2":3,"winner":"testplayer31"},{"player1":"testplayer2","player2":"testplayer19","avatar1":"/static/uploads/avatar/avatar2.jpg","avatar2":"/static/uploads/avatar/avatar19.jpg","score1":2,"score2":10,"winner":"testplayer19"},{"player1":"testplayer6","player2":"testplayer0","avatar1":"/static/uploads/avatar/avatar6.jpg","avatar2":"/static/uploads/avatar/avatar0.jpg","score1":10,"score2":3,"winner":"testplayer6"},{"player1":"testplayer5","player2":"testplayer42","avatar1":"/static/uploads/avatar/avatar5.jpg","avatar2":"/static/uploads/avatar/avatar42.jpg","score1":2,"score2":10,"winner":"testplayer42"}]}]'),
('staticTournament', '2024-07-14 10:00:00', '2024-07-14 10:00:00', 'finished', 3, 16,
 (SELECT id FROM players_player WHERE user_id = (SELECT id FROM auth_user WHERE username = 'testplayer42')),
 (SELECT id FROM players_player WHERE user_id = (SELECT id FROM auth_user WHERE username = 'testplayer28')),
 (SELECT id FROM players_player WHERE user_id = (SELECT id FROM auth_user WHERE username = 'testplayer1')),
 '[{"round":3,"matches":[{"player1":"testplayer19","player2":"testplayer42","avatar1":"/static/uploads/avatar/avatar19.jpg","avatar2":"/static/uploads/avatar/avatar42.jpg","score1":1,"score2":10,"winner":""}]},{"round":2,"matches":[{"player1":"testplayer31","player2":"testplayer19","avatar1":"/static/uploads/avatar/avatar31.jpg","avatar2":"/static/uploads/avatar/avatar19.jpg","score1":4,"score2":10,"winner":"testplayer19"},{"player1":"testplayer6","player2":"testplayer42","avatar1":"/static/uploads/avatar/avatar6.jpg","avatar2":"/static/uploads/avatar/avatar42.jpg","score1":7,"score2":10,"winner":"testplayer42"}]},{"round":1,"matches":[{"player1":"testplayer31","player2":"testplayer14","avatar1":"/static/uploads/avatar/avatar31.jpg","avatar2":"","score1":10,"score2":3,"winner":"testplayer31"},{"player1":"testplayer2","player2":"testplayer19","avatar1":"/static/uploads/avatar/avatar2.jpg","avatar2":"/static/uploads/avatar/avatar19.jpg","score1":2,"score2":10,"winner":"testplayer19"},{"player1":"testplayer6","player2":"testplayer0","avatar1":"/static/uploads/avatar/avatar6.jpg","avatar2":"/static/uploads/avatar/avatar0.jpg","score1":10,"score2":3,"winner":"testplayer6"},{"player1":"testplayer5","player2":"testplayer42","avatar1":"/static/uploads/avatar/avatar5.jpg","avatar2":"/static/uploads/avatar/avatar42.jpg","score1":2,"score2":10,"winner":"testplayer42"}]}]');

INSERT INTO game_entry (tournament_id, player_id, nickname)
VALUES
((SELECT id FROM game_tournament WHERE name = 'ちゃんま大戦争1'),
 (SELECT id FROM players_player WHERE user_id = (SELECT id FROM auth_user WHERE username = 'testplayer55')),
 'ニックネーム55555'),
((SELECT id FROM game_tournament WHERE name = 'ちゃんま大戦争1'),
 (SELECT id FROM players_player WHERE user_id = (SELECT id FROM auth_user WHERE username = 'testplayer0')),
 '00000ニックネーム'),
((SELECT id FROM game_tournament WHERE name = 'ちゃんま大戦争1'),
 (SELECT id FROM players_player WHERE user_id = (SELECT id FROM auth_user WHERE username = 'testplayer12')),
 'testplayer12nick'),
((SELECT id FROM game_tournament WHERE name = 'ちゃんま大戦争1'),
 (SELECT id FROM players_player WHERE user_id = (SELECT id FROM auth_user WHERE username = 'testplayer6')),
 'nn6testplayer6'),
((SELECT id FROM game_tournament WHERE name = 'staticTournament'),
 (SELECT id FROM players_player WHERE user_id = (SELECT id FROM auth_user WHERE username = 'testplayer42')),
 'stニックネーム55555'),
((SELECT id FROM game_tournament WHERE name = 'staticTournament'),
 (SELECT id FROM players_player WHERE user_id = (SELECT id FROM auth_user WHERE username = 'testplayer28')),
 'st00000ニックネーム'),
((SELECT id FROM game_tournament WHERE name = 'staticTournament'),
 (SELECT id FROM players_player WHERE user_id = (SELECT id FROM auth_user WHERE username = 'testplayer1')),
 'sttestplayer12nick'),
((SELECT id FROM game_tournament WHERE name = 'staticTournament'),
 (SELECT id FROM players_player WHERE user_id = (SELECT id FROM auth_user WHERE username = 'testplayer6')),
 'stnn6testplayer6');
