import { useNavigate } from 'react-router-dom';
import { TooltipAnchor, Button } from '@librechat/client';
import { useLocalize } from '~/hooks';

export default function HeaderHome() {
  const localize = useLocalize();
  const navigate = useNavigate();

  const clickHandler: React.MouseEventHandler<HTMLButtonElement> = (e) => {
    if (e.button === 0 && (e.ctrlKey || e.metaKey)) {
      window.open('/', '_blank');
      return;
    }
    navigate('/');
  };

  return (
    <TooltipAnchor
      description="Go to Home"
      render={
        <Button
          size="icon"
          variant="outline"
          data-testid="header-home-button"
          aria-label="Go to Home"
          className="rounded-xl border border-border-light bg-surface-secondary p-2 hover:bg-surface-hover"
          onClick={clickHandler}
        >
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
            />
          </svg>
        </Button>
      }
    />
  );
}
