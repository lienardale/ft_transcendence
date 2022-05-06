import styles from "./GameList.module.css"
import React from "react";
import { Game } from "../../api/db/types";

function GameStats(props : any) {

    if (props.items === null || props.items === undefined)
    {
        return <div>
        <h2 className={styles.list_tittle}> Stats </h2>
    </div>
    }
    else {
        let games : Game[] = props.items;
        games = games.filter(x => (x.userPlayer2 !== null && x.userPlayer2 !== undefined));
        let wins = games.filter(x => ((x.userPlayer1.id === props.user.id  && x.score_player1 > x.score_player2) || (x.userPlayer2.id === props.user.id  && x.score_player1 < x.score_player2))).length;;
        let losses = games.filter(x => ((x.userPlayer1.id === props.user.id  && x.score_player1 < x.score_player2) || (x.userPlayer2.id === props.user.id  && x.score_player1 > x.score_player2))).length;
        let wins_fast = games.filter(x => (x.type_game === "fast_mode" && ((x.userPlayer1.id === props.user.id  && x.score_player1 > x.score_player2) || (x.userPlayer2.id === props.user.id  && x.score_player1 < x.score_player2)))).length;
        let losses_fast = games.filter(x => (x.type_game === "fast_mode" && ((x.userPlayer1.id === props.user.id  && x.score_player1 < x.score_player2) || (x.userPlayer2.id === props.user.id  && x.score_player1 > x.score_player2)))).length;
        
        return (
        <div>
            <p></p>
            <h2 className={styles.list_tittle}> Stats </h2>
            <p></p>
                <div>
                    Wins = {wins}
                </div>
                <div>
                    Wins in fast-mode = {wins_fast}
                </div>
                <div>
                    Wins in classic-mode = {wins - wins_fast}
                </div>
                <div>
                    Losses = {losses}
                </div>
                <div>
                    Losses in fast-mode = {losses_fast}
                </div>
                <div>
                    Losses in classic-mode = {losses - losses_fast}
                </div>
                {games.length > 0 ?
                    <div>
                        Winrate = {(wins / games.length).toFixed(2)}
                    </div>
                    :
                    <div>Winrate = 0</div>
                }
                {

                }
                <div>
                    Position in ladder = {props.rank}
                </div>
                <p></p>
                <div>
                <h2 className={styles.list_tittle}> Achievements </h2>
                    <p></p>
                    { games.length >= 1 ?
                        <div>
                            - First game Played
                        </div>
                    :
                        <div></div>
                    }
                    { games.length >= 10 ?
                        <div>
                            - Played 10 games
                        </div>
                    :
                        <div></div>
                    }
                    {games.filter(x => x.userPlayer1.id === props.user.id).length >= 1 ?
                        <div>
                        - Won 1 game
                        </div>
                    :
                        <div></div>
                    }
                    {games.filter(x => x.userPlayer1.id === props.user.id).length >= 10 ?
                        <div>
                        - Won 10 games
                        </div>
                    :
                        <div></div>
                    }
                    {
                        props.rank === 1 ?
                        <div>
                        - The Best : you're the best
                        </div>
                        :
                        <div></div>
                    }
                    {
                        props.rank <= 10 ?
                        <div>
                        - Top 10
                        </div>
                        :
                        <div></div>
                    }
            </div>

        </div>)
    }
}

export default GameStats;
