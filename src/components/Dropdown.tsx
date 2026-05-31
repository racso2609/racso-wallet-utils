import {
  FC,
  PropsWithChildren,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import Icon from "./Icon";

interface DropdownProps extends PropsWithChildren {
  trigger: React.ReactNode;
  align?: "left" | "right";
}

export const Dropdown: FC<DropdownProps> = ({
  trigger,
  children,
  align = "right",
}) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const handleToggle = useCallback(() => {
    setOpen((prev) => !prev);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      console.log(
        "Document click:",
        event.target,
        "Dropdown ref:",
        ref.current,
        "Composed",
        event.composedPath(),
      );
      // cehck also if the click in on a children of the dropdown
      if (
        ref.current &&
        !ref.current.contains(event.target as Node) &&
        !event.composedPath().includes(ref.current)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  const handlePanelClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      e.stopPropagation();
    },
    [],
  );

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={handleToggle}
        className="flex items-center gap-1"
      >
        {trigger}
        <Icon
          name="chevron-down"
          size={14}
          className={`text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div
          className={`absolute top-[calc(100%+0.5rem)] z-50 w-80 rounded-xl border border-border bg-card p-4 shadow-xl shadow-primary/5 backdrop-blur-md ${align === "right" ? "right-0" : "left-0"}`}
          onClick={handlePanelClick}
        >
          {children}
        </div>
      )}
    </div>
  );
};

export default Dropdown;
