'use client';

interface ReactionButtonsProps {
  confessionId: string;
  reactions?: { [key: string]: number };
  onUpdate: () => void;
}

export default function ReactionButtons({
  confessionId,
  reactions,
  onUpdate
}: ReactionButtonsProps) {
  return null;
}