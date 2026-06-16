export type SplitParticipant = {
  userId: string;
  shareCents: number;
  paidCents: number;
};

export type ComputeSplitsInput = {
  totalCents: number;
  participantIds: string[];
  payerId: string;
};

/**
 * Divide total evenly among participants; assign full payment to payer.
 * Remainder cents go to the first (total % N) participants.
 */
export function computeEqualSplits({
  totalCents,
  participantIds,
  payerId,
}: ComputeSplitsInput): SplitParticipant[] {
  if (participantIds.length < 2) {
    throw new Error("At least two participants required");
  }

  if (!participantIds.includes(payerId)) {
    throw new Error("Payer must be a participant");
  }

  const count = participantIds.length;
  const baseShare = Math.floor(totalCents / count);
  const remainder = totalCents % count;

  return participantIds.map((userId, index) => ({
    userId,
    shareCents: baseShare + (index < remainder ? 1 : 0),
    paidCents: userId === payerId ? totalCents : 0,
  }));
}

export function validateSplits(
  totalCents: number,
  splits: SplitParticipant[],
): void {
  const shareSum = splits.reduce((sum, s) => sum + s.shareCents, 0);
  const paidSum = splits.reduce((sum, s) => sum + s.paidCents, 0);

  if (shareSum !== totalCents) {
    throw new Error("Share amounts must equal the total");
  }

  if (paidSum !== totalCents) {
    throw new Error("Paid amounts must equal the total");
  }
}
