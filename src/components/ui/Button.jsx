import { buttonClass } from "./styles.js";

function Button({ variant, size, className, type = "button", ...props }) {
    return <button type={type} className={buttonClass({ variant, size, className })} {...props} />;
}

export default Button;
