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
  if (!icon && process.env.NODE_ENV !== "production") {
    console.warn(`MyIcon: "${iconName}" is not in iconRegistry (components/icons.ts)`);
  }
  return icon ?? FaQuestionCircle;
};

export default function MyIcon({
  Icon,
  size,
  iconClassName,
  style,
  wrapperClassName,
}: Props) {
  const IconComponent =
    typeof Icon === "string" ? getIconComponent(Icon) : Icon;

  if (wrapperClassName !== undefined) {
    return (
      <div className={wrapperClassName}>
        <IconComponent
          className={iconClassName || "text-5xl text-main-orange"}
          style={style}
        />
      </div>
    );
  }

  return (
    <div
      className={`icon ${
        size ? size : "w-24 h-24"
      } rounded-full border-2 border-main-orange border-solid flex items-center justify-center`}
    >
      <IconComponent
        className={iconClassName || "text-5xl text-main-orange"}
        style={style}
      />
    </div>
  );
}
