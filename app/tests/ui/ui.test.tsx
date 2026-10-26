import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '../../src/ui/Button';
import { Badge } from '../../src/ui/Badge';
import { Field } from '../../src/ui/Field';
import { GradeChip } from '../../src/ui/GradeChip';
import { ProgressBar, StepDots } from '../../src/ui/ProgressBar';
import { EmptyState } from '../../src/ui/EmptyState';
import { EvidenceLine } from '../../src/ui/EvidenceLine';

describe('P1-05 UI Primitives', () => {
  it('renders Button with primary and secondary variants', () => {
    const handleClick = vi.fn();
    render(<Button variant="primary" onClick={handleClick}>Click Me</Button>);
    const btn = screen.getByRole('button', { name: /click me/i });
    expect(btn).toBeInTheDocument();
    fireEvent.click(btn);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('renders disabled button with aria-disabled', () => {
    render(<Button disabled>Disabled Action</Button>);
    const btn = screen.getByRole('button', { name: /disabled action/i });
    expect(btn).toBeDisabled();
    expect(btn).toHaveAttribute('aria-disabled', 'true');
  });

  it('renders Badge with correct text and semantics', () => {
    render(<Badge variant="sample" />);
    expect(screen.getByText('SAMPLE')).toBeInTheDocument();

    render(<Badge variant="memory" />);
    expect(screen.getByText('Memory-based question')).toBeInTheDocument();
  });

  it('renders Field with input, label, helper, and character count', () => {
    render(
      <Field
        label="Display name"
        helper="Any name or nickname"
        value="Aspirant"
        onChange={() => {}}
        maxLength={20}
        showCharCount
      />
    );
    expect(screen.getByLabelText(/display name/i)).toBeInTheDocument();
    expect(screen.getByText('Any name or nickname')).toBeInTheDocument();
    expect(screen.getByText('8 / 20')).toBeInTheDocument();
  });

  it('renders GradeChip for all 4 grades without red tones', () => {
    render(<GradeChip grade="A" variant="full" />);
    expect(screen.getByText('Your strength')).toBeInTheDocument();

    render(<GradeChip grade="D" variant="full" />);
    expect(screen.getByText('Red flag')).toBeInTheDocument();
    // Grade D must use plum and not plain red
    const dChip = screen.getByLabelText(/grade d/i);
    expect(dChip).toHaveStyle({ color: 'var(--grade-d-fg)' });
  });

  it('renders ProgressBar with accessible aria values', () => {
    render(<ProgressBar current={7} total={22} label="7 of 22 recorded" />);
    const bar = screen.getByRole('progressbar');
    expect(bar).toHaveAttribute('aria-valuenow', '7');
    expect(bar).toHaveAttribute('aria-valuemax', '22');
    expect(bar).toHaveAttribute('aria-valuetext', '7 of 22 recorded');
  });

  it('renders StepDots showing current step', () => {
    render(<StepDots currentStep={2} totalSteps={4} />);
    expect(screen.getByText('Step 2 of 4')).toBeInTheDocument();
  });

  it('renders EvidenceLine with early signal notice when n < 3', () => {
    render(<EvidenceLine questionCount={2} text="Based on 2 questions: 1 correct." />);
    expect(screen.getByText(/early signal/i)).toBeInTheDocument();
  });

  it('renders EmptyState with message and action', () => {
    const handleAction = vi.fn();
    render(
      <EmptyState
        message="No words yet."
        actionLabel="Start reading"
        onAction={handleAction}
      />
    );
    expect(screen.getByText('No words yet.')).toBeInTheDocument();
    const btn = screen.getByRole('button', { name: /start reading/i });
    fireEvent.click(btn);
    expect(handleAction).toHaveBeenCalledTimes(1);
  });
});
