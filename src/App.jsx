import React, { useRef, useState } from "react";
import { data } from "./data/data";

const App = () => {
  const [card, setCard] = useState(data);
  const [dragging, setDragging] = useState();
  const containerRef = useRef();

  function detectLeftButton(e) {
    e = e || window.event;
    if ("buttons" in e) {
      return e.buttons == 1;
    }

    let button = e.which || e.button;
    return button === 1;
  }

  function dragStart(e, index) {
    if (!detectLeftButton()) return; //Solo cuando detecta el clic derecho.

    setDragging(index);

    const container = containerRef.current;
    const items = [...container.childNodes];
    const dragItem = items[index];
    const itemsBelowDragItem = items.slice(index + 1);
    const notDragItems = items.filter((_, i) => i !== index);
    const dragData = card[index];
    let newData = [...card];

    const dragBoundingRect = dragItem.getBoundingClientRect();
    const space =
      items[1].getBoundingClientRect().top -
      items[0].getBoundingClientRect().bottom;

    dragItem.style.position = "fixed";
    dragItem.style.zIndex = 5000;
    dragItem.style.width = dragBoundingRect.width + "px";
    dragItem.style.height = dragBoundingRect.height + "px";
    dragItem.style.top = dragBoundingRect.top + "px";
    dragItem.style.left = dragBoundingRect.left + "px";
    dragItem.style.cursor = "grabbing";

    const div = document.createElement("DIV");
    div.id = "div_temp";
    div.style.width = dragBoundingRect.width + "px";
    div.style.height = dragBoundingRect.height + "px";
    div.style.pointerEvents = "none";
    container.appendChild(div);

    const distance = dragBoundingRect.height + space;

    itemsBelowDragItem.forEach((item) => {
      item.style.transform = `translateY(${distance}px)`;
    });

    let x = e.clientX;
    let y = e.clientY;

    document.onpointermove = dragMove;

    function dragMove(e) {
      const posX = e.clientX - x;
      const posY = e.clientY - y;

      dragItem.style.transform = `translate(${posX}px, ${posY}px)`;

      notDragItems.forEach((i) => {
        const rect1 = dragItem.getBoundingClientRect();
        const rect2 = i.getBoundingClientRect();

        let isOver =
          rect1.y < rect2.y + rect2.height / 2 &&
          rect1.y + rect1.height / 2 > rect2.y;

        //Cambiar la posición
        if (isOver) {
          if (i.getAttribute("style")) {
            i.style.transform = "";
            index++;
          } else {
            i.style.transform = `translateY(${distance}px)`;
            index--;
          }

          newData = data.filter((i) => i.id !== dragData.id);
          newData.splice(index, 0, dragData);
        }
      });
    }

    document.onpointerup = dragEnd;

    function dragEnd() {
      document.onpointerup = "";
      document.onpointermove = "";

      setDragging(undefined);
      dragItem.style = "";

      container.removeChild(div);
      items.forEach((i) => (i.style = ""));

      setCard(newData);
    }
  }

  return (
    <>
      <h1 className="title">Drag and Drop</h1>
      <div className="container" ref={containerRef}>
        {card.map((i, index) => (
          <div
            className="list_card"
            key={i.id}
            onPointerDown={(e) => dragStart(e, index)}
          >
            <div className={`card ${dragging === index ? "dragging" : ""}`}>
              <div className="img_container">
                <img src="./image.svg" alt="image" />
              </div>

              <div className="box">
                <h4>{i.subtitle}</h4>
                <h2>{i.title}</h2>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default App;
