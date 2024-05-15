import NavBar from "./NavBar";
import classes from "./Layout.module.css";
import Header from "./Header";
import { navItems } from "../../utils/constants";
import { ReactElement, JSXElementConstructor, ReactFragment, ReactPortal } from "react";

function Layout(props: { children: string | number | boolean | ReactElement<any, string | JSXElementConstructor<any>> | ReactFragment | ReactPortal | null | undefined; }) {
  return (
    <div>
      <Header />
      <main className={classes.main}>{props.children}</main>
    </div>
  );
}

export default Layout;