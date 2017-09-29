import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import { ButtonToolbar, MenuItem, DropdownButton } from 'react-bootstrap';

class Box extends React.Component {
  selectBox = () => {
    this.props.selectBox(this.props.row, this.props.col);
  }

  render () {
    return (
      <div
        className={this.props.boxClass}
        id={this.props.id}
        onClick={this.selectBox}
      />
    );
  }
}

class Grid extends React.Component {
  render() {
    const width = (this.props.cols * 14);
    var rowsArr = []

    var boxClass = "";
    for (var i = 0; i < this.props.rows; i++) {
      for (var j = 0; j < this.props.cols; j++) {
        let boxId = i + "_" + j;

        boxClass = this.props.gridFull[i][j] ? "box on" : "box off"
        rowsArr.push(
          <Box
            boxClass={boxClass}
            key={boxId}
            boxId={boxId}
            row={i}
            col={j}
            selectBox={this.props.selectBox}
          />
        );
      }
    }

    return (
      <div className="grid" style={{width: width}}>
        {rowsArr}
      </div>
    );
  }
}

class Buttons extends React.Component {

  handleSelect = (evt) => {
    console.log(evt);
    this.props.gridSize(evt); //passing in something, can't do it in return render method, need it here
  }
  
  render() {
    return (
      <div className="center">
        <ButtonToolbar>
          <button className="btn btn-default" onClick={this.props.playButton}>
            Play
          </button>
          <button className="btn btn-default" onClick={this.props.pauseButton}>
            Pause
          </button>
          <button className="btn btn-default" onClick={this.props.clear}>
            Clear
          </button>
          <button className="btn btn-default" onClick={this.props.slow}>
            Slow
          </button>
          <button className="btn btn-default" onClick={this.props.fast}>
            Fast
          </button>
          <button className="btn btn-default" onClick={this.props.seed}>
            Seed
          </button>
          <DropdownButton
            title="Grid Size"
            id="size-menu"
            onSelect={this.handleSelect}
          >
            <MenuItem eventKey="1">20x10</MenuItem>
            <MenuItem eventKey="2">50x30</MenuItem>
            <MenuItem eventKey="3">70x50</MenuItem>
          </DropdownButton>
        </ButtonToolbar>
      </div> 
    );
  }
}

class Main extends React.Component {
  constructor(){
    super();
    this.speed = 100;
    this.rows = 30;
    this.cols = 50;

    this.state = {
      generation: 0,
      gridFull: Array(this.rows).fill().map(() => Array(this.cols).fill(false))
    }
  }

  selectBox = (row, col) => {
    let gridCopy = arrayClone(this.state.gridFull); //copy grid with our arrayClone method, to keep from editing the state directly
    gridCopy[row][col] = !gridCopy[row][col];
    this.setState({
      gridFull: gridCopy
    });
  }

  seed = () => { //select random "live" cells, 1/4 of the grid
    let gridCopy = arrayClone(this.state.gridFull);
    for (let i = 0; i < this.rows; i++){
      for (let j = 0; j < this.cols; j++) {
        if (Math.floor(Math.random() * 4) === 1){
          gridCopy[i][j] = true;
        }
      }
    }
    this.setState({ //fill grid by setting state to copy
      gridFull: gridCopy
    });
  }

  playButton = () => {
    clearInterval(this.intervalId); //starts over 
    this.intervalId = setInterval(this.play, this.speed); //runs play function every 100ms by default
  }

  pauseButton = () => {
    clearInterval(this.intervalId); 
  }

  fast = () => {
    this.speed = 100;
    this.playButton();
  }

  slow = () => {
    this.speed = 1000;
    this.playButton();
  }

  clear = () => {
    var grid = Array(this.rows).fill().map(() => Array(this.cols).fill(false));
    this.setState({
      gridFull: grid,
      generation: 0
    });
  }

  gridSize = (size) => {
    switch (size) {
      case "1":
        this.cols = 20;
        this.rows = 10;
      break;
      case "2":
        this.cols = 50;
        this.rows = 30;
      break;
      default:
        this.cols = 70;
        this.rows = 50;
    }
    this.clear();
    this.pauseButton();

  }


  play = () => { 
    //needs two copies of the grid
    let g = this.state.gridFull; //check grid current state
    let g2 = arrayClone(this.state.gridFull); //change on clone, set state with clone after GOL game logic 

    //GOL game logic
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.cols; j++) { //iterate thru all elements in grid

        //count neighbors, decide if die or live based on this #
        let count = 0; 

        if (i > 0) if (g[i - 1][j]) count++; //cell neighbors 1 ...
        if (i > 0 && j > 0) if (g[i - 1][j - 1]) count++;
        if (i > 0 && j < this.cols - 1) if (g[i - 1][j + 1]) count++;
        if (j < this.cols - 1) if (g[i][j + 1]) count++;
        if (j > 0) if (g[i][j - 1]) count++;
        if (i < this.rows - 1) if (g[i + 1][j]) count++;
        if (i < this.rows - 1 && j > 0) if (g[i + 1][j - 1]) count++;
        if (i < this.rows - 1 && this.cols - 1) if (g[i +1][j + 1]) count++; //...thru 8

        if (g[i][j] && (count < 2 || count > 3)) g2[i][j] = false;
        if (!g[i][j] && count === 3) g2[i][j] = true;
      }
    }

    this.setState({
      gridFull: g2,
      generation: this.state.generation + 1 //increment generation ("fps")
    })
  }

  componentDidMount() {
    this.seed();
    this.playButton(); // hits play button automatically
  }

  render() {
    return (
      <div>
        <h1>The Game of Life</h1>
        <Buttons
          playButton={this.playButton}
          pauseButton={this.pauseButton}
          slow={this.slow}
          fast={this.fast}
          clear={this.clear}
          seed={this.seed}
          gridSize={this.gridSize}
        />
        <Grid
          gridFull={this.state.gridFull}
          rows={this.rows}
          cols={this.cols}
          selectBox={this.selectBox}
        />
        <h2>Generations: {this.state.generation}</h2>
      </div>
    );
  }
}

function arrayClone(arr) {
  return JSON.parse(JSON.stringify(arr)); //deepclone trick
}

ReactDOM.render(<Main/>, document.getElementById('root'));
