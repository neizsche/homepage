import { useState, useEffect } from 'react';
import classNames from "classnames";
import { useTranslation } from "next-i18next";

const ToggleAction = ({ label, checked, onChange }) => {
  const [isActive, setIsActive] = useState(checked);
  const { t } = useTranslation();

  useEffect(() => {
    setIsActive(checked);
  }, [checked]);

  const handleToggle = () => {
    const newState = !isActive;
    setIsActive(newState);
    if (onChange) {
      onChange(newState);
    }
  };

  return (
    <div
      className={classNames(
        "bg-theme-200/50 dark:bg-theme-900/20 rounded-sm m-1 flex grow items-center justify-between p-2",
        "service-block",
      )}
      onClick={handleToggle}
      role="switch"
      aria-checked={isActive}
    >
      <div className="font-bold text-xs uppercase text-left">{t(label)}</div>
      <div className="">
        <div
          className={classNames(
            "flex items-center relative w-8 h-4 rounded-full transition-colors duration-200 ease-in-out",
            isActive ? "bg-green-500 border-green-500" : "bg-red-200 border-red-400 dark:bg-red-800 dark:border-red-600",
          )}
          style={{ borderWidth: '1px', borderColor: 'rgba(255, 255, 255, 0.15)' }} 
        >
          <span
            className={classNames(
              "inline-block w-4 h-4 rounded-full bg-white shadow-md transform transition-transform duration-200 ease-in-out",
              isActive ? "translate-x-4" : "translate-x-0",
            )}
            aria-hidden="true"
          />
        </div>
      </div>
    </div>
  );
};

export default ToggleAction;