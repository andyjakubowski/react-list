import React from "react";
import "./List.css";

class List extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <ul>
        <li>Hello</li>
        <li>Mighty</li>
        <li>World!</li>
      </ul>
    );
  }
}

export default List;
