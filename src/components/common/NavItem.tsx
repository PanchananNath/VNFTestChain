import Link from "next/link";
import { Dropdown } from "react-bootstrap";
import classes from "./NavItem.module.css";
import { JSXElementConstructor, ReactElement, ReactFragment, ReactPortal, useState } from "react";
import { Container } from "react-bootstrap";
import { UrlObject } from "url";

export default function NavItem(props: { url: string | UrlObject; title: string | number | boolean | ReactElement<any, string | JSXElementConstructor<any>> | ReactFragment | ReactPortal | null | undefined; submenu: any[]; }) {
  //Todo: Add hover effect
  const [show, setShow] = useState(false);

  function handleShow() {
    setShow(true);
  }
  function handleHide() {
    setShow(false);
  }
  return (
    <Dropdown
      className={classes.container}
      onMouseEnter={handleShow}
      onMouseLeave={handleHide}
    >
      <Dropdown.Toggle
        className={classes.dropdown}
        variant="dark"
        id="dropdown-basic"
        onClick={() => {}}
      >
        <Link href={props.url}>
          <div className={classes.cuslink}>{props.title}</div>
        </Link>
      </Dropdown.Toggle>
      {props.submenu && props.submenu.length ? (
        <Dropdown.Menu variant="dark" show={show} onMouseEnter={handleShow}>
          {props.submenu.map((subItem, index) => (
            <Dropdown.Item key={index} href={subItem.url}>
              {subItem.title}
            </Dropdown.Item>
          ))}
        </Dropdown.Menu>
      ) : null}
    </Dropdown>
  );
}