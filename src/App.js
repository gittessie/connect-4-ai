import React, { Component } from 'react';
import styles from './App.css';
import Board from './components/Board/Board';

var emptyBoard = [];
for(let i = 0; i < 6; i++ ){
    emptyBoard.push(new Array(7).fill(0));
}

class App extends Component {
  state={
    level: 0, // 0 for easy, 1 for medium, 2 for hard 
    board: emptyBoard, // 0 for empty cell, 1 for you(black), 2 for opponent(red)
    yourTurn: true, // true if your turn, false if opponent's
    winner: 0,  // 0 no one/game still going, 1 you, 2 opponent, 3 tie
  }

  getEmptyRow(colIndex, currBoard){
    for(var i = 5; i >= 0; i--){
      if(currBoard[i][colIndex] === 0){
        return i;
      }
    }
    return -1;
  }

  checkVertWin(row, col, currBoard){
    if(row > 2){
      return false;
    }
    var furthestDownIndex = row + 3;
    var furthestUpIndex = row - 3;
    if(furthestDownIndex >5){
      furthestDownIndex = 5;
    }
    if(furthestUpIndex < 0){
      furthestUpIndex = 0; 
    }
    for(var i = furthestDownIndex; i >= furthestUpIndex + 3; i--){
      if(currBoard[i][col] === currBoard[i-1][col] 
        && currBoard[i-1][col] === currBoard[i-2][col]
        && currBoard[i-2][col] === currBoard[i-3][col]){
          //console.log("vertical win");
          return true;
      }
    }
    return false;
  }

  checkHorizWin(row, col, currBoard){
    var furthestRightIndex = col + 3;
    var furthestLeftIndex = col - 3;
    if(furthestRightIndex >6){
      furthestRightIndex = 6;
    }
    if(furthestLeftIndex < 0){
      furthestLeftIndex = 0; 
    }
    for(var i = furthestRightIndex; i >= furthestLeftIndex + 3; i--){
      if(currBoard[row][i] === currBoard[row][i-1] 
        && currBoard[row][i-1] === currBoard[row][i-2]
        && currBoard[row][i-2] === currBoard[row][i-3]){
          //console.log("horizontal win");
          return true;
      }
    }
    return false;
  }

  checkDiagWin(row, col, currBoard){
    // for bottom right to top left
    var checkRow = row;
    var checkCol = col; 
    var count = 0;
    // Get bottom-right-most cell to check
    while(checkRow < 5 && checkCol < 6 && count < 3){
      checkRow++;
      checkCol++;
      count++;
    }
    
    // Check bottom right to top left 
    while(checkRow >= 3 && checkCol >= 3){
      if(currBoard[checkRow][checkCol] !== 0
        && currBoard[checkRow][checkCol] === currBoard[checkRow-1][checkCol-1] 
        && currBoard[checkRow-1][checkCol-1] === currBoard[checkRow-2][checkCol-2]
        && currBoard[checkRow-2][checkCol-2] === currBoard[checkRow-3][checkCol-3]){
          //console.log("diag win");
          return true;
      }
      checkRow--;
      checkCol--;
    }

    // for bottom left to top right
    checkRow = row;
    checkCol = col; 
    count = 0;
    // Get bottom-left-most cell to check
    while(checkRow < 5 && checkCol >0 && count < 3){
      checkRow++;
      checkCol--;
      count++;
    }
    
    // Check bottom left to top right
    while(checkRow >= 3 && checkCol <= 3){
      if(currBoard[checkRow][checkCol] !== 0
        && currBoard[checkRow][checkCol] === currBoard[checkRow-1][checkCol+1] 
        && currBoard[checkRow-1][checkCol+1] === currBoard[checkRow-2][checkCol+2]
        && currBoard[checkRow-2][checkCol+2] === currBoard[checkRow-3][checkCol+3]){
          //console.log("diag win");
          return true;
      }
      checkRow--;
      checkCol--;
    }   
    return false;
  }

  checkBoardFull(currBoard){
    var boardFull= true;
    for(var i = 0; i < 7; i++){
      if(currBoard[0][i] === 0){
        boardFull = false; 
      }
    }
    return boardFull;
  }

  checkGameOver(row, col, currBoard){
    if(this.checkVertWin(row, col, currBoard) 
    || this.checkHorizWin(row, col, currBoard) 
    || this.checkDiagWin(row,col, currBoard)){
      //console.log("someone won."+currBoard[row][col]);
      return currBoard[row][col];
    } else{
      if(row === 0 && this.checkBoardFull(currBoard)){
        return 3;
      } else{
        return 0; 
      }
    }
  }

  bestPlacement(givenBoard, depth){
    var currBoard = [];
    for(let i = 0; i < 6; i++ ){
      currBoard.push(givenBoard[i].slice());
    }
    const moves = this.possibleActions(currBoard);
    var moveValues = [];
    for(var i = 0; i < moves.length; i++){
      var row = moves[i];
      var col = i;
      if(row === -1){
        moveValues.push(-9999);
      } else{
        moveValues.push(this.getValue(row, col, currBoard, depth, 0, 2));
      }
    }
    var bestCol = -1;
    var bestVal = -99999;
    for(var j = 0; j < moveValues.length; j++){
      if(moveValues[j] > bestVal){
        bestCol = j;
        bestVal = moveValues[j];
      }
      if(moveValues[j] === bestVal){ // if at same value, randomly decide whether to swap it out 
        var rand = Math.floor(Math.random() * (j + 1)); 
        if(rand === j - 1){
          bestCol = j;
        }
      }
    }
    return bestCol;
  }

  possibleActions(currBoard){ // get all possible row-col moves for given state 
    var availableMoves = []; 
    for(var i = 0; i < 7; i++){
      var openRow = this.getEmptyRow(i, currBoard);
      availableMoves.push(openRow);
    }
    return availableMoves;
  }

  getValue(row, col, givenBoard, depth, currDepth, player){
    var currBoard = [];
    for(let i = 0; i < 6; i++ ){
      currBoard.push(givenBoard[i].slice());
    }
    //check if someone wins this state
    currBoard[row][col] = player;
    var whoWon = this.checkGameOver(row, col, currBoard); 
    if(whoWon === 2){ // computer wants to win 
      return 10-depth;
    } 
    else if(whoWon === 3){ // tie is okay
      return 0;
    }
    else if(whoWon === 1){ // do not want player to win
      return -10+depth; 
    } 
    else { // game still going 
      if(currDepth >= depth){ // don't go beyond depth 
        return 0;
      }
      const moves = this.possibleActions(currBoard);
      var moveValues = [];
      for(var i = 0; i < moves.length; i++){
        var nextRow = moves[i];
        var nextCol = i;
        if(nextRow !== -1){
          moveValues.push(this.getValue(nextRow, nextCol, currBoard, depth, currDepth+1, 3-player));
        }
      }
      var bestVal = 0; 
      if(player === 2){
        bestVal = Math.min(...moveValues);
      }else{
        bestVal = Math.max(...moveValues);
      }
      return bestVal;
    }
  }

  cellClickHandler = (colIndex) => {
    if(this.state.winner !== 0){
      return;
    }
    var newBoard = [];
    for(let i = 0; i < 6; i++ ){
      newBoard.push(this.state.board[i].slice());
    }
    const openRow = this.getEmptyRow(colIndex, newBoard);
    if(openRow === -1){return;}
    newBoard[openRow][colIndex]= 1;
    
    this.setState({board:newBoard, yourTurn:!this.state.yourTurn}, () =>{
      var whoWon = this.checkGameOver(openRow, colIndex, newBoard);
      if(whoWon !== 0){
        this.setState({winner: whoWon})
      }else{
        var computerCol = this.bestPlacement(newBoard, this.state.level*2+1);
        var computerRow = this.getEmptyRow(computerCol, newBoard);
        newBoard[computerRow][computerCol] = 2;
        setTimeout(function(){this.setState({board:newBoard, yourTurn:!this.state.yourTurn}, () =>{
          var whoWon = this.checkGameOver(computerRow, computerCol, newBoard);
          if(whoWon !== 0){
            this.setState({winner: whoWon})
          }
        })}.bind(this), 100); // delay to make it feel like the computer is "thinking"
      }
    });
  }

  levelClick(buttonNum){
    this.setState({level: buttonNum});
    this.resetClickHandler();
  }

  resetClickHandler = () =>{
    this.setState({
      board: emptyBoard, 
      yourTurn: true, 
      winner: 0
    })
  }

  render() {
    var result;
    if(this.state.winner !== 0){
      if(this.state.winner === 1){
        result = <h4>"You win!"</h4>;
      } else if(this.state.winner === 2){
        result = <h4>"Sorry, you lost."</h4>;
      } else {
        result = <h4>"It's a tie."</h4>;
      }
    }
    return (
      <div className={styles.App}>
        <h1>Connect 4</h1> 
        <button disabled={this.state.level===0} onClick={()=>this.levelClick(0)}>Easy</button>
        <button disabled={this.state.level===1} onClick={()=>this.levelClick(1)}>Medium</button>
        <button disabled={this.state.level===2} onClick={()=>this.levelClick(2)}>Hard</button>
        <Board board={this.state.board} cellClick={this.cellClickHandler}/>
        {result}
        <button onClick={this.resetClickHandler}>Restart</button>
        <p>Built by Tessie</p>
      </div>
    );
  }
}

export default App;
