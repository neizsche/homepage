import { useState } from 'react';
import classNames from "classnames";
import { useTranslation } from "next-i18next";

const ButtonAction = ({ label, onClick, ratelimitter, confirmation }) => {
  const { t } = useTranslation();
  const [isActive, setIsActive] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isDisabled, setIsDisabled] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [status, setStatus] = useState(null); // null, 'success', or 'error'

  const handleClick = async () => {
    if (isDisabled) return;

    if (confirmation) {
      setShowConfirmation(true);
    } else {
      await executeAction();
    }
  };

  const executeAction = async () => {
    setIsActive(true);
    setIsPlaying(true);
    setIsDisabled(true);
    setStatus(null);

    try {
      const success = await onClick();
      if (success) {
        setStatus('success');
      } else {
        setStatus('error');
      }
    } catch (error) {
      console.error("Action failed:", error);
      setStatus('error');
    } finally {
      setTimeout(() => setIsActive(false), ratelimitter);
      setTimeout(() => {
        setIsPlaying(false);
        setIsDisabled(false);
        setStatus(null); // Reset status after the visual feedback
      }, 2000);
    }
  };

  const getStatusStyles = () => {
    switch (status) {
      case 'success':
        return 'bg-green-500/20 dark:bg-green-500/30 ring-green-500';
      case 'error':
        return 'bg-red-500/20 dark:bg-red-500/30 ring-red-500';
      default:
        return isActive
          ? 'ring-2 ring-blue-500 bg-blue-500/20 dark:bg-blue-500/30'
          : 'bg-theme-300/50 dark:bg-theme-800/50 hover:bg-theme-300/70 dark:hover:bg-theme-700/50';
    }
  };

  return (
    <>
      <div className="bg-theme-200/50 dark:bg-theme-900/20 rounded-sm m-1 flex grow items-center justify-between p-2 service-block cursor-default transition-all duration-200 hover:bg-theme-200/70 dark:hover:bg-theme-900/30">
        <div className="font-bold text-xs uppercase text-left">{t(label)}</div>
        <div
          className={classNames(
            "w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200",
            isDisabled ? "cursor-not-allowed opacity-70" : "cursor-pointer",
            getStatusStyles(),
            isActive ? "scale-[0.98]" : ""
          )}
          onClick={handleClick}
        >
          <svg className="w-4 h-4 text-current" fill="currentColor" viewBox="0 0 20 20">
            {status === 'success' ? (
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            ) : status === 'error' ? (
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            ) : isPlaying ? (
              <rect x="5" y="5" width="10" height="10" />
            ) : (
              <path d="M6.3 2.841A1.5 1.5 0 004 4.11v11.78a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
            )}
          </svg>
        </div>
      </div>

      {showConfirmation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md bg-theme-100 dark:bg-theme-800 rounded-xl shadow-xl overflow-hidden border border-theme-300/50 dark:border-theme-700/50 animate-fade-in">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z" clipRule="evenodd" />
                  </svg>
                </div>
                <h3 className="ml-3 text-lg font-medium text-theme-900 dark:text-theme-100">
                  {t('CONFIRM ACTION')}
                </h3>
              </div>
              <div className="text-sm text-theme-600 dark:text-theme-400 mb-6">
                {t('Are you sure you want to')} {t(label).toLowerCase()}?
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  className="px-4 py-2 text-sm font-medium rounded-md text-theme-700 dark:text-theme-300 bg-theme-200/50 dark:bg-theme-700/50 hover:bg-theme-200 dark:hover:bg-theme-700 transition-colors duration-200"
                  onClick={() => setShowConfirmation(false)}
                >
                  {t('Close')}
                </button>
                <button
                  type="button"
                  className="px-4 py-2 text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  onClick={() => {
                    setShowConfirmation(false);
                    executeAction();
                  }}
                >
                  {t('Confirm')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ButtonAction;