import { Game } from "../../api/db/types";

function GameItem(game : Game){
  return (
    <div className="game_item">
    { game ?
    <div className="game_item">
      <pre>
        <div className="avatar_small">
          <img src={game.userPlayer1.avatar_path || '/images/default_user.jpg'} alt="profile picture" layout="fill" />
        </div>
      </pre>
      <pre> </pre>
      <pre>
        {game.userPlayer1.login} : {game.score_player1}
      </pre>
      <pre> | </pre>
        <pre>
          {game.score_player2} : {game.userPlayer2.login}
        </pre>
        <pre> </pre>
        <pre>
        <div className="avatar_small">
            <img src={game.userPlayer2.avatar_path || '/images/default_user.jpg'} alt="profile picture" layout="fill" />
          </div>
        </pre>
    </div>
      : 
      <div></div>
      }
  </div>
  )
}

export default GameItem;