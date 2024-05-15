import { navItems } from '../../utils/constants';
import classes from './Header.module.css';
import NavBar from './NavBar';
export default function Header() {
  return (
    <>
    <div>
    {/* <div className={classes.header}>
        <h1>
            AI Club CITK
        </h1><br></br>
        
    </div> */}

    <NavBar navItems={navItems} />
    </div>
    </>
    
  )
}