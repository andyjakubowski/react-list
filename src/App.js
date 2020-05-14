import React from "react";
import "./App.css";
import List from "./List";
import seedData from "./seeds";

function move(array, prevIndex, nextIndex) {
  const arrayCopy = [...array];
  const item = arrayCopy.splice(prevIndex, 1)[0];
  arrayCopy.splice(nextIndex, 0, item);
  return arrayCopy;
}

class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      items: seedData,
    };

    this.handleOrderChange = this.handleOrderChange.bind(this);
  }

  reorderItems(items, currentIndex, newIndex) {
    const reorderedItems = move(items, currentIndex, newIndex);
    let maxOrderId = null;

    return reorderedItems.map((item) => {
      if (maxOrderId === null) {
        maxOrderId = item.orderId;
      } else if (maxOrderId >= item.orderId) {
        maxOrderId += 1;
      } else {
        maxOrderId = item.orderId;
      }

      return { ...item, orderId: maxOrderId };
    });
  }

  handleOrderChange(prevIndex, nextIndex) {
    console.log("handleOrderChange");
    const reorderedItems = this.reorderItems(
      this.state.items,
      prevIndex,
      nextIndex
    );
    this.setState({
      items: reorderedItems,
    });
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
