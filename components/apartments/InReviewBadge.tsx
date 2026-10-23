type InReviewBadgeProps = {
  email: string;
};

export function InReviewBadge({ email }: InReviewBadgeProps) {
  return (
    <span
      className="inline-flex max-w-full truncate rounded-full bg-violet-50 px-2 py-0.5 text-xs font-medium text-violet-700"
      title={`In Review · ${email}`}
    >
      In Review · {email}
    </span>
  );
}
