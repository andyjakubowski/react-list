import React from "react";
import "./List.css";

const TIMEOUT_MS = 500;
let timeoutId;

function move(array, prevIndex, nextIndex) {
  const arrayCopy = [...array];
  const item = arrayCopy.splice(prevIndex, 1)[0];
  arrayCopy.splice(nextIndex, 0, item);
  return arrayCopy;
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

class List extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      items: props.items.sort((itemA, itemB) => itemA.orderId - itemB.orderId),
      isDragging: false,
      draggedItemId: null,
      pointerTargetOffsetY: null,
      itemHeight: null,
      itemRectTopBeforeDrag: null,
      top: null,
    };

    this.listDomRef = React.createRef();

    this.handleUpClick = this.handleUpClick.bind(this);
    this.handleDownClick = this.handleDownClick.bind(this);
    this.handlePointerDown = this.handlePointerDown.bind(this);
    this.handlePointerUp = this.handlePointerUp.bind(this);
    this.handlePointerCancel = this.handlePointerCancel.bind(this);
    this.handlePointerMove = this.handlePointerMove.bind(this);
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

  startDrag(itemId, offsetY, height, top) {
    console.log("startDrag");
    this.setState({
      isDragging: true,
      draggedItemId: itemId,
      pointerTargetOffsetY: offsetY,
      itemHeight: height,
      itemRectTopBeforeDrag: top,
    });
  }

  stopDrag() {
    console.log("stopDrag");
    this.setState({
      isDragging: false,
      draggedItemId: null,
      pointerTargetOffsetY: null,
      itemHeight: null,
      itemRectTopBeforeDrag: null,
      top: null,
    });
  }

  handlePointerDown(e, itemId) {
    const offsetY = e.nativeEvent.offsetY;
    const {
      height,
      top: itemRectTopBeforeDrag,
    } = e.target.getBoundingClientRect();
    timeoutId = setTimeout(
      this.startDrag.bind(this, itemId, offsetY, height, itemRectTopBeforeDrag),
      TIMEOUT_MS
    );
  }

  handlePointerUp(e) {
    clearTimeout(timeoutId);

    if (this.state.isDragging) {
      this.stopDrag();
    }
  }

  handlePointerCancel(e) {
    clearTimeout(timeoutId);

    if (this.state.isDragging) {
      this.stopDrag();
    }
  }

  handlePointerMove(e) {
    if (!this.state.isDragging) {
      return;
    }
    const {
      pointerTargetOffsetY,
      itemHeight,
      itemRectTopBeforeDrag,
    } = this.state;
    const listNode = this.listDomRef.current;
    const {
      top: listNodeTop,
      height: listNodeHeight,
    } = listNode.getBoundingClientRect();

    const top = e.pageY - itemRectTopBeforeDrag - pointerTargetOffsetY;
    // const minTop = 0;
    // const maxTop = listNodeHeight - itemHeight;
    // const top = clamp(unclampedY, minTop, maxTop);

    // console.log(
    //   `Pointer Move, target: ${e.target.id}, pageX/Y: ${e.pageX}/${e.pageY}`
    // );
    // console.log(`Top: ${top}`);
    this.setState({
      top,
    });
  }

  render() {
    const { items, isDragging, draggedItemId, top } = this.state;
    return (
      <ul
        ref={this.listDomRef}
        onPointerUp={this.handlePointerUp}
        onPointerCancel={this.handlePointerCancel}
        onPointerMove={this.handlePointerMove}
      >
        {items.map((item, index) => (
          <li
            id={item.text}
            key={item.text}
            onPointerDown={(e) => this.handlePointerDown(e, item.id)}
            className={item.id === draggedItemId ? "dragged" : ""}
            style={item.id === draggedItemId ? { top: `${top}px` } : {}}
          >
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
