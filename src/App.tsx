import { useEffect, useState } from "react";
import * as C from "./App.styles";

import logoImage from "./assets/devmemory_logo.png";
import RestartIcon from "./svgs/restart.svg";

import { Button } from "./components/Button";
import { InfoItem } from "./components/InfoItem";
import { GridItem } from "./components/GridItem";

import { GridItemType } from "./types/GridItemType";
import { items } from "./data/items";
import { formatTimeElapsed } from "./helpers/formatTimeElapsed";

const App = () => {
    const [playing, setPlaying] = useState<boolean>(false); //o jogo está acontecndeo ou não?
    const [timeElapsed, setTimeElapsed] = useState<number>(0); //quantidade de segundos que passaram no jogo
    const [moveCount, setMoveCount] = useState<number>(0); //quantidade de movimentos no jogo feitos até agora
    const [shownCount, setShownCount] = useState<number>(0); //quantidade de itens que mostra naquela rodada
    const [gridItems, setGridItems] = useState<GridItemType[]>([]); //como é um array, foi criado um type especifico para tipar as coisas do array // array com os itens, cada uma das 12 cartas

    useEffect(() => {
        resetAndCreateGrid();
    }, []);

    useEffect(() => {
        const timer = setInterval(() => {
            if (playing) {
                setTimeElapsed(timeElapsed + 1);
            }
        }, 1000);
        return () => clearInterval(timer);
    }, [playing, timeElapsed]);

    //verificar se as cartas abertas são iguais
    useEffect(() => {
        if (shownCount === 2) {
            let opened = gridItems.filter((item) => item.shown === true);
            if (opened.length === 2) {
                if (opened[0].item === opened[1].item) {
                    // verificação 1 - se as cartas são iguais,  faça todos os que tiverem 'shown' permanentes
                    let tmpGrid = [...gridItems];

                    for (let i in tmpGrid) {
                        if (tmpGrid[i].shown) {
                            tmpGrid[i].permanentShown = true;
                            tmpGrid[i].shown = false;
                        }
                    }
                    setGridItems(tmpGrid);
                    setShownCount(0);
                } else {
                    //verificação 2 - se as cartas não são iguais, então faça todas as 'shown' virarem de volta
                    setTimeout(() => {
                        let tmpGrid = [...gridItems];
                        for (let i in tmpGrid) {
                            tmpGrid[i].shown = false;
                        }
                        setGridItems(tmpGrid);
                        setShownCount(0);
                    }, 1000);
                }

                setMoveCount((moveCount) => moveCount + 1);
            }
        }
    }, [shownCount, gridItems]); //dentro do array de monitoramento está quem precisar monitorar ao executar as ações. Ou seja, sempre que eles modificarem, irá ser verificado novamente

    //verifica se o jogo acabou
    useEffect(() => {
        if (moveCount > 0 && gridItems.every((item) => item.permanentShown === true)) {
            setPlaying(false);
        }
    }, [moveCount, gridItems]);

    const resetAndCreateGrid = () => {
        // passo 1 - resetar o jogo
        setTimeElapsed(0);
        setMoveCount(0);
        setShownCount(0);

        // passo 2 - criar o grid
        // 2.1 criar um grid vazio
        let tmpGrid: GridItemType[] = [];
        for (let i = 0; i < items.length * 2; i++) {
            tmpGrid.push({
                item: null,
                shown: false,
                permanentShown: false,
            });
        }

        // 2.2 - preencher o grid
        for (let w = 0; w < 2; w++) {
            for (let i = 0; i < items.length; i++) {
                let pos = -1;
                while (pos < 0 || tmpGrid[pos].item !== null) {
                    pos = Math.floor(Math.random() * (items.length * 2));
                }

                tmpGrid[pos].item = i;
            }
        }

        // 2.3 - jogar no state
        setGridItems(tmpGrid);

        // passo 3 - começar o jogo
        setPlaying(true);
    };

    const handleItemClick = (index: number) => {
        if (playing && index !== null && shownCount < 2) {
            let tmpGrid = [...gridItems]; //é criado um clone para fazer as alterações a seguir sem problemas

            if (tmpGrid[index].permanentShown === false && tmpGrid[index].shown === false) {
                tmpGrid[index].shown = true;
                setShownCount(shownCount + 1);
            }

            setGridItems(tmpGrid);
        }
    };

    return (
        <C.Container>
            <C.Info>
                <C.LogoLink href="">
                    <img src={logoImage} width="200" alt="" />
                </C.LogoLink>

                <C.InfoArea>
                    <InfoItem label="Tempo" value={formatTimeElapsed(timeElapsed)} />
                    <InfoItem label="Movimentos" value={moveCount.toString()} />
                </C.InfoArea>

                <Button label="Reiniciar" icon={RestartIcon} onClick={resetAndCreateGrid} />
            </C.Info>
            <C.GridArea>
                <C.Grid>
                    {gridItems.map((item, index) => (
                        <GridItem key={index} item={item} onClick={() => handleItemClick(index)} />
                    ))}
                </C.Grid>
            </C.GridArea>
        </C.Container>
    );
};

export default App;
