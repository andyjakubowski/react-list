import React from "react";
import "./List.css";

class List extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { items } = this.props;
    return (
      <ul>
        {items.map((item) => (
          <li>
            {item.text}, orderId: {item.orderId}
          </li>
        ))}
      </ul>
    );
  }
}

export default List;
