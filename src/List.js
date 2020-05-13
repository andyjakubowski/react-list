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

function calculateIndex(localCoordinateY, itemHeight, maxIndex) {
  const index = Math.round(localCoordinateY / itemHeight);
  return clamp(index, 0, maxIndex);
}

function getTopRelativeToParent(
  cursorPageY,
  parentTopEdgeY,
  elementTopEdgeOffsetY
) {
  return cursorPageY - parentTopEdgeY - elementTopEdgeOffsetY;
}

class List extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      items: props.items.sort((itemA, itemB) => itemA.orderId - itemB.orderId),
      isDragging: false,
      dragItemId: null,
      dragItemHeight: null,
      dragItemTop: null,
      dragItemTopEdgeOffsetY: null,
      dragItemRelativeOffsetTop: null,
      listTop: null,
      listHeight: null,
    };

    this.listDomRef = React.createRef();

    this.handleUpClick = this.handleUpClick.bind(this);
    this.handleDownClick = this.handleDownClick.bind(this);
    this.handlePointerDown = this.handlePointerDown.bind(this);
    this.handlePointerUp = this.handlePointerUp.bind(this);
    this.handlePointerCancel = this.handlePointerCancel.bind(this);
    this.handlePointerMove = this.handlePointerMove.bind(this);
  }

  componentDidMount() {
    this.saveListDomRectToState();
  }

  saveListDomRectToState() {
    const listDomElement = this.listDomRef.current;
    const {
      top: listTop,
      height: listHeight,
    } = listDomElement.getBoundingClientRect();
    this.setState({
      listTop,
      listHeight,
    });
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

  handleUpClick(e, text, index) {
    console.log(`handleUpClick, ${text}, index: ${index}`);
    const currentIndex = index;
    const newIndex = Math.max(0, index - 1);
    const reorderedItems = this.reorderItems(
      this.state.items,
      currentIndex,
      newIndex
    );
    this.setState({
      items: reorderedItems,
    });
  }

  handleDownClick(e, text, index) {
    console.log(`handleDownClick, ${text}, index: ${index}`);
    const currentIndex = index;
    const newIndex = Math.min(index + 1, this.state.items.length - 1);
    const reorderedItems = this.reorderItems(
      this.state.items,
      currentIndex,
      newIndex
    );
    this.setState({
      items: reorderedItems,
    });
  }

  stopDrag() {
    console.log("stopDrag");
    this.setState({
      isDragging: false,
      dragItemId: null,
      dragItemHeight: null,
      dragItemTop: null,
      dragItemTopEdgeOffsetY: null,
      dragItemIndex: null,
      dragItemRelativeOffsetTop: null,
    });
  }

  startDrag({ itemId, offsetY, height, top, itemIndex }) {
    console.log("startDrag");
    this.setState({
      isDragging: true,
      dragItemId: itemId,
      dragItemHeight: height,
      dragItemTop: top,
      dragItemTopEdgeOffsetY: offsetY,
      dragItemIndex: itemIndex,
    });
  }

  handlePointerDown(e, itemId, itemIndex) {
    const offsetY = e.nativeEvent.offsetY;
    const { height, top } = e.target.getBoundingClientRect();
    const args = {
      itemId,
      itemIndex,
      height,
      top,
      offsetY,
    };
    timeoutId = setTimeout(this.startDrag.bind(this, args), TIMEOUT_MS);
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
      items,
      dragItemTopEdgeOffsetY,
      dragItemHeight,
      dragItemTop,
      dragItemIndex,
      listTop,
    } = this.state;

    const itemTopRelativeToParent = getTopRelativeToParent(
      e.pageY,
      listTop,
      dragItemTopEdgeOffsetY
    );
    const newIndex = calculateIndex(
      itemTopRelativeToParent,
      dragItemHeight,
      items.length - 1
    );

    if (newIndex === dragItemIndex) {
      const dragItemRelativeOffsetTop =
        e.pageY - dragItemTop - dragItemTopEdgeOffsetY;

      this.setState({
        dragItemRelativeOffsetTop,
      });
    } else {
      console.log(`Index ${dragItemIndex} → ${newIndex}`);
      const newDragItemTop = newIndex * dragItemHeight + listTop;
      const dragItemRelativeOffsetTop =
        e.pageY - newDragItemTop - dragItemTopEdgeOffsetY;
      const reorderedItems = this.reorderItems(
        this.state.items,
        dragItemIndex,
        newIndex
      );

      this.setState({
        items: reorderedItems,
        dragItemRelativeOffsetTop,
        dragItemTop: newDragItemTop,
        dragItemIndex: newIndex,
      });
    }
  }

  render() {
    const { items, dragItemId, dragItemRelativeOffsetTop } = this.state;
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
            onPointerDown={(e) => this.handlePointerDown(e, item.id, index)}
            className={item.id === dragItemId ? "dragged" : ""}
            style={
              item.id === dragItemId
                ? { top: `${dragItemRelativeOffsetTop}px` }
                : {}
            }
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
