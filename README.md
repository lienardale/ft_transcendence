# ft_transcendence

To launch the website all in Docker :
-> docker-compose up --build -d

To stop the website :
docker-compose down

to see the api documentation : localhost:3001/api

to see the database : 
- ouvrir avec un navigateur : localhost:8080 
- se connecter avec : admin@admin.com / admin
- creer un serveur (clic droit sur Servers en haut a gauche -> Create -> Serveur)
- dans la pop-up renseigner le second onglet avec host : postgres, username : admin, mdp : admin
- regarder les tables dans Database > postgres > schemas > public > tables

to test with postman : 

-> POST localhost:3001/auth/signup
{
    "login":"nadal",
    "password":"pass"
}
then
-> POST localhost:3001/auth/signin with same body, retrieve token.

For all further postman requests, fill the token in Authorization -> Bearer Token.

-> POST localhost:3001/users
{
    "login":"nadal",
    "avatar_path":"./avatar/nadal.jpeg",
    "status":"CONNECTED",
    "level":"top10",
    "level2factor_auth":"connected"
}
(or via the form-urlencoded)
to create a user linked to the member you are connected with

-> GET localhost:3001/users to retrieve all users

-> PATCH localhost:3001/users to update one or more fields of the user you are connected with the token

-> POST localhost:3001/games (with users id = the user connected via token  et id = 2 an id of an existing user)
{
  "type_game": "rolland",
  "user_player2Id": "1",
  "score_player1": "6",
  "score_player2": "2"
}
to create a new game

-> PATCH localhost:3001/games/1 to update one or more fields of the game n°1 you are connected with the token

-> GET localhost:3001/games
to retrieve all games

-> GET localhost:3001/users/games to retrieve all the games played by the user you are connected with. same with /channels, /friends

-> localhost:3001/channels (with user id = 1 already created)

[
  {
    "channel_type": "prive",
    "name": "CONV DES CHAMPIONS",
    "password": "MDP",
    "user_owner": "1"
  }
]

-> localhost:3001/friends-list (with users id = 1  qnd id = 2 already created)

{
  "friendship_status": "not_accepted",
  "user_asking": "1",
  "user_asked": "2"
}


SELECT c.*
FROM public.channel c
LEFT JOIN public.channel_members_user m on c.id = m."channelId"
where m."userId" = 1
and c.id not in (
	SELECT c.id
	FROM public.channel c
	LEFT JOIN public.channel_members_user m on c.id = m."channelId"
	WHERE c."channel_type" = 'pm' 
	and m."userId" in (
		SELECT "userBlockingId"
		FROM public.blocked_list
		where "userBlockedId" = 1
		UNION
		SELECT "userBlockedId"
		FROM public.blocked_list
		where "userBlockingId" = 1
	)
)
;

SELECT c.*
FROM public.channel c
where c.id not in (3)
;


SELECT * 
FROM "channel" "channel" 
LEFT JOIN "channel_members_user" "channel_user_member" ON "channel_user_member"."channelId"="channel"."id" 
LEFT JOIN "user" "user_member" ON "user_member"."id"="channel_user_member"."userId" 
WHERE "user_member"."id" IN (SELECT "block"."userBlockingId" AS ID FROM "blocked_list" "block" WHERE "block"."userBlockedId" = $1) 
OR "user_member"."id" IN (SELECT "block"."userBlockedId" AS ID FROM "blocked_list" "block" WHERE "block"."userBlockingId" = $2) 
AND "channel"."channel_type" = 'pm'