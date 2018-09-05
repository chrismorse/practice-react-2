import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

function Square(props) {
  return (
    <button className={["square", props.highlightClass].join(' ')} onClick={props.onClick}>
      {props.value}
    </button>
  );
}

class Board extends React.Component {
  renderSquare(i, isHighlight) {
    return (
      <Square 
        value={this.props.squares[i]}
        key={i} 
        highlightClass={isHighlight ? "highlight" : ""}
        onClick={() => this.props.onClick(i)}
      />
    );
  }

  render() {
    let rows = [];
    let cells = [];
    let cellNumber = 0;

    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        let isHighlight = false;
        if (this.props.winningMoves !== null && this.props.winningMoves.includes(cellNumber)) {
          isHighlight = true;
        }
        cells.push(this.renderSquare(cellNumber, isHighlight));
        cellNumber++;
      }
      rows.push(<div className="board-row" key={i}>{cells}</div>)
      cells = [];
    }

    return (
      <div>
        {rows}
      </div>
    );
  }
}

class Game extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      history: [{
        squares: Array(9).fill(null),
        lastMove: null,
      }],
      stepNumber: 0,
      xIsNext: true,
      sortDesc: true,
    };
  }

  handleClick(i) {
    const history = this.state.history.slice(0, this.state.stepNumber + 1);
    const current = history[history.length - 1];
    const squares = current.squares.slice();
    if (calculateWinner(squares) || squares[i]) {
      return;
    }
    squares[i] = this.state.xIsNext ? 'X' : 'O';
    this.setState({
      history: history.concat([{
        squares: squares,
        lastMove: i,
      }]),
      stepNumber: history.length,
      xIsNext: !this.state.xIsNext,
    });
  }

  jumpTo(step) {
    this.setState({
      stepNumber: step,
      xIsNext: (step % 2 === 0),
    });
  }

  changeSort() {
    this.setState({
      sortDesc: !this.state.sortDesc,
    });
  }
  
  render() {
    let history = this.state.history;
    const current = history[this.state.stepNumber];
    const result = calculateWinner(current.squares);

    const moves = history.map((step, move) => {
      const desc = move ?
        'Go to move #' + move + " (" + calculateBoardPosition(step.lastMove) + ")":
        'Go to game start';
    
      const bold = (move === this.state.stepNumber) ? "bold" : "";
      return (
        <li key={move}>
          <button className={bold} onClick={() => this.jumpTo(move)}>{desc}</button>
        </li>
      );
    });

    let status;
    if (result) {
      status = "Winner: " + result.winner;
    } else {
      status = "Next player: " + (this.state.xIsNext ? "X" : "O");
    }

    return (
      <div className="game">
        <div className="game-board">
          <Board
            squares={current.squares}
            winningMoves={result ? result.winningMoves : null}
            onClick={i => this.handleClick(i)}
          />
        </div>
        <div className="game-info">
          <div>{status}</div>
          <div><button onClick={() => this.changeSort()}>Change Sort</button></div>
          <ol>{this.state.sortDesc ? moves : moves.reverse()}</ol>
        </div>
      </div>
    );
  }
}

// ========================================

ReactDOM.render(
  <Game />,
  document.getElementById('root')
);

function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];

  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return {
        winner: squares[a],
        winningMoves: [a, b, c],
      }
    }
  }

  return null;
}

function calculateBoardPosition(i) {
  const boardPos = {
    0: [0,0],
    1: [0,1],
    2: [0,2],
    3: [1,0],
    4: [1,1],
    5: [1,2],
    6: [2,0],
    7: [2,1],
    8: [2,1],
  }

  return boardPos[i];
}