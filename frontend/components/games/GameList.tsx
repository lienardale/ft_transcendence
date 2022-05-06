import { Game } from "../../api/db/types";
import GameItem from "./GameItem";
import styles from "./GameList.module.css";

function GameList(props : any){

    if (props.items === null || props.items === undefined)
    {
        return <div className={"list_block"}>
        <div className={"list_block_big"}>
            <h2 className={styles.list_tittle}> Games </h2>
        </div>
    </div>
    }
    else {
        let games : Game[] = props.items;
        games = games.filter(x => (x.userPlayer2 !== null && x.userPlayer2 !== undefined));

        return <div className={"list_block"}>
            <div className={"list_block_big"}>
        <h2 className={styles.list_tittle}> Games </h2>
            {games.map((game : Game) => (
        <li key={game.id} className={"list_block_li2"}>
                <GameItem {...game} />
            </li>
            ))}
        </div>
    </div>
    }
}

export default GameList;