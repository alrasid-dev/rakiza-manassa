export function governanceParticipantNames(input: { requestedByUserId: number; decidedByUserId: number | null }, names: ReadonlyMap<number, string | null>) {
  return {
    requesterName: names.get(input.requestedByUserId) || null,
    deciderName: input.decidedByUserId ? names.get(input.decidedByUserId) || null : null,
  };
}
