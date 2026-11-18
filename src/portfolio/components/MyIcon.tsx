import { IconType } from "react-icons";
import { FaQuestionCircle } from "react-icons/fa";
import { iconRegistry } from "./icons";

interface Props {
  Icon: IconType | string;
  size?: string;
  iconClassName?: string;
  style?: React.CSSProperties;
  wrapperClassName?: string;
}

const getIconComponent = (iconName: string): IconType => {
  const icon = iconRegistry[iconName as keyof typeof iconRegistry];
  if (!icon && import.meta.env.DEV) {
    console.warn(`MyIcon: "${iconName}" is not in iconRegistry (components/icons.ts)`);
  }
  return icon ?? FaQuestionCircle;
};

export default function MyIcon({ Icon, size, iconClassName, style, wrapperClassName }: Props) {
  const IconComponent = typeof Icon === "string" ? getIconComponent(Icon) : Icon;

  if (wrapperClassName !== undefined) {
    return (
      <div className={wrapperClassName}>
        <IconComponent className={iconClassName || "text-5xl text-main-orange"} style={style} />
      </div>
    );
  }

  return (
    <div className={`pf-icon-tile ${size ?? ""}`}>
      <IconComponent className={iconClassName} style={style} aria-hidden />
    </div>
  );
}
