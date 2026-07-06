import { createContext } from "react";

const MenuContext = createContext({ mostrarMenu: false, setMostrarMenu: () => false });

export default MenuContext;