import React from "react";
import "./App.css";
import List from "./List";
import seedData from "./seeds";

class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      items: seedData,
    };

    this.handleOrderChange = this.handleOrderChange.bind(this);
  }

  handleOrderChange({ items }) {
    console.log("handleOrderChange");
  }

  render() {
    return (
      <div className="App">
        <List items={this.state.items} onOrderChange={this.handleOrderChange} />
      </div>
    );
  }
}

export default App;
