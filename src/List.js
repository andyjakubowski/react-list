import React from "react";
import "./List.css";

function move(array, prevIndex, nextIndex) {
  const arrayCopy = [...array];
  const item = arrayCopy.splice(prevIndex, 1)[0];
  arrayCopy.splice(nextIndex, 0, item);
  return arrayCopy;
}

class List extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      items: props.items.sort((itemA, itemB) => itemA.orderId - itemB.orderId),
    };

    this.handleUpClick = this.handleUpClick.bind(this);
  }

  reorderItems(items, currentIndex, newIndex) {
    const reorderedItems = move(items, currentIndex, newIndex);
    let maxOrderId = null;

    this.setState({
      items: reorderedItems.map((item) => {
        if (maxOrderId === null) {
          maxOrderId = item.orderId;
        } else if (maxOrderId >= item.orderId) {
          maxOrderId += 1;
        } else {
          maxOrderId = item.orderId;
        }

        return { ...item, orderId: maxOrderId };
      }),
    });
  }

  handleUpClick(e, text, index) {
    console.log(`handleUpClick, ${text}, index: ${index}`);
    const currentIndex = index;
    const newIndex = Math.max(0, index - 1);
    this.reorderItems(this.state.items, currentIndex, newIndex);
  }

  handleDownClick(e, text, index) {
    console.log(`handleDownClick, ${text}, index: ${index}`);
    const currentIndex = index;
    const newIndex = Math.min(index + 1, this.state.items.length - 1);
    this.reorderItems(this.state.items, currentIndex, newIndex);
  }

  render() {
    const { items } = this.state;
    return (
      <ul>
        {items.map((item, index) => (
          <li key={item.text}>
            {item.text}, orderId: {item.orderId}
            <span onClick={(e) => this.handleUpClick(e, item.text, index)}>
              Up
            </span>
            <span onClick={(e) => this.handleDownClick(e, item.text, index)}>
              Down
            </span>
          </li>
        ))}
      </ul>
    );
  }
}

export default List;
