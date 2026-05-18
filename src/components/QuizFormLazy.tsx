/**
 * QuizFormLazy — thin wrapper that lazy-loads QuizForm on demand.
 * Keeps the heavy quiz bundle (~300 kB) OUT of the initial JS payload.
 * All components that render the quiz modal should import this instead
 * of importing QuizForm directly.
 */
import { lazy, Suspense } from 'react';

const QuizForm = lazy(() => import('./QuizForm'));

interface Props {
  isOpen: boolean;
  onClose: () => void;
  initialLocation?: string;
  problema?: string;
}

const QuizFormLazy = (props: Props) => (
  // Fallback is null — the modal manages its own visibility,
  // so there is nothing to show while the chunk loads.
  <Suspense fallback={null}>
    <QuizForm {...props} />
  </Suspense>
);

export default QuizFormLazy;
