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

function getCoords(element) {
  const rect = element.getBoundingClientRect();
  const scrollY = window.scrollY;

  return {
    top: rect.top + scrollY,
    height: rect.height,
  };
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
    this.itemRefs = {};

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

  getListElement() {
    return this.listDomRef.current;
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
    const { height, top } = getCoords(e.target);
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
    } = this.state;

    const listElement = this.getListElement();
    const { top: listTop } = getCoords(listElement);

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

  getBoundingRects(items) {
    return items.reduce((boundingRects, item) => {
      const domNode = this.itemRefs[item.id].current;
      const boundingRect = domNode.getBoundingClientRect();
      return { ...boundingRects, [item.id]: boundingRect };
    }, {});
  }

  didItemOrderChange(itemsA, itemsB) {
    for (let i = 0; i < itemsA.length; i += 1) {
      if (itemsA[i].id !== itemsB[i].id) {
        return true;
      }
    }

    return false;
  }

  getSnapshotBeforeUpdate(prevProps, prevState) {
    const orderChanged = this.didItemOrderChange(
      prevState.items,
      this.state.items
    );
    if (orderChanged) {
      console.log("getSnapshotBeforeUpdate");
      return this.getBoundingRects(prevState.items);
    } else {
      return null;
    }
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (!snapshot) {
      return;
    }

    console.log("componentDidUpdate");
    const prevRects = snapshot;
    const nextRects = this.getBoundingRects(prevState.items);
    prevState.items.forEach((item) => {
      const domNode = this.itemRefs[item.id].current;
      const nextRect = nextRects[item.id];
      const prevRect = prevRects[item.id];
      const deltaY = prevRect.top - nextRect.top;
      requestAnimationFrame(() => {
        domNode.style.transform = `translate(0, ${deltaY}px)`;
        domNode.style.transition = "transform 0s";
        requestAnimationFrame(() => {
          domNode.style.transform = "";
          domNode.style.transition = "transform 500ms";
        });
      });
    });
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
        {items.map((item, index) => {
          this.itemRefs[item.id] = this.itemRefs[item.id] || React.createRef();

          return (
            <li
              id={item.text}
              ref={this.itemRefs[item.id]}
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
          );
        })}
      </ul>
    );
  }
}

export default List;
